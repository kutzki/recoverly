# Lessons Learned

## Build Automation

### LESSON: Always auto-trigger EAS build after every fix (2026-03-11)
**What happened:** Applied v1.0.34 fix, committed it, told the user to run `eas build` themselves. User had to explicitly ask why the build wasn't appearing on EAS dashboard.
**Rule:** After EVERY commit that changes app behavior, automatically run:
```bash
eas build --platform android --profile preview --non-interactive
```
Post the build URL in the response. Never wait for the user to ask.

---

## ANR / Startup Crashes

### LESSON: OverlayProvider must NOT live in the root layout (2026-03-11)
**What happened:** `OverlayProvider` from `stream-chat-react-native` was in `app/_layout.tsx`. It initializes Reanimated shared values and Stream i18n at mount time, racing with native module initialization and causing a 5-second ANR on cold start.
**Fix:** Move `OverlayProvider` to `app/(app)/_layout.tsx` so it only mounts after authentication.

### LESSON: StreamVideoClient must not initialize at app startup (2026-03-11)
**What happened:** `connectStreamServices()` in `store/auth.ts` was calling `initStreamVideo()` on every auth restore, loading `libwebrtc.so` synchronously via `PeerConnectionFactory.initialize()`.
**Fix:** Remove `initStreamVideo` from startup. Initialize `StreamVideoClient` lazily inside the call screen only.

### LESSON: newArchEnabled cannot be disabled with Reanimated v4 (2026-03-11)
**What happened:** Attempted to set `newArchEnabled: false` to fix ANR. Build fails with Gradle error from `react-native-reanimated` v4's `assertNewArchitectureEnabledTask`.
**Rule:** `newArchEnabled: true` is permanent as long as `react-native-reanimated` v4.x is in use.

---

## General

### LESSON: This app is Android-only (ongoing)
Never reference iOS builds, iOS bundles, App Store, or `--platform ios`. The `ios` block in `app.json` exists but is unused.
