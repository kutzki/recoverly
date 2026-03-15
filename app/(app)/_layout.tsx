import { Tabs, router } from 'expo-router';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

// ── Tab definitions (4 real tabs + panic button in center) ───────────────────

const LEFT_TABS  = [
  { name: 'home',      icon: 'home-outline',   activeIcon: 'home'    as const },
  { name: 'apps',      icon: 'grid-outline',   activeIcon: 'grid'    as const },
];
const RIGHT_TABS = [
  { name: 'journal', icon: 'book-outline',   activeIcon: 'book'    as const },
  { name: 'profile', icon: 'person-outline', activeIcon: 'person'  as const },
];

// ── Custom bottom tab bar ────────────────────────────────────────────────────

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const renderTab = (
    item: { name: string; icon: string; activeIcon: string },
    i: number,
  ) => {
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

      {/* Panic Button — center, raised */}
      <TouchableOpacity
        style={styles.panicWrapper}
        activeOpacity={0.85}
        onPress={() => router.push('/(app)/sos')}
      >
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primaryMid]}
          style={styles.panicGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Text style={styles.panicBang}>!</Text>
        </LinearGradient>
        <Text style={styles.panicLabel}>{'Panic\nButton'}</Text>
      </TouchableOpacity>

      {RIGHT_TABS.map(renderTab)}
    </View>
  );
}

// ── Layout ───────────────────────────────────────────────────────────────────

export default function AppLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
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
    </Tabs>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  bar: {
    flexDirection:    'row',
    backgroundColor:  Colors.navBackground,
    borderTopWidth:   1,
    borderTopColor:   Colors.navBorder,
    alignItems:       'center',
    paddingTop:       8,
    // Figma: DROP_SHADOW #00000019, offset(10,-10), radius 54
    shadowColor:      '#000000',
    shadowOffset:     { width: 10, height: -10 },
    shadowOpacity:    0.098,
    shadowRadius:     54,
    elevation:        20,
  },
  tabItem: {
    flex:         1,
    alignItems:   'center',
    paddingBottom: 4,
  },
  panicWrapper: {
    flex:       1,
    alignItems: 'center',
    marginTop:  -22,
  },
  panicGradient: {
    width:          125,
    height:         34,
    borderRadius:   4,
    alignItems:     'center',
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
