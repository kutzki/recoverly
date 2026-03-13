import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { useProgressStore } from '../../store/progress';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useMemo } from 'react';

const MENU_ITEMS = [
  { id: 'tracker',       label: 'Progress Tracker',    icon: 'analytics-outline',     route: '/(app)/tracker'       },
  { id: 'goals',         label: 'My Goals',            icon: 'flag-outline',          route: '/(app)/goals'         },
  { id: 'inner-circle',  label: 'Inner Circle',        icon: 'people-circle-outline', route: '/(app)/inner-circle'  },
  { id: 'sponsor',       label: 'My Sponsor',          icon: 'person-add-outline',    route: '/(app)/sponsor'       },
  { id: 'crisis-history',label: 'Crisis History',      icon: 'alert-circle-outline',  route: '/(app)/crisis-history'},
  { id: 'settings',      label: 'Settings',            icon: 'settings-outline',      route: '/(app)/settings'      },
] as const;

export default function ProfileScreen() {
  const insets      = useSafeAreaInsets();
  const user        = useAuthStore((s) => s.user);
  const signOut     = useAuthStore((s) => s.signOut);
  const sobrietyStartDate = useProgressStore((s) => s.sobrietyStartDate);

  const daysSober = useMemo(() => {
    if (!sobrietyStartDate) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(sobrietyStartDate).getTime()) / 86_400_000));
  }, [sobrietyStartDate]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Profile</Text>
        <TouchableOpacity onPress={() => router.push('/(app)/edit-profile')} hitSlop={12}>
          <Ionicons name="create-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Avatar + name */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarInitial}>
              {(user?.name ?? 'U')[0].toUpperCase()}
            </Text>
          )}
        </View>
        <Text style={styles.displayName}>{user?.name ?? 'Your Name'}</Text>
        <Text style={styles.username}>@{user?.username ?? 'username'}</Text>
        {user?.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{daysSober}</Text>
          <Text style={styles.statLabel}>Days Sober</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.substance ?? '—'}</Text>
          <Text style={styles.statLabel}>Substance</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.location ?? '—'}</Text>
          <Text style={styles.statLabel}>Location</Text>
        </View>
      </View>

      {/* Menu items */}
      <View style={styles.menuSection}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push(item.route as any)}
          >
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutBtn} activeOpacity={0.8} onPress={() => signOut()}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.white },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  heading:{ fontFamily: Fonts.poppinsBold, fontSize: 24, color: Colors.text },

  avatarSection: { alignItems: 'center', marginBottom: 24, gap: 6 },
  avatarCircle: {
    width:           80,
    height:          80,
    borderRadius:    40,
    backgroundColor: Colors.primaryLight,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    4,
  },
  avatarImage:   { width: 80, height: 80, borderRadius: 40 },
  avatarInitial: { fontFamily: Fonts.poppinsBold, fontSize: 32, color: Colors.primary },
  displayName:   { fontFamily: Fonts.poppinsBold, fontSize: 20, color: Colors.text },
  username:      { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted },
  bio:           { fontFamily: Fonts.jost, fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },

  statsRow: {
    flexDirection:    'row',
    backgroundColor:  Colors.cardTintPurpleFaint,
    borderRadius:     14,
    padding:          16,
    marginBottom:     24,
    alignItems:       'center',
  },
  statItem:    { flex: 1, alignItems: 'center', gap: 2 },
  statValue:   { fontFamily: Fonts.poppinsBold, fontSize: 16, color: Colors.text, textAlign: 'center' },
  statLabel:   { fontFamily: Fonts.jost, fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
  statDivider: { width: 1, height: 36, backgroundColor: Colors.border },

  menuSection: { gap: 4, marginBottom: 24 },
  menuItem: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 14,
  },
  menuIcon:  { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.cardTintPurpleFaint, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontFamily: Fonts.poppinsMedium, fontSize: 15, color: Colors.text },

  signOutBtn:   { borderWidth: 1.5, borderColor: Colors.error, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  signOutText:  { fontFamily: Fonts.poppinsSemiBold, fontSize: 15, color: Colors.error },
});
