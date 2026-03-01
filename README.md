<p align="center">
  <img src="./assets/logo-vertical.png" alt="Recoverly" width="160" />
</p>

<h3 align="center">Your Recovery Companion.</h3>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Expo_SDK-54-000020?style=flat-square&logo=expo" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase" />
  <img src="https://img.shields.io/badge/Stream.io-Chat_+_Video-005FFF?style=flat-square" />
</p>

---

Recovery is one of the hardest journeys a person can take. Recoverly is built around one belief: **no one should have to take it alone.**

It's a mobile app that wraps everything a person in recovery needs — a sobriety tracker, crisis tools, peer support, community, goals, and journaling — into a single experience designed with real empathy.

---

## What's inside

### 🕐 Live Sobriety Counter
A real-time counter tracking every day, hour, minute, and second of sobriety. Milestone badges unlock at 1, 7, 30, 60, and 90 days — shareable straight from the app. Weekly streaks keep the momentum visual and tangible.

### 🆘 SOS — Built for Hard Moments
When things get difficult, one tap opens a full crisis system. Five guided paths for different situations — feeling like using, just relapsed, self-harm thoughts, a bad day, or anxiety. Direct lines to SAMHSA and the 988 Suicide & Crisis Lifeline. And your own Inner Circle of trusted contacts, always a tap away.

### 💬 Real-Time Chat & Video
Full one-on-one messaging and live video/audio calls — no third-party app needed, no friction. Just open Recoverly and connect.

### 🌐 Community Feed
Post milestones, share check-ins, react and comment. The kind of accountability that actually sticks comes from people who get it.

### 🎯 Goals
Set and track goals across Recovery, Health, Personal, and Work. Adjust them as your journey evolves.

### 📓 Journal
A private space to reflect. Log your mood, write freely, and build a personal record of your journey over time.

### 🤝 Sober Pal Network
Browse other people in recovery, see how long they've been sober, start a conversation, or jump on a call.

### 📅 Meetings & Resources
AA, NA, and SMART Recovery meeting links. Crisis hotlines, therapist finders, and mental health resources — curated and one tap away.

---

## Built with

| | |
|---|---|
| **Framework** | React Native + Expo SDK 54 |
| **Navigation** | Expo Router (file-based) |
| **Backend** | Supabase (PostgreSQL + Auth) |
| **Chat** | Stream Chat |
| **Video Calls** | Stream Video + WebRTC |
| **Feed** | Stream Feeds |
| **State** | Zustand + React Query |
| **Language** | TypeScript |
| **Build** | EAS (Expo Application Services) |

---

## Why Recoverly?

Recovery apps today are fragmented — a sobriety counter here, a meeting finder there, a separate app for chat. Recoverly brings it all together with an experience that's warm, fast, and purpose-built for people doing hard work every single day.

Every design decision — from the live counter to the SOS paths — was made with real recovery journeys in mind.

---

<p align="center">Built with care for those on the journey. 💜</p>

---

<details>
<summary>Developer setup</summary>

### Prerequisites
- Node.js 18+, Expo CLI, EAS CLI
- A [Supabase](https://supabase.com) project
- A [Stream.io](https://getstream.io) account (Chat + Video + Feeds)

### Install & run
```bash
git clone https://github.com/kutzki/recoverly.git
cd recoverly
npm install
npx expo start
```

### Environment variables
Create a `.env` file:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_STREAM_API_KEY=your_stream_api_key
```

### Build APK
```bash
eas build --platform android --profile preview
```

</details>
