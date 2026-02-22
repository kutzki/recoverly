import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../../constants/colors';

interface Props {
  days: number;
  maxDays?: number;
  size?: number;
}

export function SobrietyCounter({ days, maxDays = 365, size = 160 }: Props) {
  const SIZE = size;
  const STROKE = Math.round(SIZE * 0.088); // ~14px at 160
  const R = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * R;
  const progress = Math.min(days / maxDays, 1);
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const fontSize = Math.round(SIZE * 0.237); // ~38px at 160
  const unitSize = Math.round(SIZE * 0.088); // ~14px at 160

  return (
    <View style={[styles.container, { width: SIZE, height: SIZE }]}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Defs>
          <LinearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={Colors.primaryLight} />
            <Stop offset="100%" stopColor={Colors.primary} />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={Colors.primaryLight}
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Progress arc */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="url(#arcGrad)"
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={styles.label}>
        <Text style={[styles.number, { fontSize, lineHeight: fontSize + 4 }]}>{days}</Text>
        <Text style={[styles.unit, { fontSize: unitSize }]}>Days</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  svg: { position: 'absolute' },
  label: { alignItems: 'center' },
  number: { fontWeight: '700', color: Colors.text },
  unit: { color: Colors.textMuted, fontWeight: '500' },
});
