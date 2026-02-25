import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { getStreamChatClient, getOrCreateDMChannel, searchUsers } from '../../services/streamChat';
import { useAuthStore } from '../../store/auth';

interface Pal {
  id: string;
  name: string;
  daysSober?: number;
  location?: string;
}

function palInitial(name: string) {
  return (name || '?')[0].toUpperCase();
}

export default function SoberPal() {
  const { user } = useAuthStore();
  const [pals, setPals] = useState<Pal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPals = useCallback(async () => {
    const client = getStreamChatClient();
    if (!client || !user) { setLoading(false); return; }

    try {
      const users = await searchUsers('', user.id, 30);
      setPals(
        users.map(u => ({
          id: u.id,
          name: u.name ?? u.id,
          daysSober: (u as any).days_sober,
          location: (u as any).location,
        }))
      );
    } catch {
      // Fallback placeholder pals for demo when Stream has no other users yet
      setPals([
        { id: 'demo_sarah', name: 'Sarah M.', daysSober: 45, location: 'Los Angeles, CA' },
        { id: 'demo_david', name: 'David R.', daysSober: 12, location: 'New York, NY' },
        { id: 'demo_emily', name: 'Emily K.', daysSober: 90, location: 'Chicago, IL' },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { loadPals(); }, [loadPals]);

  const onChat = useCallback(async (pal: Pal) => {
    if (!user) return;
    try {
      const channel = await getOrCreateDMChannel(user.id, pal.id);
      router.push({ pathname: '/(app)/chat/[cid]' as any, params: { cid: channel.cid } });
    } catch {
      Alert.alert('Error', 'Could not open chat. Please try again.');
    }
  }, [user]);

  const onAudioCall = useCallback((pal: Pal) => {
    router.push({
      pathname: '/(app)/call/[callId]' as any,
      params: { callId: `pal_audio_${pal.id}`, type: 'audio_room', calleeName: encodeURIComponent(pal.name) },
    });
  }, []);

  const onVideoCall = useCallback((pal: Pal) => {
    router.push({
      pathname: '/(app)/call/[callId]' as any,
      params: { callId: `pal_video_${pal.id}`, type: 'default', calleeName: encodeURIComponent(pal.name) },
    });
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Sober Pal</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPals(); }} tintColor={Colors.primary} />}
      >
        <Text style={styles.intro}>
          Connect with others on the same journey. Support each other to stay strong.
        </Text>

        <Text style={styles.sectionTitle}>Your Pals</Text>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
        ) : pals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={44} color={Colors.primaryLight} />
            <Text style={styles.emptyText}>No pals yet. Find one below!</Text>
          </View>
        ) : (
          pals.map(pal => (
            <View key={pal.id} style={styles.palCard}>
              <TouchableOpacity
                style={styles.palCardLeft}
                onPress={() => router.push({ pathname: '/(app)/user/[userId]' as any, params: { userId: pal.id } })}
                activeOpacity={0.85}
              >
                <View style={styles.palAvatar}>
                  <Text style={styles.palAvatarText}>{palInitial(pal.name)}</Text>
                </View>
                <View style={styles.palInfo}>
                  <Text style={styles.palName}>{pal.name}</Text>
                  {pal.daysSober != null && (
                    <View style={styles.palMeta}>
                      <Ionicons name="sunny-outline" size={12} color={Colors.primary} />
                      <Text style={styles.palDays}>{pal.daysSober} days sober</Text>
                    </View>
                  )}
                  {pal.location ? <Text style={styles.palLocation}>{pal.location}</Text> : null}
                </View>
              </TouchableOpacity>
              <View style={styles.palActions}>
                <TouchableOpacity style={styles.palActionBtn} onPress={() => onChat(pal)}>
                  <Ionicons name="chatbubble-outline" size={16} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.palActionBtn} onPress={() => onAudioCall(pal)}>
                  <Ionicons name="call-outline" size={16} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.palActionBtn} onPress={() => onVideoCall(pal)}>
                  <Ionicons name="videocam-outline" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.findBtn} onPress={() => router.push('/(app)/find-users' as any)}>
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
  emptyState: { alignItems: 'center', gap: 10, paddingVertical: 32 },
  emptyText: { fontSize: 14, color: Colors.textMuted },
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
  palCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  palActions: { flexDirection: 'row', gap: 6 },
  palActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
