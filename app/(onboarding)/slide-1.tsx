import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Button } from '../../components/ui/Button';

const { width } = Dimensions.get('window');

export default function OnboardingSlide1() {
  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.container}
    >
      {/* Skip */}
      <TouchableOpacity style={styles.skip} onPress={() => router.replace('/(auth)/sign-up')}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Illustration — diverse community on a map */}
      <View style={styles.illustration}>
        {/* Map placeholder */}
        <View style={styles.mapBg}>
          <Ionicons name="map-outline" size={80} color={Colors.primaryLight} />
        </View>
        {/* Avatar bubbles */}
        {[
          { top: 10, left: 30, size: 52, initial: 'A' },
          { top: -10, right: 20, size: 60, initial: 'J' },
          { top: 60, left: 90, size: 56, initial: 'M' },
          { bottom: 10, left: 10, size: 48, initial: 'S' },
          { bottom: 0, right: 10, size: 64, initial: 'R' },
        ].map((av, i) => (
          <View
            key={i}
            style={[styles.avatar, {
              width: av.size, height: av.size, borderRadius: av.size / 2,
              top: av.top, left: (av as any).left, right: (av as any).right,
              bottom: (av as any).bottom,
              backgroundColor: i % 2 === 0 ? Colors.primaryLight : Colors.accentLight,
            }]}
          >
            <Text style={[styles.avatarText, { fontSize: av.size * 0.35 }]}>{av.initial}</Text>
          </View>
        ))}
      </View>

      {/* Text */}
      <View style={styles.content}>
        <Text style={styles.body}>
          We're here to support you on your{'\n'}recovery journey. Let's get started by{'\n'}
          setting up your <Text style={styles.accent}>personalized experience.</Text>
        </Text>

        {/* Dots */}
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Next */}
        <TouchableOpacity style={styles.nextBtn} onPress={() => router.push('/(onboarding)/slide-2')}>
          <Ionicons name="arrow-forward" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  skip: { position: 'absolute', top: 60, right: 24, zIndex: 10 },
  skipText: { color: Colors.primary, fontSize: 15, fontFamily: Fonts.poppinsMedium },
  illustration: {
    height: 260, marginHorizontal: 24, position: 'relative',
    alignItems: 'center', justifyContent: 'center',
  },
  mapBg: {
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.gradientStart,
    alignItems: 'center', justifyContent: 'center',
  },
  avatar: {
    position: 'absolute', alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.white,
  },
  avatarText: { fontFamily: Fonts.poppinsBold, color: Colors.primary },
  content: { flex: 1, paddingHorizontal: 28, paddingBottom: 50, justifyContent: 'flex-end' },
  body: { fontSize: 17, fontFamily: Fonts.jost, color: Colors.text, lineHeight: 26, marginBottom: 32 },
  accent: { color: Colors.primary, fontFamily: Fonts.poppinsSemiBold },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 30 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primaryLight },
  dotActive: { width: 22, backgroundColor: Colors.primary },
  nextBtn: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-end',
  },
});
