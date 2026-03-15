import { useRef, useImperativeHandle, forwardRef, useCallback, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';

export type PanicOverlayHandle = {
  /** Programmatic tap: slide up from bottom (400ms) then navigate */
  activate: () => void;
  /** Live drag from gesture: moves overlay to follow finger (no animation) */
  drag: (distancePx: number) => void;
  /** Gesture released too early: spring back to offscreen */
  cancelDrag: () => void;
};

type Props = {
  onNavigate: () => void;
};

type Phase = 'idle' | 'sliding' | 'navigated' | 'fading';

export const PanicOverlay = forwardRef<PanicOverlayHandle, Props>(
  function PanicOverlay({ onNavigate }, ref) {
    const { height: windowH } = useWindowDimensions();
    // Extra buffer covers Android nav bar / status bar area
    const OFFSCREEN = windowH + 200;

    const translateY = useSharedValue(OFFSCREEN);
    const opacity    = useSharedValue(1);
    const phase      = useRef<Phase>('idle');
    const didNav     = useRef(false);

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

      onNavigate();

      // Brief pause so the SOS screen has a frame to render, then fade out
      setTimeout(() => {
        phase.current = 'fading';
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(reset)();
        });
      }, 80);
    }, [onNavigate, opacity, reset]);

    // ── Programmatic tap: slide up from bottom ────────────────────────────
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

      phase.current = 'sliding';
      setBlocking(true);

      translateY.value = withTiming(0, {
        duration: 400,
        easing:   Easing.out(Easing.cubic),
      }, () => {
        runOnJS(doNavigate)();
      });
    }, [translateY, doNavigate]);

    // ── Live drag: follow finger position ────────────────────────────────
    const drag = useCallback((distancePx: number) => {
      if (phase.current === 'navigated' || phase.current === 'fading') return;
      if (phase.current === 'idle') {
        phase.current = 'sliding';
        setBlocking(true);
      }
      // translateY=OFFSCREEN is fully hidden; translateY=0 is fully visible
      // As distancePx grows (finger moving up), overlay slides into view
      const next = Math.max(0, OFFSCREEN - distancePx * 2.5);
      translateY.value = next;
    }, [translateY, OFFSCREEN]);

    // ── Cancel drag: spring back to offscreen ─────────────────────────────
    const cancelDrag = useCallback(() => {
      if (phase.current !== 'sliding') return;
      phase.current = 'idle';
      setBlocking(false);
      cancelAnimation(translateY);
      translateY.value = withSpring(OFFSCREEN, {
        damping:   25,
        stiffness: 260,
        mass:      0.8,
      });
    }, [translateY, OFFSCREEN]);

    useImperativeHandle(ref, () => ({ activate, drag, cancelDrag }));

    const animStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
      opacity:   opacity.value,
    }));

    return (
      <Animated.View
        style={[styles.overlay, animStyle]}
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
