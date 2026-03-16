# Phase 2: SOS Polish + Data — Research

**Researched:** 2026-03-16
**Domain:** React Native SOS/crisis screens + Supabase data logging
**Confidence:** HIGH

---

## Summary

The SOS system is already well-structured. Six screens exist: one index screen (`app/(app)/sos/index.tsx`) and five sub-screens (`bad-day`, `feel-like-using`, `just-relapsed`, `self-harm`, `feeling-anxious`). All five sub-screens use a shared `SOSResponseScreen` component (`components/sos/SOSResponseScreen.tsx`). The index screen is the "choose your situation" tile selector; each sub-screen is a guided coping checklist with inline CTAs.

The Supabase schema already has the `crisis_incidents` table (added in schema_v2.sql). However, there is **no separate `actions_completed` table** — the current `SOSResponseScreen` component logs completed actions as a `text[]` column inside `crisis_incidents` when the user taps "I'm feeling better". This means CTA-tap logging and incident logging are bundled into a single end-of-session write rather than two separate real-time writes. The requirement states CTAs must be "logged to `actions_completed`" — this either means the existing `actions_completed` column on `crisis_incidents`, or a separate table needs to be created. Research interpretation: the existing column approach satisfies the requirement unless Figma specifies a breakdown view in crisis history.

The `crisis-history.tsx` screen is functional but minimal — it reads from `crisis_incidents` using TanStack Query and displays incident type + date + notes + actions. It is not Figma-polished. The crisis history screen is the sixth screen in the "6 screens" requirement.

The primary work for this phase is: (1) Figma-match all 6 screens, (2) wire incident logging to fire on sub-screen **open** (not just on "I'm feeling better"), and (3) wire CTA taps to log in real time.

**Primary recommendation:** Trigger `crisis_incidents` insert on `useEffect` mount of each sub-screen, not only on finish. Add a `logCTAAction` service function that upserts the action into the existing `actions_completed` array of the open incident row.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| R2 | All 6 SOS screens Figma-perfect, crisis incidents logged to Supabase | All 6 screens identified; schema tables exist; logging gap identified (fires on finish, not on open); architecture for Figma polish is clear |
</phase_requirements>

---

## Standard Stack

### Core (already in project — no new installs)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | 2.97.0 | `crisis_incidents` reads + writes | Already used everywhere in the project |
| `@tanstack/react-query` | 5.90.21 | `crisis-history.tsx` data fetching | Already used; `crisis-history.tsx` uses it today |
| `expo-linear-gradient` | 15.0.8 | Header gradients on sub-screens | Already used in `SOSResponseScreen` |
| `react-native-reanimated` | 4.2.2 | `FadeIn` entrance on SOS index | Already used; `FadeIn.duration(220).delay(120)` in index |
| `expo-vector-icons` (Ionicons) | 15.0.3 | Back arrow, chevrons, call icons | Already used in all SOS screens |
| `expo-haptics` | 15.0.8 | Haptic feedback on CTA taps | Already in project, adds polish |

### No New Packages Required

All functionality can be built with the existing stack. Do NOT add any new native packages — any old-arch package without `codegenConfig` will cause an ANR.

**Installation:** None needed.

---

## Architecture Patterns

### Existing SOS Structure

```
app/(app)/sos/
├── _layout.tsx          # Stack layout; index has animation:'none', subs slide_from_right
├── index.tsx            # Tile selector — 5 options + inner circle + helplines
├── bad-day.tsx          # Passes config props to SOSResponseScreen
├── feel-like-using.tsx  # Passes config props to SOSResponseScreen
├── just-relapsed.tsx    # Passes config props to SOSResponseScreen
├── self-harm.tsx        # Passes config props to SOSResponseScreen
└── feeling-anxious.tsx  # Passes config props to SOSResponseScreen

app/(app)/
└── crisis-history.tsx   # 6th screen — TanStack Query from crisis_incidents

components/sos/
└── SOSResponseScreen.tsx  # Shared component — all sub-screens use this
```

