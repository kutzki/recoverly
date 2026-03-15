import { useRef, useImperativeHandle, forwardRef, useCallback, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
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

export type PanicOverlayHandle = {
  activate: () => void;
};

type Props = {
  onNavigate: () => void;
};

type Phase = 'idle' | 'sliding' | 'navigated' | 'fading';

// Full-screen purple overlay:
//   tap  → slides up from bottom (400ms ease-out) → calls onNavigate → fades out
//   tap during slide → snaps to full-screen instantly → calls onNavigate → fades out
//
// pointerEvents='box-only' while active so nothing beneath can be tapped through it.
export const PanicOverlay = forwardRef<PanicOverlayHandle, Props>(
  function PanicOverlay({ onNavigate }, ref) {
    const { height: windowH } = useWindowDimensions();
    // Extra 200px buffer covers Android nav bar / status bar beyond window height
    const OFFSCREEN = windowH + 200;

    const translateY = useSharedValue(OFFSCREEN);
    const opacity    = useSharedValue(1);
    const phase      = useRef<Phase>('idle');
    const didNav     = useRef(false);

    // Drives pointerEvents — true while sliding/navigating/fading
    const [blocking, setBlocking] = useState(false);

    // ── Reset to fully-hidden, non-interactive state ──────────────────────
    const reset = useCallback(() => {
      phase.current    = 'idle';
      didNav.current   = false;
      translateY.value = OFFSCREEN;
      opacity.value    = 1;
      setBlocking(false);
    }, [translateY, opacity, OFFSCREEN]);

    // ── Navigate then fade the overlay away ──────────────────────────────
    const doNavigate = useCallback(() => {
      if (didNav.current) return;
      didNav.current = true;
      phase.current  = 'navigated';

      // Fire navigation — SOS screen mounts beneath the still-visible overlay
      onNavigate();

      // Brief pause so the SOS screen has a frame to render, then fade out overlay
      setTimeout(() => {
        phase.current = 'fading';
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(reset)();
        });
      }, 80);
    }, [onNavigate, opacity, reset]);

    // ── Public: trigger the animation ────────────────────────────────────
    const activate = useCallback(() => {
      if (phase.current === 'navigated' || phase.current === 'fading') return;

      // Double-tap during slide → snap to top instantly then navigate
      if (phase.current === 'sliding') {
        cancelAnimation(translateY);
        translateY.value = withTiming(0, { duration: 60 }, () => {
          runOnJS(doNavigate)();
        });
        return;
      }

      // idle → slide up from bottom
      phase.current = 'sliding';
      setBlocking(true); // block touches through the overlay immediately

      translateY.value = withTiming(0, {
        duration: 400,
        easing:   Easing.out(Easing.cubic),
      }, () => {
        runOnJS(doNavigate)();
      });
    }, [translateY, doNavigate]);

    useImperativeHandle(ref, () => ({ activate }));

    const animStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
      opacity:   opacity.value,
    }));

    return (
      <Animated.View
        style={[styles.overlay, animStyle]}
        // box-only = overlay intercepts touches while active; none = invisible & passthrough when idle
        pointerEvents={blocking ? 'box-only' : 'none'}
      >
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
