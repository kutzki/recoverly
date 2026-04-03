import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import Animated, { FadeIn, FadeInDown, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useAuthStore } from '../../store/auth';

const { width, height } = Dimensions.get('window');

// Mock coordinates centered around user's neighborhood
const CENTER_COORD = {
  latitude: 33.8,
  longitude: -118.1,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const MOCK_MEETINGS = [
  { id: '1', name: 'Burning Desire', type: 'NA', latitude: 33.82, longitude: -118.11, distance: '1.2' },
  { id: '2', name: 'Sister in Recovery', type: 'AA', latitude: 33.78, longitude: -118.08, distance: '2.5' },
  { id: '3', name: 'Our Conscious Contact', type: 'AA', latitude: 33.76, longitude: -118.15, distance: '3.1' },
  { id: '4', name: 'Recovery First', type: 'NA', latitude: 33.84, longitude: -118.18, distance: '4.8' },
];

/**
 * Sobriety Progress Ring (Mini version for Header)
 */
function MiniSobrietyRing() {
  const size = 52;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = 0.65; // Mocking 65% through 30-day goal

  return (
    <TouchableOpacity 
      style={styles.miniRingWrap} 
      onPress={() => router.push('/(app)/sober-pal')}
      activeOpacity={0.8}
    >
      <Svg width={size} height={size}>
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F1F1FF"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#4B0082"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round"
          fill="transparent"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.miniRingContent}>
        <Text style={styles.miniRingText}>30</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function MeetingsMapScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [selectedPin, setSelectedPin] = useState<string | null>(null);

  const handlePinPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPin(id);
  };

  return (
    <View style={styles.root}>
      {/* Interactive Map Layer */}
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={CENTER_COORD}
        showsUserLocation
        showsMyLocationButton={false}
      >
        <Circle
          center={{ latitude: CENTER_COORD.latitude, longitude: CENTER_COORD.longitude }}
          radius={4000}
          fillColor="rgba(75, 0, 130, 0.05)"
          strokeColor="rgba(75, 0, 130, 0.2)"
          strokeWidth={1}
        />
        
        <Marker coordinate={{ latitude: CENTER_COORD.latitude, longitude: CENTER_COORD.longitude }}>
          <View style={styles.userMarkerOuter}>
            <View style={styles.userMarkerInner} />
          </View>
        </Marker>

        {MOCK_MEETINGS.map((meeting) => (
          <Marker 
            key={meeting.id}
            coordinate={{ latitude: meeting.latitude, longitude: meeting.longitude }}
            onPress={() => handlePinPress(meeting.id)}
          >
            <View style={[styles.customPin, selectedPin === meeting.id && styles.customPinActive]}>
              <View style={[styles.pinCircle, selectedPin === meeting.id && styles.pinCircleActive]}>
                <Text style={[styles.pinText, selectedPin === meeting.id && styles.pinTextActive]}>{meeting.type}</Text>
              </View>
              <View style={[styles.pinBeak, selectedPin === meeting.id && styles.pinBeakActive]} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Premium Header Overlays */}
      <Animated.View entering={FadeIn.duration(800)} style={[styles.headerOverlay, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTopRow}>
          <View style={styles.greetingBlock}>
            <Text style={styles.greetingSub}>Welcome,</Text>
            <Text style={styles.greetingName}>{user?.name || 'Friend'}</Text>
          </View>
          <View style={styles.headerActions}>
            <MiniSobrietyRing />
            <TouchableOpacity 
              style={styles.iconBtn}
              onPress={() => router.push('/(app)/notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBarWrap}>
          <TouchableOpacity 
            style={styles.searchPill} 
            activeOpacity={0.9}
            onPress={() => router.push('/(app)/meetings')}
          >
            <Text style={styles.searchPillText}>Search for meetings...</Text>
            <View style={styles.searchIconBtn}>
              <Ionicons name="search" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Meeting Discovery Bottom Sheet */}
      <Animated.View 
        entering={FadeInDown.delay(400).springify()} 
        style={[styles.bottomSheet, { paddingBottom: insets.bottom + 16 }]}
      >
        <View style={styles.handleBar} />
        
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Near by Meetings</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/meetings')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.meetingList}
        >
          {MOCK_MEETINGS.map((meeting, index) => (
            <TouchableOpacity 
              key={meeting.id} 
              style={[styles.meetingCard, selectedPin === meeting.id && styles.meetingCardActive]}
              onPress={() => setSelectedPin(meeting.id)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={meeting.type === 'AA' ? ['#4B0082', '#6A5ACD'] : ['#E91E63', '#FF4081']}
                style={styles.cardIcon}
              >
                <Text style={styles.cardTypeTxt}>{meeting.type}</Text>
              </LinearGradient>

              <View style={styles.cardInfo}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardName}>{meeting.name}</Text>
                  {index === 0 && <View style={styles.liveDot} />}
                </View>
                <View style={styles.cardMetaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="navigate-outline" size={12} color="#4B0082" />
                    <Text style={styles.metaText}>{meeting.distance} mi</Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={12} color="#768DB5" />
                    <Text style={styles.metaText}>Every Friday</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardAction}>
                <View style={styles.chevronWrap}>
                  <Ionicons name="chevron-forward" size={16} color="#FFF" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  userMarkerOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(75, 0, 130, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4B0082',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  customPin: {
    alignItems: 'center',
  },
  customPinActive: {
    zIndex: 10,
    transform: [{ scale: 1.25 }],
  },
  pinCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
  },
  pinCircleActive: {
    backgroundColor: '#4B0082',
    borderColor: '#4B0082',
  },
  pinText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 14,
    color: '#4B0082',
  },
  pinTextActive: {
    color: '#FFF',
  },
  pinBeak: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFF',
    marginTop: -2,
  },
  pinBeakActive: {
    borderTopColor: '#4B0082',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    zIndex: 100,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingBlock: {
    flex: 1,
  },
  greetingSub: {
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: '#768DB5',
  },
  greetingName: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 24,
    color: '#1A1A1A',
    lineHeight: 28,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  miniRingWrap: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniRingContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniRingText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 14,
    color: '#1A1A1A',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchBarWrap: {
    width: '100%',
  },
  searchPill: {
    backgroundColor: '#FFF',
    height: 60,
    borderRadius: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#4B0082',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  searchPillText: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 16,
    color: '#768DB5',
  },
  searchIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4B0082',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.48,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  handleBar: {
    width: 140,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#4B0082',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sheetTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 22,
    color: '#4B0082',
  },
  viewAllText: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 14,
    color: '#768DB5',
  },
  meetingList: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  meetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
    borderRadius: 24,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  meetingCardActive: {
    borderColor: '#4B008260',
    backgroundColor: '#F4F4FF',
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardTypeTxt: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 18,
    color: '#FFF',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardName: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 15,
    color: '#1A1A1A',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4BFFC8',
    marginLeft: 8,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: Fonts.jost,
    fontSize: 12,
    color: '#768DB5',
  },
  metaDivider: {
    width: 1,
    height: 10,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  cardAction: {
    marginLeft: 8,
  },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4B0082',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4B0082',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
});