### Pattern 1: Sub-Screen Open Logging (New Pattern Needed)

**What:** When a sub-screen mounts, immediately insert a row into `crisis_incidents` and store the resulting `id` in a `useRef`. CTA taps then update that row's `actions_completed` array via an upsert. The "I'm feeling better" button closes the flow.

**When to use:** Every sub-screen open.

**Example:**
```typescript
// In SOSResponseScreen — add incidentId tracking
const incidentIdRef = useRef<string | null>(null);

useEffect(() => {
  if (!user?.id) return;
  let cancelled = false;
  async function logOpen() {
    try {
      const { data } = await supabase
        .from('crisis_incidents')
        .insert({ user_id: user!.id, incident_type: incidentType, actions_completed: [] })
        .select('id')
        .single();
      if (!cancelled && data) incidentIdRef.current = data.id;
    } catch { /* non-blocking */ }
  }
  logOpen();
  return () => { cancelled = true; };
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

### Pattern 2: Real-Time CTA Action Logging

**What:** When user taps a CTA button (call sponsor, find meeting, call 988, etc.), update the `actions_completed` array on the already-inserted incident row.

**When to use:** Every CTA `onPress` in `SOSResponseScreen`.

**Example:**
```typescript
async function logCTAAction(actionId: string) {
  if (!incidentIdRef.current) return;
  try {
    const { data: existing } = await supabase
      .from('crisis_incidents')
      .select('actions_completed')
      .eq('id', incidentIdRef.current)
      .single();
    const updated = [...(existing?.actions_completed ?? []), actionId];
    await supabase
      .from('crisis_incidents')
      .update({ actions_completed: updated })
      .eq('id', incidentIdRef.current);
  } catch { /* non-blocking */ }
}
```

### Pattern 3: Figma Polish — SOS Index Tiles

**What:** The index screen uses `optionCard` with `borderLeftWidth: 4` color stripe. Figma may specify full-color cards, gradient tiles, or different sizing. The planner must fetch Figma node for the SOS index screen.

**When to use:** When updating `app/(app)/sos/index.tsx`.

**Key observation:** The current index has a purple gradient header and white card list. Sub-screens also have a colored gradient header with the shared `SOSResponseScreen` layout. Color per incident type is already defined via the `headerColor` prop and the `Colors.sos*` palette in `constants/colors.ts`.

### Pattern 4: Crisis History Screen Polish

**What:** `crisis-history.tsx` is functional but unpolished. It displays raw `incident_type` (underscore-separated) with `.replace(/_/g, ' ')`. Cards use `cardTintPurpleFaint` background. Figma likely shows a timeline or more structured layout.

**When to use:** When updating `app/(app)/crisis-history.tsx`.

### Anti-Patterns to Avoid

- **Logging in `handleFinish` only:** Current behavior — fires only when user taps "I'm feeling better". The requirement says "Opening a crisis sub-screen writes a row". This must be fixed to fire on mount.
- **Adding a separate `actions_completed` table:** The existing `text[]` column on `crisis_incidents` already satisfies the requirement. Do not create a new table unless Figma shows a breakdown report.
- **Hard-coding inline color strings:** `self-harm.tsx` uses `headerColor="#FF3B30"` inline instead of `Colors.sosRedBright`. Fix this to use the constant.
- **`find meeting` CTA linking externally:** `just-relapsed.tsx` opens `https://www.aa.org/find-aa` in external browser. The proper behavior is `router.push('/(app)/meetings')` to use the in-app meetings screen.
- **Empty CTA action on `call_sponsor`:** `feel-like-using.tsx` has `cta: { label: '📞 Open Sponsor Screen', action: () => {} }` — the action is a no-op. It must navigate to `/(app)/sponsor`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Array append for `actions_completed` | Custom merge logic | Supabase `.update()` with fetched+appended array | Supabase RLS enforces user ownership; custom logic bypasses nothing but adds code |
| Incident row tracking across re-renders | Global store | `useRef<string \| null>` inside `SOSResponseScreen` | Ref persists across renders without triggering re-renders; incident is ephemeral, not global state |
| Crisis history pagination | Custom scroll logic | `FlatList` (already used) with `onEndReached` | FlatList handles virtualization natively |
| Phone dialer | Custom native module | `Linking.openURL('tel:...')` | Already used in the SOS index screen's contact section |
| In-app meetings navigation | External browser link | `router.push('/(app)/meetings')` | Keeps user in app; meetings screen already exists |

