import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

type Props = {
  title:      string;
  onPress:    () => void;
  variant?:   Variant;
  size?:      Size;
  loading?:   boolean;
  disabled?:  boolean;
  style?:     ViewStyle;
  textStyle?: TextStyle;
};

export function Button({
  title,
  onPress,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled = false,
  style,
  textStyle,
}: Props) {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[
        styles.base,
        styles[`size_${size}`],
        styles[`variant_${variant}`],
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.white : Colors.primary} />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.5 },

  // Sizes
  size_sm: { paddingVertical: 10, paddingHorizontal: 16 },
  size_md: { paddingVertical: 14, paddingHorizontal: 24 },
  size_lg: { paddingVertical: 17, paddingHorizontal: 32 },

  // Variants
  variant_primary: { backgroundColor: Colors.primary },
  variant_outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary },
  variant_ghost:   { backgroundColor: 'transparent' },
  variant_danger:  { backgroundColor: Colors.error },

  // Text base
  text: { fontFamily: Fonts.poppinsSemiBold },

  // Text sizes
  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 15 },
  textSize_lg: { fontSize: 16 },

  // Text colors by variant
  text_primary: { color: Colors.white },
  text_outline: { color: Colors.primary },
  text_ghost:   { color: Colors.primary },
  text_danger:  { color: Colors.white },
});
