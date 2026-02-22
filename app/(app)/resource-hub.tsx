import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

const RESOURCES = [
  {
    category: 'Crisis Helplines',
    items: [
      { title: 'SAMHSA National Helpline', sub: '1-800-662-4357 · 24/7 Free', icon: 'call-outline' as const, url: 'tel:18006624357', color: '#FF3B30' },
      { title: '988 Suicide & Crisis Lifeline', sub: 'Call or text 988', icon: 'heart-outline' as const, url: 'tel:988', color: '#FF6B6B' },
    ],
  },
  {
    category: 'Support Groups',
    items: [
      { title: 'Alcoholics Anonymous', sub: 'Find a local AA meeting', icon: 'people-outline' as const, url: 'https://www.aa.org', color: Colors.primary },
      { title: 'Narcotics Anonymous', sub: 'Find a local NA meeting', icon: 'people-outline' as const, url: 'https://www.na.org', color: Colors.accent },
      { title: 'Gamblers Anonymous', sub: 'Find a local GA meeting', icon: 'people-outline' as const, url: 'https://www.gamblersanonymous.org', color: Colors.warning },
      { title: 'SMART Recovery', sub: 'Science-based support', icon: 'bulb-outline' as const, url: 'https://www.smartrecovery.org', color: Colors.success },
    ],
  },
  {
    category: 'Mental Health',
    items: [
      { title: 'Psychology Today', sub: 'Find a therapist near you', icon: 'medical-outline' as const, url: 'https://www.psychologytoday.com', color: '#5AC8FA' },
      { title: 'Headspace', sub: 'Guided meditation & mindfulness', icon: 'flower-outline' as const, url: 'https://www.headspace.com', color: '#FF9F43' },
    ],
  },
];

export default function ResourceHub() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Resource Hub</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Curated resources to support your recovery journey. All links are free to access.
        </Text>

        {RESOURCES.map(section => (
          <View key={section.category} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.category}</Text>
            {section.items.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.resourceCard}
                onPress={() => Linking.openURL(item.url)}
                activeOpacity={0.85}
              >
                <View style={[styles.resourceIcon, { backgroundColor: item.color + '22' }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View style={styles.resourceInfo}>
                  <Text style={styles.resourceTitle}>{item.title}</Text>
                  <Text style={styles.resourceSub}>{item.sub}</Text>
                </View>
                <Ionicons name="open-outline" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={{ height: 32 }} />
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
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  resourceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceInfo: { flex: 1 },
  resourceTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  resourceSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
});
