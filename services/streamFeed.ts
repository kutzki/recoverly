import { connect, StreamClient } from 'getstream';
import { STREAM_API_KEY, STREAM_APP_ID, STREAM_TOKEN_ENDPOINT, FEED_SLUG_USER, FEED_SLUG_TIMELINE, FEED_SLUG_NOTIFY } from '../constants/stream';
let feedClient: StreamClient | null = null;
let currentFeedUserId: string | null = null;

// ─── Token ───────────────────────────────────────────────────────────────────

/**
 * Activity Feeds dev token — minimal payload: just user_id.
 * Requires Auth disabled in Stream Dashboard → App → Authentication.
 */
function generateFeedsDevToken(userId: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payload = btoa(JSON.stringify({ user_id: userId }))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${header}.${payload}.`;
}

async function fetchFeedsToken(userId: string): Promise<string> {
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
    console.warn('[StreamFeeds] Backend unavailable — using dev token');
    return generateFeedsDevToken(userId);
  }
}

// ─── Client lifecycle ─────────────────────────────────────────────────────────

export async function connectStreamFeed(userId: string): Promise<StreamClient | null> {
  if (!STREAM_APP_ID) {
    console.warn('[StreamFeeds] STREAM_APP_ID not set — Activity Feeds disabled. Add your App ID from the Stream Dashboard to constants/stream.ts');
    return null;
  }

  if (feedClient && currentFeedUserId === userId) return feedClient;

  const token = await fetchFeedsToken(userId);

  feedClient = connect(STREAM_API_KEY, token, STREAM_APP_ID);
  currentFeedUserId = userId;

  console.log('[StreamFeeds] Connected:', userId);
  return feedClient;
}

export function disconnectStreamFeed(): void {
  feedClient = null;
  currentFeedUserId = null;
  console.log('[StreamFeeds] Disconnected');
}

export function getStreamFeedClient(): StreamClient | null {
  return feedClient;
}

// ─── Activity helpers ─────────────────────────────────────────────────────────

export type ActivityType = 'post' | 'milestone' | 'checkin';

interface PostActivityOptions {
  text: string;
  type: ActivityType;
  userId: string;
  userName: string;
  extraData?: Record<string, unknown>;
}

/**
 * Post an activity to the user's own feed.
 * Other users who follow this user will see it in their timeline.
 */
export async function postActivity({
  text,
  type,
  userId,
  userName,
  extraData = {},
}: PostActivityOptions): Promise<void> {
  if (!feedClient) {
    throw new Error('Activity Feeds not connected');
  }

  const userFeed = feedClient.feed(FEED_SLUG_USER, userId);

  await userFeed.addActivity({
    verb: type,
    object: `${type}:${Date.now()}`,
    actor: `SU:${userId}`,
    text,
    actor_name: userName,
    time: new Date().toISOString(),
    ...extraData,
  });
}

/**
 * Get activities from the current user's own feed.
 */
export async function getOwnFeed(userId: string, limit = 20) {
  if (!feedClient) return [];

  try {
    const userFeed = feedClient.feed(FEED_SLUG_USER, userId);
    const result = await userFeed.get({ limit });
    return result.results;
  } catch (err) {
    console.warn('[StreamFeeds] getOwnFeed error:', err);
    return [];
  }
}

/**
 * Get aggregated activities from users the current user follows.
 */
export async function getTimelineFeed(userId: string, limit = 25) {
  if (!feedClient) return [];

  try {
    const timeline = feedClient.feed(FEED_SLUG_TIMELINE, userId);
    const result = await timeline.get({ limit, enrich: true });
    return result.results;
  } catch (err) {
    console.warn('[StreamFeeds] getTimelineFeed error:', err);
    return [];
  }
}

/**
 * Follow another user: current user's timeline will include their activities.
 */
export async function followUser(currentUserId: string, targetUserId: string): Promise<void> {
  if (!feedClient) return;

  const timeline = feedClient.feed(FEED_SLUG_TIMELINE, currentUserId);
  await timeline.follow(FEED_SLUG_USER, targetUserId);
}

/**
 * Unfollow a user.
 */
export async function unfollowUser(currentUserId: string, targetUserId: string): Promise<void> {
  if (!feedClient) return;

  const timeline = feedClient.feed(FEED_SLUG_TIMELINE, currentUserId);
  await timeline.unfollow(FEED_SLUG_USER, targetUserId);
}

/**
 * Add a reaction (like) to an activity.
 */
export async function addReaction(activityId: string, kind: 'like' = 'like'): Promise<void> {
  if (!feedClient) return;

  await feedClient.reactions.add(kind, activityId, {});
}

/**
 * Remove a reaction from an activity.
 */
export async function removeReaction(reactionId: string): Promise<void> {
  if (!feedClient) return;

  await feedClient.reactions.delete(reactionId);
}

/**
 * Add a comment reaction to an activity.
 */
export async function addComment(activityId: string, text: string, authorName: string): Promise<void> {
  if (!feedClient) return;
  await feedClient.reactions.add('comment', activityId, { text, author_name: authorName });
}

/**
 * Fetch comments for an activity.
 */
export async function getComments(activityId: string): Promise<any[]> {
  if (!feedClient) return [];
  try {
    const result = await (feedClient as any).reactions.filter({ activity_id: activityId, kind: 'comment' });
    return result.results || [];
  } catch (err) {
    console.warn('[StreamFeeds] getComments error:', err);
    return [];
  }
}

/**
 * Get notification feed for current user (likes, follows, mentions).
 */
export async function getNotificationFeed(userId: string, limit = 20) {
  if (!feedClient) return [];

  try {
    const notifyFeed = feedClient.feed(FEED_SLUG_NOTIFY, userId);
    const result = await notifyFeed.get({ limit, mark_seen: true });
    return result.results;
  } catch (err) {
    console.warn('[StreamFeeds] getNotificationFeed error:', err);
    return [];
  }
}
