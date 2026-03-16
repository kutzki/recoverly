# Phase 3: Tracker - Research

**Researched:** 2026-03-16
**Domain:** React Native data-driven progress screen — Supabase history queries, milestone detection, check-in calendar/list
**Confidence:** HIGH

---

## Summary

The tracker screen (`app/(app)/tracker.tsx`) is not a placeholder — it is a partially-built, working screen. It already renders `SobrietyCounter`, `StreakDots`, a stats row, and `MilestoneCard`. All three components exist and work. The screen reads from `useProgressStore`, which syncs `sobrietyStartDate` and this week's check-ins from Supabase on load. The core gap is that the screen only shows *this week's* streak and static lifetime stats — it does not show full check-in history, does not fetch all-time check-ins, and milestone detection is passive (badges shown but no celebration modal/card triggers).

The `daily_checkins` table schema (schema.sql) has only `id`, `user_id`, `checked_in_date`, `created_at`. The `mood` and `notes` columns that `progress.ts` writes conditionally are **not declared in any schema file** — they either exist as undocumented live columns or will fail silently. A schema migration is needed to add them formally. The check-in history feature needs a separate Supabase query (all-time, not just this week) and a pure-JS calendar or list built with React Native primitives — no new native packages are acceptable.

**Primary recommendation:** Extend `loadProgress` to also fetch all-time check-in dates into a new store slice, add a `CelebrationModal` that fires when a milestone is first crossed, and build a scroll-based month calendar using pure `View`/`Text` grids — no calendar library needed.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| R3-1 | Weekly streak visual matches check-ins in `daily_checkins` | `loadProgress` already builds `weeklyStreak` from DB; StreakDots component exists and works |
| R3-2 | Days sober count is live and accurate | `sobrietyStartDate` synced from `profiles.sobriety_start_date`; `daysSober` computed via `useMemo` in tracker.tsx |
| R3-3 | Check-in history: calendar or list view, tappable days | Requires new Supabase query for all-time dates + pure-JS grid calendar component |
| R3-4 | Milestone detection: 7, 30, 60, 90, 180, 365 days — celebration card | `MilestoneCard` shows passive badges; needs active `CelebrationModal` that fires once per milestone |
</phase_requirements>

---

## Standard Stack

### Core (already in project — no new installs)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | 2.97.0 | Fetch all-time `daily_checkins` | Already used everywhere; RLS handles auth scoping |
| `@tanstack/react-query` | 5.90.21 | Cache the all-time history query | Already used in crisis-history.tsx — same pattern fits here |
| `react-native` ScrollView/View/Text | built-in | Calendar grid and list rendering | No calendar native package needed; pure JS is sufficient |
| `expo-haptics` | 15.0.8 | Haptic feedback on milestone celebration | Already in project |
| Zustand `useProgressStore` | 5.0.11 | Global state for all tracker data | Already used by tracker.tsx |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `expo-linear-gradient` | 15.0.8 | Celebration modal gradient header | When milestone card needs visual pop — already used throughout |
| `@expo/vector-icons` (Ionicons) | 15.0.3 | Arrow navigation in calendar month picker | Already in project |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pure-JS grid calendar | `react-native-calendars` | `react-native-calendars` is native-free but large (400KB+); pure grid is ~50 lines of JS and fully controllable |
| Pure-JS grid calendar | `react-native-calendar-strip` | Has `codegenConfig` issues in some versions; not worth the risk for a simple dot-per-day display |

**Installation:** No new packages needed.

---

## Architecture Patterns

### Recommended Structure for This Phase

```
app/(app)/tracker.tsx               # existing — extend with history + celebration
store/progress.ts                   # add checkinHistory: string[] slice + loadAllHistory()
components/ui/CheckInCalendar.tsx   # new — pure-JS monthly grid calendar
components/ui/CelebrationModal.tsx  # new — modal that fires once per milestone
```

### Pattern 1: All-Time History Query (React Query)

**What:** Fetch ALL `daily_checkins` rows for the user (just dates), cache with React Query, derive calendar state locally.
**When to use:** Tracker screen mount. `staleTime: 5 min` is fine since check-ins happen at most once per day.

