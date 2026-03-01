import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { DrawerProvider, useDrawer } from '../../components/DrawerContext';
import DrawerContent from '../../components/DrawerContent';

function TabBarIcon({ name, color, size }: { name: any; color: string; size: number }) {
  return <Ionicons name={name} size={size} color={color} />;
}

function SOSTabIcon() {
  return (
    <View style={sosStyles.wrap}>
      <Ionicons name="alert" size={20} color={Colors.white} />
    </View>
  );
}

const sosStyles = StyleSheet.create({
  wrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 14 : 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
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
            fontWeight: '500',
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
            tabBarLabel: () => (
              <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.primary }}>Sober SOS</Text>
            ),
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
    backgroundColor: 'rgba(0,0,0,0.4)',
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

export default function AppLayoutWrapper() {
  return (
    <DrawerProvider>
      <AppLayout />
    </DrawerProvider>
  );
}
