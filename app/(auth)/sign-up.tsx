import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Image,
  TextInput as RNTextInput,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { authService } from '../../services/auth';
import { useAuthStore } from '../../store/auth';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

export default function SignUp() {
  const insets      = useSafeAreaInsets();
  const setAuth     = useAuthStore((s) => s.setAuth);
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const passwordRef = useRef<RNTextInput>(null);
  const confirmRef  = useRef<RNTextInput>(null);

  const handleSignUp = async () => {
    if (!email.trim() || !password || !confirm) return;
    if (password !== confirm) {
      Alert.alert('Passwords don\'t match', 'Please make sure both passwords are the same.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Password too short', 'Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await authService.signUp(email.trim().toLowerCase(), password);
      const { session, profile } = await authService.signIn(email.trim().toLowerCase(), password);
      if (session && profile) {
        await setAuth(profile, session.access_token);
        router.replace('/(setup)/welcome');
      }
    } catch (e: any) {
      Alert.alert('Sign Up Failed', e.message ?? 'Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <Animated.View entering={FadeInDown.duration(400).delay(0)} style={styles.logoArea}>
            <Image
              source={require('../../assets/Logo Icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(80)}>
            <Text style={styles.heading}>Create Account</Text>
            <Text style={styles.subheading}>Start your recovery journey today</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(160)} style={styles.form}>
            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={Colors.placeholderText}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputRow}>
                <TextInput
                  ref={passwordRef}
                  style={styles.inputFlex}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min. 8 characters"
                  placeholderTextColor={Colors.placeholderText}
                  secureTextEntry={!showPass}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPass((v) => !v)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPass ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputRow}>
                <TextInput
                  ref={confirmRef}
                  style={styles.inputFlex}
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="Re-enter password"
                  placeholderTextColor={Colors.placeholderText}
                  secureTextEntry={!showConf}
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
                />
                <TouchableOpacity
                  onPress={() => setShowConf((v) => !v)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showConf ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              activeOpacity={0.85}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Creating account…' : 'Create Account'}</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(240)} style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  kav:      { flex: 1 },
  scroll:   { flexGrow: 1, paddingHorizontal: 30, alignItems: 'center' },

  logoArea:  { alignItems: 'center', marginBottom: 40 },
  logoImage: { width: 120, height: 120 },

  heading:    { fontFamily: Fonts.poppinsBold, fontSize: 26, color: Colors.text, marginBottom: 8, textAlign: 'center' },
  subheading: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.textMuted, marginBottom: 36, textAlign: 'center' },

  form: { width: '100%', gap: 16, marginBottom: 32 },

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
  inputFlex: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: Fonts.jost,
    fontSize: 15,
    color: Colors.text,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  button: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontFamily: Fonts.poppinsSemiBold, fontSize: 16, color: Colors.white },

  footer:     { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted },
  footerLink: { fontFamily: Fonts.poppinsMedium, fontSize: 14, color: Colors.primary },
});
