import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth';
import { checkUsernameAvailable } from '../../services/supabase';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Full year range: most-recent-eligible (13 years ago) → 1940, newest first
const MIN_AGE = 13;
const MAX_YEAR = new Date().getFullYear() - MIN_AGE;
const YEARS: string[] = Array.from(
  { length: MAX_YEAR - 1940 + 1 },
  (_, i) => String(MAX_YEAR - i),
);

const LOCATIONS = [
  'Los Angeles, CA', 'New York, NY', 'Chicago, IL', 'Houston, TX',
  'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
  'Dallas, TX', 'Austin, TX', 'San Jose, CA', 'Jacksonville, FL',
  'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC', 'Indianapolis, IN',
  'Seattle, WA', 'Denver, CO', 'Washington, DC', 'Nashville, TN',
  'Oklahoma City, OK', 'El Paso, TX', 'Las Vegas, NV', 'Louisville, KY',
  'Memphis, TN', 'Portland, OR', 'Baltimore, MD', 'Milwaukee, WI',
  'Albuquerque, NM', 'Tucson, AZ', 'Fresno, CA', 'Sacramento, CA',
  'Mesa, AZ', 'Kansas City, MO', 'Atlanta, GA', 'Omaha, NE',
  'Colorado Springs, CO', 'Raleigh, NC', 'Long Beach, CA', 'Virginia Beach, VA',
  'Other',
];

