# Codebase Structure

**Analysis Date:** 2025-03-15

## Directory Layout

```
recoverly/
├── app/                           # Expo Router root (file-system routes)
│   ├── _layout.tsx                # Root layout with providers and ErrorBoundary
│   ├── index.tsx                  # Auth check & redirect logic
│   ├── (auth)/                    # Sign-in, sign-up, password reset
│   ├── (onboarding)/              # Welcome slides and consent screens
│   ├── (setup)/                   # Profile setup flow (name, sobriety date, etc.)
│   └── (app)/                     # Main app with tabs and hidden screens
│       ├── _layout.tsx            # Tab navigation with custom panic button bar
│       ├── home.tsx               # Sobriety counter, streak, check-in, meetings
│       ├── apps.tsx               # App grid (checklist, resources, etc.)
│       ├── journal.tsx            # Daily journaling
│       ├── profile.tsx            # User profile view
│       ├── tracker.tsx            # Progress tracker (streaks, tasks, goals)
│       ├── goals.tsx              # Goal management
│       ├── meetings.tsx           # Meeting finder with filtering
│       ├── messages.tsx           # Chat screen list
│       ├── chat/[cid].tsx         # Individual chat conversation
│       ├── sos/                   # Panic button flow
│       │   ├── _layout.tsx        # Stack for crisis options
│       │   └── index.tsx          # Crisis options (hotlines, SOS contacts)
│       ├── call/[callId].tsx      # Video calling (placeholder)
│       ├── user/[userId].tsx      # User profile view
│       ├── sober-pal.tsx          # Accountability partner feature
│       ├── sponsor.tsx            # Sponsor contact screen
│       ├── inner-circle.tsx       # Emergency contacts
│       ├── edit-profile.tsx       # Profile editing
│       ├── find-users.tsx         # User discovery
│       ├── resource-hub.tsx       # External resources and links
│       ├── crisis-history.tsx     # Crisis event log
│       ├── settings.tsx           # App settings
│       └── favorites.tsx          # Bookmarks (hidden)
├── components/                    # Reusable UI components
│   ├── ErrorBoundary.tsx          # Root error boundary
│   ├── ui/                        # General-purpose components
│   │   ├── Button.tsx             # Primary button component
│   │   ├── CheckInModal.tsx       # Daily check-in modal dialog
│   │   ├── GradientBackground.tsx # Gradient background wrapper
│   │   ├── MilestoneCard.tsx      # Achievement milestone display
│   │   ├── SobrietyCounter.tsx    # Large sobriety day counter
│   │   └── StreakDots.tsx         # 7-day weekly streak visualizer
│   └── sos/                       # Crisis-specific components
├── constants/                     # Design tokens and configuration
│   ├── colors.ts                  # Color palette (primary, semantic, surfaces)
│   ├── fonts.ts                   # Font families (Poppins, Jost) and sizes
│   ├── spacing.ts                 # Spacing scale (padding, margins)
│   └── stream.ts                  # Stream Chat API key and channel types
├── services/                      # API clients and integrations
│   ├── supabase.ts                # Supabase client with secure store adapter
│   ├── auth.ts                    # Authentication (sign-in, sign-up, OAuth, profiles)
│   ├── streamChat.ts              # Stream Chat connection and user queries
│   ├── streamFeed.ts              # Activity feeds (stubbed, getstream removed)
│   ├── streamVideo.ts             # Video calling (stubbed, WebRTC removed in v1.0.40)
│   ├── meetings.ts                # Meeting finder with geo-distance queries
│   └── journal.ts                 # Journal entries
├── store/                         # Zustand global state
│   ├── auth.ts                    # Auth state (user, token, isAuthenticated)
│   ├── progress.ts                # Progress tracking (sobriety date, weekly streak, check-ins)
│   └── checklist.ts               # Daily checklist (fellowship, sponsor, meditate, etc.)
├── assets/                        # Static assets
│   ├── fonts/                     # Poppins and Jost TTF files
│   ├── images/                    # PNG/SVG graphics and logos
│   └── icon.png, splash-icon.png  # App icons
├── supabase/                      # Supabase migrations and types (generated)
├── .planning/                     # GSD planning documents (ignored in git)
├── package.json                   # Dependencies and scripts
├── app.json                       # Expo configuration
├── eas.json                       # EAS build profiles (env vars, secrets)
├── tsconfig.json                  # TypeScript configuration
├── .eslintrc                      # ESLint rules
├── .prettierrc                    # Prettier formatting
└── CLAUDE.md                      # Project-specific instructions
```

