import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Linking, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

const STORAGE_KEY = 'ameriwell_member_id';

const CARE_SERVICES = [
  {
    icon: 'medkit-outline',
    title: 'Behavioral Health',
    desc: 'Addiction treatment & mental health coverage',
    color: Colors.primary,
  },
  {
    icon: 'people-outline',
    title: 'Care Coordination',
    desc: 'Dedicated care coordinator assigned to you',
    color: Colors.goalBlue,
  },
  {
    icon: 'home-outline',
    title: 'In-Home Support',
    desc: 'Recovery support services in your home',
    color: Colors.goalGreen,
  },
  {
    icon: 'call-outline',
    title: '24/7 Nurse Hotline',
    desc: 'Speak with a nurse anytime, day or night',
    color: Colors.sosOrange,
  },
];

const QUICK_LINKS = [
  { label: 'Member Portal',     icon: 'globe-outline',         url: 'https://www.ameriwellcare.com/members' },
  { label: 'Find a Provider',   icon: 'search-outline',        url: 'https://www.ameriwellcare.com/find-care' },
  { label: 'Benefits Summary',  icon: 'document-text-outline', url: 'https://www.ameriwellcare.com/benefits' },
  { label: 'Prior Auth',        icon: 'shield-checkmark-outline', url: 'https://www.ameriwellcare.com/auth' },
];

