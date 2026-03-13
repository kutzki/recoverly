import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { useAuthStore } from '../../store/auth';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

export default function ThankYouScreen() {
  const insets     = useSafeAreaInsets();
  const updateUser = useAuthStore((s) => s.updateUser);

  const scale   = useSharedValue(0);
  const opacity = useSharedValue(0);
  const textOp  = useSharedValue(0);

  useEffect(() => {
    // Trigger profile completion + navigate
    updateUser({ is_profile_complete: true }).catch(() => {});

    scale.value   = withSpring(1, { damping: 12, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 400 });
    textOp.value  = withDelay(500, withTiming(1, { duration: 500 }));

    const t = setTimeout(() => router.replace('/(app)/home'), 2600);
    return () => clearTimeout(t);
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({ opacity: textOp.value }));

  return (
    <LinearGradient colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]} style={styles.gradient}>
      <View style={[styles.center, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Animated.View style={[styles.emojiCircle, circleStyle]}>
          <Text style={styles.emoji}>🎉</Text>
        </Animated.View>

        <Animated.View style={[styles.textBlock, textStyle]}>
          <Text style={styles.heading}>You're all set!</Text>
          <Text style={styles.subheading}>
            Your recovery journey starts now. We're here for you every step of the way.
          </Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 32,
  },
  emojiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  emoji: { fontSize: 56 },
  textBlock: { alignItems: 'center', gap: 12 },
  heading: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 30,
    color: Colors.text,
    textAlign: 'center',
  },
  subheading: {
    fontFamily: Fonts.jost,
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
});