```typescript
// Source: crisis-history.tsx pattern (same project)
const { data: allDates = [] } = useQuery<string[]>({
  queryKey: ['checkin-history', user?.id],
  enabled:  !!user?.id,
  queryFn:  async () => {
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('checked_in_date')
      .eq('user_id', user!.id)
      .order('checked_in_date', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => r.checked_in_date as string);
  },
});
```

### Pattern 2: Pure-JS Monthly Calendar Grid

**What:** Build a month view with `View` rows of 7 cells. Each cell is a `View` with colored dot if the date is in `checkinDates` Set.
**When to use:** Check-in history display. No touch events needed on individual days (R3 says "tappable" but no navigation target is defined — show dot-only for v1).

```typescript
// Pure JS — no native package
function buildCalendarRows(year: number, month: number, checkedDates: Set<string>) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ day: number | null; checked: boolean }> = [];
  // pad start
  for (let i = 0; i < (firstDay + 6) % 7; i++) cells.push({ day: null, checked: false });
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, checked: checkedDates.has(iso) });
  }
  // chunk into rows of 7
  const rows: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}
```

### Pattern 3: CelebrationModal (one-shot per milestone)

**What:** Modal overlay with gradient + trophy emoji + milestone text. Fires once when `daysSober` first crosses a milestone threshold. Uses `AsyncStorage`/`SecureStore` to persist which milestones have been celebrated so it doesn't re-fire on every load.
**When to use:** On tracker mount, after `daysSober` is computed.

```typescript
// Milestone thresholds from existing MilestoneCard.tsx
const MILESTONES = [7, 30, 60, 90, 180, 365];

// Check on mount: find highest milestone <= daysSober that hasn't been celebrated
// Persist celebrated milestones in SecureStore under key 'recoverly_celebrated_milestones'
```

**Key design decision:** Store celebrated milestones as a JSON array of `[userId, days]` pairs in SecureStore so celebrating on device A does not re-fire on a different user or after re-install.

### Pattern 4: Store Extension for All-Time History

**What:** Add `checkinHistory: string[]` and `loadAllHistory(userId: string)` to `useProgressStore`.
**When to use:** Called on tracker screen mount, separate from the existing `loadProgress`.

This avoids polluting the weekly-oriented `loadProgress` with all-time data while keeping the store as the single source of truth.

### Anti-Patterns to Avoid

- **Installing a calendar native package:** `react-native-calendars`, `react-native-calendar-strip` — not worth the risk of `codegenConfig` issues or bundle size for a simple dot grid. Build pure JS.
- **Fetching all check-ins inside `loadProgress`:** That function runs on app boot for every screen; all-time history should be lazy-loaded only when the tracker screen mounts.
- **Re-firing celebration modal on every app open:** Persist celebrated milestones in SecureStore. Check "has this milestone already been celebrated for this user?" before showing the modal.
- **Counting days sober from check-ins:** The source of truth is `profiles.sobriety_start_date`, not the number of check-in rows. Days sober = `Math.floor((Date.now() - new Date(sobrietyStartDate)) / 86_400_000)`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Supabase data caching | Custom loading/error state | `useQuery` from React Query | Already in project, handles stale-while-revalidate, retry, loading states |
| Date arithmetic | Custom day-diff | `Math.floor((Date.now() - startMs) / 86_400_000)` | Already the pattern in tracker.tsx — keep consistent |
| Modal overlay | Custom z-index stack | React Native `Modal` component | Built-in, handles Android back button correctly |

---

## Common Pitfalls

### Pitfall 1: `checked_in_date` is a Postgres `date` type — comes back as a string
**What goes wrong:** Developer expects a Date object, does `new Date(row.checked_in_date)` — in some JS environments this parses as UTC midnight, causing off-by-one in local time.
**Why it happens:** Postgres `date` → `"2026-03-16"` string. `new Date("2026-03-16")` is UTC midnight, which may be "2026-03-15" in a negative-UTC-offset timezone.
**How to avoid:** Compare date strings directly (`checkedDates.has(isoString)`) rather than converting to Date objects for membership checks. The existing `loadProgress` pattern already does this correctly with `checked_in_date + 'T00:00:00'` for local parsing.

