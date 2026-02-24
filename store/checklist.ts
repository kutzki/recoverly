import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const CHECKLIST_KEY = 'daily_checklist';

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  current: number;
  target: number;
}

interface ChecklistState {
  items: ChecklistItem[];
  toggleItem: (id: string) => void;
  resetDaily: () => void;
  loadChecklist: () => Promise<void>;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: 'fellowship', label: 'Fellowship', completed: false, current: 0, target: 5 },
  { id: 'sponsor', label: 'Contact Sponsor', completed: false, current: 0, target: 1 },
  { id: 'meditate', label: 'Pray or Meditate', completed: false, current: 0, target: 1 },
  { id: 'journal', label: 'Daily Journal', completed: false, current: 0, target: 1 },
  { id: 'meeting', label: 'Attended Meeting', completed: false, current: 0, target: 1 },
];

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

export const useChecklistStore = create<ChecklistState>((set, get) => ({
  items: DEFAULT_ITEMS,

  toggleItem: (id) => {
    set((s) => {
      const items = s.items.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
              current: !item.completed
                ? Math.min(item.current + 1, item.target)
                : Math.max(item.current - 1, 0),
            }
          : item
      );
      SecureStore.setItemAsync(
        CHECKLIST_KEY,
        JSON.stringify({ date: todayKey(), items })
      ).catch(() => {});
      return { items };
    });
  },

  resetDaily: () => {
    const items = DEFAULT_ITEMS.map(item => ({ ...item, completed: false, current: 0 }));
    set({ items });
    SecureStore.setItemAsync(
      CHECKLIST_KEY,
      JSON.stringify({ date: todayKey(), items })
    ).catch(() => {});
  },

  loadChecklist: async () => {
    try {
      const raw = await SecureStore.getItemAsync(CHECKLIST_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.date === todayKey() && Array.isArray(saved.items)) {
        // Merge stored state with defaults to handle new items added in updates
        const merged = DEFAULT_ITEMS.map(def => {
          const stored = saved.items.find((s: ChecklistItem) => s.id === def.id);
          return stored ? { ...def, completed: stored.completed, current: stored.current } : def;
        });
        set({ items: merged });
      } else {
        // New day — reset all items
        get().resetDaily();
      }
    } catch (err) {
      console.warn('[Checklist] loadChecklist error:', err);
    }
  },
}));
