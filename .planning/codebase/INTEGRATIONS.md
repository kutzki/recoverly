# External Integrations

**Analysis Date:** 2026-03-15

## APIs & External Services

**Database & Backend:**
- Supabase - PostgreSQL database, authentication, and HTTP functions
  - SDK/Client: @supabase/supabase-js 2.97.0
  - Endpoint: `https://fccuedbmgszbklxuodic.supabase.co`
  - Auth: Anon key stored in `eas.json` preview profile

**Real-Time Messaging:**
- Stream Chat - Messaging and channel management
  - SDK/Client: stream-chat 9.35.1 (core), stream-chat-react-native 8.13.0 (UI components)
  - API Key: `EXPO_PUBLIC_STREAM_API_KEY` (z7u626zrtzxj in preview)
  - App ID: `EXPO_PUBLIC_STREAM_APP_ID` (1220960 in preview)
  - Token endpoint: `{SUPABASE_URL}/functions/v1/stream-token` (HTTP POST)

## Data Storage

**Databases:**
- Supabase PostgreSQL
  - Connection: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - Client: @supabase/supabase-js via `services/supabase.ts`
  - Auth Storage: expo-secure-store (ExpoSecureStoreAdapter in `services/supabase.ts`)
  - Tables: profiles, journal_entries
    - profiles: User account data, profile completion status, sobriety tracking
    - journal_entries: User journal entries with mood tracking

**File Storage:**
- Local filesystem only - Profile avatars referenced by URL in profiles table

**Caching:**
- React Query (@tanstack/react-query 5.90.21)
  - Default stale time: 5 minutes
  - Default retry: 2 attempts
  - Configured in `app/_layout.tsx`

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (self-hosted via Supabase PostgreSQL)
  - Implementation: Email/password with session persistence
  - Flow:
    1. Sign up/in via `authService.signUp()` or `authService.signIn()` in `services/auth.ts`
    2. Session persisted to expo-secure-store via ExpoSecureStoreAdapter
    3. Auto-refresh enabled: `autoRefreshToken: true`
    4. Session loaded on app startup via `useAuthStore.loadStoredAuth()` in `store/auth.ts`
  - User profile fetched from profiles table after sign-in
  - Profile completion tracked via `is_profile_complete` boolean

**Session Management:**
- Store: Zustand (`useAuthStore` in `store/auth.ts`)
- Token persistence: expo-secure-store (secure native storage)
- Sign out: Clears store and disconnects Stream Chat

## Monitoring & Observability

**Error Tracking:**
- None detected - custom error boundaries in place (`components/ErrorBoundary`)

**Logs:**
- Console logging - `no-console` ESLint rule allows warn/error levels

## CI/CD & Deployment

**Hosting:**
- EAS Build system (Expo Application Services)
  - Android platform only (no iOS)
  - APK distribution: Internal (preview profile) or Play Store (production)
  - Version code: 20001 (v2.0.1)
  - Service account credentials: `pc-api-key.json` referenced in `eas.json` submit config

**CI Pipeline:**
- EAS CLI - `eas build --platform android --profile preview --non-interactive`
- No GitHub Actions or external CI detected
- Build profiles:
  - development: Development client APK
  - preview: Internal test APK with embedded env vars
  - production: Store-signed app-bundle

## Environment Configuration

**Required env vars:**
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase instance endpoint
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase public API key
- `EXPO_PUBLIC_STREAM_API_KEY` - Stream Chat API key
- `EXPO_PUBLIC_STREAM_APP_ID` - Stream Chat App ID

**Var scope:**
- Public vars (EXPO_PUBLIC_*) embedded in build via `eas.json` env section
- NOT read from .env at runtime (EAS build servers never receive .env)
- Build-time substitution prevents missing var crashes

**Secrets location:**
- `eas.json` preview profile env block (for testing)
- Production env vars: Managed outside codebase (EAS dashboard or CI/CD platform)
- Sensitive local credentials: `.env.example` documents public keys required; actual `.env` is gitignored
- Service account key: `pc-api-key.json` (referenced in eas.json submit block, gitignored)

## Webhooks & Callbacks

**Incoming:**
- Stream Chat webhooks: Configured in Stream Dashboard (not in app)
- Supabase functions: `stream-token` function at `{SUPABASE_URL}/functions/v1/stream-token`
  - POST endpoint called by `connectStreamChat()` to generate Stream auth tokens
  - Expected response: `{ token: string }`

**Outgoing:**
- None detected - app is read-only from external services

## Disabled Integrations (Stubs)

**Video Calling:**
- Service: `services/streamVideo.ts` (stubbed)
- Original SDK: @stream-io/react-native-webrtc (removed)
- Reason: Old-arch ReactPackage causes 5-second ANR on app startup (calls `PeerConnectionFactory.initialize()` on main thread)
- Status: Re-enable only when Stream releases TurboModule version with `codegenConfig`

**Activity Feeds:**
- Service: `services/streamFeed.ts` (stubbed)
- Original SDK: getstream package (removed)
- Reason: New Architecture compatibility unconfirmed
- Status: Re-enable after confirming TurboModule compliance

---

*Integration audit: 2026-03-15*
