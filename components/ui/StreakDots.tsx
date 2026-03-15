import { View, Text, StyleSheet } from 'react-native';
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
          {done && <Text style={styles.check}>✓</Text>}
        </View>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotFilled: {
    backgroundColor: Colors.primary,
  },
  dotEmpty: {
    backgroundColor: 'rgba(183,64,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(183,64,255,0.25)',
  },
  check: {
    color: '#fff',
    fontSize: 9,
    lineHeight: 11,
  },
});
