# Architecture

**Analysis Date:** 2026-03-15

## Pattern Overview

**Overall:** Expo Router-based mobile application with layered state management and service abstraction

**Key Characteristics:**
- File-system routing via Expo Router (6.0.23) with grouped layouts for auth flows
- Zustand for client-side state management (auth, progress tracking, checklists)
- Supabase backend for authentication, user profiles, and data persistence
- Reactive query management via TanStack React Query
- Native-first design with Android-only deployment (Expo SDK 54, React Native 0.81.5)

## Layers

**Presentation Layer:**
- Purpose: Render UI and handle user interactions
- Location: `app/(app)`, `app/(auth)`, `app/(onboarding)`, `app/(setup)`, `components/`
- Contains: Screen components (TSX files), UI component library, layout wrappers
- Depends on: Zustand stores, services, constants (colors, fonts)
- Used by: Expo Router navigation system

**State Management Layer:**
- Purpose: Persist and manage application state (auth, progress, checklists)
- Location: `store/auth.ts`, `store/progress.ts`, `store/checklist.ts`
- Contains: Zustand store definitions with getters and setters
- Depends on: Supabase client, SecureStore for encrypted persistence
- Used by: Presentation layer components via custom hooks

**Service Layer:**
- Purpose: Encapsulate external API calls and business logic
- Location: `services/`
- Contains: Supabase integration, authentication service, Stream.io chat/feed wrappers
- Depends on: Supabase client, Stream SDK clients
- Used by: Zustand stores and screen components

**Infrastructure Layer:**
- Purpose: Low-level integrations and configuration
- Location: `constants/`, `services/supabase.ts`, `app/_layout.tsx` (root setup)
- Contains: Color constants, font definitions, spacing values, Supabase client initialization
- Depends on: Third-party libraries (expo-*, stream-*, supabase)
- Used by: All higher layers

## Data Flow

**Authentication Flow:**

1. User opens app → `app/index.tsx` mounts
2. `useAuthStore.loadStoredAuth()` reads session from SecureStore (via Supabase adapter)
3. If session exists, fetch user profile from `profiles` table
4. `useAuthStore.setAuth()` populates auth state and triggers `connectStreamChat()` (background)
5. Redirect to `/(app)/home` (authenticated) or `/(onboarding)/slide-1` (unauthenticated)

**Progress Tracking Flow:**

1. User marks daily check-in on home screen → `useProgressStore.markTodayCheckedIn()`
2. State updates locally: `weeklyStreak[todayIdx] = true`, `checkInsCompleted++`
3. Async call to `supabase.from('daily_checkins').upsert()` persists to DB
4. State persists to SecureStore via `_persist(get())`
5. Weekly reset logic in `loadProgress()` detects new week and resets counters

**Navigation Flow:**

1. Root layout (`app/_layout.tsx`) wraps app in providers: GestureHandlerRootView, SafeAreaProvider, QueryClientProvider, ErrorBoundary
2. Stack.Screen defines grouped routes: (onboarding), (auth), (setup), (app)
3. App group (`app/(app)/_layout.tsx`) defines bottom tab bar with 4 visible tabs + panic button
4. Tab navigation via custom `CustomTabBar` component; non-tab screens marked `href: null` and accessed via `router.push()`
5. Error boundary catches crashes and displays recovery UI

**State Management:**

- Zustand stores hold single source of truth per domain (auth, progress, checklist)
- Stores auto-save to SecureStore on mutation
- React Query caches server-side data (future use — currently minimal queries)
- No Redux or context API — state is accessed directly from stores via hooks

## Key Abstractions

**Zustand Stores:**
- Purpose: Decoupled state with async side effects
- Examples: `store/auth.ts`, `store/progress.ts`, `store/checklist.ts`
- Pattern: `const useAuthStore = create<AuthState>((set, get) => ({ ... }))`; accessed via `useAuthStore((s) => s.field)` selectors

**Service Objects:**
- Purpose: Encapsulate business logic and external API calls
- Examples: `services/auth.ts`, `services/supabase.ts`, `services/streamChat.ts`
- Pattern: Export object with async methods (e.g., `authService.signUp()`, `authService.getProfile()`)

**Constants Module:**
- Purpose: Single source of truth for design tokens
- Examples: `constants/colors.ts` (100+ semantic/brand colors), `constants/fonts.ts` (Poppins/Jost variants)
- Pattern: Export flat object (`Colors`, `Fonts`, `FontSizes`) imported by all components

**Custom Hooks (React):**
- Purpose: Encapsulate Zustand selector logic or component-specific state
- Examples: Not yet extracted; screens directly call `useAuthStore((s) => s.field)`
- Pattern: Could be created in `hooks/` for repeated patterns

## Entry Points

**App Root:**
- Location: `app/_layout.tsx`
- Triggers: Expo Router initialization
- Responsibilities: Wrap entire app in providers (GestureHandler, SafeAreaProvider, QueryClient, ErrorBoundary); define root stack with grouped screens

**Auth Check:**
- Location: `app/index.tsx`
- Triggers: After root layout renders
- Responsibilities: Load stored session, check auth state, redirect to onboarding/setup/home

**App Tab Wrapper:**
- Location: `app/(app)/_layout.tsx`
- Triggers: When user navigates to `/(app)/*` (authenticated + profile complete)
- Responsibilities: Define 4-tab + panic-button bottom navigation; manage tab state

**SOS Entry:**
- Location: `app/(app)/sos/index.tsx` (crisis menu)
- Triggers: User taps Panic Button or navigates to `/(app)/sos`
- Responsibilities: Display 5 crisis categories; route to sub-flows (bad-day, feel-like-using, etc.)

## Error Handling

**Strategy:** React Error Boundary at root; async try-catch in services and stores

**Patterns:**
- `ErrorBoundary` component (`components/ErrorBoundary.tsx`) catches render errors and displays recovery UI
- Service methods throw exceptions on failure; stores catch and either revert state or propagate
- Sign-in/sign-up screens handle errors inline and display validation messages
- No global error toast or logger yet — errors logged to console or silently caught

## Cross-Cutting Concerns

**Logging:**
- Strategy: None currently; errors silently caught or logged to console
- No Sentry or external logging (previously attempted in v1.0.41–1.0.44, caused startup crashes)

**Validation:**
- Email/password validation on sign-up/sign-in screens (string length, email format)
- Supabase auth layer validates credentials server-side
- Profile data validated on update via schema (nullable fields)

**Authentication:**
- Supabase Auth (email/password, JWT)
- Session persisted to SecureStore via custom adapter (`services/supabase.ts`)
- Auto-refresh on expiry via `autoRefreshToken: true`
- Stream Chat connected in background after auth with user ID + metadata (name, sobriety days, avatar)

**Haptics & Feedback:**
- Button presses trigger `expo-haptics` light impact feedback
- No loading spinners — buttons show disabled state while async operations complete

---

*Architecture analysis: 2026-03-15*