export default function AmerwellCareScreen() {
  const insets = useSafeAreaInsets();
  const [memberId, setMemberId]     = useState('');
  const [savedId, setSavedId]       = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY).then((val) => {
      if (val) { setSavedId(val); setMemberId(val); }
      setLoading(false);
    });
  }, []);

  const handleConnect = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      Alert.alert('Member ID Required', 'Please enter your Ameriwell Care member ID to connect.');
      return;
    }
    setSaving(true);
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, trimmed);
      setSavedId(trimmed);
      setMemberId(trimmed);
      setInputValue('');
      Alert.alert('Connected!', 'Your Ameriwell Care account has been linked successfully.');
    } catch {
      Alert.alert('Error', 'Could not save your member ID. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Ameriwell Care',
      'Are you sure you want to remove your Ameriwell Care connection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await SecureStore.deleteItemAsync(STORAGE_KEY);
            setSavedId(null);
            setMemberId('');
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const isConnected = !!savedId;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(55,130,255,0.12)', 'transparent']}
        style={styles.bgOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: 48 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="heart-circle" size={36} color={Colors.goalBlue} />
          </View>
          <Text style={styles.title}>Ameriwell Care</Text>
          <Text style={styles.subtitle}>
            Connect your insurance plan to access care coordination, benefits, and in-network providers.
          </Text>
        </View>

        {/* ── Connection Card ─────────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name={isConnected ? 'checkmark-circle' : 'link-outline'}
              size={22}
              color={isConnected ? Colors.successGreen : Colors.primary}
            />
            <Text style={styles.cardTitle}>
              {isConnected ? 'Account Connected' : 'Connect Your Plan'}
            </Text>
          </View>

          {isConnected ? (
            <View>
              <View style={styles.memberIdBox}>
                <Text style={styles.memberIdLabel}>Member ID</Text>
                <Text style={styles.memberIdValue}>{memberId}</Text>
              </View>
              <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect} activeOpacity={0.8}>
                <Text style={styles.disconnectBtnText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.cardDesc}>
                Enter your Ameriwell Care member ID from your insurance card to link your account.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Member ID (e.g. AWC-123456)"
                placeholderTextColor={Colors.placeholderText}
                value={inputValue}
                onChangeText={setInputValue}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.connectBtn, saving && { opacity: 0.7 }]}
                onPress={handleConnect}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.connectBtnText}>Connect Account</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Care Services ──────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Your Coverage Includes</Text>
        <View style={styles.serviceGrid}>
          {CARE_SERVICES.map((svc) => (
            <View key={svc.title} style={styles.serviceCard}>
              <View style={[styles.serviceIcon, { backgroundColor: svc.color + '20' }]}>
                <Ionicons name={svc.icon as any} size={22} color={svc.color} />
              </View>
              <Text style={styles.serviceTitle}>{svc.title}</Text>
              <Text style={styles.serviceDesc}>{svc.desc}</Text>
            </View>
          ))}
        </View>

        {/* ── Quick Links ────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Quick Links</Text>
        <View style={styles.linksList}>
          {QUICK_LINKS.map((link) => (
            <TouchableOpacity
              key={link.label}
              style={styles.linkRow}
              activeOpacity={0.75}
              onPress={() => Linking.openURL(link.url)}
            >
              <View style={styles.linkIconWrap}>
                <Ionicons name={link.icon as any} size={18} color={Colors.primary} />
              </View>
              <Text style={styles.linkLabel}>{link.label}</Text>
              <Ionicons name="open-outline" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Contact ────────────────────────────────────────────────────── */}
        <View style={styles.contactCard}>
          <Ionicons name="call" size={20} color={Colors.goalBlue} />
          <View style={styles.contactText}>
            <Text style={styles.contactTitle}>Member Services</Text>
            <Text style={styles.contactDesc}>1-800-AMERIWELL  •  Mon – Fri 8am – 8pm</Text>
          </View>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => Linking.openURL('tel:18002637493')}
            activeOpacity={0.8}
          >
            <Text style={styles.callBtnText}>Call</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white },
  root:        { flex: 1, backgroundColor: Colors.white },
  bgOverlay:   { position: 'absolute', left: 0, top: 0, width: '100%', height: 360 },
  scroll:      { paddingHorizontal: 24 },

  header:     { alignItems: 'center', marginBottom: 28 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.goalBlue + '18',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  title:    { fontFamily: Fonts.poppinsBold, fontSize: 26, color: Colors.text, textAlign: 'center' },
  subtitle: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 20 },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  cardTitle:  { fontFamily: Fonts.poppinsSemiBold, fontSize: 16, color: Colors.text },
  cardDesc:   { fontFamily: Fonts.jost, fontSize: 13, color: Colors.textMuted, lineHeight: 19, marginBottom: 16 },

  memberIdBox: {
    backgroundColor: Colors.cardTintPurpleFaint,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  memberIdLabel: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.textMuted, marginBottom: 2 },
  memberIdValue: { fontFamily: Fonts.poppinsSemiBold, fontSize: 18, color: Colors.primary, letterSpacing: 1.5 },

  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.jost,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 14,
    backgroundColor: Colors.background,
  },

  connectBtn: {
    backgroundColor: Colors.goalBlue,
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.goalBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  connectBtnText: { fontFamily: Fonts.poppinsSemiBold, fontSize: 15, color: Colors.white },

  disconnectBtn: {
    borderWidth: 1.5,
    borderColor: Colors.error,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  disconnectBtnText: { fontFamily: Fonts.poppinsMedium, fontSize: 14, color: Colors.error },

  sectionLabel: { fontFamily: Fonts.poppinsSemiBold, fontSize: 16, color: Colors.text, marginBottom: 14 },

  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  serviceCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceIcon:  { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  serviceTitle: { fontFamily: Fonts.poppinsMedium, fontSize: 13, color: Colors.text },
  serviceDesc:  { fontFamily: Fonts.jost, fontSize: 11, color: Colors.textMuted, lineHeight: 16 },

  linksList: { gap: 8, marginBottom: 24 },
  linkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.cardTintPurpleFaint,
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  linkIconWrap: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  linkLabel: { flex: 1, fontFamily: Fonts.poppinsMedium, fontSize: 14, color: Colors.text },

  contactCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.goalBlue + '12',
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.goalBlue + '30',
  },
  contactText:  { flex: 1 },
  contactTitle: { fontFamily: Fonts.poppinsSemiBold, fontSize: 14, color: Colors.text },
  contactDesc:  { fontFamily: Fonts.jost, fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  callBtn: {
    backgroundColor: Colors.goalBlue,
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8,
  },
  callBtnText: { fontFamily: Fonts.poppinsSemiBold, fontSize: 13, color: Colors.white },
});
