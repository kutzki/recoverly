import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface Props {
  streak: boolean[];
}

export function StreakDots({ streak }: Props) {
  return (
    <View style={styles.row}>
      {streak.map((done, i) => (
        <View key={i} style={[styles.dot, done ? styles.done : styles.empty]}>
          {done && <Ionicons name="checkmark" size={11} color={Colors.white} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, marginTop: 6 },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  done: { backgroundColor: Colors.primary },
  empty: { backgroundColor: Colors.border },
});
