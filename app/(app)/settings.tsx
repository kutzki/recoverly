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
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useAuthStore } from '../../store/auth';

const SETTINGS_KEY = 'app_settings';
const APP_VERSION = '1.0.29';

export default function Settings() {
  const signOut  = useAuthStore(s => s.signOut);
  const user     = useAuthStore(s => s.user);
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const firstName = user?.name?.split(' ')[0] || 'there';

  useEffect(() => {
    SecureStore.getItemAsync(SETTINGS_KEY).then(raw => {
      if (!raw) return;
      try {
        const saved = JSON.parse(raw);
        if (saved.anonymousMode !== undefined) setAnonymousMode(saved.anonymousMode);
        if (saved.notifications  !== undefined) setNotifications(saved.notifications);
      } catch {}
    }).catch(() => {});
  }, []);

  const persist = (updates: Record<string, boolean>) => {
    SecureStore.getItemAsync(SETTINGS_KEY).then(raw => {
      const current = raw ? JSON.parse(raw) : {};
      SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify({ ...current, ...updates })).catch(() => {});
    }).catch(() => {});
  };

  const handleToggle = (key: string, value: boolean, setter: (v: boolean) => void) => {
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
      'Permanently delete your account? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: () =>
            Linking.openURL('mailto:support@recvrly.com?subject=Delete%20My%20Account').catch(() => {}),
        },
      ]
    );
  };

  const openLink = (url: string) =>
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open this link.'));

  /* ─── Data ─── */
  const ACCOUNT: RowItem[] = [
    { label: 'Edit Profile',    icon: 'person-outline',          onPress: () => router.push('/(app)/edit-profile' as any) },
    { label: 'Sponsor',         icon: 'hand-right-outline',      onPress: () => router.push('/(app)/sponsor' as any) },
    { label: 'Inner Circle',    icon: 'people-outline',          onPress: () => router.push('/(app)/inner-circle' as any) },
    { label: 'My Goals',        icon: 'flag-outline',            onPress: () => router.push('/(app)/goals' as any) },
    { label: 'Crisis History',  icon: 'time-outline',            onPress: () => router.push('/(app)/crisis-history' as any) },
  ];

  const SUPPORT: RowItem[] = [
    { label: 'Privacy Policy',  icon: 'shield-outline',          onPress: () => openLink('https://recvrly.com/privacy') },
    { label: 'Terms of Service',icon: 'document-text-outline',   onPress: () => openLink('https://recvrly.com/tos') },
    { label: 'About Recoverly', icon: 'information-circle-outline', onPress: () =>
        Alert.alert('About Recoverly', `Your daily companion on the road to recovery.\n\nVersion ${APP_VERSION}`) },
    { label: 'Send Feedback',   icon: 'chatbubble-outline',      onPress: () => openLink('mailto:feedback@recvrly.com?subject=App%20Feedback') },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Gradient hero header ── */}
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary, Colors.primaryMid]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{firstName[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.heroGreeting}>Hi {firstName}</Text>
          <Text style={styles.heroSub}>Manage your account & preferences</Text>
        </LinearGradient>

        {/* ── Preferences (toggles) ── */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>Preferences</Text>
        </View>
        <View style={styles.listCard}>
          <ToggleRow
            label="All Notifications"
            icon="notifications-outline"
            value={notifications}
            onValueChange={v => handleToggle('notifications', v, setNotifications)}
          />
          <View style={styles.divider} />
          <ToggleRow
            label="Anonymous Mode"
            icon="eye-off-outline"
            value={anonymousMode}
            onValueChange={v => handleToggle('anonymousMode', v, setAnonymousMode)}
          />
        </View>

        {/* ── Account ── */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>Account</Text>
        </View>
        <View style={styles.listCard}>
          {ACCOUNT.map((item, i) => (
            <React.Fragment key={item.label}>
              <LinkRow label={item.label} icon={item.icon} onPress={item.onPress} />
              {i < ACCOUNT.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Support ── */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>Support</Text>
        </View>
        <View style={styles.listCard}>
          {SUPPORT.map((item, i) => (
            <React.Fragment key={item.label}>
              <LinkRow label={item.label} icon={item.icon} onPress={item.onPress} />
              {i < SUPPORT.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Sign out ── */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount} activeOpacity={0.7}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Recoverly v{APP_VERSION}</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Sub-components ─── */
interface RowItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

function LinkRow({ label, icon, onPress }: RowItem) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIconWrap}>
          <Ionicons name={icon} size={17} color={Colors.primary} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

function ToggleRow({
  label, icon, value, onValueChange,
}: { label: string; icon: keyof typeof Ionicons.glyphMap; value: boolean; onValueChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIconWrap}>
          <Ionicons name={icon} size={17} color={Colors.primary} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.border, true: Colors.primary }}
        thumbColor={Colors.white}
      />
    </View>
  );
}

/* ─── Styles ─── */
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
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: 12,
  },
  avatarLetter: {
    fontSize: 28,
    fontFamily: Fonts.generalSansBold,
    color: '#fff',
  },
  heroGreeting: {
    fontSize: 22,
    fontFamily: Fonts.generalSansBold,
    color: '#fff',
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },

  /* ── Section labels ── */
  sectionLabel: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionLabelText: {
    fontSize: 12,
    fontFamily: Fonts.generalSansBold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  /* ── List card ── */
  listCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: 56,   // aligns with text, not icon
  },

  /* ── Row ── */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 54,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 15,
    color: Colors.text,
    fontFamily: Fonts.generalSans,
  },

  /* ── Sign out / delete ── */
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.error,
    borderRadius: 12,
    height: 50,
    marginHorizontal: 20,
    marginTop: 24,
  },
  signOutText: {
    color: Colors.error,
    fontFamily: Fonts.generalSansSemiBold,
    fontSize: 15,
  },
  deleteBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  deleteText: {
    color: Colors.textMuted,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 8,
  },
});
