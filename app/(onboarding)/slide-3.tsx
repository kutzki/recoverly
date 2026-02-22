import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

const FEATURES = [
  { icon: 'timer-outline' as const, label: 'Track your sobriety' },
  { icon: 'people-outline' as const, label: 'Connect with a community' },
  { icon: 'shield-checkmark-outline' as const, label: 'SOS crisis support' },
  { icon: 'journal-outline' as const, label: 'Daily check-ins & journal' },
];

export default function OnboardingSlide3() {
  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.container}
    >
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={Colors.primary} />
      </TouchableOpacity>

      {/* Illustration — glowing ring with icon */}
      <View style={styles.illustration}>
        <View style={styles.outerRing} />
        <View style={styles.midRing} />
        <View style={styles.innerCircle}>
          <Ionicons name="heart" size={44} color={Colors.white} />
        </View>
        {/* Floating feature bubbles */}
        <View style={[styles.bubble, styles.bubble1]}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
        </View>
        <View style={[styles.bubble, styles.bubble2]}>
          <Ionicons name="star" size={18} color={Colors.accent} />
        </View>
        <View style={[styles.bubble, styles.bubble3]}>
          <Ionicons name="flash" size={18} color={Colors.success} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.headline}>
          Start your{' '}
          <Text style={styles.accent}>recovery</Text>
          {'\n'}journey today.
        </Text>

        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIconWrap}>
                <Ionicons name={f.icon} size={18} color={Colors.primary} />
              </View>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* Pagination dots */}
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>

        {/* CTAs */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/(auth)/sign-up')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push('/(auth)/sign-in')}
          activeOpacity={0.75}
        >
          <Text style={styles.secondaryBtnText}>
            Already have an account?{' '}
            <Text style={styles.signInLink}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  back: { position: 'absolute', top: 60, left: 20, zIndex: 10, padding: 4 },

  illustration: {
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primaryLight,
    opacity: 0.4,
  },
  midRing: {
    position: 'absolute',
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: Colors.primaryLight,
    opacity: 0.7,
  },
  innerCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  bubble: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  bubble1: { top: 30, left: width * 0.15 },
  bubble2: { top: 30, right: width * 0.15 },
  bubble3: { bottom: 20, right: width * 0.22 },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingBottom: 48,
    justifyContent: 'flex-end',
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 36,
    marginBottom: 24,
  },
  accent: { color: Colors.primary },

  features: { gap: 10, marginBottom: 28 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: { fontSize: 14, color: Colors.text, fontWeight: '500' },

  dots: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primaryLight },
  dotActive: { width: 22, backgroundColor: Colors.primary },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },

  secondaryBtn: { alignItems: 'center', paddingVertical: 4 },
  secondaryBtnText: { fontSize: 14, color: Colors.textMuted },
  signInLink: { color: Colors.primary, fontWeight: '600' },
});
