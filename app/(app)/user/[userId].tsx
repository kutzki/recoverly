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
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { useAuthStore } from '../../../store/auth';
import { getPublicProfile, SupabaseProfile } from '../../../services/supabase';
import { getOrCreateDMChannel } from '../../../services/streamChat';
import { followUser } from '../../../services/streamFeed';

const BADGE_DEFS = [
  { days: 1,   icon: 'star',     label: '1 Day',       color: '#888888' },
  { days: 7,   icon: 'flame',    label: '1 Week',      color: '#9747FF' },
  { days: 30,  icon: 'trophy',   label: '1 Month',     color: '#06B6D4' },
  { days: 60,  icon: 'medal',    label: '2 Months',    color: '#06B6D4' },
  { days: 90,  icon: 'ribbon',   label: '3 Months',    color: '#F59E0B' },
  { days: 180, icon: 'diamond',  label: '6 Months',    color: '#EF4444' },
  { days: 365, icon: 'planet',   label: '1 Year',      color: '#8B5CF6' },
];

function getDaysSober(sobrietyStartDate?: string | null): number {
  if (!sobrietyStartDate) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(sobrietyStartDate).getTime()) / 86400000));
}

export default function UserProfile() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [following, setFollowing] = useState(false);

  const isOwnProfile = currentUser?.id === userId;

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    const p = await getPublicProfile(userId);
    setProfile(p);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleMessage = async () => {
    if (!currentUser) return;
    setMessaging(true);
    try {
      const channel = await getOrCreateDMChannel(currentUser.id, userId!);
      router.push({ pathname: '/(app)/chat/[cid]' as any, params: { cid: channel.cid } });
    } catch {
      Alert.alert('Error', 'Could not open chat. Please try again.');
    } finally {
      setMessaging(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || followed) return;
    setFollowing(true);
    try {
      await followUser(currentUser.id, userId!);
      setFollowed(true);
    } catch {
      Alert.alert('Error', 'Could not follow user.');
    } finally {
      setFollowing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.centered}>
          <Ionicons name="person-outline" size={52} color={Colors.primaryLight} />
          <Text style={styles.notFoundText}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initial = profile.name?.[0]?.toUpperCase() || '?';
  const daysSober = getDaysSober(profile.sobriety_start_date);
  const unlockedBadges = BADGE_DEFS.filter(b => daysSober >= b.days);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar + Name */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.name}>{profile.name || 'Anonymous'}</Text>
          {profile.username && <Text style={styles.username}>@{profile.username.replace('@', '')}</Text>}
          {profile.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.location}>{profile.location}</Text>
            </View>
          )}

          {/* Sobriety badge */}
          <View style={styles.sobrietyBadge}>
            <Ionicons name="sunny" size={16} color={Colors.primary} />
            <Text style={styles.sobrietyText}>
              {daysSober === 0 ? 'Starting their journey' : `${daysSober} day${daysSober !== 1 ? 's' : ''} sober`}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        {isOwnProfile ? (
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/(app)/edit-profile' as any)}>
            <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.messageBtn}
              onPress={handleMessage}
              disabled={messaging}
              activeOpacity={0.85}
            >
              {messaging
                ? <ActivityIndicator size="small" color={Colors.white} />
                : <>
                    <Ionicons name="chatbubble-outline" size={18} color={Colors.white} />
                    <Text style={styles.messageBtnText}>Message</Text>
                  </>
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.followBtn, followed && styles.followBtnDone]}
              onPress={handleFollow}
              disabled={followed || following}
              activeOpacity={0.85}
            >
              {following
                ? <ActivityIndicator size="small" color={Colors.primary} />
                : <>
                    <Ionicons
                      name={followed ? 'checkmark-circle' : 'person-add-outline'}
                      size={18}
                      color={followed ? Colors.primary : Colors.primary}
                    />
                    <Text style={styles.followBtnText}>{followed ? 'Following' : 'Add Pal'}</Text>
                  </>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* Bio */}
        {(profile as any).bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.bioCard}>
              <Text style={styles.bioText}>{(profile as any).bio}</Text>
            </View>
          </View>
        )}

        {/* Challenges */}
        {profile.challenges && profile.challenges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Working On</Text>
            <View style={styles.pillWrap}>
              {profile.challenges.map((c, i) => (
                <View key={i} style={styles.pill}>
                  <Text style={styles.pillText}>{c}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Goal */}
        {profile.short_term_goal && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Short-term Goal</Text>
            <View style={styles.goalCard}>
              <Ionicons name="flag" size={18} color={Colors.primary} />
              <Text style={styles.goalText}>{profile.short_term_goal}</Text>
            </View>
          </View>
        )}

        {/* Badges */}
        {unlockedBadges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Badges Earned</Text>
            <View style={styles.badgesRow}>
              {unlockedBadges.map(b => (
                <View key={b.days} style={styles.badgeItem}>
                  <View style={[styles.badgeCircle, { backgroundColor: b.color + '22' }]}>
                    <Ionicons name={b.icon as any} size={22} color={b.color} />
                  </View>
                  <Text style={styles.badgeLabel}>{b.label}</Text>
                </View>
              ))}
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, color: Colors.textMuted },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    gap: 6,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: { fontSize: 34, fontWeight: '700', color: Colors.primary },
  name: { fontSize: 22, fontWeight: '700', color: Colors.text },
  username: { fontSize: 15, color: Colors.textMuted },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { fontSize: 13, color: Colors.textMuted },
  sobrietyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sobrietyText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  messageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 50,
  },
  messageBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  followBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 14,
    height: 50,
  },
  followBtnDone: { backgroundColor: Colors.primaryLight, borderColor: Colors.primaryLight },
  followBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 14,
    height: 50,
    marginBottom: 20,
  },
  editBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  bioCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
  },
  bioText: { fontSize: 14, color: Colors.text, lineHeight: 22 },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
  },
  goalText: { flex: 1, fontSize: 14, color: Colors.primary, lineHeight: 22 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeItem: { alignItems: 'center', gap: 6, width: 72 },
  badgeCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', fontWeight: '600' },
});
