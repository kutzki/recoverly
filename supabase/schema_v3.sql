-- ─────────────────────────────────────────────────────────────────────────────
-- Recoverly — Schema v3 additions
-- Run in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. journal_entries ───────────────────────────────────────────────────────

create table if not exists public.journal_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       text not null,       -- "2026-02-25" (display date chosen by user)
  mood       text not null,       -- e.g. "happy", "anxious", "grateful"
  title      text not null,
  body       text not null default '',
  created_at timestamptz not null default now()
);

alter table public.journal_entries enable row level security;

create policy "Users can view own journal entries"
  on public.journal_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own journal entries"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own journal entries"
  on public.journal_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own journal entries"
  on public.journal_entries for delete
  using (auth.uid() = user_id);
