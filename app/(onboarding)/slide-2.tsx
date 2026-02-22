import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

export default function OnboardingSlide2() {
  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.container}
    >
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={Colors.primary} />
      </TouchableOpacity>

      {/* Illustration */}
      <View style={styles.illustration}>
        <View style={styles.photoCircle}>
          <View style={styles.photoInner} />
        </View>
        <View style={[styles.iconBubble, styles.lockBubble]}>
          <Ionicons name="lock-closed" size={22} color={Colors.white} />
        </View>
        <View style={[styles.iconBubble, styles.dbBubble]}>
          <Ionicons name="server" size={22} color={Colors.white} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.body}>
          <Text style={styles.accent}>Your privacy is our priority.</Text>{' '}
          We use the information you provide to personalize your experience and support your
          recovery journey. All your data is kept{' '}
          <Text style={styles.accent}>confidential and secure.</Text>
        </Text>

        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={() => router.push('/(onboarding)/slide-3')}>
          <Ionicons name="arrow-forward" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  back: { position: 'absolute', top: 60, left: 20, zIndex: 10, padding: 4 },
  illustration: {
    height: 280, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  photoCircle: {
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  photoInner: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: Colors.primary, opacity: 0.15,
  },
  iconBubble: {
    position: 'absolute', width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  lockBubble: { top: 20, left: 60 },
  dbBubble: { bottom: 30, right: 60 },
  content: { flex: 1, paddingHorizontal: 28, paddingBottom: 50, justifyContent: 'flex-end' },
  body: { fontSize: 16, color: Colors.text, lineHeight: 24, marginBottom: 32 },
  accent: { color: Colors.primary, fontWeight: '600' },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 30 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primaryLight },
  dotActive: { width: 22, backgroundColor: Colors.primary },
  nextBtn: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end',
  },
});