export default function BasicInfo() {
  const updateUser = useAuthStore(s => s.updateUser);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const usernameCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [location, setLocation] = useState('');
  const [otherLocation, setOtherLocation] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Clean up the debounce timer on unmount
  useEffect(() => () => { if (usernameCheckTimer.current) clearTimeout(usernameCheckTimer.current); }, []);

  const handleUsernameChange = (val: string) => {
    // Strip spaces, @-signs and lowercase
    const clean = val.replace(/[@\s]/g, '').toLowerCase();
    setUsername(clean);
    setUsernameStatus('idle');
    if (clean.length < 3) return;
    // Debounce the availability check by 400ms
    if (usernameCheckTimer.current) clearTimeout(usernameCheckTimer.current);
    setUsernameStatus('checking');
    usernameCheckTimer.current = setTimeout(async () => {
      const available = await checkUsernameAvailable(clean);
      setUsernameStatus(available ? 'available' : 'taken');
    }, 400);
  };

  const handleSelectMonth = (month: string) => {
    if (!dobYear) {
      Alert.alert('Year required', 'Please select a year before choosing a month.');
      return;
    }
    setDobMonth(month);
    setShowDobPicker(false);
  };

  const handleSelectLocation = (loc: string) => {
    setLocation(loc);
    setShowLocationPicker(false);
    if (loc !== 'Other') setOtherLocation('');
  };

  const dobLabel = dobMonth && dobYear ? `${dobMonth} ${dobYear}` : '';
  const locationLabel = location === 'Other'
    ? (otherLocation.trim() || 'Other')
    : location;

  const handleNext = async () => {
    // Required fields
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    if (!username || username.length < 3) {
      Alert.alert('Username required', 'Username must be at least 3 characters.');
      return;
    }
    if (usernameStatus === 'taken') {
      Alert.alert('Username taken', 'That username is already in use. Please choose another.');
      return;
    }
    if (usernameStatus === 'checking') {
      Alert.alert('Please wait', 'Checking username availability…');
      return;
    }
    if (!location) {
      Alert.alert('Location required', 'Please select your location.');
      return;
    }
    if (location === 'Other' && !otherLocation.trim()) {
      Alert.alert('Location required', 'Please enter your location.');
      return;
    }
    // DOB cross-validation (optional field, but if one is set both must be set)
    if ((dobMonth && !dobYear) || (!dobMonth && dobYear)) {
      Alert.alert('Date of Birth', 'Please select both a month and a year.');
      return;
    }

    const finalLocation = location === 'Other' ? otherLocation.trim() : location;

    // Build DOB string: "YYYY-MM" e.g. "1992-07"
    let dateOfBirth: string | undefined;
    if (dobYear && dobMonth) {
      const monthNum = String(MONTHS.indexOf(dobMonth) + 1).padStart(2, '0');
      dateOfBirth = `${dobYear}-${monthNum}`;
    }

    setLoading(true);
    updateUser({
      name: name.trim(),
      username: `@${username}`,
      location: finalLocation,
      ...(dateOfBirth ? { dateOfBirth } : {}),
    });
    setLoading(false);
    router.push('/(setup)/challenges');
  };

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {/* Progress bar */}
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '25%' }]} />
            </View>
            <Text style={styles.progressLabel}>1 of 4</Text>
          </View>

          <Text style={styles.heading}>Tell us about yourself</Text>
          <Text style={styles.sub}>
            We'll need your name, age, and location to personalise your experience.
          </Text>

          {/* ── Name ─────────────────────────────────────────── */}
          <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputWrap, focusedField === 'name' && styles.inputFocused]}>
            <TextInput
              style={styles.input}
              placeholder="John Smith"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
          <Text style={styles.hint}>We won't display your full name if you don't want us to</Text>

          {/* ── Username ─────────────────────────────────────── */}
          <Text style={styles.label}>Username <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputWrap, focusedField === 'username' && styles.inputFocused]}>
            <Text style={styles.atSign}>@</Text>
            <TextInput
              style={styles.input}
              placeholder="johnsmith"
              placeholderTextColor={Colors.textMuted}
              value={username}
              onChangeText={handleUsernameChange}
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
            />
            {usernameStatus === 'checking' && <ActivityIndicator size="small" color={Colors.primary} />}
            {usernameStatus === 'available' && <Ionicons name="checkmark-circle" size={20} color={Colors.success} />}
            {usernameStatus === 'taken' && <Ionicons name="close-circle" size={20} color="#EF4444" />}
          </View>
          {usernameStatus === 'taken'
            ? <Text style={[styles.hint, { color: '#EF4444' }]}>That username is already taken</Text>
            : <Text style={styles.hint}>Min. 3 characters, no spaces</Text>
          }

          {/* ── Date of Birth ────────────────────────────────── */}
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity
            style={[styles.inputWrap, styles.pickerWrap]}
            onPress={() => {
              setShowDobPicker(v => !v);
              setShowLocationPicker(false);
            }}
          >
            <Text style={[styles.input, !dobLabel && { color: Colors.textMuted }]}>
              {dobLabel || 'Select month & year (optional)'}
            </Text>
            <Ionicons
              name={showDobPicker ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

          {showDobPicker && (
            <View style={styles.pickerDropdown}>
              {/* Year — horizontally scrollable chips */}
              <Text style={styles.pickerSectionLabel}>Year</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.yearScroll}
                contentContainerStyle={styles.yearScrollContent}
                nestedScrollEnabled
              >
                {YEARS.map(y => (
                  <TouchableOpacity
                    key={y}
                    style={[styles.yearChip, dobYear === y && styles.chipActive]}
                    onPress={() => setDobYear(y)}
                  >
                    <Text style={[styles.chipText, dobYear === y && styles.chipActiveText]}>{y}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Month — vertical list */}
              <Text style={[styles.pickerSectionLabel, { marginTop: 4 }]}>Month</Text>
              {MONTHS.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.monthRow, dobMonth === m && styles.monthActive]}
                  onPress={() => handleSelectMonth(m)}
                >
                  <Text style={[styles.monthText, dobMonth === m && styles.monthActiveText]}>{m}</Text>
                  {dobMonth === m && (
                    <Ionicons name="checkmark" size={16} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── Location ─────────────────────────────────────── */}
          <Text style={styles.label}>Location <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={[styles.inputWrap, styles.pickerWrap]}
            onPress={() => {
              setShowLocationPicker(v => !v);
              setShowDobPicker(false);
            }}
          >
            <Text style={[styles.input, !location && { color: Colors.textMuted }]}>
              {locationLabel || 'Select your location'}
            </Text>
            <Ionicons
              name={showLocationPicker ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

          {showLocationPicker && (
            <View style={styles.pickerDropdown}>
              {LOCATIONS.map(loc => (
                <TouchableOpacity
                  key={loc}
                  style={[styles.monthRow, location === loc && styles.monthActive]}
                  onPress={() => handleSelectLocation(loc)}
                >
                  <Text style={[styles.monthText, location === loc && styles.monthActiveText]}>{loc}</Text>
                  {location === loc && (
                    <Ionicons name="checkmark" size={16} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* "Other" location text input — shown inline once Other is selected */}
          {location === 'Other' && (
            <View
              style={[
                styles.inputWrap,
                styles.otherInput,
                focusedField === 'otherLocation' && styles.inputFocused,
              ]}
            >
              <Ionicons name="location-outline" size={16} color={Colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.input}
                placeholder="Enter your city or region…"
                placeholderTextColor={Colors.textMuted}
                value={otherLocation}
                onChangeText={setOtherLocation}
                autoCapitalize="words"
                returnKeyType="done"
                onFocus={() => setFocusedField('otherLocation')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          )}

          <View style={styles.spacer} />

          {/* ── Continue ─────────────────────────────────────── */}
          <TouchableOpacity
            style={[styles.nextBtn, loading && { opacity: 0.7 }]}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Text style={styles.nextText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.white} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.primaryLight,
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressLabel: { color: Colors.textMuted, fontSize: 12 },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  sub: {
    fontSize: 15,
    color: Colors.textMuted,
    lineHeight: 22,
    marginBottom: 28,
  },
  required: { color: '#EF4444' },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 7,
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: -2,
    marginBottom: 18,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 4,
  },
  inputFocused: { borderColor: Colors.primary },
  otherInput: { marginTop: 8, marginBottom: 16 },
  atSign: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  pickerWrap: { marginBottom: 4 },
  pickerDropdown: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  pickerSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
  },
  yearScroll: { maxHeight: 52 },
  yearScrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 6,
    flexDirection: 'row',
  },
  yearChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.text },
  chipActiveText: { color: Colors.white, fontWeight: '600' },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  monthActive: { backgroundColor: Colors.primaryLight },
  monthText: { fontSize: 15, color: Colors.text },
  monthActiveText: { color: Colors.primary, fontWeight: '600' },
  spacer: { height: 24 },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 52,
  },
  nextText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
