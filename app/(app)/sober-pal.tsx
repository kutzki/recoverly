import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

const MOCK_PALS = [
  { id: '1', name: 'Sarah M.', days: 45, location: 'Los Angeles, CA', initial: 'S', mutual: true },
  { id: '2', name: 'David R.', days: 12, location: 'New York, NY', initial: 'D', mutual: false },
  { id: '3', name: 'Emily K.', days: 90, location: 'Chicago, IL', initial: 'E', mutual: true },
];

export default function SoberPal() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Sober Pal</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.intro}>
          Connect with others on the same journey. Support each other to stay strong.
        </Text>

        <Text style={styles.sectionTitle}>Your Pals</Text>
        {MOCK_PALS.map(pal => (
          <View key={pal.id} style={styles.palCard}>
            <View style={styles.palAvatar}>
              <Text style={styles.palAvatarText}>{pal.initial}</Text>
            </View>
            <View style={styles.palInfo}>
              <Text style={styles.palName}>{pal.name}</Text>
              <View style={styles.palMeta}>
                <Ionicons name="sunny-outline" size={12} color={Colors.primary} />
                <Text style={styles.palDays}>{pal.days} days sober</Text>
              </View>
              <Text style={styles.palLocation}>{pal.location}</Text>
            </View>
            <TouchableOpacity style={styles.msgBtn}>
              <Ionicons name="chatbubble-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.findBtn}>
          <Ionicons name="search-outline" size={18} color={Colors.white} />
          <Text style={styles.findBtnText}>Find a Sober Pal</Text>
        </TouchableOpacity>
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
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  scroll: { padding: 20 },
  intro: { fontSize: 14, color: Colors.textMuted, lineHeight: 22, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  palCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  palAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  palAvatarText: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  palInfo: { flex: 1 },
  palName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  palMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  palDays: { fontSize: 12, color: Colors.primary, fontWeight: '500' },
  palLocation: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  msgBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 50,
    marginTop: 16,
  },
  findBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
