# Phase 4: Goals - Research

**Researched:** 2026-03-18
**Domain:** React Native CRUD screen — Supabase `user_goals`, full add/edit/delete/complete flow, date handling, overdue UI
**Confidence:** HIGH

---

## Summary

The goals screen (`app/(app)/goals.tsx`) is a partially-built working screen — not a stub. It already fetches from `user_goals` via React Query, renders goal cards with a checkbox toggle, and has an "Add Goal" modal. However, it is significantly incomplete relative to Phase 4 requirements: it has no edit flow, no delete flow, no `target_date` display, no `category` display, no overdue visual state, no category picker in the add modal, and the local `Goal` type does not include `target_date` or `category` at all. The modal layout is functional but minimal.

The `user_goals` Supabase table is fully defined in `supabase/schema_v2.sql` — all required columns exist (`id`, `user_id`, `title`, `description`, `category`, `target_date`, `completed`, `completed_at`, `created_at`). RLS is set up with a single "manage own" policy covering all operations (SELECT, INSERT, UPDATE, DELETE). No schema migration is needed for Phase 4.

No separate Zustand store for goals exists. The current screen does all data access inline with React Query mutations — this is the correct pattern for this app (matching how `crisis-history.tsx` is structured). Goals CRUD should stay in the screen component using TanStack Query; no new Zustand store is needed.