**Key insight:** The SOS data layer is 80% built. The gap is the timing of the insert (on finish vs on open) and the no-op CTAs. The main work is Figma polish.

---

## Common Pitfalls

### Pitfall 1: Duplicate Incident Rows on Re-Mount

**What goes wrong:** If the user navigates back and re-enters a sub-screen, a new `crisis_incidents` row is inserted each time the component mounts.
**Why it happens:** `useEffect(() => { logOpen(); }, [])` fires on every mount, not just the first visit.
**How to avoid:** This is actually correct behavior — each visit to a sub-screen is a new crisis event. The `incidentIdRef` is reset to `null` on unmount naturally. No special guard needed.
**Warning signs:** Unexpectedly high row counts in `crisis_incidents`.

### Pitfall 2: `incidentIdRef` Is Null When CTA Fires

**What goes wrong:** User taps a CTA before the async `logOpen()` resolves — `incidentIdRef.current` is still `null`, so the action isn't logged.
**Why it happens:** Insert is async; CTA tap can happen immediately after screen mount.
**How to avoid:** In `logCTAAction`, queue the action ID in a local array. In the `useEffect` callback after the insert resolves, flush the queued actions. OR: simply guard with `if (!incidentIdRef.current) return` and accept that very fast taps won't log — acceptable given the non-critical nature.
**Warning signs:** Missing CTA logs in `crisis_incidents.actions_completed`.

### Pitfall 3: `SOSResponseScreen` Props Type Mismatch

**What goes wrong:** The `SOSStep.cta.action` type is `() => void`, but async Supabase calls are `async () => Promise<void>`. TypeScript won't error but the async void return is implicit.
**Why it happens:** `() => void` in TypeScript allows async functions to be assigned.
**How to avoid:** Keep CTA actions synchronous wrappers that call async functions without awaiting in the type signature. Log actions fire-and-forget.

### Pitfall 4: `textTransform: 'capitalize'` on `cardType` in crisis-history

**What goes wrong:** `cardType` style in `crisis-history.tsx` uses `textTransform: 'capitalize'` — this only capitalizes the first letter of each word. Incident types like `feel_like_using` render as `feel_like_using` with capitalize only uppercasing `f`. The `.replace(/_/g, ' ')` handles word separation but `textTransform: 'capitalize'` works on spaces, so "feel like using" → "Feel Like Using" is fine. This is actually correct, but the STATE.md notes a decision to remove `textTransform: 'capitalize'` from the sobriety counter. Check Figma for casing intention.
**How to avoid:** Use explicit string formatting (`.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')`) for predictable output rather than CSS text transform.

### Pitfall 5: SOS sub-screens registered as hidden tab screens

**What goes wrong:** The `sos` directory is registered as `<Tabs.Screen name="sos" options={{ href: null }} />` in `_layout.tsx`. Expo Router treats `sos/` as a nested Stack. The sub-screens route fine via `router.push('/(app)/sos/bad-day')` because the `_layout.tsx` in the `sos/` directory defines the Stack with those names. No change needed here.
**Warning signs:** Would manifest as "No route" errors — not currently happening.

---

## Code Examples

Verified patterns from existing codebase:

### Supabase Insert + Get ID (for open-logging pattern)
```typescript
// Source: supabase-js docs pattern; matches existing schema_v2.sql table shape
const { data, error } = await supabase
  .from('crisis_incidents')
  .insert({
    user_id: user.id,
    incident_type: incidentType,   // e.g. 'feel_like_using'
    actions_completed: [],
  })
  .select('id')
  .single();
// data.id is the UUID for this incident row
```

