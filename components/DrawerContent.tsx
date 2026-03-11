import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../store/auth';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';

interface NavItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  badge?: number;
  onPress?: () => void;
}

function DrawerContent({ onClose }: { onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const navigate = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => { await signOut(); router.replace('/(auth)/sign-in'); },
      },
    ]);
  };

  const topItems: NavItem[] = [
    { label: 'Messages', icon: 'chatbubble-outline', route: '/(app)/messages' },
    { label: 'My Sober Pal', icon: 'people-circle-outline', route: '/(app)/sober-pal' },
    { label: 'Meetings', icon: 'calendar-outline', route: '/(app)/meetings' },
    { label: 'Resource Hub', icon: 'library-outline', route: '/(app)/resource-hub' },
  ];

  const bottomItems: NavItem[] = [
    { label: 'Panic Button', icon: 'alert-circle-outline', route: '/(app)/sos/index' },
    { label: 'Settings', icon: 'settings-outline', route: '/(app)/settings' },
  ];

  return (
    <View style={styles.container}>
      {/* Close button */}
      <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel="Close menu">
        <Ionicons name="chevron-back" size={22} color={Colors.white} />
      </TouchableOpacity>

      {/* Profile Header */}
      <TouchableOpacity style={styles.profile} onPress={() => navigate('/(app)/profile')} accessibilityLabel="View your profile">
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
        </View>
        <View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.viewProfile}>View profile</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Top nav */}
      {topItems.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={styles.navItem}
          onPress={() => item.route ? navigate(item.route) : item.onPress?.()}
        >
          <View style={styles.navIcon}>
            <Ionicons name={item.icon} size={20} color={Colors.primary} />
          </View>
          <Text style={styles.navLabel}>{item.label}</Text>
          {item.badge !== undefined && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}

      <View style={styles.divider} />

      {/* Bottom nav */}
      {bottomItems.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={styles.navItem}
          onPress={() => item.route ? navigate(item.route) : item.onPress?.()}
        >
          <View style={styles.navIcon}>
            <Ionicons name={item.icon} size={20} color={Colors.primary} />
          </View>
          <Text style={styles.navLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}

      {/* Logout */}
      <TouchableOpacity style={[styles.navItem, styles.logout]} onPress={handleSignOut}>
        <View style={styles.navIcon}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        </View>
        <Text style={[styles.navLabel, { color: Colors.error }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

export default DrawerContent;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, paddingTop: 60, paddingHorizontal: 20 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.primary, fontSize: 20, fontFamily: Fonts.poppinsBold },
  name: { fontSize: 16, fontFamily: Fonts.poppinsBold, color: Colors.text },
  viewProfile: { fontSize: 13, color: Colors.primary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 14 },
  navIcon: { width: 32, alignItems: 'center' },
  navLabel: { fontSize: 15, color: Colors.text, fontFamily: Fonts.poppinsMedium, flex: 1 },
  badge: {
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  badgeText: { color: Colors.white, fontSize: 11, fontFamily: Fonts.poppinsBold },
  logout: { marginTop: 4 },
});
