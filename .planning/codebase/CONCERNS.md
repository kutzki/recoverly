# Codebase Concerns

**Analysis Date:** 2026-03-15

## Tech Debt

### Video Calling Disabled (Intentional but Stubbed)
- Issue: `@stream-io/react-native-webrtc` is an old-arch `ReactPackage` that causes 5-second ANR on app startup by loading `libwebrtc.so` synchronously before any JS runs. Version 1.0.40 removed the entire SDK to fix this.
- Files: `services/streamVideo.ts`, `app/(app)/call/[callId].tsx`
- Impact: Video calling completely disabled. Call screen shows "coming soon" placeholder.
- Fix approach: Monitor for WebRTC SDK update to TurboModule architecture (check for `codegenConfig`). Only re-add when confirmed compatible with React Native 0.81.5 and Reanimated v4.

### Activity Feeds Disabled (Getstream Package)
- Issue: `getstream` package not confirmed compatible with New Architecture (TurboModules). Disabled to avoid startup crashes.
- Files: `services/streamFeed.ts` (no-op stub with all functions returning empty arrays)
- Impact: Activity feeds, reactions, comments, notifications, and follow functionality all return empty stubs.
- Fix approach: Verify `getstream` package has proper `codegenConfig`. Do NOT add package back until compatibility confirmed.

### Missing Error Handling in Store Persistence
- Issue: `store/progress.ts` calls `SecureStore.setItemAsync()` without `await` in `incrementTasks()` and `incrementMeetings()` (lines 72, 77). If persistence fails, data loss occurs silently.
- Files: `store/progress.ts` (lines 70-78)
- Impact: Task and meeting counts may not persist across app restarts if storage fails.
- Fix approach: Add `await` to both calls and add try-catch with logging.

### JSON.parse Without Try-Catch in Store
- Issue: `store/checklist.ts` and `store/progress.ts` parse SecureStore values without error handling. Corrupted stored data crashes the app.
- Files: `store/checklist.ts` (line 44), `store/progress.ts` (line 85)
- Impact: If stored JSON is corrupted, parsing throws uncaught error → app crash before ErrorBoundary can catch.
- Fix approach: Wrap `JSON.parse()` in try-catch; if parsing fails, fall back to defaults and clear storage.

### Environment Variable Initialization Race Condition
- Issue: `services/supabase.ts` uses non-null assertion (`EXPO_PUBLIC_SUPABASE_URL!`, `EXPO_PUBLIC_SUPABASE_ANON_KEY!`). If build is missing these env vars in EAS build, the app crashes at module import time (before ErrorBoundary runs).
- Files: `services/supabase.ts` (lines 4-5)
- Impact: App crashes silently on startup if EAS `eas.json` env vars are not set. User sees black screen.
- Fix approach: Validate env vars at root layout before rendering. If missing, display error screen rather than crashing synchronously.

## Known Bugs

### Potential Data Loss in Check-In Flow
- Symptoms: If `markTodayCheckedIn()` succeeds locally but Supabase write fails, state updates but data is never persisted to server.
- Files: `store/progress.ts` (lines 53-68)
- Trigger: Check in successfully while offline; later the Supabase write fails silently (error not awaited or caught).
- Workaround: Users can manually sync by going to settings and re-triggering data load. But data loss risk exists during the sync window.

### Meeting API Response Parsing Assumes Flexible Schema
- Symptoms: If AA Intergroup API returns unexpected schema, `fetchNearbyMeetings()` silently returns empty array instead of surfacing the actual API error.
- Files: `services/meetings.ts` (lines 45-67)
- Trigger: API schema changes, server returns error, or network timeout (AbortSignal fires).
- Workaround: None — meetings just won't load. No error message displayed to user.

### Google OAuth Callback Parsing Fragile
- Symptoms: If WebBrowser returns success but URL is malformed (missing `access_token`), `signInWithGoogle()` returns `null` instead of throwing, leaving app in inconsistent state.
- Files: `services/auth.ts` (lines 56-84)
- Trigger: OAuth provider returns incomplete response; URL parsing fails to extract token.
- Workaround: User must retry sign-in. App does not display helpful error message.

## Security Considerations

