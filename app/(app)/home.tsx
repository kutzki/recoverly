import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { SobrietyCounter } from '../../components/ui/SobrietyCounter';
import { StreakDots } from '../../components/ui/StreakDots';
import { useAuthStore } from '../../store/auth';
import { useProgressStore } from '../../store/progress';
import { useChecklistStore } from '../../store/checklist';
import { useSobrietyTimer } from '../../hooks/useSobrietyTimer';
import { useDrawer } from '../../components/DrawerContext';
import ChecklistSheet from '../../components/checklists/DailyChecklist';
import JournalSheet from '../../components/journal/JournalEntry';
import BottomSheet from '@gorhom/bottom-sheet';

const QUICK_ACTIONS = [
  { id: 'meeting', label: 'Meeting', icon: 'people-outline' as const, route: '/(app)/meetings' },
  { id: 'awards', label: 'Awards', icon: 'trophy-outline' as const, route: null },
  { id: 'tracker', label: 'Tracker', icon: 'bar-chart-outline' as const, route: '/(app)/tracker' },
  { id: 'checklist', label: 'Checklist', icon: 'checkbox-outline' as const, action: 'checklist' },
  { id: 'journal', label: 'Journal', icon: 'journal-outline' as const, action: 'journal' },
] as const;

export default function Home() {
  const user = useAuthStore(s => s.user);
  const { sobrietyStartDate, weeklyStreak } = useProgressStore();
  const { items: checklistItems } = useChecklistStore();
  const timer = useSobrietyTimer(sobrietyStartDate);
  const { openDrawer } = useDrawer();

  const checklistRef = useRef<BottomSheet>(null);
  const journalRef = useRef<BottomSheet>(null);

  const completedToday = checklistItems.filter(i => i.completed).length;
  const totalTasks = checklistItems.length;

  const handleQuickAction = useCallback((action: typeof QUICK_ACTIONS[number]) => {
    if ('route' in action && action.route) {
      router.push(action.route as any);
    } else if ('action' in action) {
      if (action.action === 'checklist') {
        checklistRef.current?.expand();
      } else if (action.action === 'journal') {
        journalRef.current?.expand();
      }
    }
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome,</Text>
            <Text style={styles.name}>{firstName} 👋</Text>
          </View>
          <TouchableOpacity style={styles.menuBtn} onPress={openDrawer}>
            <Ionicons name="menu" size={26} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Sobriety Counter */}
        <View style={styles.counterCard}>
          <Text style={styles.counterLabel}>Days Sober</Text>
          <SobrietyCounter days={timer.days} size={180} />
          <View style={styles.timerRow}>
            {[
              { val: String(timer.hours).padStart(2, '0'), unit: 'hrs' },
              { val: String(timer.minutes).padStart(2, '0'), unit: 'min' },
              { val: String(timer.seconds).padStart(2, '0'), unit: 'sec' },
            ].map((t, i) => (
              <View key={i} style={styles.timerUnit}>
                <Text style={styles.timerVal}>{t.val}</Text>
                <Text style={styles.timerUnitLabel}>{t.unit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          {QUICK_ACTIONS.map(action => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickAction}
              onPress={() => handleQuickAction(action)}
              activeOpacity={0.75}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name={action.icon} size={22} color={Colors.primary} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily Reminder Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardTextCol}>
              <Text style={styles.cardTitle}>Daily Check-In</Text>
              <Text style={styles.cardSubtitle}>Have you checked in yet today?</Text>
              <StreakDots streak={weeklyStreak} />
            </View>
            <View style={styles.thumbsWrap}>
              <Ionicons name="thumbs-up" size={40} color={Colors.primaryLight} />
            </View>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${totalTasks > 0 ? (completedToday / totalTasks) * 100 : 0}%` },
              ]}
            />
          </View>
          <Text style={styles.progressBarLabel}>
            {completedToday}/{totalTasks} tasks completed today
          </Text>
        </View>

        {/* Upcoming Events */}
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        {[
          {
            org: 'New Connections',
            location: 'Los Angeles County',
            time: 'Tonight · 7:00 PM',
            icon: 'people' as const,
            color: Colors.primary,
          },
          {
            org: 'New Connections',
            location: 'Los Angeles County',
            time: 'Tomorrow · 10:00 AM',
            icon: 'people' as const,
            color: Colors.accent,
          },
        ].map((event, i) => (
          <TouchableOpacity
            key={i}
            style={styles.eventCard}
            onPress={() => router.push('/(app)/meetings' as any)}
            activeOpacity={0.85}
          >
            <View style={[styles.eventIcon, { backgroundColor: event.color + '22' }]}>
              <Ionicons name={event.icon} size={22} color={event.color} />
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventOrg}>{event.org}</Text>
              <Text style={styles.eventLocation}>{event.location}</Text>
              <Text style={styles.eventTime}>{event.time}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Bottom Sheets */}
      <ChecklistSheet ref={checklistRef} />
      <JournalSheet ref={journalRef} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 20,
  },
  greeting: { fontSize: 15, color: Colors.textMuted },
  name: { fontSize: 24, fontWeight: '700', color: Colors.text, marginTop: 2 },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },

  // Counter card
  counterCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  counterLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  timerRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 16,
  },
  timerUnit: { alignItems: 'center' },
  timerVal: { fontSize: 22, fontWeight: '700', color: Colors.text },
  timerUnitLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },

  // Quick actions
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickAction: { alignItems: 'center', gap: 6 },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  quickActionLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },

  // Daily reminder card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardTextCol: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 3 },
  cardSubtitle: { fontSize: 13, color: Colors.textMuted },
  thumbsWrap: { paddingLeft: 12 },
  progressBarTrack: {
    height: 4,
    backgroundColor: Colors.primaryLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressBarLabel: { fontSize: 12, color: Colors.textMuted },

  // Events
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  eventIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: { flex: 1 },
  eventOrg: { fontSize: 14, fontWeight: '700', color: Colors.text },
  eventLocation: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  eventTime: { fontSize: 12, color: Colors.primary, marginTop: 2, fontWeight: '500' },
});
