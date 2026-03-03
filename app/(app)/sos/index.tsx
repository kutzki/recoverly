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
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';

const CRISIS_OPTIONS = [
  { id: 'feel-like-using',  label: 'I Feel Like Using' },
  { id: 'just-relapsed',    label: 'Just Relapsed' },
  { id: 'self-harm',        label: 'Self-Harm' },
  { id: 'bad-day',          label: 'Having a Bad Day' },
  { id: 'feeling-anxious',  label: 'Feeling Anxious' },
] as const;

export default function SOSMain() {
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

          <View style={styles.sosBadge}>
            <Ionicons name="alert" size={30} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>What is Your Emergency?</Text>
          <Text style={styles.heroSub}>Click below for immediate help</Text>

          {/* ── Two quick-action cards ── */}
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => router.push('/(app)/meetings')}
              activeOpacity={0.85}
            >
              <View style={styles.quickCardBadge}>
                <Ionicons name="open-outline" size={13} color={Colors.primary} />
              </View>
              <Ionicons name="people" size={28} color={Colors.primary} style={{ marginTop: 10 }} />
              <Text style={styles.quickCardLabel}>{'Meeting\nNow'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => router.push('/(app)/inner-circle' as any)}
              activeOpacity={0.85}
            >
              <View style={styles.quickCardBadge}>
                <Ionicons name="open-outline" size={13} color={Colors.primary} />
              </View>
              <Ionicons name="call" size={28} color={Colors.primary} style={{ marginTop: 10 }} />
              <Text style={styles.quickCardLabel}>{'Inner\nCircle'}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── Crisis list (flat rows + dividers, Figma style) ── */}
        <View style={styles.listCard}>
          {CRISIS_OPTIONS.map((option, i) => (
            <React.Fragment key={option.id}>
              <TouchableOpacity
                style={styles.crisisRow}
                onPress={() => router.push(`/(app)/sos/${option.id}` as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.crisisText}>{option.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
              {i < CRISIS_OPTIONS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Talk to Someone (live call) ── */}
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
            <Ionicons name="videocam" size={20} color={Colors.white} />
          </View>
          <View style={styles.talkTextWrap}>
            <Text style={styles.talkTitle}>Talk to Someone Now</Text>
            <Text style={styles.talkSub}>Join a live support video call</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
        </TouchableOpacity>

        {/* ── Emergency box ── */}
        <View style={styles.emergencyBox}>
          <Ionicons name="warning-outline" size={18} color={Colors.sosRedBright} />
          <Text style={styles.emergencyText}>
            In immediate danger? Call{' '}
            <Text style={styles.emergencyLink} onPress={() => Linking.openURL('tel:911')}>911</Text>
            {' '}or{' '}
            <Text style={styles.emergencyLink} onPress={() => Linking.openURL('tel:988')}>988 Suicide & Crisis Lifeline</Text>
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 20 },

  /* ── Hero ── */
  hero: {
    paddingTop: Platform.OS === 'android' ? 50 : 58,
    paddingBottom: 32,
    paddingHorizontal: 20,
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
  sosBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: Fonts.generalSansBold,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 28,
  },

  /* ── Quick cards ── */
  quickRow: {
    flexDirection: 'row',
    gap: 16,
  },
  quickCard: {
    width: 130,
    height: 130,
    backgroundColor: Colors.white,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  quickCardBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCardLabel: {
    fontSize: 14,
    fontFamily: Fonts.generalSansBold,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 18,
  },

  /* ── Crisis list ── */
  listCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  crisisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 66,
  },
  crisisText: {
    fontSize: 16,
    fontFamily: Fonts.generalSansSemiBold,
    color: Colors.text,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: 20,
  },

  /* ── Talk btn ── */
  talkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  talkTextWrap: { flex: 1 },
  talkTitle: { fontSize: 15, fontFamily: Fonts.generalSansBold, color: Colors.text },
  talkSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  /* ── Emergency box ── */
  emergencyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.sosBgRed,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.sosBorderRed,
  },
  emergencyText: { flex: 1, fontSize: 13, color: Colors.text, lineHeight: 20 },
  emergencyLink: { color: Colors.sosRedBright, fontFamily: Fonts.generalSansBold },
});
