import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useAuthStore } from '../../store/auth';
import { getFavorites, removeFavorite, UserFavorite } from '../../services/supabase';

const TYPE_META: Record<string, { icon: any; color: string; label: string }> = {
  meeting:  { icon: 'people-outline',   color: Colors.primary,  label: 'Meeting'  },
  resource: { icon: 'library-outline',  color: '#10B981',       label: 'Resource' },
  article:  { icon: 'newspaper-outline', color: '#F59E0B',      label: 'Article'  },
};

const QUICK_LINKS = [
  { label: 'Resource Hub', icon: 'library-outline' as const, route: '/(app)/resource-hub' },
  { label: 'Meetings',     icon: 'people-outline'  as const, route: '/(app)/meetings'     },
  { label: 'My Sober Pal', icon: 'heart-outline'   as const, route: '/(app)/sober-pal'   },
];

export default function Favorites() {
  const { user } = useAuthStore();
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const data = await getFavorites(user.id);
      setFavorites(data);
    } catch {
      // fail silently — show empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { loadFavorites(); }, [loadFavorites]);

  const handleRemove = (fav: UserFavorite) => {
    Alert.alert('Remove Favorite', `Remove "${fav.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          await removeFavorite(fav.id);
          setFavorites(prev => prev.filter(f => f.id !== fav.id));
        },
      },
    ]);
  };

  const handleOpen = (fav: UserFavorite) => {
    if (fav.url) {
      Linking.openURL(fav.url).catch(() => Alert.alert('Error', 'Could not open this link.'));
    }
  };

  const renderFavorite = ({ item }: { item: UserFavorite }) => {
    const meta = TYPE_META[item.item_type] ?? TYPE_META.resource;
    return (
      <TouchableOpacity
        style={styles.favCard}
        onPress={() => handleOpen(item)}
        activeOpacity={item.url ? 0.75 : 1}
      >
        <View style={[styles.favIcon, { backgroundColor: meta.color + '18' }]}>
          <Ionicons name={meta.icon} size={20} color={meta.color} />
        </View>
        <View style={styles.favInfo}>
          <View style={styles.favTitleRow}>
            <Text style={styles.favTitle} numberOfLines={1}>{item.title}</Text>
            <View style={[styles.favTypePill, { backgroundColor: meta.color + '18' }]}>
              <Text style={[styles.favTypeText, { color: meta.color }]}>{meta.label}</Text>
            </View>
          </View>
          {item.description ? (
            <Text style={styles.favDesc} numberOfLines={2}>{item.description}</Text>
          ) : null}
        </View>
        <TouchableOpacity style={styles.favRemoveBtn} onPress={() => handleRemove(item)}>
          <Ionicons name="trash-outline" size={16} color="#FF4747" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={favorites}
        keyExtractor={item => item.id}
        renderItem={renderFavorite}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadFavorites(); }}
            tintColor={Colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Favorites</Text>
              <Text style={styles.subtitle}>Your saved meetings, resources & articles</Text>
            </View>

            {loading ? (
              <ActivityIndicator color={Colors.primary} style={{ marginVertical: 40 }} />
            ) : favorites.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="star-outline" size={36} color={Colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>No favorites yet</Text>
                <Text style={styles.emptyDesc}>
                  Tap the star ⭐ on any meeting, resource, or article to save it here for quick access.
                </Text>
              </View>
            ) : (
              <Text style={styles.sectionTitle}>Saved ({favorites.length})</Text>
            )}
          </>
        }
        ListFooterComponent={
          <>
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
            <View style={{ height: 32 }} />
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  header: { marginBottom: 20 },
  title: { fontSize: 26, fontFamily: Fonts.poppinsBold, color: Colors.text },
  subtitle: { fontSize: 14, fontFamily: Fonts.jost, color: Colors.textMuted, marginTop: 4 },
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
  emptyTitle: { fontSize: 17, fontFamily: Fonts.poppinsBold, color: Colors.text, marginBottom: 8 },
  emptyDesc: {
    fontSize: 13,
    fontFamily: Fonts.jost,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: Fonts.poppinsBold,
    color: Colors.text,
    marginBottom: 12,
  },
  favCard: {
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
  favIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favInfo: { flex: 1 },
  favTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  favTitle: { flex: 1, fontSize: 14, fontFamily: Fonts.poppinsSemiBold, color: Colors.text },
  favTypePill: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  favTypeText: { fontSize: 10, fontFamily: Fonts.poppinsBold },
  favDesc: { fontSize: 12, fontFamily: Fonts.jost, color: Colors.textMuted, lineHeight: 17 },
  favRemoveBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
  linkLabel: { flex: 1, fontSize: 15, fontFamily: Fonts.poppinsSemiBold, color: Colors.text },
});
