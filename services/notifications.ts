import { supabase } from './supabase';

export type AppNotification = {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: 'CHEER' | 'LINK_REQUEST' | 'LINK_ACCEPTED' | 'EMERGENCY' | 'MESSAGE';
  content: string | null;
  is_read: boolean;
  created_at: string;
  actor?: { name: string | null; avatar_url: string | null };
};

export const notificationService = {
  subscribeToNotifications(userId: string, onNotify: (notif: AppNotification) => void) {
    return supabase
      .channel(`public:notifications:recipient_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        async (payload) => {
          const notif = payload.new as AppNotification;
          
          // Fetch actor details
          const { data: actor } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', notif.actor_id)
            .single();

          onNotify({ ...notif, actor: actor ?? undefined });
        }
      )
      .subscribe();
  },

  async getMyNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        actor:profiles!notifications_actor_id_fkey(name, avatar_url)
      `)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as AppNotification[];
  },

  async markAsRead(notifId: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
  }
};