## Directory Purposes

**app/:**
- Purpose: Expo Router file-system routing — each directory or file maps to a route
- Contains: Screen components and layout configs (TSX files)
- Key files: `_layout.tsx` defines navigation structure; screen files are route handlers
- Note: Parenthesized directories `(auth)`, `(app)`, etc. are route groups (don't add to URL path)

**components/:**
- Purpose: Reusable UI building blocks
- Contains: React Native component files (pure presentational or compound components)
- Structure: `ui/` for general-purpose components, `sos/` for crisis-specific components
- Pattern: Each component is a `.tsx` file with StyleSheet, no barrel exports

**constants/:**
- Purpose: Centralized design tokens and configuration
- Contains: Color definitions, font aliases, spacing scales, API keys
- Usage: Imported in all screen and component files
- Pattern: Exported as named objects (e.g., `Colors.primary`, `Fonts.poppinsBold`)

**services/:**
- Purpose: Abstract API calls and external SDK interactions
- Contains: Async functions and client initialization
- Clients: Supabase (`supabase-js`), Stream Chat (`stream-chat`), Expo APIs
- Pattern: Stateless exported functions (no classes); state managed by stores
- Stubbed: `streamVideo.ts`, `streamFeed.ts` (do not re-add SDKs without major updates)

**store/:**
- Purpose: Global state with Zustand
- Contains: Three stores — auth (session, user), progress (sobriety tracking), checklist (daily tasks)
- Pattern: Each store is `create<StateType>((set, get) => ({...}))` with async mutations
- Persistence: Auth and progress use Supabase; checklist uses `expo-secure-store`

**assets/:**
- Purpose: Static media
- Contains: Fonts (TTF), images (PNG/SVG), icons
- Note: Fonts are loaded natively by expo-font plugin; no `useFonts()` in JS code

**supabase/:**
- Purpose: Database schema and migrations
- Contains: Auto-generated SQL files and TypeScript type definitions
- Note: Typically not modified manually; generated by Supabase CLI

**.planning/codebase/:**
- Purpose: GSD architecture analysis documents (created by `/gsd:map-codebase`)
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md
- Note: Gitignored; ephemeral, created per mapping session

## Key File Locations

**Entry Points:**
- `app/_layout.tsx` — Root layout with all providers (GestureHandler, SafeArea, QueryClient, ErrorBoundary)
- `app/index.tsx` — Auth check and redirect to onboarding/setup/home
- `app/(app)/_layout.tsx` — Tab navigation setup after authentication

**Authentication:**
- `services/auth.ts` — All auth logic (sign-in, sign-up, OAuth, session storage, profile management)
- `store/auth.ts` — Auth state store with `isAuthenticated`, `user`, `token`

**State & Progress:**
- `store/progress.ts` — Sobriety date, weekly streak tracking, check-ins
- `store/checklist.ts` — Daily checklist with daily reset logic
- `services/supabase.ts` — Supabase client with secure store adapter

**Navigation & Layouts:**
- `app/(app)/_layout.tsx` — 4-tab navigation with custom panic button
- `app/(auth)/_layout.tsx` — Auth stack (sign-in, sign-up, reset)
- `app/(setup)/_layout.tsx` — Profile setup flow
- `app/(onboarding)/_layout.tsx` — Welcome and consent screens

**Core Screens:**
- `app/(app)/home.tsx` — Main dashboard (sobriety counter, check-in, meetings)
- `app/(app)/journal.tsx` — Daily journaling
- `app/(app)/tracker.tsx` — Progress tracking
- `app/(app)/meetings.tsx` — Meeting finder with geo-distance filtering

**UI Components:**
- `components/ErrorBoundary.tsx` — Root error boundary
- `components/ui/SobrietyCounter.tsx` — Large counter display
- `components/ui/StreakDots.tsx` — Weekly 7-dot streak visualization
- `components/ui/CheckInModal.tsx` — Daily check-in dialog

**Design System:**
- `constants/colors.ts` — 70+ color definitions (brand, semantic, surfaces, overlays)
- `constants/fonts.ts` — Font family aliases and size scale
- `constants/spacing.ts` — Spacing constants
- `constants/stream.ts` — Stream Chat configuration

## Naming Conventions

**Files:**
- Screens: `camelCase.tsx` (e.g., `home.tsx`, `edit-profile.tsx`)
- Components: `PascalCase.tsx` (e.g., `Button.tsx`, `ErrorBoundary.tsx`)
- Services: `camelCase.ts` (e.g., `supabase.ts`, `streamChat.ts`)
- Stores: `camelCase.ts` (e.g., `auth.ts`, `progress.ts`)
- Constants: `camelCase.ts` (e.g., `colors.ts`, `fonts.ts`)

**Directories:**
- Route groups: `(groupName)` — parentheses prevent adding to URL
- Feature directories: kebab-case (e.g., `components/sos`, `app/(app)`)
- Deep folders: flat when possible; nested only for logical grouping (e.g., `app/(app)/chat/`)

**Variables & Functions:**
- Component props and state: camelCase (e.g., `isLoading`, `onPress`)
- Constants: UPPER_SNAKE_CASE (e.g., `STORAGE_KEY`, `DEFAULT_ITEMS`)
- Type/Interface names: PascalCase (e.g., `UserProfile`, `ChecklistItem`)

**Imports:**
- Absolute paths with no aliases (can add tsconfig `baseUrl` if needed)
- Path style: `import { Button } from '../../components/ui/Button'`

## Where to Add New Code

**New Screen:**
1. Create `app/(app)/feature-name.tsx` for tab-visible screens
2. Add to `Tabs.Screen` list in `app/(app)/_layout.tsx` (with `href: null` if hidden)
3. Import and use Zustand stores, services, and UI components
4. Wrap content in `<View>` with proper padding and safe area handling

**New UI Component:**
1. Create `components/ui/ComponentName.tsx`
2. Use StyleSheet for styles, export named function (not default)
3. Accept design tokens from `constants/colors.ts` and `constants/fonts.ts`
4. No barrel exports; import directly: `import { Button } from '../../components/ui/Button'`

**New Service/API:**
1. Create `services/serviceName.ts`
2. Export named async functions only
3. Import `supabase` from `services/supabase.ts` for DB queries
4. Throw errors on failure; callers handle with try-catch

**New Store:**
1. Create `store/featureName.ts`
2. Use Zustand `create<StateType>((set, get) => ({...}))`
3. Add async mutations for Supabase or secure storage
4. Export as `export const useFeatureStore = create(...)`
5. Hooks follow pattern: `const value = useFeatureStore((s) => s.property)`

**New Constants:**
1. Add to existing `constants/colors.ts`, `constants/fonts.ts`, etc.
2. Prefix with context if needed (e.g., `sosRed`, `cardTintBlue`)
3. Use in component styles: `color: Colors.primary`

**New Utility Function:**
1. Add to existing service if API-related
2. Otherwise create `utils/functionName.ts` (if directory doesn't exist, nest in `services/`)
3. Export named function, keep side-effects minimal

## Special Directories

**app/(app)/ — Main Tab Navigation:**
- Purpose: Routes for authenticated users with tab bar
- Generated: No (hand-written screens)
- Committed: Yes
- Pattern: Each `.tsx` file is a tab screen or hidden screen
- Visible tabs: home, apps, journal, profile (4 main tabs + panic button)
- Hidden screens: Accessed via router.push (e.g., `/(app)/meetings`, `/(app)/settings`)

**.planning/codebase/ — GSD Planning Documents:**
- Purpose: Architecture analysis (created by `/gsd:map-codebase`)
- Generated: Yes (written by GSD, not hand-written)
- Committed: No (in .gitignore)
- Purpose: Guides `/gsd:plan-phase` and `/gsd:execute-phase` on codebase patterns

**assets/fonts/ — Embedded Fonts:**
- Purpose: TTF font files for Poppins and Jost
- Generated: No (checked in)
- Committed: Yes
- Note: Loaded natively by expo-font plugin (app.json plugins); do NOT call `useFonts()` in JS

**supabase/ — Database Migrations:**
- Purpose: Schema versioning and generated types
- Generated: Partially (types auto-generated by Supabase CLI)
- Committed: Yes (migrations are version control)
- Note: Run `supabase migration diff` after schema changes

---

*Structure analysis: 2025-03-15*
