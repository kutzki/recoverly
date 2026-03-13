import { View, StyleSheet } from 'react-native';
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
        />
      ))}
    </View>
  );
}

const DOT = 15;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
  },
  dotFilled: {
    backgroundColor: Colors.primary,
  },
  dotEmpty: {
    backgroundColor: '#E0D0F0',
    borderWidth: 1,
    borderColor: '#D0C0E8',
  },
});
