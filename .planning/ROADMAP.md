# Recoverly — Roadmap

## Milestone 1: Polish & Perfect Existing Screens

**Goal:** Every screen that's already built is Figma-pixel-perfect, fully functional, and data-driven before we add anything new.

**EAS build after each phase. User tests on device. Fix before moving on.**

---

### Phase 1 — Dashboard Pixel Polish

**Requirement:** R1

**Goal:** Home screen is indistinguishable from Figma node 0:1940. Every pixel correct.

**Tasks:**
1. Pull Figma design context (node 0:1940) — verify all spacing, typography, colors
2. Fix any remaining gradient/arc/card deviations from Figma
3. Verify check-in modal is functional with mood + notes
4. Verify streak dots update correctly after check-in
5. Verify meeting cards load real data (Meeting Guide API)
6. Add companion FAB placeholder (navigates to coming-soon screen)
7. Screenshot comparison — fix any diffs before EAS build

**Success criteria:**
- Home screen matches Figma node 0:1940 at pixel level
- Check-in flow works end-to-end (modal → Supabase → streak updated)
- Meeting cards show real data or graceful placeholder
- No console errors

---

### Phase 2 — SOS / Crisis Polish + Data

**Requirement:** R2

**Goal:** All 6 crisis screens are Figma-perfect and incidents are logged to Supabase.

**Tasks:**
1. Pull Figma design context for each SOS screen
2. Pixel-match each screen to Figma
3. Wire `crisis_incidents` Supabase insert on sub-screen open
4. Log `actions_completed` on CTA taps (call sponsor, find meeting)
5. Crisis history screen: pull real rows from `crisis_incidents`

**Success criteria:**
- All 6 screens match Figma
- Crisis incidents appear in Supabase after testing
- Crisis history shows real data

---

### Phase 3 — Tracker (Real Data)

**Requirement:** R3

**Goal:** Tracker screen is accurate, live, and shows real check-in history.

**Tasks:**
1. Pull Figma design context for tracker screen
2. Pixel-match to Figma
3. Replace any mock data with Supabase `daily_checkins` query
4. Calendar or list view of check-in history
5. Milestone detection (30/60/90/180/365 days) + celebration card
6. Live days-sober count

**Success criteria:**
- Check-in history matches Supabase data
- Milestones trigger celebration on correct days
- Days counter is accurate

---

### Phase 4 — Goals (CRUD + Polish)

**Requirement:** R4

**Goal:** Goals screen is fully functional CRUD with Figma-correct UI.

**Tasks:**
1. Pull Figma design context for goals screen
2. Pixel-match to Figma
3. Verify add/edit/delete works with Supabase
4. Add progress indicator per goal
5. Target date display + overdue state

---

### Phase 5 — Profile (Complete + Polish)

**Requirement:** R5

**Goal:** Profile and Edit Profile are complete, polished, and save to Supabase.

**Tasks:**
1. Pull Figma design context for profile screens
2. Pixel-match to Figma
3. Avatar upload via expo-image-picker → Supabase Storage
4. All fields save correctly (name, bio, location, sobriety date, substance)
5. Inner circle + sponsor display

---

### Phase 6 — Journal (Full Feature)

**Requirement:** R6

**Goal:** Replace journal placeholder with a full feature.

**Tasks:**
1. Pull Figma design context for journal screens
2. Journal list screen — entries from `journal_entries`
3. New entry screen — mood selector, daily prompt, free text, tags
4. Photo attachment (expo-image-picker → Supabase Storage)
5. Save + edit + delete entries
6. Home screen Journal quick-action navigates here

---

## Milestone 2: Sober Companion (AI)

**Goal:** Build the centerpiece feature — the AI companion that defines Recoverly.

**EAS build after each phase.**

---

### Phase 7 — Companion Foundation (Guided Flows)

**Requirement:** R7a, R7c

**Goal:** Companion entry point + guided coping sequences work end-to-end.

**Tasks:**
1. Floating action button on home screen
2. Companion home screen: mood/situation selector (5 states)
3. Guided flow for each state (3–4 step sequences)
4. Quick-action CTAs: call sponsor, find meeting, breathing exercise, start journal entry
5. Human routing: sponsor dialer, inner circle, crisis lines (988, AA/NA hotlines)

---

### Phase 8 — AI Chat (Claude API)

**Requirement:** R7b

**Goal:** Real AI conversation with user-personalized context.

**Tasks:**
1. Claude API integration (`@anthropic-ai/sdk`) — verify new arch safe (JS-only SDK, no native modules)
2. System prompt: warm recovery companion, knows user's profile
3. Context injection: name, days sober, substance, triggers, last 7 days mood
4. Chat UI: message bubbles, typing indicator, send button
5. "Talk to a person" escape hatch always visible
6. Graceful error handling (API timeout, offline)

---

## Milestone 3: Social & Connections

**Goal:** Real 1:1 messaging and peer matching.

---

### Phase 9 — Messages (Stream Chat)

**Requirement:** R8

**Tasks:**
1. Wire Stream Chat SDK to messages screen
2. Conversation list with real channels
3. Full chat UI using Stream Chat components
4. DM creation from Find People

---

### Phase 10 — Sober Pal Matching

**Requirement:** R9

**Tasks:**
1. Browse profiles with substance/challenge filter
2. Send connect request
3. Accept → create Stream Chat channel
4. `connections` table in Supabase

---

## Build Strategy

| Phase | EAS Build | Notes |
|-------|-----------|-------|
| 1 | After phase | Dashboard verified |
| 3 | After phase | Tracker + SOS verified together (2+3) |
| 6 | After phase | All polished screens verified |
| 7 | After phase | Companion guided flows verified |
| 8 | After phase | AI chat verified |
| 10 | After phase | Full social verified |

Trigger builds at logical milestones, not every single phase, to save build time. User approves each build before proceeding.
