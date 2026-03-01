import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { SobrietyCounter } from '../../components/ui/SobrietyCounter';
import { StreakDots } from '../../components/ui/StreakDots';
import { useAuthStore } from '../../store/auth';
import { useProgressStore } from '../../store/progress';
import { useSobrietyTimer } from '../../hooks/useSobrietyTimer';
import { useDrawer } from '../../components/DrawerContext';
import ChecklistSheet from '../../components/checklists/DailyChecklist';
import JournalSheet from '../../components/journal/JournalEntry';
import BottomSheet from '@gorhom/bottom-sheet';

const thumbsUp = require('../../assets/images/thumbs-up.png');

/* ─── Quick-action buttons ─── */
const QUICK_ACTIONS = [
  { id: 'meeting',   label: 'Meeting',   icon: 'people-outline' as const,   route: '/(app)/meetings' },
  { id: 'awards',    label: 'Awards',    icon: 'trophy-outline' as const,    route: '/(app)/profile' },
  { id: 'tracker',   label: 'Tracker',   icon: 'bar-chart-outline' as const, route: '/(app)/tracker' },
  { id: 'checklist', label: 'Checklist', icon: 'checkbox-outline' as const,  action: 'checklist' },
  { id: 'journal',   label: 'Journal',   icon: 'journal-outline' as const,   action: 'journal' },
] as const;

/* ─── Upcoming-event cards ─── */
const UPCOMING_EVENTS = [
  {
    id: 'meeting',
    title: 'Find a Meeting',
    subtitle: 'AA · NA · SMART Recovery',
    emoji: '🤝',
    route: '/(app)/meetings',
  },
  {
    id: 'pal',
    title: 'Sober Pal',
    subtitle: 'Connect with someone',
    emoji: '💜',
    route: '/(app)/sober-pal',
  },
];

/** Mon=0 … Sun=6, matches progress store convention */
function todayWeekIndex() {
  return (new Date().getDay() + 6) % 7;
}