### Supabase Anon Key Exposed in EAS Config
- Risk: `EXPO_PUBLIC_SUPABASE_ANON_KEY` and other public vars hardcoded in `eas.json` preview profile are embedded in APK. If APK is decompiled, keys are visible.
- Files: `eas.json` (lines 29-32)
- Current mitigation: Keys are read-only "anon" keys with RLS (Row Level Security) policies on backend. Limited damage if compromised.
- Recommendations:
  - Confirm Supabase RLS policies restrict anon key access appropriately (only allow read/write on user's own data).
  - Consider using custom auth token endpoint instead of embedding key in app.
  - Monitor Supabase logs for unusual API activity.

### Stream API Key Accessible from Constant
- Risk: `STREAM_API_KEY` is imported from public constant and logged in network requests.
- Files: `constants/stream.ts` (line 1)
- Current mitigation: Stream key is embedded in EAS config; RLS not available, but token exchange happens server-side in Supabase function.
- Recommendations: Verify Supabase `/functions/v1/stream-token` is properly authenticated and rate-limited.

### SecureStore Used for Non-Sensitive Data
- Risk: Checklist and progress state are stored in SecureStore but contain non-sensitive UI state. Takes up limited secure storage.
- Files: `store/checklist.ts`, `store/progress.ts`
- Current mitigation: Data is purely local UI state, not credentials.
- Recommendations: Not a security risk, but could move to regular async storage to preserve secure storage for actual secrets.

## Performance Bottlenecks

### Home Screen Location Permission on Every Mount
- Problem: Home screen calls `Location.requestForegroundPermissionsAsync()` and fetches nearby meetings on every mount. If user denies permission, app requests again every time they navigate to home.
- Files: `app/(app)/home.tsx` (lines 70-80)
- Cause: Location request is in `useEffect` with no caching of permission state.
- Improvement path: Cache permission request result; only re-request if user has not explicitly denied.

### No Pagination on App Grid or Lists
- Problem: All feature lists (home.tsx quick actions, apps.tsx grid, meetings list) load everything upfront. No lazy loading or virtual scrolling.
- Files: `app/(app)/home.tsx`, `app/(app)/apps.tsx`, multiple screens with static lists
- Cause: All items are static arrays. Meetings are capped at 30 (line 51 in `services/meetings.ts`) and loaded in parallel.
- Improvement path: Not critical now, but pagination will be needed if feature count grows beyond ~15 items.

### Meeting API Fetch Timeout Not Configurable
- Problem: Hard-coded 8-second timeout on meeting fetch (line 47, `services/meetings.ts`) may fail on slow networks but is not user-configurable.
- Files: `services/meetings.ts`
- Cause: Static timeout value.
- Improvement path: Not a bottleneck now, but monitor real-world usage. May need exponential backoff retry or user-configurable timeout.

## Fragile Areas

### Root Layout Font Loading Guard
- Files: `app/_layout.tsx` (lines 9-10)
- Why fragile: Critical comment warns against adding `useFonts()` or null-return guard. Fonts are loaded by native `expo-font` plugin. Adding wrong code here causes crashes or blank screens. This is easily broken by well-intentioned refactoring.
- Safe modification: Never touch font loading in this file. Keep comment intact. Any font changes must go through Figma constants → `expo-font` plugin in `app.json`.
- Test coverage: Fonts loaded natively; no unit tests. Only verified by EAS build on device.

### App Root Entry Point (App.tsx)
- Files: `App.tsx` (lines 1-20)
- Why fragile: This is a stub file that just renders a placeholder. The actual entry point is `index.ts` → `App.tsx` → `app/_layout.tsx` (via Expo Router). If `App.tsx` is modified, easy to break the routing setup.
- Safe modification: Do not modify. Expo Router uses file-based routing; this file is required by the framework but should remain a minimal wrapper.
- Test coverage: No tests. Only verified by EAS build.

### Authentication State Machine (useAuthStore)
- Files: `store/auth.ts` (entire file)
- Why fragile: Complex async state transitions with multiple edge cases:
  - `setAuth()` calls `connectStreamChat()` in fire-and-forget `.catch(() => {})` (line 32)
  - `signOut()` calls `disconnectStreamChat()` (line 49), but if Stream client is null, disconnect silently fails
  - `loadStoredAuth()` tries to restore session, but if getProfile() returns null, leaves app in undefined state (line 64)
- Safe modification: When updating auth flow, ensure every async operation has error handling. Never assume third-party clients are connected.
- Test coverage: No tests. Auth flow only validated by manual EAS build testing.

### Progress & Checklist Stores (Dual Local + Server Sync)
- Files: `store/progress.ts`, `store/checklist.ts`
- Why fragile: Two-phase load: local SecureStore first, then Supabase sync. If sync fails, local state may be stale. If local state is corrupted, sync may overwrite it.
- Safe modification: When adding new state properties, ensure:
  1. Local persistence includes the field
  2. Supabase schema has the column
  3. Sync logic updates both
  4. JSON.parse failures are caught
- Test coverage: No tests. State sync only validated by manual device testing.

### Supabase Service Initialization (No Fallback)
- Files: `services/supabase.ts`
- Why fragile: If env vars are missing, non-null assertions crash synchronously before ErrorBoundary. If Supabase client initialization fails, no retry logic.
- Safe modification: Wrap client creation in try-catch. Validate env vars at startup (in root layout or index.tsx).
- Test coverage: No tests. Only validated by EAS build. Missing env vars cause black screen; hard to debug.

## Scaling Limits

### Single Supabase Anon Key for All Users
- Current capacity: Unlimited concurrent users through single API key (limited by Supabase plan, not app code).
- Limit: If Supabase plan has rate limits or connection limits, single anon key has no per-user isolation.
- Scaling path: Implement custom auth token endpoint (similar to Stream token endpoint) to mint per-user limited-scope tokens. Requires backend.

### No Offline-First Sync
- Current capacity: App requires internet connection for most features (auth, data sync, meetings).
- Limit: Bad network = broken app experience.
- Scaling path: Implement offline queue for mutations (check-ins, profile updates). Use React Query's offline plugin or implement custom sync queue in Zustand.

### Location Permission Requests Not Cached
- Current capacity: Location permissions work, but user sees request dialog every visit to home screen if permission state not cached.
- Limit: Poor UX on slow devices or if user denies permission.
- Scaling path: Cache permission response in Zustand store or SecureStore. Only re-request if user hasn't explicitly denied.

## Dependencies at Risk

### Reanimated v4.2.2 + React Native 0.81.5 New Architecture Coupling
- Risk: Reanimated v4 enforces New Architecture via `assertNewArchitectureEnabledTask`. If Expo updates RN beyond 0.81.5 and breaks Reanimated v4, entire app must migrate to Reanimated v5 (or disable New Architecture, which is not possible here because worklets require it).
- Impact: Breaking dependency; can't easily update RN without coordinating Reanimated upgrade.
- Migration plan: Monitor Reanimated releases for v5. When ready, upgrade RN + Reanimated in lockstep. Test thoroughly on device (no web preview).

### Expo SDK 54 Locked in app.json
- Risk: SDK 54 will eventually go out of support. Future Expo CLI versions may drop support.
- Impact: Will need to upgrade to SDK 55+ eventually, which may break dependencies.
- Migration plan: Monitor Expo release notes. Schedule SDK upgrade quarterly. Test all native modules (secure-store, image-picker, location, etc.) after upgrade.

### Stream Chat v9.35.1 (No Video)
- Risk: Stream Chat React Native includes video calling in newer versions, but we removed the WebRTC SDK. If we ever re-add video, Stream Chat may pull in incompatible WebRTC.
- Impact: If version is bumped carelessly, ANR bug returns.
- Migration plan: Do not update Stream Chat without reviewing changelog for WebRTC changes. When re-adding video, use a dedicated modern WebRTC TurboModule, not legacy Stream SDK.

## Missing Critical Features

### No Error Boundary Fallback for Async Errors
- Problem: ErrorBoundary (component class) only catches synchronous render errors. Async errors in useEffect, API calls, state updates escape the boundary.
- Blocks: Users can't recover from network failures or Supabase errors without force-closing app.
- Implementation: Add global error handler in root layout; hook into `errorBoundary` from Navigation or use `UnhandledPromiseRejectionWarning` listener.

### No Retry Logic for Critical Async Operations
- Problem: Auth sign-in, profile fetch, meeting API, Supabase writes all fail silently or return null. No retry button or automatic backoff.
- Blocks: Transient network failures cause permanent data loss or broken state.
- Implementation: Wrap critical async operations in retry utility (exponential backoff, max 3 attempts). Surface errors to user if all retries fail.

### No Loading States for Async Data
- Problem: Some screens (home, apps, profile) fetch data but don't show loading indicator. User has no feedback that data is being fetched.
- Blocks: Users assume data loaded when it's still fetching.
- Implementation: Add `isLoading` state to each data-fetching screen. Display spinner or skeleton while loading.

### No Offline Detection
- Problem: App doesn't detect or display network status. If user goes offline, async operations fail silently.
- Blocks: Bad user experience on flaky networks.
- Implementation: Use `@react-native-community/hooks` or NetInfo to detect connectivity. Show banner when offline.

## Test Coverage Gaps

### No Unit Tests
- What's not tested: Auth service, meeting fetch, store state machines, environment validation.
- Files: All `services/*.ts`, `store/*.ts`
- Risk: Bugs in critical paths (auth, data sync) ship to production with no safety net.
- Priority: High — auth and store logic is fragile and untested.

### No Integration Tests for Auth Flow
- What's not tested: Full sign-up → sign-in → profile load → store hydration flow.
- Files: `services/auth.ts`, `store/auth.ts`, `app/index.tsx`
- Risk: Auth edge cases (missing env vars, Supabase down, corrupted stored session) only caught on manual device testing.
- Priority: High — auth is critical path.

### No E2E Tests
- What's not tested: Any screens, navigation, user interactions.
- Files: All app screens
- Risk: Visual regressions, navigation bugs, broken user flows ship undetected.
- Priority: Medium — E2E not setup yet, would require Detox or similar.

### No Tests for Store Persistence
- What's not tested: SecureStore read/write, data corruption recovery, sync logic.
- Files: `store/progress.ts`, `store/checklist.ts`
- Risk: Data loss bugs on app restart only caught by manual testing.
- Priority: High — data loss is unacceptable for a recovery app.

### No Meeting API Edge Cases Tested
- What's not tested: Malformed API response, timeout, empty results, parse errors.
- Files: `services/meetings.ts`
- Risk: If API schema changes, meetings silently fail to load.
- Priority: Medium — API failures are graceful (return empty array), but no error feedback.

---

*Concerns audit: 2026-03-15*
