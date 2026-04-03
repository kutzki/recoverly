import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  withRepeat,
  withDelay,
  Easing 
} from 'react-native-reanimated';
import { useUIStore } from '../../store/ui';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

const { width } = Dimensions.get('window');

// 1. Progress Bar Component with animated width and number
function AnimatedProgressBar({ current, total, delay }: { current: number, total: number, delay: number }) {
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withDelay(delay, withSpring(current / total, { damping: 14, stiffness: 90 }));
  }, []);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`
  }));

  return (
    <View style={styles.barTrack}>
      <Animated.View style={[styles.barFill, fillStyle]} />
      <View style={StyleSheet.absoluteFill}>
        <AnimatedNumber endValue={current} delay={delay} total={total} />
      </View>
    </View>
  );
}

// Custom animated number component using standard React state since UI Thread TextInput hack requires more boilerplate
function AnimatedNumber({ endValue, delay, total }: { endValue: number, delay: number, total: number }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    let started = false;

    const animate = (time: number) => {
      if (!started) {
         started = true;
         startTime = time + delay;
      }
      if (time > startTime) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / 1200, 1); // 1.2s duration
        setVal(Math.floor(progress * endValue));
      }
      
      if (time - startTime < 1200) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [endValue, delay]);

  return (
    <View style={styles.barTextWrap}>
      <Text style={styles.barText}>{val}/{total}</Text>
    </View>
  );
}

function FirstChallengeCard() {
  const spinVal = useSharedValue(0);

  useEffect(() => {
    spinVal.value = withRepeat(
      withTiming(360, { duration: 15000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinVal.value}deg` }]
  }));

  return (
    <View style={styles.challengeCard}>
      <View style={styles.challengeLeft}>
        <Text style={styles.challengeLabel}>First Challenge</Text>
        <Text style={styles.challengeTitle}>30 Days,{'\n'}30 Journals</Text>
        <TouchableOpacity style={styles.getStartedBtn}>
          <Text style={styles.getStartedTxt}>Get Started</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.challengeRight}>
        <Animated.Text style={[styles.giantMedal, spinStyle]}>🏵️</Animated.Text>
      </View>
    </View>
  );
}

const ACHIEVEMENTS = [
  { id: '1', title: '30 Meetings in 30 days', current: 10, target: 30 },
  { id: '2', title: 'Contact 30 fellowships', current: 10, target: 30 },
  { id: '3', title: 'Make 10 posts', current: 5, target: 10 },
  { id: '4', title: 'Check in for a week', current: 7, target: 7 },
];

function AchievementRow({ item, index }: { item: any; index: number }) {
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 150;
    translateY.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 100 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
  }, []);

  const rStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.achieveRow, rStyle]}>
      <View style={styles.achieveIconWrap}>
        <Text style={styles.achieveIcon}>🎖️</Text>
      </View>
      <View style={styles.achieveContent}>
        <Text style={styles.achieveTitle}>{item.title}</Text>
        <AnimatedProgressBar current={item.current} total={item.target} delay={index * 150 + 300} />
      </View>
      <View style={styles.achieveCheck}>
        <Ionicons name="checkmark" size={24} color="#3B0061" />
      </View>
    </Animated.View>
  );
}

export default function AwardsScreen() {
  const insets = useSafeAreaInsets();
  const openMenu = useUIStore((s) => s.openMenu);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity onPress={openMenu} style={[styles.iconBtn, { backgroundColor: 'transparent' }]}>
          <Ionicons name="menu" size={28} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Title Area */}
        <View style={styles.titleArea}>
          <Text style={styles.mainTitle}>Achievements</Text>
          <Text style={styles.subTitle}>Take a few moments to document your feelings and experiences.</Text>
        </View>

        {/* Horizontal Challenge Strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.challengeStrip}>
          <FirstChallengeCard />
          {/* Optional second card */}
          <View style={[styles.challengeCard, { backgroundColor: '#E8DCFF' }]}>
             <View style={styles.challengeLeft}>
              <Text style={styles.challengeLabel}>Group Challenge</Text>
              <Text style={styles.challengeTitle}>30 Days,{'\n'}30 Meetings</Text>
              <TouchableOpacity style={styles.getStartedBtn}>
                <Text style={styles.getStartedTxt}>Get Started</Text>
              </TouchableOpacity>
            </View>
             <View style={styles.challengeRight}>
              <Text style={[styles.giantMedal, { fontSize: 70 }]}>✨</Text>
            </View>
          </View>
        </ScrollView>

        {/* List */}
        <Text style={styles.sectionHeading}>Achievements</Text>
        <View style={styles.listWrap}>
          {ACHIEVEMENTS.map((item, index) => (
            <AchievementRow key={item.id} item={item} index={index} />
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  titleArea: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  mainTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 28,
    color: '#3B0061',
    marginBottom: 8,
  },
  subTitle: {
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: Colors.textLight,
  },
  challengeStrip: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  challengeCard: {
    width: width * 0.75,
    height: 180,
    backgroundColor: '#D7F5FF',
    borderRadius: 24,
    flexDirection: 'row',
    padding: 24,
    overflow: 'hidden',
  },
  challengeLeft: {
    flex: 1.2,
    justifyContent: 'space-between',
  },
  challengeLabel: {
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: Colors.text,
  },
  challengeTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 20,
    color: Colors.text,
  },
  getStartedBtn: {
    backgroundColor: '#b740ff',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  getStartedTxt: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 12,
    color: Colors.white,
  },
  challengeRight: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giantMedal: {
    fontSize: 90,
  },
  sectionHeading: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 20,
    color: Colors.text,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  listWrap: {
    paddingHorizontal: 24,
    gap: 16,
  },
  achieveRow: {
    backgroundColor: '#F3E8FF',
    borderRadius: 20,
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  achieveIconWrap: {
    width: 56,
    height: 56,
    backgroundColor: Colors.white,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achieveIcon: {
    fontSize: 28,
  },
  achieveContent: {
    flex: 1,
    justifyContent: 'center',
  },
  achieveTitle: {
    fontFamily: Fonts.jostMedium,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 12,
  },
  barTrack: {
    height: 18,
    backgroundColor: '#D8B4FE',  // Light purple background filler
    borderRadius: 9,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#b740ff', // Solid vibrant filling bar
    borderRadius: 9,
  },
  barTextWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  barText: {
    color: Colors.white,
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 10,
    position: 'absolute',
  },
  achieveCheck: {
    width: 44,
    height: 44,
    borderWidth: 2,
    borderColor: '#3B0061',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
});
