import { useMemo, useCallback, useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';

import { useAuthStore }     from '../../store/auth';
import { useProgressStore } from '../../store/progress';
import { SobrietyCounter }  from '../../components/ui/SobrietyCounter';
import { StreakDots }        from '../../components/ui/StreakDots';
import { CheckInModal }      from '../../components/ui/CheckInModal';
import { Colors }           from '../../constants/colors';
import { Fonts }            from '../../constants/fonts';
import { fetchNearbyMeetings, meetingDayTime, type Meeting } from '../../services/meetings';

// ── Quick-action buttons (row of 5, Figma: 55×60 each) ──────────────────────

const QUICK_ACTIONS = [
  { id: 'meetings',  label: 'Meeting',   icon: 'people',    route: '/(app)/meetings'  },
  { id: 'awards',    label: 'Awards',    icon: 'trophy',    route: '/(app)/tracker'   },
  { id: 'tracker',   label: 'Tracker',   icon: 'analytics', route: '/(app)/tracker'   },
  { id: 'checklist', label: 'Checklist', icon: 'checkbox',  route: '/(app)/apps'      },
  { id: 'journal',   label: 'Journal',   icon: 'book',      route: '/(app)/journal'   },
] as const;

// ── Component ────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const user              = useAuthStore((s) => s.user);
  const sobrietyStartDate = useProgressStore((s) => s.sobrietyStartDate);
  const weeklyStreak      = useProgressStore((s) => s.weeklyStreak);
  const markTodayCheckedIn = useProgressStore((s) => s.markTodayCheckedIn);

  const [checkInVisible, setCheckInVisible] = useState(false);
  const [meetings, setMeetings]             = useState<Meeting[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(false);

  const daysSober = useMemo(() => {
    if (!sobrietyStartDate) return 0;
    const start = new Date(sobrietyStartDate);
    const diff  = Math.floor((Date.now() - start.getTime()) / 86_400_000);
    return Math.max(0, diff);
  }, [sobrietyStartDate]);

  const firstName = (user?.name ?? 'Friend').split(' ')[0];

  // Check-in for today
  const todayIdx       = (new Date().getDay() + 6) % 7;
  const checkedInToday = weeklyStreak[todayIdx] ?? false;

  const handleCheckIn = useCallback(() => {
    if (!checkedInToday) {
      setCheckInVisible(true);
    }
  }, [checkedInToday]);

  const handleCheckInConfirm = useCallback(async (mood: number, notes: string) => {
    await markTodayCheckedIn(user?.id, mood, notes);
    setCheckInVisible(false);
  }, [user?.id, markTodayCheckedIn]);

  // Fetch nearby meetings
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setMeetingsLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setMeetingsLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (cancelled) return;
        const nearby = await fetchNearbyMeetings(loc.coords.latitude, loc.coords.longitude);
        if (!cancelled) setMeetings(nearby.slice(0, 4));
      } catch {
        // silently fail — no meetings shown
      } finally {
        if (!cancelled) setMeetingsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

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
            <Text style={styles.welcomeLabel}>Welcome Back</Text>
            <Text style={styles.userName}>{firstName}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(app)/settings')} hitSlop={12}>
            <Ionicons name="menu" size={26} color={Colors.text} />
          </TouchableOpacity>
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
              onPress={() => router.push(a.route as any)}
            >
              <Ionicons name={a.icon as any} size={24} color={Colors.white} />
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Daily Reminder / Check-in Card ─────────────────────────────── */}
        <TouchableOpacity
          style={styles.checkInCard}
          activeOpacity={checkedInToday ? 1 : 0.92}
          onPress={handleCheckIn}
        >
          {/* Small external link icon */}
          <TouchableOpacity style={styles.cardArrow} onPress={() => router.push('/(app)/tracker' as any)} hitSlop={8}>
            <Ionicons name="arrow-up-outline" size={14} color={Colors.textMuted} style={{ transform: [{ rotate: '45deg' }] }} />
          </TouchableOpacity>

          {/* Text content */}
          <View style={styles.checkInTextCol}>
            <Text style={styles.reminderLabel}>Daily Reminder</Text>
            <Text style={styles.checkInHeading}>
              {checkedInToday ? 'You checked in today! 🎉' : 'Have you checked in\nyet today?'}
            </Text>
            <Text style={styles.thisWeekLabel}>This week</Text>
            <StreakDots streak={weeklyStreak} />
          </View>

          {/* Thumbs-up 3D emoji */}
          <Text style={styles.thumbsUp}>👍</Text>
        </TouchableOpacity>

        {/* ── Upcoming Events ────────────────────────────────────────────── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Upcoming Events</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/meetings')}>
            <Text style={styles.sectionLink}>View all</Text>
          </TouchableOpacity>
        </View>

        {meetingsLoading ? (
          <View style={styles.meetingsLoader}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.meetingsLoadingText}>Finding nearby meetings…</Text>
          </View>
        ) : meetings.length > 0 ? (
          <View style={styles.eventsRow}>
            {meetings.slice(0, 2).map((m) => (
              <TouchableOpacity
                key={m.id}
                activeOpacity={0.88}
                onPress={() => router.push('/(app)/meetings')}
              >
                <LinearGradient
                  colors={[Colors.eventGradientStart, Colors.eventGradientEnd]}
                  style={styles.eventCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                >
                  {/* Link icon */}
                  <View style={styles.eventArrow}>
                    <Ionicons name="arrow-up-outline" size={12} color={Colors.textMuted} style={{ transform: [{ rotate: '45deg' }] }} />
                  </View>

                  {/* Logo circle */}
                  <View style={styles.eventLogoCircle}>
                    <Ionicons name="people-circle-outline" size={26} color={Colors.primary} />
                  </View>

                  <Text style={styles.eventTitle} numberOfLines={2}>{m.name}</Text>
                  <Text style={styles.eventLocation} numberOfLines={1}>
                    {m.city && m.state ? `${m.city}, ${m.state}` : m.location || m.city}
                  </Text>
                  <Text style={styles.eventTime} numberOfLines={1}>{meetingDayTime(m)}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.eventsRow}>
            {/* Fallback placeholder cards */}
            {[
              { title: 'AA Meetings Near You', sub: 'Enable location to find local meetings' },
              { title: 'NA Meetings Near You', sub: 'Recovery support in your area' },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.88}
                onPress={() => router.push('/(app)/meetings')}
              >
                <LinearGradient
                  colors={[Colors.eventGradientStart, Colors.eventGradientEnd]}
                  style={styles.eventCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                >
                  <View style={styles.eventArrow}>
                    <Ionicons name="arrow-up-outline" size={12} color={Colors.textMuted} style={{ transform: [{ rotate: '45deg' }] }} />
                  </View>
                  <View style={styles.eventLogoCircle}>
                    <Image source={require('../../assets/Logo Icon.png')} style={{ width: 28, height: 28 }} resizeMode="contain" />
                  </View>
                  <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.eventLocation} numberOfLines={2}>{item.sub}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Check-in Modal ─────────────────────────────────────────────── */}
      <CheckInModal
        visible={checkInVisible}
        onClose={() => setCheckInVisible(false)}
        onConfirm={handleCheckInConfirm}
      />
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

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
  welcomeLabel: {
    fontFamily: Fonts.jost,
    fontSize:   16,
    color:      Colors.textMuted,
    lineHeight: 22,
  },
  userName: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize:   16,
    color:      Colors.text,
  },

  // Sobriety arc
  arcWrapper: { alignItems: 'center', marginVertical: 8 },

  // Quick actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom:  20,
  },
  actionBtn: {
    width:          55,
    height:         60,
    backgroundColor: Colors.primary,
    borderRadius:   10,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            4,
  },
  actionLabel: {
    fontFamily: Fonts.poppinsMedium,
    fontSize:   10,
    color:      Colors.white,
  },

  // Daily reminder / check-in card
  checkInCard: {
    backgroundColor: Colors.checkInCard,
    borderRadius:    15,
    padding:         20,
    marginBottom:    20,
    flexDirection:   'row',
    alignItems:      'center',
    overflow:        'hidden',
  },
  checkInTextCol: { flex: 1, gap: 6 },
  cardArrow: {
    position: 'absolute',
    top:      12,
    right:    12,
  },
  reminderLabel: {
    fontFamily:    Fonts.jostMedium,
    fontSize:      15,
    color:         Colors.textMuted,
    letterSpacing: 0.5,
  },
  checkInHeading: {
    fontFamily:    Fonts.poppinsBold,
    fontSize:      20,
    color:         Colors.text,
    letterSpacing: 0.5,
    lineHeight:    26,
  },
  thisWeekLabel: {
    fontFamily:    Fonts.poppins,
    fontSize:      10,
    color:         Colors.textMuted,
    letterSpacing: 0.5,
  },
  thumbsUp: {
    fontSize:   60,
    marginLeft: 12,
    marginTop:  12,
  },

  // Section header
  sectionRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   12,
  },
  sectionLabel: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize:   14,
    color:      Colors.textMuted,
    lineHeight: 26,
  },
  sectionLink: {
    fontFamily: Fonts.jost,
    fontSize:   13,
    color:      Colors.primary,
  },

  // Meetings loader
  meetingsLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  meetingsLoadingText: {
    fontFamily: Fonts.jost,
    fontSize: 13,
    color: Colors.textMuted,
  },

  // Event cards
  eventsRow: {
    flexDirection:  'row',
    gap:            16,
    justifyContent: 'space-between',
  },
  eventCard: {
    width:        147,
    minHeight:    139,
    borderRadius: 15,
    padding:      16,
    position:     'relative',
  },
  eventArrow: {
    position: 'absolute',
    top:      10,
    right:    10,
  },
  eventLogoCircle: {
    width:          40,
    height:         40,
    borderRadius:   20,
    backgroundColor: Colors.white,
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   8,
  },
  eventTitle: {
    fontFamily:    Fonts.poppinsMedium,
    fontSize:      13,
    color:         Colors.text,
    letterSpacing: 0.5,
    lineHeight:    18,
  },
  eventLocation: {
    fontFamily:    Fonts.poppins,
    fontSize:      10,
    color:         Colors.text,
    letterSpacing: 0.5,
    marginTop:     2,
  },
  eventTime: {
    fontFamily:    Fonts.jost,
    fontSize:      10,
    color:         Colors.primary,
    marginTop:     3,
  },
});
