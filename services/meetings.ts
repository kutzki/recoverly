/**
 * Meeting Guide API – fetches nearby AA/NA meetings.
 * API provided by the AA Intergroup meeting guide project.
 * No API key required. Returns empty array on any error.
 */

export type Meeting = {
  id: string;
  name: string;
  time: string;          // "HH:MM" 24h
  day: number;           // 0=Sun … 6=Sat
  location: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  types: string[];
  notes: string;
};

const BASE = 'https://api.aa-intergroup.org/api/meetings';

function formatTime(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m ?? 0).padStart(2, '0')} ${ampm}`;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function meetingDayTime(meeting: Meeting): string {
  const day = DAY_NAMES[meeting.day] ?? '';
  const time = formatTime(meeting.time);
  return day && time ? `${day} ${time}` : day || time;
}

export async function fetchNearbyMeetings(
  latitude: number,
  longitude: number,
  distanceMiles = 15,
): Promise<Meeting[]> {
  try {
    const url = `${BASE}?latitude=${latitude}&longitude=${longitude}&distance=${distanceMiles}&distance_units=miles`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const json = await res.json();
    const raw: any[] = Array.isArray(json) ? json : (json?.meetings ?? []);
    return raw.slice(0, 30).map((m, i) => ({
      id:        String(m.id ?? m.slug ?? i),
      name:      m.name ?? 'AA Meeting',
      time:      m.time ?? '',
      day:       Number(m.day ?? 0),
      location:  m.location ?? '',
      address:   m.address ?? '',
      city:      m.city ?? '',
      state:     m.state ?? '',
      latitude:  Number(m.latitude ?? 0),
      longitude: Number(m.longitude ?? 0),
      types:     Array.isArray(m.types) ? m.types : [],
      notes:     m.notes ?? '',
    }));
  } catch {
    return [];
  }
}
