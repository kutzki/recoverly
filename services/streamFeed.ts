// STUB — Stream activity feeds are disabled until the getstream package
// is confirmed compatible with New Architecture (TurboModules).
// Replace this file with the real implementation when ready.

export const connectStreamFeed    = async (..._args: unknown[]) => {};
export const disconnectStreamFeed = async () => {};
export const getStreamFeedClient  = () => null;
export const postActivity         = async (..._args: unknown[]) => null;
export const getOwnFeed           = async () => ({ results: [] });
export const getTimelineFeed      = async () => ({ results: [] });
export const followUser           = async (..._args: unknown[]) => {};
export const unfollowUser         = async (..._args: unknown[]) => {};
export const addReaction          = async (..._args: unknown[]) => null;
export const removeReaction       = async (..._args: unknown[]) => {};
export const addComment           = async (..._args: unknown[]) => null;
export const getComments          = async () => ({ results: [] });
export const getNotificationFeed  = async () => ({ results: [], unseen: 0, unread: 0 });
