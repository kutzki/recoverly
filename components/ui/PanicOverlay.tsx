import { useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';

const SCREEN_H = Dimensions.get('window').height;

export type PanicOverlayHandle = {
  activate: () => void;
};

type Props = {
  onNavigate: () => void;
};

type Phase = 'idle' | 'sliding' | 'visible' | 'fading';

// Full-screen purple overlay that:
//   1. Slides up from bottom (380ms ease-out)  → calls onNavigate
//   2. Fades out (280ms) while SOS screen renders beneath it
// Double-tap during slide: skips to full-screen instantly, then navigates
export const PanicOverlay = forwardRef<PanicOverlayHandle, Props>(
  function PanicOverlay({ onNavigate }, ref) {
    const translateY = useSharedValue(SCREEN_H);
    const opacity    = useSharedValue(1);
    const phase      = useRef<Phase>('idle');
    const didNav     = useRef(false);

    // ── reset to hidden state ─────────────────────────────────────────────
    const reset = useCallback(() => {
      cancelAnimation(translateY);
      cancelAnimation(opacity);
      translateY.value = SCREEN_H;
      opacity.value    = 1;
      phase.current    = 'idle';
      didNav.current   = false;
    }, [translateY, opacity]);

    // ── navigate + fade out the overlay ──────────────────────────────────
    const doNavigate = useCallback(() => {
      if (didNav.current) return;
      didNav.current = true;
      phase.current  = 'fading';
      onNavigate();
      // Small delay so the SOS screen has a frame to mount before we fade
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 280 }, () => {
          runOnJS(reset)();
        });
      }, 80);
    }, [onNavigate, opacity, reset]);

    // ── public: trigger the panic animation ──────────────────────────────
    const activate = useCallback(() => {
      // Already navigating/fading — ignore extra taps
      if (phase.current === 'fading' || phase.current === 'visible') return;

      if (phase.current === 'sliding') {
        // Double-tap: jump overlay to full-screen immediately, then navigate
        cancelAnimation(translateY);
        translateY.value = withTiming(0, { duration: 60 }, () => {
          runOnJS(doNavigate)();
        });
        return;
      }

      // idle → slide up
      phase.current    = 'sliding';
      translateY.value = withTiming(0, {
        duration: 380,
        easing:   Easing.out(Easing.cubic),
      }, () => {
        phase.current = 'visible';
        runOnJS(doNavigate)();
      });
    }, [translateY, doNavigate]);

    useImperativeHandle(ref, () => ({ activate }));

    const animStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
      opacity:   opacity.value,
    }));

    return (
      <Animated.View style={[styles.overlay, animStyle]} pointerEvents="none">
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primaryMid]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    );
  },
);

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top:      0,
    left:     0,
    right:    0,
    bottom:   0,
    zIndex:   9999,
  },
});
