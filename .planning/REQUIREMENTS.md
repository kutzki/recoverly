# Recoverly — Requirements

## R1: Dashboard (Home Screen)

**Goal:** Pixel-perfect Figma match (node 0:1940). Every element correct size, color, font.

- [ ] Full-screen gradient background matches Figma exactly
- [ ] Welcome header: "Welcome Back" (Jost Regular 16px, rgba(0,0,0,0.5)) + user first name (Poppins SemiBold 16px)
- [ ] Sobriety arc: 230px, correct ring colors, days + "days sober" label
- [ ] 5 quick-action buttons: 55×60px, #b740ff, borderRadius 10, correct icons + labels
- [ ] Check-in card: correct card color, minHeight 150, thumbs-up emoji overflows bottom-right
- [ ] Streak dots: Mon–Sun, filled for checked-in days
- [ ] Daily check-in modal: 5 mood emojis, optional notes, saves to Supabase
- [ ] Upcoming Events: 2 meeting cards with real data from Meeting Guide API
- [ ] "View all" links to meetings screen
- [ ] Floating companion FAB — launches companion screen

---

## R2: SOS / Crisis Screens

**Goal:** All 6 screens Figma-perfect, crisis incidents logged to Supabase.

- [ ] SOS index: all 5 sub-screen tiles match Figma exactly
- [ ] Each sub-screen: correct gradient, copy, and CTAs
- [ ] Crisis incident logged to `crisis_incidents` on sub-screen open
- [ ] CTA actions (call sponsor, find meeting) logged to `actions_completed`
- [ ] Crisis history screen shows real Supabase data

---

## R3: Tracker

**Goal:** Shows real check-in history and accurate stats from Supabase.

- [ ] Weekly streak visual matches check-ins in `daily_checkins`
- [ ] Days sober count is live and accurate
- [ ] Check-in history: calendar or list view, tappable days
- [ ] Milestone detection: 7, 30, 60, 90, 180, 365 days — celebration card

---

## R4: Goals

**Goal:** CRUD goals with progress tracking.

- [ ] List of user goals pulled from `user_goals`
- [ ] Add / edit / delete goals
- [ ] Mark complete → completed_at timestamp
- [ ] Progress indicator per goal
- [ ] Target date display + overdue state

---

## R5: Profile

**Goal:** Complete, polished profile view and edit.

- [ ] Avatar (image picker), name, username display
- [ ] Sobriety start date + substance shown
- [ ] Bio, location
- [ ] Edit profile screen saves to `profiles`
- [ ] Inner circle and sponsor correctly displayed

---

## R6: Journal

**Goal:** Full journal feature — write, save, browse entries.

- [ ] Journal list: entries sorted by date, mood emoji, title preview
- [ ] New entry: mood selector (1–5), guided prompt (rotates daily), free text body
- [ ] Save to `journal_entries` Supabase table
- [ ] Photo attachment via expo-image-picker
- [ ] Tags: gratitude, trigger, milestone, general
- [ ] Home screen Journal quick-action navigates here

---

## R7: Sober Companion (AI)

**Goal:** The centerpiece feature — hybrid AI + guided flows for hard moments.

### R7a: Entry & Guided Quick-Actions
- [ ] Floating action button on home screen opens companion
- [ ] Mood/situation selector: Urge to use, Anxious, Lonely, Relapsed, Just checking in
- [ ] Each route: 3–4 step guided coping sequence with relevant CTAs
- [ ] Quick-actions: call sponsor, find meeting, breathing exercise, journal entry

### R7b: AI Chat
- [ ] Claude API integration — real conversational AI
- [ ] Context injected per conversation:
  - User name + days sober
  - Substance + stated triggers (from profile)
  - Last 7 days mood scores
- [ ] System prompt positions Claude as a warm, recovery-knowledgeable companion
- [ ] Chat history persisted per session (in-memory, not required to persist across sessions v1)
- [ ] "Escalate" button always visible → routes to human (sponsor / crisis line)

### R7c: Human Routing
- [ ] Tap sponsor name → opens phone dialer with sponsor number
- [ ] Tap inner circle member → opens dialer
- [ ] Find meeting now → opens meetings screen filtered to today
- [ ] Crisis line → SAMHSA 988 + AA/NA hotline

---

## R8: Messages / Chat

**Goal:** Real 1:1 chat via Stream Chat SDK.

- [ ] Conversation list with unread counts
- [ ] Full chat UI (Stream Chat components)
- [ ] Create DM from Find People / Sober Pal match

---

## R9: Sober Pal Matching

**Goal:** Browse and connect with recovery peers.

- [ ] Browse profiles (substance match, location)
- [ ] Send connect request → accepted → Stream Chat channel created
- [ ] Connections tracked in Supabase `connections` table

---

## Non-Functional Requirements

- Android only, no web/iOS
- All screens use Poppins + Jost, no fontWeight
- All new native packages must have `codegenConfig` (new arch safe)
- No Sentry (caused crashes in v1.0.41–44)
- EAS build after each milestone — user tests on device
- No web preview tools
