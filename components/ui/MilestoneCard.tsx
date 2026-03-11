import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

interface Props {
  label: string;
  subtitle: string;
  date: string;
  icon?: keyof typeof Ionicons.glyphMap;
  // Support both old prop name (achieved) and new (unlocked)
  achieved?: boolean;
  unlocked?: boolean;
  color?: 'grey' | 'purple' | 'cyan';
  variant?: 'grey' | 'purple' | 'cyan';
  isHighlighted?: boolean;
}

const BG_MAP = {
  grey: Colors.milestoneGrey,
  purple: Colors.primary,
  cyan: Colors.success,
};
const TEXT_MAP = {
  grey: Colors.textMuted,
  purple: Colors.white,
  cyan: Colors.text,
};

export function MilestoneCard({
  label,
  subtitle,
  date,
  icon = 'medal',
  achieved,
  unlocked,
  color,
  variant,
  isHighlighted,
}: Props) {
  const resolvedVariant = variant || color || 'grey';
  const isUnlocked = unlocked ?? achieved ?? false;
  const bg = isUnlocked ? BG_MAP[resolvedVariant] : Colors.milestoneGrey;
  const textColor = isUnlocked ? TEXT_MAP[resolvedVariant] : Colors.textLight;

  return (
    <View style={[styles.card, { backgroundColor: bg }, isHighlighted && styles.highlighted]}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={20} color={textColor} />
        </View>
        <View style={styles.textCol}>
          <Text style={[styles.subtitle, { color: textColor }]} numberOfLines={2}>{subtitle}</Text>
          <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>{label}</Text>
        </View>
        <Text style={[styles.date, { color: textColor }]}>{date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  highlighted: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1 },
  subtitle: { fontSize: 13, fontFamily: Fonts.poppinsBold, marginBottom: 1 },
  label: { fontSize: 12, fontFamily: Fonts.jost, opacity: 0.8 },
  date: { fontSize: 12, fontFamily: Fonts.poppinsSemiBold, opacity: 0.8 },
});
