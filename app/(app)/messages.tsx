import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

const MOCK_MESSAGES = [
  { id: '1', name: 'Jack (Sponsor)', lastMsg: 'How are you feeling today?', time: '2m ago', unread: 3, initial: 'J' },
  { id: '2', name: 'Recovery Group', lastMsg: 'Sarah: Great meeting everyone!', time: '1h ago', unread: 13, initial: 'R' },
  { id: '3', name: 'Mike S.', lastMsg: 'Let\'s grab coffee before the meeting', time: '2h ago', unread: 0, initial: 'M' },
  { id: '4', name: 'AA Meeting Chat', lastMsg: 'Next meeting Thursday 7pm', time: 'Yesterday', unread: 0, initial: 'A' },
  { id: '5', name: 'Emma T.', lastMsg: '30 days!! So proud of you 🎉', time: 'Yesterday', unread: 0, initial: 'E' },
];

export default function Messages() {
  const totalUnread = MOCK_MESSAGES.reduce((acc, m) => acc + m.unread, 0);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Messages</Text>
          {totalUnread > 0 && (
            <Text style={styles.unreadLabel}>{totalUnread} unread</Text>
          )}
        </View>
        <TouchableOpacity style={styles.composeBtn}>
          <Ionicons name="create-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_MESSAGES}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.msgRow} activeOpacity={0.8}>
            <View style={[styles.avatar, item.unread > 0 && styles.avatarUnread]}>
              <Text style={styles.avatarText}>{item.initial}</Text>
            </View>
            <View style={styles.msgInfo}>
              <View style={styles.msgTopRow}>
                <Text style={[styles.msgName, item.unread > 0 && styles.msgNameBold]}>
                  {item.name}
                </Text>
                <Text style={styles.msgTime}>{item.time}</Text>
              </View>
              <View style={styles.msgBottomRow}>
                <Text style={[styles.msgPreview, item.unread > 0 && styles.msgPreviewBold]} numberOfLines={1}>
                  {item.lastMsg}
                </Text>
                {item.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 12,
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  unreadLabel: { fontSize: 12, color: Colors.primary },
  composeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  list: { paddingVertical: 8 },
  sep: { height: 1, backgroundColor: Colors.border, marginLeft: 76 },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: Colors.white,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarUnread: { backgroundColor: Colors.primary },
  avatarText: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  msgInfo: { flex: 1 },
  msgTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  msgName: { fontSize: 15, color: Colors.text },
  msgNameBold: { fontWeight: '700' },
  msgTime: { fontSize: 12, color: Colors.textMuted },
  msgBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  msgPreview: { flex: 1, fontSize: 13, color: Colors.textMuted, marginRight: 8 },
  msgPreviewBold: { color: Colors.text, fontWeight: '500' },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
});
