import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';

type Profile = { id: string; name: string | null; username: string | null; bio: string | null; avatar_url: string | null; location: string | null };

export default function UserProfileScreen() {
  const insets   = useSafeAreaInsets();
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const { data: profile } = useQuery<Profile | null>({
    queryKey: ['user-profile', userId],
    enabled:  !!userId,
    queryFn:  async () => {
      const { data } = await supabase.from('profiles').select('id, name, username, bio, avatar_url, location').eq('id', userId).single();
      return data;
    },
  });

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {profile ? (
        <View style={styles.content}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{(profile.name ?? profile.username ?? '?')[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.displayName}>{profile.name ?? 'Unknown'}</Text>
          <Text style={styles.username}>@{profile.username ?? '—'}</Text>
          {profile.location && <Text style={styles.location}>{profile.location}</Text>}
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.loading}>Loading…</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: Colors.white },
  header:        { paddingHorizontal: 24, marginBottom: 24 },
  content:       { alignItems: 'center', paddingHorizontal: 24, gap: 8 },
  avatarCircle:  { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avatarInitial: { fontFamily: Fonts.poppinsBold, fontSize: 32, color: Colors.primary },
  displayName:   { fontFamily: Fonts.poppinsBold, fontSize: 22, color: Colors.text },
  username:      { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted },
  location:      { fontFamily: Fonts.jost, fontSize: 13, color: Colors.textMuted },
  bio:           { fontFamily: Fonts.jost, fontSize: 14, color: Colors.text, textAlign: 'center', lineHeight: 22, marginTop: 8 },
  loading:       { fontFamily: Fonts.jost, fontSize: 16, color: Colors.textMuted },
});
