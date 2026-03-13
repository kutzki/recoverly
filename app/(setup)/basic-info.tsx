import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/auth';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

export default function BasicInfo() {
  const insets     = useSafeAreaInsets();
  const updateUser = useAuthStore((s) => s.updateUser);
  const user       = useAuthStore((s) => s.user);

  const [name,     setName]     = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [dob,      setDob]      = useState(user?.date_of_birth ?? '');
  const [loading,  setLoading]  = useState(false);

  const handleNext = async () => {
    if (!name.trim() || !username.trim()) {
      Alert.alert('Required', 'Please enter your name and username.');
      return;
    }
    setLoading(true);
    try {
      await updateUser({ name: name.trim(), username: username.trim().toLowerCase(), date_of_birth: dob || null });
      router.push('/(setup)/goal');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to save. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView behavior="padding" style={styles.kav}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Progress */}
          <View style={styles.progressRow}>
            {[1, 2, 3].map((s) => (
              <View key={s} style={[styles.progressDot, s === 1 && styles.progressActive]} />
            ))}
          </View>

          <Text style={styles.stepLabel}>Step 1 of 3</Text>
          <Text style={styles.heading}>Tell us about yourself</Text>
          <Text style={styles.subheading}>We'll personalise your experience</Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="John Smith"
                placeholderTextColor={Colors.placeholderText}
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="johnsmith"
                placeholderTextColor={Colors.placeholderText}
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Date of Birth (optional)</Text>
              <TextInput
                style={styles.input}
                value={dob}
                onChangeText={setDob}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.placeholderText}
                keyboardType="numbers-and-punctuation"
                returnKeyType="done"
              />
            </View>
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
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  kav:      { flex: 1 },
  scroll:   { flexGrow: 1, paddingHorizontal: 30 },

  progressRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.primaryLight },
  progressActive: { backgroundColor: Colors.primary },

  stepLabel:  { fontFamily: Fonts.jostMedium,     fontSize: 12, color: Colors.textMuted, marginBottom: 8  },
  heading:    { fontFamily: Fonts.poppinsBold,     fontSize: 26, color: Colors.text,      marginBottom: 8  },
  subheading: { fontFamily: Fonts.jost,            fontSize: 15, color: Colors.textMuted, marginBottom: 32 },

  form: { gap: 16, marginBottom: 32 },
  field: { gap: 6 },
  label: { fontFamily: Fonts.poppinsMedium, fontSize: 13, color: Colors.text },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: Fonts.jost,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  button:         { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText:     { fontFamily: Fonts.poppinsSemiBold, fontSize: 16, color: Colors.white },
});
