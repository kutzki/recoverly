# Roadmap: Recoverly

## Overview

Polish every existing screen to Figma-pixel-perfect perfection, then build the AI sober companion that defines the app. Three milestones: (1) all existing screens polished + data-driven, (2) the hybrid AI companion, (3) social/messaging features.

## Phases

- [x] **Phase 1: Dashboard Polish** - Pixel-perfect home screen matching Figma node 0:1940, functional check-in flow (completed 2026-03-15)
- [ ] **Phase 2: SOS Polish + Data** - All 6 crisis screens Figma-matched, incidents logged to Supabase
- [ ] **Phase 3: Tracker** - Real check-in history from Supabase, milestone detection
- [ ] **Phase 4: Goals** - CRUD goals with progress tracking
- [ ] **Phase 5: Profile** - Complete profile view/edit, avatar upload
- [ ] **Phase 6: Journal** - Full journal feature (mood, prompts, entries, photos)
- [ ] **Phase 7: Companion Guided Flows** - Floating FAB, situation selector, coping sequences, human routing
- [ ] **Phase 8: AI Chat** - Claude API integration, personalized context, chat UI
- [ ] **Phase 9: Messages** - Stream Chat SDK wired to messages screen
- [ ] **Phase 10: Sober Pal** - Peer matching and connect system

## Phase Details

### Phase 1: Dashboard Polish
**Goal**: Home screen is indistinguishable from Figma node 0:1940. Check-in flow works end-to-end. Real meeting data in event cards.
**Depends on**: Nothing (first phase)
**Requirements**: R1
**Success Criteria** (what must be TRUE):
  1. Home screen matches Figma node 0:1940 at pixel level (gradient, arc, quick actions, check-in card, meetings)
  2. Check-in modal opens, accepts mood + notes, saves to Supabase, updates streak dots
  3. Meeting cards show real AA/NA data from Meeting Guide API (or graceful placeholder)
  4. Companion FAB placeholder is visible on home screen
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — CompanionFAB component, companion screen, layout registration, home.tsx integration
- [ ] 01-02-PLAN.md — Arc label casing fix, StreakDots day abbreviations

### Phase 2: SOS Polish + Data
**Goal**: All 6 crisis screens Figma-perfect. Every crisis incident and action logged to Supabase.
**Depends on**: Phase 1
**Requirements**: R2
**Success Criteria** (what must be TRUE):
  1. All 6 SOS screens match Figma designs
  2. Opening a crisis sub-screen writes a row to crisis_incidents in Supabase
  3. Tapping a CTA (call sponsor, find meeting) logs to actions_completed
  4. Crisis history screen shows real Supabase data
**Plans**: TBD

### Phase 3: Tracker
**Goal**: Tracker screen is accurate and data-driven. Real check-in history, live streak, milestone celebrations.
**Depends on**: Phase 2
**Requirements**: R3
**Success Criteria** (what must be TRUE):
  1. Tracker displays real daily_checkins data from Supabase
  2. Days sober counter is accurate and live
  3. Check-in history is viewable (calendar or list)
  4. Milestone days (30/60/90/180/365) trigger a celebration card
**Plans**: TBD

### Phase 4: Goals
**Goal**: Goals screen is fully functional CRUD with Figma-correct UI and progress tracking.
**Depends on**: Phase 3
**Requirements**: R4
**Success Criteria** (what must be TRUE):
  1. Goals list pulls from user_goals in Supabase
  2. User can add, edit, delete, and complete goals
  3. Each goal shows a progress indicator and target date
  4. Overdue goals are visually distinguished
**Plans**: TBD

### Phase 5: Profile
**Goal**: Profile and Edit Profile screens are complete, polished, and save all fields to Supabase.
**Depends on**: Phase 4
**Requirements**: R5
**Success Criteria** (what must be TRUE):
  1. Profile screen matches Figma with all fields visible
  2. Avatar upload works (expo-image-picker → Supabase Storage)
  3. All profile fields save correctly to profiles table
  4. Inner circle and sponsor are displayed correctly
**Plans**: TBD

### Phase 6: Journal
**Goal**: Journal placeholder replaced with full feature — mood, guided prompts, free text, photos, tags.
**Depends on**: Phase 5
**Requirements**: R6
**Success Criteria** (what must be TRUE):
  1. Journal list shows past entries sorted by date with mood emoji + preview
  2. New entry screen has mood selector, daily prompt, free text body, and tags
  3. Entries save to journal_entries in Supabase
  4. Photo attachment works via expo-image-picker
  5. Home screen Journal quick-action navigates to journal list
**Plans**: TBD

### Phase 7: Companion Guided Flows
**Goal**: Floating FAB on home launches companion. Situation selector + guided coping sequences + human routing all work.
**Depends on**: Phase 6
**Requirements**: R7a, R7c
**Success Criteria** (what must be TRUE):
  1. Floating FAB visible on home screen, opens companion
  2. Situation selector shows 5 states (urge, anxious, lonely, relapsed, checking in)
  3. Each state has a 3-4 step guided coping sequence with relevant CTAs
  4. Sponsor dialer, inner circle dialer, and crisis lines (988) all work
  5. "Find meeting now" routes to meetings screen
**Plans**: TBD

### Phase 8: AI Chat
**Goal**: Claude API chat with personalized user context. Warm, knowledgeable companion responses.
**Depends on**: Phase 7
**Requirements**: R7b
**Success Criteria** (what must be TRUE):
  1. AI chat responds to freeform user messages via Claude API
  2. Each conversation includes: user name, days sober, substance, triggers, last 7 days mood
  3. Chat UI has message bubbles, typing indicator, send button
  4. "Talk to a person" button always visible and functional
  5. Graceful error handling (offline, API timeout)
**Plans**: TBD

### Phase 9: Messages
**Goal**: Real 1:1 messaging via Stream Chat SDK wired to the messages screen.
**Depends on**: Phase 8
**Requirements**: R8
**Success Criteria** (what must be TRUE):
  1. Messages screen shows real Stream Chat conversation list with unread counts
  2. Opening a conversation shows full chat UI
  3. DMs can be created from Find People screen
**Plans**: TBD

### Phase 10: Sober Pal
**Goal**: Recovery peer browsing and matching system with connection requests.
**Depends on**: Phase 9
**Requirements**: R9
**Success Criteria** (what must be TRUE):
  1. Users can browse recovery peer profiles filtered by substance/challenges
  2. Connect request can be sent and accepted
  3. Accepted match creates a Stream Chat DM channel
  4. Connections stored in Supabase connections table
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Dashboard Polish | 2/2 | Complete   | 2026-03-15 |
| 2. SOS Polish + Data | 0/TBD | Not started | - |
| 3. Tracker | 0/TBD | Not started | - |
| 4. Goals | 0/TBD | Not started | - |
| 5. Profile | 0/TBD | Not started | - |
| 6. Journal | 0/TBD | Not started | - |
| 7. Companion Guided Flows | 0/TBD | Not started | - |
| 8. AI Chat | 0/TBD | Not started | - |
| 9. Messages | 0/TBD | Not started | - |
| 10. Sober Pal | 0/TBD | Not started | - |
