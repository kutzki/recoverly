import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

export default function CompanionScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.emoji}>🤝</Text>
      <Text style={styles.title}>Sober Companion</Text>
      <Text style={styles.sub}>Coming soon — guided support flows and AI chat will live here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontFamily: Fonts.poppinsSemiBold, fontSize: 22, color: Colors.text, marginBottom: 12 },
  sub:   { fontFamily: Fonts.jost, fontSize: 15, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
});
