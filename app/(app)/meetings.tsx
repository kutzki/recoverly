import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
  Linking,
  RefreshControl,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import {
  Meeting,
  MeetingQueryParams,
  meetingsService,
  getDeviceTimezone,
  getTimezoneRegion,
  formatMeetingTime,
  formatMeetingDay,
  getTimezoneAbbr,
  FORMAT_LABELS,
  COMMUNITY_LABELS,
  TYPE_LABELS,
  LANGUAGE_LABELS,
} from '../../services/meetings';
import { useMeetingsFilterStore } from '../../store/meetingsFilter';

// ─── Filter Options ──────────────────────────────────────────────────────────

const LANGUAGE_OPTIONS = [
  { key: 'en', label: 'English' },
  { key: 'es', label: 'Spanish' },
  { key: 'fr', label: 'French' },
  { key: 'pt', label: 'Portuguese' },
  { key: 'de', label: 'German' },
  { key: 'ru', label: 'Russian' },
];

const FORMAT_OPTIONS = [
  { key: 'D', label: 'Discussion' },
  { key: 'SP', label: 'Speaker' },
  { key: 'B', label: 'Big Book' },
  { key: 'ST', label: 'Step Study' },
  { key: 'MED', label: 'Meditation' },
  { key: 'BE', label: 'Beginners' },
  { key: 'DR', label: 'Daily Reflect.' },
  { key: 'LIT', label: 'Literature' },
];

const COMMUNITY_OPTIONS = [
  { key: 'LGBTQ', label: 'LGBTQ+' },
  { key: 'W', label: 'Women' },
  { key: 'M', label: 'Men' },
  { key: 'Y', label: 'Young People' },
  { key: 'POC', label: 'People of Color' },
  { key: 'SEN', label: 'Seniors' },
];



// ─── Component ───────────────────────────────────────────────────────────────

