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
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 12 : 16,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
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
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#FF3B30' }}>SOS</Text>
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
