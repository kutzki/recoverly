import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { supabase } from '../../services/supabase';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

export type SOSStep = {
  id:    string;
  label: string;
  body:  string;
  cta?:  { label: string; action: () => void };
};

type Props = {
  incidentType:    string;
  headerTitle:     string;
  headerColor:     string;
  headerEmoji:     string;
  affirmation:     string;
  steps:           SOSStep[];
};

export function SOSResponseScreen({ incidentType, headerTitle, headerColor, headerEmoji, affirmation, steps }: Props) {
  const insets    = useSafeAreaInsets();
  const user      = useAuthStore((s) => s.user);
  const [done, setDone] = useState<Record<string, boolean>>({});

  const toggleStep = (id: string) => setDone((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleFinish = async () => {
    const actionsCompleted = Object.entries(done).filter(([, v]) => v).map(([k]) => k);
    if (user?.id) {
      try {
        await supabase.from('crisis_incidents').insert({
          user_id: user.id,
          incident_type: incidentType,
          actions_completed: actionsCompleted,
        });
      } catch { /* ignore — don't block UX */ }
    }
    Alert.alert(
      'You did it 💪',
      "You just survived a tough moment. Every step you took matters. You're stronger than you know.",
      [{ text: 'Back to Home', onPress: () => router.replace('/(app)/home') }],
    );
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={[headerColor, Colors.primaryMid]} style={styles.headerGrad}>
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 24 }}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
            <Text style={{ fontSize: 24 }}>{headerEmoji}</Text>
          </View>
          <Text style={styles.affirmation}>{affirmation}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stepsLabel}>Steps to get through this</Text>

        {steps.map((step, idx) => (
          <TouchableOpacity
            key={step.id}
            style={[styles.stepCard, done[step.id] && styles.stepCardDone]}
            activeOpacity={0.8}
            onPress={() => toggleStep(step.id)}
          >
            <View style={styles.stepNumber}>
              {done[step.id] ? (
                <Ionicons name="checkmark" size={16} color={Colors.white} />
              ) : (
                <Text style={styles.stepNum}>{idx + 1}</Text>
              )}
            </View>
            <View style={styles.stepBody}>
              <Text style={[styles.stepLabel, done[step.id] && styles.stepLabelDone]}>{step.label}</Text>
              <Text style={styles.stepText}>{step.body}</Text>
              {step.cta && !done[step.id] && (
                <TouchableOpacity style={styles.ctaBtn} onPress={step.cta.action}>
                  <Text style={styles.ctaText}>{step.cta.label}</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.finishBtn} activeOpacity={0.85} onPress={handleFinish}>
          <Text style={styles.finishText}>I'm feeling better</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: Colors.white },
  headerGrad: { width: '100%' },
  headerRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerTitle:{ fontFamily: Fonts.poppinsBold, fontSize: 18, color: Colors.white, flex: 1, marginLeft: 8 },
  affirmation:{ fontFamily: Fonts.jost, fontSize: 15, color: 'rgba(255,255,255,0.9)', lineHeight: 24 },

  scroll:      { paddingHorizontal: 24, paddingTop: 24 },
  stepsLabel:  { fontFamily: Fonts.poppinsSemiBold, fontSize: 16, color: Colors.text, marginBottom: 16 },

  stepCard:     { flexDirection: 'row', gap: 14, backgroundColor: Colors.cardTintPurpleFaint, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.primaryLight },
  stepCardDone: { opacity: 0.75 },
  stepNumber:   { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  stepNum:      { fontFamily: Fonts.poppinsBold, fontSize: 14, color: Colors.white },
  stepBody:     { flex: 1, gap: 4 },
  stepLabel:    { fontFamily: Fonts.poppinsSemiBold, fontSize: 14, color: Colors.text },
  stepLabelDone:{ textDecorationLine: 'line-through', color: Colors.textMuted },
  stepText:     { fontFamily: Fonts.jost, fontSize: 13, color: Colors.textMuted, lineHeight: 20 },
  ctaBtn:       { alignSelf: 'flex-start', marginTop: 8, backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  ctaText:      { fontFamily: Fonts.poppinsMedium, fontSize: 12, color: Colors.white },

  finishBtn:  { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  finishText: { fontFamily: Fonts.poppinsSemiBold, fontSize: 16, color: Colors.white },
});
