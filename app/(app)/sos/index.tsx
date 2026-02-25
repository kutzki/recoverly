import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
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

const CRISIS_OPTIONS = [
  {
    id: 'feel-like-using',
    label: 'I Feel Like Using',
    icon: 'alert-circle-outline' as const,
    color: '#FF6B6B',
  },
  {
    id: 'just-relapsed',
    label: 'Just Relapsed',
    icon: 'refresh-circle-outline' as const,
    color: '#FF9F43',
  },
  {
    id: 'self-harm',
    label: 'Self-Harm',
    icon: 'heart-dislike-outline' as const,
    color: '#EE5A24',
  },
  {
    id: 'bad-day',
    label: 'Having a Bad Day',
    icon: 'cloudy-outline' as const,
    color: '#778CA3',
  },
  {
    id: 'feeling-anxious',
    label: 'Feeling Anxious',
    icon: 'pulse-outline' as const,
    color: '#A55EEA',
  },
] as const;

export default function SOSMain() {
  const handleBack = () => {
    router.back();
  };

  const callCrisisLine = () => {
    Alert.alert(
      'Call Crisis Line',
      'Call the SAMHSA National Helpline: 1-800-662-4357 (24/7, free)',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', onPress: () => Linking.openURL('tel:18006624357') },
      ]
    );
  };

  const findMeeting = () => {
    router.push('/(app)/meetings');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={handleBack}
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={24} color={Colors.primary} />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.sosIconWrap}>
            <Ionicons name="alert" size={32} color={Colors.white} />
          </View>
          <Text style={styles.title}>Sober SOS</Text>
          <Text style={styles.subtitle}>You're not alone. Choose what's happening:</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickBtn} onPress={findMeeting}>
            <View style={[styles.quickIcon, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="people" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.quickLabel}>Meeting Now</Text>
            <Text style={styles.quickSub}>Find a meeting nearby</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/(app)/inner-circle' as any)}>
            <View style={[styles.quickIcon, { backgroundColor: '#FFE5E5' }]}>
              <Ionicons name="call" size={24} color="#FF3B30" />
            </View>
            <Text style={styles.quickLabel}>Inner Circle</Text>
            <Text style={styles.quickSub}>Call your contacts</Text>
          </TouchableOpacity>
        </View>

        {/* Talk to Someone — Live Video/Audio */}
        <TouchableOpacity
          style={styles.talkBtn}
          onPress={() =>
            router.push({
              pathname: '/(app)/call/[callId]' as any,
              params: { callId: 'sos_support_room', type: 'default', calleeName: encodeURIComponent('Support Room') },
            })
          }
          activeOpacity={0.85}
        >
          <View style={styles.talkIconWrap}>
            <Ionicons name="videocam" size={22} color="#fff" />
          </View>
          <View style={styles.talkTextWrap}>
            <Text style={styles.talkTitle}>Talk to Someone Now</Text>
            <Text style={styles.talkSub}>Join a live support video call</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
        </TouchableOpacity>

        {/* Crisis list */}
        <Text style={styles.crisisLabel}>What's going on?</Text>
        {CRISIS_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.id}
            style={styles.crisisItem}
            onPress={() => router.push(`/(app)/sos/${option.id}` as any)}
            activeOpacity={0.85}
          >
            <View style={[styles.crisisIcon, { backgroundColor: option.color + '22' }]}>
              <Ionicons name={option.icon} size={22} color={option.color} />
            </View>
            <Text style={styles.crisisText}>{option.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}

        {/* Emergency */}
        <View style={styles.emergencyBox}>
          <Ionicons name="warning-outline" size={18} color="#FF3B30" />
          <Text style={styles.emergencyText}>
            In immediate danger? Call{' '}
            <Text
              style={styles.emergencyLink}
              onPress={() => Linking.openURL('tel:911')}
            >
              911
            </Text>
            {' '}or{' '}
            <Text
              style={styles.emergencyLink}
              onPress={() => Linking.openURL('tel:988')}
            >
              988 Suicide & Crisis Lifeline
            </Text>
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 20 : 12,
    left: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 56 : 48 },
  header: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 8,
  },
  sosIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 4,
  },
  title: { fontSize: 26, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 15, color: Colors.textMuted, textAlign: 'center' },
  quickRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { fontSize: 14, fontWeight: '700', color: Colors.text },
  quickSub: { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
  talkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary + '33',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  talkIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  talkTextWrap: { flex: 1 },
  talkTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  talkSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  crisisLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  crisisItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  crisisIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crisisText: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text },
  emergencyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFF1F0',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFD0CC',
  },
  emergencyText: { flex: 1, fontSize: 13, color: Colors.text, lineHeight: 20 },
  emergencyLink: { color: '#FF3B30', fontWeight: '700' },
});
