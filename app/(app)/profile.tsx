import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useAuthStore } from '../../store/auth';
import { useProgressStore } from '../../store/progress';
import { useSobrietyTimer } from '../../hooks/useSobrietyTimer';

const SCREEN_W = Dimensions.get('window').width;
const COVER_H = 160;

const BADGE_DEFS = [
  { days: 1,   label: '24 Hours', emoji: '⭐' },
  { days: 7,   label: '1 Week',   emoji: '🔥' },
  { days: 30,  label: '30 Days',  emoji: '🏆' },
  { days: 60,  label: '60 Days',  emoji: '🥈' },
  { days: 90,  label: '90 Days',  emoji: '🥇' },
  { days: 180, label: '6 Months', emoji: '💎' },
  { days: 365, label: '1 Year',   emoji: '👑' },
];

// Placeholder friend avatar colors
const FRIEND_COLORS = ['#9747FF', '#5B8CFF', '#FF7A5B', '#FF5B9A', '#2DD4BF'];

export default function Profile() {
  const user = useAuthStore(s => s.user);
  const { sobrietyStartDate, tasksCompleted, checkInsCompleted, meetingsAttended } = useProgressStore();
  const timer = useSobrietyTimer(sobrietyStartDate);

  const initial = user?.name?.[0]?.toUpperCase() || 'U';
  const earnedCount = BADGE_DEFS.filter(b => timer.days >= b.days).length;

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Cover + Avatar ── */}
        <View style={styles.coverWrap}>
          <LinearGradient
            colors={[Colors.primaryDark, Colors.primary, Colors.primaryMid]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cover}
          />

          {/* Back + Edit buttons */}
          <View style={[styles.coverButtons, { top: Platform.OS === 'android' ? 12 : 12 }]}>
            <TouchableOpacity style={styles.coverBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editPillBtn}
              onPress={() => router.push('/(app)/edit-profile' as any)}
            >
              <Ionicons name="pencil-outline" size={14} color="#fff" />
              <Text style={styles.editPillText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar overlapping the cover bottom */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          </View>
        </View>

        {/* ── Name + Bio ── */}
        <View style={styles.nameSection}>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          {user?.username ? (
            <Text style={styles.username}>
              {user.username.startsWith('@') ? user.username : `@${user.username}`}
            </Text>
          ) : null}
          {user?.bio ? (
            <Text style={styles.bio}>{user.bio}</Text>
          ) : (
            <Text style={styles.bioPlaceholder}>Add a bio to tell your story</Text>
          )}
          {user?.location ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.location}>{user.location}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Followers / Posts stats ── */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statValue}>{timer.days > 0 ? timer.days.toLocaleString() : '—'}</Text>
            <Text style={styles.statLabel}>Days Sober</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statValue}>{checkInsCompleted}</Text>
            <Text style={styles.statLabel}>Check-ins</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statValue}>{meetingsAttended}</Text>
            <Text style={styles.statLabel}>Meetings</Text>
          </View>
        </View>

        {/* ── Connections / Following row ── */}
        <View style={styles.connectRow}>
          <TouchableOpacity
            style={styles.followingBtn}
            onPress={() => router.push('/(app)/inner-circle' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.followingBtnText}>Inner Circle</Text>
          </TouchableOpacity>

          {/* Stacked friend avatar bubbles */}
          <View style={styles.friendAvatars}>
            {FRIEND_COLORS.slice(0, 4).map((color, i) => (
              <View
                key={i}
                style={[
                  styles.friendAvatar,
                  { backgroundColor: color, marginLeft: i === 0 ? 0 : -10 },
                ]}
              />
            ))}
            <View style={[styles.friendAvatar, styles.friendAvatarMore, { marginLeft: -10 }]}>
              <Text style={styles.friendAvatarMoreText}>+</Text>
            </View>
          </View>
        </View>

        {/* ── Horizontal line separator ── */}
        <View style={styles.separator} />

        {/* ── Badges ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Badges</Text>
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

        {/* ── Sponsor ── */}
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

        {/* ── Account Info ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Info</Text>
          <View style={styles.infoCard}>
            {[
              { label: 'Email',    value: user?.email    || '—', icon: 'mail-outline'     as const },
              { label: 'Username', value: user?.username ? (user.username.startsWith('@') ? user.username : `@${user.username}`) : '—', icon: 'at-outline' as const },
              { label: 'Location', value: user?.location || '—', icon: 'location-outline' as const },
            ].map((row, i, arr) => (
              <React.Fragment key={i}>
                <View style={styles.infoRow}>
                  <View style={styles.infoIconWrap}>
                    <Ionicons name={row.icon} size={16} color={Colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{row.label}</Text>
                    <Text style={styles.infoValue}>{row.value}</Text>
                  </View>
                </View>
                {i < arr.length - 1 && <View style={styles.infoDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ── Goal ── */}
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
  safe:   { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 20 },

  /* ── Cover ── */
  coverWrap: { height: COVER_H + 44, position: 'relative', marginBottom: 8 },
  cover: { height: COVER_H, width: '100%' },
  coverButtons: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  editPillText: { fontSize: 14, fontFamily: Fonts.poppinsSemiBold, color: '#fff' },

  /* ── Avatar ── */
  avatarWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: { fontSize: 34, fontFamily: Fonts.poppinsBold, color: Colors.primary },

  /* ── Name / Bio ── */
  nameSection: { alignItems: 'center', paddingHorizontal: 24, marginTop: 10, marginBottom: 16 },
  name: { fontSize: 22, fontFamily: Fonts.poppinsBold, color: Colors.text, marginBottom: 2 },
  username: { fontSize: 14, fontFamily: Fonts.jost, color: Colors.textMuted, marginBottom: 6 },
  bio: { fontSize: 14, fontFamily: Fonts.jost, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 6 },
  bioPlaceholder: { fontSize: 14, fontFamily: Fonts.jost, color: Colors.textLight, textAlign: 'center', fontStyle: 'italic', marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  location: { fontSize: 13, fontFamily: Fonts.jost, color: Colors.textMuted },

  /* ── Stats ── */
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 16,
    marginBottom: 14,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statCol: { alignItems: 'center', flex: 1 },
  statDivider: { width: 1, backgroundColor: Colors.border },
  statValue: { fontSize: 22, fontFamily: Fonts.poppinsBold, color: Colors.text },
  statLabel: { fontSize: 11, fontFamily: Fonts.jost, color: Colors.textMuted, marginTop: 2 },

  /* ── Connect / Following row ── */
  connectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  followingBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 9,
  },
  followingBtnText: { fontSize: 14, fontFamily: Fonts.poppinsBold, color: Colors.primary },
  friendAvatars: { flexDirection: 'row', alignItems: 'center' },
  friendAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  friendAvatarMore: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAvatarMoreText: {
    fontSize: 14,
    fontFamily: Fonts.poppinsBold,
    color: Colors.primary,
  },

  /* ── Separator ── */
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    marginBottom: 20,
  },

  /* ── Sections ── */
  section: { marginHorizontal: 20, marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontFamily: Fonts.poppinsBold, color: Colors.text },
  sectionMeta: { fontSize: 13, fontFamily: Fonts.jost, color: Colors.textMuted },
  sectionAction: { fontSize: 14, fontFamily: Fonts.poppinsSemiBold, color: Colors.primary },

  /* ── Badge grid ── */
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  badge: { alignItems: 'center', width: 44, gap: 3, position: 'relative' },
  badgeEmoji: { fontSize: 26 },
  badgeLabel: { fontSize: 9, color: Colors.text, textAlign: 'center', fontFamily: Fonts.poppinsMedium },
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

  /* ── Sponsor ── */
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
  sponsorInitial: { fontSize: 18, fontFamily: Fonts.poppinsBold, color: Colors.primary },
  sponsorName: { fontSize: 15, fontFamily: Fonts.poppinsSemiBold, color: Colors.text },
  sponsorPhone: { fontSize: 13, fontFamily: Fonts.jost, color: Colors.textMuted, marginTop: 2 },
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
    marginHorizontal: 20,
    marginBottom: 20,
  },
  addSponsorText: { color: Colors.primary, fontFamily: Fonts.poppinsSemiBold, fontSize: 14 },

  /* ── Account Info ── */
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  infoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, fontFamily: Fonts.jost, color: Colors.textMuted },
  infoValue: { fontSize: 14, fontFamily: Fonts.poppinsSemiBold, color: Colors.text },
  infoDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: 56,
  },

  /* ── Goal ── */
  goalCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
  },
  goalText: { flex: 1, fontSize: 14, fontFamily: Fonts.jost, color: Colors.primary, lineHeight: 22 },
});
