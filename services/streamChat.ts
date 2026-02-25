import { StreamChat, Channel } from 'stream-chat';
import { STREAM_API_KEY, STREAM_TOKEN_ENDPOINT, CHANNEL_TYPE_MESSAGING, CHANNEL_TYPE_TEAM, CHANNEL_TYPE_LIVESTREAM } from '../constants/stream';
import { generateDevToken } from './streamTokenDev';

let chatClient: StreamChat | null = null;

// ─── Token ───────────────────────────────────────────────────────────────────

async function fetchChatToken(userId: string): Promise<string> {
  try {
    const res = await fetch(STREAM_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Token endpoint failed');
    const data = await res.json();
    return data.token;
  } catch {
    console.warn('[StreamChat] Backend unavailable — using dev token (disable auth in Stream Dashboard)');
    return generateDevToken(userId);
  }
}

// ─── Client lifecycle ─────────────────────────────────────────────────────────

export async function connectStreamChat(
  userId: string,
  userName: string,
  userImage?: string,
  challenges?: string[],
  sobrietyStartDate?: string
): Promise<StreamChat> {
  if (chatClient && chatClient.userID === userId) return chatClient;

  // Disconnect any previous user
  if (chatClient) {
    await chatClient.disconnectUser().catch(() => {});
    chatClient = null;
  }

  const client = StreamChat.getInstance(STREAM_API_KEY);

  const token = await fetchChatToken(userId);

  // Compute days sober for user profile
  let daysSober = 0;
  if (sobrietyStartDate) {
    daysSober = Math.floor(
      (Date.now() - new Date(sobrietyStartDate).getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  await client.connectUser(
    {
      id: userId,
      name: userName,
      image: userImage,
      // Custom fields visible to other users for discovery
      days_sober: daysSober,
      challenges: challenges ?? [],
    },
    token
  );

  chatClient = client;
  console.log('[StreamChat] Connected:', userId);
  return client;
}

export async function disconnectStreamChat(): Promise<void> {
  if (chatClient) {
    await chatClient.disconnectUser().catch(() => {});
    chatClient = null;
    console.log('[StreamChat] Disconnected');
  }
}

export function getStreamChatClient(): StreamChat | null {
  return chatClient;
}

// ─── Channel helpers ──────────────────────────────────────────────────────────

/**
 * Get or create a 1-on-1 DM channel between two users.
 * Uses channel ID = sorted user IDs to ensure uniqueness.
 */
export async function getOrCreateDMChannel(
  currentUserId: string,
  otherUserId: string
): Promise<Channel> {
  if (!chatClient) throw new Error('StreamChat not connected');

  const sortedIds = [currentUserId, otherUserId].sort();
  const channelId = `dm_${sortedIds[0]}_${sortedIds[1]}`;

  const channel = chatClient.channel(CHANNEL_TYPE_MESSAGING, channelId, {
    members: [currentUserId, otherUserId],
  });

  await channel.create();
  return channel;
}

/**
 * Create a private group channel (team type) with given members.
 */
export async function createGroupChannel(
  creatorId: string,
  memberIds: string[],
  name: string
): Promise<Channel> {
  if (!chatClient) throw new Error('StreamChat not connected');

  const channel = chatClient.channel(CHANNEL_TYPE_TEAM, {
    name,
    members: [...new Set([creatorId, ...memberIds])],
    created_by_id: creatorId,
  });

  await channel.create();
  return channel;
}

/**
 * Join (or get) an open community / support group channel.
 * These channels exist with known IDs (seeded by admin).
 */
export async function joinCommunityChannel(channelId: string, name?: string): Promise<Channel> {
  if (!chatClient) throw new Error('StreamChat not connected');

  const channel = chatClient.channel(CHANNEL_TYPE_LIVESTREAM, channelId, {
    name: name ?? channelId,
  });

  await channel.watch();
  return channel;
}

/**
 * Search users by name (for Find Users / DM compose).
 * Returns up to `limit` users excluding the current user.
 */
export async function searchUsers(
  query: string,
  currentUserId: string,
  limit = 20
): Promise<any[]> {
  if (!chatClient) throw new Error('StreamChat not connected');

  const filter: Record<string, any> = { id: { $ne: currentUserId } };
  if (query.trim()) {
    filter.name = { $autocomplete: query.trim() };
  }

  const { users } = await chatClient.queryUsers(
    filter,
    [{ last_active: -1 }],
    { limit }
  );

  return users;
}

/**
 * Fetch channels the current user is a member of (DMs + groups).
 * Sorted by most recent message.
 */
export function buildChannelFilters(userId: string) {
  return {
    members: { $in: [userId] },
    type: { $in: [CHANNEL_TYPE_MESSAGING, CHANNEL_TYPE_TEAM] },
  };
}

export function buildChannelSort(): any[] {
  return [{ last_message_at: -1 }];
}

/**
 * Returns all pre-seeded community / livestream channels.
 */
export async function queryCommunityChannels() {
  if (!chatClient) throw new Error('StreamChat not connected');

  const channels = await chatClient.queryChannels(
    { type: CHANNEL_TYPE_LIVESTREAM },
    [{ last_message_at: -1 }],
    { limit: 20, watch: true }
  );

  return channels;
}