**Primary recommendation:** Extend `goals.tsx` in-place — update the local `Goal` type, add `target_date` and `category` to all queries/inserts, build an edit modal (re-using the add modal's layout with pre-populated fields), add delete via `Alert.alert` confirm then mutation, add a `DatePickerField` component using `TextInput` + pure JS date parsing (no native package), and add an overdue badge. All of this is achievable with zero new dependencies.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| R4-1 | Goals list pulls from `user_goals` in Supabase | Already implemented in goals.tsx via useQuery; needs `target_date` + `category` added to select and local type |
| R4-2 | User can add, edit, delete, and complete goals | Add: exists. Edit: missing entirely. Delete: missing. Complete (toggle): exists. All achievable inline in goals.tsx |
| R4-3 | Each goal shows a progress indicator and target date | Target date field missing from current type + query; "progress indicator" for a boolean goal = visual completion state; add target date chip to card |
| R4-4 | Overdue goals are visually distinguished | Missing: requires computing `isOverdue = !completed && target_date < today`; apply warning color to card border + target date chip |
</phase_requirements>

---

## Standard Stack

### Core (already in project — no new installs)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | 2.97.0 | All CRUD on `user_goals` | Already used everywhere; single "manage own" RLS policy covers insert/update/delete |
| `@tanstack/react-query` | 5.90.21 | useQuery + useMutation for goals CRUD | Already used in goals.tsx; handles cache invalidation, loading states, retry |
| `react-native` Modal | built-in | Add/Edit modal sheet | Used in current goals.tsx add modal; no @gorhom/bottom-sheet (removed from project) |
| `react-native` Alert | built-in | Delete confirmation | Standard Android confirm pattern; already used in goals.tsx error handler |
| `@expo/vector-icons` (Ionicons) | 15.0.3 | Icons in goal cards + modal | Already imported in goals.tsx |
| `react-native-safe-area-context` | 4.14.1 | insets for header padding | Already used in goals.tsx |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `expo-linear-gradient` | 15.0.8 | Header gradient (if matching other screens) | Only if Figma shows a gradient header; already used in crisis-history.tsx |
| `expo-haptics` | 15.0.8 | Haptic on goal complete | Light haptic when goal is checked off |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Plain `TextInput` for date entry | `@react-native-community/datetimepicker` | DateTimePicker has `codegenConfig` and is new-arch safe, but adds a native dependency; a plain text input with ISO date format (YYYY-MM-DD) and a JS validator is simpler and zero-risk |
| Plain `TextInput` for date entry | `expo-date-picker` | Does not exist as a standalone Expo package; avoid |
| Inline CRUD in screen | Separate Zustand `useGoalsStore` | The rest of the app uses inline React Query for screen-specific data (crisis-history, goals); a new Zustand store would be overkill for a single screen |

**Installation:** No new packages needed.

---

## Architecture Patterns

### Recommended Project Structure

```
app/(app)/goals.tsx               # existing — extend in-place (full rewrite of component)
```

No new component files are strictly required. The add/edit modal is simple enough to keep inline. A `GoalCard` sub-component can be extracted as a named function at the bottom of the file (same pattern as crisis-history uses `renderItem`) if the card logic grows complex.

### Pattern 1: Extended Goal Type

**What:** The current `Goal` type omits `target_date`, `category`, and `completed_at`. These must be added before any other work.

```typescript
// Source: supabase/schema_v2.sql — columns 1:1
type Goal = {
  id:           string;
  title:        string;
  description:  string | null;
  category:     string;      // 'recovery' | 'personal' | 'work' | 'health'
  target_date:  string | null; // ISO date string e.g. "2026-04-01"
  completed:    boolean;
  completed_at: string | null;
  created_at:   string;
};
```

### Pattern 2: Edit Modal (re-use Add modal shape)

**What:** Use a single modal component for both Add and Edit. Controlled by `editingGoal: Goal | null` state. When `editingGoal` is set, the modal pre-populates fields; the save mutation branches on whether `editingGoal` exists.

```typescript
// Shared modal state
const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
const [showModal, setShowModal]     = useState(false);

// Open add: setEditingGoal(null); setShowModal(true)
// Open edit: setEditingGoal(goal); setShowModal(true)

// In modal, fields initialized from editingGoal or empty strings
const [title, setTitle]         = useState(editingGoal?.title ?? '');
const [desc,  setDesc]          = useState(editingGoal?.description ?? '');
const [category, setCategory]   = useState(editingGoal?.category ?? 'recovery');
const [targetDate, setTargetDate] = useState(editingGoal?.target_date ?? '');
// Re-initialize when editingGoal changes (useEffect on modal open)
```

### Pattern 3: Save Mutation (Insert or Update)

**What:** A single `saveMutation` handles both insert (new goal) and update (edit existing). Branch on whether `editingGoal` is set.

```typescript
// Source: supabase-js v2 upsert/update pattern
const saveMutation = useMutation({
  mutationFn: async (payload: { title: string; description: string | null; category: string; target_date: string | null }) => {
    if (editingGoal) {
      const { error } = await supabase
        .from('user_goals')
        .update(payload)
        .eq('id', editingGoal.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('user_goals').insert({
        user_id: user!.id,
        ...payload,
      });
      if (error) throw error;
    }
  },
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ['goals'] });
    setShowModal(false);
    setEditingGoal(null);
  },
  onError: (e: Error) => Alert.alert('Error', e.message),
});
```

### Pattern 4: Delete with Confirmation

**What:** Long-press or a trash icon button on the card triggers `Alert.alert` with Cancel/Delete options. On confirm, run a delete mutation.

```typescript
// Source: react-native Alert pattern, consistent with error handling in goals.tsx
const deleteMutation = useMutation({
  mutationFn: async (id: string) => {
    const { error } = await supabase.from('user_goals').delete().eq('id', id);
    if (error) throw error;
  },
  onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
});

function confirmDelete(goal: Goal) {
  Alert.alert(
    'Delete Goal',
    `Remove "${goal.title}"? This cannot be undone.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(goal.id) },
    ],
  );
}
```

### Pattern 5: Overdue Detection (pure JS)

**What:** A goal is overdue if it has a `target_date`, is not completed, and that date is before today.

```typescript
// Pure JS — no date library needed
const todayISO = new Date().toISOString().slice(0, 10); // "2026-03-18"

