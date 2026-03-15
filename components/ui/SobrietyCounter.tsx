import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

type Props = {
  daysSober: number;
  size?: number;
};

// Draws a semicircular arc (top half of a circle)
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polarToCartesian(cx, cy, r, startDeg);
  const e = polarToCartesian(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export function SobrietyCounter({ daysSober, size = 230 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r  = size * 0.38;
  const strokeWidth = size * 0.055;

  // Arc spans 210° (from -105° to +105° — slightly more than a semicircle)
  const startAngle = -210;
  const endAngle   = 30;
  const progress   = Math.min(daysSober / 365, 1);
  const fillAngle  = startAngle + (endAngle - startAngle) * progress;

  return (
    <View style={{ width: size, height: size * 0.65, alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', top: 0 }}>
        <Defs>
          <SvgGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={Colors.arcGradStart} />
            <Stop offset="1" stopColor={Colors.arcGradEnd} />
          </SvgGradient>
        </Defs>

        {/* Track */}
        <Path
          d={arcPath(cx, cy, r, startAngle, endAngle)}
          stroke={Colors.arcBlue}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />

        {/* Fill */}
        {daysSober > 0 && (
          <Path
            d={arcPath(cx, cy, r, startAngle, fillAngle)}
            stroke="url(#arcGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        )}
      </Svg>

      {/* Centre text */}
      <View style={[styles.center, { top: size * 0.24 }]}>
        <Text style={styles.days}>{daysSober}</Text>
        <Text style={styles.label}>days sober</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  days: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 35,
    color: Colors.text,
    lineHeight: 40,
  },
  label: {
    fontFamily: Fonts.poppins,
    fontSize: 20,
    color: Colors.text,
  },
});
