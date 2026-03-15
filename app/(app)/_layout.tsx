import { useRef, useCallback } from 'react';
import { Tabs, router, usePathname } from 'expo-router';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { PanicOverlay, type PanicOverlayHandle } from '../../components/ui/PanicOverlay';

// ── Tab definitions (4 real tabs + panic button in center) ───────────────────

const LEFT_TABS = [
  { name: 'home',    icon: 'home-outline',   activeIcon: 'home'   as const },
  { name: 'apps',    icon: 'grid-outline',   activeIcon: 'grid'   as const },
];
const RIGHT_TABS = [
  { name: 'journal', icon: 'heart-outline',  activeIcon: 'heart'  as const },
  { name: 'profile', icon: 'person-outline', activeIcon: 'person' as const },
];

// ── Custom bottom tab bar ────────────────────────────────────────────────────

type TabBarProps = BottomTabBarProps & { onPanic: () => void };

function CustomTabBar({ state, navigation, onPanic }: TabBarProps) {
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

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {LEFT_TABS.map(renderTab)}

      {/* Panic Button — center badge with downward chevron tip */}
      <TouchableOpacity
        style={styles.panicWrapper}
        activeOpacity={0.85}
        onPress={onPanic}
      >
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primaryMid]}
          style={styles.panicGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Text style={styles.panicBang}>!</Text>
        </LinearGradient>
        <View style={styles.panicTip} />
        <Text style={styles.panicLabel}>{'Panic\nButton'}</Text>
      </TouchableOpacity>

      {RIGHT_TABS.map(renderTab)}
    </View>
  );
}

// ── Layout ───────────────────────────────────────────────────────────────────

export default function AppLayout() {
  const overlayRef = useRef<PanicOverlayHandle>(null);
  const pathname   = usePathname();

  // replace (not push) so SOS never stacks on top of itself in the history
  const handleNavigateToSOS = useCallback(() => {
    router.replace('/(app)/sos');
  }, []);

  const handlePanic = useCallback(() => {
    // Guard: if already on any SOS screen, don't open another one
    if (pathname.includes('/sos')) return;
    overlayRef.current?.activate();
  }, [pathname]);

  return (
    <View style={styles.root}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} onPanic={handlePanic} />}
        screenOptions={{ headerShown: false }}
      >
        {/* Visible tabs */}
        <Tabs.Screen name="home"    />
        <Tabs.Screen name="apps"    />
        <Tabs.Screen name="journal" />
        <Tabs.Screen name="profile" />

        {/* Hidden — not in tab bar */}
        <Tabs.Screen name="favorites" options={{ href: null }} />

        {/* Hidden screens — accessible by push, not shown in tab bar */}
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

      {/* Full-screen panic overlay — slides up over everything including tab bar */}
      <PanicOverlay ref={overlayRef} onNavigate={handleNavigateToSOS} />
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

  // Panic Button
  panicWrapper: {
    flex:       1,
    alignItems: 'center',
    marginTop:  -2,
  },
  panicGradient: {
    width:                   100,
    height:                  30,
    borderTopLeftRadius:     8,
    borderTopRightRadius:    8,
    borderBottomLeftRadius:  0,
    borderBottomRightRadius: 0,
    alignItems:              'center',
    justifyContent:          'center',
  },
  panicTip: {
    width:            0,
    height:           0,
    borderLeftWidth:  18,
    borderRightWidth: 18,
    borderTopWidth:   13,
    borderLeftColor:  'transparent',
    borderRightColor: 'transparent',
    borderTopColor:   Colors.primaryMid,
  },
  panicBang: {
    color:      Colors.white,
    fontSize:   15,
    fontFamily: Fonts.poppinsBold,
  },
  panicLabel: {
    fontFamily: Fonts.poppins,
    fontSize:   10,
    color:      '#9d9d9d',
    textAlign:  'center',
    marginTop:  3,
    lineHeight: 13,
  },
});
