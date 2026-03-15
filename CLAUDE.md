# Recoverly — Claude Instructions

## CRITICAL: No Web Preview Server

**NEVER run `expo start --web`, `preview_start`, or any dev server for verification.**

This is an **Android-only** app. The web preview ALWAYS shows a black screen because `expo-secure-store` is native-only and throws before any UI renders. Running the preview server opens unwanted CMD/Node.js windows and provides zero useful information.

**The only valid verification method is an EAS build installed on the user's physical Android device.** The user will test each build personally and provide feedback.

Do NOT use these tools for this project:
- `preview_start`
- `preview_screenshot`
- `preview_snapshot`
- `preview_console_logs`
- Any other `preview_*` tools

After code changes: commit, push, and if a build is needed trigger `eas build --platform android --profile preview --non-interactive` in the background.

## Platform

- **Android only** — no iOS, no web
- React Native / Expo SDK 54, managed workflow, `newArchEnabled: true`
- EAS builds (internal APK via `preview` profile)
- EAS project ID: `2644895b-7c03-4fa4-8bf4-8240d2078ce8`

## Design System

- **Poppins** (headings, buttons, card titles): `Fonts.poppinsBold`, `Fonts.poppinsSemiBold`, `Fonts.poppinsMedium`, `Fonts.poppins`
- **Jost** (body, captions, inputs): `Fonts.jost`, `Fonts.jostMedium`
- **Never use `fontWeight`** — always use named `fontFamily` from `Fonts.*`
- Primary color: `#b740ff` / `Colors.primary`
- All color constants in `constants/colors.ts`, font constants in `constants/fonts.ts`

## Development Workflow

- Work branch: `claude/hungry-elion` (git worktree)
- Commit and push after each meaningful change
- Trigger EAS builds only when a testable milestone is reached
- User tests on device and provides feedback — do not assume things work
- Do not run any local servers or previews
