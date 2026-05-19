import { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth';
import { supabase, escapeFilterValue } from '../../services/supabase';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

type UserRow = { id: string; name: string | null; username: string | null; avatar_url: string | null };

export default function FindUsersScreen() {
  const insets  = useSafeAreaInsets();
  const me      = useAuthStore((s) => s.user);
  const [query, setQuery] = useState('');

  const { data: users = [], isFetching } = useQuery<UserRow[]>({
    queryKey: ['find-users', query],
    enabled:  query.length >= 2,
    queryFn:  async () => {
      const safeQuery = escapeFilterValue(`%${query}%`);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url')
        .or(`name.ilike.${safeQuery},username.ilike.${safeQuery}`)
        .neq('id', me?.id ?? '')
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.heading}>Find People</Text>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or username"
          placeholderTextColor={Colors.placeholderText}
          returnKeyType="search"
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          query.length >= 2 && !isFetching ? (
            <Text style={styles.emptyText}>No users found</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userRow}
            onPress={() => router.push(`/(app)/user/${item.id}` as any)}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(item.name ?? item.username ?? '?')[0].toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name ?? '—'}</Text>
              <Text style={styles.userHandle}>@{item.username ?? '—'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: Colors.white, paddingHorizontal: 24 },
  heading:     { fontFamily: Fonts.poppinsBold, fontSize: 24, color: Colors.text, marginBottom: 16 },
  searchRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardTintPurpleFaint, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: Colors.primaryLight, marginBottom: 16 },
  searchIcon:  { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 13, fontFamily: Fonts.jost, fontSize: 14, color: Colors.text },
  list:        { gap: 4 },
  emptyText:   { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted, textAlign: 'center', paddingTop: 24 },
  userRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  avatar:      { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontFamily: Fonts.poppinsBold, fontSize: 18, color: Colors.primary },
  userInfo:    { flex: 1 },
  userName:    { fontFamily: Fonts.poppinsMedium, fontSize: 15, color: Colors.text },
  userHandle:  { fontFamily: Fonts.jost, fontSize: 13, color: Colors.textMuted },
});