### TanStack Query in crisis-history.tsx (existing — do not change pattern)
```typescript
// Source: app/(app)/crisis-history.tsx (existing code)
const { data: incidents = [] } = useQuery<Incident[]>({
  queryKey: ['crisis-history', user?.id],
  enabled:  !!user?.id,
  queryFn:  async () => {
    const { data, error } = await supabase
      .from('crisis_incidents')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});
```

### Linking for phone/SMS (existing — do not change)
```typescript
// Source: app/(app)/sos/index.tsx
Linking.openURL(`tel:${phone}`)    // phone call
Linking.openURL('sms:741741')      // SMS Crisis Text Line
```

### Router navigation for in-app CTA
```typescript
// Use this instead of Linking.openURL for meetings/sponsor
router.push('/(app)/meetings');    // find meeting CTA
router.push('/(app)/sponsor');     // call sponsor CTA
```

---

## Current SOS Screen Inventory

### 6 Screens Summary

| Screen | File | Incident Type | Header Color | Key CTAs | Current State |
|--------|------|---------------|--------------|----------|---------------|
| SOS Index | `sos/index.tsx` | — | `primaryDark → primaryMid` gradient | 5 option tiles, inner circle, helplines | Functional, needs Figma polish |
| Bad Day | `sos/bad-day.tsx` | `bad_day` | `Colors.sosOrange` | None (all informational steps) | Functional, needs Figma polish |
| Feel Like Using | `sos/feel-like-using.tsx` | `feel_like_using` | `Colors.sosRed` | Open Sponsor Screen (no-op), Call SAMHSA | Functional; CTA action is `() => {}` — broken |
| Just Relapsed | `sos/just-relapsed.tsx` | `just_relapsed` | `Colors.sosDark` | Call 911, Find Meeting (external URL) | Functional; meeting CTA goes to web, not in-app |
| Self Harm | `sos/self-harm.tsx` | `self_harm` | `"#FF3B30"` (inline) | Call 988, Text 741741 | Functional; inline color string to fix |
| Feeling Anxious | `sos/feeling-anxious.tsx` | `feeling_anxious` | `Colors.sosPurple` | None (informational) | Functional, needs Figma polish |
| Crisis History | `crisis-history.tsx` | — | White background | Back navigation | Functional, needs Figma polish |

### Existing Data Logging Behavior

- **Current:** `SOSResponseScreen.handleFinish()` inserts one row into `crisis_incidents` with all checked steps as `actions_completed`. This fires only when user taps "I'm feeling better".
- **Required:** Insert row on screen **open** (requirement: "Opening a crisis sub-screen writes a row"). CTA taps log to the same row's `actions_completed` array.

### `actions_completed` Column vs Separate Table

The `crisis_incidents` table already has `actions_completed text[] default '{}'`. The requirement says "logged to `actions_completed`" — this can be interpreted as the existing column. No new table is needed. The planner should implement CTA tap logging by updating the existing `actions_completed` column on the already-inserted incident row.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Log only on finish | Log on open + update on CTA | Phase 2 (this phase) | Captures incidents even if user backs out without finishing |
| External browser for meetings | `router.push('/(app)/meetings')` | Phase 2 | Keeps user in app; in-app meetings screen exists |
| Inline `"#FF3B30"` in self-harm.tsx | `Colors.sosRedBright` | Phase 2 | Design token consistency |
| No-op CTA on call_sponsor | `router.push('/(app)/sponsor')` | Phase 2 | Functional sponsor navigation |

---

## Open Questions

1. **Figma node IDs for SOS screens**
   - What we know: Figma file key is `uVW028XTHA5DcuJh8DjcNs`. REQUIREMENTS.md only references node `0:1940` for the home screen. No SOS node IDs are documented.
   - What's unclear: Exact Figma specs for each of the 6 SOS screens — exact tile layout, color treatment, card sizes, typography sizes, crisis history card design.
   - Recommendation: The planner should include a wave that reads Figma nodes for SOS screens before pixel-polish work begins. Use the `get_node_details` pattern established in Phase 1.

