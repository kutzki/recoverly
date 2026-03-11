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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { RelativePathString } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
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

const SCREEN_W = Dimensions.get('window').width;

/* ─── Quick-action buttons ─── */
const QUICK_ACTIONS = [
  { id: 'meeting',   label: 'Meeting',   icon: 'people-outline' as const,      route: '/(app)/meetings' },
  { id: 'awards',    label: 'Awards',    icon: 'trophy-outline' as const,       route: '/(app)/profile' },
  { id: 'tracker',   label: 'Tracker',   icon: 'bar-chart-outline' as const,    route: '/(app)/tracker' },
  { id: 'checklist', label: 'Checklist', icon: 'checkbox-outline' as const,     action: 'checklist' },
  { id: 'journal',   label: 'Journal',   icon: 'journal-outline' as const,      action: 'journal' },
] as const;

/* ─── Upcoming events cards ─── */
const UPCOMING_EVENTS = [
  {
    id: 'new-connections',
    title: 'New Connections',
    location: 'Los Angeles County',
    imageUri: null as string | null,
    route: '/(app)/sober-pal',
  },
  {
    id: 'abandon-non',
    title: 'Abandon Non-Users',
    location: 'Toronto, Canada',
    imageUri: null as string | null,
    route: '/(app)/meetings',
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
      router.push(action.route as RelativePathString);
    } else if ('action' in action) {
      if (action.action === 'checklist') checklistRef.current?.expand();
      else if (action.action === 'journal') journalRef.current?.expand();
    }
  }, []);

  const displayName = user?.name || 'there';

  return (
    <LinearGradient
      colors={[Colors.cardTintPurpleLight, Colors.cardTintPurpleMid, Colors.cardTintPurpleFaint, Colors.background]}
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
              <Text style={styles.greeting}>Welcome Back,</Text>
              <Text style={styles.name}>{displayName}</Text>
            </View>
            <TouchableOpacity style={styles.menuBtn} onPress={openDrawer} accessibilityLabel="Open menu">
              <Ionicons name="reorder-three-outline" size={26} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* ── Sobriety arc ── */}
          <View style={styles.arcWrap}>
            <SobrietyCounter days={timer.days} goal={90} />
          </View>

          {/* ── Quick-action cards (horizontal scroll) ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickScrollContent}
            style={styles.quickScroll}
          >
            {QUICK_ACTIONS.map(action => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickCard}
                onPress={() => handleQuickAction(action)}
                activeOpacity={0.78}
              >
                <Ionicons name={action.icon} size={26} color={Colors.white} />
                <Text style={styles.quickLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

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
          <Text style={styles.sectionLabel}>Upcoming Events</Text>
          <View style={styles.eventsRow}>
            {UPCOMING_EVENTS.map(item => (
              // Outer View carries the shadow; inner wrapper clips gradient to rounded corners
              <View key={item.id} style={styles.eventCardShadow}>
                <TouchableOpacity
                  style={styles.eventCardWrapper}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.82}
                >
                  <LinearGradient
                    colors={['rgba(171,49,240,0.18)', 'rgba(204,115,254,0.18)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.eventCard}
                  >
                    {/* Top row: avatar + arrow */}
                    <View style={styles.eventCardTop}>
                      <View style={styles.eventAvatar}>
                        {item.imageUri ? (
                          <Image
                            source={{ uri: item.imageUri }}
                            style={styles.eventAvatarImg}
                            resizeMode="cover"
                          />
                        ) : (
                          <Text style={styles.eventAvatarInitial}>
                            {item.title.charAt(0)}
                          </Text>
                        )}
                      </View>
                      <View style={styles.eventArrowBtn}>
                        <Ionicons name="arrow-forward" size={13} color={Colors.primary} />
                      </View>
                    </View>

                    <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.eventLocation}>{item.location}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
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

/* ─── CARD_W: width showing 4 full buttons + peek of 5th ─── */
const CARD_W = Math.floor((SCREEN_W - 40 - 3 * 12) / 4.3);

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
    fontSize: 15,
    color: Colors.textMuted,
    fontFamily: Fonts.jost,
  },
  name: {
    fontSize: 16,
    fontFamily: Fonts.poppinsSemiBold,
    color: Colors.text,
    marginTop: 2,
  },
  menuBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },

  /* ─── Arc ─── */
  arcWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },

  /* ─── Quick-action cards ─── */
  quickScroll: {
    marginHorizontal: -20,
    marginBottom: 20,
  },
  quickScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  quickCard: {
    width: CARD_W,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  quickLabel: {
    fontSize: 11,
    color: Colors.white,
    fontFamily: Fonts.poppinsMedium,
    textAlign: 'center',
  },

  /* ─── Daily Reminder card ─── */
  reminderCard: {
    backgroundColor: Colors.cardTintBlue,
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  reminderSectionLabel: {
    fontSize: 15,
    color: Colors.cardCyanText,
    fontFamily: Fonts.jostMedium,
    letterSpacing: 0.5,
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
    fontSize: 20,
    fontFamily: Fonts.poppinsBold,
    color: Colors.text,
    lineHeight: 28,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  reminderWeekLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: Fonts.jost,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  thumbTap: {
    marginLeft: 8,
    marginBottom: -4,
  },
  thumbImage: {
    width: 110,
    height: 110,
  },

  /* ─── Upcoming Events ─── */
  sectionLabel: {
    fontSize: 14,
    fontFamily: Fonts.poppinsSemiBold,
    color: Colors.textMuted,
    marginBottom: 12,
  },
  eventsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  // Outer shell — carries shadow on both platforms
  eventCardShadow: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: Colors.white,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 3,
  },
  // Inner shell — clips gradient to rounded corners
  eventCardWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  eventCard: {
    padding: 14,
    minHeight: 139,
    justifyContent: 'flex-end',
  },
  eventCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  eventAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  eventAvatarImg: {
    width: 46,
    height: 46,
  },
  eventAvatarInitial: {
    fontSize: 20,
    fontFamily: Fonts.poppinsSemiBold,
    color: Colors.primary,
  },
  eventArrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 13,
    fontFamily: Fonts.poppinsMedium,
    color: Colors.text,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 10,
    fontFamily: Fonts.jost,
    color: Colors.text,
    lineHeight: 16,
  },
});
