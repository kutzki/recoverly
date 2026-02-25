import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth';

const SETTINGS_KEY = 'app_settings';
const APP_VERSION = '1.0.22';

export default function Settings() {
  const signOut = useAuthStore(s => s.signOut);
  const [notifications, setNotifications] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [biometrics, setBiometrics] = useState(false);

  // Load persisted settings on mount
  useEffect(() => {
    SecureStore.getItemAsync(SETTINGS_KEY).then(raw => {
      if (!raw) return;
      try {
        const saved = JSON.parse(raw);
        if (saved.notifications !== undefined) setNotifications(saved.notifications);
        if (saved.dailyReminder !== undefined) setDailyReminder(saved.dailyReminder);
        if (saved.anonymousMode !== undefined) setAnonymousMode(saved.anonymousMode);
        if (saved.biometrics !== undefined) setBiometrics(saved.biometrics);
      } catch {}
    }).catch(() => {});
  }, []);

  const persist = (updates: Record<string, boolean>) => {
    SecureStore.getItemAsync(SETTINGS_KEY).then(raw => {
      const current = raw ? JSON.parse(raw) : {};
      SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify({ ...current, ...updates })).catch(() => {});
    }).catch(() => {});
  };

  // Keys that are not yet implemented — toggles are disabled/greyed
  const COMING_SOON_KEYS = new Set(['notifications', 'dailyReminder', 'biometrics']);

  const handleToggle = (key: string, value: boolean, setter: (v: boolean) => void) => {
    if (COMING_SOON_KEYS.has(key)) {
      Alert.alert('Coming Soon', 'This feature is not yet available. Stay tuned for an upcoming update!', [{ text: 'OK' }]);
      return; // don't change state or persist
    }
    setter(value);
    persist({ [key]: value });
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Delete My Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'All your data, progress, and messages will be permanently deleted. To complete deletion, we\'ll send a request to our team.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Send Deletion Request',
                  style: 'destructive',
                  onPress: () =>
                    Linking.openURL('mailto:support@recvrly.com?subject=Delete%20My%20Account').catch(() => {}),
                },
              ]
            );
          },
        },
      ]
    );
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open this link.'));
  };

  const ACCOUNT_LINKS = [
    { label: 'Edit Profile', icon: 'person-circle-outline' as const, onPress: () => router.push('/(app)/edit-profile' as any) },
    { label: 'Sponsor', icon: 'hand-right-outline' as const, onPress: () => router.push('/(app)/sponsor' as any) },
    { label: 'Inner Circle', icon: 'people-circle-outline' as const, onPress: () => router.push('/(app)/inner-circle' as any) },
    { label: 'My Goals', icon: 'flag-outline' as const, onPress: () => router.push('/(app)/goals' as any) },
    { label: 'Crisis History', icon: 'time-outline' as const, onPress: () => router.push('/(app)/crisis-history' as any) },
  ];

  const SECTIONS = [
    {
      title: 'Notifications',
      items: [
        {
          key: 'notifications',
          label: 'Push Notifications',
          icon: 'notifications-outline' as const,
          toggle: notifications,
          onToggle: (v: boolean) => handleToggle('notifications', v, setNotifications),
        },
        {
          key: 'dailyReminder',
          label: 'Daily Reminder',
          icon: 'alarm-outline' as const,
          toggle: dailyReminder,
          onToggle: (v: boolean) => handleToggle('dailyReminder', v, setDailyReminder),
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          key: 'anonymousMode',
          label: 'Anonymous Mode',
          icon: 'eye-off-outline' as const,
          toggle: anonymousMode,
          onToggle: (v: boolean) => handleToggle('anonymousMode', v, setAnonymousMode),
        },
        {
          key: 'biometrics',
          label: 'Biometric Login',
          icon: 'finger-print-outline' as const,
          toggle: biometrics,
          onToggle: (v: boolean) => handleToggle('biometrics', v, setBiometrics),
        },
      ],
    },
  ];

  const LINKS = [
    {
      label: 'Privacy Policy',
      icon: 'shield-outline' as const,
      onPress: () => openLink('https://recvrly.com/privacy'),
    },
    {
      label: 'Terms of Service',
      icon: 'document-text-outline' as const,
      onPress: () => openLink('https://recvrly.com/tos'),
    },
    {
      label: 'About Recoverly',
      icon: 'information-circle-outline' as const,
      onPress: () =>
        Alert.alert(
          'About Recoverly',
          `Recoverly is your daily companion on the road to recovery. Built with care for people committed to a sober life.\n\nVersion ${APP_VERSION}`
        ),
    },
    {
      label: 'Send Feedback',
      icon: 'chatbubble-outline' as const,
      onPress: () => openLink('mailto:feedback@recvrly.com?subject=App%20Feedback'),
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            {ACCOUNT_LINKS.map((link, i) => (
              <TouchableOpacity
                key={link.label}
                style={[styles.row, i < ACCOUNT_LINKS.length - 1 && styles.rowBorder]}
                onPress={link.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={styles.rowIcon}>
                    <Ionicons name={link.icon} size={18} color={Colors.primary} />
                  </View>
                  <Text style={styles.rowLabel}>{link.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {SECTIONS.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, i) => {
                const isSoon = COMING_SOON_KEYS.has(item.key);
                return (
                  <View
                    key={item.label}
                    style={[styles.row, i < section.items.length - 1 && styles.rowBorder, isSoon && { opacity: 0.5 }]}
                  >
                    <View style={styles.rowLeft}>
                      <View style={styles.rowIcon}>
                        <Ionicons name={item.icon} size={18} color={Colors.primary} />
                      </View>
                      <Text style={styles.rowLabel}>{item.label}</Text>
                      {isSoon && (
                        <View style={styles.soonBadge}>
                          <Text style={styles.soonBadgeText}>SOON</Text>
                        </View>
                      )}
                    </View>
                    <Switch
                      value={item.toggle}
                      onValueChange={item.onToggle}
                      trackColor={{ false: Colors.border, true: Colors.primary }}
                      thumbColor={Colors.white}
                      disabled={isSoon}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            {LINKS.map((link, i) => (
              <TouchableOpacity
                key={link.label}
                style={[styles.row, i < LINKS.length - 1 && styles.rowBorder]}
                onPress={link.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={styles.rowIcon}>
                    <Ionicons name={link.icon} size={18} color={Colors.primary} />
                  </View>
                  <Text style={styles.rowLabel}>{link.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sign out / Delete */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Recoverly v{APP_VERSION}</Text>

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
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { width: 28 },
  rowLabel: { fontSize: 15, color: Colors.text },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.error,
    borderRadius: 12,
    height: 50,
    marginBottom: 12,
  },
  signOutText: { color: Colors.error, fontWeight: '600', fontSize: 15 },
  deleteBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  deleteText: { color: Colors.textMuted, fontSize: 14, textDecorationLine: 'underline' },
  version: { textAlign: 'center', fontSize: 12, color: Colors.textLight, marginTop: 16 },
  soonBadge: {
    backgroundColor: Colors.border,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  soonBadgeText: { fontSize: 9, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.5 },
});
