import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth';

export default function Settings() {
  const signOut = useAuthStore(s => s.signOut);
  const [notifications, setNotifications] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [biometrics, setBiometrics] = useState(false);

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
      'This will permanently delete your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  const SECTIONS = [
    {
      title: 'Notifications',
      items: [
        {
          label: 'Push Notifications',
          icon: 'notifications-outline' as const,
          toggle: notifications,
          onToggle: setNotifications,
        },
        {
          label: 'Daily Reminder',
          icon: 'alarm-outline' as const,
          toggle: dailyReminder,
          onToggle: setDailyReminder,
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          label: 'Anonymous Mode',
          icon: 'eye-off-outline' as const,
          toggle: anonymousMode,
          onToggle: setAnonymousMode,
        },
        {
          label: 'Biometric Login',
          icon: 'finger-print-outline' as const,
          toggle: biometrics,
          onToggle: setBiometrics,
        },
      ],
    },
  ];

  const LINKS = [
    { label: 'Privacy Policy', icon: 'shield-outline' as const },
    { label: 'Terms of Service', icon: 'document-text-outline' as const },
    { label: 'About Recoverly', icon: 'information-circle-outline' as const },
    { label: 'Send Feedback', icon: 'chatbubble-outline' as const },
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
        {SECTIONS.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, i) => (
                <View
                  key={item.label}
                  style={[styles.row, i < section.items.length - 1 && styles.rowBorder]}
                >
                  <View style={styles.rowLeft}>
                    <View style={styles.rowIcon}>
                      <Ionicons name={item.icon} size={18} color={Colors.primary} />
                    </View>
                    <Text style={styles.rowLabel}>{item.label}</Text>
                  </View>
                  <Switch
                    value={item.toggle}
                    onValueChange={item.onToggle}
                    trackColor={{ false: Colors.border, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>
              ))}
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

        <Text style={styles.version}>Recoverly v1.1.0</Text>

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
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
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
});
