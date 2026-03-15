# Phase 1: Dashboard Polish - Research

**Researched:** 2026-03-15
**Domain:** React Native / Expo home screen UI, Supabase check-in flow, Meeting Guide API, floating FAB
**Confidence:** HIGH (codebase read directly; Figma API requires auth token so visual diff is inferred from code audit)

---

## Summary

The home screen (`app/(app)/home.tsx`) is substantially built at v2.0.6. All structural components exist: `SobrietyCounter`, `StreakDots`, `CheckInModal`, quick-action buttons, and event cards. The check-in data flow is complete and correct — `markTodayCheckedIn` upserts to `daily_checkins`, updates local `weeklyStreak`, and persists to SecureStore.

The primary work in this phase is (1) a targeted pixel-polish pass comparing the live code against Figma node 0:1940 values, (2) verifying the Meeting Guide API actually returns data on a real device, and (3) adding the companion FAB — a new component not yet present in the codebase. The FAB is a placeholder for Phase 7 (guided flows) but must be visually present now per R1.

**Primary recommendation:** Audit each visual section against the R1 spec checklist (gradient, arc, quick-action sizing, check-in card, streak dots, event cards), fix any deviations found, add the companion FAB as `position: 'absolute'` overlay on the home `View` root, then trigger an EAS build for user device validation.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| R1 | Dashboard (Home Screen) — pixel-perfect Figma match, check-in end-to-end, real meeting data, companion FAB | All findings below address R1 directly. Sub-requirements mapped in Code Audit section. |
</phase_requirements>

---

## Standard Stack

### Core (already installed — no new packages needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `expo-linear-gradient` | 15.0.8 | Background gradient + event card gradients | Already in use; Expo-managed, new-arch safe |
| `react-native-svg` | 15.12.1 | Sobriety arc SVG rendering | Already in `SobrietyCounter`; handles complex path math |
| `react-native-reanimated` | 4.2.2 | CheckInModal slide animation | Already wired; v4 required for RN 0.81.5 + new arch |
| `expo-location` | 19.0.8 | GPS for meeting finder | Already wired in home.tsx |
| `@expo/vector-icons` (Ionicons) | 15.0.3 | All icons across the home screen | Already used throughout |
| `supabase-js` | 2.97.0 | `daily_checkins` upsert, `profiles` read | All data flows use this |

### No New Packages Required

This phase is UI polish and data plumbing on existing infrastructure. Adding new packages risks new-arch compatibility issues and build failures. Everything needed is present.

**Installation:** None — all dependencies already installed.

---

## Architecture Patterns

### Recommended Project Structure (no changes)

```
app/(app)/home.tsx          — screen (already exists, needs edits)
components/ui/
  SobrietyCounter.tsx       — arc widget (exists, may need size/color tweak)
  StreakDots.tsx             — week dots (exists, may need day-label addition)
  CheckInModal.tsx           — bottom sheet modal (exists, complete)
  CompanionFAB.tsx           — NEW: floating action button
services/meetings.ts         — Meeting Guide API (exists, complete)
store/progress.ts            — check-in state + Supabase sync (exists, complete)
```

### Pattern 1: Companion FAB — Absolute Overlay

**What:** A circular/pill button rendered as a sibling to `<ScrollView>` inside the root `<View>`, positioned `position: 'absolute'` so it floats above scroll content and does not push layout.

**When to use:** Any persistent action button that must remain visible while scrolling.

**Key constraint:** Must sit above the tab bar. The tab bar is rendered by Expo Router outside the screen — the FAB lives inside `app/(app)/home.tsx`'s root `View`. Its `bottom` value must account for the tab bar height (~60–70px) plus safe area inset bottom.

**Example structure:**
```typescript
// In home.tsx — sibling to ScrollView, inside root View
<View style={styles.root}>
  <LinearGradient ... />
  <ScrollView ...>
    {/* content */}
  </ScrollView>
  <CheckInModal ... />
  <CompanionFAB onPress={() => router.push('/(app)/companion' as any)} />
</View>
```

