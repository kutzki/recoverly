# External Integrations

**Analysis Date:** 2026-03-15

## APIs & External Services

**Supabase (Backend & Database):**
- What: PostgreSQL database, authentication, real-time APIs, and serverless functions
- SDK: `@supabase/supabase-js` 2.97.0
- Client: `services/supabase.ts` exports `supabase` singleton
- Auth:
  - URL: env var `EXPO_PUBLIC_SUPABASE_URL`
  - Key: env var `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Used for:
  - User authentication (email/password, Google OAuth)
  - Profile CRUD operations (`auth.ts`, `store/auth.ts`)
  - Journal entries (CRUD via `services/journal.ts`)
  - Daily check-ins
  - Secure session storage via `expo-secure-store` adapter

**Stream Chat (Messaging):**
- What: Real-time messaging and chat infrastructure
- SDK: `stream-chat` 9.35.1 (backend), `stream-chat-react-native` 8.13.0 (UI)
- Client setup: `services/streamChat.ts` initializes singleton via `connectStreamChat()`
- Auth:
  - API Key: env var `EXPO_PUBLIC_STREAM_API_KEY`
  - App ID: env var `EXPO_PUBLIC_STREAM_APP_ID`
  - User token: obtained from Supabase serverless function at `{SUPABASE_URL}/functions/v1/stream-token`
- Used for:
  - Direct messaging between users
  - Channel-based group chat (messaging, team, livestream channel types)
  - User search and DM creation (`services/streamChat.ts` exports `searchUsers()`, `getOrCreateDMChannel()`)
  - Connected in `store/auth.ts` on login, disconnected on logout

**AA Intergroup Meeting Guide API (Public, No Auth):**
- What: Open API for finding AA/NA meetings by location
- Endpoint: `https://api.aa-intergroup.org/api/meetings`
- Client: `services/meetings.ts` exports `fetchNearbyMeetings()`
- Auth: None required (public API)
- Used for:
  - Location-based meeting search (latitude, longitude, distance in miles)
  - Meeting details: time, day, location, address, meeting types
  - No rate limiting documented; 8-second timeout enforced in client

## Data Storage

**Databases:**
- **Supabase PostgreSQL** (primary)
  - Connection: via `@supabase/supabase-js` client initialized with URL + anon key
  - Client: `services/supabase.ts` singleton
  - Tables:
    - `auth.users` - Managed by Supabase Auth; holds email, password hash, OAuth identity
    - `public.profiles` - User profiles (name, username, avatar, bio, location, sobriety date, challenges, goals, sponsor, inner circle)
    - `public.daily_checkins` - Daily check-in records (user_id, date, created_at)
    - `public.journal_entries` - Journal entries (user_id, date, mood, title, body)
  - Row Level Security (RLS): Enabled on all tables; users can only read/modify their own records
  - Trigger: `handle_new_user()` auto-creates profile row on signup

**File Storage:**
- Not detected — images likely handled via URLs (avatar_url in profiles, or external storage assumed)

**Caching:**
- React Query cache (in-memory): 5-minute stale time, 2 retries on failure
- `expo-secure-store`: Session tokens persisted securely on device

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (primary)
  - Implementation: Email/password sign-up and sign-in
  - OAuth: Google sign-in via OAuth redirect flow using `expo-web-browser`
  - Session storage: `expo-secure-store` adapter for secure token persistence
  - Auto-refresh: Enabled (`autoRefreshToken: true` in `services/supabase.ts`)
  - Session detection: Disabled for deep links (`detectSessionInUrl: false`)

**Integration Points:**
- `services/auth.ts` exports `authService` with methods:
  - `signUp(email, password)`
  - `signIn(email, password)`
  - `signOut()`
  - `signInWithGoogle()` - Opens browser for OAuth callback
  - `resetPassword(email)` - Email reset flow via Supabase
  - `resendVerification(email)`
  - `getProfile(userId)` / `updateProfile(userId, updates)` - Profile queries
- Deep link callback: `recoverly://auth/callback` (configured in `app.json`)
- Password reset callback: `recoverly://auth/reset-password`

## Monitoring & Observability

**Error Tracking:**
- ErrorBoundary component at root layout (`components/ErrorBoundary`)
- No external error tracking service (Sentry) currently integrated — was attempted in v1.0.41–1.0.44 but removed due to startup crashes

**Logs:**
- Console-only (native `console.log` in React Native)
- No centralized logging service

## CI/CD & Deployment

**Hosting:**
- EAS (Expo Application Services) for building Android APKs
- Internal distribution via EAS (preview profile for testing)
- Google Play Store submission (production profile for app store release)

**CI Pipeline:**
- Not detected — manual EAS builds triggered via CLI or orchestration

**Build Profiles** (in `eas.json`):
- `development` - Uses development client, local credentials, APK output
- `preview` - For testing; internal distribution, cache disabled, embedded EXPO_PUBLIC_* vars
- `production` - For Play Store submission, app-bundle output, production credentials (not yet populated)

## Environment Configuration

**Required env vars (populate in `.env` locally or in EAS profiles):**
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous public key
- `EXPO_PUBLIC_STREAM_API_KEY` - Stream Chat API key
- `EXPO_PUBLIC_STREAM_APP_ID` - Stream Chat app ID

**Local env file:**
- `.env` (gitignored) — used for local development with `expo start` or `expo run android`
- `.env.example` — template for developers

**EAS build env:**
- EAS build servers never receive `.env` file (gitignored)
- All EXPO_PUBLIC_* vars must be in `eas.json` under the specific build profile's `env` section
- Example (preview profile): embedded vars at build time

**Secrets location:**
- Local: `.env` file (not committed)
- Build time: `eas.json` (embedded for preview; production vars TBD)
- Runtime: `expo-secure-store` for session tokens, Google OAuth tokens

## Webhooks & Callbacks

**Incoming:**
- Stream Chat webhooks — Not detected in codebase (unlikely needed for client-only app)
- Supabase Auth callbacks — Password reset and OAuth redirect via deep linking:
  - `recoverly://auth/callback` - OAuth success redirect
  - `recoverly://auth/reset-password` - Email password reset link

**Outgoing:**
- Supabase serverless function: `POST {SUPABASE_URL}/functions/v1/stream-token`
  - Called by `services/streamChat.ts` to obtain Stream Chat user token
  - Body: `{ userId }`
  - Response: `{ token: string }`
  - Executed server-side to prevent exposing Stream API key to client

## Deep Linking & URL Schemes

**App Scheme:**
- `recoverly://` (configured in `app.json`)

**Deep Link Handlers:**
- `recoverly://auth/callback` - Handled by auth flow in `services/auth.ts`
- `recoverly://auth/reset-password` - Handled by password reset flow
- Additional deep links: Not documented in current analysis

## Permissions

**Android Permissions** (declared in `app.json`, requested at runtime via Expo modules):
- `android.permission.INTERNET` - Network access (required)
- `android.permission.VIBRATE` - Haptic feedback via `expo-haptics`
- `android.permission.CAMERA` - Camera access via `expo-image-picker`
- `android.permission.ACCESS_FINE_LOCATION` - GPS location for meeting search
- `android.permission.ACCESS_COARSE_LOCATION` - Network-based location fallback

---

*Integration audit: 2026-03-15*
