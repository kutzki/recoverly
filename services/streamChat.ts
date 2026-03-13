import { StreamChat } from 'stream-chat';
import { STREAM_API_KEY, CHANNEL_TYPE_MESSAGING, CHANNEL_TYPE_TEAM, CHANNEL_TYPE_LIVESTREAM } from '../constants/stream';

let client: StreamChat | null = null;

export async function connectStreamChat(
  userId: string,
  userName: string,
  userImage?: string,
  daysSober?: number,
) {
  if (!STREAM_API_KEY) return;

  client = StreamChat.getInstance(STREAM_API_KEY);

  // Get token from backend
  const res = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stream-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const { token } = await res.json();

  await client.connectUser(
    { id: userId, name: userName, image: userImage, days_sober: daysSober ?? 0 },
    token,
  );
}

export async function disconnectStreamChat() {
  if (client) {
    await client.disconnectUser();
    client = null;
  }
}

export function getStreamChatClient() {
  return client;
}

export async function getOrCreateDMChannel(currentUserId: string, otherUserId: string) {
  if (!client) return null;
  const channel = client.channel(CHANNEL_TYPE_MESSAGING, {
    members: [currentUserId, otherUserId],
  });
  await channel.watch();
  return channel;
}

export async function searchUsers(query: string, currentUserId: string, limit = 20) {
  if (!client) return [];
  const response = await client.queryUsers(
    { name: { $autocomplete: query }, id: { $ne: currentUserId } },
    { name: 1 },
    { limit },
  );
  return response.users;
}

export function buildChannelFilters(userId: string) {
  return {
    type: { $in: [CHANNEL_TYPE_MESSAGING, CHANNEL_TYPE_TEAM] },
    members: { $in: [userId] },
  };
}

export function buildChannelSort() {
  return [{ last_message_at: -1 as const }];
}
