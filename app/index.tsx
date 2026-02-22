import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/auth';
import { Colors } from '../constants/colors';

export default function SplashScreen() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        if (user.isProfileComplete) {
          router.replace('/(app)/home');
        } else {
          router.replace('/(setup)/welcome');
        }
      } else {
        router.replace('/(onboarding)/slide-1');
      }
    }, 2200);
    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, user]);

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.container}
    >
      <View style={styles.logoWrap}>
        <View style={styles.logoOuter} />
        <View style={styles.logoMid} />
        <View style={styles.logoInner} />
      </View>
      <Text style={styles.wordmark}>recoverly</Text>
      <Text style={styles.tagline}>Your Recovery Companion.</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  logoWrap: {
    width: 110,
    height: 110,
    marginBottom: 20,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoOuter: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.primaryLight,
  },
  logoMid: {
    position: 'absolute',
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: Colors.primary,
    opacity: 0.3,
  },
  logoInner: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
  },
  wordmark: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.8,
    marginTop: 8,
  },
  tagline: { fontSize: 16, color: Colors.textMuted, fontWeight: '400' },
});
