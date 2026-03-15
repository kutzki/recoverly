# Architecture

**Analysis Date:** 2025-03-15

## Pattern Overview

**Overall:** Mobile-first, session-based, Expo Router navigation with modular state management

**Key Characteristics:**
- Expo Router handles file-system routing with typed routes (`experiments.typedRoutes: true`)
- Zustand stores manage global state (auth, progress, checklist)
- Services abstract backend calls and integrations (Supabase, Stream Chat)
- Component-driven UI with constants for design tokens (colors, fonts)
- New Architecture enabled (`newArchEnabled: true`) — required by Reanimated v4 and react-native-worklets
- Screen-based layout with tab navigation and hidden stack screens

## Layers

**Navigation/Routing:**
- Purpose: Route management and screen state transitions
- Location: `app/`, `app/(app)/_layout.tsx`
- Contains: Expo Router stack/tab configurations, entry points
- Depends on: Zustand stores for auth state redirects
- Used by: All screens and tab-based navigation

**Screens:**
- Purpose: Full-screen UI for user interactions (home, journal, meetings, etc.)
- Location: `app/(app)/`, `app/(auth)/`, `app/(onboarding)/`, `app/(setup)/`
- Contains: React Native components, local hooks, TanStack React Query queries
- Depends on: Zustand stores, UI components, services
- Used by: Expo Router navigation

**State Management:**
- Purpose: Persist and synchronize global state (auth, progress tracking, daily checklist)
- Location: `store/` (auth.ts, progress.ts, checklist.ts)
- Contains: Zustand stores with async state mutations
- Depends on: Supabase client, secure storage (expo-secure-store)
- Used by: Screens and services for state queries/mutations

**Services:**
- Purpose: API calls, backend integrations, third-party SDKs
- Location: `services/` (supabase.ts, auth.ts, streamChat.ts, meetings.ts, journal.ts)
- Contains: Async functions for Supabase queries, Stream Chat connections, OAuth flows
- Depends on: Supabase client, Stream Chat SDK, expo-web-browser for OAuth
- Used by: Screens and stores

**Components:**
- Purpose: Reusable UI widgets and compound components
- Location: `components/ui/`, `components/sos/`
- Contains: Presentational components (buttons, modals, cards, progress indicators)
- Depends on: Design constants (colors, fonts), React Native
- Used by: Screens

**Constants:**
- Purpose: Centralized design tokens and configuration
- Location: `constants/` (colors.ts, fonts.ts, spacing.ts, stream.ts)
- Contains: Color palette, font family names, Stream API keys
- Depends on: Nothing
- Used by: All UI code

**Entry Point:**
- Purpose: Bootstrap the app, set up providers and root layout
- Location: `app/_layout.tsx`, `app/index.tsx`
- Contains: Root layout, TanStack QueryClient, error boundary, auth check redirect logic
- Depends on: All stores and services
- Used by: Expo entrypoint

## Data Flow

**Authentication Flow:**

1. App starts at `app/index.tsx` → calls `loadStoredAuth()` from auth store
2. Auth store reads session from Supabase (via secure storage adapter)
3. If authenticated, fetches user profile from `profiles` table
4. On successful profile fetch, sets `isAuthenticated: true` and `user` in store
5. All screens subscribe to `useAuthStore` and redirect based on `isAuthenticated` and `is_profile_complete`
6. Unauthenticated → `/(onboarding)/slide-1`, incomplete profile → `/(setup)/welcome`, authenticated → `/(app)/home`

**Check-In & Progress Tracking:**

1. User taps check-in on home screen or daily checklist
2. Screen calls `markTodayCheckedIn(userId, mood, notes)` from progress store
3. Store updates local `weeklyStreak` array and `checkInsCompleted` count
4. Store persists to Supabase `daily_checkins` table and secure storage
5. Progress store subscriptions in screens automatically re-render with new streak state

**Meeting Finder:**

1. Home screen requests location permission via `expo-location`
2. Once granted, calls `fetchNearbyMeetings(lat, lng)` from meetings service
3. Service queries Supabase with PostGIS distance calculation
4. Results cached in local screen state, displayed as card grid
5. User tap navigates to `/meetings` (full-screen meeting finder with filtering)

**Stream Chat Integration:**

1. On successful login, `setAuth()` from auth store calls `connectStreamChat(userId, userName, ...)`
2. Service fetches auth token from Supabase Edge Function (`/functions/v1/stream-token`)
3. Token used to connect Stream Chat client with user metadata
4. On logout, `disconnectStreamChat()` is called to clean up
5. Chat screens use `getStreamChatClient()` to access connected client

**State Management:**

- Zustand stores are initialized with default state and persisted to secure storage or Supabase
- Stores use `set()` and `get()` for immutable updates
- Optimistic updates (e.g., `updateUser`) revert on failure
- Background tasks (e.g., Stream Chat connection) do not block navigation

