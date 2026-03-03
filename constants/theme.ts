import { Platform } from 'react-native';
import { Colors } from './colors';
import { Fonts, FontSizes } from './fonts';

export const Theme = {
  colors: Colors,
  fonts: Fonts,
  fontSizes: FontSizes,

  spacing: {
    xs:  4,
    sm:  8,
    md:  16,
    lg:  24,
    xl:  32,
    xxl: 48,
  },

  radius: {
    sm:   8,
    md:   12,
    lg:   16,
    xl:   24,
    full: 999,
  },

  /** Minimum touch target — Apple HIG & Material spec: 44 × 44 pt */
  touchTarget: 44,

  /** Standard button heights */
  buttonHeight: {
    sm: 40,
    md: 44,
    lg: 52,
  },

  /** Standard icon sizes */
  iconSize: {
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24,
  },

  /**
   * Header paddingTop — consistent across all screens.
   * Android SafeAreaView already adds insets, so we just need
   * a small breathing gap.
   */
  headerPaddingTop: Platform.OS === 'android' ? 16 : 12,

  /** Standard hitSlop for small icon buttons */
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },

  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 5,
    },
    lg: {
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};
