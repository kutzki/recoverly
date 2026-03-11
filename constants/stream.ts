// Stream configuration — values loaded from environment variables.
// Set EXPO_PUBLIC_STREAM_API_KEY and EXPO_PUBLIC_STREAM_APP_ID in .env (local)
// or via `eas secret:create` for CI/production builds.
export const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY!;
export const STREAM_APP_ID  = process.env.EXPO_PUBLIC_STREAM_APP_ID!;

// Token endpoint on your backend (add this route when backend is ready)
export const STREAM_TOKEN_ENDPOINT = 'https://recoverly-api.vercel.app/api/stream-token';

// ─── Stream Video ─────────────────────────────────────────────────────────────
export const CALL_TYPE_DEFAULT = 'default';      // video + audio
export const CALL_TYPE_AUDIO   = 'audio_room';   // audio only

// ─── Stream Chat — channel types ─────────────────────────────────────────────
export const CHANNEL_TYPE_MESSAGING   = 'messaging';   // 1-on-1 DMs
export const CHANNEL_TYPE_TEAM        = 'team';        // group chats, inner circle, support groups
export const CHANNEL_TYPE_LIVESTREAM  = 'livestream';  // open community channels

// ─── Stream Feeds — feed slugs ───────────────────────────────────────────────
export const FEED_SLUG_USER      = 'user';       // each user's own activity feed
export const FEED_SLUG_TIMELINE  = 'timeline';   // aggregated feed of followed users
export const FEED_SLUG_NOTIFY    = 'notification'; // notification feed