**CompanionFAB style pattern (new component):**
```typescript
// components/ui/CompanionFAB.tsx
// Position: absolute, bottom-right, above tab bar
const styles = StyleSheet.create({
  fab: {
    position:        'absolute',
    right:           20,
    bottom:          20,          // caller adds insets.bottom if needed
    width:           56,
    height:          56,
    borderRadius:    28,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
    // Android elevation for shadow
    elevation:       6,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.2,
    shadowRadius:    4,
  },
});
```

**Navigation target for Phase 1:** A placeholder screen (`app/(app)/companion.tsx`) showing "Coming Soon" — identical pattern to `app/(app)/call/` stub. Register it in `app/(app)/_layout.tsx` with `options={{ href: null }}`.

### Pattern 2: Check-In Card — Overflow Emoji

**What:** The thumbs-up emoji at `position: 'absolute', right: -4, bottom: -8` relies on the parent `checkInCard` having `overflow: 'visible'` (the default in React Native). The card needs `paddingRight: 90` to prevent text from overlapping the emoji.

**Verified in code:** `home.tsx` line 320: `paddingRight: 90`, line 354: `right: -4, bottom: -8`. This is correct per R1 spec.

### Pattern 3: Progress Store → Streak Dots

**What:** `markTodayCheckedIn` in `store/progress.ts` does an optimistic local update first, then upserts to Supabase. The weekly streak array (`boolean[7]`, index 0 = Monday) is passed directly to `<StreakDots streak={weeklyStreak} />`.

**Data flow verified:**
1. User submits `CheckInModal` → `handleCheckInConfirm(mood, notes)` in `home.tsx`
2. Calls `markTodayCheckedIn(user?.id, mood, notes)` in progress store
3. Store sets `weeklyStreak[todayDayIndex()] = true` optimistically
4. Upserts `{ user_id, checked_in_date, mood, notes }` to `daily_checkins`
5. Persists to SecureStore
6. `StreakDots` re-renders with updated `weeklyStreak` from Zustand subscription

**This flow is complete and correct.** No changes needed to the data path.

### Anti-Patterns to Avoid

- **Do NOT use `fontWeight`** — the eslint rule is a warn, not error, but it will produce wrong weights on Android. Always use `Fonts.poppinsBold`, `Fonts.jostMedium`, etc.
- **Do NOT add inline color strings** — use `Colors.*` constants.
- **Do NOT run `expo start --web`** for any verification — web always shows black screen due to `expo-secure-store`.
- **Do NOT add any new native package** without verifying it has `codegenConfig` in its `package.json`. Old-arch packages cause ANR or startup crash.
- **Do NOT use `overflow: 'hidden'` on the check-in card** — this would clip the overflow thumbs-up emoji.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sobriety arc progress ring | Custom SVG from scratch | Existing `SobrietyCounter.tsx` | Already implements polar-to-cartesian math, correct arc span (210°), gradient fill |
| Streak day tracking | Custom weekday logic | Existing `store/progress.ts` `markTodayCheckedIn` + `loadProgress` | Handles week reset, Supabase sync, SecureStore persistence |
| Modal bottom sheet animation | Custom animated modal | Existing `CheckInModal.tsx` with Reanimated `SlideInDown` | Already handles keyboard avoidance, dismiss on backdrop, loading state |
| Meeting data fetch | Custom REST client | Existing `services/meetings.ts` `fetchNearbyMeetings` | Handles 8s timeout, response normalization, empty-array-on-error |
| FAB shadow on Android | CSS box-shadow | `elevation` prop | React Native only supports `elevation` for Android shadows; CSS `box-shadow` has no effect |

**Key insight:** The entire data infrastructure for this phase already exists. The planner should scope tasks as UI corrections and additions, not rebuilds.

---

## Common Pitfalls

### Pitfall 1: Figma Node Access Requires Auth Token

**What goes wrong:** The Figma REST API returns 403 without a personal access token. Pixel-matching must be done by reading existing code values against the R1 spec bullet points in `REQUIREMENTS.md`, not by fetching Figma directly.

