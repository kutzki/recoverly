import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

const RESOURCES = [
  { id: 'aa',  label: 'Alcoholics Anonymous',       url: 'https://www.aa.org',      icon: 'people-circle-outline' },
  { id: 'na',  label: 'Narcotics Anonymous',         url: 'https://www.na.org',      icon: 'people-circle-outline' },
  { id: 'aa2', label: 'AA Meeting Finder',           url: 'https://www.aa.org/find-aa',  icon: 'map-outline' },
  { id: 'sam', label: 'SAMHSA Helpline',             url: 'https://www.samhsa.gov',  icon: 'call-outline' },
] as const;

export default function MeetingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 20 }]}>
      <Text style={styles.heading}>Meetings</Text>
      <Text style={styles.subheading}>Find AA/NA meetings and recovery resources near you</Text>

      <View style={styles.tipCard}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
        <Text style={styles.tipText}>
          In-app meeting finder coming soon. Use these trusted resources to find meetings nearby.
        </Text>
      </View>

      <View style={styles.list}>
        {RESOURCES.map((r) => (
          <TouchableOpacity
            key={r.id}
            style={styles.resourceCard}
            activeOpacity={0.8}
            onPress={() => Linking.openURL(r.url)}
          >
            <View style={styles.resourceIcon}>
              <Ionicons name={r.icon as any} size={22} color={Colors.primary} />
            </View>
            <Text style={styles.resourceLabel}>{r.label}</Text>
            <Ionicons name="open-outline" size={18} color={Colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: Colors.white, paddingHorizontal: 24 },
  heading:    { fontFamily: Fonts.poppinsBold, fontSize: 24, color: Colors.text, marginBottom: 6 },
  subheading: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted, marginBottom: 20 },

  tipCard:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: Colors.cardTintPurpleFaint, borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: Colors.primaryLight },
  tipText:  { flex: 1, fontFamily: Fonts.jost, fontSize: 13, color: Colors.text, lineHeight: 20 },

  list: { gap: 12 },
  resourceCard:  { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: Colors.cardTintPurpleFaint, borderRadius: 12, borderWidth: 1, borderColor: Colors.primaryLight },
  resourceIcon:  { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  resourceLabel: { flex: 1, fontFamily: Fonts.poppinsMedium, fontSize: 14, color: Colors.text },
});
