import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Chat,
  Channel,
  MessageList,
  MessageInput,
} from 'stream-chat-react-native';
import { Channel as ChannelType } from 'stream-chat';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { getStreamChatClient } from '../../../services/streamChat';
import { useAuthStore } from '../../../store/auth';

export default function ChannelScreen() {
  const { cid } = useLocalSearchParams<{ cid: string }>();
  const { user } = useAuthStore();
  const [channel, setChannel] = useState<ChannelType | null>(null);
  const [loading, setLoading] = useState(true);
  const [channelName, setChannelName] = useState('');

  const chatClient = getStreamChatClient();

  useEffect(() => {
    if (!chatClient || !cid) return;

    (async () => {
      try {
        // cid format: "type:id"
        const [type, ...idParts] = cid.split(':');
        const id = idParts.join(':');

        const ch = chatClient.channel(type, id);
        await ch.watch();

        // Resolve display name
        // @ts-expect-error stream-chat ChannelData doesn't expose `name` in types — valid at runtime
        let name = ch.data?.name as string | undefined;
        if (!name) {
          // For DMs, show the other participant's name
          const members = Object.values(ch.state.members);
          const other = members.find(m => m.user?.id !== user?.id);
          name = other?.user?.name ?? 'Chat';
        }

        setChannelName(name);
        setChannel(ch);
      } catch (err) {
        console.error('[ChannelScreen] watch error:', err);
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [cid, chatClient, user?.id]);

  const startVideoCall = useCallback(() => {
    if (!cid) return;
    router.push({
      pathname: '/(app)/call/[callId]' as any,
      params: {
        callId: `chat_${cid.replace(':', '_')}`,
        type: 'default',
        calleeName: encodeURIComponent(channelName),
      },
    });
  }, [cid, channelName]);

  const startAudioCall = useCallback(() => {
    if (!cid) return;
    router.push({
      pathname: '/(app)/call/[callId]' as any,
      params: {
        callId: `chat_audio_${cid.replace(':', '_')}`,
        type: 'audio_room',
        calleeName: encodeURIComponent(channelName),
      },
    });
  }, [cid, channelName]);

  if (loading || !chatClient) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!channel) return null;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>

        <Text style={styles.channelName} numberOfLines={1}>
          {channelName}
        </Text>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={startAudioCall}>
            <Ionicons name="call-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={startVideoCall}>
            <Ionicons name="videocam-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stream Chat UI */}
      <Chat client={chatClient}>
        <Channel channel={channel} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -30}>
          <View style={styles.chatBody}>
            <MessageList />
            <MessageInput />
          </View>
        </Channel>
      </Chat>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelName: {
    flex: 1,
    fontSize: 17,
    fontFamily: Fonts.poppinsBold,
    color: Colors.text,
    textAlign: 'center',
  },
  headerActions: { flexDirection: 'row' },
  chatBody: { flex: 1 },
});
