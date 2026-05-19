import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useMeetingsFilterStore } from '../../store/meetingsFilter';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { FilterChips } from '../../components/ui/FilterChips';
import { TYPE_LABELS, FORMAT_LABELS, COMMUNITY_LABELS, LANGUAGE_LABELS } from '../../services/meetings';

const MEETING_TYPES = ['AA', 'NA', 'Other'];

export default function MeetingsFilterScreen() {
  const insets = useSafeAreaInsets();

  const meetingType  = useMeetingsFilterStore((s) => s.meetingType);
  const langFilter   = useMeetingsFilterStore((s) => s.langFilter);
  const typeFilter   = useMeetingsFilterStore((s) => s.typeFilter);
  const formatFilter = useMeetingsFilterStore((s) => s.formatFilter);
  const communityFilter = useMeetingsFilterStore((s) => s.communityFilter);
  const onlineOnly   = useMeetingsFilterStore((s) => s.onlineOnly);
  const rangeValue   = useMeetingsFilterStore((s) => s.rangeValue);
  const setFilters   = useMeetingsFilterStore((s) => s.setFilters);


  const filterGroups = [
    {
      id: 'type',
      label: 'Open/Closed',
      options: Object.entries(TYPE_LABELS).map(([k, v]) => ({ key: k, label: v })),
      selected: typeFilter,
      onSelect: (val: string | null) => setFilters({ typeFilter: val }),
    },
    {
      id: 'format',
      label: 'Format',
      options: Object.entries(FORMAT_LABELS).map(([k, v]) => ({ key: k, label: v })),
      selected: formatFilter,
      onSelect: (val: string | null) => setFilters({ formatFilter: val }),
    },
    {
      id: 'community',
      label: 'Community',
      options: Object.entries(COMMUNITY_LABELS).map(([k, v]) => ({ key: k, label: v })),
      selected: communityFilter,
      onSelect: (val: string | null) => setFilters({ communityFilter: val }),
    },
    {
      id: 'lang',
      label: 'Language',
      options: Object.entries(LANGUAGE_LABELS).map(([k, v]) => ({ key: k, label: v })),
      selected: langFilter,
      onSelect: (val: string | null) => setFilters({ langFilter: val }),
    },
  ];

  const handleApply = async () => {
    // Mark onboarding as seen (must match key in meetings.tsx)
    await SecureStore.setItemAsync('hasSeenMeetingsOnboard', 'true');
    // Store is already persisted on every setFilters call; just go back
    router.back();
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#F9E9FD', Colors.white, Colors.white]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
      />
      
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        
        {/* Meeting Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meeting type</Text>
          <View style={styles.typeRow}>
            {MEETING_TYPES.map((type) => {
              const isActive = meetingType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeBtn, isActive && styles.typeBtnActive]}
                  activeOpacity={0.8}
                  onPress={() => setFilters({ meetingType: type })}
                >
                  <Text style={[styles.typeBtnText, isActive && styles.typeBtnTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Range Slider Mock */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Range</Text>
          <Text style={styles.rangeValueText}>{rangeValue} Miles</Text>
          
          <View style={styles.sliderContainer}>
             {/* Background Track */}
             <View style={styles.sliderTrackBg} />
             {/* Fill Track */}
             <View style={[styles.sliderTrackFill, { width: `${(rangeValue / 100) * 100}%` }]} />
             {/* Thumb */}
             <View style={[styles.sliderThumb, { left: `${(rangeValue / 100) * 100}%` }]} />
          </View>
        </View>

        {/* API Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced Filters</Text>
          <FilterChips groups={filterGroups} />
        </View>

        {/* Online Availability Checkbox */}
        <TouchableOpacity
          style={styles.checkboxRow}
          activeOpacity={0.8}
          onPress={() => setFilters({ onlineOnly: !onlineOnly })}
        >
          <View style={[styles.checkboxRoot, onlineOnly && styles.checkboxActive]}>
             {onlineOnly && <Ionicons name="checkmark" size={16} color={Colors.white} />}
          </View>
          <Text style={styles.checkboxLabel}>Show only Meetings with Online Availability</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Floating Apply Bottom Button */}
      <View style={[styles.bottomAction, { paddingBottom: insets.bottom + 24 }]}>
         <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.8}>
            <Text style={styles.applyBtnText}>Apply Filter</Text>
         </TouchableOpacity>
      </View>

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
    marginBottom: 20,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 15,
    color: '#1E1E1E',
    marginBottom: 16,
  },

  // Type Row
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeBtn: {
    flex: 1,
    height: 74,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bd51ff',
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#bd51ff',
    borderColor: '#bd51ff',
  },
  typeBtnText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 16,
    color: '#1E1E1E',
  },
  typeBtnTextActive: {
    color: Colors.white,
  },

  // Slider
  rangeValueText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 14,
    color: '#1E1E1E',
    textAlign: 'center',
    marginBottom: 16,
  },
  sliderContainer: {
    height: 30,
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 12,
  },
  sliderTrackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#EBEBEB',
    borderRadius: 2,
  },
  sliderTrackFill: {
    position: 'absolute',
    left: 0,
    height: 4,
    backgroundColor: '#bd51ff',
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#bd51ff',
    backgroundColor: Colors.white,
    transform: [{ translateX: -12 }], // Center thumb on coordinate
  },

  // Dropdown
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#bd51ff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    backgroundColor: Colors.white,
  },
  dropdownText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 15,
    color: '#1E1E1E',
  },

  // Checkbox
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingRight: 24,
    marginTop: 10,
  },
  checkboxRoot: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#bd51ff',
    backgroundColor: Colors.white,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#bd51ff',
    borderColor: '#bd51ff',
  },
  checkboxLabel: {
    flex: 1,
    fontFamily: Fonts.poppinsMedium,
    fontSize: 15,
    lineHeight: 22,
    color: '#1E1E1E',
  },

  // Bottom action
  bottomAction: {
    paddingHorizontal: 24,
    backgroundColor: Colors.white,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  applyBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#bd51ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 16,
    color: Colors.white,
  },
});