## Key Abstractions

**UserProfile Type:**
- Purpose: Represents authenticated user with profile completeness flag
- Examples: `services/auth.ts`, `store/auth.ts`
- Pattern: TypeScript type with nullable optional fields, validated in `is_profile_complete` gate

**ChecklistItem:**
- Purpose: Represents a daily task with toggle state
- Examples: `store/checklist.ts` (fellowship, sponsor contact, meditate, journal, meeting)
- Pattern: Simple object with `id`, `label`, `completed` boolean

**Meeting Type:**
- Purpose: Represents a 12-step meeting with location and time
- Examples: `services/meetings.ts`
- Pattern: Fetched from Supabase with PostGIS geo-distance filtering

**ErrorBoundary:**
- Purpose: Catches render errors and displays fallback UI with "Try Again" reset
- Examples: `components/ErrorBoundary.tsx`
- Pattern: React class component wrapping entire app in root layout

## Entry Points

**Root Entry (`app/_layout.tsx`):**
- Location: `app/_layout.tsx`
- Triggers: Expo app startup
- Responsibilities: Wraps entire app with providers (GestureHandlerRootView, SafeAreaProvider, QueryClientProvider, ErrorBoundary), defines root stack navigation

**Auth Check (`app/index.tsx`):**
- Location: `app/index.tsx`
- Triggers: On navigation to root `/`
- Responsibilities: Loads stored session, checks auth state, redirects to onboarding/setup/home based on `isAuthenticated` and profile completion

**App Tab Navigation (`app/(app)/_layout.tsx`):**
- Location: `app/(app)/_layout.tsx`
- Triggers: After user completes setup
- Responsibilities: Defines 4-tab layout with custom panic button in center, manages visible/hidden screens

**Auth Flow (`app/(auth)/_layout.tsx`):**
- Location: `app/(auth)/_layout.tsx`
- Triggers: Unauthenticated user
- Responsibilities: Stack navigation for sign-in, sign-up, password reset screens

**Onboarding (`app/(onboarding)/_layout.tsx`):**
- Location: `app/(onboarding)/_layout.tsx`
- Triggers: First-time app launch
- Responsibilities: Stack navigation for welcome slides and consent screens

**Setup (`app/(setup)/_layout.tsx`):**
- Location: `app/(setup)/_layout.tsx`
- Triggers: Authenticated but `is_profile_complete: false`
- Responsibilities: Stack navigation for profile setup (name, sobriety date, substance, etc.)

## Error Handling

**Strategy:** Three-tier approach — ErrorBoundary at root, try-catch in services, fallback UI in screens

**Patterns:**

- **Render errors**: ErrorBoundary at root catches throws during render and displays reset button
- **Async errors in screens**: try-catch in useEffect hooks with fallback state (loading, error states)
- **Service errors**: Services throw synchronously; callers catch and handle (e.g., auth service throws if sign-in fails)
- **Network errors**: Handled silently in non-critical paths (e.g., meeting fetch failure shows empty list), logged/caught in critical paths (auth)
- **Secure storage**: All secure store calls wrapped in try-catch; missing values default to null

**Examples:**
- `services/auth.ts` — throws on OAuth, sign-in, sign-up failures
- `app/(app)/home.tsx` — `catch {}` on location request and meeting fetch (non-critical UI only)
- `store/progress.ts` — failures in Supabase updates revert local state silently

## Cross-Cutting Concerns

**Logging:** No dedicated logging library; Sentry integration removed in v1.0.44 (caused startup crashes). Use `console.log` in development only.

**Validation:**
- Username availability checked via `authService.checkUsernameAvailable()`
- Profile completeness validated via `is_profile_complete` flag before app tab navigation
- Custom validation in onboarding/setup screens (e.g., email format, password strength)

**Authentication:**
- Session stored in Supabase-managed `exp-secure-store` (native Android/iOS secure storage)
- Supabase auto-refreshes tokens via `autoRefreshToken: true`
- OAuth flow: deep-link through expo-web-browser, parse fragment for tokens, set session
- Stream Chat auth: separate token fetched from Edge Function per connection

**Permissions:**
- Location: `expo-location` with user prompt and fallback (meetings show empty if denied)
- Camera: `expo-image-picker` with fallback (profile avatar upload optional)
- Vibration: `expo-haptics` for feedback (no permission needed)

**Styling:**
- No CSS-in-JS library; all styles defined as `StyleSheet.create()` objects
- Design tokens in `constants/colors.ts` and `constants/fonts.ts`
- Font loading: handled natively by expo-font plugin; no JS guards (causes crashes)
- Gradients: `expo-linear-gradient` for background and button effects

---

*Architecture analysis: 2025-03-15*
