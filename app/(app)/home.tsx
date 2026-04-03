import { useMemo, useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuthStore }     from '../../store/auth';
import { useProgressStore } from '../../store/progress';
import { useUIStore }       from '../../store/ui';
import { SobrietyCounter }  from '../../components/ui/SobrietyCounter';
import { StreakDots }        from '../../components/ui/StreakDots';
import { meetingsService, Meeting } from '../../services/meetings';
import { Colors }           from '../../constants/colors';
import { Fonts }            from '../../constants/fonts';

// ── Quick-action buttons (row of 5, Figma: 55×60 each) ──────────────────────

const QUICK_ACTIONS = [
  { id: 'meetings',  label: 'Meeting',   icon: 'people',       route: '/(app)/meetings'  },
  { id: 'awards',    label: 'Awards',    icon: 'trophy',       route: '/(app)/awards'    },
  { id: 'tracker',   label: 'Tracker',   icon: 'analytics',    route: '/(app)/tracker'   },
  { id: 'checklist', label: 'Checklist', icon: 'checkbox',     route: '/(app)/apps'      },
  { id: 'journal',   label: 'Journal',   icon: 'book',         route: '/(app)/apps'      },
] as const;

const MEETING_EMOJIS: Record<string, string> = { AA: '🏛️', NA: '🌿', CA: '❄️', OA: '🎗️' };

