// Stream configuration
// API key is safe to expose in client — secret stays server-side only
export const STREAM_API_KEY = 'z7u626zrtzxj';

// App ID — find in Stream Dashboard → your app → App ID (numeric)
// Required for Activity Feeds SDK. Fill in from your dashboard.
export const STREAM_APP_ID = '1220960';

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
