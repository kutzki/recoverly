/**
 * Meeting Finder Service
 *
 * Consumes the code4recovery central-query API — a free, open, unauthenticated
 * aggregator of ~7,930 weekly online AA meetings worldwide.
 *
 * API: https://central-query.apps.code4recovery.org/api/v1/meetings
 */

const BASE_URL = 'https://central-query.apps.code4recovery.org/api/v1/meetings';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Meeting {
  slug: string;
  name: string;
  timezone?: string;
  timeUTC?: string;
  nextEventUTC: string;
  rtc: string;
  duration?: number;

  conference_url?: string;
  conference_url_notes?: string;
  conference_phone?: string;
  conference_phone_notes?: string;

  groupID?: string;
  groupEmail?: string;
  groupWebsite?: string;
  groupNotes?: string;

  languages: string[];
  communities: string[];
  features: string[];
  formats: string[];
  type?: string; // 'O' = Open, 'C' = Closed
  notes?: string;
}

export interface MeetingQueryParams {
  hours?: number;
  limit?: number;
  offset?: number;
  languages?: string;   // comma-separated: 'en,es'
  type?: string;         // 'O' or 'C'
  formats?: string;      // comma-separated: 'B,D,SP'
  communities?: string;  // comma-separated: 'LGBTQ,W'
  features?: string;     // comma-separated: 'POA'
  search?: string;
}

export interface RelatedGroupInfo {
  groupMeetings: Meeting[];
  groupInfo: {
    name?: string;
    email?: string;
    notes?: string;
  };
}

// ─── Label Maps ──────────────────────────────────────────────────────────────

export const FORMAT_LABELS: Record<string, string> = {
  '12x12': '12 & 12',
  'A':     'Agnostic',
  'ABSI':  'As Bill Sees It',
  'B':     'Big Book',
  'BE':    'Beginners',
  'D':     'Discussion',
  'DR':    'Daily Reflections',
  'GR':    'Grapevine',
  'H':     'Chips/Birthdays',
  'LIT':   'Literature',
  'LS':    'Living Sober',
  'MED':   'Meditation',
  'SP':    'Speaker',
  'ST':    'Step Study',
  'TR':    'Tradition Study',
};

export const COMMUNITY_LABELS: Record<string, string> = {
  'BV-I':  'Blind/VI',
  'D-HOH': 'Deaf/HoH',
  'DD':    'Dual Diagnosis',
  'LGBTQ': 'LGBTQ+',
  'LO-I':  'Loners',
  'M':     'Men',
  'P':     'Professionals',
  'POC':   'People of Color',
  'SEN':   'Seniors',
  'W':     'Women',
  'Y':     'Young People',
};

export const TYPE_LABELS: Record<string, string> = {
  'O': 'Open',
  'C': 'Closed',
};

export const LANGUAGE_LABELS: Record<string, string> = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'pt': 'Portuguese',
  'de': 'German',
  'it': 'Italian',
  'ru': 'Russian',
  'pl': 'Polish',
  'ja': 'Japanese',
  'ko': 'Korean',
  'fa': 'Farsi',
  'hi': 'Hindi',
  'sv': 'Swedish',
  'uk': 'Ukrainian',
  'tl': 'Filipino',
  'pa': 'Punjabi',
  'hu': 'Hungarian',
  'lt': 'Lithuanian',
  'bg': 'Bulgarian',
  'am': 'Amharic',
  'mt': 'Maltese',
  'ml': 'Malayalam',
};

// ─── Timezone Helpers ────────────────────────────────────────────────────────

/** Map IANA timezone to broad US region for grouping */
export const TIMEZONE_REGIONS: Record<string, string> = {
  'America/New_York':       'Eastern',
  'America/Detroit':        'Eastern',
  'America/Indiana':        'Eastern',
  'America/Chicago':        'Central',
  'America/Denver':         'Mountain',
  'America/Phoenix':        'Mountain',
  'America/Boise':          'Mountain',
  'America/Los_Angeles':    'Pacific',
  'America/Anchorage':      'Alaska',
  'Pacific/Honolulu':       'Hawaii',
  'America/Toronto':        'Eastern',
  'America/Vancouver':      'Pacific',
  'America/Winnipeg':       'Central',
  'America/Edmonton':       'Mountain',
  'Europe/London':          'UK/Ireland',
  'Europe/Dublin':          'UK/Ireland',
  'Europe/Paris':           'W. Europe',
  'Europe/Berlin':          'W. Europe',
  'Europe/Madrid':          'W. Europe',
  'Europe/Rome':            'W. Europe',
  'Europe/Amsterdam':       'W. Europe',
  'Europe/Stockholm':       'W. Europe',
  'Europe/Warsaw':          'E. Europe',
  'Europe/Bucharest':       'E. Europe',
  'Europe/Moscow':          'Russia',
  'Australia/Sydney':       'Australia',
  'Australia/Melbourne':    'Australia',
  'Asia/Tokyo':             'Asia/Pacific',
  'Asia/Seoul':             'Asia/Pacific',
  'Asia/Tehran':            'Middle East',
};

