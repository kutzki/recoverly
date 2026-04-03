# Codebase Structure

**Analysis Date:** 2026-03-15

## Directory Layout

```
recoverly/
├── app/                       # Expo Router file-based routing
│   ├── _layout.tsx            # Root provider wrapper (GestureHandler, SafeArea, QueryClient, ErrorBoundary)
│   ├── index.tsx              # Auth check & redirect (onboarding/setup/home)
│   ├── (onboarding)/          # Onboarding carousel (slides 1-3)
│   │   ├── _layout.tsx
│   │   ├── slide-1.tsx
│   │   ├── slide-2.tsx
│   │   └── slide-3.tsx
│   ├── (auth)/                # Sign in / Sign up
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (setup)/               # Post-signup profile setup (welcome → basic-info → goal → challenges → thank-you)
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx
│   │   ├── basic-info.tsx
│   │   ├── goal.tsx
│   │   ├── challenges.tsx
│   │   └── thank-you.tsx
│   └── (app)/                 # Main authenticated app (4-tab + panic button + modals)
│       ├── _layout.tsx        # Custom bottom tab bar (home, apps, favorites, profile + panic button)
│       ├── home.tsx           # Dashboard with sobriety counter, streak, quick actions
│       ├── apps.tsx           # Grid of feature apps (placeholders)
│       ├── favorites.tsx       # Favorite contacts / resources
│       ├── profile.tsx         # User profile view
│       ├── tracker.tsx         # Goal/achievement tracker (hidden from tab bar)
│       ├── goals.tsx           # Goal management (hidden from tab bar)
│       ├── edit-profile.tsx    # Profile editor (hidden from tab bar)
│       ├── messages.tsx        # Stream Chat message list (hidden from tab bar)
│       ├── find-users.tsx      # User discovery (hidden from tab bar)
│       ├── sober-pal.tsx       # Peer buddy system (hidden from tab bar)
│       ├── sponsor.tsx         # Sponsor info/contact (hidden from tab bar)
│       ├── inner-circle.tsx    # Emergency contacts (hidden from tab bar)
│       ├── meetings.tsx        # AA/NA meeting finder (hidden from tab bar)
│       ├── resource-hub.tsx    # Info resources (hidden from tab bar)
│       ├── crisis-history.tsx  # Past crisis responses (hidden from tab bar)
│       ├── settings.tsx        # App settings (hidden from tab bar)
│       ├── sos/                # Crisis support flow (Panic Button target)
│       │   ├── _layout.tsx
│       │   ├── index.tsx       # SOS menu (5 crisis categories)
│       │   ├── bad-day.tsx
│       │   ├── feel-like-using.tsx
│       │   ├── feeling-anxious.tsx
│       │   ├── just-relapsed.tsx
│       │   └── self-harm.tsx
│       ├── chat/               # Stream Chat conversation view
│       │   └── [cid].tsx
│       ├── user/               # User profile view (dynamic route)
│       │   └── [userId].tsx
│       └── call/               # Video calling (stub; coming soon)
│           └── [callId].tsx
├── components/                # Reusable UI components
│   ├── ErrorBoundary.tsx      # Error catch + recovery UI
│   ├── ui/                    # Design system components
│   │   ├── Button.tsx         # Variant: primary/outline/ghost/danger; size: sm/md/lg
│   │   ├── GradientBackground.tsx
│   │   ├── MilestoneCard.tsx  # Achievement badge
│   │   ├── SobrietyCounter.tsx # Days sober display
│   │   └── StreakDots.tsx     # Weekly check-in dots (Mon–Sun)
│   └── sos/                   # Crisis flow components
│       └── SOSResponseScreen.tsx
├── constants/                 # Design tokens
│   ├── colors.ts              # 90+ semantic + brand colors (Colors object)
│   ├── fonts.ts               # Font family names (Poppins/Jost + sizes)
│   ├── spacing.ts             # (unused; placeholder)
│   └── stream.ts              # Stream API keys + config
├── store/                     # Zustand state stores
│   ├── auth.ts                # Authentication + user profile state
│   ├── progress.ts            # Sobriety date, weekly streak, task/meeting counts
│   └── checklist.ts           # Daily checklist state
├── services/                  # Business logic + external API integration
│   ├── supabase.ts            # Supabase client initialization
│   ├── auth.ts                # AuthService: sign-up, sign-in, sign-out, get/update profile
│   ├── streamChat.ts          # Stream Chat connection/disconnection
│   ├── streamFeed.ts          # Stream Feed activities (stub; not used)
│   ├── streamVideo.ts         # Stream Video SDK (stub; removed to fix ANR)
│   └── journal.ts             # Journal entry service
├── assets/                    # Static resources
│   ├── fonts/                 # TTF font files (Poppins_*.ttf, Jost_*.ttf)
│   ├── images/                # PNG images
│   └── icon.png, splash-icon.png, adaptive-icon.png
├── app.json                   # Expo config (platform, plugins, build settings)
├── tsconfig.json              # TypeScript config with path aliases
├── package.json               # Dependencies + scripts
├── .planning/
│   └── codebase/              # Codebase documentation (this folder)
└── supabase/                  # Supabase schema files (local reference; not deployed from here)
```