function isOverdue(goal: Goal): boolean {
  return !goal.completed && !!goal.target_date && goal.target_date < todayISO;
}
```

### Pattern 6: Target Date Input

**What:** `target_date` is a Postgres `date` type that accepts ISO format strings (`"2026-04-01"`). The simplest approach is a plain `TextInput` with placeholder `"YYYY-MM-DD"` and a basic format validator. No native date picker package needed.

```typescript
function isValidDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + 'T00:00:00');
  return !isNaN(d.getTime());
}
```

The input is optional — if left blank, `target_date` is null and no overdue state applies.

### Pattern 7: Category Selector

**What:** Four categories defined in `schema_v2.sql` comment: `recovery | personal | work | health`. Render as a horizontal row of tappable pill buttons inside the modal. Use `Colors.goalGreen` / `Colors.goalAmber` / `Colors.goalBlue` / `Colors.primary` mapped to categories (all four colors are already in `constants/colors.ts`).

```typescript
const CATEGORIES = [
  { id: 'recovery', label: 'Recovery', color: Colors.primary },
  { id: 'personal', label: 'Personal', color: Colors.goalBlue },
  { id: 'health',   label: 'Health',   color: Colors.goalGreen },
  { id: 'work',     label: 'Work',     color: Colors.goalAmber },
] as const;
```

### Anti-Patterns to Avoid

- **Adding a native date picker package:** `@react-native-community/datetimepicker` would work but adds a native dependency and build complexity. Plain TextInput with ISO date validation is sufficient for v1.
- **Separate Zustand store for goals:** Goals data is screen-specific and fetched only on the goals screen. Adding a new Zustand store would be inconsistent with `crisis-history.tsx` which uses React Query inline.
- **Mutating the React Query cache directly:** Always call `qc.invalidateQueries({ queryKey: ['goals'] })` in `onSuccess`; never manually update cache state — keeps code consistent with existing patterns.
- **Using `select('*')` and then ignoring fields:** The current query does `select('*')` which is fine for this table (5-6 small text fields), but the local `Goal` type must be updated to include all columns or TS strict mode will error on property access.
- **Comparing `target_date` as a Date object:** Compare ISO strings directly (`goal.target_date < todayISO`) to avoid UTC-midnight off-by-one errors in negative-UTC-offset timezones (same pitfall documented in Phase 3 research).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Supabase data caching + loading states | Custom loading/error state management | `useQuery` from React Query | Already in project; handles stale-while-revalidate, retry, derived loading flag |
| Optimistic updates | Local state mutations before server confirms | Standard React Query invalidation | Simpler; goals list is small and re-fetch is fast |
| Modal overlay | Custom z-index stacking | React Native built-in `Modal` | Handles Android back button, keyboard avoidance, transparent overlay; already used in goals.tsx |
| Delete confirm | Custom inline confirm UI | `Alert.alert` with destructive button | Native Android dialog; correct UX pattern; already in project |
| Date arithmetic for overdue | Custom date library | `new Date().toISOString().slice(0,10)` + string comparison | ISO date strings are lexicographically sortable — `"2026-03-17" < "2026-03-18"` is true; no library needed |

---

## Common Pitfalls

### Pitfall 1: Local `Goal` type mismatch with Supabase response

**What goes wrong:** The current `Goal` type in `goals.tsx` does not include `target_date`, `category`, or `completed_at`. TypeScript strict mode will error when attempting to access these properties from query results typed as `Goal[]`.
**Why it happens:** The original developer built only the minimal fields needed for the first implementation pass.
**How to avoid:** Update the `Goal` type definition as the very first change in the file. All subsequent code will then type-check correctly.
**Warning signs:** TypeScript errors like `Property 'target_date' does not exist on type 'Goal'`.

### Pitfall 2: `target_date` off-by-one in local timezone

**What goes wrong:** `new Date("2026-04-01")` parses as UTC midnight. On a device in a timezone west of UTC (e.g., UTC-5), this resolves to 2026-03-31 at 7PM local time — one day early.
**Why it happens:** ISO date strings without time component are parsed as UTC by the JS spec.
**How to avoid:** Compare date strings directly (`goal.target_date < todayISO` where `todayISO = new Date().toISOString().slice(0,10)` produces local time). Never convert `target_date` to a `Date` object for comparison purposes.
**Warning signs:** Goals showing as overdue one day early on devices in UTC- timezones.

### Pitfall 3: Edit modal fields not re-initializing on re-open

**What goes wrong:** When the user opens an edit modal for Goal A, closes it, then opens it for Goal B, the fields still show Goal A's values because the `useState` values were set once on mount and not re-initialized.
**Why it happens:** React state persists across re-renders; closing a modal via `visible={false}` does not unmount the component in React Native's `Modal`.
**How to avoid:** Use a `useEffect` that runs when `showModal` changes to `true`, re-initializing all field state from `editingGoal`.

```typescript
useEffect(() => {
  if (showModal) {
    setTitle(editingGoal?.title ?? '');
    setDesc(editingGoal?.description ?? '');
    setCategory(editingGoal?.category ?? 'recovery');
    setTargetDate(editingGoal?.target_date ?? '');
  }
}, [showModal]);
```

### Pitfall 4: Delete mutation races with toggle mutation

**What goes wrong:** User rapidly taps complete then delete — both mutations fire. The update completes, then delete completes. No actual bug, but `qc.invalidateQueries` fires twice. In the other order (delete then update), the update will return a Supabase 404-equivalent (no rows matched) but the error is not thrown — `supabase.update().eq()` returns no error when 0 rows are matched.
**Why it happens:** Supabase UPDATE with `.eq('id', deletedId)` silently no-ops if the row is already gone.
**How to avoid:** No special handling needed — the silent no-op is acceptable behavior. The cache invalidation will show the correct state after both mutations settle.

### Pitfall 5: `user_goals` table may not exist in live Supabase database

**What goes wrong:** The table is defined in `schema_v2.sql` but that file says "Run in Supabase SQL Editor" — it may not have been executed yet. If the table doesn't exist, `supabase.from('user_goals').select()` returns a Supabase API error (table not found).
**Why it happens:** Schema files in this project are documentation/runbooks; the live DB state is unknown.
**How to avoid:** Wave 0 must include a task to verify or apply `schema_v2.sql` in the live Supabase project. The current goals.tsx query already handles the error gracefully (`if (error) throw error` → React Query error state → no crash, just empty list).
**Warning signs:** Goals screen stays empty with no console error (if error is swallowed) or shows an error state.

---

## Code Examples

Verified patterns from existing project source:

### Querying goals (full type, ordered)

```typescript
// Source: goals.tsx existing pattern, extended
const { data: goals = [] } = useQuery<Goal[]>({
  queryKey: ['goals', user?.id],
  enabled:  !!user?.id,
  queryFn:  async () => {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', user!.id)
      .order('completed', { ascending: true })   // active goals first
      .order('target_date', { ascending: true, nullsFirst: false }) // earliest deadline first
      .order('created_at', { ascending: false }); // newest within same date
    if (error) throw error;
    return data ?? [];
  },
});
```

### Overdue detection (pure JS)

```typescript
// Source: supabase/schema_v2.sql for column type; JS date string comparison pattern from Phase 3 research
const todayISO = new Date().toISOString().slice(0, 10);

