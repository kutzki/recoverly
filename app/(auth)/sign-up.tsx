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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';

function getPasswordStrength(pw: string): { label: string; color: string; pct: string } | null {
  if (!pw) return null;
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const score = (pw.length >= 8 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);
  if (score <= 1) return { label: 'Weak', color: '#EF4444', pct: '25%' };
  if (score === 2) return { label: 'Fair', color: '#F59E0B', pct: '50%' };
  if (score === 3) return { label: 'Good', color: '#3B82F6', pct: '75%' };
  return { label: 'Strong', color: '#10B981', pct: '100%' };
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
          'Check your email 📬',
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
    // SSO — placeholder for Google OAuth
    Alert.alert('Coming soon', 'Google sign-in will be available in the next update.');
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

          {/* Logo */}
          <View style={styles.logoRow}>
            <Image
              source={require('../../assets/logo-horizontal.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Join thousands on their recovery journey</Text>

          {/* Email */}
          <View style={[styles.inputWrap, focusedField === 'email' && styles.inputFocused]}>
            <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={Colors.textMuted}
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
          <View style={[styles.inputWrap, focusedField === 'password' && styles.inputFocused]}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Password"
              placeholderTextColor={Colors.textMuted}
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

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google — coming soon */}
          <TouchableOpacity style={[styles.googleBtn, styles.googleBtnDisabled]} onPress={handleGoogle} activeOpacity={0.6}>
            <Ionicons name="logo-google" size={20} color={Colors.textMuted} />
            <Text style={styles.googleTextDisabled}>Continue with Google</Text>
            <View style={styles.soonChip}><Text style={styles.soonChipText}>Soon</Text></View>
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
  back: {
    position: 'absolute',
    top: 0,
    left: -8,
    zIndex: 10,
    padding: 4,
  },
  logoRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 48,
    marginBottom: 32,
  },
  logoImage: {
    width: 210,
    height: 55,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    marginBottom: 32,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    marginBottom: 14,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
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
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    height: 52,
    marginBottom: 16,
  },
  googleText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  proceedBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  proceedDisabled: {
    opacity: 0.7,
  },
  proceedText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signinLabel: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  signinLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  googleBtnDisabled: { opacity: 0.5 },
  googleTextDisabled: { fontSize: 15, fontWeight: '600', color: Colors.textMuted, flex: 1 },
  soonChip: { backgroundColor: Colors.border, borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2 },
  soonChipText: { fontSize: 10, fontWeight: '700', color: Colors.textMuted },
  strengthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: -8,
    marginBottom: 12,
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
    fontWeight: '600',
    minWidth: 44,
    textAlign: 'right',
  },
});
