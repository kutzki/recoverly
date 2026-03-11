import React, { useMemo } from 'react';
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
const STROKE = 13; // arc stroke width — constant, not per-render

export const SobrietyCounter = React.memo(function SobrietyCounter({ days, goal = 90 }: Props) {
  const { width: screenWidth } = useWindowDimensions();

  const { W, H, cx, trackPath, purplePath, bluePath, numFontSize, lblFontSize, numBaseY, lblBaseY } =
    useMemo(() => {
      const p      = Math.min(days / goal, 1);
      const _W     = screenWidth - 40;
      const PAD    = STROKE / 2 + 8;
      const r      = _W / 2 - PAD;
      const _cx    = _W / 2;
      const _cy    = r + STROKE / 2 + 8;
      const _H     = _cy + STROKE / 2 + 8;

      const progX = _cx - r * Math.cos(p * Math.PI);
      const progY = _cy - r * Math.sin(p * Math.PI);

      const _trackPath  = `M ${PAD} ${_cy} A ${r} ${r} 0 0 1 ${_W - PAD} ${_cy}`;
      const _purplePath = p > 0.001 ? `M ${PAD} ${_cy} A ${r} ${r} 0 0 1 ${progX} ${progY}` : null;
      const _bluePath   = p < 0.999 ? `M ${progX} ${progY} A ${r} ${r} 0 0 1 ${_W - PAD} ${_cy}` : null;

      const _numFontSize = Math.round(r * 0.42);
      const _lblFontSize = Math.round(r * 0.18);
      const midY         = (_cy - r + _cy) / 2;
      const _numBaseY    = midY + _numFontSize * 0.36;
      const _lblBaseY    = _numBaseY + _numFontSize * 0.65 + 4;

      return {
        W: _W, H: _H, cx: _cx,
        trackPath: _trackPath, purplePath: _purplePath, bluePath: _bluePath,
        numFontSize: _numFontSize, lblFontSize: _lblFontSize,
        numBaseY: _numBaseY, lblBaseY: _lblBaseY,
      };
    }, [days, goal, screenWidth]);

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
          fontFamily={Fonts.poppinsBold}
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
          fontFamily={Fonts.jost}
          fill={Colors.textMuted}
        >
          Days Sober
        </SvgText>
      </Svg>
    </View>
  );
});
