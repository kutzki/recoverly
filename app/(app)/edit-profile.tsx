import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useAuthStore } from '../../store/auth';

export default function EditProfile() {
  const { user, updateUser } = useAuthStore();

  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState((user?.username ?? '').replace('@', ''));
  const [location, setLocation] = useState(user?.location ?? '');
  const [goal, setGoal] = useState(user?.shortTermGoal ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  // Use ?? '' (nullish coalescing) so that an explicit empty-string field in
  // the DB doesn't get coerced by || '' — prevents false "not dirty" state.
  const isDirty =
    name !== (user?.name ?? '') ||
    username !== (user?.username ?? '').replace('@', '') ||
    location !== (user?.location ?? '') ||
    goal !== (user?.shortTermGoal ?? '') ||
    bio !== (user?.bio ?? '');

  const handleBack = () => {
    if (isDirty) {
      Alert.alert('Discard changes?', 'You have unsaved changes.', [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    setSaving(true);
    try {
      await updateUser({
        name: name.trim(),
        username: username.trim() ? `@${username.trim().replace('@', '')}` : '',
        location: location.trim(),
        shortTermGoal: goal.trim(),
        bio: bio.trim(),
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({
    label, value, onChangeText, placeholder, multiline, maxLength, keyboardType, autoCapitalize,
  }: any) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrap, focused === label && styles.inputFocused, multiline && styles.inputMulti]}>
        <TextInput
          style={[styles.input, multiline && styles.inputTextMulti]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          multiline={multiline}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'sentences'}
          onFocus={() => setFocused(label)}
          onBlur={() => setFocused(null)}
        />
        {maxLength && (
          <Text style={styles.charCount}>{value.length}/{maxLength}</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || !isDirty}
            style={[styles.saveBtn, (saving || !isDirty) && styles.saveBtnDisabled]}
          >
            {saving
              ? <ActivityIndicator size="small" color={Colors.white} />
              : <Text style={styles.saveBtnText}>Save</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Avatar preview */}
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{name?.[0]?.toUpperCase() || '?'}</Text>
            </View>
          </View>

          <Field
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            maxLength={50}
          />

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Username</Text>
            <View style={[styles.inputWrap, focused === 'username' && styles.inputFocused]}>
              <Text style={styles.atPrefix}>@</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={t => setUsername(t.replace('@', ''))}
                placeholder="username"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={30}
                onFocus={() => setFocused('username')}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>

          <Field
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder="City, State"
            maxLength={60}
            autoCapitalize="words"
          />

          <Field
            label="Short-term Goal"
            value={goal}
            onChangeText={setGoal}
            placeholder="What's your focus right now?"
            multiline
            maxLength={200}
          />

          <Field
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell the community a bit about yourself..."
            multiline
            maxLength={200}
          />

          <Text style={styles.hint}>
            Your profile is visible to other community members.
          </Text>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: Fonts.poppinsBold, color: Colors.text },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 7,
    minWidth: 56,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: Colors.white, fontFamily: Fonts.poppinsBold, fontSize: 14 },
  scroll: { paddingHorizontal: 20, paddingTop: 24 },
  avatarRow: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontFamily: Fonts.poppinsBold, color: Colors.primary },
  fieldWrap: { marginBottom: 18 },
  fieldLabel: { fontSize: 13, fontFamily: Fonts.poppinsBold, color: Colors.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  inputFocused: { borderColor: Colors.primary },
  inputMulti: { alignItems: 'flex-start', paddingVertical: 12, minHeight: 90 },
  input: { flex: 1, fontSize: 15, fontFamily: Fonts.jost, color: Colors.text, paddingVertical: 0 },
  inputTextMulti: { textAlignVertical: 'top', minHeight: 70 },
  atPrefix: { fontSize: 16, fontFamily: Fonts.poppinsSemiBold, color: Colors.textMuted, marginRight: 4 },
  charCount: { fontSize: 11, fontFamily: Fonts.jost, color: Colors.textMuted, alignSelf: 'flex-end', paddingBottom: 4 },
  hint: { fontSize: 12, fontFamily: Fonts.jost, color: Colors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 18 },
});
