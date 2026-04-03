import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

type Props = {
  daysSober: number;
  size?: number;
};

export function SobrietyCounter({ daysSober, size = 250 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  // Reduce r slightly to avoid stroke clipping
  const r = (size / 2) * 0.85;
  const strokeWidth = size * 0.055;
  const circumference = 2 * Math.PI * r;
  
  // Progress ratio (cap the fill at 365 days visually, minimum 0.02 visual blip if 0 just so it looks alive, or just 0)
  // Let's use 0% if 0. If they have at least 1 day, cap max to 1.
  const progress = daysSober === 0 ? 0 : Math.min(daysSober / 30, 1); 
  // We use 30 as a default visual 'max' for the ring so it fills nicely throughout their first month.
  
  const strokeDashoffset = circumference - (circumference * progress);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <SvgGradient id="arcGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={Colors.arcGradStart || "#B575F6"} />
            <Stop offset="1" stopColor={Colors.primary || "#9F54F2"} />
          </SvgGradient>
        </Defs>

        {/* Track (The empty background ring) */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={Colors.arcTrack || "#F3E8FF"}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Fill (The active progress ring) */}
        {daysSober > 0 && (
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke="url(#arcGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            rotation="-90"
            originX={cx}
            originY={cy}
          />
        )}
      </Svg>

      {/* Centre text */}
      <View style={styles.center}>
        <Text style={styles.days}>{daysSober}</Text>
        <Text style={styles.label}>Days</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8, // slight tweak to visually center the text against the ring
  },
  days: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 52,
    color: Colors.text,
    lineHeight: 60,
  },
  label: {
    fontFamily: Fonts.poppins,
    fontSize: 22,
    color: Colors.text,
    textTransform: 'capitalize',
  },
});
