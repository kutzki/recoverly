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
import { supabase } from '../../services/supabase';

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
      Alert.alert('Email Sent 📬', `If an account exists for ${trimmedEmail}, you'll receive a password reset link shortly.`);
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

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>

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

          <TouchableOpacity style={styles.forgotWrap} onPress={handleForgotPassword}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

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

          {/* Sign in */}
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
    height: 55,   // 210 × (216/830) ≈ 55
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
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 20,
  },
  forgotText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
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
  googleBtnDisabled: { opacity: 0.5 },
  googleTextDisabled: { fontSize: 15, fontWeight: '600', color: Colors.textMuted, flex: 1 },
  soonChip: { backgroundColor: Colors.border, borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2 },
  soonChipText: { fontSize: 10, fontWeight: '700', color: Colors.textMuted },
  signInBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  signInText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupLabel: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  signupLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