## Directory Purposes

**`app/`:**
- Purpose: Expo Router file-based routing — each file/folder maps to a route
- Contains: Screen components (TSX), layout wrappers, groups for auth flows
- Key files: `_layout.tsx` (providers), `index.tsx` (auth check), `(app)/_layout.tsx` (tab bar)

**`app/(app)/`:**
- Purpose: Authenticated app screens (4-tab interface + modal/push screens)
- Contains: 20+ screen components for features (home, apps, profile, sos, tracker, etc.)
- Key files: `_layout.tsx` (custom bottom tab bar), `home.tsx` (dashboard), `sos/` (crisis flow)

**`components/`:**
- Purpose: Reusable UI components (buttons, cards, gradient overlays, error boundary)
- Contains: `ui/` (design system), `sos/` (crisis-specific components), `ErrorBoundary.tsx` (error catch)
- Key files: `ui/Button.tsx` (4 variants, 3 sizes with haptics), `ui/SobrietyCounter.tsx` (days display)

**`constants/`:**
- Purpose: Design tokens and configuration exported as single objects
- Contains: Colors (brand, semantic, surface), fonts (Poppins/Jost variants, sizes), stream config
- Key files: `colors.ts` (90+ colors), `fonts.ts` (font families + sizes)

**`store/`:**
- Purpose: Zustand state management (one file per domain)
- Contains: Auth state, progress tracking (sobriety, streaks, tasks, meetings), daily checklists
- Key files: `auth.ts` (user + token), `progress.ts` (days sober, weekly streak), `checklist.ts` (daily tasks)

**`services/`:**
- Purpose: Business logic + external API integration (Supabase, Stream.io)
- Contains: Auth service (sign-up, sign-in, profile CRUD), chat connection, feed activities
- Key files: `supabase.ts` (client init), `auth.ts` (AuthService object), `streamChat.ts` (connect/disconnect)

**`assets/`:**
- Purpose: Static resources (fonts, images, icons)
- Contains: TTF font files (Poppins 400/500/600/700, Jost 400/500), PNG images
- Key files: Fonts auto-loaded by expo-font plugin in app.json; images referenced in code

**`supabase/`:**
- Purpose: Database schema reference (not deployed; for developer reference)
- Contains: SQL schema definitions
- Generated: No; manually created for documentation

## Key File Locations

**Entry Points:**
- `app/_layout.tsx`: Root wrapper; initializes all providers (GestureHandler, SafeArea, QueryClient, ErrorBoundary)
- `app/index.tsx`: Auth check on app open; redirects to onboarding/setup/home

**Configuration:**
- `app.json`: Expo config (SDK 54, newArchEnabled, plugins for fonts/secure-store, EAS project ID)
- `tsconfig.json`: TypeScript strict mode, path aliases for `@components`, `@store`, `@services`, etc.
- `package.json`: Dependencies (React Native 0.81.5, Expo 54, Zustand, Supabase, Stream.io, TanStack Query)

**Core Logic:**
- `services/supabase.ts`: Supabase client with SecureStore persistence adapter
- `services/auth.ts`: Auth methods (sign-up, sign-in, get/update profile)
- `store/auth.ts`: Zustand auth store with `setAuth()`, `loadStoredAuth()`, `signOut()`
- `store/progress.ts`: Zustand progress store with `setSobrietyStart()`, `markTodayCheckedIn()`
- `app/(app)/_layout.tsx`: Custom bottom tab bar with 4 visible tabs + panic button

**Testing:**
- None yet; no test files present (`.test.ts`, `.spec.tsx`)

**Error Handling:**
- `components/ErrorBoundary.tsx`: React error boundary for render crashes
- `app/_layout.tsx`: Wraps entire app in ErrorBoundary

## Naming Conventions

**Files:**
- Screens: `lowercase-with-dashes.tsx` (e.g., `home.tsx`, `sign-in.tsx`, `edit-profile.tsx`)
- Components: `PascalCase.tsx` (e.g., `Button.tsx`, `SobrietyCounter.tsx`, `ErrorBoundary.tsx`)
- Services: `camelCase.ts` (e.g., `supabase.ts`, `streamChat.ts`, `auth.ts`)
- Stores: `camelCase.ts` (e.g., `auth.ts`, `progress.ts`, `checklist.ts`)
- Constants: `camelCase.ts` (e.g., `colors.ts`, `fonts.ts`, `spacing.ts`)

