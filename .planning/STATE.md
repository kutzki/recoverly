# Recoverly — Project State

## Current Milestone
**Milestone 1: Polish & Perfect Existing Screens**

## Current Phase
**Phase 1 — Dashboard Pixel Polish** (in progress — plan 02/02 complete)

## Decisions
- Removed `textTransform: 'capitalize'` from SobrietyCounter label entirely (cleaner than setting 'none')
- Used `dotCol` wrapper View per dot to decouple column gap (3px) from row gap (5px) in StreakDots
- CompanionFAB accepts bottomOffset prop (caller provides insets context) — keeps component reusable
- FAB placed after CheckInModal in JSX for correct z-order without explicit zIndex
- companion registered as hidden tab (href: null) — consistent with call/sos pattern in _layout.tsx

## Last Session
- Stopped at: Completed 01-dashboard-polish 01-01-PLAN.md
- 2026-03-15T05:59:54Z

## Phase Status

| Phase | Status | Notes |
|-------|--------|-------|
| 1 — Dashboard Polish | In progress | Plans 01-01, 01-02 complete |
| 2 — SOS Polish + Data | Not started | |
| 3 — Tracker | Not started | |
| 4 — Goals | Not started | |
| 5 — Profile | Not started | |
| 6 — Journal | Not started | |
| 7 — Companion Guided Flows | Not started | |
| 8 — AI Chat | Not started | |
| 9 — Messages | Not started | |
| 10 — Sober Pal | Not started | |

## Last EAS Build
- v2.0.6 — dashboard + meetings + journal placeholder + check-in modal
- Branch: `claude/hungry-elion`

## App Version
- Current: 2.0.6 (versionCode 20006)

## Key Context
- Android only, EAS builds only
- User tests on device, provides feedback
- No web preview tools ever
- Polish existing before building new
- AI companion = Claude API (JS-only SDK, new arch safe) + guided flows
- Companion entry = floating FAB on home screen
- AI context = name, days sober, substance, triggers, last 7 days mood
