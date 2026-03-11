import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { useAuthStore } from '../../../store/auth';

const ACTIONS = [
  { id: 'sponsor', label: 'Call your Sponsor', icon: 'call-outline' as const },
  { id: 'meditate', label: 'Meditate', icon: 'flower-outline' as const },
  { id: 'meeting', label: 'Attend a Meeting', icon: 'people-outline' as const },
];

export default function FeelLikeUsing() {
  const { user } = useAuthStore();
  const sponsor = user?.sponsor;
  const innerCircle = user?.innerCircle ?? [];

  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setCompleted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const callSponsor = () => {
    if (!sponsor?.name || !sponsor?.phone) {
      Alert.alert(
        'No Sponsor Added',
        'You haven\'t added a sponsor yet. Add one in your profile settings.',
        [{ text: 'OK' }]
      );
      return;
    }
    const phone = sponsor.phone.replace(/\D/g, '');
    Alert.alert(
      'Call Sponsor',
      `Call ${sponsor.name} – your sponsor?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Call ${sponsor.name}`,
          onPress: () => {
            Linking.openURL(`tel:${phone}`).catch(() => {
              Alert.alert('Error', `Could not open the phone app. Please dial: ${sponsor.phone}`);
            });
          },
        },
      ]
    );
  };

  const handleComplete = () => {
    Alert.alert(
      'Great work! 💪',
      'You stayed strong. Keep going, one moment at a time.',
      [{ text: 'Thank you', onPress: () => router.back() }]
    );
  };

  const openEmergencyContacts = () => {
    if (innerCircle.length === 0) {
      Alert.alert(
        'No Emergency Contacts',
        'You haven\'t added any emergency contacts yet. Add them in your profile settings.'
      );
      return;
    }
    const list = innerCircle.map(c => `${c.name}: ${c.phone}`).join('\n');
    // iOS Alert supports up to 3 buttons; show Cancel + up to 2 callable contacts
    Alert.alert('Emergency Contacts', list, [
      { text: 'Cancel', style: 'cancel' },
      ...innerCircle.slice(0, 2).map(c => ({
        text: `Call ${c.name}`,
        onPress: () => {
          const phone = c.phone.replace(/\D/g, '');
          Linking.openURL(`tel:${phone}`).catch(() => {
            Alert.alert('Error', `Could not open the phone app. Please dial: ${c.phone}`);
          });
        },
      })),
    ]);
  };

  const sponsorInitial = sponsor?.name?.[0]?.toUpperCase() ?? '?';
  const sponsorDisplay = sponsor?.phone ?? '—';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back */}
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>

        <View style={styles.headerWrap}>
          <View style={styles.headerIcon}>
            <Ionicons name="alert-circle" size={28} color="#FF6B6B" />
          </View>
          <Text style={styles.title}>I Feel Like Using</Text>
          <Text style={styles.subtitle}>We recommend you try these 3 things</Text>
        </View>

        {/* Action toggles */}
        <View style={styles.actionsWrap}>
          {ACTIONS.map((action, i) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionRow, completed[action.id] && styles.actionDone]}
              onPress={() => toggle(action.id)}
              activeOpacity={0.85}
            >
              <View style={[styles.actionNum, completed[action.id] && styles.actionNumDone]}>
                {completed[action.id] ? (
                  <Ionicons name="checkmark" size={14} color={Colors.white} />
                ) : (
                  <Text style={styles.actionNumText}>{i + 1}</Text>
                )}
              </View>
              <View style={styles.actionIconWrap}>
                <Ionicons name={action.icon} size={20} color={completed[action.id] ? Colors.white : Colors.primary} />
              </View>
              <Text style={[styles.actionLabel, completed[action.id] && styles.actionLabelDone]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sponsor call card */}
        <View style={styles.sponsorSection}>
          <Text style={styles.sponsorHeading}>Press the Icon to Call Your Sponsor</Text>
          <Text style={styles.sponsorSub}>
            Try talking about your feelings to a friend, family member, health professional or sponsor.
          </Text>

          {sponsor ? (
            <TouchableOpacity style={styles.sponsorCard} onPress={callSponsor} activeOpacity={0.85}>
              <View style={styles.sponsorAvatar}>
                <Text style={styles.sponsorAvatarText}>{sponsorInitial}</Text>
              </View>
              <View style={styles.sponsorInfo}>
                <Text style={styles.sponsorName}>{sponsor.name}</Text>
                <Text style={styles.sponsorRole}>Sponsor</Text>
                <Text style={styles.sponsorNumber}>{sponsorDisplay}</Text>
              </View>
              <View style={styles.callIcon}>
                <Ionicons name="call" size={22} color={Colors.white} />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.noSponsorCard} onPress={callSponsor} activeOpacity={0.85}>
              <Ionicons name="person-add-outline" size={22} color={Colors.textMuted} />
              <Text style={styles.noSponsorText}>No sponsor added yet — tap to learn more</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.outlineBtn} onPress={openEmergencyContacts}>
          <Text style={styles.outlineBtnText}>Open Emergency Contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
          <Text style={styles.completeBtnText}>Complete Activity</Text>
          <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 20 : 12 },
  back: { marginBottom: 12, padding: 4, alignSelf: 'flex-start' },
  headerWrap: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 8,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 24, fontFamily: Fonts.poppinsBold, color: Colors.text },
  subtitle: { fontSize: 15, fontFamily: Fonts.jost, color: Colors.textMuted, textAlign: 'center' },
  actionsWrap: { gap: 10, marginBottom: 28 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  actionDone: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  actionNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionNumDone: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  actionNumText: { fontSize: 12, fontFamily: Fonts.poppinsBold, color: Colors.primary },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { flex: 1, fontSize: 15, fontFamily: Fonts.poppinsSemiBold, color: Colors.text },
  actionLabelDone: { color: Colors.white },
  sponsorSection: { marginBottom: 20 },
  sponsorHeading: { fontSize: 16, fontFamily: Fonts.poppinsBold, color: Colors.text, marginBottom: 6 },
  sponsorSub: { fontSize: 13, fontFamily: Fonts.jost, color: Colors.textMuted, lineHeight: 20, marginBottom: 16 },
  sponsorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
  },
  noSponsorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  noSponsorText: { flex: 1, fontSize: 14, fontFamily: Fonts.jost, color: Colors.textMuted },
  sponsorAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsorAvatarText: { fontSize: 22, fontFamily: Fonts.poppinsBold, color: Colors.primary },
  sponsorInfo: { flex: 1 },
  sponsorName: { fontSize: 17, fontFamily: Fonts.poppinsBold, color: Colors.text },
  sponsorRole: { fontSize: 13, fontFamily: Fonts.jost, color: Colors.textMuted },
  sponsorNumber: { fontSize: 15, fontFamily: Fonts.poppinsSemiBold, color: Colors.primary, marginTop: 2 },
  callIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  outlineBtnText: { color: Colors.primary, fontFamily: Fonts.poppinsSemiBold, fontSize: 15 },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 50,
  },
  completeBtnText: { color: Colors.white, fontFamily: Fonts.poppinsBold, fontSize: 15 },
});
