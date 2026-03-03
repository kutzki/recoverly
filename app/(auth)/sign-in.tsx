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
import { supabase } from '../../services/supabase';
import { RecoverlyLogo } from '../../components/ui/RecoverlyLogo';

export default function SignIn() {
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSignIn = async () => {
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
    try {
      const result = await signIn(trimmedEmail, password);
      if (result.user.isProfileComplete) {
        router.replace('/(app)/home');
      } else {
        router.replace('/(setup)/welcome');
      }
    } catch (err: any) {
      Alert.alert('Sign in failed', err.message || 'Please check your credentials and try again.');
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('Email Required', 'Enter your email address above first, then tap "Forgot password?"');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    try {
      await supabase.auth.resetPasswordForEmail(trimmedEmail);
      Alert.alert('Email Sent', `If an account exists for ${trimmedEmail}, you'll receive a password reset link shortly.`);
    } catch (err: any) {
      console.error('[SignIn] resetPasswordForEmail error:', err);
      Alert.alert('Error', 'Could not send reset email. Please try again later.');
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
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>Welcome back to your recovery journey</Text>

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
              autoComplete="current-password"
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
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

          {/* Forgot password */}
          <TouchableOpacity style={styles.forgotWrap} onPress={handleForgotPassword}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

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

          {/* Sign In */}
          <TouchableOpacity
            style={[styles.signInBtn, isLoading && styles.btnDisabled]}
            onPress={handleSignIn}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.signInText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Sign up link */}
          <View style={styles.signupRow}>
            <Text style={styles.signupLabel}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/sign-up')}>
              <Text style={styles.signupLink}>Sign up</Text>
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

  /* Forgot password */
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 20,
  },
  forgotText: {
    color: Colors.primary,
    fontSize: 13,
    fontFamily: Fonts.generalSansMedium,
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

  /* Sign in button — full pill */
  signInBtn: {
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
  btnDisabled: {
    opacity: 0.7,
  },
  signInText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.generalSansBold,
  },

  /* Sign up link */
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  signupLabel: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  signupLink: {
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