**Why it happens:** Figma API requires `X-Figma-Token` header.

**How to avoid:** Use the R1 bullet-point spec in `REQUIREMENTS.md` as ground truth for values. The REQUIREMENTS.md contains exact pixel specs derived from Figma:
- Arc: 230px, ring colors `Colors.arcBlue` (track) + `Colors.arcGradStart`→`Colors.arcGradEnd` (fill)
- Quick actions: 55×60px, `Colors.primary`, `borderRadius: 10`
- Check-in card: `minHeight: 150`, `Colors.checkInCard` (`#c8f2ff`)
- Welcome header: Jost Regular 16px + Poppins SemiBold 16px

**Warning signs:** Any code value that differs from the REQUIREMENTS.md spec is a deviation to fix.

### Pitfall 2: Meeting Guide API — ECONNREFUSED in Server/CI Context

**What goes wrong:** `https://api.aa-intergroup.org/api/meetings` refused connection in a non-device context (server fetch test). The API may be geographically restricted, require a real device network, or be intermittently down.

**Why it happens:** The API is an external public endpoint with no SLA guarantee. The app already handles this with a try/catch returning `[]` and showing placeholder cards.

**How to avoid:** The fallback placeholder cards (showing "AA Meetings Near You") already exist and display correctly when the API returns empty. Verify on-device that the location permission flow and API call work. If the API is down during testing, the placeholder is the correct graceful degradation.

**Warning signs:** If `meetings.length === 0` on device after granting location permission, log the fetch URL and check response in Metro logs (on physical device via `adb logcat`).

### Pitfall 3: FAB Bottom Value Ignores Tab Bar Height

**What goes wrong:** A FAB positioned at `bottom: 20` will be visually below the tab bar on Android, covered by it.

**Why it happens:** The custom tab bar in `app/(app)/_layout.tsx` is rendered outside the screen's View but still takes up bottom space. The screen's `View` occupies the full height including the area behind the tab bar.

**How to avoid:** Either (a) use `useSafeAreaInsets()` to get `insets.bottom` and add the tab bar height (~60px) to the FAB's `bottom` value, or (b) render the FAB inside the `ScrollView`'s `contentContainerStyle` at the very end with a `alignSelf: 'flex-end'` wrapper. Option (a) is the standard pattern for FABs.

**Concrete values:** Tab bar `paddingTop: 8` + icon height (~24px) + `paddingBottom: max(insets.bottom, 10)` ≈ 60–72px total. Use `bottom: 80` or dynamically `bottom: insets.bottom + 70`.

### Pitfall 4: StreakDots Missing Day Labels

**What goes wrong:** The current `StreakDots` component renders 7 dots with no day labels (M/T/W/T/F/S/S). The R1 spec says "Mon–Sun, filled for checked-in days" — this likely implies day labels visible in Figma.

**Why it happens:** The component was built for function (dot fill) without labels.

**How to avoid:** Compare the component's current output (dots only) with Figma expectation. If day labels are required, extend `StreakDots` to render abbreviated day names below each dot using `Fonts.poppins` at `fontSize: 9` or `10` with `Colors.textMuted`.

**Warning signs:** If the user's Figma screenshot shows "M T W T F S S" text under the dots, this is a required addition.

### Pitfall 5: SobrietyCounter Label Casing

**What goes wrong:** The arc label renders "Days Sober" with `textTransform: 'capitalize'` applied but the string is already mixed case. The REQUIREMENTS.md spec says `"days sober"` label — the current code renders "Days Sober" (initial caps).

**Why it happens:** `textTransform: 'capitalize'` on the label text in `SobrietyCounter` combined with the string "Days Sober" would produce "Days Sober" (no change). The R1 spec says the label should be `"days sober"` lowercase — this may be intentional Figma styling.

**How to avoid:** Check whether Figma shows "days sober" lowercase or "Days Sober" titlecase. If lowercase is required, change the string to `"days sober"` and remove `textTransform: 'capitalize'` from the style.