export default function MeetingsScreen() {
  const insets = useSafeAreaInsets();

  // State
  const [meetings, setMeetings]           = useState<Meeting[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  // Onboarding
  const [showOnboarding, setShowOnboarding]     = useState(false);
  const [isOnboardingReady, setIsOnboardingReady] = useState(false);
  const [onboardStep, setOnboardStep]           = useState(0);

  // Load persisted filters from the shared store
  const loadFilters = useMeetingsFilterStore((s) => s.loadFilters);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const hasSeen = await SecureStore.getItemAsync('hasSeenMeetingsOnboard');
        if (hasSeen !== 'true') {
          setShowOnboarding(true);
        }
      } catch (err) {
        // ignore storage errors
      } finally {
        setIsOnboardingReady(true);
      }
    }
    checkOnboarding();
  }, []);

  const handleStartOnboarding = async () => {
    setShowOnboarding(false);
    router.push('/(app)/meetings-filter' as any);
  };

  // Load persisted filter preferences on mount
  useEffect(() => {
    loadFilters();
  }, []);

  // Filters
  const [langFilter, setLangFilter] = useState<string | null>('en');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [formatFilter, setFormatFilter] = useState<string | null>(null);
  const [communityFilter, setCommunityFilter] = useState<string | null>(null);

  // ─── Fetch ───────────────────────────────────────────────────────────────

  const fetchMeetings = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      const params: MeetingQueryParams = {
        hours: 168,
        limit: 5000,
      };
      if (langFilter) params.languages = langFilter;
      if (typeFilter) params.type = typeFilter;
      if (formatFilter) params.formats = formatFilter;
      if (communityFilter) params.communities = communityFilter;

      const data = await meetingsService.getMeetings(params);
      setMeetings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load meetings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [langFilter, typeFilter, formatFilter, communityFilter]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMeetings(true);
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  if (!isOnboardingReady) return null;

  if (showOnboarding) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={['#F9E9FD', '#E6F0FF']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        
        <View style={[styles.mainHeader, { paddingTop: insets.top + 16, marginBottom: 0 }]}>
          <TouchableOpacity 
            onPress={() => onboardStep === 1 ? setOnboardStep(0) : router.back()} 
            style={styles.backBtnOnboard}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <Animated.View key={`graphic-${onboardStep}`} entering={FadeIn.duration(400)} style={styles.onboardGraphicContainer}>
          <Image 
            source={onboardStep === 0 ? require('../../assets/images/meeting_onboard.jpg') : require('../../assets/images/meeting_onboard_map.jpg')} 
            style={styles.onboardImage} 
            resizeMode="contain" 
          />
        </Animated.View>

        <Animated.View key={`text-${onboardStep}`} entering={FadeInDown.duration(400).springify()} style={styles.onboardTextContainer}>
          <Text style={styles.onboardTitle}>Access to a database of AA/NA meetings in your area</Text>
          <Text style={styles.onboardSub}>
            {onboardStep === 0 
               ? "Explore a big collection of sober living houses in your desired location."
               : "Browse through meetings in your area and book directly on the app"}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.onboardAction, { paddingBottom: insets.bottom + 32 }]}>
          <TouchableOpacity 
            style={styles.onboardBtn} 
            onPress={() => onboardStep === 0 ? setOnboardStep(1) : handleStartOnboarding()} 
            activeOpacity={0.8}
          >
            <Text style={styles.onboardBtnText}>{onboardStep === 0 ? "Next" : "Get started"}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  const upcomingMeetings = meetings.slice(0, 5);
  const nearbyMeetings = meetings.slice(5, 15);

  return (
    <View style={styles.root}>
      {/* Absolute Map Background for Header */}
      <Image 
        source={require('../../assets/images/meeting_onboard_map.jpg')} 
        style={styles.headerMapBg} 
        resizeMode="cover" 
      />

      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Transparent Header Area */}
        <View style={[styles.mainHeader, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtnOnboard}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(app)/meetings-filter' as any)} style={styles.filterBtnIcon}>
             <Ionicons name="options-outline" size={32} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerTitleText}>Meetings</Text>
          <Text style={styles.headerSubText}>Search our database for a meeting in your area</Text>
        </View>

        <View style={{ height: 16 }} />

        {/* Search Pill */}
        <View style={styles.searchPillWrap}>
          <TouchableOpacity 
            style={styles.searchPill} 
            activeOpacity={0.9} 
            onPress={() => router.push('/(app)/meetings-map' as any)}
          >
            <Text style={styles.searchPillText}>View nearby meetings</Text>
            <Ionicons name="search" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Content Sheet */}
        <View style={[styles.contentSheet, { paddingBottom: insets.bottom + 24 }]}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#bd51ff" />
              <Text style={styles.loadingText}>Finding meetings...</Text>
            </View>
          )}

          {!loading && error && (
            <View style={styles.errorContainer}>
              <Ionicons name="cloud-offline-outline" size={48} color={Colors.error} />
              <Text style={styles.errorTitle}>Connection Error</Text>
              <Text style={styles.errorSubtitle}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => fetchMeetings()}>
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && (
            <>
              {/* Upcoming Meetings Row */}
              <View style={styles.sectionHeaderWrap}>
                <Text style={styles.sectionHeaderTxt}>Upcoming Meetings</Text>
                <TouchableOpacity><Text style={styles.viewAllTxt}>View all</Text></TouchableOpacity>
              </View>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.horizScrollList}
              >
                {upcomingMeetings.map(m => (
                  <TouchableOpacity key={m.slug} style={styles.horizCard} onPress={() => setSelectedMeeting(m)} activeOpacity={0.8}>
                    <View style={styles.horizCardIconWrap}>
                      <Text style={styles.horizCardIconTxt}>{m.type || 'AA'}</Text>
                    </View>
                    <View style={styles.horizCardInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={styles.horizCardName} numberOfLines={1}>{m.name}</Text>
                        <View style={styles.cardStatusDot} />
                      </View>
                      <Text style={styles.horizCardLoc} numberOfLines={1}>
                        {getTimezoneRegion(m.timezone || 'America/Los_Angeles')} County
                      </Text>
                      <Text style={styles.horizCardTime} numberOfLines={2}>
                        {formatMeetingDay(m.nextEventUTC)} • {formatMeetingTime(m.nextEventUTC)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Nearby Meetings Column */}
              <View style={[styles.sectionHeaderWrap, { marginTop: 32 }]}>
                <Text style={styles.sectionHeaderTxt}>Nearby Meeting</Text>
                <TouchableOpacity><Text style={styles.viewAllTxt}>View all</Text></TouchableOpacity>
              </View>

              <View style={styles.vertList}>
                {nearbyMeetings.map(m => (
                  <TouchableOpacity key={m.slug} style={styles.vertCard} onPress={() => setSelectedMeeting(m)} activeOpacity={0.8}>
                    <View style={styles.vertCardIconWrap}>
                      <Text style={styles.horizCardIconTxt}>{m.type || 'AA'}</Text>
                    </View>
                    <View style={styles.vertCardInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={styles.horizCardName} numberOfLines={1}>{m.name}</Text>
                        <View style={styles.cardStatusDot} />
                      </View>
                      <Text style={styles.horizCardLoc} numberOfLines={1}>
                        {getTimezoneRegion(m.timezone || 'America/Los_Angeles')} County
                      </Text>
                      <Text style={styles.horizCardTime} numberOfLines={2}>
                        {formatMeetingDay(m.nextEventUTC)} • {formatMeetingTime(m.nextEventUTC)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

        </View>
      </ScrollView>

      {/* Detail Bottom Sheet */}
      <MeetingDetailModal
        meeting={selectedMeeting}
        onClose={() => setSelectedMeeting(null)}
      />
    </View>
  );
}

// ─── Meeting Detail Modal ────────────────────────────────────────────────────

function MeetingDetailModal({
  meeting,
  onClose,
}: {
  meeting: Meeting | null;
  onClose: () => void;
}) {
  if (!meeting) return null;

  const timeStr = formatMeetingTime(meeting.nextEventUTC);
  const tzAbbr = getTimezoneAbbr();
  const dayStr = formatMeetingDay(meeting.nextEventUTC);

  return (
    <Modal
      visible={!!meeting}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={modalStyles.root}>
        {/* Handle bar */}
        <View style={modalStyles.handleBar} />

        {/* Close button */}
        <TouchableOpacity
          style={modalStyles.closeButton}
          onPress={onClose}
          hitSlop={12}
        >
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={modalStyles.content}
        >
          {/* Name */}
          <Text style={modalStyles.name}>{meeting.name}</Text>

          {/* Schedule */}
          <View style={modalStyles.infoRow}>
            <Ionicons name="time-outline" size={18} color={Colors.primary} />
            <Text style={modalStyles.infoText}>
              {dayStr} at {timeStr} {tzAbbr}
              {meeting.duration ? ` · ${meeting.duration} min` : ''}
            </Text>
          </View>

          {/* Timezone */}
          {meeting.timezone && (
            <View style={modalStyles.infoRow}>
              <Ionicons name="globe-outline" size={18} color={Colors.primary} />
              <Text style={modalStyles.infoText}>
                {meeting.timezone} ({getTimezoneRegion(meeting.timezone)})
              </Text>
            </View>
          )}

          {/* Type */}
          {meeting.type && (
            <View style={modalStyles.infoRow}>
              <Ionicons
                name={meeting.type === 'O' ? 'lock-open-outline' : 'lock-closed-outline'}
                size={18}
                color={Colors.primary}
              />
              <Text style={modalStyles.infoText}>
                {TYPE_LABELS[meeting.type]} Meeting
              </Text>
            </View>
          )}

          {/* Language */}
          {meeting.languages.length > 0 && (
            <View style={modalStyles.infoRow}>
              <Ionicons name="language-outline" size={18} color={Colors.primary} />
              <Text style={modalStyles.infoText}>
                {meeting.languages
                  .map((l) => LANGUAGE_LABELS[l] || l)
                  .join(', ')}
              </Text>
            </View>
          )}

          {/* Formats */}
          {meeting.formats.length > 0 && (
            <View style={modalStyles.badgeSection}>
              <Text style={modalStyles.badgeLabel}>Format</Text>
              <View style={modalStyles.badgeRow}>
                {meeting.formats.map((f) => (
                  <View key={f} style={modalStyles.badge}>
                    <Text style={modalStyles.badgeText}>
                      {FORMAT_LABELS[f] || f}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Communities */}
          {meeting.communities.length > 0 && (
            <View style={modalStyles.badgeSection}>
              <Text style={modalStyles.badgeLabel}>Community</Text>
              <View style={modalStyles.badgeRow}>
                {meeting.communities.map((c) => (
                  <View key={c} style={modalStyles.communityBadge}>
                    <Text style={modalStyles.communityBadgeText}>
                      {COMMUNITY_LABELS[c] || c}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Group notes */}
          {meeting.groupNotes && (
            <View style={modalStyles.notesSection}>
              <Text style={modalStyles.notesLabel}>About This Meeting</Text>
              <Text style={modalStyles.notesText}>{meeting.groupNotes}</Text>
            </View>
          )}

          {/* Conference URL notes */}
          {meeting.conference_url_notes && (
            <View style={modalStyles.notesSection}>
              <Text style={modalStyles.notesLabel}>Join Details</Text>
              <Text style={modalStyles.notesText}>
                {meeting.conference_url_notes}
              </Text>
            </View>
          )}

          {/* Phone notes */}
          {meeting.conference_phone_notes && (
            <View style={modalStyles.notesSection}>
              <Text style={modalStyles.notesLabel}>Phone Dial-In</Text>
              <Text style={modalStyles.notesText}>
                {meeting.conference_phone_notes}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom actions */}
        <View style={modalStyles.actions}>
          {meeting.conference_url && (
            <TouchableOpacity
              style={modalStyles.joinButton}
              activeOpacity={0.85}
              onPress={() => Linking.openURL(meeting.conference_url!)}
            >
              <Ionicons name="videocam" size={18} color="#fff" />
              <Text style={modalStyles.joinButtonText}>Join Meeting</Text>
            </TouchableOpacity>
          )}
          {meeting.conference_phone && (
            <TouchableOpacity
              style={modalStyles.phoneButton}
              activeOpacity={0.85}
              onPress={() => Linking.openURL(`tel:${meeting.conference_phone}`)}
            >
              <Ionicons name="call-outline" size={18} color={Colors.primary} />
              <Text style={modalStyles.phoneButtonText}>Call In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  // List UI Figma
  headerMapBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 350,
    width: '100%',
    opacity: 0.8,
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  filterBtnIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBlock: {
    paddingHorizontal: 24,
    paddingRight: 60,
  },
  headerTitleText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 28,
    color: '#3B0061',
    marginBottom: 4,
  },
  headerSubText: {
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: '#768DB5',
  },
  searchPillWrap: {
    paddingHorizontal: 24,
    zIndex: 10,
    marginBottom: -26, // overlaps
  },
  searchPill: {
    backgroundColor: Colors.white,
    height: 54,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  searchPillText: {
    fontFamily: Fonts.jost,
    fontSize: 15,
    color: '#768DB5',
  },
  contentSheet: {
    backgroundColor: '#F9FAFD',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 56, // to clear search pill
    flex: 1,
  },
  sectionHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionHeaderTxt: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 18,
    color: '#1A1A1A',
  },
  viewAllTxt: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 14,
    color: '#768DB5',
  },
  horizScrollList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  horizCard: {
    width: 250,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginVertical: 10, // allows shadow rendering
  },
  horizCardIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  horizCardIconTxt: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 22,
    color: '#1A1A1A',
  },
  horizCardInfo: {
    gap: 4,
  },
  horizCardName: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 16,
    color: '#3B0061',
    flex: 1,
    paddingRight: 8,
  },
  horizCardLoc: {
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: '#768DB5',
  },
  horizCardTime: {
    fontFamily: Fonts.jost,
    fontSize: 12,
    color: '#1A1A1A',
    opacity: 0.6,
  },
  cardStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ade80', // green indicator
  },
  vertList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  vertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 4, // allows shadow rendering
  },
  vertCardIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  vertCardInfo: {
    flex: 1,
    gap: 4,
  },
  // Onboarding Styles
  backBtnOnboard: {
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
  onboardGraphicContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
    paddingHorizontal: 20,
  },
  onboardImage: {
    width: '100%',
    height: '100%',
    maxHeight: 450,
  },
  onboardTextContainer: {
    paddingHorizontal: 28,
    marginBottom: 40,
  },
  onboardTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 24,
    color: '#4B51F9',
    marginBottom: 16,
    lineHeight: 34,
  },
  onboardSub: {
    fontFamily: Fonts.jost,
    fontSize: 16,
    color: '#768DB5',
    lineHeight: 24,
  },
  onboardAction: {
    paddingHorizontal: 24,
  },
  onboardBtn: {
    backgroundColor: '#bd51ff',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#bd51ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  onboardBtnText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 16,
    color: Colors.white,
  },

  // Loading / Error
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 40,
  },
  loadingText: {
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: '#768DB5',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 40,
    marginTop: 40,
  },
  errorTitle: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 18,
    color: '#3B0061',
  },
  errorSubtitle: {
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: '#768DB5',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#bd51ff',
  },
  retryText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 14,
    color: '#fff',
  },
});

// ─── Modal Styles ────────────────────────────────────────────────────────────

const modalStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
  },
  content: {
    padding: 24,
    paddingTop: 28,
  },

  name: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 22,
    color: Colors.text,
    marginBottom: 20,
    paddingRight: 36,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  infoText: {
    fontFamily: Fonts.jost,
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },

  badgeSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  badgeLabel: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: Colors.cardTintPurpleFaint,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeText: {
    fontFamily: Fonts.jostMedium,
    fontSize: 13,
    color: Colors.primary,
  },
  communityBadge: {
    backgroundColor: '#FFF0F6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  communityBadgeText: {
    fontFamily: Fonts.jostMedium,
    fontSize: 13,
    color: '#C2185B',
  },

  notesSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  notesLabel: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  notesText: {
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  joinButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
  },
  joinButtonText: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 15,
    color: '#fff',
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  phoneButtonText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 15,
    color: Colors.primary,
  },
});
