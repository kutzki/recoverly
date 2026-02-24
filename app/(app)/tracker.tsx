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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { SobrietyCounter } from '../../components/ui/SobrietyCounter';
import { MilestoneCard } from '../../components/ui/MilestoneCard';
import { useProgressStore } from '../../store/progress';
import { useSobrietyTimer } from '../../hooks/useSobrietyTimer';
import { useAuthStore } from '../../store/auth';
import { postActivity } from '../../services/streamFeed';

const MILESTONES = [
  { label: 'First day sober', days: 1, icon: 'star-outline' as const, variant: 'grey' as const },
  { label: '7 days sober', days: 7, icon: 'flame-outline' as const, variant: 'purple' as const },
  { label: 'Thirty days sober', days: 30, icon: 'trophy-outline' as const, variant: 'cyan' as const },
  { label: 'Sixty days sober', days: 60, icon: 'medal-outline' as const, variant: 'cyan' as const },
  { label: 'Ninety days sober', days: 90, icon: 'ribbon-outline' as const, variant: 'cyan' as const },
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
  1: 'Incredible!',
  7: 'Keep it up!',
  30: "You're a rockstar!",
  60: 'You are unstoppable!',
  90: 'Legend status!',
};

export default function Tracker() {
  const { sobrietyStartDate, tasksCompleted, tasksTarget, checkInsCompleted, checkInsTarget, meetingsAttended, meetingsTarget } = useProgressStore();
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

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Progress</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Motivational */}
        <Text style={styles.motivation}>You're doing amazing, keep up the great work! 🎉</Text>

        {/* Timer */}
        <View style={styles.timerCard}>
          <SobrietyCounter days={timer.days} size={190} />
          <View style={styles.timerGrid}>
            {[
              { label: 'Days', value: String(timer.days).padStart(2, '0') },
              { label: 'Hours', value: String(timer.hours).padStart(2, '0') },
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

        {/* Weekly Report */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Report</Text>
          <View style={styles.statsGrid}>
            {[
              { label: 'Tasks Completed', done: tasksCompleted, total: tasksTarget, icon: 'checkbox-outline' as const },
              { label: 'Check-ins', done: checkInsCompleted, total: checkInsTarget, icon: 'checkmark-circle-outline' as const },
              { label: 'Meetings Attended', done: meetingsAttended, total: meetingsTarget, icon: 'people-outline' as const },
            ].map((stat, i) => (
              <View key={i} style={styles.statCard}>
                <View style={styles.statIconWrap}>
                  <Ionicons name={stat.icon} size={20} color={Colors.primary} />
                </View>
                <Text style={styles.statValue}>
                  <Text style={styles.statDone}>{stat.done}</Text>
                  <Text style={styles.statSlash}>/{stat.total}</Text>
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <View style={styles.statTrack}>
                  <View
                    style={[
                      styles.statFill,
                      { width: `${(stat.done / stat.total) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Milestones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Milestones</Text>
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
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  motivation: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  timerCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
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
  timerCell: { alignItems: 'center', minWidth: 64 },
  timerValue: { fontSize: 28, fontWeight: '700', color: Colors.text },
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
  shareText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  statsGrid: { gap: 10 },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: { marginBottom: 2 },
  statDone: { fontSize: 22, fontWeight: '700', color: Colors.primary },
  statSlash: { fontSize: 16, color: Colors.textMuted },
  statLabel: { fontSize: 13, color: Colors.textMuted, marginBottom: 8 },
  statTrack: {
    height: 4,
    backgroundColor: Colors.primaryLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  statFill: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
});