### Pitfall 2: `mood` and `notes` columns may not exist on `daily_checkins` in Supabase
**What goes wrong:** The `schema.sql` file does not declare `mood` or `notes` on `daily_checkins`, yet `progress.ts` upserts them. If they were never added to the live database, those writes silently fail or the API returns a column-not-found error.
**Why it happens:** Schema files are documentation; the live database may have been manually altered.
**How to avoid:** Before adding any query that selects `mood` or `notes`, verify they exist in the live DB. If building a history view that needs mood data, include a schema migration (`ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS mood int2; ADD COLUMN IF NOT EXISTS notes text;`) as a Wave 0 task.

### Pitfall 3: MilestoneCard is passive — no celebration fires automatically
**What goes wrong:** The existing `MilestoneCard` just renders greyed vs. colored badges. R3 requires a "celebration card" to *trigger* at milestone days. Without a `CelebrationModal`, the requirement is not met even though badges exist.
**Why it happens:** The component was built for display, not notification.
**How to avoid:** Add a separate `CelebrationModal` component; keep `MilestoneCard` as the passive badge grid.

### Pitfall 4: Selecting `*` from a large `daily_checkins` table
**What goes wrong:** Power users with years of daily check-ins would have 365+ rows. Selecting `*` for calendar is wasteful.
**How to avoid:** Select only `checked_in_date` (one text column). For the calendar, only fetch the displayed month range if needed: `.gte('checked_in_date', monthStart).lte('checked_in_date', monthEnd)`. For the streak and milestone calculations, fetch all dates (lightweight since each row is a single short string).

### Pitfall 5: `weeklyStreak` resets on new week — tracker may show 0 on Monday
**What goes wrong:** `loadProgress` resets `weeklyStreak` to all-false at the start of a new week. If tracker.tsx derives "days checked in this week" from `weeklyStreak`, it will show 0 on Monday morning before the user checks in.
**Why it happens:** By design — weekly counters reset. But the history calendar will correctly show the previous week's dots.
**How to avoid:** The history calendar should be driven by the all-time `checkinHistory` query, not by `weeklyStreak`. The `StreakDots` widget (current week) should remain driven by `weeklyStreak`.

---

## Code Examples

### Querying all-time check-in dates (verified pattern)

```typescript
// Source: supabase-js v2 select pattern (same as crisis-history.tsx in project)
const { data, error } = await supabase
  .from('daily_checkins')
  .select('checked_in_date')
  .eq('user_id', userId)
  .order('checked_in_date', { ascending: false });
// Returns: [{ checked_in_date: "2026-03-16" }, ...]
```

### Milestone celebration check (verified against existing MilestoneCard.tsx milestones)

```typescript
const MILESTONE_DAYS = [7, 30, 60, 90, 180, 365];

function getNewMilestone(daysSober: number, celebrated: number[]): number | null {
  for (const m of MILESTONE_DAYS) {
    if (daysSober >= m && !celebrated.includes(m)) return m;
  }
  return null;
}
```

### Schema migration needed (add mood/notes to daily_checkins)

