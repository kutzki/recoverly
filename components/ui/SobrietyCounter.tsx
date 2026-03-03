import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Text as SvgText } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

interface Props {
  days: number;
  /** Sobriety goal in days (default 90). Progress arc fills to this target. */
  goal?: number;
}

/**
 * Semicircular ∩ progress arc.
 *
 * The purple arc fills from the left endpoint clockwise based on days/goal.
 * At goal completion (p=1) the arc is fully purple.
 *
 * Progress endpoint maths (circle centre cx,cy, radius r):
 *   progressX = cx - r · cos(p · π)
 *   progressY = cy - r · sin(p · π)
 */
export function SobrietyCounter({ days, goal = 90 }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const p = Math.min(days / goal, 1);   // progress 0 → 1

  const W      = screenWidth - 40;      // content width (20 px padding each side)
  const STROKE = 13;
  const PAD    = STROKE / 2 + 8;
  const r      = W / 2 - PAD;
  const cx     = W / 2;
  const cy     = r + STROKE / 2 + 8;
  const H      = cy + STROKE / 2 + 8;

  // Progress endpoint on the arc
  const progX = cx - r * Math.cos(p * Math.PI);
  const progY = cy - r * Math.sin(p * Math.PI);

  // Paths (large-arc-flag always 0: each segment ≤ 180°)
  const trackPath  = `M ${PAD} ${cy} A ${r} ${r} 0 0 1 ${W - PAD} ${cy}`;
  const purplePath = p > 0.001
    ? `M ${PAD} ${cy} A ${r} ${r} 0 0 1 ${progX} ${progY}`
    : null;
  const bluePath   = p < 0.999
    ? `M ${progX} ${progY} A ${r} ${r} 0 0 1 ${W - PAD} ${cy}`
    : null;

  const numFontSize = Math.round(r * 0.42);
  const lblFontSize = Math.round(r * 0.18);

  const midY     = (cy - r + cy) / 2;
  const numBaseY = midY + numFontSize * 0.36;
  const lblBaseY = numBaseY + numFontSize * 0.65 + 4;

  return (
    <View>
      <Svg width={W} height={H}>
        <Defs>
          <SvgGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0"   stopColor={Colors.arcGradStart} />
            <Stop offset="1"   stopColor={Colors.arcGradEnd} />
          </SvgGradient>
        </Defs>

        {/* faint background track */}
        <Path
          d={trackPath}
          stroke={Colors.arcTrack}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
        />

        {/* remaining (blue) arc */}
        {bluePath && (
          <Path
            d={bluePath}
            stroke={Colors.arcBlue}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* progress (purple) arc */}
        {purplePath && (
          <Path
            d={purplePath}
            stroke="url(#purpleGrad)"
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* day count */}
        <SvgText
          x={cx}
          y={numBaseY}
          textAnchor="middle"
          fontSize={numFontSize}
          fontFamily={Fonts.generalSansBold}
          fill={Colors.text}
        >
          {days}
        </SvgText>

        {/* "Days" label */}
        <SvgText
          x={cx}
          y={lblBaseY}
          textAnchor="middle"
          fontSize={lblFontSize}
          fontFamily={Fonts.generalSans}
          fill={Colors.textMuted}
        >
          Days
        </SvgText>
      </Svg>
    </View>
  );
}
