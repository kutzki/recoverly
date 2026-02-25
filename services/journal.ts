import { supabase, getJournalEntries, insertJournalEntry, updateJournalEntry, deleteJournalEntry } from './supabase';

export interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  title: string;
  body: string;
  createdAt: string;
}

async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export const journalService = {
  async getEntries(): Promise<JournalEntry[]> {
    try {
      const userId = await getCurrentUserId();
      if (!userId) return [];
      const rows = await getJournalEntries(userId);
      return rows.map(r => ({
        id: r.id,
        date: r.date,
        mood: r.mood,
        title: r.title,
        body: r.body,
        createdAt: r.created_at,
      }));
    } catch {
      return [];
    }
  },

  async createEntry(entry: Omit<JournalEntry, 'id' | 'createdAt'>): Promise<JournalEntry> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('You must be signed in to save a journal entry.');
    const row = await insertJournalEntry(userId, entry);
    if (!row) throw new Error('Could not save your entry. Please try again.');
    return { id: row.id, date: row.date, mood: row.mood, title: row.title, body: row.body, createdAt: row.created_at };
  },

  async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<void> {
    await updateJournalEntry(id, {
      mood: updates.mood,
      title: updates.title,
      body: updates.body,
    });
  },

  async deleteEntry(id: string): Promise<void> {
    await deleteJournalEntry(id);
  },
};