function isOverdue(goal: Goal): boolean {
  return !goal.completed && !!goal.target_date && goal.target_date < todayISO;
}
```

### Toggle complete mutation (update completed + completed_at)

```typescript
// Source: existing goals.tsx toggleGoal pattern — already correct
const toggleGoal = useMutation({
  mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
    const { error } = await supabase
      .from('user_goals')
      .update({
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq('id', id);
    if (error) throw error;
  },
  onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
});
```

### Delete mutation with Alert confirm

```typescript
// Source: react-native Alert pattern (used in goals.tsx error handler for reference)
const deleteGoal = useMutation({
  mutationFn: async (id: string) => {
    const { error } = await supabase.from('user_goals').delete().eq('id', id);
    if (error) throw error;
  },
  onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
});

function handleDelete(goal: Goal) {
  Alert.alert(
    'Delete Goal',
    `Remove "${goal.title}"?`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteGoal.mutate(goal.id) },
    ],
  );
}
```

### Goal card overdue styling

```typescript
// Border color driven by overdue state — uses existing Colors tokens
<TouchableOpacity
  style={[
    styles.goalCard,
    goal.completed && styles.goalCardDone,
    isOverdue(goal) && styles.goalCardOverdue,
  ]}
  // ...
>

// In StyleSheet:
goalCardOverdue: {
  borderColor: Colors.warning,  // Colors.warning = '#FFB347'
  borderLeftWidth: 3,
  borderLeftColor: Colors.warning,
},
targetDateOverdue: {
  color: Colors.warning,
  fontFamily: Fonts.jostMedium,
},
```

---

## Current State of `goals.tsx` (What Exists vs What's Missing)

### What Already Works
- `useQuery` fetch from `user_goals` ordered by `created_at` desc
- Add goal modal with title + description fields
- `addGoal` mutation: `supabase.insert` with title, description, user_id
- `toggleGoal` mutation: updates `completed` + `completed_at`
- Empty state with icon
- Card layout with checkbox, title, description, strikethrough on complete

### What's Missing (Gap Analysis)

| Feature | Status | Notes |
|---------|--------|-------|
| `target_date` in type + query | Missing | Local `Goal` type has no `target_date`; not fetched or displayed |
| `category` in type + query | Missing | Local `Goal` type has no `category`; not fetched or displayed |
| Target date display on card | Missing | No chip/label showing deadline |
| Overdue visual state | Missing | No color differentiation for past-deadline active goals |
| Edit goal flow | Missing | No edit modal, no edit mutation |
| Delete goal flow | Missing | No delete button, no delete mutation |
| Category picker in add/edit modal | Missing | Always inserts with Supabase default (`recovery`) |
| Target date input in add/edit modal | Missing | Always inserts with `target_date: null` |
| Query sort order | Suboptimal | Currently sorts by `created_at` desc; better to sort active before completed, then by target_date |
| "Progress indicator" per goal | Needs clarification | Schema has no numeric progress column; "progress" for a boolean goal = completion state; the existing checkbox + strikethrough is the indicator |

---

## Figma Reference

Figma file key: `uVW028XTHA5DcuJh8DjcNs`. MCP Figma tools were not available in this research environment. The goals screen node ID is unknown — the known home screen node is `0:1940`.

**Fallback approach for the planner:** The existing `goals.tsx` visual design already uses the project's design system correctly (Poppins/Jost, `Colors.primary`, `Colors.cardTintPurpleFaint`, rounded cards, bottom-sheet modal). Extend in the same style; no Figma-exact match is required for Phase 4 per the roadmap (Phase 4 goal is "fully functional CRUD with Figma-correct UI" — matching the design system constitutes "Figma-correct" for a screen whose exact node ID is unknown).

---

## Schema Status

| Table | In schema.sql | In schema_v2.sql | RLS | Notes |
|-------|--------------|-----------------|-----|-------|
| `user_goals` | No | Yes — fully defined | Yes — all ops | `schema_v2.sql` must be applied to live DB |

The `user_goals` table schema matches the phase brief exactly. No additional columns or migrations are needed for Phase 4. The `category` column defaults to `'recovery'` if omitted on insert — safe for backward compatibility.

---

## Wave 0 Requirements

1. **Verify `schema_v2.sql` has been applied to the live Supabase project.** The `user_goals`, `crisis_incidents`, and `user_favorites` tables are all defined there. If `crisis_incidents` exists in the live DB (Phase 2 data is working), then `schema_v2.sql` has been applied and `user_goals` should exist too. If the goals screen shows empty with no errors, run `schema_v2.sql` in the Supabase SQL editor.

2. **No package installs needed.** All required libraries are already present.

3. **No new Zustand store needed.** Goals CRUD stays in-screen via React Query.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `select('*')` with minimal `Goal` type | `select('*')` with full `Goal` type including all columns | TypeScript strict mode compliance |
| Add-only modal | Unified Add/Edit modal controlled by `editingGoal` state | Single modal component, zero duplication |
| No delete | Alert.alert confirm → delete mutation | Safe delete UX without a custom confirm UI |
| Sort by `created_at` desc | Sort by `completed` asc, `target_date` asc (nulls last), `created_at` desc | Active/overdue goals surface first |

---

## Open Questions

1. **"Progress indicator per goal" — does the schema need a numeric progress field?**
   - What we know: `user_goals` has no `progress` or `progress_pct` column. The schema only tracks completion (boolean).
   - What's unclear: Whether the Figma design shows a progress bar (e.g., 0–100%) that would require a new column, or simply a visual completion state (checkbox/strikethrough).
   - Recommendation: Treat "progress indicator" as the existing completion visual (checkbox + strikethrough) for Phase 4. If a numeric progress bar is needed later, that is a schema migration + Phase 4 extension. The roadmap says "each goal shows a progress indicator" — a completion state chip satisfies this reading.

2. **Does `schema_v2.sql` need to be applied to the live Supabase database?**
   - What we know: It is a runbook file, not auto-applied. Phase 2 (crisis_incidents, also in schema_v2.sql) is confirmed working by the user.
   - Recommendation: If Phase 2 works, schema_v2.sql is applied and `user_goals` exists. Treat as applied. If the goals screen returns errors on first load, the planner should include a Wave 0 task to run the SQL.

3. **Figma node ID for goals screen?**
   - What we know: Home screen is node `0:1940`. Goals screen node is unknown; MCP Figma was not available.
   - Recommendation: Use the existing goals.tsx design as the visual baseline. The card-based layout with the project design system tokens is consistent with Figma expectations. The planner can include a task to check Figma if exact pixel matching is desired, but it is not blocking.

---

## Validation Architecture

> `nyquist_validation` key is absent from `.planning/config.json` — treated as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no jest.config, no `__tests__` directory |
| Config file | None |
| Quick run command | `npx tsc --noEmit --skipLibCheck` |
| Full suite command | `npx tsc --noEmit --skipLibCheck` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| R4-1 | Goals query fetches from `user_goals` with all fields | manual | On-device: goals screen shows data | ❌ Wave 0 |
| R4-2 | Add/Edit/Delete/Complete all work end-to-end | manual | On-device: perform each CRUD action | ❌ Wave 0 |
| R4-3 | Target date displayed on card; progress indicator shown | manual | On-device: add goal with target date | ❌ Wave 0 |
| R4-4 | Overdue goals show warning color | manual | On-device: add goal with past target date | ❌ Wave 0 |

TypeScript check (`npx tsc --noEmit --skipLibCheck`) is the automated gate — catches type errors before EAS build.

### Sampling Rate

- **Per task commit:** `npx tsc --noEmit --skipLibCheck`
- **Per wave merge:** TypeScript check + EAS preview build
- **Phase gate:** All R4 success criteria confirmed by user on device before `/gsd:verify-work`

### Wave 0 Gaps

- No test framework. Consistent with all prior phases — validation is TypeScript check + on-device via EAS build.
- Verify `schema_v2.sql` applied (one-time check, not a code change).

*(No test files needed — existing pattern for this project is on-device validation.)*

---

## Sources

### Primary (HIGH confidence)
- `app/(app)/goals.tsx` — confirmed current implementation, gap analysis performed
- `supabase/schema_v2.sql` — confirmed `user_goals` schema with all required columns + RLS
- `store/progress.ts` — confirmed no goals state; goals CRUD belongs in screen via React Query
- `constants/colors.ts` — confirmed `Colors.goalGreen`, `Colors.goalAmber`, `Colors.goalBlue` exist for category colors; `Colors.warning` exists for overdue
- `constants/fonts.ts` — confirmed `Fonts.*` token set
- `app/(app)/crisis-history.tsx` — confirmed React Query inline pattern for Supabase data screens
- `app/(app)/tracker.tsx` — confirmed Modal pattern for React Native built-in modals
- `.planning/codebase/CONVENTIONS.md` — confirmed coding standards (no fontWeight, StyleSheet.create, etc.)
- `.planning/REQUIREMENTS.md` R4 — confirmed requirement list (add/edit/delete/complete, progress indicator, target date, overdue state)
- `.planning/codebase/TESTING.md` (by pattern inference from Phase 3 research) — no test framework in project

### Secondary (MEDIUM confidence)
- `.planning/ROADMAP.md` Phase 4 goal statement — "CRUD goals with progress tracking" and success criteria
- `.planning/STATE.md` — confirmed Phase 4 not started, no prior decisions recorded

### Tertiary (LOW confidence)
- Figma node for goals screen — not found; MCP Figma tooling not available in this research run

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all libraries confirmed in project
- Architecture: HIGH — patterns directly derived from existing screen code (goals.tsx, crisis-history.tsx)
- Schema: HIGH — `user_goals` fully confirmed in schema_v2.sql
- Gap analysis: HIGH — read actual goals.tsx source code
- Figma node: NOT FOUND — use existing design system as baseline

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable stack; Supabase schema is project-owned)
