import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, Mask, Circle, Text as SvgText } from 'react-native-svg';
import { View } from 'react-native';

interface RecoverlyLogoProps {
  /** Size of the flower icon in dp (default 40) */
  size?: number;
  /** Show the "recoverly" wordmark below the icon (default true) */
  showWordmark?: boolean;
}

/**
 * Recoverly brand logo — flower/clover mark + wordmark.
 * Matches the Figma Master File design: blue→pink gradient, 4-petal clover shape.
 */
export function RecoverlyLogo({ size = 40, showWordmark = true }: RecoverlyLogoProps) {
  const wordmarkWidth = size * 2.6;
  const wordmarkFontSize = size * 0.38;
  const gap = size * 0.2;

  return (
    <View style={{ alignItems: 'center', gap }}>
      {/* ── Flower / clover mark ── */}
      <Svg width={size} height={size} viewBox="0 0 40 40">
        <Defs>
          <LinearGradient id="flowerGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#5BB7F5" stopOpacity="1" />
            <Stop offset="0.5" stopColor="#9B6BD4" stopOpacity="1" />
            <Stop offset="1" stopColor="#C864C8" stopOpacity="1" />
          </LinearGradient>
          <Mask id="flowerMask">
            {/* 4 petal circles in a 2×2 grid, tightly overlapping */}
            <Circle cx="12" cy="12" r="11" fill="white" />
            <Circle cx="28" cy="12" r="11" fill="white" />
            <Circle cx="12" cy="28" r="11" fill="white" />
            <Circle cx="28" cy="28" r="11" fill="white" />
          </Mask>
        </Defs>
        {/* Gradient rect clipped through the flower mask */}
        <Rect x="0" y="0" width="40" height="40" fill="url(#flowerGrad)" mask="url(#flowerMask)" />
      </Svg>

      {/* ── Wordmark ── */}
      {showWordmark && (
        <Svg
          width={wordmarkWidth}
          height={wordmarkFontSize + 4}
          viewBox={`0 0 ${wordmarkWidth} ${wordmarkFontSize + 4}`}
        >
          <Defs>
            <LinearGradient id="wordGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#5BB7F5" stopOpacity="1" />
              <Stop offset="0.45" stopColor="#9747FF" stopOpacity="1" />
              <Stop offset="1" stopColor="#C864C8" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <SvgText
            x={wordmarkWidth / 2}
            y={wordmarkFontSize}
            textAnchor="middle"
            fill="url(#wordGrad)"
            fontSize={wordmarkFontSize}
            fontFamily="GeneralSans-Semibold"
            letterSpacing="0.4"
          >
            Recoverly
          </SvgText>
        </Svg>
      )}
    </View>
  );
}
