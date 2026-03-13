import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { supabase } from '../../services/supabase';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

type Incident = { id: string; incident_type: string; actions_completed: string[]; notes: string | null; created_at: string };

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
    <View style={[styles.root, { paddingTop: insets.top + 20 }]}>
      <Text style={styles.heading}>Crisis History</Text>
      <Text style={styles.subheading}>Your past SOS sessions — you got through every one.</Text>

      <FlatList
        data={incidents}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle-outline" size={64} color={Colors.successGreen} />
            <Text style={styles.emptyTitle}>No crises recorded</Text>
            <Text style={styles.emptyBody}>Every day sober is a win. Keep going.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardType}>{item.incident_type.replace(/_/g, ' ')}</Text>
              <Text style={styles.cardDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            {item.notes ? <Text style={styles.cardNotes}>{item.notes}</Text> : null}
            {item.actions_completed.length > 0 && (
              <Text style={styles.cardActions}>
                Actions taken: {item.actions_completed.join(', ')}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: Colors.white, paddingHorizontal: 24 },
  heading:    { fontFamily: Fonts.poppinsBold, fontSize: 24, color: Colors.text, marginBottom: 6 },
  subheading: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted, marginBottom: 20 },

  list:     { gap: 12, paddingBottom: 40 },
  empty:    { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle:{ fontFamily: Fonts.poppinsSemiBold, fontSize: 18, color: Colors.text },
  emptyBody: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted, textAlign: 'center' },

  card:       { backgroundColor: Colors.cardTintPurpleFaint, borderRadius: 12, padding: 14, gap: 6, borderWidth: 1, borderColor: Colors.primaryLight },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardType:   { fontFamily: Fonts.poppinsSemiBold, fontSize: 14, color: Colors.text, textTransform: 'capitalize' },
  cardDate:   { fontFamily: Fonts.jost, fontSize: 12, color: Colors.textMuted },
  cardNotes:  { fontFamily: Fonts.jost, fontSize: 13, color: Colors.text, lineHeight: 20 },
  cardActions:{ fontFamily: Fonts.jost, fontSize: 12, color: Colors.textMuted },
});
