import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';

const MEETINGS = [
  { id: '1', name: 'Sisters in Recovery', loc: 'Orange County', type: 'AA' },
  { id: '2', name: 'Burning Desire', loc: 'Orange County', type: 'NA' },
  { id: '3', name: 'New Connections', loc: 'LA County', type: 'AA' },
];

export default function RecommendedMeetingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#E6F0FF', '#F4FAFF', Colors.white]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
      />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(400).springify()} style={styles.infoArea}>
          <Text style={styles.infoTitle}>Here's a Recommended Meeting</Text>
          <Text style={styles.infoSub}>Click Below to enter immediately</Text>
        </Animated.View>

        <View style={styles.meetingList}>
          {MEETINGS.map((m, idx) => (
            <Animated.View key={m.id} entering={FadeInUp.delay(idx * 150 + 100).duration(400).springify()}>
              <TouchableOpacity 
                style={styles.meetingCard} 
                activeOpacity={0.8} 
                onPress={() => router.push('/(app)/meetings')}
              >
                <View style={styles.meetingIconOrb}>
                  <Text style={styles.meetingIconTxt}>{m.type}</Text>
                </View>
                <View style={styles.meetingInfo}>
                  <Text style={styles.meetingName}>{m.name}</Text>
                  <Text style={styles.meetingLoc}>{m.loc}</Text>
                </View>
                <View style={styles.meetingDot} />
              </TouchableOpacity>
            </Animated.View>
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
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#bd51ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  scroll: {
    paddingHorizontal: 24,
  },
  infoArea: {
    marginBottom: 32,
  },
  infoTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 22,
    color: '#3B0061',
    marginBottom: 8,
  },
  infoSub: {
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: Colors.textMuted,
  },
  meetingList: {
    gap: 16,
  },
  meetingCard: {
    backgroundColor: '#EAC8F8',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  meetingIconOrb: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#3B0061',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: '#EAC8F8', // The inside matches card background in Figma (transparent hollow)
  },
  meetingIconTxt: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 20,
    color: '#3B0061',
  },
  meetingInfo: {
    flex: 1,
  },
  meetingName: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 18,
    color: '#3B0061',
    marginBottom: 2,
  },
  meetingLoc: {
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: 'rgba(59,0,97,0.7)',
  },
  meetingDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#bd51ff',
  },
});
