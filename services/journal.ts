import { supabase } from './supabase';

export type JournalEntry = {
  id: string;
  user_id: string;
  date: string;
  mood: number | null;
  title: string | null;
  body: string | null;
  created_at: string;
};

export const journalService = {
  async getEntries(userId: string): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async createEntry(entry: Omit<JournalEntry, 'id' | 'created_at'>): Promise<JournalEntry> {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert(entry)
      .select()
      .single();
    if (error) throw error;
    return data as JournalEntry;
  },

  async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
    const { data, error } = await supabase
      .from('journal_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as JournalEntry;
  },

  async deleteEntry(id: string): Promise<void> {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);
    if (error) throw error;
  },
};
