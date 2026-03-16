import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { supabase } from '../../services/supabase';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

type Incident = { id: string; incident_type: string; actions_completed: string[]; notes: string | null; created_at: string };

function formatIncidentType(t: string): string {
  return t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const INCIDENT_COLORS: Record<string, string> = {
  bad_day:         Colors.sosOrange,
  feel_like_using: Colors.sosRed,
  just_relapsed:   Colors.sosDark,
  self_harm:       Colors.sosRedBright,
  feeling_anxious: Colors.sosPurple,
};

export default function CrisisHistoryScreen() {
  const insets = useSafeAreaInsets();
  const user   = useAuthStore((s) => s.user);

  const { data: incidents = [] } = useQuery<Incident[]>({
    queryKey: ['crisis-history', user?.id],
    enabled:  !!user?.id,
    queryFn:  async () => {
      const { data, error } = await supabase
        .from('crisis_incidents')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primaryMid]}
        style={styles.headerGrad}
      >
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 24 }}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Crisis History</Text>
            <View style={{ width: 24 }} />
          </View>
          <Text style={styles.headerSub}>Your past SOS sessions — you got through every one.</Text>
        </View>
      </LinearGradient>

      <FlatList
        data={incidents}
        keyExtractor={(i) => i.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle-outline" size={64} color={Colors.successGreen} />
            <Text style={styles.emptyTitle}>No crises recorded</Text>
            <Text style={styles.emptyBody}>Every day sober is a win. Keep going.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { borderLeftColor: INCIDENT_COLORS[item.incident_type] ?? Colors.primary }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardType}>{formatIncidentType(item.incident_type)}</Text>
              <Text style={styles.cardDate}>
                {new Date(item.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            {item.notes ? <Text style={styles.cardNotes}>{item.notes}</Text> : null}
            {item.actions_completed.length > 0 && (
              <View style={styles.pillRow}>
                {item.actions_completed.map((action) => (
                  <View key={action} style={styles.pill}>
                    <Text style={styles.pillText}>{formatIncidentType(action)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: Colors.white },

  headerGrad: { width: '100%' },
  headerRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerTitle:{ fontFamily: Fonts.poppinsBold, fontSize: 18, color: Colors.white, flex: 1, marginLeft: 8 },
  headerSub:  { fontFamily: Fonts.jost, fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },

  list:       { gap: 12, paddingTop: 24, paddingHorizontal: 24 },
  empty:      { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontFamily: Fonts.poppinsSemiBold, fontSize: 18, color: Colors.text },
  emptyBody:  { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted, textAlign: 'center' },

  card: {
    backgroundColor: Colors.cardTintPurpleFaint,
    borderRadius:    12,
    padding:         14,
    gap:             6,
    borderWidth:     1,
    borderColor:     Colors.primaryLight,
    borderLeftWidth: 4,
  },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardType:    { fontFamily: Fonts.poppinsSemiBold, fontSize: 14, color: Colors.text },
  cardDate:    { fontFamily: Fonts.jost, fontSize: 12, color: Colors.textMuted },
  cardNotes:   { fontFamily: Fonts.jost, fontSize: 13, color: Colors.text, lineHeight: 20 },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  pill:    { backgroundColor: Colors.primaryLight, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  pillText:{ fontFamily: Fonts.jost, fontSize: 11, color: Colors.primary },
});
