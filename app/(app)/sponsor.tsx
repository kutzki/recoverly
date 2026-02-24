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
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth';

export default function SponsorScreen() {
  const { user, updateUser } = useAuthStore();

  const [name, setName] = useState(user?.sponsor?.name || '');
  const [phone, setPhone] = useState(user?.sponsor?.phone || '');
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const hasExisting = !!(user?.sponsor?.name && user?.sponsor?.phone);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', "Please enter your sponsor's name.");
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Phone required', "Please enter your sponsor's phone number.");
      return;
    }
    setSaving(true);
    try {
      await updateUser({ sponsor: { name: name.trim(), phone: phone.trim() } });
      Alert.alert('Saved! 💜', "Your sponsor has been saved. You can call them directly from SOS if you're ever in crisis.");
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = () => {
    Alert.alert('Remove Sponsor', 'Are you sure you want to remove your sponsor?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          await updateUser({ sponsor: null } as any);
          setName('');
          setPhone('');
        },
      },
    ]);
  };

  const handleCall = () => {
    if (!user?.sponsor?.phone) return;
    Linking.openURL(`tel:${user.sponsor.phone}`).catch(() =>
      Alert.alert('Error', 'Could not open phone app.')
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Sponsor</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Your sponsor will be available to call directly from the SOS screen during moments of crisis.
          </Text>
        </View>

        {/* Quick call if set */}
        {hasExisting && (
          <TouchableOpacity style={styles.callCard} onPress={handleCall} activeOpacity={0.85}>
            <View style={styles.callIcon}>
              <Ionicons name="call" size={24} color={Colors.white} />
            </View>
            <View style={styles.callText}>
              <Text style={styles.callName}>{user!.sponsor!.name}</Text>
              <Text style={styles.callNumber}>{user!.sponsor!.phone}</Text>
            </View>
            <Text style={styles.callNow}>Call now</Text>
          </TouchableOpacity>
        )}

        {/* Form */}
        <Text style={styles.sectionTitle}>{hasExisting ? 'Update Sponsor' : 'Add Your Sponsor'}</Text>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Sponsor Name</Text>
          <View style={[styles.inputWrap, focused === 'name' && styles.inputFocused]}>
            <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
            />
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Phone Number</Text>
          <View style={[styles.inputWrap, focused === 'phone' && styles.inputFocused]}>
            <Ionicons name="call-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 (555) 000-0000"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              onFocus={() => setFocused('phone')}
              onBlur={() => setFocused(null)}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={styles.saveBtnText}>{hasExisting ? 'Update Sponsor' : 'Save Sponsor'}</Text>
          }
        </TouchableOpacity>

        {hasExisting && (
          <TouchableOpacity style={styles.removeBtn} onPress={handleRemove}>
            <Text style={styles.removeText}>Remove Sponsor</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  scroll: { padding: 20 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 13, color: Colors.primary, lineHeight: 19 },
  callCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  callIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callText: { flex: 1 },
  callName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  callNumber: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  callNow: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 16 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: Colors.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 52,
  },
  inputFocused: { borderColor: Colors.primary },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: Colors.text },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  removeBtn: { alignItems: 'center', paddingVertical: 12 },
  removeText: { color: Colors.textMuted, fontSize: 14, textDecorationLine: 'underline' },
});
