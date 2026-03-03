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
import { Fonts } from '../../constants/fonts';
import { useAuth } from '../../hooks/useAuth';
import { RecoverlyLogo } from '../../components/ui/RecoverlyLogo';

function getPasswordStrength(pw: string): { label: string; color: string; pct: string } | null {
  if (!pw) return null;
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const score = (pw.length >= 8 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);
  if (score <= 1) return { label: 'Weak', color: Colors.feedLike, pct: '25%' };
  if (score === 2) return { label: 'Fair', color: Colors.feedAmber, pct: '50%' };
  if (score === 3) return { label: 'Good', color: Colors.goalBlue, pct: '75%' };
  return { label: 'Strong', color: Colors.goalGreen, pct: '100%' };
}

export default function SignUp() {
  const { signUp, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const strength = getPasswordStrength(password);

  const handleProceed = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    if (strength?.label === 'Weak' || strength?.label === 'Fair') {
      Alert.alert('Password too weak', 'Include uppercase letters, numbers, or special characters to make it stronger.');
      return;
    }
    try {
      const result = await signUp(trimmedEmail, password);
      if (result.token === 'pending_email_confirmation') {
        Alert.alert(
          'Check your email',
          `We sent a confirmation link to ${trimmedEmail}. Please verify your email then sign in.`,
          [{ text: 'Go to Sign In', onPress: () => router.replace('/(auth)/sign-in') }]
        );
      } else {
        router.replace('/(setup)/welcome');
      }
    } catch (err: any) {
      Alert.alert('Sign up failed', err.message || 'Please try again.');
    }
  };

  const handleGoogle = () => {
    Alert.alert('Coming soon', 'Google sign-in will be available in the next update.');
  };

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
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
          {/* Back — filled purple circle */}
          <TouchableOpacity style={styles.back} onPress={() => router.back()} accessibilityLabel="Go back">
            <View style={styles.backCircle}>
              <Ionicons name="chevron-back" size={20} color={Colors.white} />
            </View>
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Sign up</Text>
          <Text style={styles.subtitle}>Join thousands on their recovery journey</Text>

          {/* Email */}
          <Text style={styles.fieldLabel}>Email</Text>
          <View style={[styles.inputWrap, focusedField === 'email' && styles.inputFocused]}>
            <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={Colors.textLight}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Password */}
          <Text style={styles.fieldLabel}>Password</Text>
          <View style={[styles.inputWrap, focusedField === 'password' && styles.inputFocused]}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="••••••••"
              placeholderTextColor={Colors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              returnKeyType="done"
              onSubmitEditing={handleProceed}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Password strength */}
          {strength && (
            <View style={styles.strengthWrap}>
              <View style={styles.strengthTrack}>
                <View style={[styles.strengthFill, { width: strength.pct, backgroundColor: strength.color }]} />
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
            </View>
          )}

          {/* Or divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Continue with Google */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogle}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-google" size={18} color="#4285F4" />
            <Text style={styles.googleText}>Continue with Google</Text>
            <View style={styles.soonChip}><Text style={styles.soonChipText}>SOON</Text></View>
          </TouchableOpacity>

          {/* Proceed */}
          <TouchableOpacity
            style={[styles.proceedBtn, isLoading && styles.proceedDisabled]}
            onPress={handleProceed}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.proceedText}>Proceed</Text>
            )}
          </TouchableOpacity>

          {/* Sign in link */}
          <View style={styles.signinRow}>
            <Text style={styles.signinLabel}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')}>
              <Text style={styles.signinLink}>Sign in</Text>
            </TouchableOpacity>
          </View>

          {/* Logo at bottom */}
          <View style={styles.logoWrap}>
            <RecoverlyLogo size={36} showWordmark />
          </View>
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
    paddingHorizontal: 28,
    paddingBottom: 40,
  },

  /* Back button — filled purple circle */
  back: {
    position: 'absolute',
    top: 12,
    left: 20,
    zIndex: 10,
  },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Title */
  title: {
    fontSize: 26,
    fontFamily: Fonts.generalSansSemiBold,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 44,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
  },

  /* Field label */
  fieldLabel: {
    fontSize: 13,
    fontFamily: Fonts.generalSansMedium,
    color: Colors.text,
    marginBottom: 6,
  },

  /* Input */
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    marginBottom: 18,
    height: 52,
  },
  inputFocused: {
    borderColor: Colors.primary,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  passwordInput: {
    paddingRight: 8,
  },
  eyeBtn: {
    padding: 4,
  },

  /* Password strength */
  strengthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: -12,
    marginBottom: 16,
  },
  strengthTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontFamily: Fonts.generalSansMedium,
    minWidth: 44,
    textAlign: 'right',
  },

  /* Or divider */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textMuted,
    fontSize: 13,
  },

  /* Google button */
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Colors.border,
    height: 52,
    marginBottom: 20,
  },
  googleText: {
    fontSize: 15,
    fontFamily: Fonts.generalSansMedium,
    color: Colors.text,
  },
  soonChip: {
    backgroundColor: Colors.border,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  soonChipText: {
    fontSize: 10,
    fontFamily: Fonts.generalSansBold,
    color: Colors.textMuted,
  },

  /* Proceed button — full pill */
  proceedBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  proceedDisabled: {
    opacity: 0.7,
  },
  proceedText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.generalSansBold,
  },

  /* Sign in link */
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  signinLabel: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  signinLink: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: Fonts.generalSansSemiBold,
  },

  /* Logo at bottom */
  logoWrap: {
    alignItems: 'center',
    paddingBottom: 8,
  },
});