### Pitfall 6: `overflow: 'visible'` Clip on Android

**What goes wrong:** Some Android versions clip `overflow: 'visible'` children for Views with `borderRadius`. The thumbs-up emoji overflowing the card bottom-right might be clipped.

**Why it happens:** Android rendering of borderRadius + overflow visible can clip child content in certain situations.

**How to avoid:** Test specifically on the user's device. If the emoji is clipped, wrap it in a separate `position: 'absolute'` View outside the card (as a sibling at the ScrollView's content level).

---

## Code Examples

Verified patterns from existing codebase:

### Check-In Flow (complete, verified working)
```typescript
// home.tsx — handleCheckInConfirm calls store
const handleCheckInConfirm = useCallback(async (mood: number, notes: string) => {
  await markTodayCheckedIn(user?.id, mood, notes);
  setCheckInVisible(false);
}, [user?.id, markTodayCheckedIn]);

// store/progress.ts — markTodayCheckedIn
markTodayCheckedIn: async (userId, mood, notes) => {
  const streak = [...get().weeklyStreak];
  streak[todayDayIndex()] = true;
  set({ weeklyStreak: streak, checkInsCompleted: get().checkInsCompleted + 1 });
  if (userId) {
    await supabase.from('daily_checkins').upsert({
      user_id: userId,
      checked_in_date: today,
      ...(mood !== undefined ? { mood } : {}),
      ...(notes ? { notes } : {}),
    });
  }
  await _persist(get());
},
```

### Companion FAB (new component pattern)
```typescript
// components/ui/CompanionFAB.tsx
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

type Props = { onPress: () => void; bottomOffset?: number };

export function CompanionFAB({ onPress, bottomOffset = 20 }: Props) {
  return (
    <TouchableOpacity
      style={[styles.fab, { bottom: bottomOffset }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons name="chatbubble-ellipses" size={26} color={Colors.white} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position:        'absolute',
    right:           20,
    width:           56,
    height:          56,
    borderRadius:    28,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
    elevation:       6,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.2,
    shadowRadius:    4,
  },
});
```

### Registering New Hidden Screen in Layout
```typescript
// app/(app)/_layout.tsx — add inside <Tabs>:
<Tabs.Screen name="companion" options={{ href: null }} />
```

### Meeting Guide API URL (verified in services/meetings.ts)
```typescript
const BASE = 'https://api.aa-intergroup.org/api/meetings';
const url = `${BASE}?latitude=${latitude}&longitude=${longitude}&distance=${distanceMiles}&distance_units=miles`;
// 8 second timeout via AbortSignal.timeout(8000)
// Returns [] on any error — placeholder cards shown when empty
```

---

## Code Audit: R1 Spec vs Current Implementation

This is the core finding of this research — a direct comparison of REQUIREMENTS.md R1 bullets against the actual code:

