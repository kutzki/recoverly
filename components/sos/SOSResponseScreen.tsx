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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

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

  const toggle = (id: string) => setCompleted(prev => ({ ...prev, [id]: !prev[id] }));

  const callCrisis = () => {
    Alert.alert(
      '988 Crisis Lifeline',
      'Call the Suicide & Crisis Lifeline now? They\'re available 24/7.',
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
        {/* Back */}
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.headerWrap}>
          <View style={[styles.headerIcon, { backgroundColor: accentColor + '22' }]}>
            <Ionicons name={headerIcon} size={28} color={accentColor} />
          </View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {/* We recommend... */}
        <Text style={styles.recommendLabel}>We recommend you try these things</Text>
        <View style={styles.actionsWrap}>
          {actions.map((action, i) => (
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
              <View style={[styles.actionIconWrap, completed[action.id] && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name={action.icon} size={20} color={completed[action.id] ? Colors.white : Colors.primary} />
              </View>
              <Text style={[styles.actionLabel, completed[action.id] && styles.actionLabelDone]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tip */}
        {tip && (
          <View style={styles.tipBox}>
            <Ionicons name="bulb-outline" size={18} color={Colors.primary} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        )}

        {/* Crisis line */}
        <TouchableOpacity style={styles.crisisBtn} onPress={callCrisis}>
          <Ionicons name="call" size={18} color="#FF3B30" />
          <Text style={styles.crisisBtnText}>Call 988 Crisis Lifeline</Text>
        </TouchableOpacity>

        {/* Complete */}
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
  headerWrap: { alignItems: 'center', marginBottom: 24, gap: 8 },
  headerIcon: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  subtitle: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  recommendLabel: {
    fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12,
  },
  actionsWrap: { gap: 10, marginBottom: 20 },
  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: 14, padding: 16, gap: 14,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  actionDone: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  actionNum: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 2,
    borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  actionNumDone: { backgroundColor: Colors.white, borderColor: Colors.white },
  actionNumText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  actionIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text },
  actionLabelDone: { color: Colors.white },
  tipBox: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: Colors.primaryLight, borderRadius: 12, padding: 14, marginBottom: 20,
  },
  tipText: { flex: 1, fontSize: 13, color: Colors.primary, lineHeight: 20 },
  crisisBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: '#FF3B30', borderRadius: 12, height: 50, marginBottom: 12,
  },
  crisisBtnText: { color: '#FF3B30', fontWeight: '600', fontSize: 15 },
  completeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 12, height: 50,
  },
  completeBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
