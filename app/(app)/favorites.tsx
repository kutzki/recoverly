import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + 20 }]}>
      <Text style={styles.heading}>Saved</Text>
      <View style={styles.empty}>
        <Ionicons name="heart-outline" size={64} color={Colors.primaryLight} />
        <Text style={styles.emptyTitle}>Nothing saved yet</Text>
        <Text style={styles.emptyBody}>Meetings, articles, and resources you save will appear here.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: Colors.white, paddingHorizontal: 24 },
  heading:    { fontFamily: Fonts.poppinsBold, fontSize: 24, color: Colors.text, marginBottom: 24 },
  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 24 },
  emptyTitle: { fontFamily: Fonts.poppinsSemiBold, fontSize: 18, color: Colors.text },
  emptyBody:  { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
});
