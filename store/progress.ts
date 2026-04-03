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

  setSobrietyStart:    (date: string, userId?: string) => Promise<void>;
  markTodayCheckedIn:  (userId?: string) => Promise<void>;
  incrementTasks:      () => void;
  incrementMeetings:   () => void;
  loadProgress:        (userId?: string) => Promise<void>;
};

const weekStartISO = () => {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - ((day + 6) % 7)); // Monday
  // Avoid toISOString() since it shifts timezones and causes false resets!
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

  setSobrietyStart: async (date, userId) => {
    set({ sobrietyStartDate: date });
    await _persist(get()); // Off-line first local save

    if (userId) {
      // Background sync, don't await/crash offline
      supabase.from('profiles').update({ sobriety_start_date: date }).eq('id', userId).then((res) => { if (res.error) console.error(res.error); });
    }
  },

  markTodayCheckedIn: async (userId) => {
    const streak = [...get().weeklyStreak];
    streak[todayDayIndex()] = true;
    set({ weeklyStreak: streak, checkInsCompleted: get().checkInsCompleted + 1 });
    await _persist(get()); // Off-line first local save

    if (userId) {
      const today = new Date().toISOString().slice(0, 10);
      supabase.from('daily_checkins').upsert({ user_id: userId, checked_in_date: today }).then((res) => { if (res.error) console.error(res.error); });
    }
  },

  incrementTasks: () => {
    set({ tasksCompleted: get().tasksCompleted + 1 });
    _persist(get());
  },

  incrementMeetings: () => {
    set({ meetingsAttended: get().meetingsAttended + 1 });
    _persist(get());
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

    // Sync sobriety date from DB if we have a user and are online
    if (userId && !get().sobrietyStartDate) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('sobriety_start_date')
          .eq('id', userId)
          .single();
        if (data?.sobriety_start_date) {
          set({ sobrietyStartDate: data.sobriety_start_date });
          await _persist(get());
        }
      } catch (e) {
        // Offline - fail silently
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
