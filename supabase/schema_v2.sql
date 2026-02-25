-- ─────────────────────────────────────────────────────────────────────────────
-- Recoverly — Schema v2 additions
-- Run in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Allow all authenticated users to view any profile (social app) ────────
-- Drop the old "own only" select policy and replace with "all authenticated"
drop policy if exists "Users can view own profile" on public.profiles;

create policy "Authenticated users can view any profile"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- ─── 2. Add bio field to profiles ────────────────────────────────────────────
alter table public.profiles
  add column if not exists bio text;

-- ─── 3. crisis_incidents ─────────────────────────────────────────────────────
-- Logs every SOS trigger for pattern tracking

create table if not exists public.crisis_incidents (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  incident_type      text not null, -- 'feel-like-using' | 'just-relapsed' | 'self-harm' | 'bad-day' | 'feeling-anxious'
  actions_completed  text[]        default '{}',
  notes              text,
  created_at         timestamptz   default now()
);

alter table public.crisis_incidents enable row level security;

create policy "Users can view own crisis incidents"
  on public.crisis_incidents for select
  using (auth.uid() = user_id);

create policy "Users can insert own crisis incidents"
  on public.crisis_incidents for insert
  with check (auth.uid() = user_id);

-- ─── 4. user_goals ───────────────────────────────────────────────────────────

create table if not exists public.user_goals (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  description  text,
  category     text default 'recovery', -- 'recovery' | 'personal' | 'work' | 'health'
  target_date  date,
  completed    boolean default false,
  completed_at timestamptz,
  created_at   timestamptz default now()
);

alter table public.user_goals enable row level security;

create policy "Users can manage own goals"
  on public.user_goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── 5. user_favorites ───────────────────────────────────────────────────────

create table if not exists public.user_favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_type   text not null, -- 'meeting' | 'resource' | 'article'
  title       text not null,
  description text,
  url         text,
  item_data   jsonb default '{}',
  created_at  timestamptz default now(),
  unique (user_id, item_type, title)
);

alter table public.user_favorites enable row level security;

create policy "Users can manage own favorites"
  on public.user_favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
