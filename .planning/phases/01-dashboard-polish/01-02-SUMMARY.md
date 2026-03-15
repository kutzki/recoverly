---
phase: 01-dashboard-polish
plan: 02
subsystem: ui
tags: [react-native, sobriety-counter, streak-dots, figma-polish, typography]

# Dependency graph
requires: []
provides:
  - Lowercase 'days sober' arc label matching Figma spec in SobrietyCounter
  - Day abbreviation labels (M T W T F S S) below each streak dot in StreakDots
affects: [home-screen, dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns: [Fonts.poppins for small caption labels, Colors.textMuted for sublabels]

key-files:
  created: []
  modified:
    - components/ui/SobrietyCounter.tsx
    - components/ui/StreakDots.tsx

key-decisions:
  - "Removed textTransform: 'capitalize' entirely rather than replacing with 'none' — cleaner style object"
  - "Used dotCol wrapper View per dot to support gap between dot and label without affecting row-level gap"

patterns-established:
  - "Caption labels under icon/dot elements: Fonts.poppins fontSize 9, Colors.textMuted"

requirements-completed: [R1]

# Metrics
duration: 1min
completed: 2026-03-15
---

# Phase 1 Plan 02: Dashboard Label Polish Summary

**Lowercase arc label 'days sober' and M/T/W/T/F/S/S abbreviations below streak dots to match Figma node 0:1940**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-15T02:39:21Z
- **Completed:** 2026-03-15T02:40:34Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- SobrietyCounter now renders `days sober` (lowercase) with no textTransform — exact Figma casing
- StreakDots now renders M/T/W/T/F/S/S abbreviations below each dot column using Fonts.poppins 9px Colors.textMuted
- TypeScript check passes with no new errors (only pre-existing streamChat.ts errors unrelated to this plan)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix arc label casing in SobrietyCounter** - `5ece672` (fix)
2. **Task 2: Add day abbreviation labels to StreakDots** - `7bfdfec` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `components/ui/SobrietyCounter.tsx` - Label string changed to 'days sober', textTransform: 'capitalize' removed from label style
- `components/ui/StreakDots.tsx` - Fonts import + DAY_LABELS constant added, each dot wrapped in dotCol column View, dayLabel Text rendered below dot

## Decisions Made

- Removed `textTransform: 'capitalize'` entirely rather than setting it to `'none'` — results in a cleaner style object with only meaningful properties
- Used a `dotCol` wrapper View per dot rather than modifying the outer row gap, so the column gap (3px) between dot and label is independent of the row gap (5px) between dot columns

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- R1 (dashboard pixel polish) requirements satisfied — arc label casing and streak dot abbreviations both match Figma
- Home screen is now visually complete per Figma node 0:1940 spec

---
*Phase: 01-dashboard-polish*
*Completed: 2026-03-15*
