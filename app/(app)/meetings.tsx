import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

// Returns "Today", "Tomorrow", or the day name for a given day-of-week (0=Sun)
function getRelativeDayLabel(targetDow: number): string {
  const todayDow = new Date().getDay();
  const diff = (targetDow - todayDow + 7) % 7;
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][targetDow];
}

const MEETINGS = [
  {
    id: '1',
    org: 'New Connections – AA',
    type: 'aa',
    dow: 1, // Monday
    time: '7:00 PM',
    address: 'Find a local meeting at aa.org',
    format: 'In-Person',
    color: Colors.primary,
    url: 'https://www.aa.org/find-a-meeting',
  },
  {
    id: '2',
    org: 'New Connections – AA',
    type: 'aa',
    dow: 3, // Wednesday
    time: '10:00 AM',
    address: 'Find a local meeting at aa.org',
    format: 'Hybrid',
    color: Colors.primary,
    url: 'https://www.aa.org/find-a-meeting',
  },
  {
    id: '3',
    org: 'Narcotics Anonymous',
    type: 'na',
    dow: 4, // Thursday
    time: '6:30 PM',
    address: 'Find a local meeting at na.org',
    format: 'Online',
    color: Colors.accent,
    url: 'https://www.na.org/meetingsearch/',
  },
  {
    id: '4',
    org: 'SMART Recovery',
    type: 'smart',
    dow: 5, // Friday
    time: '12:00 PM',
    address: 'Find a local meeting at smartrecovery.org',
    format: 'In-Person',
    color: Colors.success,
    url: 'https://www.smartrecovery.org/community/calendar.php',
  },
  {
    id: '5',
    org: 'Narcotics Anonymous – Online',
    type: 'na',
    dow: 6, // Saturday
    time: '8:00 PM',
    address: 'Online via na.org',
    format: 'Online',
    color: Colors.accent,
    url: 'https://www.na.org/meetingsearch/',
  },
];

type FilterType = 'all' | 'aa' | 'na' | 'online';

export default function Meetings() {
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = MEETINGS.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'online') return m.format === 'Online';
    return m.type === filter;
  });

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Could not open the link. Please try again.')
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Meetings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Info banner */}
        <View style={styles.noticeBanner}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
          <Text style={styles.noticeText}>
            Tap any meeting card to find real meetings near you via the official website.
          </Text>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
          {([
            { key: 'all' as FilterType, label: 'All' },
            { key: 'aa' as FilterType, label: 'AA' },
            { key: 'na' as FilterType, label: 'NA' },
            { key: 'online' as FilterType, label: 'Online' },
          ]).map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterActiveText]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>
          {filter === 'all' ? 'All Meetings' : filter === 'online' ? 'Online Meetings' : filter.toUpperCase() + ' Meetings'}
        </Text>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={44} color={Colors.primaryLight} />
            <Text style={styles.emptyText}>No meetings match this filter.</Text>
          </View>
        ) : (
          filtered.map(meeting => (
            <TouchableOpacity
              key={meeting.id}
              style={styles.meetingCard}
              activeOpacity={0.85}
              onPress={() => openUrl(meeting.url)}
            >
              <View style={[styles.meetingBadge, { backgroundColor: meeting.color }]}>
                <Text style={styles.meetingBadgeText}>{meeting.type.toUpperCase()}</Text>
              </View>
              <View style={styles.meetingInfo}>
                <Text style={styles.meetingOrg} numberOfLines={1}>{meeting.org}</Text>
                <View style={styles.meetingMeta}>
                  <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
                  <Text style={styles.meetingTime}>
                    {getRelativeDayLabel(meeting.dow)} · {meeting.time}
                  </Text>
                </View>
                <View style={styles.meetingMeta}>
                  <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
                  <Text style={styles.meetingAddress} numberOfLines={1}>{meeting.address}</Text>
                </View>
                <View style={styles.formatChip}>
                  <Text style={styles.formatText}>{meeting.format}</Text>
                </View>
              </View>
              <Ionicons name="open-outline" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))
        )}

        {/* Find more */}
        <View style={styles.findMoreSection}>
          <Text style={styles.findMoreTitle}>Find More Meetings</Text>
          {[
            { label: 'AA Meeting Finder', url: 'https://www.aa.org/find-a-meeting', color: Colors.primary },
            { label: 'NA Meeting Search', url: 'https://www.na.org/meetingsearch/', color: Colors.accent },
            { label: 'SMART Recovery Calendar', url: 'https://www.smartrecovery.org/community/calendar.php', color: Colors.success },
          ].map(link => (
            <TouchableOpacity
              key={link.label}
              style={styles.findMoreCard}
              onPress={() => openUrl(link.url)}
              activeOpacity={0.85}
            >
              <Ionicons name="globe-outline" size={18} color={link.color} />
              <Text style={[styles.findMoreLabel, { color: link.color }]}>{link.label}</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

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
  scroll: { padding: 20 },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  noticeText: { flex: 1, fontSize: 13, color: Colors.primaryDark, lineHeight: 19 },
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
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 14, color: Colors.textMuted },
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
  findMoreSection: { marginTop: 24 },
  findMoreTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  findMoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  findMoreLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
});
