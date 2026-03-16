import { useRef, useCallback, useEffect } from 'react';
import { Tabs, router, usePathname } from 'expo-router';
import {
  View, Text, StyleSheet, TouchableOpacity, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS, type SharedValue } from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { PanicOverlay, type PanicOverlayHandle } from '../../components/ui/PanicOverlay';

// ── Tab definitions ───────────────────────────────────────────────────────────

const LEFT_TABS = [
  { name: 'home',    icon: 'home-outline',  activeIcon: 'home'   as const },
  { name: 'apps',    icon: 'grid-outline',  activeIcon: 'grid'   as const },
];
const RIGHT_TABS = [
  { name: 'journal', icon: 'heart-outline', activeIcon: 'heart'  as const },
  { name: 'profile', icon: 'person-outline',activeIcon: 'person' as const },
];

// ── Custom bottom tab bar ────────────────────────────────────────────────────

type TabBarProps = BottomTabBarProps & {
  onPanic:         () => void;
  onPanicCommit:   () => void;
  onPanicCancel:   () => void;
  panicTranslateY: SharedValue<number>;
  offscreen:       number;
  canPanic:        SharedValue<number>;
};

function CustomTabBar({
  state, navigation,
  onPanic, onPanicCommit, onPanicCancel,
  panicTranslateY, offscreen, canPanic,
}: TabBarProps) {
  const insets = useSafeAreaInsets();

  const renderTab = (item: { name: string; icon: string; activeIcon: string }) => {
    const routeIndex = state.routes.findIndex((r) => r.name === item.name);
    const isActive   = state.index === routeIndex;
    return (
      <TouchableOpacity
        key={item.name}
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => navigation.navigate(item.name)}
      >
        <Ionicons
          name={(isActive ? item.activeIcon : item.icon) as any}
          size={24}
          color={isActive ? Colors.navIconActive : Colors.navIcon}
        />
      </TouchableOpacity>
    );
  };

  // Pan: finger drags upward → overlay follows in real-time (pure worklet, no JS hop)
  const panGesture = Gesture.Pan()
    .minDistance(8)
    .onUpdate((e) => {
      'worklet';
      if (canPanic.value === 0) return;
      if (e.translationY < 0) {
        panicTranslateY.value = Math.max(0, offscreen - Math.abs(e.translationY) * 2.5);
      }
    })
    .onEnd((e) => {
      'worklet';
      if (canPanic.value === 0) return;
      if (e.translationY < -80 || e.velocityY < -400) {
        runOnJS(onPanicCommit)();
      } else {
        runOnJS(onPanicCancel)();
      }
    });

  // Tap: immediate slide-up animation
  const tapGesture = Gesture.Tap()
    .maxDuration(500)
    .onEnd(() => {
      'worklet';
      if (canPanic.value === 0) return;
      runOnJS(onPanic)();
    });

  const panicGesture = Gesture.Exclusive(panGesture, tapGesture);

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {LEFT_TABS.map(renderTab)}

      {/* Panic Button — center, raised above bar */}
      <GestureDetector gesture={panicGesture}>
        <View style={styles.panicWrapper}>
          <LinearGradient
            colors={[Colors.primaryDark, Colors.primaryMid]}
            style={styles.panicGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <Text style={styles.panicBang}>!</Text>
          </LinearGradient>
          <Text style={styles.panicLabel}>{'Panic\nButton'}</Text>
        </View>
      </GestureDetector>

      {RIGHT_TABS.map(renderTab)}
    </View>
  );
}

// ── Layout ───────────────────────────────────────────────────────────────────

