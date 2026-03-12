import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useRef, useCallback, useEffect } from 'react';
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
import type { SheetRef } from '../../components/checklists/DailyChecklist';

const thumbsUp = require('../../assets/images/thumbs-up.png');

const SCREEN_W = Dimensions.get('window').width;

/* ─── Quick-action buttons ─── */
const QUICK_ACTIONS = [
  { id: 'meeting',   label: 'Meeting',   icon: 'people-outline' as const,   route: '/(app)/meetings' },
  { id: 'awards',    label: 'Awards',    icon: 'trophy-outline' as const,    route: '/(app)/profile' },
  { id: 'tracker',   label: 'Tracker',   icon: 'bar-chart-outline' as const, route: '/(app)/tracker' },
  { id: 'checklist', label: 'Checklist', icon: 'checkbox-outline' as const,  action: 'checklist' },
  { id: 'journal',   label: 'Journal',   icon: 'journal-outline' as const,   action: 'journal' },
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

function todayWeekIndex() {
  return (new Date().getDay() + 6) % 7;
}

/* ─── Gamification streak milestones ─── */
const STREAK_MILESTONES = [7, 30, 60, 90, 180, 365];
function getStreakBadge(days: number) {
  if (days >= 365) return { label: '🏆 1 Year', color: '#FFD700' };
  if (days >= 180) return { label: '💎 180 Days', color: '#4BFFC8' };
  if (days >= 90)  return { label: '🥇 90 Days',  color: Colors.primary };
  if (days >= 60)  return { label: '🥈 60 Days',  color: '#AB31F0' };
  if (days >= 30)  return { label: '🥉 30 Days',  color: '#CC73FE' };
  if (days >= 7)   return { label: '⭐ 1 Week',   color: Colors.primaryMid };
  return null;
}

export default function Home() {
  const user                                            = useAuthStore(s => s.user);
  const { sobrietyStartDate, weeklyStreak, markTodayCheckedIn } = useProgressStore();
  const timer                                           = useSobrietyTimer(sobrietyStartDate);
  const { openDrawer }                                  = useDrawer();

  const checklistRef = useRef<SheetRef>(null);
  const journalRef   = useRef<SheetRef>(null);

  /* ── Animations ── */
  const headerAnim    = useRef(new Animated.Value(0)).current;
  const arcAnim       = useRef(new Animated.Value(0)).current;
  const actionsAnim   = useRef(new Animated.Value(0)).current;
  const reminderAnim  = useRef(new Animated.Value(0)).current;
  const thumbScale    = useRef(new Animated.Value(1)).current;
  const badgePulse    = useRef(new Animated.Value(1)).current;

  const checkedInToday = weeklyStreak[todayWeekIndex()];
  const badge = getStreakBadge(timer.days);

  /* Entrance animation — staggered fade+slide */
  useEffect(() => {
    const animations = [
      Animated.timing(headerAnim,   { toValue: 1, duration: 500, delay: 0,   useNativeDriver: true }),
      Animated.timing(arcAnim,      { toValue: 1, duration: 600, delay: 150, useNativeDriver: true }),
      Animated.timing(actionsAnim,  { toValue: 1, duration: 500, delay: 300, useNativeDriver: true }),
      Animated.timing(reminderAnim, { toValue: 1, duration: 500, delay: 450, useNativeDriver: true }),
    ];
    Animated.stagger(0, animations).start();

    /* Badge pulse loop */
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(badgePulse, { toValue: 1.0,  duration: 900, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const fadeSlide = (anim: Animated.Value, offsetY = 18) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [offsetY, 0] }) }],
  });

  const handleCheckIn = useCallback(() => {
    if (checkedInToday) {
      Alert.alert('Already checked in! 💜', "You've already done your daily check-in today. Come back tomorrow!");
      return;
    }
    Animated.sequence([
      Animated.spring(thumbScale, { toValue: 1.35, useNativeDriver: true, speed: 18 }),
      Animated.spring(thumbScale, { toValue: 1.0,  useNativeDriver: true, speed: 14 }),
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
          <Animated.View style={[styles.header, fadeSlide(headerAnim)]}>
            <View>
              <Text style={styles.greeting}>Welcome Back</Text>
              <Text style={styles.name}>{displayName}</Text>
            </View>
            <View style={styles.headerRight}>
              {badge && (
                <Animated.View style={[styles.badgeChip, { backgroundColor: badge.color + '22', transform: [{ scale: badgePulse }] }]}>
                  <Text style={[styles.badgeChipText, { color: badge.color }]}>{badge.label}</Text>
                </Animated.View>
              )}
              <TouchableOpacity style={styles.menuBtn} onPress={openDrawer} accessibilityLabel="Open menu">
                <Ionicons name="reorder-three-outline" size={26} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* ── Sobriety arc ── */}
          <Animated.View style={[styles.arcWrap, fadeSlide(arcAnim, 24)]}>
            <SobrietyCounter days={timer.days} goal={90} />
            {/* Next milestone hint */}
            {(() => {
              const next = STREAK_MILESTONES.find(m => m > timer.days);
              if (!next) return null;
              const pct = Math.round((timer.days / next) * 100);
              return (
                <View style={styles.milestoneHint}>
                  <Text style={styles.milestoneHintText}>
                    {next - timer.days} days to {next}-day milestone ({pct}%)
                  </Text>
                </View>
              );
            })()}
          </Animated.View>

          {/* ── Quick-action cards ── */}
          <Animated.View style={fadeSlide(actionsAnim)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickScrollContent}
              style={styles.quickScroll}
            >
              {QUICK_ACTIONS.map((action, idx) => (
                <QuickActionCard
                  key={action.id}
                  action={action}
                  index={idx}
                  onPress={() => handleQuickAction(action)}
                />
              ))}
            </ScrollView>
          </Animated.View>

          {/* ── Daily Reminder card ── */}
          <Animated.View style={fadeSlide(reminderAnim)}>
            <View style={styles.reminderCard}>
              <View style={styles.reminderHeader}>
                <Text style={styles.reminderSectionLabel}>Daily Reminder</Text>
                <TouchableOpacity style={styles.reminderArrowBtn} onPress={handleCheckIn}>
                  <Ionicons name="open-outline" size={14} color={Colors.primary} />
                </TouchableOpacity>
              </View>

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
          </Animated.View>

          {/* ── Upcoming Events ── */}
          <Animated.View style={fadeSlide(reminderAnim)}>
            <Text style={styles.sectionLabel}>Upcoming Events</Text>
            <View style={styles.eventsRow}>
              {UPCOMING_EVENTS.map(item => (
                <View key={item.id} style={styles.eventCardShadow}>
                  <TouchableOpacity
                    style={styles.eventCardWrapper}
                    onPress={() => router.push(item.route as any)}
                    activeOpacity={0.82}
                  >
                    <LinearGradient
                      colors={[Colors.eventGradientStart, Colors.eventGradientEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={styles.eventCard}
                    >
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
          </Animated.View>

          <View style={{ height: 32 }} />
        </ScrollView>

        {/* Bottom Sheets */}
        <ChecklistSheet ref={checklistRef} />
        <JournalSheet ref={journalRef} />
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ─── Animated quick-action card ─── */
function QuickActionCard({
  action,
  index,
  onPress,
}: {
  action: typeof QUICK_ACTIONS[number];
  index: number;
  onPress: () => void;
}) {
  const scale  = useRef(new Animated.Value(0)).current;
  const cardSc = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      delay: index * 60,
      useNativeDriver: true,
      damping: 14,
      mass: 0.7,
    }).start();
  }, []);

  const handlePressIn  = () => Animated.spring(cardSc, { toValue: 0.9, useNativeDriver: true, speed: 30 }).start();
  const handlePressOut = () => Animated.spring(cardSc, { toValue: 1,   useNativeDriver: true, speed: 20 }).start();

  return (
    <Animated.View style={{ transform: [{ scale: Animated.multiply(scale, cardSc) }] }}>
      <TouchableOpacity
        style={styles.quickCard}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Ionicons name={action.icon} size={26} color={Colors.white} />
        <Text style={styles.quickLabel}>{action.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ─── Card width: show 4 full + peek ─── */
const CARD_W = Math.floor((SCREEN_W - 40 - 3 * 12) / 4.3);

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: 'transparent' },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },

  /* Header */
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeChip: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeChipText: {
    fontSize: 11,
    fontFamily: Fonts.poppinsBold,
  },
  menuBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 22,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },

  /* Arc */
  arcWrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneHint: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  milestoneHintText: {
    fontSize: 12,
    fontFamily: Fonts.jostMedium,
    color: Colors.primary,
    textAlign: 'center',
  },

  /* Quick-action cards */
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

  /* Daily Reminder card */
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

  /* Upcoming Events */
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
