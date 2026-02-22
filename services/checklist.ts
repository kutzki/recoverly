import api from './api';

export interface ChecklistTask {
  id: string;
  label: string;
  completed: boolean;
  date: string;
}

export const checklistService = {
  async getTodaysTasks(): Promise<ChecklistTask[]> {
    try {
      const { data } = await api.get<ChecklistTask[]>('/checklist/today');
      return data;
    } catch {
      return [];
    }
  },

  async toggleTask(id: string, completed: boolean): Promise<void> {
    try {
      await api.patch(`/checklist/${id}`, { completed });
    } catch {}
  },
};
