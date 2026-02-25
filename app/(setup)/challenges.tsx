import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth';

const CHALLENGES = [
  {
    id: 'alcohol',
    label: "I'm focusing on alcohol-related challenges",
    icon: 'wine-outline' as const,
  },
  {
    id: 'substance',
    label: "I'm addressing substance-related challenges",
    icon: 'medical-outline' as const,
  },
  {
    id: 'gambling',
    label: "I'm working on overcoming gambling-related challenges",
    icon: 'card-outline' as const,
  },
  {
    id: 'combination',
    label: "I'm dealing with a combination of challenges",
    icon: 'layers-outline' as const,
  },
  {
    id: 'prefer_not',
    label: "I'd rather not say at this time",
    icon: 'lock-closed-outline' as const,
  },
];

export default function Challenges() {
  const updateUser = useAuthStore(s => s.updateUser);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) => {
    if (id === 'prefer_not') {
      // Second tap on prefer_not deselects it
      setSelected(prev => prev.includes('prefer_not') ? [] : ['prefer_not']);
      return;
    }
    setSelected(prev => {
      const without = prev.filter(x => x !== 'prefer_not');
      return without.includes(id)
        ? without.filter(x => x !== id)
        : [...without, id];
    });
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      await updateUser({ challenges: selected });
      router.push('/(setup)/goal');
    } catch {
      Alert.alert('Error', 'Could not save your selection. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>

        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
          <Text style={styles.progressLabel}>2 of 4</Text>
        </View>

        <Text style={styles.heading}>What are you trying to overcome?</Text>
        <Text style={styles.sub}>Could you share what you're trying to overcome? Select all that apply.</Text>

        {/* Options */}
        <View style={styles.options}>
          {CHALLENGES.map(c => {
            const isSelected = selected.includes(c.id);
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => toggle(c.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
                  <Ionicons
                    name={c.icon}
                    size={20}
                    color={isSelected ? Colors.white : Colors.primary}
                  />
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {c.label}
                </Text>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.footer}>
          These questions will help us tailor your experience and provide the most relevant resources.
        </Text>

        {/* Next */}
        <TouchableOpacity
          style={[styles.nextBtn, (selected.length === 0 || saving) && styles.nextDisabled]}
          onPress={handleNext}
          disabled={selected.length === 0 || saving}
        >
          {saving
            ? <ActivityIndicator color={Colors.white} />
            : <>
                <Text style={styles.nextText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.white} />
              </>
          }
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 32,
  },
  sub: {
    fontSize: 15,
    color: Colors.textMuted,
    lineHeight: 22,
    marginBottom: 28,
  },
  options: { gap: 12, marginBottom: 24 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconSelected: {
    backgroundColor: Colors.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  footer: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: 32,
    fontStyle: 'italic',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 52,
  },
  nextDisabled: { opacity: 0.4 },
  nextText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
