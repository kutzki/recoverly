import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

const TOOL_CATEGORIES = [
  {
    id: 'meditation',
    title: 'Meditation',
    description: 'Guided breathing & mindfulness',
    icon: 'leaf-outline' as const,
    color: Colors.success,
    comingSoon: true,
  },
  {
    id: 'exercises',
    title: 'Recovery Exercises',
    description: 'CBT & DBT worksheets',
    icon: 'clipboard-outline' as const,
    color: Colors.primary,
    comingSoon: true,
  },
  {
    id: 'affirmations',
    title: 'Daily Affirmations',
    description: 'Positive reminders sent daily',
    icon: 'sunny-outline' as const,
    color: Colors.warning,
    comingSoon: true,
  },
  {
    id: 'goals',
    title: 'Goal Tracker',
    description: 'Set and track recovery milestones',
    icon: 'flag-outline' as const,
    color: Colors.accent,
    comingSoon: true,
  },
  {
    id: 'videos',
    title: 'Recovery Videos',
    description: 'Educational content & stories',
    icon: 'play-circle-outline' as const,
    color: Colors.primaryDark,
    comingSoon: true,
  },
  {
    id: 'podcasts',
    title: 'Podcasts',
    description: 'Recovery stories & expert talks',
    icon: 'mic-outline' as const,
    color: Colors.successDark,
    comingSoon: true,
  },
];

export default function Apps() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Recovery Tools</Text>
          <Text style={styles.subtitle}>Everything you need on your journey</Text>
        </View>

        {/* Coming soon banner */}
        <View style={styles.banner}>
          <Ionicons name="rocket-outline" size={22} color={Colors.primary} />
          <Text style={styles.bannerText}>
            More tools launching soon! Check back for updates.
          </Text>
        </View>

        {/* Tool grid */}
        <View style={styles.grid}>
          {TOOL_CATEGORIES.map(tool => (
            <TouchableOpacity
              key={tool.id}
              style={styles.card}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: tool.color + '20' }]}>
                <Ionicons name={tool.icon} size={26} color={tool.color} />
              </View>
              <Text style={styles.cardTitle}>{tool.title}</Text>
              <Text style={styles.cardDesc}>{tool.description}</Text>
              {tool.comingSoon && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Coming Soon</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  bannerText: { flex: 1, fontSize: 13, color: Colors.primaryDark, fontWeight: '500' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  cardDesc: { fontSize: 12, color: Colors.textMuted, lineHeight: 17, marginBottom: 10 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 10, color: Colors.primary, fontWeight: '600' },
});
