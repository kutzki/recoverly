import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/auth';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

const CHALLENGES = [
  { id: 'cravings',        label: 'Managing Cravings',       emoji: '🔥' },
  { id: 'triggers',        label: 'Avoiding Triggers',        emoji: '⚠️' },
  { id: 'relationships',   label: 'Rebuilding Relationships', emoji: '🤝' },
  { id: 'mental_health',   label: 'Mental Health',           emoji: '🧠' },
  { id: 'finances',        label: 'Financial Stability',     emoji: '💰' },
  { id: 'employment',      label: 'Finding Employment',      emoji: '💼' },
  { id: 'housing',         label: 'Stable Housing',          emoji: '🏠' },
  { id: 'loneliness',      label: 'Loneliness',              emoji: '😔' },
  { id: 'physical_health', label: 'Physical Health',         emoji: '🏃' },
  { id: 'self_worth',      label: 'Building Self-Worth',     emoji: '💎' },
];

export default function ChallengesScreen() {
  const insets     = useSafeAreaInsets();
  const updateUser = useAuthStore((s) => s.updateUser);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading,  setLoading]  = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    if (selected.length === 0) {
      Alert.alert('Select at least one', 'Choose the challenges you want support with.');
      return;
    }
    setLoading(true);
    try {
      await updateUser({ challenges: selected });
      router.push('/(setup)/thank-you');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to save.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]} style={styles.gradient}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressRow}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={[styles.progressDot, s <= 3 && styles.progressActive]} />
          ))}
        </View>

        <Text style={styles.stepLabel}>Step 3 of 3</Text>
        <Text style={styles.heading}>What challenges do{'\n'}you face?</Text>
        <Text style={styles.subheading}>Select all that apply — we'll help you tackle them</Text>

        <View style={styles.grid}>
          {CHALLENGES.map((c) => {
            const isSelected = selected.includes(c.id);
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                activeOpacity={0.8}
                onPress={() => toggle(c.id)}
              >
                <Text style={styles.emoji}>{c.emoji}</Text>
                <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                  {c.label}
                </Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {selected.length > 0 && (
          <Text style={styles.selectedCount}>{selected.length} selected</Text>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          activeOpacity={0.85}
          onPress={handleNext}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Saving…' : 'Finish Setup'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll:   { flexGrow: 1, paddingHorizontal: 30 },

  progressRow:    { flexDirection: 'row', gap: 8, marginBottom: 20 },
  progressDot:    { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.primaryLight },
  progressActive: { backgroundColor: Colors.primary },

  stepLabel:  { fontFamily: Fonts.jostMedium, fontSize: 12, color: Colors.textMuted, marginBottom: 8  },
  heading:    { fontFamily: Fonts.poppinsBold, fontSize: 26, color: Colors.text,     marginBottom: 8  },
  subheading: { fontFamily: Fonts.jost,        fontSize: 15, color: Colors.textMuted,marginBottom: 28 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },

  card: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    position: 'relative',
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.cardTintPurpleFaint,
  },
  emoji: { fontSize: 28 },
  cardLabel: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
  },
  cardLabelSelected: { color: Colors.primary },

  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: Colors.white, fontSize: 11, fontFamily: Fonts.poppinsBold },

  selectedCount: {
    fontFamily: Fonts.jostMedium,
    fontSize: 13,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },

  button:         { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText:     { fontFamily: Fonts.poppinsSemiBold, fontSize: 16, color: Colors.white },
});