2. **`actions_completed` separate table vs column**
   - What we know: Existing schema has `actions_completed text[]` on `crisis_incidents`. The requirements say "logged to `actions_completed`".
   - What's unclear: Whether the requirement implies a separate `actions_completed` table (for per-CTA analytics) or the existing column is sufficient.
   - Recommendation: Use the existing column. A separate table adds complexity with no UI benefit in Phase 2. The crisis history screen only displays the list of action names, which works with the text array.

3. **Crisis history Figma design**
   - What we know: The screen is functional but unpolished. It uses a plain white background with purple-tinted cards.
   - What's unclear: Whether Figma shows a timeline layout, date grouping, or just the current flat list with polished cards.
   - Recommendation: Match the pattern established in other screens (gradient header, styled cards) while waiting for Figma confirmation.

---

## Validation Architecture

> `workflow.nyquist_validation` key is absent from `.planning/config.json` — treating as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no jest.config.*, no vitest.config.*, no test/ directory |
| Config file | None — Wave 0 must not add a test framework (native RN testing requires significant setup; EAS device testing is the project's validation method per CLAUDE.md) |
| Quick run command | N/A — validation is EAS build + device test |
| Full suite command | N/A |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| R2-1 | All 6 SOS screens render without crash | manual-only | EAS build + device | N/A — device test |
| R2-2 | Opening sub-screen inserts row to `crisis_incidents` | manual-only | EAS build + check Supabase dashboard | N/A — device test |
| R2-3 | Tapping a CTA logs to `actions_completed` column | manual-only | EAS build + check Supabase dashboard | N/A — device test |
| R2-4 | Crisis history shows real Supabase data | manual-only | EAS build + device | N/A — device test |

**Justification for manual-only:** This project has no automated test infrastructure. Per CLAUDE.md and MEMORY.md, all validation is via EAS builds on a physical Android device. Adding a Jest/Vitest framework would require significant setup and native mocking that is out of scope for this phase.

### Sampling Rate
- **Per task commit:** TypeScript compile (`npx tsc --noEmit`) — catches type errors before build
- **Per wave merge:** EAS build trigger with user device test
- **Phase gate:** User confirms all 6 screens correct on device before closing phase

### Wave 0 Gaps
- None — no test framework setup needed. TypeScript strict mode is the compile-time validation layer.

*(No test infrastructure gaps: project uses EAS device testing as the sole validation method.)*

---

## Sources

### Primary (HIGH confidence)
- Codebase direct read — `app/(app)/sos/` directory (all 6 files), `components/sos/SOSResponseScreen.tsx`, `app/(app)/crisis-history.tsx`, `supabase/schema_v2.sql`, `app/(app)/_layout.tsx`
- `constants/colors.ts` — verified all `Colors.sos*` tokens exist
- `constants/fonts.ts` — verified font constants
- `.planning/REQUIREMENTS.md` — R2 requirements verbatim
- `.planning/codebase/STACK.md` — confirmed `@supabase/supabase-js` 2.97.0, `@tanstack/react-query` 5.90.21

### Secondary (MEDIUM confidence)
- `supabase-js` `.insert().select('id').single()` pattern — standard Supabase JS SDK pattern for getting back the inserted row ID; consistent with existing usage in codebase

### Tertiary (LOW confidence)
- Figma design specifics for SOS screens — not yet retrieved; Figma file key known (`uVW028XTHA5DcuJh8DjcNs`) but node IDs for SOS screens not documented in REQUIREMENTS.md

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries are already installed and in use; no new packages needed
- Architecture: HIGH — all 7 files read directly; data flow is clear; gaps are specific and small
- Pitfalls: HIGH — identified from direct code reading (no-op CTA, external URL, inline color string, timing of insert)
- Figma pixel specs: LOW — SOS Figma nodes not documented; must be fetched during planning

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable stack; no fast-moving dependencies)
