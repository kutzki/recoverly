/**
 * Stream Activity Feeds — stubbed (getstream package removed to fix startup crash).
 * All functions are no-ops / return empty values.
 * Re-enable by adding `getstream` back to package.json and restoring the real implementation.
 */

export type ActivityType = 'post' | 'milestone' | 'checkin';

export async function connectStreamFeed(_userId: string): Promise<null> {
  return null;
}

export function disconnectStreamFeed(): void {}

export function getStreamFeedClient(): null {
  return null;
}

export async function postActivity(_options: {
  text: string;
  type: ActivityType;
  userId: string;
  userName: string;
  extraData?: Record<string, unknown>;
}): Promise<void> {}

export async function getOwnFeed(_userId: string, _limit = 20): Promise<any[]> {
  return [];
}

export async function getTimelineFeed(_userId: string, _limit = 25): Promise<any[]> {
  return [];
}

export async function followUser(_currentUserId: string, _targetUserId: string): Promise<void> {}

export async function unfollowUser(_currentUserId: string, _targetUserId: string): Promise<void> {}

export async function addReaction(_activityId: string, _kind: 'like' = 'like'): Promise<void> {}

export async function removeReaction(_reactionId: string): Promise<void> {}

export async function addComment(_activityId: string, _text: string, _authorName: string): Promise<void> {}

export async function getComments(_activityId: string): Promise<any[]> {
  return [];
}

export async function getNotificationFeed(_userId: string, _limit = 20): Promise<any[]> {
  return [];
}
