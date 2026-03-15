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

export function SobrietyCounter({ daysSober, size = 220 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r  = size * 0.40;
  const strokeWidth = size * 0.055;

  // Horseshoe arc opens at bottom — left (−90°) clockwise over top to right (90°)
  const startAngle = -90;
  const endAngle   = 90;
  const progress   = Math.min(daysSober / 365, 1);
  const fillAngle  = startAngle + (endAngle - startAngle) * progress;

  // Container only shows upper half of SVG (arc never goes below cy)
  const containerH = Math.round(cy + strokeWidth / 2 + 6);

  return (
    <View style={{ width: size, height: containerH, alignItems: 'center' }}>
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

      {/* Centre text — vertically centred in the visible arc space */}
      <View style={[styles.center, { top: size * 0.17 }]}>
        <Text style={styles.days}>{daysSober}</Text>
        <Text style={styles.label}>Days Sober</Text>
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
    fontSize: 16,
    color: Colors.text,
  },
});
