import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { authService } from '../../services/auth';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken';

export default function BasicInfo() {
  const insets     = useSafeAreaInsets();
  const updateUser = useAuthStore((s) => s.updateUser);
  const user       = useAuthStore((s) => s.user);

  const [name,           setName]           = useState(user?.name ?? '');
  const [username,       setUsername]       = useState(user?.username ?? '');
  const [dob,            setDob]            = useState(user?.date_of_birth ?? '');
  const [loading,        setLoading]        = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed || trimmed === user?.username) {
      setUsernameStatus('idle');
      return;
    }
    if (trimmed.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        const available = await authService.checkUsernameAvailable(trimmed);
        setUsernameStatus(available ? 'available' : 'taken');
      } catch {
        setUsernameStatus('idle');
      }
    }, 400);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [username]);

  const handleNext = async () => {
    if (!name.trim() || !username.trim()) {
      Alert.alert('Required', 'Please enter your name and username.');
      return;
    }
    if (usernameStatus === 'taken') {
      Alert.alert('Username taken', 'Please choose a different username.');
      return;
    }
    if (usernameStatus === 'checking') {
      Alert.alert('Please wait', 'Checking username availability…');
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

  const usernameAdornment = () => {
    if (usernameStatus === 'checking') return <ActivityIndicator size="small" color={Colors.textMuted} />;
    if (usernameStatus === 'available') return <Ionicons name="checkmark-circle" size={20} color="#22C55E" />;
    if (usernameStatus === 'taken')     return <Ionicons name="close-circle" size={20} color="#EF4444" />;
    return null;
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
              <View style={[
                styles.inputRow,
                usernameStatus === 'available' && styles.inputBorderGreen,
                usernameStatus === 'taken'     && styles.inputBorderRed,
              ]}>
                <TextInput
                  style={styles.inputFlex}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="johnsmith"
                  placeholderTextColor={Colors.placeholderText}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
                <View style={styles.adornment}>{usernameAdornment()}</View>
              </View>
              {usernameStatus === 'taken' && (
                <Text style={styles.errorHint}>Username is already taken</Text>
              )}
              {usernameStatus === 'available' && (
                <Text style={styles.successHint}>Username is available!</Text>
              )}
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
            style={[styles.button, (loading || usernameStatus === 'taken') && styles.buttonDisabled]}
            activeOpacity={0.85}
            onPress={handleNext}
            disabled={loading || usernameStatus === 'taken'}
          >
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.buttonText}>Continue</Text>
            }
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

  progressRow:    { flexDirection: 'row', gap: 8, marginBottom: 20 },
  progressDot:    { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.primaryLight },
  progressActive: { backgroundColor: Colors.primary },

  stepLabel:  { fontFamily: Fonts.jostMedium, fontSize: 12, color: Colors.textMuted, marginBottom: 8 },
  heading:    { fontFamily: Fonts.poppinsBold, fontSize: 26, color: Colors.text, marginBottom: 8 },
  subheading: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.textMuted, marginBottom: 32 },

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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputBorderGreen: { borderColor: '#22C55E' },
  inputBorderRed:   { borderColor: '#EF4444' },
  inputFlex: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: Fonts.jost,
    fontSize: 15,
    color: Colors.text,
  },
  adornment: { paddingHorizontal: 12 },

  errorHint:   { fontFamily: Fonts.jost, fontSize: 12, color: '#EF4444', marginTop: 2 },
  successHint: { fontFamily: Fonts.jost, fontSize: 12, color: '#22C55E', marginTop: 2 },

  button:         { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText:     { fontFamily: Fonts.poppinsSemiBold, fontSize: 16, color: Colors.white },
});
