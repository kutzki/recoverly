import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, ScrollView, Image, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { authService } from '../../services/auth';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

export default function ForgotPassword() {
  const insets = useSafeAreaInsets();
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleReset = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await authService.resetPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not send reset email.');
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
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>

          {/* Logo */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.logoArea}>
            <Image source={require('../../assets/Logo Icon.png')} style={styles.logoImage} resizeMode="contain" />
          </Animated.View>

          {sent ? (
            /* Success state */
            <Animated.View entering={FadeInDown.duration(400).delay(80)} style={styles.successBox}>
              <Ionicons name="mail-open-outline" size={48} color={Colors.primary} style={{ marginBottom: 16 }} />
              <Text style={styles.heading}>Check Your Email</Text>
              <Text style={styles.subheading}>
                We've sent a password reset link to{'\n'}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>
              <Text style={styles.hint}>Didn't receive it? Check your spam folder, or</Text>
              <TouchableOpacity onPress={() => setSent(false)}>
                <Text style={styles.resendLink}>try a different email address</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { marginTop: 32 }]}
                activeOpacity={0.85}
                onPress={() => router.replace('/(auth)/sign-in')}
              >
                <Text style={styles.buttonText}>Back to Sign In</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            /* Form state */
            <>
              <Animated.View entering={FadeInDown.duration(400).delay(80)}>
                <Text style={styles.heading}>Forgot Password?</Text>
                <Text style={styles.subheading}>
                  Enter your email and we'll send you a link to reset your password.
                </Text>
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(400).delay(160)} style={styles.form}>
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
                    returnKeyType="done"
                    onSubmitEditing={handleReset}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  activeOpacity={0.85}
                  onPress={handleReset}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>{loading ? 'Sending…' : 'Send Reset Link'}</Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(400).delay(240)} style={styles.footer}>
                <Text style={styles.footerText}>Remember your password? </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.footerLink}>Sign In</Text>
                </TouchableOpacity>
              </Animated.View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  kav:      { flex: 1 },
  scroll:   { flexGrow: 1, paddingHorizontal: 30, alignItems: 'center' },

  back: { alignSelf: 'flex-start', padding: 4, marginBottom: 16 },

  logoArea:  { alignItems: 'center', marginBottom: 32 },
  logoImage: { width: 100, height: 100 },

  successBox: { alignItems: 'center', width: '100%' },

  heading:    { fontFamily: Fonts.poppinsBold, fontSize: 26, color: Colors.text, marginBottom: 8, textAlign: 'center' },
  subheading: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.textMuted, marginBottom: 32, textAlign: 'center', lineHeight: 22 },
  emailHighlight: { fontFamily: Fonts.jostMedium, color: Colors.primary },

  hint: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginTop: 16 },
  resendLink: { fontFamily: Fonts.poppinsMedium, fontSize: 13, color: Colors.primary, textAlign: 'center', marginTop: 4 },

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

  button: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontFamily: Fonts.poppinsSemiBold, fontSize: 16, color: Colors.white },

  footer:     { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted },
  footerLink: { fontFamily: Fonts.poppinsMedium, fontSize: 14, color: Colors.primary },
});
