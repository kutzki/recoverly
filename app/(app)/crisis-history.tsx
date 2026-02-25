import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { getCrisisHistory, CrisisIncident } from '../../services/supabase';
import { useAuthStore } from '../../store/auth';

const TYPE_MAP: Record<string, { label: string; icon: string; color: string }> = {
  'feel-like-using': { label: 'Felt Like Using',   icon: 'alert-circle-outline',   color: '#FF6B6B' },
  'just-relapsed':   { label: 'Just Relapsed',      icon: 'refresh-circle-outline', color: '#FF9F43' },
  'self-harm':       { label: 'Self-Harm',           icon: 'heart-dislike-outline',  color: '#EE5A24' },
  'bad-day':         { label: 'Bad Day',             icon: 'cloudy-outline',         color: '#778CA3' },
  'feeling-anxious': { label: 'Feeling Anxious',    icon: 'pulse-outline',          color: '#A55EEA' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: diffDays > 365 ? 'numeric' : undefined });
}

export default function CrisisHistory() {
  const { user } = useAuthStore();
  const userId = user?.id ?? null;

  const [incidents, setIncidents] = useState<CrisisIncident[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const data = await getCrisisHistory(userId, 50);
      setIncidents(data);
    } catch {
      // fail silently — keep previous data on screen
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  // Type frequency summary
  const summary: Record<string, number> = {};
  incidents.forEach(inc => {
    summary[inc.incident_type] = (summary[inc.incident_type] || 0) + 1;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Crisis History</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : incidents.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="checkmark-circle-outline" size={60} color="#10B981" />
          <Text style={styles.emptyTitle}>No crisis events logged</Text>
          <Text style={styles.emptySub}>
            When you use the SOS screen, your crisis events are logged here to help you identify patterns and triggers.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Crisis Type Breakdown</Text>
            <View style={styles.summaryRows}>
              {Object.entries(summary).map(([type, count]) => {
                const meta = TYPE_MAP[type] || { label: type, icon: 'help-circle-outline', color: Colors.textMuted };
                return (
                  <View key={type} style={styles.summaryRow}>
                    <View style={[styles.summaryIcon, { backgroundColor: meta.color + '22' }]}>
                      <Ionicons name={meta.icon as any} size={16} color={meta.color} />
                    </View>
                    <Text style={styles.summaryLabel}>{meta.label}</Text>
                    <View style={[styles.countBadge, { backgroundColor: meta.color + '22' }]}>
                      <Text style={[styles.countText, { color: meta.color }]}>{count}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <Text style={styles.historyTitle}>Full History</Text>
          {incidents.map(inc => {
            const meta = TYPE_MAP[inc.incident_type] || { label: inc.incident_type, icon: 'help-circle-outline', color: Colors.textMuted };
            return (
              <View key={inc.id} style={styles.incidentCard}>
                <View style={[styles.incidentIcon, { backgroundColor: meta.color + '22' }]}>
                  <Ionicons name={meta.icon as any} size={20} color={meta.color} />
                </View>
                <View style={styles.incidentBody}>
                  <Text style={styles.incidentType}>{meta.label}</Text>
                  <Text style={styles.incidentDate}>{formatDate(inc.created_at)}</Text>
                  {inc.actions_completed.length > 0 && (
                    <View style={styles.actionsRow}>
                      {inc.actions_completed.map((a, i) => (
                        <View key={i} style={styles.actionPill}>
                          <Ionicons name="checkmark" size={11} color={Colors.primary} />
                          <Text style={styles.actionText}>{a}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {inc.notes && <Text style={styles.notes}>{inc.notes}</Text>}
                </View>
              </View>
            );
          })}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  emptySub: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 21 },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  summaryRows: { gap: 10 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  summaryLabel: { flex: 1, fontSize: 14, color: Colors.text },
  countBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  countText: { fontSize: 13, fontWeight: '700' },
  historyTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  incidentCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  incidentIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  incidentBody: { flex: 1 },
  incidentType: { fontSize: 14, fontWeight: '700', color: Colors.text },
  incidentDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  actionText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  notes: { fontSize: 12, color: Colors.textMuted, marginTop: 6, fontStyle: 'italic' },
});
