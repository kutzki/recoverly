import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';

export default function CallScreen() {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={[Colors.primaryDark, Colors.primaryMid]}
      style={[styles.root, { paddingTop: insets.top }]}
    >
      <TouchableOpacity style={styles.back} onPress={() => router.back()} hitSlop={12}>
        <Ionicons name="arrow-back" size={24} color={Colors.white} />
      </TouchableOpacity>
      <View style={styles.center}>
        <Ionicons name="videocam-off-outline" size={64} color="rgba(255,255,255,0.6)" />
        <Text style={styles.title}>Video Calling</Text>
        <Text style={styles.body}>Coming soon. Video calling will let you connect face-to-face with your support network.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  back:   { margin: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 16, marginTop: -60 },
  title:  { fontFamily: Fonts.poppinsBold, fontSize: 24, color: Colors.white },
  body:   { fontFamily: Fonts.jost, fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 24 },
});
