# Technology Stack

**Analysis Date:** 2026-03-15

## Languages

**Primary:**
- TypeScript 5.9.2 - All source code, strict mode enabled
- JavaScript - Babel configuration, tooling scripts

**Secondary:**
- SQL - Supabase database schema and migrations (`.sql` files in `supabase/`)

## Runtime

**Environment:**
- React Native 0.81.5 with New Architecture enabled (`newArchEnabled: true`)
- Expo SDK 54.0.33 (managed workflow)
- Node.js (for local development and EAS builds)

**Package Manager:**
- npm (lockfile: `package-lock.json` present)

## Frameworks

**Core:**
- Expo Router 6.0.23 - File-based routing for navigation between `(auth)`, `(app)`, `(onboarding)`, `(setup)` layout groups
- React 19.1.0 - UI framework
- React Native 0.81.5 - Cross-platform mobile framework

**State Management:**
- Zustand 5.0.11 - Client state management; store files in `store/` (`auth.ts`, `checklist.ts`, `progress.ts`)

**Data Fetching & Caching:**
- TanStack React Query 5.90.21 - Server state and caching; used in screens like `goals.tsx`, `find-users.tsx`, `crisis-history.tsx`
- Default query options: `retry: 2`, `staleTime: 300000ms` (5 minutes) - configured in `app/_layout.tsx`

**UI & Animation:**
- React Native Gesture Handler 2.30.0 - Touch handling and gesture support
- React Native Reanimated 4.2.2 - Animations and worklets; enforces New Architecture
- React Native Worklets 0.7.4 - WebAssembly worklets; enforces New Architecture
- Expo Linear Gradient 15.0.8 - Gradient backgrounds

**Navigation & Routing:**
- Expo Router 6.0.23 - File-based routing, typed routes (`typedRoutes: true` in `app.json`)
- React Native Safe Area Context 5.6.0 - Safe area insets on notched devices
- React Native Screens 4.16.0 - Native screen containers for performance

**Styling:**
- React Native StyleSheet - Native style API (no CSS-in-JS framework)

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.97.0 - Backend database, auth, and API client; core integration point
- `stream-chat` 9.35.1 - Chat/messaging SDK
- `stream-chat-react-native` 8.13.0 - React Native chat UI components
- `react-native-reanimated` 4.2.2 - Required for New Architecture compatibility; `assertNewArchitectureEnabledTask` enforces new arch
- `react-native-worklets` 0.7.4 - Required for New Architecture; `assertNewArchitectureEnabledTask` enforces new arch

**Expo Modules (Native & JavaScript):**
- `expo-secure-store` 15.0.8 - Secure token/session storage via native keychain; used in `services/supabase.ts` and `store/auth.ts`
- `expo-font` 14.0.11 - Font loading (Poppins, Jost); configured via plugin in `app.json`
- `expo-location` 19.0.8 - Location permissions and geolocation; used in meetings finder
- `expo-image-picker` 17.0.10 - Photo library and camera access
- `expo-web-browser` 15.0.10 - OAuth callback handling for Google sign-in
- `expo-haptics` 15.0.8 - Haptic feedback (vibration, impacts)
- `expo-linear-gradient` 15.0.8 - Gradient UI components
- `expo-constants` 18.0.13 - App constants and manifest data
- `expo-linking` 8.0.11 - Deep linking and URL parsing
- `expo-status-bar` 3.0.9 - Status bar styling
- `expo-vector-icons` 15.0.3 - Material Design icons via AntDesign, FontAwesome, etc.

**Build & Development:**
- `expo-build-properties` 1.0.10 - Gradle/build.properties configuration for native modules
- Babel 7.26.0 with `babel-preset-expo` 54.0.10 - JavaScript transpilation
- TypeScript 5.9.2 - Type checking
- ESLint 10.0.3 with `@typescript-eslint/eslint-plugin` 8.57.0 - Code linting
- Prettier 3.8.1 - Code formatting

**Testing & Quality:**
- `react-native-svg` 15.12.1 - SVG rendering in UI components

**Stub/Removed:**
- Video calling SDK (`@stream-io/react-native-webrtc`) - Removed in v1.0.40 due to ANR (ANR caused by old-arch `ReactPackage`; `libwebrtc.so` loads synchronously on main thread at startup). See `services/streamVideo.ts` stub.
- Activity feed SDK (`getstream` package) - Disabled; see `services/streamFeed.ts` stub.

## Configuration

**Environment Variables:**
- Loaded from `.env` locally (gitignored)
- EAS build profiles override with `env` section in `eas.json`:
  - `preview` profile: embedded credentials for testing
  - `development` profile: local credentials
  - `production` profile: production credentials (not yet configured with values)

**Required Public Env Vars** (exposed to client, prefixed `EXPO_PUBLIC_`):
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous API key
- `EXPO_PUBLIC_STREAM_API_KEY` - Stream Chat API key
- `EXPO_PUBLIC_STREAM_APP_ID` - Stream Chat app ID

**Build Configuration:**
- `eas.json` - EAS build profiles (development, preview, production)
- `app.json` - Expo app manifest with:
  - Plugin configurations for fonts, location, secure store, image picker, web browser
  - Android package name: `com.recoverly.app`
  - Android permissions: `INTERNET`, `VIBRATE`, `CAMERA`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`
  - EAS project ID: `2644895b-7c03-4fa4-8bf4-8240d2078ce8`
- `tsconfig.json` - TypeScript strict mode, path aliases (`@/*`, `@components/*`, `@services/*`, etc.)
- `.prettierrc` - Code formatting (Prettier)
- `eslint.config.js` - Code linting rules

## Platform Requirements

**Development:**
- Node.js with npm
- EAS CLI (v14+) for building Android APKs
- Android SDK (via Android Studio or CLI) — **iOS builds are not maintained**
- Physical Android device for testing (web preview is not functional due to `expo-secure-store` being native-only)

**Production:**
- Android 5.0+ (API 21+) assumed based on Expo SDK 54
- Built via EAS and distributed as APK (for internal testing) or app-bundle (for Play Store)
- Deployment target: Google Play Store (internal testing via `preview` profile; Play Store via `production` profile)

---

*Stack analysis: 2026-03-15*
