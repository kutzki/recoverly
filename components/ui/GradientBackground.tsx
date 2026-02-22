import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'splash' | 'card';
}

export function GradientBackground({ children, style, variant = 'default' }: Props) {
  const gradients = {
    default: [Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd] as const,
    splash: [Colors.gradientStart, '#FFE6F8', Colors.gradientEnd] as const,
    card: [Colors.primaryLight, Colors.white] as const,
  };

  return (
    <LinearGradient
      colors={gradients[variant]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, style]}
    >
      {children}
    </LinearGradient>
  );
}
