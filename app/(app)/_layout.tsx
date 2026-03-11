import React, { ComponentProps, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { OverlayProvider } from 'stream-chat-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { DrawerProvider, useDrawer } from '../../components/DrawerContext';
import DrawerContent from '../../components/DrawerContent';

function TabBarIcon({ name, color, size }: { name: ComponentProps<typeof Ionicons>['name']; color: string; size: number }) {
  return <Ionicons name={name} size={size} color={color} />;
}

function SOSTabIcon() {
  return (
    <View style={sosStyles.container}>
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primaryMid]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={sosStyles.pill}
      >
        <Ionicons name="alert" size={18} color={Colors.white} />
      </LinearGradient>
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
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
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
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="home-outline" color={color} size={size} />
            ),
          }}
        />
        {/* Feed — hidden from tab bar, still accessible via router.push */}
        <Tabs.Screen name="feed" options={{ href: null }} />
        <Tabs.Screen
          name="apps"
          options={{
            title: 'Apps',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="grid-outline" color={color} size={size} />
            ),
          }}
        />
        {/* SOS tab — points to sos/index.tsx via the sos folder */}
        <Tabs.Screen
          name="sos"
          options={{
            title: 'SOS',
            tabBarIcon: () => <SOSTabIcon />,
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favorites',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="star-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="person-outline" color={color} size={size} />
            ),
          }}
        />
        {/* Hidden screens — navigable via router.push but no tab button */}
        <Tabs.Screen name="tracker" options={{ href: null }} />
        <Tabs.Screen name="messages" options={{ href: null }} />
        <Tabs.Screen name="sober-pal" options={{ href: null }} />
        <Tabs.Screen name="meetings" options={{ href: null }} />
        <Tabs.Screen name="resource-hub" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
        <Tabs.Screen name="find-users" options={{ href: null }} />
        <Tabs.Screen name="chat" options={{ href: null }} />
        {/* New screens */}
        <Tabs.Screen name="edit-profile" options={{ href: null }} />
        <Tabs.Screen name="sponsor" options={{ href: null }} />
        <Tabs.Screen name="inner-circle" options={{ href: null }} />
        <Tabs.Screen name="goals" options={{ href: null }} />
        <Tabs.Screen name="crisis-history" options={{ href: null }} />
        <Tabs.Screen name="user" options={{ href: null }} />
        <Tabs.Screen name="call" options={{ href: null }} />
      </Tabs>

      {/* Custom side drawer overlay */}
      {isOpen && (
        <View style={drawerStyles.overlay}>
          <TouchableOpacity
            style={drawerStyles.backdrop}
            onPress={closeDrawer}
            activeOpacity={1}
          />
          <View style={drawerStyles.drawer}>
            <DrawerContent onClose={closeDrawer} />
          </View>
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
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
});

/**
 * Defer OverlayProvider mount until 100 ms after first paint.
 *
 * On Android with new architecture (JSI), stream-chat-react-native's
 * OverlayProvider triggers synchronous native-module initialisation on the
 * UI thread during mount.  If this coincides with the app's own startup
 * sequence the combined blocking time exceeds Android's 5-second ANR
 * threshold.  Delaying the mount by 100 ms lets the first frame complete
 * and satisfies Android's "app is alive" check before the heavy init runs.
 */
export default function AppLayoutWrapper() {
  const [overlayReady, setOverlayReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setOverlayReady(true), 100);
    return () => clearTimeout(id);
  }, []);

  if (!overlayReady) {
    return (
      <DrawerProvider>
        <AppLayout />
      </DrawerProvider>
    );
  }

  return (
    <OverlayProvider>
      <DrawerProvider>
        <AppLayout />
      </DrawerProvider>
    </OverlayProvider>
  );
}
