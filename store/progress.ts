import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { upsertProfile, insertCheckin } from '../services/supabase';

// Lazy getter to avoid a circular import with store/auth (auth imports progress)
function getAuthUserId(): string | null {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('../store/auth').useAuthStore.getState().user?.id ?? null;
}

const PROGRESS_KEY = 'user_progress';

interface ProgressState {
  sobrietyStartDate: string | null;
  weeklyStreak: boolean[];
  tasksCompleted: number;
  tasksTarget: number;
  checkInsCompleted: number;
  checkInsTarget: number;
  meetingsAttended: number;
  meetingsTarget: number;
  setSobrietyStart: (date: string) => void;
  markTodayCheckedIn: () => void;
  incrementTasks: () => void;
  incrementMeetings: () => void;
  loadProgress: () => Promise<void>;
}

function todayKey() {
  return new Date().toISOString().split('T')[0]; // "2026-02-23"
}

// Monday-based index: Mon=0, Tue=1, ..., Sun=6
function weekDayIndex() {
  return (new Date().getDay() + 6) % 7;
}

function currentMondayKey() {
  const d = new Date();
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().split('T')[0];
}

function persist(partial: Partial<ProgressState>) {
  SecureStore.getItemAsync(PROGRESS_KEY).then(raw => {
    const current = raw ? JSON.parse(raw) : {};
    SecureStore.setItemAsync(PROGRESS_KEY, JSON.stringify({ ...current, ...partial })).catch((err) => { console.warn('[Progress] persist write error:', err); });
  }).catch((err) => { console.warn('[Progress] persist read error:', err); });
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  sobrietyStartDate: null,
  weeklyStreak: [false, false, false, false, false, false, false],
  tasksCompleted: 0,
  tasksTarget: 7,
  checkInsCompleted: 0,
  checkInsTarget: 7,
  meetingsAttended: 0,
  meetingsTarget: 7,

  setSobrietyStart: (date) => {
    set({ sobrietyStartDate: date });
    persist({ sobrietyStartDate: date });
    // Sync to Supabase profiles table in background (synchronous userId lookup)
    const userId = getAuthUserId();
    if (userId) {
      upsertProfile(userId, { sobriety_start_date: date }).catch(() => {});
    }
  },

  markTodayCheckedIn: () => {
    const { weeklyStreak, checkInsCompleted, checkInsTarget } = get();
    const newStreak = [...weeklyStreak];
    newStreak[weekDayIndex()] = true;
    const next = {
      weeklyStreak: newStreak,
      checkInsCompleted: Math.min(checkInsCompleted + 1, checkInsTarget),
    };
    set(next);
    // Include weekStart so that loadProgress never incorrectly resets the streak
    // on the next launch (if weekStart is missing it looks like a new week)
    persist({ ...next, lastCheckInDate: todayKey(), weekStart: currentMondayKey() } as any);
    // Sync check-in to Supabase in background (synchronous userId lookup)
    const userId = getAuthUserId();
    if (userId) {
      insertCheckin(userId, todayKey()).catch(() => {});
    }
  },

  incrementTasks: () => {
    set((s) => {
      const next = { tasksCompleted: Math.min(s.tasksCompleted + 1, s.tasksTarget) };
      persist(next);
      return next;
    });
  },

  incrementMeetings: () => {
    set((s) => {
      const next = { meetingsAttended: Math.min(s.meetingsAttended + 1, s.meetingsTarget) };
      persist(next);
      return next;
    });
  },

  loadProgress: async () => {
    try {
      const raw = await SecureStore.getItemAsync(PROGRESS_KEY);
      const saved = raw ? JSON.parse(raw) : {};

      // Reset weekly streak if stored weekStart doesn't match the current Monday.
      // This handles both a new week AND the first-ever launch (saved.weekStart is
      // undefined on first run, which correctly triggers a reset to all-false).
      const currentMonday = currentMondayKey();

      const weekStreak = saved.weekStart === currentMonday
        ? (saved.weeklyStreak ?? [false, false, false, false, false, false, false])
        : [false, false, false, false, false, false, false];

      if (raw) {
        set({
          sobrietyStartDate: saved.sobrietyStartDate ?? null,
          weeklyStreak: weekStreak,
          tasksCompleted: saved.tasksCompleted ?? 0,
          tasksTarget: saved.tasksTarget ?? 7,
          checkInsCompleted: saved.checkInsCompleted ?? 0,
          checkInsTarget: saved.checkInsTarget ?? 7,
          meetingsAttended: saved.meetingsAttended ?? 0,
          meetingsTarget: saved.meetingsTarget ?? 7,
        });
      }

      // Always persist current weekStart so subsequent launches don't
      // incorrectly see a missing weekStart and reset the streak.
      if (saved.weekStart !== currentMonday) {
        persist({ weekStart: currentMonday, weeklyStreak: weekStreak } as any);
      }
    } catch (err) {
      console.warn('[Progress] loadProgress error:', err);
    }
  },
}));