| R1 Spec Item | Current Code Value | Status | Action Required |
|---|---|---|---|
| Full-screen gradient matches Figma | `rgba(171,49,240,0.13)` → `rgba(204,115,254,0.07)` → `rgba(200,242,255,0.08)` → `transparent` | LIKELY OK | Verify on device |
| Welcome: "Welcome Back" Jost Regular 16px, rgba(0,0,0,0.5) | `Fonts.jost`, `fontSize: 16`, `color: Colors.textMuted` (`rgba(0,0,0,0.5)`) | MATCHES | None |
| Welcome: first name Poppins SemiBold 16px | `Fonts.poppinsSemiBold`, `fontSize: 16` | MATCHES | None |
| Sobriety arc: 230px | `size={230}` passed to `SobrietyCounter` | MATCHES | None |
| Arc ring colors correct | Track: `Colors.arcBlue` (`#B8E8FF`); Fill: `Colors.arcGradStart`→`Colors.arcGradEnd` (`#ab31f0`→`#A855F7`) | MATCHES | None |
| Arc: "days sober" label | Current: `"Days Sober"` with `textTransform: 'capitalize'` | POSSIBLE MISMATCH | Check Figma casing |
| 5 quick-action buttons: 55×60px | `width: 55, height: 60` | MATCHES | None |
| Quick actions: #b740ff, borderRadius 10 | `backgroundColor: Colors.primary`, `borderRadius: 10` | MATCHES | None |
| Check-in card: Colors.checkInCard, minHeight 150 | `backgroundColor: Colors.checkInCard`, `minHeight: 150` | MATCHES | None |
| Thumbs-up overflows bottom-right | `position: 'absolute', right: -4, bottom: -8, fontSize: 90` | MATCHES | Test on device for clip |
| Streak dots Mon–Sun, filled for check-ins | 7 dots rendered, filled with `Colors.primary` | PARTIAL — no day labels | Investigate Figma for labels |
| Daily check-in modal: 5 mood emojis, notes, saves to Supabase | `MOODS` array has 5 items; notes TextInput; upserts to `daily_checkins` | MATCHES | None |
| Upcoming Events: 2 meeting cards, real data | Shows 2 cards from API or fallback placeholders | MATCHES | Verify API on device |
| "View all" links to meetings screen | `router.push('/(app)/meetings')` | MATCHES | None |
| Floating companion FAB | **NOT PRESENT** | MISSING | Add `CompanionFAB` component |

**Summary of required changes:**
1. Add `CompanionFAB` component (new file)
2. Add placeholder `companion.tsx` screen
3. Register `companion` in `_layout.tsx`
4. Integrate FAB into `home.tsx`
5. Investigate `StreakDots` day labels against Figma
6. Investigate arc label casing against Figma spec

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| WebRTC video SDK | Removed / stubbed | v1.0.40 | No WebRTC compile; eliminates ANR |
| `@gorhom/bottom-sheet` | Removed | v1.0.45 | CheckInModal uses native `Modal` + Reanimated instead |
| Sentry integration | Removed | v1.0.44 | No crash reporting; no `console.log` (warn only) |
| fontWeight prop | Named fontFamily (Fonts.*) | v2.0.0 | Correct weight rendering on Android |
| No env vars in eas.json | All EXPO_PUBLIC_* embedded | v2.0.1 | App no longer crashes on launch from missing Supabase URL |

**Deprecated/outdated:**
- `@react-native-community/netinfo`: Removed in v2.0.1 (old-arch, unused)
- Any package without `codegenConfig`: Will cause ANR — do not add

---

## Meeting Guide API Assessment

**API endpoint:** `https://api.aa-intergroup.org/api/meetings`
**Auth required:** None (public API)
**Fetch result from research context:** ECONNREFUSED — API was not reachable from the research server environment (expected; not a device network)
**On-device behavior:** Unknown — must be verified during EAS build test
**Fallback:** Placeholder cards ("AA Meetings Near You", "NA Meetings Near You") already rendered when `meetings.length === 0`
**Resilience:** 8-second `AbortSignal.timeout`, `try/catch` returning `[]`, shows placeholder on failure

**Confidence (API works on real device):** MEDIUM — the code is correct; the API is a real public endpoint used by the Meeting Guide app ecosystem; real-device test required to confirm.

---

## Open Questions

1. **Does Figma node 0:1940 show day labels (M/T/W/T/F/S/S) under StreakDots?**
   - What we know: Current `StreakDots` renders dots only, no text labels
   - What's unclear: Whether Figma shows day labels below the dots
   - Recommendation: User should screenshot the Figma node or the planner should add a task to check and optionally extend `StreakDots`

2. **Does the arc label read "Days Sober" (titlecase) or "days sober" (lowercase) in Figma?**
   - What we know: Current code renders "Days Sober" with `textTransform: 'capitalize'`
   - What's unclear: Figma spec may show lowercase
   - Recommendation: Include a task to verify and correct; low effort fix if needed

3. **Does Meeting Guide API return data from the user's location on device?**
   - What we know: The fetch logic is correct; API is a real endpoint
   - What's unclear: Whether the specific user's region has data, and whether the API is operational
   - Recommendation: EAS build test with location granted will confirm; fallback cards ensure graceful degradation