/** Get the user's device timezone */
export function getDeviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'America/New_York'; // fallback
  }
}

/** Get a human-readable region label for a timezone */
export function getTimezoneRegion(tz: string): string {
  // Exact match
  if (TIMEZONE_REGIONS[tz]) return TIMEZONE_REGIONS[tz];

  // Prefix match (e.g., America/Indiana/Indianapolis → Eastern)
  for (const [key, region] of Object.entries(TIMEZONE_REGIONS)) {
    if (tz.startsWith(key)) return region;
  }

  // Continent-based fallback
  if (tz.startsWith('America/')) return 'Americas';
  if (tz.startsWith('Europe/')) return 'Europe';
  if (tz.startsWith('Asia/')) return 'Asia';
  if (tz.startsWith('Africa/')) return 'Africa';
  if (tz.startsWith('Australia/') || tz.startsWith('Pacific/')) return 'Pacific';

  return 'Other';
}

/** Check if two timezones are in the same or adjacent UTC offset (±1h) */
export function isNearbyTimezone(userTz: string, meetingTz: string | undefined): boolean {
  if (!meetingTz) return false;
  if (userTz === meetingTz) return true;

  try {
    const now = new Date();
    const userOffset = getTimezoneOffset(now, userTz);
    const meetingOffset = getTimezoneOffset(now, meetingTz);
    return Math.abs(userOffset - meetingOffset) <= 60; // within 1 hour
  } catch {
    return false;
  }
}

/** Get UTC offset in minutes for a timezone */
function getTimezoneOffset(date: Date, tz: string): number {
  const utcStr = date.toLocaleString('en-US', { timeZone: 'UTC' });
  const tzStr = date.toLocaleString('en-US', { timeZone: tz });
  const utcDate = new Date(utcStr);
  const tzDate = new Date(tzStr);
  return (tzDate.getTime() - utcDate.getTime()) / 60000;
}

// ─── Time Formatting ─────────────────────────────────────────────────────────

/** Format a UTC ISO string to local time (e.g., "2:00 PM") */
export function formatMeetingTime(utcIso: string, targetTz?: string): string {
  try {
    const date = new Date(utcIso);
    const tz = targetTz || getDeviceTimezone();
    return date.toLocaleTimeString('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

/** Format a UTC ISO string to day label (e.g., "Today", "Tomorrow", "Wednesday") */
export function formatMeetingDay(utcIso: string, targetTz?: string): string {
  try {
    const tz = targetTz || getDeviceTimezone();
    const meetingDate = new Date(utcIso);

    const now = new Date();
    const todayStr = now.toLocaleDateString('en-US', { timeZone: tz });
    const meetingStr = meetingDate.toLocaleDateString('en-US', { timeZone: tz });

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString('en-US', { timeZone: tz });

    if (meetingStr === todayStr) return 'Today';
    if (meetingStr === tomorrowStr) return 'Tomorrow';

    return meetingDate.toLocaleDateString('en-US', {
      timeZone: tz,
      weekday: 'long',
    });
  } catch {
    return '';
  }
}

/** Get short timezone abbreviation (e.g., "PT", "ET") */
export function getTimezoneAbbr(tz?: string): string {
  try {
    const targetTz = tz || getDeviceTimezone();
    const parts = new Date().toLocaleTimeString('en-US', {
      timeZone: targetTz,
      timeZoneName: 'short',
    }).split(' ');
    return parts[parts.length - 1] || '';
  } catch {
    return '';
  }
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const meetingsService = {
  /**
   * Fetch online meetings from central-query API.
   * Defaults to next 168h (full week) and English language.
   */
  async getMeetings(params: MeetingQueryParams = {}): Promise<Meeting[]> {
    const defaults: MeetingQueryParams = {
      hours: 168,
      limit: 5000,
      languages: 'en',
    };

    const merged = { ...defaults, ...params };
    const qs = new URLSearchParams();

    for (const [key, val] of Object.entries(merged)) {
      if (val !== undefined && val !== null && val !== '') {
        qs.set(key, String(val));
      }
    }

    const url = `${BASE_URL}?${qs.toString()}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Meetings API error: ${res.status}`);
    }

    return res.json();
  },

  /**
   * Fetch related group info for a meeting by slug.
   */
  async getMeetingGroup(slug: string): Promise<RelatedGroupInfo> {
    const url = `${BASE_URL}/${slug}/related-group-info`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Meetings group API error: ${res.status}`);
    }

    return res.json();
  },
};
