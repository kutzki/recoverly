import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';

const QUICK_LINKS = [
  { label: 'Resource Hub', icon: 'library-outline' as const, route: '/(app)/resource-hub' },
  { label: 'Meetings', icon: 'people-outline' as const, route: '/(app)/meetings' },
  { label: 'My Sober Pal', icon: 'heart-outline' as const, route: '/(app)/sober-pal' },
];

export default function Favorites() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Favorites</Text>
          <Text style={styles.subtitle}>Bookmark resources for quick access</Text>
        </View>

        {/* Empty state */}
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons name="star-outline" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyDesc}>
            Tap the star icon on any meeting, resource, or article to save it here.
          </Text>
        </View>

        {/* Quick links */}
        <Text style={styles.sectionTitle}>Explore</Text>
        {QUICK_LINKS.map(link => (
          <TouchableOpacity
            key={link.label}
            style={styles.linkRow}
            onPress={() => router.push(link.route as any)}
            activeOpacity={0.8}
          >
            <View style={styles.linkIcon}>
              <Ionicons name={link.icon} size={20} color={Colors.primary} />
            </View>
            <Text style={styles.linkLabel}>{link.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },

  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text },
});