// ── Component ────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const user              = useAuthStore((s) => s.user);
  const openMenu          = useUIStore((s) => s.openMenu);
  const openJournal       = useUIStore((s) => s.openJournal);
  const openChecklist     = useUIStore((s) => s.openChecklist);
  const sobrietyStartDate = useProgressStore((s) => s.sobrietyStartDate);
  const weeklyStreak      = useProgressStore((s) => s.weeklyStreak);
  const markTodayCheckedIn = useProgressStore((s) => s.markTodayCheckedIn);

  const daysSober = useMemo(() => {
    if (!sobrietyStartDate) return 0;
    const start = new Date(sobrietyStartDate);
    const diff  = Math.floor((Date.now() - start.getTime()) / 86_400_000);
    return Math.max(0, diff);
  }, [sobrietyStartDate]);

  const fullName = user?.name ?? 'John Smith';

  // ── Fetch next 2 upcoming meetings ──────────────────────────────────────────
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [eventsLoading, setEventsLoading]       = useState(true);
  const [hasGuardian, setHasGuardian]           = useState(false);

  useEffect(() => {
    meetingsService.getMeetings({
      hours: 12,
      limit: 2,
      languages: 'en',
    }).then((data) => {
      setUpcomingMeetings(data.slice(0, 2));
    }).catch(() => {}).finally(() => setEventsLoading(false));

    // Check guardian status
    if (user?.id) {
      import('../../services/guardian').then(({ guardianService }) => {
        guardianService.getMyLinks(user.id, user.user_type === 'SEEKER' ? 'SEEKER' : 'GUARDIAN')
          .then(links => setHasGuardian(links.some(l => l.status === 'ACTIVE')));
      });
    }
  }, [user]);

  // Check-in for today
  const todayIdx      = (new Date().getDay() + 6) % 7;
  const checkedInToday = weeklyStreak[todayIdx] ?? false;

  const handleCheckIn = useCallback(() => {
    if (!checkedInToday) {
      markTodayCheckedIn(user?.id);
    }
  }, [checkedInToday, user?.id]);

  return (
    <View style={styles.root}>
      {/* ── Subtle purple gradient overlay (top-left, 10% opacity) ── */}
      <LinearGradient
        colors={['rgba(171,49,240,0.10)', 'rgba(204,115,254,0.05)', 'transparent']}
        style={styles.bgOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.userName}>Welcome,</Text>
            <Text style={styles.welcomeLabel}>{fullName}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <TouchableOpacity onPress={openMenu} hitSlop={20}>
              <MaterialCommunityIcons name="sort-variant" size={32} color={Colors.text} style={{ transform: [{ scaleX: -1 }] }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Sobriety Arc ───────────────────────────────────────────────── */}
        <View style={styles.arcWrapper}>
          <SobrietyCounter daysSober={daysSober} size={230} />
        </View>

        {/* ── Quick Actions ──────────────────────────────────────────────── */}
        <View style={styles.actionsRow}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={styles.actionBtn}
              activeOpacity={0.85}
              onPress={() => {
                if (a.id === 'journal') {
                  openJournal();
                } else if (a.id === 'checklist') {
                  openChecklist();
                } else {
                  router.push(a.route as any);
                }
              }}
            >
              <Ionicons name={a.icon as any} size={24} color={Colors.white} />
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Daily Reminder / Check-in Card ─────────────────────────────── */}
        <TouchableOpacity
          style={styles.checkInCard}
          activeOpacity={0.92}
          onPress={() => router.push('/(app)/check-in' as any)}
        >
          {/* Text content */}
          <View style={styles.checkInTextCol}>
            <Text style={styles.reminderLabel}>Daily Reminder</Text>
            <Text style={styles.checkInHeading}>
              {checkedInToday ? 'You checked in today! 🎉' : 'Have you checked in\nyet today?'}
            </Text>
            <Text style={styles.thisWeekLabel}>This week</Text>
            <View style={{ marginTop: 4 }}>
              <StreakDots streak={weeklyStreak} />
            </View>
          </View>

          {/* Small external link icon */}
          <View style={styles.cardArrow}>
            <Ionicons name="arrow-up-outline" size={16} color={Colors.textMuted} style={{ transform: [{ rotate: '45deg' }] }} />
          </View>

          {/* Thumbs-up 3D emoji */}
          <Text style={styles.thumbsUp}>👍🏻</Text>
        </TouchableOpacity>

        {/* ── Guardian Status Quick Card (Premium) ───────────────────────── */}
        {!hasGuardian && user?.user_type === 'SEEKER' && (
          <TouchableOpacity
            style={styles.guardianCard}
            activeOpacity={0.9}
            onPress={() => router.push('/(app)/guardian' as any)}
          >
            <LinearGradient
              colors={['#6366F1', '#A855F7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.guardianGradient}
            >
              <View style={styles.guardianContent}>
                <View>
                  <Text style={styles.guardianTitle}>Connect a Guardian</Text>
                  <Text style={styles.guardianSubtitle}>Link with a supporter for real-time safety alerts.</Text>
                </View>
                <View style={styles.guardianIconBox}>
                  <Ionicons name="shield-checkmark" size={24} color={Colors.white} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── Upcoming Events ────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Upcoming Events</Text>

        <View style={styles.eventsRow}>
          {eventsLoading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 16 }} />
          ) : upcomingMeetings.length > 0 ? (
            upcomingMeetings.map((ev) => (
              <TouchableOpacity
                key={ev.slug}
                activeOpacity={0.88}
                onPress={() => router.push('/(app)/meetings' as any)}
                style={styles.eventCard}
              >
                <View style={styles.eventCardArrow}>
                  <Ionicons name="arrow-up-outline" size={14} color={Colors.textMuted} style={{ transform: [{ rotate: '45deg' }] }} />
                </View>
                <View style={styles.eventLogoCircle}>
                  <Text style={styles.eventEmoji}>
                    {MEETING_EMOJIS[ev.type ?? ''] ?? '🏛️'}
                  </Text>
                </View>
                <View style={styles.eventTextWrapper}>
                  <Text style={styles.eventTitle} numberOfLines={2}>{ev.name}</Text>
                  <Text style={styles.eventLocation} numberOfLines={1}>
                    {ev.timezone ?? 'Los Angeles County'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            // Fallback placeholders if no meetings returned
            [{id:'1', title:'New Connections', loc:'Los Angeles County', emoji:'🏛️'},
             {id:'2', title:'New Connections', loc:'Los Angeles County', emoji:'🌐'}].map((ev) => (
              <TouchableOpacity
                key={ev.id}
                activeOpacity={0.88}
                onPress={() => router.push('/(app)/meetings' as any)}
                style={styles.eventCard}
              >
                <View style={styles.eventCardArrow}>
                  <Ionicons name="arrow-up-outline" size={14} color={Colors.textMuted} style={{ transform: [{ rotate: '45deg' }] }} />
                </View>
                <View style={styles.eventLogoCircle}>
                  <Text style={styles.eventEmoji}>{ev.emoji}</Text>
                </View>
                <View style={styles.eventTextWrapper}>
                  <Text style={styles.eventTitle} numberOfLines={1}>{ev.title}</Text>
                  <Text style={styles.eventLocation} numberOfLines={1}>{ev.loc}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const CARD_WIDTH = '47%' as const;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },

  bgOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 300,
    height: 300,
    zIndex: 0,
  },

  scroll: { flexGrow: 1, paddingHorizontal: 30 },

  // Header
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   12,
  },
  userName: {
    fontFamily: Fonts.poppinsBold,
    fontSize:   22,
    color:      Colors.text,
    lineHeight: 28,
  },
  welcomeLabel: {
    fontFamily: Fonts.jost,
    fontSize:   16,
    color:      Colors.text,
    lineHeight: 22,
  },

  // Sobriety arc
  arcWrapper: { alignItems: 'center', marginVertical: 8 },

  // Quick actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom:  30, // Increased spacing down to the checkin card
    paddingHorizontal: 4,
  },
  actionBtn: {
    width:          58,
    height:         64,
    backgroundColor: Colors.primary,
    borderRadius:   12,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            5,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  actionLabel: {
    fontFamily: Fonts.poppinsMedium,
    fontSize:   10,
    color:      Colors.white,
  },

  // Daily reminder / check-in card
  checkInCard: {
    backgroundColor: '#D1F4FF', // Closer to exact Figma cyan/blue
    borderRadius:    16,
    padding:         24,
    marginBottom:    26,
    flexDirection:   'row',
    alignItems:      'center',
    overflow:        'visible',
    shadowColor: '#3D8AB5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  checkInTextCol: { flex: 1, gap: 6, zIndex: 2 },
  cardArrow: {
    position: 'absolute',
    top:      16,
    right:    16,
    width:    30,
    height:   30,
    borderRadius: 8,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems:     'center',
    zIndex: 3,
  },
  reminderLabel: {
    fontFamily:    Fonts.jostMedium,
    fontSize:      16,
    color:         Colors.textMuted,
    letterSpacing: 0.5,
  },
  checkInHeading: {
    fontFamily:    Fonts.poppinsBold,
    fontSize:      22,
    color:         Colors.text,
    letterSpacing: 0.5,
    lineHeight:    28,
  },
  thisWeekLabel: {
    fontFamily:    Fonts.poppins,
    fontSize:      11,
    color:         Colors.textMuted,
    letterSpacing: 0.5,
    marginTop:     4,
  },
  thumbsUp: {
    position:   'absolute',
    bottom:     -15,
    right:      -25,
    fontSize:   120, // MASSIVE
    zIndex:     1,
    transform: [{ rotate: '-10deg' }],
  },

  // Upcoming events
  sectionLabel: {
    fontFamily:  Fonts.poppinsSemiBold,
    fontSize:    16,
    color:       '#7B7B7B',
    lineHeight:  26,
    letterSpacing: 0,
    marginBottom: 12,
  },
  eventsRow: {
    flexDirection:  'row',
    gap:            16,
    justifyContent: 'space-between',
  },
  eventCard: {
    width:        CARD_WIDTH,
    height:       150,
    borderRadius: 16,
    padding:      16,
    position:     'relative',
    backgroundColor: '#EADAF5',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    justifyContent: 'space-between',
  },
  eventCardArrow: {
    position: 'absolute',
    top:      12,
    right:    12,
    width:    26,
    height:   26,
    borderRadius: 6,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems:     'center',
    zIndex: 2,
  },
  eventLogoCircle: {
    width:          46,
    height:         46,
    borderRadius:   23,
    borderWidth:    1,
    borderColor:    Colors.text, // Outlined empty circle vibe
    alignItems:     'center',
    justifyContent: 'center',
  },
  eventEmoji: { fontSize: 24 },
  eventTextWrapper: {
    marginTop: 'auto',
  },
  eventTitle: {
    fontFamily:    Fonts.poppinsSemiBold,
    fontSize:      15,
    color:         Colors.text,
    letterSpacing: 0,
    lineHeight:    20,
  },
  eventLocation: {
    fontFamily:    Fonts.poppins,
    fontSize:      12,
    color:         Colors.text,
    letterSpacing: 0,
    marginTop:     2,
  },
  // Guardian Card
  guardianCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 26,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  guardianGradient: {
    padding: 20,
  },
  guardianContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guardianTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 18,
    color: Colors.white,
  },
  guardianSubtitle: {
    fontFamily: Fonts.jost,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    maxWidth: '80%',
  },
  guardianIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
