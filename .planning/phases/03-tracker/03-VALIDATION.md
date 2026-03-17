---
phase: 3
slug: tracker
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — project uses device-based testing via EAS builds |
| **Config file** | None — no jest/vitest/detox installed |
| **Quick run command** | `npx tsc --noEmit --skipLibCheck` |
| **Full suite command** | EAS build + install on Android device + manual test |
| **Estimated runtime** | ~25 min (EAS build) + ~10 min manual |

---

## Sampling Rate

- **After every task commit:** TypeScript check (`npx tsc --noEmit --skipLibCheck`)
- **After all tasks complete:** EAS preview build + device test
- **Before `/gsd:verify-work`:** EAS build green on user's Android device

---

## Per-Task Verification Map

| Task | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|------|------|------|-------------|-----------|-------------------|--------|
| Supabase schema migration (mood/notes) | 03-01 | 0 | R3 | manual | `npx tsc --noEmit --skipLibCheck` | ⬜ pending |
| loadAllHistory() store action | 03-01 | 1 | R3 | manual | `npx tsc --noEmit --skipLibCheck` | ⬜ pending |
| Monthly calendar grid component | 03-01 | 1 | R3 | manual | `npx tsc --noEmit --skipLibCheck` | ⬜ pending |
| CelebrationModal component | 03-01 | 1 | R3 | manual | `npx tsc --noEmit --skipLibCheck` | ⬜ pending |
| Wire tracker.tsx with history + celebration | 03-01 | 1 | R3 | manual | EAS build device check | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Supabase migration: `ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS mood smallint; ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS notes text;`
  - Run in Supabase SQL editor before executing code tasks
  - Safe to run even if columns already exist (`IF NOT EXISTS`)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Calendar shows check-in dots for past days | R3 | Requires live Supabase data + device | Check in on 3 days → open tracker → verify dots on those dates |
| Days sober counter matches sobriety start date | R3 | Date math on device | Compare counter to known sobriety start date |
| Tapping a day shows mood/notes tooltip | R3 | Tap interaction | Tap a checked-in day → verify mood + notes displayed |
| Milestone card fires on first reach of 30/90/180/365 days | R3 | Requires specific day count | Set sobriety date to 30 days ago → open app → verify celebration |
| Milestone does NOT re-fire on next open | R3 | SecureStore persistence | Close + reopen app → milestone modal should not appear again |

---

## Validation Sign-Off

- [ ] Wave 0 migration documented and runnable
- [ ] All tasks have TypeScript verify after each commit
- [ ] Nyquist: no 3 consecutive tasks without automated verify
- [ ] `nyquist_compliant: true` set in frontmatter when complete

**Approval:** pending
