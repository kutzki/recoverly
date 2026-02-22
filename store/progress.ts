import { create } from 'zustand';

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
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  // Mock: 30 days ago
  sobrietyStartDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  weeklyStreak: [true, true, true, false, false, false, false],
  tasksCompleted: 25,
  tasksTarget: 35,
  checkInsCompleted: 7,
  checkInsTarget: 7,
  meetingsAttended: 3,
  meetingsTarget: 7,

  setSobrietyStart: (date) => set({ sobrietyStartDate: date }),

  markTodayCheckedIn: () => {
    const { weeklyStreak, checkInsCompleted, checkInsTarget } = get();
    const newStreak = [...weeklyStreak];
    const todayIndex = new Date().getDay(); // 0 = Sun
    newStreak[todayIndex] = true;
    set({
      weeklyStreak: newStreak,
      checkInsCompleted: Math.min(checkInsCompleted + 1, checkInsTarget),
    });
  },

  incrementTasks: () =>
    set((s) => ({ tasksCompleted: Math.min(s.tasksCompleted + 1, s.tasksTarget) })),

  incrementMeetings: () =>
    set((s) => ({ meetingsAttended: Math.min(s.meetingsAttended + 1, s.meetingsTarget) })),
}));
