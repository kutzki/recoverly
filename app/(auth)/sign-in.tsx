import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
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
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  /* ── Entrance animations ── */
  const logoAnim   = useRef(new Animated.Value(0)).current;
  const titleAnim  = useRef(new Animated.Value(0)).current;
  const formAnim   = useRef(new Animated.Value(0)).current;
  const btnAnim    = useRef(new Animated.Value(0)).current;
  const btnScale   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(logoAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(titleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(formAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(btnAnim,   { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const fadeUp = (anim: Animated.Value, offsetY = 20) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [offsetY, 0] }) }],
  });

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
      Alert.alert('Email Sent', `If an account exists for ${trimmedEmail}, you'll receive a reset link shortly.`);
    } catch (err: any) {
      Alert.alert('Error', 'Could not send reset email. Please try again later.');
    }
  };

  const handleBtnPressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start();
  const handleBtnPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

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
          {/* Back button */}
          <TouchableOpacity style={styles.back} onPress={() => router.back()} accessibilityLabel="Go back">
            <View style={styles.backCircle}>
              <Ionicons name="chevron-back" size={20} color={Colors.white} />
            </View>
          </TouchableOpacity>

          {/* Logo */}
          <Animated.View style={[styles.logoWrapTop, fadeUp(logoAnim, -10)]}>
            <RecoverlyLogo size={48} showWordmark />
          </Animated.View>

          {/* Title */}
          <Animated.View style={fadeUp(titleAnim)}>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>Welcome back to your recovery journey</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={fadeUp(formAnim)}>
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

            <TouchableOpacity style={styles.forgotWrap} onPress={handleForgotPassword}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google (soon) */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={() => Alert.alert('Coming soon', 'Google sign-in will be available in the next update.')}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={18} color="#4285F4" />
              <Text style={styles.googleText}>Continue with Google</Text>
              <View style={styles.soonChip}>
                <Text style={styles.soonChipText}>SOON</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* CTA */}
          <Animated.View style={[fadeUp(btnAnim), { transform: [...(fadeUp(btnAnim).transform || []), { scale: btnScale }] }]}>
            <TouchableOpacity
              style={[styles.signInBtn, isLoading && styles.btnDisabled]}
              onPress={handleSignIn}
              onPressIn={handleBtnPressIn}
              onPressOut={handleBtnPressOut}
              activeOpacity={1}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.signInText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

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

  logoWrapTop: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },

  title: {
    fontSize: 26,
    fontFamily: Fonts.poppinsSemiBold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.jost,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
  },

  fieldLabel: {
    fontSize: 13,
    fontFamily: Fonts.poppinsMedium,
    color: Colors.text,
    marginBottom: 6,
  },
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
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.jost,
    color: Colors.text,
  },
  passwordInput: { paddingRight: 8 },
  eyeBtn: { padding: 4 },

  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 20,
  },
  forgotText: {
    color: Colors.primary,
    fontSize: 13,
    fontFamily: Fonts.poppinsMedium,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textMuted, fontSize: 13, fontFamily: Fonts.jost },

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
    fontFamily: Fonts.poppinsMedium,
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
    fontFamily: Fonts.poppinsBold,
    color: Colors.textMuted,
  },

  signInBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  btnDisabled: { opacity: 0.7 },
  signInText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.poppinsBold,
  },

  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  signupLabel: { color: Colors.textMuted, fontSize: 14, fontFamily: Fonts.jost },
  signupLink: { color: Colors.primary, fontSize: 14, fontFamily: Fonts.poppinsSemiBold },
});
