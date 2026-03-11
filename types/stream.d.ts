/**
 * Stream Chat SDK — custom type augmentation
 *
 * Extends the blank interfaces exported from stream-chat so that our
 * application-specific fields (days_sober, challenges, channel name, …)
 * are known to TypeScript without requiring `as any` casts throughout the
 * codebase.
 *
 * Reference: https://getstream.io/chat/docs/react-native/typescript/?language=javascript
 */
declare module 'stream-chat/dist/types/custom_types' {
  /** Custom fields stored on every Stream user object */
  interface CustomUserData {
    days_sober?: number;
    challenges?: string[];
  }

  /** Custom fields stored on every Stream channel object */
  interface CustomChannelData {
    /** Human-readable display name for group / community channels */
    name?: string;
  }
}
