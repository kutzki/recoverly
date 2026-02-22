import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth';
import { useProgressStore } from '../../store/progress';
import { useSobrietyTimer } from '../../hooks/useSobrietyTimer';

export default function Profile() {
  const user = useAuthStore(s => s.user);
  const { sobrietyStartDate, tasksCompleted, checkInsCompleted, meetingsAttended } = useProgressStore();
  const timer = useSobrietyTimer(sobrietyStartDate);

  const initial = user?.name?.[0]?.toUpperCase() || 'U';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Profile</Text>
        </View>

        {/* Avatar + Name */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          {user?.username && <Text style={styles.username}>@{user.username}</Text>}
          {user?.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.location}>{user.location}</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Days Sober', value: String(timer.days), icon: 'sunny-outline' as const },
            { label: 'Tasks Done', value: String(tasksCompleted), icon: 'checkbox-outline' as const },
            { label: 'Meetings', value: String(meetingsAttended), icon: 'people-outline' as const },
            { label: 'Check-ins', value: String(checkInsCompleted), icon: 'checkmark-circle-outline' as const },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Ionicons name={s.icon} size={18} color={Colors.primary} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Info rows */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Info</Text>
          {[
            { label: 'Email', value: user?.email || '—', icon: 'mail-outline' as const },
            { label: 'Username', value: user?.username ? `@${user.username}` : '—', icon: 'at-outline' as const },
            { label: 'Location', value: user?.location || '—', icon: 'location-outline' as const },
          ].map((row, i) => (
            <View key={i} style={styles.infoRow}>
              <Ionicons name={row.icon} size={18} color={Colors.primary} style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Goal */}
        {user?.shortTermGoal && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Short-term Goal</Text>
            <View style={styles.goalCard}>
              <Ionicons name="flag" size={18} color={Colors.primary} />
              <Text style={styles.goalText}>{user.shortTermGoal}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20 },
  header: {
    paddingTop: Platform.OS === 'android' ? 20 : 12,
    paddingBottom: 16,
  },
  pageTitle: { fontSize: 24, fontWeight: '700', color: Colors.text },
  profileCard: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 28,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: Colors.primary },
  name: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  username: { fontSize: 15, color: Colors.textMuted, marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { fontSize: 13, color: Colors.textMuted },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 20, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textMuted },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  infoIcon: { width: 24 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 1 },
  infoValue: { fontSize: 14, fontWeight: '600', color: Colors.text },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
  },
  goalText: { flex: 1, fontSize: 14, color: Colors.primary, lineHeight: 22 },
});
