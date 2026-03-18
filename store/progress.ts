import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../services/supabase';

const STORAGE_KEY = 'recoverly_progress_v2';

type ProgressState = {
  sobrietyStartDate: string | null;
  weeklyStreak:      boolean[];   // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  tasksCompleted:    number;
  tasksTarget:       number;
  checkInsCompleted: number;
  checkInsTarget:    number;
  meetingsAttended:  number;
  meetingsTarget:    number;
  lastWeekReset:     string | null;
  checkinHistory:    string[];    // ISO date strings, e.g. ["2026-03-16", ...]

  setSobrietyStart:    (date: string, userId?: string) => Promise<void>;
  markTodayCheckedIn:  (userId?: string, mood?: number, notes?: string) => Promise<void>;
  incrementTasks:      () => void;
  incrementMeetings:   () => void;
  loadProgress:        (userId?: string) => Promise<void>;
  loadAllHistory:      (userId: string) => Promise<void>;
};

const weekStartISO = () => {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - ((day + 6) % 7)); // Monday
  return d.toISOString().slice(0, 10);
};

const todayDayIndex = () => (new Date().getDay() + 6) % 7; // 0=Mon

export const useProgressStore = create<ProgressState>((set, get) => ({
  sobrietyStartDate: null,
  weeklyStreak:      Array(7).fill(false),
  tasksCompleted:    0,
  tasksTarget:       7,
  checkInsCompleted: 0,
  checkInsTarget:    7,
  meetingsAttended:  0,
  meetingsTarget:    7,
  lastWeekReset:     null,
  checkinHistory:    [],

  setSobrietyStart: async (date, userId) => {
    set({ sobrietyStartDate: date });
    if (userId) {
      await supabase.from('profiles').update({ sobriety_start_date: date }).eq('id', userId);
    }
    await _persist(get());
  },

  markTodayCheckedIn: async (userId, mood, notes) => {
    const streak = [...get().weeklyStreak];
    streak[todayDayIndex()] = true;
    set({ weeklyStreak: streak, checkInsCompleted: get().checkInsCompleted + 1 });

    if (userId) {
      const today = new Date().toISOString().slice(0, 10);
      await supabase.from('daily_checkins').upsert({
        user_id: userId,
        checked_in_date: today,
        ...(mood !== undefined ? { mood } : {}),
        ...(notes ? { notes } : {}),
      });
    }
    await _persist(get());
  },

  incrementTasks: () => {
    set({ tasksCompleted: get().tasksCompleted + 1 });
    _persist(get());
  },

  incrementMeetings: () => {
    set({ meetingsAttended: get().meetingsAttended + 1 });
    _persist(get());
  },

  loadAllHistory: async (userId) => {
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('checked_in_date')
      .eq('user_id', userId)
      .order('checked_in_date', { ascending: false });
    if (error) return; // silent fail — screen degrades gracefully
    set({ checkinHistory: (data ?? []).map((r) => r.checked_in_date as string) });
  },

  loadProgress: async (userId) => {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    const thisWeek = weekStartISO();

    if (raw) {
      const saved = JSON.parse(raw) as Partial<ProgressState>;
      if (saved.lastWeekReset !== thisWeek) {
        // New week — reset counters but keep sobriety date
        set({
          sobrietyStartDate: saved.sobrietyStartDate ?? null,
          weeklyStreak:      Array(7).fill(false),
          tasksCompleted:    0,
          checkInsCompleted: 0,
          meetingsAttended:  0,
          lastWeekReset:     thisWeek,
        });
        await _persist(get());
        return;
      }
      set({ ...saved });
    }

    // Sync sobriety date + this week's check-ins from Supabase
    if (userId) {
      const today = new Date().toISOString().slice(0, 10);
      const monday = weekStartISO();
      const [profileRes, checkinsRes] = await Promise.all([
        supabase.from('profiles').select('sobriety_start_date').eq('id', userId).single(),
        supabase.from('daily_checkins')
          .select('checked_in_date')
          .eq('user_id', userId)
          .gte('checked_in_date', monday)
          .lte('checked_in_date', today),
      ]);
      const updates: Partial<ProgressState> = {};
      if (profileRes.data?.sobriety_start_date) {
        updates.sobrietyStartDate = profileRes.data.sobriety_start_date;
      }
      if (checkinsRes.data && checkinsRes.data.length > 0) {
        const streak = Array(7).fill(false);
        checkinsRes.data.forEach(({ checked_in_date }) => {
          const d = new Date(checked_in_date + 'T00:00:00');
          const idx = (d.getDay() + 6) % 7; // 0=Mon
          streak[idx] = true;
        });
        updates.weeklyStreak = streak;
        updates.checkInsCompleted = checkinsRes.data.length;
      }
      if (Object.keys(updates).length > 0) {
        set(updates);
        await _persist(get());
      }
    }
  },
}));

async function _persist(state: ProgressState) {
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({
    sobrietyStartDate: state.sobrietyStartDate,
    weeklyStreak:      state.weeklyStreak,
    tasksCompleted:    state.tasksCompleted,
    checkInsCompleted: state.checkInsCompleted,
    meetingsAttended:  state.meetingsAttended,
    lastWeekReset:     state.lastWeekReset,
  }));
}
