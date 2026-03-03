import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth';

export default function Goal() {
  const updateUser = useAuthStore(s => s.updateUser);
  const [goal, setGoal] = useState('');
  const [focused, setFocused] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!goal.trim()) return;
    setSaving(true);
    try {
      await updateUser({ shortTermGoal: goal.trim() });
      router.push('/(setup)/thank-you');
    } catch {
      Alert.alert('Error', 'Could not save your goal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          </TouchableOpacity>

          {/* Progress */}
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '75%' }]} />
            </View>
            <Text style={styles.progressLabel}>3 of 4</Text>
          </View>

          <Text style={styles.heading}>Set your short-term goal</Text>
          <Text style={styles.sub}>
            Setting goals can guide your recovery journey. Let's define your short-term goals.
          </Text>

          {/* Goal card */}
          <View style={[styles.goalCard, focused && styles.goalCardFocused]}>
            <View style={styles.goalHeader}>
              <Ionicons name="flag" size={20} color={Colors.primary} />
              <Text style={styles.goalTitle}>Short-term goal</Text>
            </View>
            <TextInput
              style={styles.goalInput}
              placeholder="Write your goal here... e.g. Stay sober for 30 days and attend 3 weekly meetings"
              placeholderTextColor={Colors.textMuted}
              value={goal}
              onChangeText={setGoal}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            <Text style={styles.charCount}>{goal.length}/280</Text>
          </View>

          {/* Tips */}
          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>Goal-setting tips</Text>
            {[
              'Make it specific and measurable',
              'Set a realistic timeframe (30–90 days)',
              'Focus on one key habit to build',
            ].map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, (!goal.trim() || saving) && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={!goal.trim() || saving}
          >
            {saving
              ? <ActivityIndicator color={Colors.white} />
              : <>
                  <Text style={styles.submitText}>Submit</Text>
                  <Ionicons name="checkmark" size={18} color={Colors.white} />
                </>
            }
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  back: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.primaryLight,
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressLabel: { color: Colors.textMuted, fontSize: 12 },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  sub: {
    fontSize: 15,
    color: Colors.textMuted,
    lineHeight: 22,
    marginBottom: 28,
  },
  goalCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  goalCardFocused: {
    borderColor: Colors.primary,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  goalInput: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    minHeight: 120,
  },
  charCount: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: 8,
  },
  tipsBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 5,
    opacity: 0.6,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.primary,
    lineHeight: 19,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 999,
    height: 52,
  },
  submitDisabled: { opacity: 0.4 },
  submitText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
