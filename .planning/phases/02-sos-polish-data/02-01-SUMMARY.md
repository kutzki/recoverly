---
phase: 02-sos-polish-data
plan: 01
subsystem: sos
tags: [data, supabase, crisis-incidents, navigation, ui-polish]
dependency_graph:
  requires: []
  provides: [crisis-incident-open-logging, cta-tap-logging, crisis-history-polished]
  affects: [components/sos/SOSResponseScreen.tsx, app/(app)/crisis-history.tsx]
tech_stack:
  added: []
  patterns: [useRef for async id tracking, fire-and-forget async logging, pill tag components]
key_files:
  created: []
  modified:
    - components/sos/SOSResponseScreen.tsx
    - app/(app)/sos/feel-like-using.tsx
    - app/(app)/sos/just-relapsed.tsx
    - app/(app)/sos/self-harm.tsx
    - app/(app)/sos/index.tsx
    - app/(app)/crisis-history.tsx
decisions:
  - incidentIdRef (useRef) used instead of useState to avoid re-renders on async DB write
  - logCTAAction is fire-and-forget (no await at call site) to avoid blocking CTA navigation
  - handleFinish simplified to Alert-only since row is already created on mount
metrics:
  duration: 3m
  completed: 2026-03-16
  tasks: 3
  files_modified: 6
---

# Phase 2 Plan 01: SOS Data Layer + Crisis History Polish Summary

**One-liner:** Crisis incident rows now created on SOS sub-screen open with CTA-tap appending to the same row; broken sponsor/meeting CTAs fixed; crisis history upgraded with gradient header, colored left-border cards, and pill-tag actions.

## What Was Built

### Task 1 — SOSResponseScreen: open-logging + CTA-tap logging (aa05b5b)

Rewrote the data layer in `SOSResponseScreen.tsx` without touching any UI:

- `incidentIdRef = useRef<string | null>(null)` stores the DB row id after async insert
- `useEffect` on mount calls `logOpen()` which inserts to `crisis_incidents` with `actions_completed: []` and stores returned `id` in the ref
- `logCTAAction(actionId)` reads existing `actions_completed`, appends the step id, and updates the row — all fire-and-forget
- CTA `onPress` now calls `logCTAAction(step.id)` before invoking `step.cta!.action()`
- `handleFinish` removed its `supabase.insert()` call — now only shows the Alert (row already exists)

### Task 2 — Sub-screen CTA + color fixes (3efae55)

Four targeted fixes across the SOS sub-screens:

- `feel-like-using.tsx`: `call_sponsor` CTA was a no-op `() => {}` — now calls `router.push('/(app)/sponsor')`
- `just-relapsed.tsx`: `meeting` CTA was `Linking.openURL('https://www.aa.org/find-aa')` — now calls `router.push('/(app)/meetings')`
- `self-harm.tsx`: `headerColor` was inline `"#FF3B30"` — now uses `Colors.sosRedBright`
- `sos/index.tsx`: `self_harm` option `color` was inline `'#FF3B30'` — now uses `Colors.sosRedBright`

### Task 3 — Crisis history: gradient header + polished cards (87ed45f)

Complete UI overhaul of `crisis-history.tsx` preserving the TanStack Query data layer:

- `LinearGradient` header with `Colors.primaryDark → Colors.primaryMid`, back arrow, title + subtitle
- `formatIncidentType()` formatter replaces `textTransform: capitalize` (e.g. "feel_like_using" → "Feel Like Using")
- `INCIDENT_COLORS` map applies colored `borderLeftWidth: 4` stripe per incident type
- `actions_completed` renders as horizontal pill tags (`Colors.primaryLight` background, `Colors.primary` text) instead of comma string
- Date shows full month/day/year + hour:minute via `toLocaleString()`

## Verification Results

| Check | Result |
|-------|--------|
| TypeScript (SOS files) | PASS — no new errors |
| No inline `#FF3B30` strings | PASS — grep returns nothing |
| No `aa.org` URL in just-relapsed | PASS — grep returns nothing |
| No no-op CTA in feel-like-using | PASS — grep returns nothing |
| `incidentIdRef` in SOSResponseScreen | PASS — 5 matches |

## Deviations from Plan

None — plan executed exactly as written.

## Commits

| Hash | Message |
|------|---------|
| aa05b5b | feat(02-01): move crisis logging to mount + wire CTA-tap action logging |
| 3efae55 | fix(02-01): fix broken CTAs + replace inline color strings in SOS sub-screens |
| 87ed45f | feat(02-01): polish crisis-history with gradient header, colored cards, and pill tags |
