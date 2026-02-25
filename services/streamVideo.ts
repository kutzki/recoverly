import { StreamVideoClient, User } from '@stream-io/video-react-native-sdk';
import { STREAM_API_KEY, STREAM_TOKEN_ENDPOINT } from '../constants/stream';
import { generateDevToken } from './streamTokenDev';

let client: StreamVideoClient | null = null;
let cachedUserId: string | null = null;

async function fetchStreamToken(userId: string): Promise<string> {
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
    console.warn('[StreamVideo] Backend unavailable — using dev token (disable auth in Stream Dashboard)');
    return generateDevToken(userId);
  }
}

export async function initStreamVideo(userId: string, userName: string): Promise<StreamVideoClient> {
  // If we already have an active client for this exact user, reuse it
  if (client && cachedUserId === userId) return client;

  // Different user or stale client — disconnect cleanly before creating a new one
  if (client) {
    await client.disconnectUser().catch(() => {});
    client = null;
    cachedUserId = null;
  }

  const user: User = {
    id: userId,
    name: userName,
    type: 'authenticated',
  };

  const tokenProvider = () => fetchStreamToken(userId);

  client = new StreamVideoClient({ apiKey: STREAM_API_KEY, user, tokenProvider });
  cachedUserId = userId;
  return client;
}

export function getStreamVideoClient(): StreamVideoClient | null {
  return client;
}

export async function disconnectStreamVideo(): Promise<void> {
  if (client) {
    await client.disconnectUser();
    client = null;
    cachedUserId = null;
  }
}
