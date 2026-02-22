import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth';

const DOTS = ['', '', ''];

export default function ThankYou() {
  const setProfileComplete = useAuthStore(s => s.updateUser);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 60,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Dot loading animation
    Animated.loop(
      Animated.timing(dotAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      })
    ).start();

    // Navigate to home after delay
    const timer = setTimeout(() => {
      setProfileComplete({ isProfileComplete: true });
      router.replace('/(app)/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          { opacity, transform: [{ scale }] },
        ]}
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

        {/* Check icon */}
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={40} color={Colors.white} />
        </View>

        <Text style={styles.thankYou}>Thank you.</Text>
        <Text style={styles.subtitle}>We are setting up your profile</Text>

        {/* Loading dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2].map(i => (
            <Animated.View
              key={i}
              style={[
                styles.loadDot,
                {
                  opacity: dotAnim.interpolate({
                    inputRange: [
                      Math.max(0, i * 0.3 - 0.1),
                      i * 0.3,
                      i * 0.3 + 0.3,
                      Math.min(1, i * 0.3 + 0.4),
                    ],
                    outputRange: [0.3, 1, 1, 0.3],
                    extrapolate: 'clamp',
                  }),
                  transform: [{
                    scale: dotAnim.interpolate({
                      inputRange: [
                        Math.max(0, i * 0.3),
                        i * 0.3 + 0.15,
                        Math.min(1, i * 0.3 + 0.3),
                      ],
                      outputRange: [1, 1.4, 1],
                      extrapolate: 'clamp',
                    }),
                  }],
                },
              ]}
            />
          ))}
        </View>
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
  content: {
    alignItems: 'center',
    gap: 20,
  },
  logoWrap: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  logoOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMid: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    opacity: 0.35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    opacity: 0.9,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.6,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  thankYou: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  loadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
});
