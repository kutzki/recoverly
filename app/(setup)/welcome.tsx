import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { RecoverlyLogo } from '../../components/ui/RecoverlyLogo';

export default function SetupWelcome() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/(setup)/basic-info');
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      // Blue-tinted gradient matching Figma: light blue → soft purple → white
      colors={['#D6EEFF', '#EDE6FF', '#FFFFFF']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.container}
    >
      {/* ── Centered text block ── */}
      <Animated.View style={[styles.textWrap, { opacity, transform: [{ translateY }] }]}>
        <Text style={styles.welcomeLabel}>Welcome</Text>
        <View style={styles.divider} />
        <Text style={styles.subtitle}>Let's start with some basics</Text>
      </Animated.View>

      {/* ── Logo pinned to the bottom (matches Figma position) ── */}
      <Animated.View style={[styles.logoWrap, { opacity }]}>
        <RecoverlyLogo size={44} showWordmark />
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    alignItems: 'center',
    gap: 14,
  },
  welcomeLabel: {
    fontSize: 50,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -1.5,
    fontFamily: Fonts.generalSansSemiBold,
  },
  divider: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    opacity: 0.4,
  },
  subtitle: {
    fontSize: 17,
    color: Colors.primary,
    fontFamily: Fonts.generalSans,
    letterSpacing: 0.2,
  },
  logoWrap: {
    position: 'absolute',
    bottom: 52,
    alignItems: 'center',
  },
});
