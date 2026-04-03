import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { useUIStore } from '../../store/ui';
import { useProgressStore } from '../../store/progress';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

const { width } = Dimensions.get('window');

// ─── Concentric rings showing progress ──────────────────────────────────────

function ConcentricRings({ tasksRatio, checkInsRatio, meetingsRatio }: {
  tasksRatio: number;
  checkInsRatio: number;
  meetingsRatio: number;
}) {
  const size = 140;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={styles.ringContainer}>
      <Svg width={size} height={size}>
        {/* Track backgrounds */}
        <Circle cx={cx} cy={cy} r={60} stroke="#EED8FF" strokeWidth={10} fill="none" />
        <Circle cx={cx} cy={cy} r={46} stroke="#EED8FF" strokeWidth={10} fill="none" />
        <Circle cx={cx} cy={cy} r={32} stroke="#EED8FF" strokeWidth={10} fill="none" />
        <Circle cx={cx} cy={cy} r={18} stroke="#EED8FF" strokeWidth={10} fill="none" />

        {/* Progress — outer: tasks */}
        <Circle cx={cx} cy={cy} r={60} stroke="#b740ff" strokeWidth={10} fill="none"
          strokeDasharray={`${Math.PI * 120}`}
          strokeDashoffset={`${Math.PI * 120 * (1 - tasksRatio)}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {/* Progress — middle-outer: check-ins */}
        <Circle cx={cx} cy={cy} r={46} stroke="#7D00B5" strokeWidth={10} fill="none"
          strokeDasharray={`${Math.PI * 92}`}
          strokeDashoffset={`${Math.PI * 92 * (1 - checkInsRatio)}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {/* Progress — middle-inner: meetings */}
        <Circle cx={cx} cy={cy} r={32} stroke="#DC86FF" strokeWidth={10} fill="none"
          strokeDasharray={`${Math.PI * 64}`}
          strokeDashoffset={`${Math.PI * 64 * (1 - meetingsRatio)}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {/* Inner cyan dot — always shown as accent */}
        <Circle cx={cx} cy={cy} r={18} stroke="#0EE6FF" strokeWidth={10} fill="none"
          strokeDasharray={`${Math.PI * 36}`}
          strokeDashoffset={`${Math.PI * 36 * 0.3}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
    </View>
  );
}

// ─── Compute elapsed time from a date string ─────────────────────────────────

function getElapsed(startDate: string | null): { days: number; hours: number; minutes: number } {
  if (!startDate) return { days: 0, hours: 0, minutes: 0 };
  const diffMs = Date.now() - new Date(startDate).getTime();
  const totalMinutes = Math.floor(diffMs / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  return { days, hours, minutes };
}

// ─── Milestone thresholds ────────────────────────────────────────────────────

const MILESTONES = [
  { days: 1,   label: 'First day sober',    emoji: '🏅', color: '#F3E8FF', textColor: Colors.text },
  { days: 7,   label: '7 days sober',        emoji: '🏅', color: '#b740ff', textColor: '#000'      },
  { days: 30,  label: 'Thirty days sober',   emoji: '🏅', color: '#0EE6FF', textColor: '#000'      },
  { days: 90,  label: 'Ninety days sober',   emoji: '🥇', color: '#FFD700', textColor: '#000'      },
  { days: 180, label: 'Six months sober',    emoji: '🏆', color: '#ab31f0', textColor: '#fff'      },
  { days: 365, label: 'One full year sober', emoji: '🌟', color: '#4BFFC8', textColor: '#000'      },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function TrackerScreen() {
  const insets = useSafeAreaInsets();
  const openMenu = useUIStore((s) => s.openMenu);

  const sobrietyStartDate = useProgressStore((s) => s.sobrietyStartDate);
  const tasksCompleted    = useProgressStore((s) => s.tasksCompleted);
  const tasksTarget       = useProgressStore((s) => s.tasksTarget);
  const checkInsCompleted = useProgressStore((s) => s.checkInsCompleted);
  const checkInsTarget    = useProgressStore((s) => s.checkInsTarget);
  const meetingsAttended  = useProgressStore((s) => s.meetingsAttended);
  const meetingsTarget    = useProgressStore((s) => s.meetingsTarget);

  const [seconds, setSeconds] = useState(0);

  // Tick seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => (prev >= 59 ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Recompute elapsed on each seconds tick (cheap — just arithmetic)
  const elapsed = useMemo(() => getElapsed(sobrietyStartDate), [sobrietyStartDate, seconds]);

  const tasksRatio    = tasksTarget    > 0 ? Math.min(tasksCompleted    / tasksTarget,    1) : 0;
  const checkInsRatio = checkInsTarget > 0 ? Math.min(checkInsCompleted / checkInsTarget, 1) : 0;
  const meetingsRatio = meetingsTarget > 0 ? Math.min(meetingsAttended  / meetingsTarget, 1) : 0;

  // Earned milestones
  const earnedMilestones = MILESTONES.filter((m) => elapsed.days >= m.days);

  // Date label for achieved milestones
  const milestoneDate = (requiredDays: number): string => {
    if (!sobrietyStartDate) return '';
    const d = new Date(sobrietyStartDate);
    d.setDate(d.getDate() + requiredDays);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity onPress={openMenu} style={[styles.iconBtn, { backgroundColor: 'transparent' }]}>
          <Ionicons name="menu" size={28} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Title Area */}
        <View style={styles.titleArea}>
          <Text style={styles.mainTitle}>Track Progress</Text>
          <Text style={styles.subTitle}>You're doing amazing, keep up the great work!</Text>
        </View>

        {/* Top Hero Card (Timer & Rings) */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            {/* Left: Rings */}
            <View style={styles.heroLeft}>
              <ConcentricRings
                tasksRatio={tasksRatio}
                checkInsRatio={checkInsRatio}
                meetingsRatio={meetingsRatio}
              />
              <TouchableOpacity style={styles.shareBtn}>
                <Text style={styles.shareBtnText}>Share now</Text>
                <Ionicons name="arrow-forward-outline" size={14} color={Colors.text} style={{ transform: [{ rotate: '-45deg' }] }} />
              </TouchableOpacity>
            </View>

            {/* Right: Timer Grid */}
            <View style={styles.timerGrid}>
              <View style={[styles.timeBox, { backgroundColor: '#bd51ff' }]}>
                <Text style={styles.timeVal}>{elapsed.days}</Text>
                <Text style={styles.timeLabel}>Days</Text>
              </View>
              <View style={[styles.timeBox, { backgroundColor: '#7D00B5' }]}>
                <Text style={styles.timeVal}>{String(elapsed.hours).padStart(2, '0')}</Text>
                <Text style={styles.timeLabel}>Hours</Text>
              </View>
              <View style={[styles.timeBox, { backgroundColor: '#cb66ff' }]}>
                <Text style={styles.timeVal}>{String(elapsed.minutes).padStart(2, '0')}</Text>
                <Text style={styles.timeLabel}>Minutes</Text>
              </View>
              <View style={[styles.timeBox, { backgroundColor: '#e2abff' }]}>
                <Text style={styles.timeVal}>{String(seconds).padStart(2, '0')}</Text>
                <Text style={styles.timeLabel}>Seconds</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Weekly Report */}
        <Text style={styles.sectionHeading}>Weekly Report</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalStrip}>
          <View style={styles.reportBox}>
            <View style={styles.reportIconCircle}>
              <Ionicons name="document-text-outline" size={20} color={Colors.text} />
            </View>
            <Text style={styles.reportLabel}>Tasks{'\n'}Completed</Text>
            <Text style={styles.reportScore}>{tasksCompleted}<Text style={styles.reportScoreTotal}>/{tasksTarget}</Text></Text>
          </View>

          <View style={styles.reportBox}>
            <View style={styles.reportIconCircle}>
              <Ionicons name="checkmark-outline" size={20} color={Colors.text} />
            </View>
            <Text style={styles.reportLabel}>Check-Ins{'\n'}Completed</Text>
            <Text style={styles.reportScore}>{checkInsCompleted}<Text style={styles.reportScoreTotal}>/{checkInsTarget}</Text></Text>
          </View>

          <View style={styles.reportBox}>
            <View style={styles.reportIconCircle}>
              <Ionicons name="people-outline" size={20} color={Colors.text} />
            </View>
            <Text style={styles.reportLabel}>Meetings{'\n'}Attended</Text>
            <Text style={styles.reportScore}>{meetingsAttended}<Text style={styles.reportScoreTotal}>/{meetingsTarget}</Text></Text>
          </View>
        </ScrollView>

        {/* Milestones */}
        <Text style={styles.sectionHeading}>Milestones</Text>
        {earnedMilestones.length === 0 ? (
          <View style={styles.emptyMilestones}>
            <Ionicons name="trophy-outline" size={40} color={Colors.primaryLight} />
            <Text style={styles.emptyMilestonesText}>Keep going! Your first milestone is at 1 day sober.</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalStrip}>
            {earnedMilestones.map((m) => (
              <View key={m.days} style={[styles.milestoneBox, { backgroundColor: m.color }]}>
                <View style={styles.milestoneIconWrap}>
                  <Text style={styles.milestoneMedal}>{m.emoji}</Text>
                </View>
                <Text style={[styles.milestoneTop, { color: m.textColor }]}>
                  {m.days === 1 ? 'Incredible!' : m.days === 7 ? 'Keep it up!' : "You're a rockstar!"}
                </Text>
                <Text style={[styles.milestoneMid, { color: m.textColor }]}>{m.label}</Text>
                <Text style={[styles.milestoneBot, { color: m.textColor }]}>{milestoneDate(m.days)}</Text>
              </View>
            ))}
          </ScrollView>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  titleArea: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  mainTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 28,
    color: '#3B0061',
    marginBottom: 4,
  },
  subTitle: {
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: '#8CA0B3',
  },
  heroCard: {
    marginHorizontal: 24,
    backgroundColor: '#FAF5FF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
  },
  heroTopRow: {
    flexDirection: 'row',
  },
  heroLeft: {
    flex: 1.1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 8,
  },
  shareBtnText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 12,
    color: Colors.text,
  },
  timerGrid: {
    flex: 1.3,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-end',
  },
  timeBox: {
    width: '46%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeVal: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 18,
    color: Colors.white,
  },
  timeLabel: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 11,
    color: Colors.white,
    marginTop: 2,
  },
  sectionHeading: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 20,
    color: Colors.text,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  horizontalStrip: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 36,
  },
  reportBox: {
    width: 130,
    backgroundColor: '#E8DCFF',
    borderRadius: 20,
    padding: 16,
  },
  reportIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  reportLabel: {
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 12,
  },
  reportScore: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 24,
    color: Colors.text,
  },
  reportScoreTotal: {
    fontSize: 16,
  },
  milestoneBox: {
    width: 140,
    borderRadius: 20,
    padding: 16,
  },
  milestoneIconWrap: {
    width: 48,
    height: 48,
    backgroundColor: Colors.white,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  milestoneMedal: {
    fontSize: 24,
  },
  milestoneTop: {
    fontFamily: Fonts.jost,
    fontSize: 12,
    color: Colors.textLight,
  },
  milestoneMid: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 14,
    marginVertical: 4,
  },
  milestoneBot: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 18,
  },
  emptyMilestones: {
    marginHorizontal: 24,
    marginBottom: 36,
    alignItems: 'center',
    gap: 12,
    paddingVertical: 32,
    backgroundColor: Colors.cardTintPurpleFaint,
    borderRadius: 20,
  },
  emptyMilestonesText: {
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
