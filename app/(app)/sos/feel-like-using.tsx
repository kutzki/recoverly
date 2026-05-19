import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';

const RECOMMENDATIONS = [
  { id: 'sponsor', label: 'Call your Sponsor' },
  { id: 'meditate', label: 'Meditate' },
  { id: 'meeting', label: 'Attend a Meeting' },
];

export default function FeelLikeUsingScreen() {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState('meditate');
  const [completedRecs, setCompletedRecs] = useState<Set<string>>(new Set(['sponsor'])); // Mocking first one as completed per the screenshot

  const markComplete = (id: string) => {
    if (!completedRecs.has(id)) {
      setCompletedRecs((prev) => new Set([...prev, id]));
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#E6F0FF', '#F4FAFF', Colors.white]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Card: Recommendations */}
        <Animated.View entering={FadeInUp.duration(400).springify()} style={styles.recsCard}>
          <Text style={styles.recsTitle}>I Feel Like Using</Text>
          <Text style={styles.recsSub}>We recommend you try these 3 things</Text>

          <View style={styles.recsList}>
            {RECOMMENDATIONS.map((rec) => {
              const isCompleted = completedRecs.has(rec.id);
              const isActive = activeTab === rec.id;

              return (
                <TouchableOpacity
                  key={rec.id}
                  style={[styles.recItem, isActive && styles.recItemActive]}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab(rec.id)}
                >
                  <Text style={styles.recItemText}>{rec.label}</Text>
                  <View style={[styles.recCircle, isCompleted && styles.recCircleCompleted]}>
                    {/* The Figma showed a solid blue circle for completed, without a checkmark, but a checkmark is good UX */}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Dynamic Content Area based on Active Tab */}
        <Animated.View key={activeTab} layout={Layout.springify().damping(16)}>
          {/* SPONSOR TAB */}
          {activeTab === 'sponsor' && (
            <Animated.View entering={FadeInDown.duration(400).springify()}>
              <View style={styles.infoArea}>
                <Text style={styles.infoTitle}>Press the Icon to Call Your Sponsor</Text>
                <Text style={styles.infoSub}>
                  Try talking about your feelings to a friend, family member, health professional or
                  sponsor.
                </Text>
              </View>

              <View style={styles.sponsorCard}>
                <TouchableOpacity style={styles.sponsorCallBtn} activeOpacity={0.8}>
                  <Ionicons name="call" size={32} color="#bd51ff" />
                </TouchableOpacity>
                <Text style={styles.sponsorName}>Jack - Sponsor</Text>
                <Text style={styles.sponsorPhone}>888 - 888 - 8888</Text>
              </View>

              <View style={styles.actionArea}>
                <TouchableOpacity
                  style={styles.outlineBtn}
                  activeOpacity={0.8}
                  onPress={() => router.push('/(app)/inner-circle')}
                >
                  <Text style={styles.outlineBtnText}>Open Emergency Contacts</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.solidBtn}
                  activeOpacity={0.8}
                  onPress={() => markComplete('sponsor')}
                >
                  <Text style={styles.solidBtnText}>Complete Activity</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* MEDITATE TAB */}
          {activeTab === 'meditate' && (
            <Animated.View entering={FadeInDown.duration(400).springify()}>
              <View style={styles.infoArea}>
                <Text style={styles.infoTitle}>Take Some Time to Meditate</Text>
                <Text style={styles.infoSub}>
                  This calming breathing technique for stress, anxiety and panic takes just a few
                  minutes and can be done anywhere.
                </Text>
              </View>

              <TouchableOpacity style={styles.videoCard} activeOpacity={0.95}>
                <LinearGradient
                  colors={['#D2CB9C', '#578378']}
                  style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
                />
                <Text style={styles.videoTitle}>10-Minute Meditation</Text>

                {/* Abstract Meditation Graphic Elements */}
                <Ionicons
                  name="leaf"
                  size={120}
                  color="rgba(255,255,255,0.1)"
                  style={{ position: 'absolute', bottom: -20, right: -20 }}
                />

                <View style={styles.playBtnWrap}>
                  <Ionicons name="play" size={36} color="#bd51ff" style={{ marginLeft: 6 }} />
                </View>
              </TouchableOpacity>

              <View style={styles.actionArea}>
                <TouchableOpacity
                  style={styles.outlineBtn}
                  activeOpacity={0.8}
                  onPress={() => router.push('/(app)/apps')}
                >
                  <Text style={styles.outlineBtnText}>Open Self-Help Library</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.solidBtn}
                  activeOpacity={0.8}
                  onPress={() => markComplete('meditate')}
                >
                  <Text style={styles.solidBtnText}>Complete Activity</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* MEETING TAB */}
          {activeTab === 'meeting' && (
            <Animated.View entering={FadeInDown.duration(400).springify()}>
              <View style={styles.infoArea}>
                <Text style={styles.infoTitle}>Here's a Recommended Meeting</Text>
                <Text style={styles.infoSub}>Click Below to enter immediately</Text>
              </View>

              <View style={styles.meetingList}>
                <TouchableOpacity
                  style={styles.meetingCard}
                  activeOpacity={0.8}
                  onPress={() => router.push('/(app)/meetings')}
                >
                  <View style={styles.meetingIconOrb}>
                    <Text style={styles.meetingIconTxt}>AA</Text>
                  </View>
                  <View style={styles.meetingInfo}>
                    <Text style={styles.meetingName}>Sisters in Recovery</Text>
                    <Text style={styles.meetingLoc}>Orange County</Text>
                  </View>
                  <View style={styles.meetingDot} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.meetingCard}
                  activeOpacity={0.8}
                  onPress={() => router.push('/(app)/meetings')}
                >
                  <View style={styles.meetingIconOrb}>
                    <Text style={styles.meetingIconTxt}>NA</Text>
                  </View>
                  <View style={styles.meetingInfo}>
                    <Text style={styles.meetingName}>Burning Desire</Text>
                    <Text style={styles.meetingLoc}>Orange County</Text>
                  </View>
                  <View style={styles.meetingDot} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.meetingCard}
                  activeOpacity={0.8}
                  onPress={() => router.push('/(app)/meetings')}
                >
                  <View style={styles.meetingIconOrb}>
                    <Text style={styles.meetingIconTxt}>AA</Text>
                  </View>
                  <View style={styles.meetingInfo}>
                    <Text style={styles.meetingName}>New Connections</Text>
                    <Text style={styles.meetingLoc}>LA County</Text>
                  </View>
                  <View style={styles.meetingDot} />
                </TouchableOpacity>
              </View>

              <View style={styles.actionArea}>
                <TouchableOpacity
                  style={styles.outlineBtn}
                  activeOpacity={0.8}
                  onPress={() => router.push('/(app)/meetings')}
                >
                  <Text style={styles.outlineBtnText}>5 Similar Meetings Happening Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.solidBtn}
                  activeOpacity={0.8}
                  onPress={() => markComplete('meeting')}
                >
                  <Text style={styles.solidBtnText}>Complete Activity</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </Animated.View>
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
  recsCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  recsTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 20,
    color: '#3B0061',
    marginBottom: 4,
  },
  recsSub: {
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 24,
  },
  recsList: {
    gap: 12,
  },
  recItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#bd51ff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  recItemActive: {
    borderColor: '#7D00B5', // Subtle outline to indicate it's the active tab
  },
  recItemText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 15,
    color: Colors.white,
  },
  recCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recCircleCompleted: {
    backgroundColor: '#4E88FC', // Soft blue as seen in design for finished state
  },

  // SHARED CONTENT STYLES
  infoArea: {
    marginBottom: 24,
  },
  infoTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 18,
    color: '#3B0061',
    marginBottom: 8,
  },
  infoSub: {
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  actionArea: {
    gap: 16,
    marginTop: 8,
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: '#bd51ff',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  outlineBtnText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 16,
    color: '#bd51ff',
  },
  solidBtn: {
    backgroundColor: '#bd51ff',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  solidBtnText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 16,
    color: Colors.white,
  },

  // SPONSOR TAB
  sponsorCard: {
    backgroundColor: '#E8DCFF',
    borderRadius: 24,
    paddingVertical: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  sponsorCallBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sponsorName: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
  },
  sponsorPhone: {
    fontFamily: Fonts.jostMedium,
    fontSize: 16,
    color: Colors.textMuted,
  },

  // MEDITATE TAB
  videoCard: {
    height: 220,
    borderRadius: 24,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  videoTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 22,
    color: '#1a2e28',
    position: 'absolute',
    top: 20,
  },
  playBtnWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  // MEETING TAB
  meetingList: {
    gap: 12,
    marginBottom: 32,
  },
  meetingCard: {
    backgroundColor: '#EAC8F8', // Soft purple from Figma
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  meetingIconOrb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#3B0061',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  meetingIconTxt: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 18,
    color: '#3B0061',
  },
  meetingInfo: {
    flex: 1,
  },
  meetingName: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 16,
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
