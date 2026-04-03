import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';

const { width } = Dimensions.get('window');

// 1:1 Figma Palette
const BRAND_GRADIENT = ['#4B0082', '#00D1FF']; // Indigo to Cyan
const SOS_BG = '#F8F7FF';

const CRISIS_OPTIONS = [
  { id: 'feel_like_using', label: "I Feel Like Using", route: '/(app)/sos/feel-like-using' },
  { id: 'just_relapsed', label: "Just Relapsed", route: '/(app)/sos/just-relapsed' },
  { id: 'self_harm', label: "Self-Harm", route: '/(app)/sos/self-harm' },
  { id: 'bad_day', label: "Having a Bad Day", route: '/(app)/sos/bad-day' },
  { id: 'feeling_anxious', label: "Feeling Anxious", route: '/(app)/sos/feeling-anxious' },
];

function AnimatedListOption({ opt, index }: { opt: any, index: number }) {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = 400 + (index * 80);
    translateY.value = withDelay(delay, withSpring(0, { damping: 15 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }]
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.optionCard}
        activeOpacity={0.9}
        onPress={() => router.push(opt.route as any)}
      >
        <Text style={styles.optionLabel}>{opt.label}</Text>
        <View style={styles.optionChevronBg}>
          <Ionicons name="chevron-forward" size={16} color="#4B0082" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function AnimatedHeroCard({ title, icon, index, onPress }: { title: string, icon: string, index: number, onPress: () => void }) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 100;
    scale.value = withDelay(delay, withSpring(1, { damping: 12 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={[styles.heroCardContainer, animatedStyle]}>
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.9} onPress={onPress}>
        <LinearGradient
          colors={BRAND_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroIconBox}>
            <Ionicons name={icon as any} size={22} color="#4B0082" />
          </View>
          <Text style={styles.heroTitle}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function SOSIndexScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={[SOS_BG, Colors.white]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color="#1A1A43" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crisis Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeBlock}>
          <Text style={styles.welcomeTitle}>You're not alone.</Text>
          <Text style={styles.welcomeSub}>Choose an option below to get immediate support.</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.heroRow}>
          <AnimatedHeroCard 
            title="Meeting Now" 
            icon="people" 
            index={0} 
            onPress={() => router.push('/(app)/sos/recommended-meetings')} 
          />
          <AnimatedHeroCard 
            title="Inner Circle" 
            icon="call" 
            index={1} 
            onPress={() => router.push('/(app)/inner-circle')} 
          />
        </View>

        {/* Crisis Options */}
        <View style={styles.optionsList}>
          <Text style={styles.listSectionTitle}>How are you feeling?</Text>
          {CRISIS_OPTIONS.map((opt, idx) => (
            <AnimatedListOption key={opt.id} opt={opt} index={idx} />
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SOS_BG,
  },
  header: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 18,
    color: '#1A1A43',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  scroll: {
    paddingHorizontal: 24,
  },
  welcomeBlock: {
    marginBottom: 32,
    marginTop: 10,
  },
  welcomeTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 28,
    color: '#1A1A43',
  },
  welcomeSub: {
    fontFamily: Fonts.jost,
    fontSize: 15,
    color: '#768DB5',
    marginTop: 4,
    lineHeight: 22,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 40,
  },
  heroCardContainer: {
    flex: 1,
    aspectRatio: 1,
  },
  heroCard: {
    flex: 1,
    borderRadius: 30,
    padding: 24,
    justifyContent: 'flex-end',
    shadowColor: '#4B0082',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  heroIconBox: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 18,
    color: Colors.white,
    lineHeight: 24,
  },
  optionsList: {
    gap: 12,
  },
  listSectionTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 18,
    color: '#1A1A43',
    marginBottom: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  optionLabel: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 16,
    color: '#4B0082', 
  },
  optionChevronBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
