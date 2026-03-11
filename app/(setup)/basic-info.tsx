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
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useAuthStore } from '../../store/auth';
import { checkUsernameAvailable } from '../../services/supabase';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

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

  useEffect(() => () => {
    if (usernameCheckTimer.current) clearTimeout(usernameCheckTimer.current);
  }, []);

  const handleUsernameChange = (val: string) => {
    const clean = val.replace(/[@\s]/g, '').toLowerCase();
    setUsername(clean);
    setUsernameStatus('idle');
    if (clean.length < 3) return;
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
    if ((dobMonth && !dobYear) || (!dobMonth && dobYear)) {
      Alert.alert('Date of Birth', 'Please select both a month and a year.');
      return;
    }

    const finalLocation = location === 'Other' ? otherLocation.trim() : location;
    let dateOfBirth: string | undefined;
    if (dobYear && dobMonth) {
      const monthNum = String(MONTHS.indexOf(dobMonth) + 1).padStart(2, '0');
      dateOfBirth = `${dobYear}-${monthNum}`;
    }

    setLoading(true);
    try {
      await updateUser({
        name: name.trim(),
        username: `@${username}`,
        location: finalLocation,
        ...(dateOfBirth ? { dateOfBirth } : {}),
      });
      router.push('/(setup)/challenges');
    } catch {
      Alert.alert('Error', 'Could not save your information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const usernameBorderColor =
    usernameStatus === 'available' ? Colors.successGreen :
    usernameStatus === 'taken'    ? Colors.error :
    focusedField === 'username'   ? Colors.primary :
    Colors.border;

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
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
          {/* ── Header ─────────────────────────────────────────── */}
          <View style={styles.headerWrap}>
            <Text style={styles.caption}>
              Before we get started we will need some basics.
            </Text>
            <Text style={styles.heading}>
              Firstly, we will need your name, age, and location.
            </Text>
            <Text style={styles.sub}>
              Please fill out the information below
            </Text>
          </View>

          {/* ── Name ─────────────────────────────────────────── */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Name</Text>
            <View style={[
              styles.inputWrap,
              focusedField === 'name' && styles.inputFocused,
            ]}>
              <TextInput
                style={styles.input}
                placeholder="John Smith"
                placeholderTextColor={Colors.placeholderText}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            <Text style={styles.hint}>We won't display your name if you don't want us to</Text>
          </View>

          {/* ── Username ─────────────────────────────────────── */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Username</Text>
            <View style={[styles.inputWrap, { borderColor: usernameBorderColor }]}>
              <TextInput
                style={styles.input}
                placeholder="@johnsmith"
                placeholderTextColor={Colors.placeholderText}
                value={username ? `@${username}` : ''}
                onChangeText={handleUsernameChange}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
              />
              {usernameStatus === 'checking' && (
                <ActivityIndicator size="small" color={Colors.primary} />
              )}
              {usernameStatus === 'available' && (
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark" size={14} color={Colors.white} />
                </View>
              )}
              {usernameStatus === 'taken' && (
                <Ionicons name="close-circle" size={22} color={Colors.error} />
              )}
            </View>
            {usernameStatus === 'taken' && (
              <Text style={[styles.hint, { color: Colors.error }]}>That username is already taken</Text>
            )}
          </View>

          {/* ── Date of Birth ────────────────────────────────── */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Date of birth</Text>
            <TouchableOpacity
              style={styles.inputWrap}
              onPress={() => {
                setShowDobPicker(v => !v);
                setShowLocationPicker(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.input, !dobLabel && styles.placeholder]}>
                {dobLabel || 'Enter here'}
              </Text>
              <Ionicons
                name={showDobPicker ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={Colors.mutedOverlay}
              />
            </TouchableOpacity>

            {showDobPicker && (
              <View style={styles.pickerDropdown}>
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
                <Text style={[styles.pickerSectionLabel, { marginTop: 4 }]}>Month</Text>
                {MONTHS.map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.monthRow, dobMonth === m && styles.monthActive]}
                    onPress={() => handleSelectMonth(m)}
                  >
                    <Text style={[styles.monthText, dobMonth === m && styles.monthActiveText]}>{m}</Text>
                    {dobMonth === m && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* ── Location ─────────────────────────────────────── */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Location</Text>
            <TouchableOpacity
              style={styles.inputWrap}
              onPress={() => {
                setShowLocationPicker(v => !v);
                setShowDobPicker(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.input, !location && styles.placeholder]}>
                {locationLabel || 'Select one'}
              </Text>
              <Ionicons
                name={showLocationPicker ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={Colors.mutedOverlay}
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
                    {location === loc && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {location === 'Other' && (
              <View style={[
                styles.inputWrap,
                { marginTop: 10 },
                focusedField === 'otherLocation' && styles.inputFocused,
              ]}>
                <Ionicons name="location-outline" size={16} color="rgba(0,0,0,0.4)" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your city or region…"
                  placeholderTextColor={Colors.placeholderText}
                  value={otherLocation}
                  onChangeText={setOtherLocation}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onFocus={() => setFocusedField('otherLocation')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            )}
          </View>

          {/* Bottom spacer so content clears the absolute button */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Next button (black circle, absolute at bottom) ── */}
      <TouchableOpacity
        style={[styles.nextBtn, loading && { opacity: 0.6 }]}
        onPress={handleNext}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color={Colors.white} />
          : <Ionicons name="arrow-forward" size={22} color={Colors.white} />
        }
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  // ── Header ──────────────────────────────────────────────
  headerWrap: {
    gap: 10,
    marginBottom: 32,
  },
  caption: {
    fontSize: 16,
    fontFamily: Fonts.poppins,
    color: Colors.primary,
    lineHeight: 24,
  },
  heading: {
    fontSize: 18,
    fontFamily: Fonts.poppinsSemiBold,
    color: Colors.primary,
    lineHeight: 27,
  },
  sub: {
    fontSize: 16,
    fontFamily: Fonts.poppins,
    color: Colors.textMuted,
    lineHeight: 24,
  },

  // ── Form fields ──────────────────────────────────────────
  fieldWrap: {
    gap: 10,
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontFamily: Fonts.poppinsMedium,
    color: Colors.text,
    letterSpacing: 0.375,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 55,
  },
  inputFocused: { borderColor: Colors.primary },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.poppins,
    color: Colors.text,
    letterSpacing: 0.5,
    padding: 0,  // remove default iOS/Android TextInput padding
  },
  placeholder: { color: Colors.placeholderText },
  hint: {
    fontSize: 12,
    fontFamily: Fonts.poppinsMedium,
    color: Colors.textMuted,
    lineHeight: 20,
  },

  // ── Username checkmark badge ─────────────────────────────
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.successGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Dropdowns ───────────────────────────────────────────
  pickerDropdown: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  pickerSectionLabel: {
    fontSize: 11,
    fontFamily: Fonts.poppinsBold,
    color: Colors.mutedOverlay,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
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
  chipText: { fontSize: 13, fontFamily: Fonts.jost, color: Colors.text },
  chipActiveText: { color: Colors.white, fontFamily: Fonts.poppinsSemiBold },
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
  monthText: { fontSize: 15, fontFamily: Fonts.jost, color: Colors.text },
  monthActiveText: { color: Colors.primary, fontFamily: Fonts.poppinsSemiBold },

  // ── Black circle next button ─────────────────────────────
  nextBtn: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
