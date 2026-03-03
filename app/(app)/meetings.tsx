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
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

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
    dow: 1,
    time: '7:00 PM',
    address: 'Find a local meeting at aa.org',
    format: 'In-Person',
    icon: 'people-outline' as const,
    color: Colors.primary,
    url: 'https://www.aa.org/find-a-meeting',
  },
  {
    id: '2',
    org: 'New Connections – AA',
    type: 'aa',
    dow: 3,
    time: '10:00 AM',
    address: 'Find a local meeting at aa.org',
    format: 'Hybrid',
    icon: 'people-outline' as const,
    color: Colors.primary,
    url: 'https://www.aa.org/find-a-meeting',
  },
  {
    id: '3',
    org: 'Narcotics Anonymous',
    type: 'na',
    dow: 4,
    time: '6:30 PM',
    address: 'Find a local meeting at na.org',
    format: 'Online',
    icon: 'globe-outline' as const,
    color: Colors.accent,
    url: 'https://www.na.org/meetingsearch/',
  },
  {
    id: '4',
    org: 'SMART Recovery',
    type: 'smart',
    dow: 5,
    time: '12:00 PM',
    address: 'Find a local meeting at smartrecovery.org',
    format: 'In-Person',
    icon: 'bulb-outline' as const,
    color: Colors.success,
    url: 'https://www.smartrecovery.org/community/calendar.php',
  },
  {
    id: '5',
    org: 'Narcotics Anonymous – Online',
    type: 'na',
    dow: 6,
    time: '8:00 PM',
    address: 'Online via na.org',
    format: 'Online',
    icon: 'globe-outline' as const,
    color: Colors.accent,
    url: 'https://www.na.org/meetingsearch/',
  },
];

type FilterType = 'all' | 'aa' | 'na' | 'online';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all',    label: 'All' },
  { key: 'aa',     label: 'AA' },
  { key: 'na',     label: 'NA' },
  { key: 'online', label: 'Online' },
];

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
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Gradient hero header ── */}
        <LinearGradient
          colors={['#7B2FE0', '#9747FF', '#C084FC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>

          <View style={styles.heroBadge}>
            <Ionicons name="calendar" size={28} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>Meetings</Text>
          <Text style={styles.heroSub}>Active meetings happening right now</Text>
        </LinearGradient>

        {/* ── Filter chips ── */}
        <View style={styles.filtersWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersList}>
            {FILTERS.map(f => (
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
        </View>

        {/* ── Section label ── */}
        <View style={styles.sectionLabelWrap}>
          <Text style={styles.sectionLabel}>
            {filter === 'all' ? 'All Meetings' : filter === 'online' ? 'Online Meetings' : filter.toUpperCase() + ' Meetings'}
          </Text>
          <Text style={styles.sectionCount}>{filtered.length} results</Text>
        </View>

        {/* ── Meeting cards ── */}
        <View style={styles.cardsList}>
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
                {/* Icon badge */}
                <View style={[styles.meetingIconWrap, { backgroundColor: meeting.color + '18' }]}>
                  <Ionicons name={meeting.icon} size={26} color={meeting.color} />
                </View>

                {/* Info */}
                <View style={styles.meetingInfo}>
                  <Text style={styles.meetingOrg} numberOfLines={1}>{meeting.org}</Text>
                  <View style={styles.meetingMetaRow}>
                    <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
                    <Text style={styles.meetingMetaText}>
                      {getRelativeDayLabel(meeting.dow)} · {meeting.time}
                    </Text>
                  </View>
                  <View style={styles.meetingMetaRow}>
                    <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                    <Text style={styles.meetingMetaText} numberOfLines={1}>{meeting.address}</Text>
                  </View>
                  <View style={[styles.formatBadge, { backgroundColor: meeting.color + '18' }]}>
                    <Text style={[styles.formatText, { color: meeting.color }]}>{meeting.format}</Text>
                  </View>
                </View>

                {/* Active dot + external link */}
                <View style={styles.meetingRight}>
                  <View style={[styles.activeDot, { backgroundColor: meeting.format === 'Online' ? Colors.success : meeting.color }]} />
                  <Ionicons name="open-outline" size={16} color={Colors.textMuted} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* ── Find More Meetings ── */}
        <View style={styles.sectionLabelWrap}>
          <Text style={styles.sectionLabel}>Find More Meetings</Text>
        </View>
        <View style={styles.cardsList}>
          {[
            { label: 'AA Meeting Finder',          url: 'https://www.aa.org/find-a-meeting',                           color: Colors.primary, icon: 'people-outline' as const },
            { label: 'NA Meeting Search',           url: 'https://www.na.org/meetingsearch/',                           color: Colors.accent,  icon: 'globe-outline' as const },
            { label: 'SMART Recovery Calendar',    url: 'https://www.smartrecovery.org/community/calendar.php',        color: Colors.success, icon: 'bulb-outline' as const },
          ].map(link => (
            <TouchableOpacity
              key={link.label}
              style={styles.linkCard}
              onPress={() => openUrl(link.url)}
              activeOpacity={0.85}
            >
              <View style={[styles.linkIconWrap, { backgroundColor: link.color + '18' }]}>
                <Ionicons name={link.icon} size={20} color={link.color} />
              </View>
              <Text style={[styles.linkLabel, { color: link.color }]}>{link.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 32 }} />
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

  /* ── Filters ── */
  filtersWrap: {
    paddingTop: 16,
    paddingBottom: 4,
    backgroundColor: Colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  filtersList: { paddingHorizontal: 16, gap: 8 },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 13, color: Colors.textMuted, fontFamily: Fonts.generalSansMedium },
  filterActiveText: { color: Colors.white, fontFamily: Fonts.generalSansBold },

  /* ── Section labels ── */
  sectionLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionLabel: {
    fontSize: 15,
    fontFamily: Fonts.generalSansBold,
    color: Colors.text,
  },
  sectionCount: {
    fontSize: 13,
    color: Colors.textMuted,
  },

  /* ── Cards list ── */
  cardsList: { paddingHorizontal: 20, gap: 10 },

  /* ── Meeting card ── */
  meetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  meetingIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meetingInfo: { flex: 1 },
  meetingOrg: { fontSize: 14, fontFamily: Fonts.generalSansBold, color: Colors.text, marginBottom: 4 },
  meetingMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  meetingMetaText: { flex: 1, fontSize: 12, color: Colors.textMuted },
  formatBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  formatText: { fontSize: 11, fontFamily: Fonts.generalSansBold },
  meetingRight: { alignItems: 'center', gap: 8 },
  activeDot: { width: 7, height: 7, borderRadius: 4 },

  /* ── Link card ── */
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  linkIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkLabel: { flex: 1, fontSize: 14, fontFamily: Fonts.generalSansSemiBold },

  /* ── Empty ── */
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 14, color: Colors.textMuted },
});