```sql
-- Run in Supabase SQL editor if columns do not exist
ALTER TABLE public.daily_checkins
  ADD COLUMN IF NOT EXISTS mood    smallint,  -- 1–5 from check-in modal
  ADD COLUMN IF NOT EXISTS notes   text;

-- Also add UPDATE policy (currently only SELECT + INSERT exist)
CREATE POLICY "Users can update own checkins"
  ON public.daily_checkins FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `loadProgress` loads only this week | Need separate `loadAllHistory` for calendar | Architecture change in store.ts |
| `MilestoneCard` passive badges only | `CelebrationModal` fires on milestone crossing | New component needed |
| No check-in history visible | Monthly calendar grid from `daily_checkins` | New `CheckInCalendar` component |

---

## Open Questions

1. **Do `mood` and `notes` columns exist in the live Supabase database?**
   - What we know: They are not in `schema.sql`. `progress.ts` conditionally writes them via upsert.
   - What's unclear: Whether the live DB has them (may have been added manually).
   - Recommendation: Treat as missing. Include a schema migration in Wave 0 as a conditional (`ADD COLUMN IF NOT EXISTS`). Safe to run regardless.

2. **Is check-in history calendar or list?**
   - What we know: R3 says "calendar or list view" — both are acceptable.
   - Recommendation: Build a simple monthly calendar grid (more visual, fits the tracker context). Provide a month navigator (prev/next arrows). This is more impactful than a flat list.

3. **What does "tappable days" mean for history?**
   - What we know: R3 says "tappable days" but no navigation target is specified for a tapped day.
   - Recommendation: For Phase 3, tappable means showing a small tooltip or bottom-sheet with that day's mood + notes (if columns exist). If columns are missing, tapping simply does nothing harmful (no crash).

---

## Validation Architecture

> `nyquist_validation` key is absent from `.planning/config.json` — treated as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no jest.config, no __tests__ directory |
| Config file | None — Wave 0 gap |
| Quick run command | N/A until framework installed |
| Full suite command | N/A until framework installed |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| R3-1 | weeklyStreak builds correctly from DB dates | unit | `jest --testPathPattern=progress` | ❌ Wave 0 |
| R3-2 | daysSober calculation from sobrietyStartDate | unit | `jest --testPathPattern=tracker` | ❌ Wave 0 |
| R3-3 | Calendar grid renders correct dots | manual | On-device visual verification | ❌ Wave 0 |
| R3-4 | CelebrationModal fires exactly once per milestone | unit | `jest --testPathPattern=CelebrationModal` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** Manual on-device verification (EAS build) — no automated test runner available
- **Per wave merge:** EAS preview build + user device test
- **Phase gate:** All R3 success criteria confirmed by user on device before `/gsd:verify-work`

### Wave 0 Gaps

- No test framework detected. Given the project's existing pattern (no test infrastructure), **skip test framework setup for this phase** — all validation is on-device via EAS builds. This is consistent with how Phases 1 and 2 were validated.

*(If a test framework is desired, install jest + @testing-library/react-native, but this would be a separate phase task and is not currently in scope.)*

---

## Existing Components Inventory (what Phase 3 REUSES vs BUILDS)

### Reuse as-is
| Component | File | What it does |
|-----------|------|-------------|
| `SobrietyCounter` | `components/ui/SobrietyCounter.tsx` | SVG arc + days number + "Days Sober" label |
| `StreakDots` | `components/ui/StreakDots.tsx` | 7-dot M–S week view with filled/empty states |
| `MilestoneCard` | `components/ui/MilestoneCard.tsx` | Passive badge grid for 7/30/60/90/180/365 days |

### Build new
| Component | File | What it does |
|-----------|------|-------------|
| `CheckInCalendar` | `components/ui/CheckInCalendar.tsx` | Monthly grid calendar — purple dots on checked-in days, month nav |
| `CelebrationModal` | `components/ui/CelebrationModal.tsx` | Full-overlay modal with gradient + milestone message, fires once per milestone |

### Extend
| File | Change needed |
|------|--------------|
| `store/progress.ts` | Add `checkinHistory: string[]` + `loadAllHistory(userId)` |
| `app/(app)/tracker.tsx` | Wire `loadAllHistory`, render `CheckInCalendar`, mount `CelebrationModal` |
| `supabase/schema.sql` (documentation) | Add `mood` and `notes` columns to `daily_checkins` definition |

---

## Sources

### Primary (HIGH confidence)
- `app/(app)/tracker.tsx` — confirmed partial implementation, components already wired
- `store/progress.ts` — confirmed data model, `loadProgress` scope (weekly only)
- `supabase/schema.sql` — confirmed `daily_checkins` column set (no mood/notes)
- `components/ui/MilestoneCard.tsx` — confirmed milestone thresholds (7/30/60/90/180/365)
- `components/ui/SobrietyCounter.tsx`, `StreakDots.tsx` — confirmed existing, ready to reuse
- `app/(app)/crisis-history.tsx` — confirmed React Query pattern for Supabase history fetch

### Secondary (MEDIUM confidence)
- `.planning/REQUIREMENTS.md` R3 — milestone days include 7 (in MilestoneCard) but REQUIREMENTS.md lists 7, 30, 60, 90, 180, 365
- `.planning/codebase/STACK.md` — confirmed no calendar library in stack; `react-native-svg` already present

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all libraries confirmed present in project
- Architecture: HIGH — patterns directly derived from existing screen code (crisis-history.tsx)
- `daily_checkins` schema gap: HIGH confidence the gap exists; LOW confidence about live DB state
- Pitfalls: HIGH — derived from reading actual source code, not assumptions

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable stack; Supabase schema is project-owned)
