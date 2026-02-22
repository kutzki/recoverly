import api from './api';

export interface ProgressData {
  sobrietyStartDate: string;
  totalDays: number;
  currentStreak: number;
  weeklyStreak: boolean[]; // 7 elements for Mon-Sun
  tasksCompleted: number;
  tasksTotal: number;
  checkInsCompleted: number;
  checkInsTotal: number;
  meetingsAttended: number;
  meetingsTotal: number;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  label: string;
  subtitle: string;
  date: string;
  achieved: boolean;
  color: 'grey' | 'purple' | 'cyan';
}

const MILESTONES_DAYS = [1, 7, 30, 60, 90, 180, 365];

export const progressService = {
  async getProgress(): Promise<ProgressData> {
    try {
      const { data } = await api.get<ProgressData>('/progress');
      return data;
    } catch {
      return mockProgress();
    }
  },

  async recordCheckIn(): Promise<void> {
    try {
      await api.post('/progress/checkin');
    } catch {}
  },
};

function mockProgress(): ProgressData {
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const totalDays = 30;

  const milestones: Milestone[] = [
    { id: '1d', label: 'Incredible!', subtitle: 'First day sober', date: formatDate(startDate), achieved: true, color: 'grey' },
    { id: '7d', label: 'Keep it up!', subtitle: '7 days sober', date: formatDate(new Date(startDate.getTime() + 6 * 86400000)), achieved: true, color: 'purple' },
    { id: '30d', label: "You're a rockstar!", subtitle: 'Thirty days sober', date: formatDate(new Date(startDate.getTime() + 29 * 86400000)), achieved: true, color: 'cyan' },
    { id: '60d', label: 'Two months!', subtitle: 'Sixty days sober', date: '—', achieved: false, color: 'grey' },
    { id: '90d', label: 'Quarter year!', subtitle: 'Ninety days sober', date: '—', achieved: false, color: 'grey' },
  ];

  return {
    sobrietyStartDate: startDate.toISOString(),
    totalDays,
    currentStreak: totalDays,
    weeklyStreak: [true, true, true, false, false, false, false],
    tasksCompleted: 25,
    tasksTotal: 35,
    checkInsCompleted: 7,
    checkInsTotal: 7,
    meetingsAttended: 3,
    meetingsTotal: 7,
    milestones,
  };
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}
