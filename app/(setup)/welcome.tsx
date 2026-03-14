import { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/auth';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const user   = useAuthStore((s) => s.user);

  useEffect(() => {
    const t = setTimeout(() => router.replace('/(setup)/basic-info'), 2400);
    return () => clearTimeout(t);
  }, []);

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.gradient}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.logoCircle}>
          <Image
            source={require('../../assets/Logo Icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.welcome}>Welcome to</Text>
        <Text style={styles.appName}>Recoverly</Text>
        <Text style={styles.tagline}>Let's set up your profile</Text>

        {/* Animated dots */}
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient:   { flex: 1 },
  container:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },

  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoImage: { width: 64, height: 64 },

  welcome: { fontFamily: Fonts.jost,         fontSize: 18, color: Colors.textMuted },
  appName: { fontFamily: Fonts.poppinsBold,  fontSize: 36, color: Colors.primary   },
  tagline: { fontFamily: Fonts.jostMedium,   fontSize: 16, color: Colors.textMuted },

  dots: { flexDirection: 'row', gap: 8, marginTop: 48 },
  dot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primaryLight },
  dotActive: { backgroundColor: Colors.primary, width: 24 },
});
