import { useRef, useImperativeHandle, forwardRef, useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
  cancelAnimation,
  type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';

export type PanicOverlayHandle = {
  /** Tap: slide up from current position (or offscreen) */
  activate: () => void;
  /** Drag committed (threshold passed): snap to top + navigate */
  commitDrag: () => void;
  /** Drag cancelled (released early): spring back down */
  cancelDrag: () => void;
};

type Props = {
  /** Shared value owned by parent — updated directly by gesture worklet */
  translateY: SharedValue<number>;
  offscreen: number;
  onNavigate: () => void;
};

type Phase = 'idle' | 'sliding' | 'navigated' | 'fading';

export const PanicOverlay = forwardRef<PanicOverlayHandle, Props>(
  function PanicOverlay({ translateY, offscreen, onNavigate }, ref) {
    const opacity  = useSharedValue(1);
    const phase    = useRef<Phase>('idle');
    const didNav   = useRef(false);
    const [blocking, setBlocking] = useState(false);

    const reset = useCallback(() => {
      phase.current    = 'idle';
      didNav.current   = false;
      translateY.value = offscreen;
      opacity.value    = 1;
      setBlocking(false);
    }, [translateY, opacity, offscreen]);

    const doNavigate = useCallback(() => {
      if (didNav.current) return;
      didNav.current = true;
      phase.current  = 'navigated';
      onNavigate();
      // Short pause so SOS screen has a frame to mount, then fade overlay away
      setTimeout(() => {
        phase.current = 'fading';
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(reset)();
        });
      }, 80);
    }, [onNavigate, opacity, reset]);

    // Tap: animate from wherever translateY is now → 0
    const activate = useCallback(() => {
      if (phase.current === 'navigated' || phase.current === 'fading') return;

      // Second tap during slide → snap immediately
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

    // Drag committed: snap remaining distance to top
    const commitDrag = useCallback(() => {
      if (phase.current === 'navigated' || phase.current === 'fading') return;
      phase.current = 'sliding';
      setBlocking(true);
      cancelAnimation(translateY);
      translateY.value = withTiming(0, {
        duration: 200,
        easing:   Easing.out(Easing.quad),
      }, () => {
        runOnJS(doNavigate)();
      });
    }, [translateY, doNavigate]);

    // Drag cancelled: spring back offscreen
    const cancelDrag = useCallback(() => {
      if (phase.current === 'navigated' || phase.current === 'fading') return;
      phase.current = 'idle';
      setBlocking(false);
      cancelAnimation(translateY);
      translateY.value = withSpring(offscreen, {
        damping:   25,
        stiffness: 260,
        mass:      0.8,
      });
    }, [translateY, offscreen]);

    useImperativeHandle(ref, () => ({ activate, commitDrag, cancelDrag }));

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
