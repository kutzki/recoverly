import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChannelList, Chat, ChannelPreviewMessenger } from 'stream-chat-react-native';
import { Channel as ChannelType } from 'stream-chat';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { getStreamChatClient, buildChannelFilters, buildChannelSort, getOrCreateDMChannel, searchUsers } from '../../services/streamChat';
import { useAuthStore } from '../../store/auth';

// ─── New DM / compose modal ───────────────────────────────────────────────────

function ComposeModal({ visible, onClose, currentUserId }: {
  visible: boolean;
  onClose: () => void;
  currentUserId: string;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (text: string) => {
    if (!text.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const users = await searchUsers(text, currentUserId, 15);
      setResults(users);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    const t = setTimeout(() => search(query), 350);
    return () => clearTimeout(t);
  }, [query, search]);

  const openDM = async (userId: string) => {
    try {
      onClose();
      const channel = await getOrCreateDMChannel(currentUserId, userId);
      router.push({ pathname: '/(app)/chat/[cid]' as any, params: { cid: channel.cid } });
    } catch (err) {
      Alert.alert('Error', 'Could not open chat. Please try again.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={modal.safe}>
        <View style={modal.header}>
          <Text style={modal.title}>New Message</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={modal.searchRow}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={modal.input}
            placeholder="Search people..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {loading && <ActivityIndicator size="small" color={Colors.primary} />}
        </View>

        <FlatList
          data={results}
          keyExtractor={u => u.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={modal.userRow} onPress={() => openDM(item.id)}>
              <View style={modal.avatar}>
                <Text style={modal.avatarText}>{(item.name || item.id)[0].toUpperCase()}</Text>
              </View>
              <View>
                <Text style={modal.userName}>{item.name || item.id}</Text>
                {item.days_sober != null && (
                  <Text style={modal.userSub}>{item.days_sober} days sober</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            query.length > 1 ? (
              loading
                ? <Text style={modal.empty}>Searching…</Text>
                : <Text style={modal.empty}>No users found</Text>
            ) : null
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function Messages() {
  const { user } = useAuthStore();
  const [composeVisible, setComposeVisible] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  // Incrementing retryCount forces useEffect to re-run the 15s timer on retry
  const [retryCount, setRetryCount] = useState(0);
  const chatClient = getStreamChatClient();

  // After 15 seconds without a chat client, stop showing spinner and show error.
  // Re-runs when chatClient connects OR when user taps "Try Again" (retryCount bump).
  useEffect(() => {
    if (chatClient) return;
    setTimedOut(false); // reset to spinner on each new attempt
    const t = setTimeout(() => setTimedOut(true), 15000);
    return () => clearTimeout(t);
  }, [chatClient, retryCount]);

  const onSelectChannel = useCallback((channel: ChannelType) => {
    router.push({ pathname: '/(app)/chat/[cid]' as any, params: { cid: channel.cid } });
  }, []);

  if (!chatClient || !user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Messages</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centered}>
          {timedOut ? (
            <>
              <Ionicons name="wifi-outline" size={48} color={Colors.primaryLight} />
              <Text style={styles.emptyTitle}>Chat unavailable</Text>
              <Text style={styles.emptySubtitle}>
                Could not connect to messaging. Please check your connection and try again.
              </Text>
              <TouchableOpacity onPress={() => setRetryCount(c => c + 1)} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
                <Text style={styles.backLinkText}>Go Back</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <ActivityIndicator color={Colors.primary} />
              <Text style={styles.loadingText}>Connecting…</Text>
              <Text style={styles.loadingSubText}>This may take a moment</Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const filters = buildChannelFilters(user.id);
  const sort = buildChannelSort();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity style={styles.composeBtn} onPress={() => setComposeVisible(true)} accessibilityLabel="Compose new message">
          <Ionicons name="create-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <Chat client={chatClient}>
        <ChannelList
          filters={filters}
          sort={sort}
          onSelect={onSelectChannel}
          Preview={ChannelPreviewMessenger}
          additionalFlatListProps={{
            contentContainerStyle: { flexGrow: 1 },
          }}
          EmptyStateIndicator={() => (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={52} color={Colors.primaryLight} />
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptySubtitle}>Tap + to message someone</Text>
            </View>
          )}
        />
      </Chat>

      {user && (
        <ComposeModal
          visible={composeVisible}
          onClose={() => setComposeVisible(false)}
          currentUserId={user.id}
        />
      )}
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
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontFamily: Fonts.generalSansBold, color: Colors.text },
  composeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  loadingText: { color: Colors.textMuted, fontSize: 14 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 80 },
  emptyTitle: { fontSize: 17, fontFamily: Fonts.generalSansBold, color: Colors.text, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryBtnText: { color: Colors.white, fontFamily: Fonts.generalSansBold, fontSize: 14 },
  backLink: { marginTop: 4, paddingVertical: 8 },
  backLinkText: { color: Colors.textMuted, fontSize: 14 },
  loadingSubText: { color: Colors.textMuted, fontSize: 13, marginTop: -4 },
});

const modal = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: 18, fontFamily: Fonts.generalSansBold, color: Colors.text },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: { flex: 1, fontSize: 15, color: Colors.text },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontFamily: Fonts.generalSansBold, color: Colors.primary },
  userName: { fontSize: 15, fontFamily: Fonts.generalSansSemiBold, color: Colors.text },
  userSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 40, color: Colors.textMuted, fontSize: 14 },
});
