import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function SetupWelcome() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

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
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.container}
    >
      {/* Logo */}
      <View style={styles.logoWrap}>
        <View style={styles.logoOuter}>
          <View style={styles.logoMid}>
            <View style={styles.logoInner} />
          </View>
        </View>
        <Text style={styles.logoText}>recoverly</Text>
      </View>

      <Animated.View style={[styles.textWrap, { opacity, transform: [{ translateY }] }]}>
        <Text style={styles.welcomeLabel}>Welcome</Text>
        <View style={styles.divider} />
        <Text style={styles.subtitle}>Let's start with some basics.</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
  },
  logoWrap: {
    alignItems: 'center',
    gap: 14,
  },
  logoOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMid: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.primary,
    opacity: 0.35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    opacity: 0.9,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.8,
  },
  textWrap: {
    alignItems: 'center',
    gap: 12,
  },
  welcomeLabel: {
    fontSize: 38,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -1,
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
    color: Colors.textMuted,
    fontWeight: '400',
  },
});