4. **Should CompanionFAB be visible only on home screen or on all tabs?**
   - What we know: R1 says "visible on home screen"; Phase 7 will expand to open the companion
   - What's unclear: Whether the FAB should persist across all tabs (common pattern) or be home-only
   - Recommendation: Home-only for Phase 1 (matches R1 scope); Phase 7 can move it to tab layout if needed

---

## Validation Architecture

> `workflow.nyquist_validation` key is absent from `.planning/config.json` — treating as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | No automated test framework detected in project |
| Config file | None — Wave 0 gap |
| Quick run command | N/A — EAS build + device test |
| Full suite command | N/A — EAS build + device test |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| R1-gradient | Background gradient renders correctly | manual | EAS build + device visual check | N/A |
| R1-header | Welcome header shows correct text/fonts | manual | EAS build + device visual check | N/A |
| R1-arc | Sobriety arc renders at 230px with correct colors | manual | EAS build + device visual check | N/A |
| R1-quickactions | 5 quick-action buttons, 55×60, navigate correctly | manual | EAS build + tap test | N/A |
| R1-checkin | Check-in modal saves mood+notes to Supabase, updates dots | manual | EAS build + Supabase dashboard verify | N/A |
| R1-streakdots | Streak dots reflect checked-in days | manual | EAS build + check-in then verify | N/A |
| R1-meetings | Event cards show real or placeholder meeting data | manual | EAS build + grant location | N/A |
| R1-fab | Companion FAB visible on home screen | manual | EAS build + visual check | N/A (new) |

**Note on test automation:** This project has no test framework installed (`jest`, `vitest`, `detox`, etc. are absent from `package.json`). All verification is manual on-device via EAS builds. This is a project-wide pattern — no Wave 0 test infrastructure gaps to fill because the test strategy is intentionally device-based.

### Sampling Rate

- **Per task commit:** Visual inspection from last EAS build (no automated run)
- **Per wave merge:** N/A (single wave phase)
- **Phase gate:** EAS `preview` build green on user's Android device before marking phase complete

### Wave 0 Gaps

None for test infrastructure (project deliberately uses device testing, not automated tests). The only new file needed is `components/ui/CompanionFAB.tsx` and `app/(app)/companion.tsx`.

---

## Sources

### Primary (HIGH confidence)
- Direct file reads: `app/(app)/home.tsx`, `components/ui/SobrietyCounter.tsx`, `components/ui/StreakDots.tsx`, `components/ui/CheckInModal.tsx`, `services/meetings.ts`, `store/progress.ts`, `app/(app)/_layout.tsx`, `constants/colors.ts`, `constants/fonts.ts`, `.planning/REQUIREMENTS.md`, `.planning/codebase/STACK.md`, `.planning/codebase/CONVENTIONS.md`, `.planning/codebase/ARCHITECTURE.md`

### Secondary (MEDIUM confidence)
- [Meeting Guide API spec — github.com/code4recovery/spec](https://github.com/code4recovery/spec) — confirms endpoint format and field names match `services/meetings.ts` implementation
- [React Native FAB patterns 2025](https://dev.to/aneeqakhan/how-to-create-a-floating-button-in-react-native-a-step-by-step-guide-30f5) — confirms `position: 'absolute'` + `elevation` pattern for Android FAB

### Tertiary (LOW confidence)
- Figma API: Not accessible (403 — requires personal access token). Visual pixel-matching values derived from `REQUIREMENTS.md` spec bullets and existing code instead.
- Meeting Guide API live response: ECONNREFUSED from research environment — on-device behavior unconfirmed.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed present in package.json via STACK.md
- Architecture: HIGH — data flows read directly from store and screen source code
- Pitfalls: HIGH for known issues (FAB positioning, overflow emoji, font rules); MEDIUM for Figma visual diff (no direct Figma access)
- Meeting Guide API: MEDIUM — code is correct, live behavior requires device test

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (stable stack; Meeting Guide API uptime is external dependency)
