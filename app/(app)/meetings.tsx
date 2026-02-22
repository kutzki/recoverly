import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

const MOCK_MEETINGS = [
  {
    id: '1',
    org: 'New Connections – Los Angeles County',
    type: 'AA',
    day: 'Tonight',
    time: '7:00 PM',
    address: '123 Recovery Ave, Los Angeles, CA',
    format: 'In-Person',
    color: Colors.primary,
  },
  {
    id: '2',
    org: 'New Connections – Los Angeles County',
    type: 'AA',
    day: 'Tomorrow',
    time: '10:00 AM',
    address: '456 Serenity St, Los Angeles, CA',
    format: 'Hybrid',
    color: Colors.accent,
  },
  {
    id: '3',
    org: 'Narcotics Anonymous',
    type: 'NA',
    day: 'Thursday',
    time: '6:30 PM',
    address: '789 Hope Blvd, Los Angeles, CA',
    format: 'Online',
    color: Colors.success,
  },
  {
    id: '4',
    org: 'SMART Recovery',
    type: 'SR',
    day: 'Friday',
    time: '12:00 PM',
    address: '321 Wellness Way, Los Angeles, CA',
    format: 'In-Person',
    color: Colors.warning,
  },
];

export default function Meetings() {
  const [filter, setFilter] = useState<'all' | 'aa' | 'na' | 'online'>('all');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Meetings</Text>
        <TouchableOpacity style={styles.mapBtn}>
          <Ionicons name="map-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Map placeholder */}
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={48} color={Colors.primaryLight} />
          <Text style={styles.mapLabel}>Map view coming soon</Text>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
          {(['all', 'aa', 'na', 'online'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterActiveText]}>
                {f === 'all' ? 'All' : f === 'aa' ? 'AA' : f === 'na' ? 'NA' : 'Online'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Upcoming Meetings</Text>
        {MOCK_MEETINGS.map(meeting => (
          <TouchableOpacity key={meeting.id} style={styles.meetingCard} activeOpacity={0.85}>
            <View style={[styles.meetingBadge, { backgroundColor: meeting.color }]}>
              <Text style={styles.meetingBadgeText}>{meeting.type}</Text>
            </View>
            <View style={styles.meetingInfo}>
              <Text style={styles.meetingOrg} numberOfLines={1}>{meeting.org}</Text>
              <View style={styles.meetingMeta}>
                <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
                <Text style={styles.meetingTime}>{meeting.day} · {meeting.time}</Text>
              </View>
              <View style={styles.meetingMeta}>
                <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
                <Text style={styles.meetingAddress} numberOfLines={1}>{meeting.address}</Text>
              </View>
              <View style={styles.formatChip}>
                <Text style={styles.formatText}>{meeting.format}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
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
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  mapBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20 },
  mapPlaceholder: {
    height: 140,
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  mapLabel: { fontSize: 13, color: Colors.textMuted },
  filtersRow: { marginBottom: 20 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  filterActiveText: { color: Colors.white, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  meetingCard: {
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
  meetingBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meetingBadgeText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  meetingInfo: { flex: 1 },
  meetingOrg: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  meetingMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  meetingTime: { fontSize: 12, color: Colors.textMuted },
  meetingAddress: { flex: 1, fontSize: 12, color: Colors.textMuted },
  formatChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  formatText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
});
