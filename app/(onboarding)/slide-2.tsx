import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

const { width } = Dimensions.get('window');

export default function Slide2() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.gradient}
    >
      <View style={[styles.container, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.illustration}>
          <View style={styles.illustrationInner}>
            <Text style={styles.illustrationIcon}>📊</Text>
          </View>
        </View>

        <View style={styles.copy}>
          <Text style={styles.heading}>Track Your Journey</Text>
          <Text style={styles.body}>
            Log daily check-ins, celebrate milestones, and watch your sobriety streak grow day
            by day.
          </Text>
        </View>

        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => router.push('/(onboarding)/slide-3')}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient:  { flex: 1 },
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 30 },

  illustration: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  illustrationInner: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: 'rgba(183,64,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationIcon: { fontSize: 80 },

  copy: { alignItems: 'center', marginBottom: 40 },
  heading: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 28,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  body: {
    fontFamily: Fonts.jost,
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },

  dots: { flexDirection: 'row', gap: 8, marginBottom: 40 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryLight,
  },
  dotActive: { backgroundColor: Colors.primary, width: 24 },

  button: {
    backgroundColor: Colors.primary,
    width: width - 60,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: { fontFamily: Fonts.poppinsSemiBold, fontSize: 16, color: Colors.white },

  skip: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted },
});
