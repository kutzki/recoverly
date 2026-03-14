import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

// ── Placeholder until Phase D (full journal with Supabase) ───────────────────

const MOOD_EMOJIS = ['', '😞', '😕', '😐', '😊', '😄'];

export default function JournalScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16 }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.heading}>Journal</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Empty state */}
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>📓</Text>
        <Text style={styles.emptyTitle}>Your journal is empty</Text>
        <Text style={styles.emptySubtitle}>
          Track your thoughts, mood, and milestones.{'\n'}Your entries stay private — just for you.
        </Text>
        <TouchableOpacity style={styles.newEntryBtn} activeOpacity={0.85}>
          <Ionicons name="add" size={20} color={Colors.white} style={{ marginRight: 8 }} />
          <Text style={styles.newEntryBtnText}>Write First Entry</Text>
        </TouchableOpacity>
        <Text style={styles.comingSoon}>Full journal coming in the next update</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   24,
  },
  heading: {
    fontFamily: Fonts.poppinsBold,
    fontSize:   22,
    color:      Colors.text,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyEmoji: { fontSize: 72, marginBottom: 20 },
  emptyTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize:   22,
    color:      Colors.text,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontFamily: Fonts.jost,
    fontSize:   15,
    color:      Colors.textMuted,
    textAlign:  'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  newEntryBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.primary,
    borderRadius:    14,
    paddingHorizontal: 28,
    paddingVertical: 15,
    marginBottom: 16,
  },
  newEntryBtnText: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize:   16,
    color:      Colors.white,
  },
  comingSoon: {
    fontFamily: Fonts.jost,
    fontSize:   12,
    color:      Colors.textLight,
  },
});
