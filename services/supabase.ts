import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Use expo-secure-store as the Supabase auth storage adapter
// This ensures the session is encrypted and survives app restarts
const ExpoSecureStoreAdapter = {
  getItem: (key: string): Promise<string | null> => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string): Promise<void> => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string): Promise<void> => {
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Required for React Native / Expo Router
  },
});

// ─── Profile types matching the DB schema ─────────────────────────────────────

export interface SupabaseProfile {
  id: string;
  name: string;
  username: string;
  sobriety_start_date: string | null;
  challenges: string[] | null;
  short_term_goal: string | null;
  location: string | null;
  date_of_birth?: string | null;
  sponsor_name: string | null;
  sponsor_phone: string | null;
  inner_circle: Array<{ name: string; phone: string }> | null;
  bio?: string | null;
  is_profile_complete?: boolean | null;
  created_at?: string;
}

export async function getProfile(userId: string): Promise<SupabaseProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.warn('[Supabase] getProfile error:', error.message);
    return null;
  }
  return data;
}

export async function upsertProfile(
  userId: string,
  updates: Partial<SupabaseProfile>
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates }, { onConflict: 'id' });

  if (error) {
    console.warn('[Supabase] upsertProfile error:', error.message);
    throw error;
  }
}

export async function insertCheckin(userId: string, date: string): Promise<void> {
  const { error } = await supabase
    .from('daily_checkins')
    .upsert({ user_id: userId, checked_in_date: date }, { onConflict: 'user_id,checked_in_date' });

  if (error) {
    console.warn('[Supabase] insertCheckin error:', error.message);
    throw error;
  }
}

export async function getCheckins(userId: string, since: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('checked_in_date')
    .eq('user_id', userId)
    .gte('checked_in_date', since)
    .order('checked_in_date', { ascending: true });

  if (error || !data) return [];
  return data.map((r: any) => r.checked_in_date);
}

// ─── Username availability ─────────────────────────────────────────────────────

/**
 * Returns true if the given username (without @) is not yet taken.
 * Throws on network/server error so callers can handle it explicitly.
 */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', `@${username}`)
    .maybeSingle();
  if (error) {
    console.warn('[Supabase] checkUsernameAvailable error:', error.message);
    throw error;
  }
  return !data;
}

// ─── Public profile (any authenticated user can view) ─────────────────────────

export async function getPublicProfile(userId: string): Promise<SupabaseProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

// ─── Crisis incidents ──────────────────────────────────────────────────────────

export interface CrisisIncident {
  id: string;
  user_id: string;
  incident_type: string;
  actions_completed: string[];
  notes?: string;
  created_at: string;
}

export async function insertCrisisIncident(
  userId: string,
  incidentType: string,
  actionsCompleted: string[] = [],
  notes?: string
): Promise<void> {
  const { error } = await supabase.from('crisis_incidents').insert({
    user_id: userId,
    incident_type: incidentType,
    actions_completed: actionsCompleted,
    notes,
  });
  if (error) { console.warn('[Supabase] insertCrisisIncident error:', error.message); throw error; }
}

export async function getCrisisHistory(userId: string, limit = 20): Promise<CrisisIncident[]> {
  const { data, error } = await supabase
    .from('crisis_incidents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data;
}

// ─── Goals ────────────────────────────────────────────────────────────────────

export interface UserGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  target_date?: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

export async function getGoals(userId: string): Promise<UserGoal[]> {
  const { data, error } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data;
}

export async function upsertGoal(
  userId: string,
  goal: Partial<UserGoal> & { title: string }
): Promise<UserGoal | null> {
  const payload = goal.id
    ? { ...goal }
    : { user_id: userId, ...goal };
  const { data, error } = await supabase
    .from('user_goals')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();
  if (error) { console.warn('[Supabase] upsertGoal error:', error.message); return null; }
  return data;
}

export async function toggleGoalComplete(goalId: string, completed: boolean): Promise<void> {
  const { error } = await supabase
    .from('user_goals')
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq('id', goalId);
  if (error) { console.warn('[Supabase] toggleGoalComplete error:', error.message); throw error; }
}

export async function deleteGoal(goalId: string): Promise<void> {
  const { error } = await supabase.from('user_goals').delete().eq('id', goalId);
  if (error) { console.warn('[Supabase] deleteGoal error:', error.message); throw error; }
}

// ─── Favorites ────────────────────────────────────────────────────────────────

export interface UserFavorite {
  id: string;
  user_id: string;
  item_type: 'meeting' | 'resource' | 'article';
  title: string;
  description?: string;
  url?: string;
  item_data: Record<string, any>;
  created_at: string;
}

export async function getFavorites(userId: string): Promise<UserFavorite[]> {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data;
}

export async function addFavorite(
  userId: string,
  item: Omit<UserFavorite, 'id' | 'user_id' | 'created_at'>
): Promise<UserFavorite | null> {
  const { data, error } = await supabase
    .from('user_favorites')
    .upsert({ user_id: userId, ...item }, { onConflict: 'user_id,item_type,title' })
    .select()
    .single();
  if (error) { console.warn('[Supabase] addFavorite error:', error.message); return null; }
  return data;
}

export async function removeFavorite(favoriteId: string): Promise<void> {
  const { error } = await supabase.from('user_favorites').delete().eq('id', favoriteId);
  if (error) { console.warn('[Supabase] removeFavorite error:', error.message); throw error; }
}

// ─── Journal entries ───────────────────────────────────────────────────────────

export interface JournalEntryRow {
  id: string;
  user_id: string;
  date: string;
  mood: string;
  title: string;
  body: string;
  created_at: string;
}

export async function getJournalEntries(userId: string): Promise<JournalEntryRow[]> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('[Supabase] getJournalEntries error:', error.message);
    return [];
  }
  return data ?? [];
}

export async function insertJournalEntry(
  userId: string,
  entry: { date: string; mood: string; title: string; body: string }
): Promise<JournalEntryRow | null> {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({ user_id: userId, ...entry })
    .select()
    .single();
  if (error) {
    console.warn('[Supabase] insertJournalEntry error:', error.message);
    return null;
  }
  return data;
}

export async function updateJournalEntry(
  entryId: string,
  updates: Partial<Pick<JournalEntryRow, 'mood' | 'title' | 'body'>>
): Promise<void> {
  const { error } = await supabase
    .from('journal_entries')
    .update(updates)
    .eq('id', entryId);
  if (error) { console.warn('[Supabase] updateJournalEntry error:', error.message); throw error; }
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from('journal_entries').delete().eq('id', entryId);
  if (error) { console.warn('[Supabase] deleteJournalEntry error:', error.message); throw error; }
}
