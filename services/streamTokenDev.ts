/**
 * Generates a development-only JWT for any Stream SDK (Chat, Video, Feeds).
 *
 * Stream Chat, Video, and Feeds all use the same JWT format.
 * This unsigned token only works when Auth is disabled in the Stream Dashboard:
 *   Dashboard → your app → Authentication → Disable Auth
 *
 * When backend is ready, remove this file and call POST /api/stream-token instead.
 */
export function generateDevToken(userId: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const payload = btoa(
    JSON.stringify({
      user_id: userId,
      iss: 'stream-chat-react-native',
      sub: `user/${userId}`,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24h
    })
  )
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  // Signature is empty — valid only with auth disabled in Stream Dashboard
  return `${header}.${payload}.`;
}
