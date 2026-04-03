import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

type Props = {
  streak: boolean[]; // length 7, index 0 = Monday
};

export function StreakDots({ streak }: Props) {
  return (
    <View style={styles.row}>
      {streak.map((done, i) => (
        <View
          key={i}
          style={[styles.dot, done ? styles.dotFilled : styles.dotEmpty]}
        >
          {done && <Ionicons name="checkmark-sharp" size={14} color={Colors.white} />}
        </View>
      ))}
    </View>
  );
}

const DOT = 20;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotFilled: {
    backgroundColor: Colors.primary,
  },
  dotEmpty: {
    backgroundColor: Colors.white,
  },
});
