import React, { useState } from 'react';
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

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const LOCATIONS = [
  'Los Angeles, CA', 'New York, NY', 'Chicago, IL', 'Houston, TX',
  'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
  'Other',
];

export default function BasicInfo() {
  const updateUser = useAuthStore(s => s.updateUser);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [location, setLocation] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUsernameChange = (val: string) => {
    const clean = val.replace(/\s/g, '').toLowerCase();
    setUsername(clean);
    if (clean.length >= 3) {
      setUsernameValid(true); // mock validation
    } else {
      setUsernameValid(null);
    }
  };

  const handleNext = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    if (!username || username.length < 3) {
      Alert.alert('Username required', 'Username must be at least 3 characters.');
      return;
    }
    setLoading(true);
    // Save basic info to store
    updateUser({
      name: name.trim(),
      username,
      location,
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
            Firstly, we will need your name, age, and location.
          </Text>

          {/* Name */}
          <Text style={styles.label}>Full Name</Text>
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
          <Text style={styles.hint}>We won't display your name if you don't want us to</Text>

          {/* Username */}
          <Text style={styles.label}>Username</Text>
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
            {usernameValid === true && (
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            )}
          </View>

          {/* Date of birth */}
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity
            style={[styles.inputWrap, styles.pickerWrap]}
            onPress={() => { setShowMonthPicker(v => !v); setShowLocationPicker(false); }}
          >
            <Text style={[styles.input, !dobMonth && { color: Colors.textMuted }]}>
              {dobMonth ? `${dobMonth} ${dobYear}` : 'Select month & year'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          {showMonthPicker && (
            <View style={styles.pickerDropdown}>
              <View style={styles.yearRow}>
                {['1970','1980','1990','2000','2004','2006'].map(y => (
                  <TouchableOpacity
                    key={y}
                    style={[styles.yearChip, dobYear === y && styles.chipActive]}
                    onPress={() => setDobYear(y)}
                  >
                    <Text style={[styles.chipText, dobYear === y && styles.chipActiveText]}>{y}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {MONTHS.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.monthRow, dobMonth === m && styles.monthActive]}
                  onPress={() => { setDobMonth(m); setShowMonthPicker(false); }}
                >
                  <Text style={[styles.monthText, dobMonth === m && styles.monthActiveText]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Location */}
          <Text style={styles.label}>Location</Text>
          <TouchableOpacity
            style={[styles.inputWrap, styles.pickerWrap]}
            onPress={() => { setShowLocationPicker(v => !v); setShowMonthPicker(false); }}
          >
            <Text style={[styles.input, !location && { color: Colors.textMuted }]}>
              {location || 'Select your location'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          {showLocationPicker && (
            <View style={styles.pickerDropdown}>
              {LOCATIONS.map(loc => (
                <TouchableOpacity
                  key={loc}
                  style={[styles.monthRow, location === loc && styles.monthActive]}
                  onPress={() => { setLocation(loc); setShowLocationPicker(false); }}
                >
                  <Text style={[styles.monthText, location === loc && styles.monthActiveText]}>{loc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.spacer} />

          {/* Next */}
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
    marginTop: -8,
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
  pickerWrap: {
    marginBottom: 4,
  },
  pickerDropdown: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  yearRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  yearChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.text },
  chipActiveText: { color: Colors.white, fontWeight: '600' },
  monthRow: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