export default function AppLayout() {
  const { height: windowH } = useWindowDimensions();
  const OFFSCREEN = windowH + 200;

  const overlayRef      = useRef<PanicOverlayHandle>(null);
  const sosOpenRef      = useRef(false);
  const pathname        = usePathname();

  // Shared values owned here — gesture worklet updates them directly
  const panicTranslateY = useSharedValue(OFFSCREEN);
  const canPanic        = useSharedValue(1); // 1=allowed, 0=blocked (on SOS)

  // Keep canPanic in sync with route; also reset sosOpenRef on leaving SOS
  useEffect(() => {
    const onSOS = pathname.includes('/sos');
    canPanic.value    = onSOS ? 0 : 1;
    sosOpenRef.current = onSOS;
  }, [pathname, canPanic]);

  const handleNavigateToSOS = useCallback(() => {
    sosOpenRef.current = true;
    canPanic.value     = 0;
    router.replace('/(app)/sos');
  }, [canPanic]);

  // Tap → slide-up animation then navigate
  const handlePanic = useCallback(() => {
    if (sosOpenRef.current) return;
    overlayRef.current?.activate();
  }, []);

  // Drag past threshold → snap to top + navigate
  const handlePanicCommit = useCallback(() => {
    if (sosOpenRef.current) return;
    overlayRef.current?.commitDrag();
  }, []);

  // Drag released too early → spring back
  const handlePanicCancel = useCallback(() => {
    overlayRef.current?.cancelDrag();
  }, []);

  return (
    <View style={styles.root}>
      <Tabs
        tabBar={(props) => (
          <CustomTabBar
            {...props}
            onPanic={handlePanic}
            onPanicCommit={handlePanicCommit}
            onPanicCancel={handlePanicCancel}
            panicTranslateY={panicTranslateY}
            offscreen={OFFSCREEN}
            canPanic={canPanic}
          />
        )}
        screenOptions={{ headerShown: false }}
      >
        {/* Visible tabs */}
        <Tabs.Screen name="home"    />
        <Tabs.Screen name="apps"    />
        <Tabs.Screen name="journal" />
        <Tabs.Screen name="profile" />

        {/* Hidden screens */}
        <Tabs.Screen name="favorites"      options={{ href: null }} />
        <Tabs.Screen name="tracker"        options={{ href: null }} />
        <Tabs.Screen name="goals"          options={{ href: null }} />
        <Tabs.Screen name="edit-profile"   options={{ href: null }} />
        <Tabs.Screen name="messages"       options={{ href: null }} />
        <Tabs.Screen name="find-users"     options={{ href: null }} />
        <Tabs.Screen name="sober-pal"      options={{ href: null }} />
        <Tabs.Screen name="sponsor"        options={{ href: null }} />
        <Tabs.Screen name="inner-circle"   options={{ href: null }} />
        <Tabs.Screen name="meetings"       options={{ href: null }} />
        <Tabs.Screen name="resource-hub"   options={{ href: null }} />
        <Tabs.Screen name="crisis-history" options={{ href: null }} />
        <Tabs.Screen name="settings"       options={{ href: null }} />
        <Tabs.Screen name="sos"            options={{ href: null }} />
        <Tabs.Screen name="chat"           options={{ href: null }} />
        <Tabs.Screen name="user"           options={{ href: null }} />
        <Tabs.Screen name="call"           options={{ href: null }} />
        <Tabs.Screen name="companion"      options={{ href: null }} />
      </Tabs>

      {/* Full-screen panic overlay — slides over everything including tab bar */}
      <PanicOverlay
        ref={overlayRef}
        translateY={panicTranslateY}
        offscreen={OFFSCREEN}
        onNavigate={handleNavigateToSOS}
      />
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  bar: {
    flexDirection:   'row',
    backgroundColor: Colors.navBackground,
    borderTopWidth:  1,
    borderTopColor:  Colors.navBorder,
    alignItems:      'center',
    paddingTop:      8,
    shadowColor:     '#000000',
    shadowOffset:    { width: 10, height: -10 },
    shadowOpacity:   0.098,
    shadowRadius:    54,
    elevation:       20,
  },
  tabItem: {
    flex:          1,
    alignItems:    'center',
    paddingBottom: 4,
  },

  // Panic Button — pill raised above tab bar (no triangle)
  panicWrapper: {
    flex:       1,
    alignItems: 'center',
    marginTop:  -22,
  },
  panicGradient: {
    width:        125,
    height:       34,
    borderRadius: 4,
    alignItems:   'center',
    justifyContent: 'center',
  },
  panicBang: {
    color:      Colors.white,
    fontSize:   16,
    fontFamily: Fonts.poppinsBold,
  },
  panicLabel: {
    fontFamily: Fonts.poppins,
    fontSize:   10,
    color:      '#9d9d9d',
    textAlign:  'center',
    marginTop:  4,
    lineHeight: 13,
  },
});
