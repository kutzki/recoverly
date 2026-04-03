# Technology Stack

**Analysis Date:** 2026-03-15

## Languages

**Primary:**
- TypeScript 5.9.2 - Full application codebase, strict mode enabled

**Secondary:**
- JavaScript - Babel configuration and build scripts

## Runtime

**Environment:**
- React Native 0.81.5 - Mobile application framework with New Architecture enabled
- Expo SDK 54 - Managed workflow for React Native
- Node.js - Development and build tooling

**Package Manager:**
- npm - Dependency management
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- React 19.1.0 - UI rendering and component framework
- Expo Router 6.0.23 - File-based routing and navigation
- Expo Managed Workflow - Build and deployment abstraction

**State Management:**
- Zustand 5.0.11 - Lightweight state store (see `store/auth.ts`, `store/checklist.ts`, `store/progress.ts`)
- React Query (@tanstack/react-query) 5.90.21 - Data fetching and caching with QueryClientProvider in `app/_layout.tsx`

**Navigation & UI:**
- React Native Screens 4.16.0 - Native navigation stacks
- React Native Gesture Handler 2.30.0 - Touch gesture recognition
- React Native Safe Area Context 5.6.0 - Safe area layout management
- React Native Reanimated 4.2.2 - Gesture animations (requires New Architecture)
- React Native Worklets 0.7.4 - Low-level animation utilities (requires New Architecture)
- Expo Linear Gradient 15.0.8 - Gradient backgrounds
- React Native SVG 15.12.1 - SVG rendering
- Expo Vector Icons 15.0.3 - Icon library

**Build/Dev:**
- Babel 7.26.0 with babel-preset-expo - JavaScript transpilation
- Metro Bundler - React Native bundler (configured through Expo)
- TypeScript - Static type checking

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.97.0 - PostgreSQL database and auth backend via Supabase
- stream-chat 9.35.1 - Real-time messaging SDK
- stream-chat-react-native 8.13.0 - React Native messaging UI components
- expo-secure-store 15.0.8 - Encrypted local storage for auth tokens

**Infrastructure:**
- expo-font 14.0.11 - Custom font loading (Poppins, Jost families)
- expo-image-picker 17.0.10 - Camera and media library access
- expo-haptics 15.0.8 - Vibration feedback
- expo-constants 18.0.13 - Build environment constants
- expo-status-bar 3.0.9 - Status bar styling
- expo-linking 8.0.11 - Deep linking support
- expo-build-properties 1.0.10 - Android/iOS native build config

**Testing/Dev:**
- ESLint 10.0.3 with @typescript-eslint plugins - Code linting
- Prettier 3.8.1 - Code formatting
- React Native Web 0.21.2 - Web fallback (unused in production)

## Configuration

**Environment:**
- Environment variables configured in `eas.json` per build profile:
  - Development profile: `APP_ENV=development`
  - Preview profile: `APP_ENV=preview`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_STREAM_API_KEY`, `EXPO_PUBLIC_STREAM_APP_ID`
  - Production profile: `APP_ENV=production`
- Public vars follow `EXPO_PUBLIC_*` prefix (set in `eas.json`, not `.env`)
- Secure token storage: `expo-secure-store` backing store configured in `services/supabase.ts`

**Build:**
- `app.json` - Expo/EAS configuration
  - New Architecture enabled: `newArchEnabled: true`
  - Android SDK: minSdkVersion 21
  - Permissions: INTERNET, VIBRATE, CAMERA
  - Font plugin configured for Poppins (400, 500, 600, 700) and Jost (400, 500)
  - Plugins: expo-router, expo-font, expo-secure-store, expo-image-picker
- `babel.config.js` - Babel preset for Expo
- `tsconfig.json` - TypeScript strict mode with path aliases (@/, @components/, @constants/, @services/, @store/, @hooks/)
- `.prettierrc` - Formatting rules (2-space indent, single quotes, trailing commas, 100 char width)
- `eslint.config.js` - Flat config with TypeScript, React, and React Hooks plugins

## Platform Requirements

**Development:**
- Node.js (npm)
- Android SDK or Expo Go app for preview
- EAS CLI for building

**Production:**
- Android 5.1+ (minSdkVersion 21)
- APK distributed internally via EAS build system
- EAS project ID: `2644895b-7c03-4fa4-8bf4-8240d2078ce8`

## New Architecture

**Enabled:** `newArchEnabled: true` in `app.json`

**Rationale:**
- React Native 0.81.5 requires New Architecture for TurboModules
- react-native-reanimated 4.2.2 enforces New Architecture (has `assertNewArchitectureEnabledTask`)
- react-native-worklets 0.7.4 enforces New Architecture

**Constraints:**
- All native dependencies must be TurboModules or old-arch ReactPackages compliant
- `@stream-io/react-native-webrtc` is old-arch only → stubbed (`services/streamVideo.ts`), removed from build
- `getstream` activity feed SDK compatibility unconfirmed → stubbed (`services/streamFeed.ts`)

---

*Stack analysis: 2026-03-15*
