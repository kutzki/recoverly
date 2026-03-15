# Recoverly — Project Context

## Product Vision

Recoverly is a **sober companion app for addiction recovery** — Android-only, React Native / Expo SDK 54.

The single most important thing a user must be able to do: **open the app during a hard moment and get real help immediately.** That help is:
1. Conversational — an AI companion that talks them through it
2. Human routing — connect to sponsor, inner circle, meetings, crisis lines
3. Action-oriented — something to do right now (breathe, journal, distraction)

## Core User

Someone in addiction recovery (AA/NA or self-directed). They open the app when:
- They feel an urge to use
- They're anxious, lonely, or triggered
- They need accountability or to check in
- They want to track their progress and feel pride in it

## The Sober Companion

The defining feature of Recoverly. A **hybrid companion**:
- **Guided quick-actions** for when the user can't think straight — tap how you feel → get a relevant coping sequence
- **AI chat (Claude API)** for when they want to talk it through — real conversational AI that knows them

The AI companion is personalized with:
- User's name + sobriety date (days sober in context)
- Substance they're recovering from + their stated triggers
- Recent mood + check-in history (last 7 days)

**Entry point:** Floating action button on the home screen — always one tap away, never buried.

## App Screens (current state)

| Screen | Status |
|--------|--------|
| Home / Dashboard | Built, needs Figma polish |
| Onboarding (slides 1–3) | Built |
| Auth (sign-in, sign-up, Google OAuth) | Built |
| Setup flow (name, goals, challenges) | Built |
| SOS / Crisis (5 sub-screens) | Built |
| Tracker | Built, needs polish |
| Goals | Built, needs polish |
| Profile / Edit Profile | Built, needs polish |
| Meetings (AA/NA finder) | Built |
| Journal | Placeholder only |
| Messages / Chat | Stub |
| Inner Circle / Sponsor | Built |
| Settings | Built |
| Sober Companion (AI) | Not started |

## Stack

- React Native 0.81.5 + Expo SDK 54, managed workflow
- New Architecture (`newArchEnabled: true`) — required
- expo-router v6 (file-based routing)
- Zustand v5 (state), Supabase v2 (backend)
- EAS builds — internal APK, Android only
- No web preview ever — black screen due to expo-secure-store

## Design System

- **Figma file:** `uVW028XTHA5DcuJh8DjcNs`
- **Fonts:** Poppins (headings/buttons) + Jost (body/captions)
- **Primary:** `#b740ff` (Colors.primary)
- **Rule:** Never use `fontWeight` — always named `fontFamily` from `Fonts.*`

## Priority Order

Polish existing screens to Figma-perfect first, then build the companion:
1. Dashboard (home screen) — pixel-perfect Figma match
2. SOS / Crisis screens — polish + data logging
3. Tracker — real data from Supabase
4. Goals — CRUD + progress tracking
5. Profile — complete, polished
6. Journal — full feature (mood, prompts, entries)
7. **Sober Companion** — AI chat + guided flows (the centerpiece)
8. Messages / Chat — Stream Chat integration
9. Social / Sober Pal — matching system

## Crash-Prevention Rules (non-negotiable)

1. No `useFonts` + `return null` guard — fonts load natively via app.json plugin
2. No `@expo-google-fonts` packages — copy TTF to `assets/fonts/` only
3. Vet all new native deps for `codegenConfig` before adding
4. Root `_layout.tsx` stays minimal — no async ops, no conditional renders
5. No web preview tools — EVER
