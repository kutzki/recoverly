import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { SobrietyCounter } from '../../components/ui/SobrietyCounter';
import { MilestoneCard } from '../../components/ui/MilestoneCard';
import { useProgressStore } from '../../store/progress';
import { useSobrietyTimer } from '../../hooks/useSobrietyTimer';
import { useAuthStore } from '../../store/auth';
import { postActivity } from '../../services/streamFeed';

const MILESTONES = [
  { label: 'First day sober',  days: 1,  icon: 'star-outline'   as const, variant: 'grey'   as const },
  { label: '7 days sober',     days: 7,  icon: 'flame-outline'  as const, variant: 'purple' as const },
  { label: 'Thirty days sober',days: 30, icon: 'trophy-outline' as const, variant: 'cyan'   as const },
  { label: 'Sixty days sober', days: 60, icon: 'medal-outline'  as const, variant: 'cyan'   as const },
  { label: 'Ninety days sober',days: 90, icon: 'ribbon-outline' as const, variant: 'cyan'   as const },
];

function getMilestoneDate(sobrietyStartDate: string | null | undefined, days: number): string {
  if (!sobrietyStartDate) return '—';
  const start = new Date(sobrietyStartDate);
  if (isNaN(start.getTime())) return '—';
  const target = new Date(start);
  target.setDate(target.getDate() + days);
  return target.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

const MILESTONE_MESSAGES: Record<number, string> = {
  1:  'Incredible!',
  7:  'Keep it up!',
  30: "You're a rockstar!",
  60: 'You are unstoppable!',
  90: 'Legend status!',
};

export default function Tracker() {
  const {
    sobrietyStartDate,
    tasksCompleted, tasksTarget,
    checkInsCompleted, checkInsTarget,
    meetingsAttended, meetingsTarget,
  } = useProgressStore();
  const timer = useSobrietyTimer(sobrietyStartDate);
  const { user } = useAuthStore();
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (sharing) return;
    if (!user) {
      Alert.alert('Share', `I've been sober for ${timer.days} days using Recoverly! 💜`);
      return;
    }
    setSharing(true);
    try {
      await postActivity({
        text: `🎯 I've been sober for ${timer.days} day${timer.days === 1 ? '' : 's'}! 💜 #recovery`,
        type: 'milestone',
        userId: user.id,
        userName: user.name,
      });
      Alert.alert('Posted! 🎉', 'Your milestone has been shared to the community feed.', [
        { text: 'View Feed', onPress: () => router.push('/(app)/feed' as any) },
        { text: 'OK' },
      ]);
    } catch {
      Alert.alert(
        'Could not post to feed',
        'Your connection may be unavailable. Share manually instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Share',
            onPress: () => {
              Share.share({ message: `I've been sober for ${timer.days} days using Recoverly! 💜 #recovery` }).catch(() => {});
            },
          },
        ]
      );
    } finally {
      setSharing(false);
    }
  };

  const STATS = [
    { label: 'Tasks Completed',   done: tasksCompleted,   total: tasksTarget,    icon: 'checkbox-outline'         as const },
    { label: 'Check-ins',         done: checkInsCompleted, total: checkInsTarget, icon: 'checkmark-circle-outline' as const },
    { label: 'Meetings Attended', done: meetingsAttended,  total: meetingsTarget, icon: 'people-outline'           as const },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Gradient hero header ── */}
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary, Colors.primaryMid]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>

          <View style={styles.heroBadge}>
            <Ionicons name="trophy" size={28} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>Track Progress</Text>
          <Text style={styles.heroSub}>You're doing amazing, keep it up! 🎉</Text>
        </LinearGradient>

        {/* ── Sobriety timer card ── */}
        <View style={styles.timerCard}>
          <SobrietyCounter days={timer.days} size={190} />
          <View style={styles.timerGrid}>
            {[
              { label: 'Days',    value: String(timer.days).padStart(2, '0') },
              { label: 'Hours',   value: String(timer.hours).padStart(2, '0') },
              { label: 'Minutes', value: String(timer.minutes).padStart(2, '0') },
              { label: 'Seconds', value: String(timer.seconds).padStart(2, '0') },
            ].map((t, i) => (
              <View key={i} style={styles.timerCell}>
                <Text style={styles.timerValue}>{t.value}</Text>
                <Text style={styles.timerLabel}>{t.label}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.shareBtn, sharing && { opacity: 0.6 }]}
            onPress={handleShare}
            disabled={sharing}
          >
            {sharing ? (
              <>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.shareText}>Sharing…</Text>
              </>
            ) : (
              <>
                <Text style={styles.shareText}>Share now</Text>
                <Ionicons name="share-outline" size={16} color={Colors.primary} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Weekly Report ── */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>Weekly Report</Text>
        </View>
        <View style={styles.statsCard}>
          {STATS.map((stat, i) => (
            <React.Fragment key={i}>
              <View style={styles.statRow}>
                <View style={styles.statIconWrap}>
                  <Ionicons name={stat.icon} size={18} color={Colors.primary} />
                </View>
                <View style={styles.statInfo}>
                  <View style={styles.statHeader}>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                    <Text style={styles.statValue}>
                      <Text style={styles.statDone}>{stat.done}</Text>
                      <Text style={styles.statSlash}>/{stat.total}</Text>
                    </Text>
                  </View>
                  <View style={styles.statTrack}>
                    <View
                      style={[
                        styles.statFill,
                        { width: `${stat.total > 0 ? Math.min((stat.done / stat.total) * 100, 100) : 0}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>
              {i < STATS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Milestones ── */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>Milestones</Text>
        </View>
        {MILESTONES.map(m => (
          <MilestoneCard
            key={m.days}
            label={m.label}
            subtitle={`${MILESTONE_MESSAGES[m.days]} ${m.days} day${m.days > 1 ? 's' : ''} sober`}
            date={getMilestoneDate(sobrietyStartDate, m.days)}
            icon={m.icon}
            variant={m.variant}
            unlocked={timer.days >= m.days}
          />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 20 },

  /* ── Hero ── */
  hero: {
    paddingTop: Platform.OS === 'android' ? 50 : 58,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 12 : 56,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: Fonts.generalSansBold,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  /* ── Timer card ── */
  timerCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  timerGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  timerCell:  { alignItems: 'center', minWidth: 64 },
  timerValue: { fontSize: 28, fontFamily: Fonts.generalSansBold, color: Colors.text },
  timerLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  shareText: { color: Colors.primary, fontFamily: Fonts.generalSansSemiBold, fontSize: 14 },

  /* ── Section label ── */
  sectionLabel: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 10 },
  sectionLabelText: {
    fontSize: 17,
    fontFamily: Fonts.generalSansBold,
    color: Colors.text,
  },

  /* ── Stats flat card ── */
  statsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo:   { flex: 1 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  statLabel:  { fontSize: 14, fontFamily: Fonts.generalSansSemiBold, color: Colors.text },
  statValue:  {},
  statDone:   { fontSize: 14, fontFamily: Fonts.generalSansBold, color: Colors.primary },
  statSlash:  { fontSize: 13, color: Colors.textMuted },
  statTrack: {
    height: 5,
    backgroundColor: Colors.primaryLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  statFill: {
    height: 5,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: 68,
  },
});
