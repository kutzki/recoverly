---
phase: 2
slug: sos-polish-data
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — project uses device-based testing via EAS builds |
| **Config file** | None — no jest/vitest/detox installed |
| **Quick run command** | `npx tsc --noEmit --skipLibCheck` (TypeScript check only) |
| **Full suite command** | EAS build + install on Android device + manual test |
| **Estimated runtime** | ~25 min (EAS build) + ~10 min (manual device test) |

---

## Sampling Rate

- **After every task commit:** TypeScript check (`npx tsc --noEmit --skipLibCheck`)
- **After all tasks complete:** EAS preview build + device test
- **Before `/gsd:verify-work`:** EAS build green on user's Android device
- **Max feedback latency:** Per EAS build cycle

---

## Per-Task Verification Map

| Task | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|------|------|------|-------------|-----------|-------------------|--------|
| Fix logging timing (insert on open) | 02-01 | 1 | R2 | manual | `npx tsc --noEmit --skipLibCheck` | ⬜ pending |
| Fix broken sponsor CTA | 02-01 | 1 | R2 | manual | `npx tsc --noEmit --skipLibCheck` | ⬜ pending |
| Fix relapsed external URL CTA | 02-01 | 1 | R2 | manual | `npx tsc --noEmit --skipLibCheck` | ⬜ pending |
| Fix self-harm inline color | 02-01 | 1 | R2 | manual | `npx tsc --noEmit --skipLibCheck` | ⬜ pending |
| SOS screens Figma polish | 02-02 | 1 | R2 | manual | EAS build device check | ⬜ pending |
| crisis-history real Supabase data | 02-01 | 1 | R2 | manual | EAS build + Supabase verify | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None — no test infrastructure gaps. Project uses intentional device-based testing.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Opening a sub-screen logs to crisis_incidents immediately | R2 | Requires live Supabase + device auth | Navigate to SOS → tap "I feel like using" → check Supabase crisis_incidents table for new row |
| Tapping sponsor CTA from feel-like-using routes correctly | R2 | Tap interaction on device | Tap "Call sponsor" → should open sponsor screen (not no-op) |
| Tapping "Find Meeting" in just-relapsed opens meetings screen | R2 | Navigation check | Tap "Find Meeting" → should open /(app)/meetings not external browser |
| Crisis history shows real Supabase rows | R2 | Requires live data | Open crisis history after triggering 2 incidents → verify both show |
| All 6 SOS screens match Figma designs | R2 | Visual comparison | Compare each screen side-by-side with Figma |
| actions_completed array updated when CTA is tapped | R2 | Supabase verify | Tap a CTA → check crisis_incidents row for updated actions_completed |

---

## Validation Sign-Off

- [ ] All tasks have automated TypeScript verify after each commit
- [ ] Sampling continuity: TypeScript check after every commit
- [ ] Wave 0: N/A (no test framework — intentional project policy)
- [ ] No watch-mode flags
- [ ] Feedback latency: TypeScript ~5s; full device test per EAS build
- [ ] `nyquist_compliant: true` set in frontmatter when complete

**Approval:** pending
