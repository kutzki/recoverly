import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

export default function SoberPalScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + 20 }]}>
      <Text style={styles.heading}>Sober Pal</Text>
      <Text style={styles.subheading}>Find a recovery partner who shares your journey</Text>

      <View style={styles.card}>
        <Ionicons name="hand-left-outline" size={64} color={Colors.primaryLight} style={{ marginBottom: 12 }} />
        <Text style={styles.cardTitle}>Coming Soon</Text>
        <Text style={styles.cardBody}>
          Sober Pal matching lets you connect with someone at a similar stage in recovery for mutual support.
        </Text>
        <TouchableOpacity style={styles.findBtn} onPress={() => router.push('/(app)/find-users')}>
          <Text style={styles.findText}>Find People Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: Colors.white, paddingHorizontal: 24 },
  heading:    { fontFamily: Fonts.poppinsBold, fontSize: 24, color: Colors.text, marginBottom: 6 },
  subheading: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted, marginBottom: 32 },
  card:       { backgroundColor: Colors.cardTintPurpleFaint, borderRadius: 16, padding: 28, alignItems: 'center', gap: 8 },
  cardTitle:  { fontFamily: Fonts.poppinsBold, fontSize: 20, color: Colors.text },
  cardBody:   { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  findBtn:    { marginTop: 12, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 28 },
  findText:   { fontFamily: Fonts.poppinsSemiBold, fontSize: 15, color: Colors.white },
});
