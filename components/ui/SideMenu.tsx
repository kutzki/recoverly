import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Pressable } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useUIStore } from '../../store/ui';
import { useAuthStore } from '../../store/auth';
import { getStreamChatClient } from '../../services/streamChat';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MENU_WIDTH = SCREEN_WIDTH * 0.8;

export function SideMenu() {
  const isMenuOpen = useUIStore((s) => s.isMenuOpen);
  const closeMenu  = useUIStore((s) => s.closeMenu);
  const user       = useAuthStore((s) => s.user);
  const signOut    = useAuthStore((s) => s.signOut);
  const insets     = useSafeAreaInsets();

  const translateX     = useSharedValue(-MENU_WIDTH);
  const overlayOpacity = useSharedValue(0);
  const [isMounted, setIsMounted] = useState(false);

  // ── Real unread count from Stream Chat ───────────────────────────────────────
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const client = getStreamChatClient();
    if (!client) return;

    const me = client.user;
    if (me) setUnreadCount((me as any).total_unread_count ?? 0);

    const handler = (event: any) => {
      if (event.total_unread_count !== undefined) {
        setUnreadCount(event.total_unread_count);
      }
    };

    client.on('notification.message_new', handler);
    client.on('notification.mark_read',   handler);
    client.on('connection.changed',        handler);

    return () => {
      client.off('notification.message_new', handler);
      client.off('notification.mark_read',   handler);
      client.off('connection.changed',        handler);
    };
  }, [isMenuOpen]);

  // ── Drawer animation ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isMenuOpen) {
      setIsMounted(true);
      translateX.value     = withTiming(0,          { duration: 300, easing: Easing.out(Easing.poly(3)) });
      overlayOpacity.value = withTiming(1,          { duration: 300 });
    } else {
      translateX.value     = withTiming(-MENU_WIDTH, { duration: 250, easing: Easing.in(Easing.poly(3)) }, (finished) => {
        if (finished) runOnJS(setIsMounted)(false);
      });
      overlayOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [isMenuOpen]);

  const animatedDrawerStyle  = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const animatedOverlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));

  const handleNavigate = (route: string) => {
    closeMenu();
    setTimeout(() => { router.push(route as any); }, 280);
  };

  const handleLogout = () => {
    closeMenu();
    setTimeout(() => { signOut(); }, 280);
  };

  if (!isMounted && !isMenuOpen) return null;

  const fullName = user?.name ?? 'John Smith';
  const avatar   = user?.avatar_url;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, animatedOverlayStyle, { backgroundColor: 'rgba(26,26,26,0.8)' }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
      </Animated.View>

      <Animated.View style={[styles.drawer, { width: MENU_WIDTH }, animatedDrawerStyle]}>
        <LinearGradient
          colors={['rgba(171,49,240,0.06)', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.3 }}
        />

        <View style={[{ paddingTop: insets.top + 20, flex: 1 }]}>
          <Pressable style={styles.backBtn} onPress={closeMenu}>
            <Ionicons name="chevron-back" size={20} color={Colors.white} />
          </Pressable>

          {/* Profile box — tappable, navigates to profile */}
          <Pressable style={styles.profileBox} onPress={() => handleNavigate('/(app)/profile')}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="person" size={32} color={Colors.textMuted} />
              </View>
            )}
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{fullName}</Text>
              <Text style={styles.profileSub}>View profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
          </Pressable>

          <View style={styles.divider} />

          <View style={styles.menuGroup}>
            <MenuItem
              icon="chatbubble-outline"
              label="Messages"
              onPress={() => handleNavigate('/(app)/messages')}
              badge={unreadCount > 0 ? String(unreadCount) : undefined}
            />
            <MenuItem icon="search-outline"       label="My Sober Pal"  onPress={() => handleNavigate('/(app)/sober-pal')}    />
            <MenuItem icon="people-outline"       label="Meetings"      onPress={() => handleNavigate('/(app)/meetings')}     />
            <MenuItem icon="color-filter-outline" label="Resource hub"  onPress={() => handleNavigate('/(app)/resource-hub')} />
          </View>

          <View style={styles.divider} />

          <View style={styles.menuGroup}>
            <MenuItem icon="alert-circle-outline" label="Panic Button" onPress={() => handleNavigate('/(app)/sos')}      />
            <MenuItem icon="settings-outline"     label="Settings"     onPress={() => handleNavigate('/(app)/settings')} />
            <MenuItem icon="log-out-outline"      label="Logout"       onPress={handleLogout}                            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

function MenuItem({ icon, label, onPress, badge }: {
  icon: any; label: string; onPress: () => void; badge?: string;
}) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon} size={22} color={Colors.primary} />
        <Text style={styles.menuItemLabel}>{label}</Text>
      </View>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primaryMid,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 24, marginBottom: 30,
  },
  profileBox: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, marginBottom: 20,
  },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  profileText: { marginLeft: 16 },
  profileName: { fontFamily: Fonts.poppinsBold, fontSize: 18, color: Colors.text },
  profileSub:  { fontFamily: Fonts.poppins, fontSize: 14, color: '#999', marginTop: 2 },
  divider: {
    height: 1, backgroundColor: '#82DCFF',
    marginHorizontal: 24, marginVertical: 10,
  },
  menuGroup: { paddingVertical: 8 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16, paddingHorizontal: 30,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuItemLabel: {
    fontFamily: Fonts.generalSansMedium || Fonts.poppinsMedium,
    fontSize: 16, color: Colors.text, marginLeft: 18,
  },
  badge: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 12, minWidth: 24, height: 24,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  badgeText: { color: Colors.white, fontFamily: Fonts.poppinsBold, fontSize: 10 },
});
