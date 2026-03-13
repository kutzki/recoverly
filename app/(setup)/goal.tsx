import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/auth';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

const GOALS = [
  { id: 'stay_sober',      label: 'Stay Sober',          emoji: '🌟' },
  { id: 'rebuild_life',    label: 'Rebuild My Life',      emoji: '🏠' },
  { id: 'improve_health',  label: 'Improve Health',       emoji: '💪' },
  { id: 'reconnect',       label: 'Reconnect With Family',emoji: '❤️' },
  { id: 'find_purpose',    label: 'Find Purpose',         emoji: '🎯' },
  { id: 'manage_stress',   label: 'Manage Stress',        emoji: '🧘' },
];

export default function GoalScreen() {
  const insets     = useSafeAreaInsets();
  const updateUser = useAuthStore((s) => s.updateUser);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  const handleNext = async () => {
    if (!selected) { Alert.alert('Select a goal', 'Please choose your short-term goal.'); return; }
    setLoading(true);
    try {
      await updateUser({ short_term_goal: selected });
      router.push('/(setup)/challenges');
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
            <View key={s} style={[styles.progressDot, s <= 2 && styles.progressActive]} />
          ))}
        </View>

        <Text style={styles.stepLabel}>Step 2 of 3</Text>
        <Text style={styles.heading}>What's your goal?</Text>
        <Text style={styles.subheading}>Choose what matters most to you right now</Text>

        <View style={styles.grid}>
          {GOALS.map((g) => (
            <TouchableOpacity
              key={g.id}
              style={[styles.card, selected === g.id && styles.cardSelected]}
              activeOpacity={0.8}
              onPress={() => setSelected(g.id)}
            >
              <Text style={styles.emoji}>{g.emoji}</Text>
              <Text style={[styles.cardLabel, selected === g.id && styles.cardLabelSelected]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          activeOpacity={0.85}
          onPress={handleNext}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Saving…' : 'Continue'}</Text>
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

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },

  card: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.cardTintPurpleFaint,
  },
  emoji: { fontSize: 32 },
  cardLabel: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 13,
    color: Colors.text,
    textAlign: 'center',
  },
  cardLabelSelected: { color: Colors.primary },

  button:         { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText:     { fontFamily: Fonts.poppinsSemiBold, fontSize: 16, color: Colors.white },
});
