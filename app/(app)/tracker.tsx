import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo, useEffect } from 'react';
import { useProgressStore } from '../../store/progress';
import { useAuthStore } from '../../store/auth';
import { SobrietyCounter } from '../../components/ui/SobrietyCounter';
import { StreakDots } from '../../components/ui/StreakDots';
import { MilestoneCard } from '../../components/ui/MilestoneCard';
import { CalendarGrid } from '../../components/ui/CalendarGrid';
import { CelebrationModal } from '../../components/ui/CelebrationModal';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

export default function TrackerScreen() {
  const insets = useSafeAreaInsets();
  const sobrietyStartDate = useProgressStore((s) => s.sobrietyStartDate);
  const weeklyStreak      = useProgressStore((s) => s.weeklyStreak);
  const tasksCompleted    = useProgressStore((s) => s.tasksCompleted);
  const tasksTarget       = useProgressStore((s) => s.tasksTarget);
  const checkInsCompleted = useProgressStore((s) => s.checkInsCompleted);
  const meetingsAttended  = useProgressStore((s) => s.meetingsAttended);

  const checkinHistory = useProgressStore((s) => s.checkinHistory);
  const loadAllHistory = useProgressStore((s) => s.loadAllHistory);
  const user           = useAuthStore((s) => s.user);

  const daysSober = useMemo(() => {
    if (!sobrietyStartDate) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(sobrietyStartDate).getTime()) / 86_400_000));
  }, [sobrietyStartDate]);

  useEffect(() => {
    if (user?.id) loadAllHistory(user.id);
  }, [user?.id]);

  const checkedDates = useMemo(() => new Set(checkinHistory), [checkinHistory]);

  const progressPct = Math.min(tasksCompleted / tasksTarget, 1);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Your Progress</Text>

      <View style={styles.arcWrapper}>
        <SobrietyCounter daysSober={daysSober} size={220} />
      </View>

      {/* Weekly streak */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weekly Check-ins</Text>
        <StreakDots streak={weeklyStreak} />
        <Text style={styles.cardSub}>{weeklyStreak.filter(Boolean).length} of 7 days this week</Text>
      </View>

      {/* Check-in History calendar */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Check-in History</Text>
        <CalendarGrid checkedDates={checkedDates} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Tasks Done', value: tasksCompleted },
          { label: 'Check-ins',  value: checkInsCompleted },
          { label: 'Meetings',   value: meetingsAttended },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Milestones */}
      <Text style={styles.sectionLabel}>Milestones</Text>
      <MilestoneCard daysSober={daysSober} />

      <CelebrationModal daysSober={daysSober} userId={user?.id ?? null} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingHorizontal: 24 },

  heading:    { fontFamily: Fonts.poppinsBold, fontSize: 24, color: Colors.text, marginBottom: 12 },
  arcWrapper: { alignItems: 'center', marginBottom: 20 },

  card:      { backgroundColor: Colors.cardTintPurpleFaint, borderRadius: 14, padding: 16, marginBottom: 16, gap: 12 },
  cardTitle: { fontFamily: Fonts.poppinsSemiBold, fontSize: 15, color: Colors.text },
  cardSub:   { fontFamily: Fonts.jost, fontSize: 13, color: Colors.textMuted },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: Colors.cardTintPurpleFaint, borderRadius: 12, padding: 14, alignItems: 'center', gap: 4 },
  statValue:{ fontFamily: Fonts.poppinsBold, fontSize: 24, color: Colors.primary },
  statLabel:{ fontFamily: Fonts.jost, fontSize: 12, color: Colors.textMuted, textAlign: 'center' },

  sectionLabel: { fontFamily: Fonts.poppinsSemiBold, fontSize: 16, color: Colors.text, marginBottom: 12 },
});