**Directories:**
- Route groups: `(lowercase-with-parens)` (e.g., `(app)`, `(auth)`, `(onboarding)`)
- Feature folders: `lowercase` (e.g., `components/ui/`, `components/sos/`)

**TypeScript & Functions:**
- Component names: `PascalCase` (e.g., `export default function HomeScreen() {}`)
- Type names: `PascalCase` (e.g., `type AuthState = { ... }`)
- Function names: `camelCase` (e.g., `loadStoredAuth`, `markTodayCheckedIn`)
- Variable names: `camelCase` (e.g., `user`, `sobrietyStartDate`, `isAuthenticated`)
- Zustand store hooks: `useStoreNameStore` (e.g., `useAuthStore`, `useProgressStore`)

## Where to Add New Code

**New Feature (e.g., Journal):**
- Primary code: `app/(app)/journal.tsx` (screen) + `services/journal.ts` (logic)
- State: `store/journal.ts` if state is needed (or embed in service)
- Tests: `__tests__/journal.test.tsx` (if/when tests are added)
- Style: Use `constants/colors.ts` and `constants/fonts.ts` for all colors/fonts

**New Component/Module:**
- Implementation: `components/ui/FeatureName.tsx` (UI) or `components/sos/FeatureName.tsx` (domain-specific)
- Export: Use named export: `export function FeatureName({ ... }) { ... }`
- Styling: Inline `StyleSheet.create({})` or external `.tsx` file
- Avoid: Do not use `fontWeight` — always use `fontFamily` from `Fonts.*`

**Utilities & Helpers:**
- Shared helpers: `utils/` directory (create if needed) or inline in services
- Date helpers: `utils/date.ts` (e.g., `weekStartISO()`, `todayDayIndex()`)
- Type definitions: `types/` directory or alongside store/service files

**Styles & Design Tokens:**
- Colors: Add to `constants/colors.ts` under appropriate section (brand, semantic, surfaces, etc.)
- Fonts: Add to `constants/fonts.ts` if new weight/variant needed
- Spacing: Use numeric values directly or add to `constants/spacing.ts` (currently unused placeholder)

**Icons:**
- Source: Use `@expo/vector-icons` (Ionicons, MaterialCommunityIcons available)
- Import: `import { Ionicons } from '@expo/vector-icons'`
- No custom icon fonts needed

## Special Directories

**`app/(onboarding)/`:**
- Purpose: Pre-auth carousel walkthrough (3 slides)
- Generated: No
- Committed: Yes
- Entry: Shown when `!isAuthenticated` in `app/index.tsx`
- Exit: Proceeds to `/(auth)/sign-in`

**`app/(auth)/`:**
- Purpose: Authentication screens (sign-in, sign-up)
- Generated: No
- Committed: Yes
- Entry: After onboarding or manual navigation
- Exit: On successful auth → `/(setup)/welcome` (incomplete profile) or `/(app)/home` (complete)

**`app/(setup)/`:**
- Purpose: Post-signup profile setup flow (5 screens)
- Generated: No
- Committed: Yes
- Entry: When `isAuthenticated && !user?.is_profile_complete`
- Exit: After completing all steps → `/(app)/home`

**`app/(app)/sos/`:**
- Purpose: Crisis support flow (5 response pathways)
- Generated: No
- Committed: Yes
- Entry: User taps Panic Button (center of tab bar)
- Exit: After response guidance, user may return to home or stay in sos flow

**`.env` (not committed):**
- Purpose: Local development environment variables
- Generated: Developer creates locally
- Committed: No (in `.gitignore`)
- Contents: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_STREAM_API_KEY`, `EXPO_PUBLIC_STREAM_APP_ID`
- Note: EAS build uses vars defined in `eas.json` profile env sections, not `.env`

**`assets/fonts/`:**
- Purpose: TTF font files for Poppins and Jost
- Generated: No (pre-downloaded)
- Committed: Yes
- Auto-loaded: By `expo-font` plugin (app.json)
- Naming: Must match `fontFamily` values in `constants/fonts.ts` (e.g., `Poppins_400Regular.ttf` → `Fonts.poppins`)

**`node_modules/`:**
- Purpose: Installed dependencies
- Generated: Yes (`npm install` or `yarn install`)
- Committed: No (in `.gitignore`)

**`dist/`:**
- Purpose: Web bundle output (not used; Android-only app)
- Generated: Yes (build artifact)
- Committed: No

---

*Structure analysis: 2026-03-15*
