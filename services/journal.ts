import api from './api';

export interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  title: string;
  body: string;
  createdAt: string;
}

export const journalService = {
  async getEntries(): Promise<JournalEntry[]> {
    try {
      const { data } = await api.get<JournalEntry[]>('/journal');
      return data;
    } catch {
      return [];
    }
  },

  async createEntry(entry: Omit<JournalEntry, 'id' | 'createdAt'>): Promise<JournalEntry> {
    try {
      const { data } = await api.post<JournalEntry>('/journal', entry);
      return data;
    } catch {
      return { ...entry, id: Date.now().toString(), createdAt: new Date().toISOString() };
    }
  },

  async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<void> {
    try {
      await api.patch(`/journal/${id}`, updates);
    } catch {}
  },

  async deleteEntry(id: string): Promise<void> {
    try {
      await api.delete(`/journal/${id}`);
    } catch {}
  },
};
