import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useProgressStore } from '../../store/progress';
import { useAuthStore } from '../../store/auth';

interface Action {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface Props {
  title: string;
  subtitle?: string;
  accentColor: string;
  headerIcon: keyof typeof Ionicons.glyphMap;
  actions: Action[];
  tip?: string;
}

export function SOSResponseScreen({ title, subtitle, accentColor, headerIcon, actions, tip }: Props) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const setSobrietyStart = useProgressStore(s => s.setSobrietyStart);
  const updateUser = useAuthStore(s => s.updateUser);

  const confirmResetCounter = () => {
    Alert.alert(
      'Reset Sobriety Counter',
      "This will reset your sobriety counter to today. It's a fresh start — you're not failing, you're trying again. 💜",
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Reset Counter',
          style: 'destructive',
          onPress: () => {
            const today = new Date().toISOString();
            setSobrietyStart(today);
            updateUser({ sobrietyStartDate: today });
            setCompleted(prev => ({ ...prev, reset: true }));
            Alert.alert(
              'Counter Reset 💜',
              "Your sobriety counter starts fresh today. Every day sober is a victory. You've got this.",
              [{ text: 'Thank you' }]
            );
          },
        },
      ]
    );
  };

  const toggle = (id: string) => {
    if (id === 'reset') { confirmResetCounter(); return; }
    setCompleted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const callCrisis = () => {
    Alert.alert(
      '988 Crisis Lifeline',
      "Call the Suicide & Crisis Lifeline now? They're available 24/7.",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call 988', onPress: () => Linking.openURL('tel:988') },
      ]
    );
  };

  const handleComplete = () => {
    Alert.alert(
      'Great job 💜',
      'You reached out for help — that takes courage.',
      [{ text: 'Continue', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
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
          <View style={styles.headerIconWrap}>
            <Ionicons name={headerIcon} size={28} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>{title}</Text>
          {subtitle && <Text style={styles.heroSub}>{subtitle}</Text>}
        </LinearGradient>

        {/* ── Recommendations card ── */}
        <View style={styles.recCard}>
          <Text style={styles.recLabel}>We recommend you try these {actions.length} things</Text>

          {actions.map((action) => {
            const done = !!completed[action.id];
            return (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionRow, done && styles.actionRowDone]}
                onPress={() => toggle(action.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIconWrap, done && styles.actionIconWrapDone]}>
                  <Ionicons name={action.icon} size={20} color={done ? Colors.white : Colors.primary} />
                </View>
                <Text style={[styles.actionLabel, done && styles.actionLabelDone]}>
                  {action.label}
                </Text>
                {/* Right-side circle checkbox (matches Figma) */}
                <View style={[styles.checkbox, done && styles.checkboxDone]}>
                  {done && <Ionicons name="checkmark" size={13} color={Colors.white} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Tip ── */}
        {tip && (
          <View style={styles.tipBox}>
            <Ionicons name="bulb-outline" size={18} color={Colors.primary} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        )}

        {/* ── Self-help / crisis line ── */}
        <TouchableOpacity style={styles.selfHelpBtn} onPress={callCrisis}>
          <Ionicons name="call" size={18} color={Colors.sosRedBright} />
          <Text style={styles.selfHelpBtnText}>View all self help options</Text>
        </TouchableOpacity>

        {/* ── Complete Activity ── */}
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
  safe:   { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 20 },

  /* ── Hero ── */
  hero: {
    paddingTop: Platform.OS === 'android' ? 50 : 58,
    paddingBottom: 36,
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
  headerIconWrap: {
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
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },

  /* ── Recommendations card ── */
  recCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    gap: 10,
  },
  recLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionRowDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconWrapDone: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  actionLabelDone: {
    color: Colors.white,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: Colors.white,
  },

  /* ── Tip ── */
  tipBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 20,
    marginTop: 12,
  },
  tipText: { flex: 1, fontSize: 13, color: Colors.primaryDark, lineHeight: 20 },

  /* ── Buttons ── */
  selfHelpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    height: 50,
    marginHorizontal: 20,
    marginTop: 12,
  },
  selfHelpBtnText: { color: Colors.text, fontWeight: '600', fontSize: 15 },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 50,
    marginHorizontal: 20,
    marginTop: 10,
  },
  completeBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
