import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { getOrCreateDMChannel, searchUsers } from '../../services/streamChat';
import { followUser } from '../../services/streamFeed';
import { useAuthStore } from '../../store/auth';

type TabKey = 'search' | 'pals' | 'community';

interface StreamUser {
  id: string;
  name?: string;
  days_sober?: number;
  challenges?: string[];
  location?: string;
  last_active?: string;
}

function UserCard({ item, currentUserId, onMessage, onAddPal, isFollowing, isAdded }: {
  item: StreamUser;
  currentUserId: string;
  onMessage: (userId: string, name: string) => void;
  onAddPal: (userId: string) => void;
  isFollowing?: boolean;
  isAdded?: boolean;
}) {
  const initial = (item.name || item.id)[0].toUpperCase();
  return (
    <View style={styles.userCard}>
      <View style={styles.userAvatar}>
        <Text style={styles.userAvatarText}>{initial}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name || item.id}</Text>
        {item.days_sober != null && (
          <View style={styles.userMeta}>
            <Ionicons name="sunny-outline" size={11} color={Colors.primary} />
            <Text style={styles.userMetaText}>{item.days_sober} days sober</Text>
          </View>
        )}
        {item.challenges && item.challenges.length > 0 && (
          <View style={styles.tags}>
            {item.challenges.slice(0, 2).map(c => (
              <View key={c} style={styles.tag}>
                <Text style={styles.tagText}>{c}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onMessage(item.id, item.name || item.id)}
        >
          <Ionicons name="chatbubble-outline" size={17} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.addBtn, (isFollowing || isAdded) && styles.addBtnDone]}
          onPress={() => !isFollowing && !isAdded && onAddPal(item.id)}
          disabled={isFollowing || isAdded}
          activeOpacity={0.7}
        >
          {isFollowing ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : isAdded ? (
            <Ionicons name="checkmark" size={17} color={Colors.white} />
          ) : (
            <Ionicons name="person-add-outline" size={17} color={Colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FindUsers() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabKey>('search');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StreamUser[]>([]);
  const [palResults, setPalResults] = useState<StreamUser[]>([]);
  const [communityResults, setCommunityResults] = useState<StreamUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingId, setFollowingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const currentUserId = user?.id ?? '';

  // ── Search by name ──────────────────────────────────────────────────────────
  const runSearch = useCallback(async (text: string) => {
    if (!text.trim() || !currentUserId) { setSearchResults([]); return; }
    setLoading(true);
    try {
      const users = await searchUsers(text, currentUserId);
      setSearchResults(users as StreamUser[]);
    } catch {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    const t = setTimeout(() => runSearch(query), 350);
    return () => clearTimeout(t);
  }, [query, runSearch]);

  // ── Sober Pals tab: users with matching challenges ──────────────────────────
  const loadPalMatches = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const users = await searchUsers('', currentUserId, 30);
      // Filter by shared challenges if user has any
      const myChallenges = user?.challenges ?? [];
      const matched = myChallenges.length
        ? (users as StreamUser[]).filter(u =>
            u.challenges?.some(c => myChallenges.includes(c))
          )
        : (users as StreamUser[]);
      setPalResults(matched.length ? matched : (users as StreamUser[]));
    } catch {
      setPalResults([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, user?.challenges]);

  // ── Community tab: all recent users ────────────────────────────────────────
  const loadCommunity = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const users = await searchUsers('', currentUserId, 50);
      setCommunityResults(users as StreamUser[]);
    } catch {
      setCommunityResults([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    // Clear stale search results when navigating away from search tab
    if (activeTab !== 'search') setQuery('');
    if (activeTab === 'pals') loadPalMatches();
    if (activeTab === 'community') loadCommunity();
  }, [activeTab, loadPalMatches, loadCommunity]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const onMessage = useCallback(async (userId: string, name: string) => {
    try {
      const channel = await getOrCreateDMChannel(currentUserId, userId);
      router.push({ pathname: '/(app)/chat/[cid]' as any, params: { cid: channel.cid } });
    } catch {
      Alert.alert('Error', 'Could not open chat.');
    }
  }, [currentUserId]);

  const onAddPal = useCallback(async (userId: string) => {
    if (followingId || addedIds.has(userId)) return;
    setFollowingId(userId);
    try {
      await followUser(currentUserId, userId);
      setAddedIds(prev => new Set([...prev, userId]));
      Alert.alert('Added!', 'You are now following this person\'s activity.');
    } catch {
      Alert.alert('Error', 'Could not add pal. Please try again.');
    } finally {
      setFollowingId(null);
    }
  }, [currentUserId, followingId, addedIds]);

  const tabData: StreamUser[] =
    activeTab === 'search' ? searchResults :
    activeTab === 'pals' ? palResults :
    communityResults;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Find People</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['search', 'pals', 'community'] as TabKey[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab === 'search' ? 'Search' : tab === 'pals' ? 'Sober Pals' : 'Community'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search bar (search tab only) */}
      {activeTab === 'search' && (
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {loading && <ActivityIndicator size="small" color={Colors.primary} />}
          {query.length > 0 && !loading && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Results */}
      {loading && activeTab !== 'search' ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={tabData}
          keyExtractor={u => u.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <UserCard
              item={item}
              currentUserId={currentUserId}
              onMessage={onMessage}
              onAddPal={onAddPal}
              isFollowing={followingId === item.id}
              isAdded={addedIds.has(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={44} color={Colors.primaryLight} />
              <Text style={styles.emptyTitle}>
                {activeTab === 'search'
                  ? query.length > 1 ? 'No users found' : 'Start typing to search'
                  : 'No users yet'}
              </Text>
              {activeTab !== 'search' && (
                <Text style={styles.emptySubtitle}>More people will appear as they join</Text>
              )}
            </View>
          }
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontFamily: Fonts.poppinsBold, color: Colors.text },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary },
  tabLabel: { fontSize: 13, fontFamily: Fonts.poppinsMedium, color: Colors.textMuted },
  tabLabelActive: { color: Colors.primary, fontFamily: Fonts.poppinsBold },
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
  searchInput: { flex: 1, fontSize: 15, fontFamily: Fonts.jost, color: Colors.text },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingVertical: 8, flexGrow: 1 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: { fontSize: 20, fontFamily: Fonts.poppinsBold, color: Colors.primary },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontFamily: Fonts.poppinsSemiBold, color: Colors.text },
  userMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  userMetaText: { fontSize: 12, color: Colors.primary, fontFamily: Fonts.poppinsMedium },
  tags: { flexDirection: 'row', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  tag: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagText: { fontSize: 10, color: Colors.primary, fontFamily: Fonts.poppinsSemiBold },
  userActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: { backgroundColor: Colors.primary },
  addBtnDone: { backgroundColor: Colors.success },
  emptyState: { alignItems: 'center', gap: 10, paddingTop: 60 },
  emptyTitle: { fontSize: 16, fontFamily: Fonts.poppinsSemiBold, color: Colors.text },
  emptySubtitle: { fontSize: 13, fontFamily: Fonts.jost, color: Colors.textMuted },
});
