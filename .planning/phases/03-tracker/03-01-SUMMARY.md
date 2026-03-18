---
phase: 03-tracker
plan: 01
subsystem: ui
tags: [zustand, supabase, expo-secure-store, expo-haptics, expo-linear-gradient, calendar, milestone]

# Dependency graph
requires:
  - phase: 02-sos-polish-data
    provides: store/progress.ts with markTodayCheckedIn writing to daily_checkins
provides:
  - CalendarGrid component driven by Set<string> of ISO check-in dates
  - CelebrationModal with SecureStore-persisted one-shot milestone tracking
  - loadAllHistory action on useProgressStore for all-time check-in history
  - Tracker screen wired to real Supabase data with history calendar and celebration modal
affects: [04-goals, 05-profile]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Lazy loadAllHistory action called only from tracker screen on mount — not at app boot"
    - "checkinHistory excluded from SecureStore persist — always loaded fresh from Supabase"
    - "CelebrationModal persists [userId, milestoneDay] tuples to distinguish multi-account celebrations"
    - "CalendarGrid is purely presentational — receives Set<string> from parent, no Supabase dependency"

key-files:
  created:
    - components/ui/CalendarGrid.tsx
    - components/ui/CelebrationModal.tsx
  modified:
    - store/progress.ts
    - app/(app)/tracker.tsx

key-decisions:
  - "checkinHistory excluded from _persist — loaded fresh on every tracker mount to avoid staleness"
  - "CelebrationModal fires on highest uncelebrated milestone, not all uncelebrated — avoids stacking modals"
  - "CalendarGrid uses Mon-first layout via offset = (firstDay + 6) % 7 conversion from JS Sun-first"
  - "Tooltip rendered inline below grid (not Modal) — simpler, avoids overlay dismissal complexity"
  - "loadAllHistory silently fails on Supabase error — screen degrades gracefully with empty calendar"

patterns-established:
  - "Lazy data loading: screen-specific actions called in useEffect on mount, not in global loadProgress"
  - "Pure presentational components receive derived data (Set) from parent — no direct Supabase calls in UI components"

requirements-completed: [R3]

# Metrics
duration: 3min
completed: 2026-03-18
---

# Phase 3 Plan 01: Tracker History and Celebrations Summary

**Monthly calendar grid of real Supabase check-in history with tappable inline tooltip and one-shot SecureStore-persisted milestone celebrations at 7/30/60/90/180/365 days sober**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-18T00:21:09Z
- **Completed:** 2026-03-18T00:24:08Z
- **Tasks:** 4
- **Files modified:** 4

## Accomplishments

- Extended `useProgressStore` with `checkinHistory: string[]` and `loadAllHistory(userId)` action that queries all-time `daily_checkins` from Supabase without polluting the weekly-focused `loadProgress` boot path
- Built `CalendarGrid` — pure-JS 7-column Mon-first monthly calendar with month nav arrows, purple dots on checked days, and inline tap-to-reveal date tooltip
- Built `CelebrationModal` — fires exactly once per milestone per user account using `[userId, milestoneDay]` tuples in SecureStore, gradient header with emoji + label, haptic feedback on show
- Wired `tracker.tsx` to call `loadAllHistory` on mount, pass history as a Set to `CalendarGrid`, and render `CelebrationModal` — all existing content preserved

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend progress store with all-time check-in history** - `7708a24` (feat)
2. **Task 2: Build CalendarGrid component** - `eee1b85` (feat)
3. **Task 3: Build CelebrationModal component** - `ec5ca45` (feat)
4. **Task 4: Wire tracker.tsx with history and celebration** - `620bc15` (feat)

## Files Created/Modified

- `store/progress.ts` - Added `checkinHistory: string[]` field, `loadAllHistory(userId)` action; `_persist` unchanged and excludes checkinHistory
- `components/ui/CalendarGrid.tsx` - New: pure-JS monthly calendar grid, month nav, dot markers, inline tooltip
- `components/ui/CelebrationModal.tsx` - New: one-shot milestone modal with LinearGradient header, SecureStore persistence, expo-haptics feedback
- `app/(app)/tracker.tsx` - Added useEffect for loadAllHistory, checkedDates memo, CalendarGrid block, CelebrationModal mount

## Decisions Made

- `checkinHistory` excluded from `_persist` — always loaded fresh from Supabase on tracker mount to avoid serving stale data from SecureStore
- `CelebrationModal` fires on the highest uncelebrated milestone (not all of them) — avoids modal stacking if user skips multiple milestones between app opens
- CalendarGrid uses Mon-first layout via `offset = (firstDay + 6) % 7` — converts JS's Sun=0 weekday to Mon=0 grid start
- Tooltip is rendered inline (not as a Modal) — simpler, avoids overlay dismissal and z-index issues
- `loadAllHistory` silently swallows Supabase errors — screen degrades gracefully with an empty calendar rather than crashing

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

Pre-existing TypeScript errors in `services/streamChat.ts` (two unrelated type errors on `UserResponse` and filter operator types) were present before these changes and are out of scope. All new files compile clean when those pre-existing errors are excluded.

## User Setup Required

The Wave 0 SQL must be run in Supabase before testing on device:

```sql
ALTER TABLE public.daily_checkins
  ADD COLUMN IF NOT EXISTS mood  smallint,
  ADD COLUMN IF NOT EXISTS notes text;

CREATE POLICY IF NOT EXISTS "Users can update own checkins"
  ON public.daily_checkins FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

This was specified in the plan as a human setup step. Claude does not have Supabase dashboard access.

## Next Phase Readiness

- Tracker screen is fully data-driven — ready for user testing via EAS build
- CalendarGrid and CelebrationModal are standalone reusable components
- Phase 4 (Goals) can begin independently — no blocking dependencies from this plan

## Self-Check: PASSED

- store/progress.ts: FOUND
- components/ui/CalendarGrid.tsx: FOUND
- components/ui/CelebrationModal.tsx: FOUND
- app/(app)/tracker.tsx: FOUND
- .planning/phases/03-tracker/03-01-SUMMARY.md: FOUND
- Commit 7708a24: FOUND
- Commit eee1b85: FOUND
- Commit ec5ca45: FOUND
- Commit 620bc15: FOUND

---
*Phase: 03-tracker*
*Completed: 2026-03-18*
