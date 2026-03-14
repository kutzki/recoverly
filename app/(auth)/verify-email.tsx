import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { authService } from '../../services/auth';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

export default function VerifyEmail() {
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [resending, setResending] = useState(false);
  const [resent,    setResent]    = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await authService.resendVerification(email);
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.gradient}
    >
      <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
        {/* Logo */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.logoArea}>
          <Image source={require('../../assets/Logo Icon.png')} style={styles.logoImage} resizeMode="contain" />
        </Animated.View>

        {/* Envelope animation circle */}
        <Animated.View entering={FadeInDown.duration(500).delay(80)} style={styles.iconCircle}>
          <Ionicons name="mail-outline" size={52} color={Colors.primary} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(160)} style={styles.copy}>
          <Text style={styles.heading}>Verify Your Email</Text>
          <Text style={styles.body}>
            We sent a confirmation link to{'\n'}
            <Text style={styles.emailHighlight}>{email ?? 'your email address'}</Text>
          </Text>
          <Text style={styles.instruction}>
            Tap the link in that email to activate your account, then come back here to sign in.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(240)} style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => router.replace('/(auth)/sign-in')}
          >
            <Text style={styles.primaryBtnText}>Go to Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, (resending || resent) && styles.secondaryBtnDisabled]}
            activeOpacity={0.75}
            onPress={handleResend}
            disabled={resending || resent}
          >
            <Text style={styles.secondaryBtnText}>
              {resent ? '✓ Email sent!' : resending ? 'Sending…' : 'Resend verification email'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient:  { flex: 1 },
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 30 },

  logoArea:  { alignItems: 'center', marginBottom: 24 },
  logoImage: { width: 80, height: 80 },

  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },

  copy: { alignItems: 'center', marginBottom: 40 },
  heading: { fontFamily: Fonts.poppinsBold, fontSize: 26, color: Colors.text, marginBottom: 12, textAlign: 'center' },
  body: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  emailHighlight: { fontFamily: Fonts.jostMedium, color: Colors.primary },
  instruction: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 21 },

  actions: { width: '100%', gap: 12 },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: { fontFamily: Fonts.poppinsSemiBold, fontSize: 16, color: Colors.white },

  secondaryBtn: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryBtnDisabled: { opacity: 0.5 },
  secondaryBtnText: { fontFamily: Fonts.poppinsMedium, fontSize: 15, color: Colors.primary },
});
