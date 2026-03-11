import { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/auth';
import { Colors } from '../constants/colors';

export default function SplashScreen() {
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (isLoading) return;
    // Read state at callback time, not as deps — avoids re-arming the timer on
    // every store update and guarantees we navigate exactly once after load.
    const timer = setTimeout(() => {
      const { isAuthenticated, user } = useAuthStore.getState();
      if (isAuthenticated && user) {
        // isProfileComplete is now persisted to DB.
        // Also use a heuristic fallback for existing accounts created before this
        // fix was deployed (when is_profile_complete was never written to DB).
        const profileDone =
          user.isProfileComplete ||
          Boolean(user.sobrietyStartDate) ||
          (user.challenges && user.challenges.length > 0) ||
          Boolean(user.shortTermGoal);
        router.replace(profileDone ? '/(app)/home' : '/(setup)/welcome');
      } else {
        router.replace('/(onboarding)/slide-1');
      }
    }, 2200);
    return () => clearTimeout(timer);
  }, [isLoading]);

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
