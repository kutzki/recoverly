import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { cid } = useLocalSearchParams<{ cid: string }>();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Text style={styles.placeholder}>Chat {cid} — coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  placeholder: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.textMuted },
});
