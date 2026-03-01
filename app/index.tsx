import { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
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
        // isProfileComplete is now persisted to DB.
        // Also use a heuristic fallback for existing accounts created before this
        // fix was deployed (when is_profile_complete was never written to DB).
        const profileDone =
          user.isProfileComplete ||
          Boolean(user.sobrietyStartDate) ||
          (user.challenges && user.challenges.length > 0) ||
          Boolean(user.shortTermGoal);
        if (profileDone) {
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
      <Image
        source={require('../assets/logo-vertical.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
      <Text style={styles.tagline}>Your Recovery Companion.</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  logoImage: {
    width: 180,
    height: 180,  // logo-vertical is roughly square (icon + wordmark stacked)
  },
  tagline: { fontSize: 16, color: Colors.textMuted, fontWeight: '400' },
});
