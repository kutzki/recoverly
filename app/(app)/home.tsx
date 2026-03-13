import { useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuthStore }     from '../../store/auth';
import { useProgressStore } from '../../store/progress';
import { SobrietyCounter }  from '../../components/ui/SobrietyCounter';
import { StreakDots }        from '../../components/ui/StreakDots';
import { Colors }           from '../../constants/colors';
import { Fonts }            from '../../constants/fonts';

// ── Quick-action buttons (row of 5, Figma: 55×60 each) ──────────────────────

const QUICK_ACTIONS = [
  { id: 'meetings',  label: 'Meeting',   icon: 'people',       route: '/(app)/meetings'  },
  { id: 'awards',    label: 'Awards',    icon: 'trophy',       route: '/(app)/tracker'   },
  { id: 'tracker',   label: 'Tracker',   icon: 'analytics',    route: '/(app)/tracker'   },
  { id: 'checklist', label: 'Checklist', icon: 'checkbox',     route: '/(app)/apps'      },
  { id: 'journal',   label: 'Journal',   icon: 'book',         route: '/(app)/apps'      },
] as const;

// ── Sample upcoming events (placeholder until Supabase events table) ─────────

const UPCOMING_EVENTS = [
  {
    id: '1',
    title:    'New Connections',
    location: 'Los Angeles County',
    emoji:    '🏛️',
    bgColor:  Colors.cardTintPurpleLight,
  },
  {
    id: '2',
    title:    'New Connections',
    location: 'Toronto, Canada',
    emoji:    '🌐',
    bgColor:  Colors.cardTintPurpleLight,
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const user              = useAuthStore((s) => s.user);
  const sobrietyStartDate = useProgressStore((s) => s.sobrietyStartDate);
  const weeklyStreak      = useProgressStore((s) => s.weeklyStreak);
  const markTodayCheckedIn = useProgressStore((s) => s.markTodayCheckedIn);

  const daysSober = useMemo(() => {
    if (!sobrietyStartDate) return 0;
    const start = new Date(sobrietyStartDate);
    const diff  = Math.floor((Date.now() - start.getTime()) / 86_400_000);
    return Math.max(0, diff);
  }, [sobrietyStartDate]);

  const firstName = (user?.name ?? 'Friend').split(' ')[0];

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
          activeOpacity={0.92}
          onPress={handleCheckIn}
        >
          {/* Small external link icon */}
          <TouchableOpacity style={styles.cardArrow} onPress={() => router.push('/(app)/apps')} hitSlop={8}>
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
        <Text style={styles.sectionLabel}>Upcoming Events</Text>

        <View style={styles.eventsRow}>
          {UPCOMING_EVENTS.map((ev) => (
            <TouchableOpacity
              key={ev.id}
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
                  <Text style={styles.eventEmoji}>{ev.emoji}</Text>
                </View>

                <Text style={styles.eventTitle} numberOfLines={2}>{ev.title}</Text>
                <Text style={styles.eventLocation} numberOfLines={1}>{ev.location}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
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

  // Upcoming events
  sectionLabel: {
    fontFamily:  Fonts.poppinsSemiBold,
    fontSize:    14,
    color:       Colors.textMuted,
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
    width:        147,
    height:       139,
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
  eventEmoji: { fontSize: 22 },
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
});
