import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { useProgressStore } from '../../store/progress';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

export default function SettingsScreen() {
  const insets    = useSafeAreaInsets();
  const signOut   = useAuthStore((s) => s.signOut);
  const setSobriety = useProgressStore((s) => s.setSobrietyStart);
  const sobrietyDate = useProgressStore((s) => s.sobrietyStartDate);
  const user = useAuthStore((s) => s.user);

  const [notifs, setNotifs] = useState(true);

  const handleResetSobriety = () => {
    Alert.alert(
      'Reset Sobriety Date',
      'Are you sure you want to reset your sobriety date to today? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const today = new Date().toISOString().slice(0, 10);
            setSobriety(today, user?.id);
            Alert.alert('Reset', 'Your sobriety date has been reset to today.');
          },
        },
      ],
    );
  };

  const SECTIONS = [
    {
      title: 'Account',
      items: [
        { label: 'Edit Profile', icon: 'person-outline', onPress: () => router.push('/(app)/edit-profile') },
        { label: 'My Sponsor',   icon: 'person-add-outline', onPress: () => router.push('/(app)/sponsor') },
        { label: 'Inner Circle', icon: 'people-circle-outline', onPress: () => router.push('/(app)/inner-circle') },
        { label: 'Guardian Ecosystem', icon: 'shield-checkmark-outline', onPress: () => router.push('/(app)/guardian' as any) },
        { label: 'Ameriwell Care', icon: 'heart-circle-outline', onPress: () => router.push('/(app)/ameriwell-care' as any) },
      ],
    },
    {
      title: 'Recovery',
      items: [
        { label: 'Sobriety Start Date', icon: 'calendar-outline', sublabel: sobrietyDate ?? 'Not set', onPress: handleResetSobriety },
        { label: 'Crisis History', icon: 'alert-circle-outline', onPress: () => router.push('/(app)/crisis-history') },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Push Notifications', icon: 'notifications-outline', toggle: true, value: notifs, onToggle: setNotifs },
      ],
    },
  ];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Settings</Text>

      {SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.settingRow}
              activeOpacity={'toggle' in item ? 1 : 0.7}
              onPress={'onPress' in item ? (item as any).onPress : undefined}
            >
              <View style={styles.rowIcon}>
                <Ionicons name={(item.icon) as any} size={20} color={Colors.primary} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                {'sublabel' in item && (item as any).sublabel ? (
                  <Text style={styles.rowSublabel}>{(item as any).sublabel}</Text>
                ) : null}
              </View>
              {'toggle' in item ? (
                <Switch
                  value={(item as any).value}
                  onValueChange={(item as any).onToggle}
                  trackColor={{ false: Colors.border, true: Colors.primaryMid }}
                  thumbColor={Colors.white}
                />
              ) : (
                <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.signOutBtn} activeOpacity={0.8} onPress={() => signOut()}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingHorizontal: 24 },

  heading: { fontFamily: Fonts.poppinsBold, fontSize: 24, color: Colors.text, marginBottom: 24 },

  section:      { marginBottom: 24 },
  sectionTitle: { fontFamily: Fonts.poppinsSemiBold, fontSize: 12, color: Colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },

  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  rowIcon:    { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.cardTintPurpleFaint, alignItems: 'center', justifyContent: 'center' },
  rowText:    { flex: 1 },
  rowLabel:   { fontFamily: Fonts.poppinsMedium, fontSize: 15, color: Colors.text },
  rowSublabel:{ fontFamily: Fonts.jost, fontSize: 12, color: Colors.textMuted, marginTop: 1 },

  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: Colors.error, borderRadius: 12, paddingVertical: 14, marginTop: 12 },
  signOutText:{ fontFamily: Fonts.poppinsSemiBold, fontSize: 15, color: Colors.error },
});