export default function Home() {
  const user                                            = useAuthStore(s => s.user);
  const { sobrietyStartDate, weeklyStreak, markTodayCheckedIn } = useProgressStore();
  const timer                                           = useSobrietyTimer(sobrietyStartDate);
  const { openDrawer }                                  = useDrawer();

  const checklistRef = useRef<BottomSheet>(null);
  const journalRef   = useRef<BottomSheet>(null);
  const thumbScale   = useRef(new Animated.Value(1)).current;

  const checkedInToday = weeklyStreak[todayWeekIndex()];

  const handleCheckIn = useCallback(() => {
    if (checkedInToday) {
      Alert.alert('Already checked in! 💜', "You've already done your daily check-in today. Come back tomorrow!");
      return;
    }
    Animated.sequence([
      Animated.spring(thumbScale, { toValue: 1.3, useNativeDriver: true, speed: 20 }),
      Animated.spring(thumbScale, { toValue: 1.0, useNativeDriver: true, speed: 20 }),
    ]).start();
    markTodayCheckedIn();
    Alert.alert('Checked in! 👍', 'Great work showing up today. Keep that streak going!');
  }, [checkedInToday, markTodayCheckedIn, thumbScale]);

  const handleQuickAction = useCallback((action: typeof QUICK_ACTIONS[number]) => {
    if ('route' in action && action.route) {
      router.push(action.route as any);
    } else if ('action' in action) {
      if (action.action === 'checklist') checklistRef.current?.expand();
      else if (action.action === 'journal') journalRef.current?.expand();
    }
  }, []);

  const displayName = user?.name || 'there';

  return (
    <LinearGradient
      colors={['#E8DCFF', '#F1EBFF', '#F8F5FF', Colors.background]}
      locations={[0, 0.2, 0.45, 1]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 0.5 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome,</Text>
              <Text style={styles.name}>{displayName}</Text>
            </View>
            <TouchableOpacity style={styles.menuBtn} onPress={openDrawer}>
              <Ionicons name="menu" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* ── Sobriety arc (progress-based) ── */}
          <View style={styles.arcWrap}>
            <SobrietyCounter days={timer.days} goal={90} />
          </View>

          {/* ── Quick-action buttons ── */}
          <View style={styles.quickRow}>
            {QUICK_ACTIONS.map(action => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickBtnOuter}
                onPress={() => handleQuickAction(action)}
                activeOpacity={0.78}
              >
                <LinearGradient
                  colors={['#9E58FF', '#7B2FE0']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.quickBtnGrad}
                >
                  {/* icon circle — gives the "coin in holder" depth */}
                  <View style={styles.quickIconCircle}>
                    <Ionicons name={action.icon} size={20} color="#fff" />
                  </View>
                  <Text style={styles.quickLabel}>{action.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Daily Reminder card ── */}
          <View style={styles.reminderCard}>
            {/* header row */}
            <View style={styles.reminderHeader}>
              <Text style={styles.reminderSectionLabel}>Daily Reminder</Text>
              <TouchableOpacity style={styles.reminderArrowBtn} onPress={handleCheckIn}>
                <Ionicons name="open-outline" size={14} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* body */}
            <View style={styles.reminderBody}>
              <View style={styles.reminderTextCol}>
                <Text style={styles.reminderTitle}>
                  {checkedInToday
                    ? 'You checked in\ntoday ✓'
                    : 'Have you checked in\nyet today?'}
                </Text>
                <Text style={styles.reminderWeekLabel}>This week</Text>
                <StreakDots streak={weeklyStreak} />
              </View>

              {/* 3D thumbs-up — tappable, animated */}
              <TouchableOpacity onPress={handleCheckIn} activeOpacity={0.85} style={styles.thumbTap}>
                <Animated.Image
                  source={thumbsUp}
                  style={[styles.thumbImage, { transform: [{ scale: thumbScale }] }]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Upcoming Events ── */}
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <View style={styles.eventsRow}>
            {UPCOMING_EVENTS.map(event => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => router.push(event.route as any)}
                activeOpacity={0.82}
              >
                {/* top row: logo + arrow */}
                <View style={styles.eventCardTop}>
                  <View style={styles.eventLogoCircle}>
                    <Text style={styles.eventEmoji}>{event.emoji}</Text>
                  </View>
                  <View style={styles.eventArrowBtn}>
                    <Ionicons name="open-outline" size={13} color={Colors.primary} />
                  </View>
                </View>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventSub}>{event.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>

        {/* Bottom Sheets */}
        <ChecklistSheet ref={checklistRef} />
        <JournalSheet ref={journalRef} />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: 'transparent' },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },

  /* ─── Header ─── */
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: Colors.text,
    fontFamily: 'GeneralSans-Medium',
  },
  name: {
    fontSize: 24,
    fontFamily: 'GeneralSans-Semibold',
    color: Colors.text,
    marginTop: 1,
  },
  menuBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ─── Arc ─── */
  arcWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },

  /* ─── Quick-action buttons ─── */
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
  },
  quickBtnOuter: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#7B2FE0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  quickBtnGrad: {
    paddingTop: 14,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  quickIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 10,
    color: '#fff',
    fontFamily: 'GeneralSans-Regular',
    textAlign: 'center',
  },

  /* ─── Daily Reminder card ─── */
  reminderCard: {
    backgroundColor: '#C0EEFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 24,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  reminderSectionLabel: {
    fontSize: 13,
    color: '#3d8ab5',
    fontFamily: 'GeneralSans-Medium',
  },
  reminderArrowBtn: {
    width: 30,
    height: 30,
    backgroundColor: Colors.white,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderBody: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  reminderTextCol: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 22,
    fontFamily: 'GeneralSans-Bold',
    color: Colors.text,
    lineHeight: 30,
    marginBottom: 12,
  },
  reminderWeekLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: 'GeneralSans-Regular',
    marginBottom: 6,
  },
  thumbTap: {
    marginLeft: 8,
    marginBottom: -4,   // let it kiss the card bottom edge
  },
  thumbImage: {
    width: 110,
    height: 110,
  },

  /* ─── Upcoming Events ─── */
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'GeneralSans-Semibold',
    color: Colors.text,
    marginBottom: 12,
  },
  eventsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  eventCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 14,
    shadowColor: '#9747FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 3,
  },
  eventCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  eventLogoCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventEmoji: {
    fontSize: 22,
  },
  eventArrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 15,
    fontFamily: 'GeneralSans-Semibold',
    color: Colors.text,
    marginBottom: 4,
  },
  eventSub: {
    fontSize: 11,
    fontFamily: 'GeneralSans-Regular',
    color: Colors.textMuted,
    lineHeight: 16,
  },
});
