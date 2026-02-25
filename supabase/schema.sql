-- ─────────────────────────────────────────────────────────────────────────────
-- Recoverly — Supabase Database Schema
-- Run this entire file once in:
--   Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. profiles ──────────────────────────────────────────────────────────────
-- One row per user. Created automatically on first sign-up.

create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  name                text not null default '',
  username            text not null default '',
  sobriety_start_date timestamptz,
  challenges          text[]        default '{}',
  short_term_goal     text,
  location            text,
  sponsor_name        text,
  sponsor_phone       text,
  inner_circle        jsonb         default '[]',  -- [{ name, phone }]
  created_at          timestamptz   default now()
);

-- Row Level Security: users can only read/write their own profile
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ─── 2. daily_checkins ────────────────────────────────────────────────────────
-- One row per user per day when they tap the check-in thumb.

create table if not exists public.daily_checkins (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  checked_in_date   date not null default current_date,
  created_at        timestamptz default now(),
  unique (user_id, checked_in_date)
);

-- Row Level Security
alter table public.daily_checkins enable row level security;

create policy "Users can view own checkins"
  on public.daily_checkins for select
  using (auth.uid() = user_id);

create policy "Users can insert own checkins"
  on public.daily_checkins for insert
  with check (auth.uid() = user_id);

-- ─── 3. Auto-create profile on sign-up ───────────────────────────────────────
-- This trigger fires whenever a new user signs up via Supabase Auth,
-- so the profiles row is always ready before the app tries to fetch it.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    '@' || lower(regexp_replace(
      coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      '\s+', '', 'g'
    ))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
