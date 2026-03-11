/**
 * Call screen — temporarily disabled.
 *
 * @stream-io/video-react-native-sdk depends on @stream-io/react-native-webrtc,
 * which is a legacy ReactPackage (no TurboModule / codegenConfig). Its
 * createNativeModules() eagerly loads libwebrtc.so at Android startup, blocking
 * the main thread for ~5 s and causing an ANR. The SDK has been removed from the
 * build until a lazy-loadable alternative is available.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';

export default function CallScreen() {
  return (
    <View style={styles.screen}>
      <Ionicons name="videocam-off-outline" size={56} color={Colors.primaryLight} />
      <Text style={styles.title}>Video Calling Coming Soon</Text>
      <Text style={styles.subtitle}>
        This feature is temporarily unavailable while we improve performance.
      </Text>
      <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
        <Text style={styles.btnText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.poppinsBold,
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.jost,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  btn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  btnText: {
    color: '#fff',
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 15,
  },
});
