import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth';
import { RecoverlyLogo } from '../../components/ui/RecoverlyLogo';

export default function ThankYou() {
  const setProfileComplete = useAuthStore(s => s.updateUser);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
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
      colors={['#D6EEFF', '#EDE6FF', '#FFFFFF']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.container}
    >
      {/* ── Centered text block ── */}
      <Animated.View style={[styles.textWrap, { opacity, transform: [{ translateY }] }]}>
        <Text style={styles.heading}>Thank you.</Text>

        {/* Subtitle + animated dots */}
        <View style={styles.subtitleRow}>
          <Text style={styles.subtitle}>We are setting up your profile</Text>
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
                    translateY: dotAnim.interpolate({
                      inputRange: [
                        Math.max(0, i * 0.3),
                        i * 0.3 + 0.15,
                        Math.min(1, i * 0.3 + 0.3),
                      ],
                      outputRange: [0, -4, 0],
                      extrapolate: 'clamp',
                    }),
                  }],
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>

      {/* ── Logo pinned to the bottom (matches Figma) ── */}
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
    gap: 16,
  },
  heading: {
    fontSize: 50,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -1.5,
    fontFamily: 'GeneralSans-Semibold',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.primary,
    fontFamily: 'GeneralSans-Regular',
    letterSpacing: 0.1,
  },
  loadDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
    marginTop: 2,
  },
  logoWrap: {
    position: 'absolute',
    bottom: 52,
    alignItems: 'center',
  },
});
