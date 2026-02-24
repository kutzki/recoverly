import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth';
import { useProgressStore } from '../../store/progress';
import { useSobrietyTimer } from '../../hooks/useSobrietyTimer';

const BADGE_DEFS = [
  { days: 1,   label: '24 Hours', emoji: '⭐' },
  { days: 7,   label: '1 Week',   emoji: '🔥' },
  { days: 30,  label: '30 Days',  emoji: '🏆' },
  { days: 60,  label: '60 Days',  emoji: '🥈' },
  { days: 90,  label: '90 Days',  emoji: '🥇' },
  { days: 180, label: '6 Months', emoji: '💎' },
  { days: 365, label: '1 Year',   emoji: '👑' },
];

export default function Profile() {
  const user = useAuthStore(s => s.user);
  const { sobrietyStartDate, tasksCompleted, checkInsCompleted, meetingsAttended } = useProgressStore();
  const timer = useSobrietyTimer(sobrietyStartDate);

  const initial = user?.name?.[0]?.toUpperCase() || 'U';
  const earnedCount = BADGE_DEFS.filter(b => timer.days >= b.days).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push('/(app)/edit-profile' as any)}
            accessibilityLabel="Edit profile"
          >
            <Ionicons name="pencil-outline" size={16} color={Colors.primary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar + Name */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          {user?.username ? <Text style={styles.username}>{user.username.startsWith('@') ? user.username : `@${user.username}`}</Text> : null}
          {user?.location ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.location}>{user.location}</Text>
            </View>
          ) : null}
          {(user as any)?.bio ? (
            <Text style={styles.bio}>{(user as any).bio}</Text>
          ) : null}
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

        {/* Badges */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏅 Badges</Text>
            <Text style={styles.sectionMeta}>{earnedCount}/{BADGE_DEFS.length} earned</Text>
          </View>
          <View style={styles.badgeGrid}>
            {BADGE_DEFS.map(b => {
              const earned = timer.days >= b.days;
              return (
                <View key={b.days} style={styles.badge}>
                  <Text style={[styles.badgeEmoji, !earned && { opacity: 0.2 }]}>{b.emoji}</Text>
                  <Text style={[styles.badgeLabel, !earned && styles.badgeLabelLocked]}>{b.label}</Text>
                  {earned ? (
                    <View style={styles.badgeCheck}>
                      <Ionicons name="checkmark" size={9} color={Colors.white} />
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        {/* Sponsor */}
        {user?.sponsor ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sponsor</Text>
              <TouchableOpacity onPress={() => router.push('/(app)/sponsor' as any)}>
                <Text style={styles.sectionAction}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sponsorCard}>
              <View style={styles.sponsorAvatar}>
                <Text style={styles.sponsorInitial}>{user.sponsor.name?.[0]?.toUpperCase() ?? '?'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sponsorName}>{user.sponsor.name}</Text>
                {user.sponsor.phone ? (
                  <Text style={styles.sponsorPhone}>{user.sponsor.phone}</Text>
                ) : null}
              </View>
              <Ionicons name="hand-right-outline" size={20} color={Colors.primaryLight} />
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addSponsorBtn}
            onPress={() => router.push('/(app)/sponsor' as any)}
          >
            <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.addSponsorText}>Add a Sponsor</Text>
          </TouchableOpacity>
        )}

        {/* Info rows */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Info</Text>
          {[
            { label: 'Email', value: user?.email || '—', icon: 'mail-outline' as const },
            { label: 'Username', value: user?.username ? (user.username.startsWith('@') ? user.username : `@${user.username}`) : '—', icon: 'at-outline' as const },
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
        {user?.shortTermGoal ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Short-term Goal</Text>
            <View style={styles.goalCard}>
              <Ionicons name="flag" size={18} color={Colors.primary} />
              <Text style={styles.goalText}>{user.shortTermGoal}</Text>
            </View>
          </View>
        ) : null}

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  editBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
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
  bio: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  sectionMeta: { fontSize: 13, color: Colors.textMuted },
  sectionAction: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  badge: {
    alignItems: 'center',
    width: 44,
    gap: 3,
    position: 'relative',
  },
  badgeEmoji: { fontSize: 26 },
  badgeLabel: { fontSize: 9, color: Colors.text, textAlign: 'center', fontWeight: '500' },
  badgeLabelLocked: { color: Colors.textMuted },
  badgeCheck: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sponsorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsorInitial: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  sponsorName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  sponsorPhone: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  addSponsorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 48,
    marginBottom: 20,
  },
  addSponsorText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
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
