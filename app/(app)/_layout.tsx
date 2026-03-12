import React, { ComponentProps, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { OverlayProvider } from 'stream-chat-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { DrawerProvider, useDrawer } from '../../components/DrawerContext';
import DrawerContent from '../../components/DrawerContent';

/* ─── Animated tab icon — bounces when focused ─── */
function AnimatedTabIcon({
  name,
  color,
  size,
  focused,
}: {
  name: ComponentProps<typeof Ionicons>['name'];
  color: string;
  size: number;
  focused: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.25, useNativeDriver: true, speed: 28, bounciness: 10 }),
        Animated.spring(scale, { toValue: 1.0,  useNativeDriver: true, speed: 18 }),
      ]).start();
    }
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
}

/* ─── SOS panic button — gentle glowing pulse ─── */
function SOSTabIcon({ focused }: { focused: boolean }) {
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });

  return (
    <View style={sosStyles.container}>
      <Animated.View style={{ transform: [{ scale: glowScale }] }}>
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primaryMid]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={sosStyles.pill}
        >
          <Ionicons name="alert" size={18} color={Colors.white} />
        </LinearGradient>
      </Animated.View>
      <Text style={sosStyles.label}>Panic{'\n'}Button</Text>
    </View>
  );
}

const sosStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 10 : 14,
  },
  pill: {
    width: 116,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
  label: {
    fontSize: 10,
    fontFamily: Fonts.poppinsMedium,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 13,
    marginTop: 3,
  },
});

function AppLayout() {
  const { isOpen, closeDrawer } = useDrawer();
  const drawerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(drawerAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const drawerTranslate = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [320, 0],
  });

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarStyle: {
            backgroundColor: Colors.white,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            height: Platform.OS === 'ios' ? 84 : 64,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: Fonts.poppinsMedium,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size, focused }) => (
              <AnimatedTabIcon
                name={focused ? 'home' : 'home-outline'}
                color={color}
                size={size}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen name="feed" options={{ href: null }} />
        <Tabs.Screen
          name="apps"
          options={{
            title: 'Apps',
            tabBarIcon: ({ color, size, focused }) => (
              <AnimatedTabIcon
                name={focused ? 'grid' : 'grid-outline'}
                color={color}
                size={size}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="sos"
          options={{
            title: 'SOS',
            tabBarIcon: ({ focused }) => <SOSTabIcon focused={focused} />,
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favorites',
            tabBarIcon: ({ color, size, focused }) => (
              <AnimatedTabIcon
                name={focused ? 'star' : 'star-outline'}
                color={color}
                size={size}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size, focused }) => (
              <AnimatedTabIcon
                name={focused ? 'person' : 'person-outline'}
                color={color}
                size={size}
                focused={focused}
              />
            ),
          }}
        />
        {/* Hidden screens — navigable via router.push */}
        <Tabs.Screen name="tracker"        options={{ href: null }} />
        <Tabs.Screen name="messages"       options={{ href: null }} />
        <Tabs.Screen name="sober-pal"      options={{ href: null }} />
        <Tabs.Screen name="meetings"       options={{ href: null }} />
        <Tabs.Screen name="resource-hub"   options={{ href: null }} />
        <Tabs.Screen name="settings"       options={{ href: null }} />
        <Tabs.Screen name="find-users"     options={{ href: null }} />
        <Tabs.Screen name="chat"           options={{ href: null }} />
        <Tabs.Screen name="edit-profile"   options={{ href: null }} />
        <Tabs.Screen name="sponsor"        options={{ href: null }} />
        <Tabs.Screen name="inner-circle"   options={{ href: null }} />
        <Tabs.Screen name="goals"          options={{ href: null }} />
        <Tabs.Screen name="crisis-history" options={{ href: null }} />
        <Tabs.Screen name="user"           options={{ href: null }} />
        <Tabs.Screen name="call"           options={{ href: null }} />
      </Tabs>

      {/* Animated slide-in drawer */}
      {isOpen && (
        <View style={drawerStyles.overlay}>
          <Animated.View style={[drawerStyles.backdrop, { opacity: drawerAnim }]}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={closeDrawer}
              activeOpacity={1}
            />
          </Animated.View>
          <Animated.View
            style={[
              drawerStyles.drawer,
              { transform: [{ translateX: drawerTranslate }] },
            ]}
          >
            <DrawerContent onClose={closeDrawer} />
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const drawerStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 999,
  },
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlayDark,
  },
  drawer: {
    width: 300,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
});

export default function AppLayoutWrapper() {
  return (
    <OverlayProvider>
      <DrawerProvider>
        <AppLayout />
      </DrawerProvider>
    </OverlayProvider>
  );
}
