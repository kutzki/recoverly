---
phase: 1
slug: dashboard-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — project uses device-based testing via EAS builds |
| **Config file** | None — no jest/vitest/detox installed |
| **Quick run command** | `npx tsc --noEmit --skipLibCheck` (TypeScript check only) |
| **Full suite command** | EAS build + install on Android device + manual test |
| **Estimated runtime** | ~25 min (EAS build) + ~5 min (manual device test) |

---

## Sampling Rate

- **After every task commit:** TypeScript check (`npx tsc --noEmit --skipLibCheck`)
- **After every plan wave:** Full device test via EAS build
- **Before `/gsd:verify-work`:** EAS build green on user's Android device
- **Max feedback latency:** Per EAS build cycle

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| CompanionFAB component | 01 | 1 | R1 | manual | `npx tsc --noEmit --skipLibCheck` | ❌ new | ⬜ pending |
| companion.tsx screen | 01 | 1 | R1 | manual | `npx tsc --noEmit --skipLibCheck` | ❌ new | ⬜ pending |
| Register companion in _layout | 01 | 1 | R1 | manual | `npx tsc --noEmit --skipLibCheck` | ✅ exists | ⬜ pending |
| FAB integrated in home.tsx | 01 | 1 | R1 | manual | `npx tsc --noEmit --skipLibCheck` | ✅ exists | ⬜ pending |
| StreakDots day labels | 01 | 1 | R1 | manual | EAS build device check | ✅ exists | ⬜ pending |
| Arc label casing | 01 | 1 | R1 | manual | EAS build device check | ✅ exists | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None — no test infrastructure gaps. Project uses intentional device-based testing. All phase verifications are manual on-device via EAS preview build.

*Existing infrastructure (TypeScript check only) covers type safety. Visual and behavioral verification requires EAS build.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Background gradient matches Figma | R1 | Visual — no automated visual regression | Open app on device, compare home screen gradient to Figma node 0:1940 |
| Quick-action buttons 55×60px, correct colors | R1 | Visual pixel check | Visually verify 5 buttons are equal size, #b740ff bg, correct icons |
| Check-in modal opens, saves mood + notes to Supabase | R1 | Requires live Supabase + device auth | Tap card, select mood, add notes, confirm → check Supabase daily_checkins table |
| Streak dots update after check-in | R1 | Requires live state update | After check-in, verify today's dot fills |
| Meeting cards show real AA/NA data | R1 | Requires GPS + live external API | Grant location on device, verify cards show real meeting names |
| Companion FAB visible on home screen | R1 | Visual | Verify purple circle with chat icon at bottom-right, above tab bar |
| FAB navigates to companion screen | R1 | Tap interaction | Tap FAB, verify companion coming-soon screen opens |
| Arc "days sober" label casing | R1 | Visual Figma comparison | Verify label matches Figma spec (lowercase vs titlecase) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: TypeScript check after every commit
- [ ] Wave 0 covers all MISSING references (N/A — no test framework)
- [ ] No watch-mode flags
- [ ] Feedback latency: TypeScript ~5s; full device test per EAS build
- [ ] `nyquist_compliant: true` set in frontmatter when complete

**Approval:** pending
