import { useState, useEffect } from 'react';
import { View, Text, SectionList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { NotificationHeader } from '../../components/ui/NotificationHeader';
import { NotificationItem } from '../../components/ui/NotificationItem';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useAuthStore } from '../../store/auth';
import { notificationService, AppNotification } from '../../services/notifications';
import { guardianService } from '../../services/guardian';

export default function NotificationsScreen() {
  const user = useAuthStore((s) => s.user);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    if (!user) return;
    try {
      const data = await notificationService.getMyNotifications(user.id);
      setNotifications(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [user]);

  const handleAcceptLink = async (notif: AppNotification) => {
    try {
      // Find the pending link for this request
      const links = await guardianService.getMyLinks(user!.id, 'SEEKER');
      const link = links.find(l => l.guardian_id === notif.actor_id && l.status === 'PENDING');
      
      if (link) {
        await guardianService.updateLinkStatus(link.id, 'ACTIVE');
        await notificationService.markAsRead(notif.id);
        Alert.alert('Success', 'Guardian linked!');
        fetchNotifs();
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const sections = [
    { title: 'Recent', data: notifications }
  ];

  if (loading) {
    return (
      <View style={[styles.root, { justifyContent: 'center' }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <NotificationHeader />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <NotificationItem 
              id={item.id}
              type={item.type as any}
              userName={item.actor?.name ?? 'Anonymous'}
              timeAgo={new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              imageUri={item.actor?.avatar_url ?? undefined}
              isRead={item.is_read}
              onAccept={() => handleAcceptLink(item)}
            />
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No notifications yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  listContent: { paddingBottom: 40 },
  sectionHeader: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: Colors.white },
  sectionTitle: { fontFamily: Fonts.poppinsSemiBold, fontSize: 16, color: Colors.text },
  itemWrapper: { paddingHorizontal: 12 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.textMuted },
});
