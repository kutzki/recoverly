import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

const MILESTONES = [
  { days: 7,   label: '7 Days',    emoji: '⭐', color: Colors.milestonePurple },
  { days: 30,  label: '30 Days',   emoji: '🔥', color: Colors.milestoneCyan  },
  { days: 60,  label: '60 Days',   emoji: '💪', color: Colors.milestonePurple },
  { days: 90,  label: '90 Days',   emoji: '🏅', color: Colors.milestoneCyan  },
  { days: 180, label: '6 Months',  emoji: '🌟', color: Colors.milestonePurple },
  { days: 365, label: '1 Year',    emoji: '🏆', color: Colors.milestoneCyan  },
];

type Props = {
  daysSober: number;
};

export function MilestoneCard({ daysSober }: Props) {
  return (
    <View style={styles.row}>
      {MILESTONES.map((m) => {
        const achieved = daysSober >= m.days;
        return (
          <View key={m.days} style={[styles.badge, achieved ? { backgroundColor: m.color } : styles.badgeEmpty]}>
            <Text style={styles.emoji}>{m.emoji}</Text>
            <Text style={[styles.label, achieved ? styles.labelAchieved : styles.labelEmpty]}>
              {m.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    width: 70,
    height: 70,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  badgeEmpty: {
    backgroundColor: Colors.milestoneGrey,
  },
  emoji: { fontSize: 22 },
  label: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 9,
    textAlign: 'center',
  },
  labelAchieved: { color: Colors.white },
  labelEmpty:    { color: Colors.textMuted },
});
