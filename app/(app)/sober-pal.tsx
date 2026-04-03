import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  useAnimatedProps, 
  useSharedValue, 
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useAuthStore } from '../../store/auth';
import { useProgressStore } from '../../store/progress';
import { useChecklistStore } from '../../store/checklist';

const { width } = Dimensions.get('window');
const RING_SIZE = width * 0.75;
const STROKE_WIDTH = 28;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Animated Circle Component
const AnimatedCircle = Animated.createAnimatedProps(Circle);

const MOODS = [
  { label: 'Great', emoji: '😊', color: '#4BFFC8' },
  { label: 'Steady', emoji: '😐', color: '#9747FF' },
  { label: 'Anxious', emoji: '😰', color: '#FFB347' },
  { label: 'Tempted', emoji: '🔥', color: '#FF4747' },
  { label: 'Down', emoji: '😔', color: '#768DB5' },
];

const MILESTONES = [
  { id: '1', icon: 'ribbon', label: '24 Hours', color: '#B740FF', unlocked: true },
  { id: '2', icon: 'star', label: '1 Week', color: '#00D1FF', unlocked: true },
  { id: '3', icon: 'medal', label: '1 Month', color: '#FFD700', unlocked: false },
];

export default function SoberPalScreen() {
  const insets = useSafeAreaInsets();
  const { user, loading: authLoading } = useAuthStore();
  const { 
    todayDayIndex, 
    markTodayCheckedIn, 
    weeklyStreak,
    loading: progressLoading 
  } = useProgressStore();
  const { 
    items: checklistItems, 
    toggleItem,
    loading: checklistLoading 
  } = useChecklistStore();

  const [greeting, setGreeting] = useState('Good Morning');
  const progress = useSharedValue(0);

  // Calculate Days Sober
  const daysSober = user?.sobriety_start_date 
    ? Math.floor((Date.now() - new Date(user.sobriety_start_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Progress for the 30-day ring (example: daysSober / 30)
  const ringProgress = Math.min(daysSober / 30, 1);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    progress.value = withSpring(ringProgress || 0.01, { damping: 15 });
  }, [ringProgress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - (progress.value || 0)),
  }));

  const handleCheckIn = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await markTodayCheckedIn();
  };

  const handleToggleTask = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleItem(id);
  };

  if (authLoading || progressLoading || checklistLoading) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const isTodayCheckedIn = weeklyStreak[todayDayIndex()];

  return (
    <View style={styles.root}>
      {/* Subtle Ambient Background */}
      <LinearGradient
        colors={['#F8F7FF', '#EEF2FF']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: 120 }]}
      >
        {/* Header Section */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <View>
            <Text style={styles.greetingText}>{greeting},</Text>
            <Text style={styles.nameText}>{user?.name || 'Friend'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileBtn}
            onPress={() => router.push('/(app)/profile')}
          >
            <Ionicons name="person" size={24} color="#FFF" />
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeTxt}>PRO</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Progress Ring Card */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.ringCard}>
          <View style={styles.ringContainer}>
            <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
              <Defs>
                <SvgGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#4B0082" />
                  <Stop offset="100%" stopColor="#00D1FF" />
                </SvgGradient>
              </Defs>
              <G rotation="-90" origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}>
                {/* Background Ring */}
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  stroke="#E8E8E8"
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                />
                {/* Active Progress Ring */}
                <AnimatedCircle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  stroke="url(#ringGradient)"
                  strokeWidth={STROKE_WIDTH}
                  strokeDasharray={CIRCUMFERENCE}
                  animatedProps={animatedProps}
                  strokeLinecap="round"
                  fill="none"
                />
              </G>
            </Svg>
            
            <View style={styles.ringOverlay}>
              <Text style={styles.daysCount}>{daysSober}</Text>
              <Text style={styles.daysLabel}>DAYS SOBER</Text>
              <View style={styles.milestonePill}>
                <Ionicons name="trophy" size={12} color="#FFD700" />
                <Text style={styles.milestoneText}>30 Day Goal</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Milestone Badges */}
        <View style={styles.milestoneRow}>
          {MILESTONES.map(m => (
            <View key={m.id} style={styles.milestoneIconWrap}>
               <View style={[styles.milestoneCircle, { backgroundColor: m.unlocked ? m.color + '20' : '#E8E8E8' }]}>
                 <Ionicons name={m.icon as any} size={24} color={m.unlocked ? m.color : '#BBB'} />
               </View>
               <Text style={styles.milestoneLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* Mood Picker */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>How are you feeling today?</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.moodList}
        >
          {MOODS.map((mood, idx) => (
            <TouchableOpacity key={idx} style={styles.moodItem} activeOpacity={0.7}>
              <View style={[styles.moodCircle, { backgroundColor: mood.color + '20' }]}>
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              </View>
              <Text style={styles.moodLabel}>{mood.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Action Cards */}
        <View style={styles.actionGrid}>
          {/* Daily Check-In */}
          <TouchableOpacity 
            style={[styles.actionCard, isTodayCheckedIn && styles.checkedInCard]} 
            onPress={handleCheckIn}
            disabled={isTodayCheckedIn}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: isTodayCheckedIn ? '#4BFFC820' : '#4B008210' }]}>
              <Ionicons 
                name={isTodayCheckedIn ? "checkmark-circle" : "calendar-outline"} 
                size={24} 
                color={isTodayCheckedIn ? '#4BFFC8' : '#4B0082'} 
              />
            </View>
            <Text style={styles.actionTitle}>{isTodayCheckedIn ? 'Checked In' : 'Daily Check-In'}</Text>
            <Text style={styles.actionSub}>Confirm your sobriety today</Text>
          </TouchableOpacity>

          {/* SOS Help */}
          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => router.push('/(app)/sos')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: '#FF474720' }]}>
              <Ionicons name="warning-outline" size={24} color="#FF4747" />
            </View>
            <Text style={styles.actionTitle}>Crisis Support</Text>
            <Text style={styles.actionSub}>Instant help when needed</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Checklist */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Checklist</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/checklist')}><Text style={styles.seeAll}>View All</Text></TouchableOpacity>
        </View>
        <View style={styles.checklistContainer}>
          {checklistItems.slice(0, 3).map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.checkItem}
              onPress={() => handleToggleTask(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, item.completed && styles.checkboxActive]}>
                {item.completed && <Ionicons name="checkmark" size={14} color="white" />}
              </View>
              <Text style={[styles.checkText, item.completed && styles.checkTextDone]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F7FF',
  },
  loadingRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F7FF',
  },
  content: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greetingText: {
    fontFamily: Fonts.jost,
    fontSize: 16,
    color: '#768DB5',
  },
  nameText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 24,
    color: '#1A1A1A',
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4B0082',
    borderWidth: 2,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4B0082',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  profileBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#00D1FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileBadgeTxt: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 8,
    color: '#FFF',
  },
  ringCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysCount: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 80,
    color: '#1A1A1A',
    lineHeight: 88,
  },
  daysLabel: {
    fontFamily: Fonts.jostMedium,
    fontSize: 14,
    color: '#768DB5',
    letterSpacing: 2,
    marginTop: -4,
  },
  milestonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  milestoneText: {
    fontFamily: Fonts.jostMedium,
    fontSize: 12,
    color: '#4B0082',
    marginLeft: 6,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 40,
  },
  milestoneIconWrap: {
    alignItems: 'center',
    gap: 8,
  },
  milestoneCircle: {
     width: 56,
     height: 56,
     borderRadius: 28,
     alignItems: 'center',
     justifyContent: 'center',
  },
  milestoneLabel: {
    fontFamily: Fonts.jost,
    fontSize: 12,
    color: '#768DB5',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 18,
    color: '#1A1A1A',
  },
  seeAll: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 14,
    color: '#4B0082',
  },
  moodList: {
    paddingRight: 24,
    marginBottom: 32,
  },
  moodItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  moodCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodLabel: {
    fontFamily: Fonts.jost,
    fontSize: 13,
    color: '#768DB5',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  checkedInCard: {
    borderWidth: 1,
    borderColor: '#4BFFC8',
    backgroundColor: '#F8FFF9',
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  actionSub: {
    fontFamily: Fonts.jost,
    fontSize: 12,
    color: '#768DB5',
  },
  checklistContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  checkboxActive: {
    backgroundColor: '#4B0082',
    borderColor: '#4B0082',
  },
  checkText: {
    fontFamily: Fonts.jostMedium,
    fontSize: 15,
    color: '#1A1A1A',
  },
  checkTextDone: {
    textDecorationLine: 'line-through',
    color: '#768DB5',
  },
});
