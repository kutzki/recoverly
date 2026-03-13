import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'recoverly_checklist_v2';

export type ChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
};

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: 'fellowship',  label: 'Fellowship',      completed: false },
  { id: 'sponsor',     label: 'Contact Sponsor', completed: false },
  { id: 'meditate',    label: 'Meditate',        completed: false },
  { id: 'journal',     label: 'Journal',         completed: false },
  { id: 'meeting',     label: 'Meeting',         completed: false },
];

type ChecklistState = {
  items:       ChecklistItem[];
  lastDate:    string | null;
  toggleItem:  (id: string) => Promise<void>;
  loadChecklist: () => Promise<void>;
  resetDaily:  () => Promise<void>;
};

export const useChecklistStore = create<ChecklistState>((set, get) => ({
  items:    DEFAULT_ITEMS,
  lastDate: null,

  toggleItem: async (id) => {
    const items = get().items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    );
    set({ items });
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({ items, lastDate: get().lastDate }));
  },

  loadChecklist: async () => {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!raw) return;

    const { items, lastDate } = JSON.parse(raw) as { items: ChecklistItem[]; lastDate: string };
    const today = new Date().toISOString().slice(0, 10);

    if (lastDate !== today) {
      await get().resetDaily();
    } else {
      set({ items, lastDate });
    }
  },

  resetDaily: async () => {
    const today = new Date().toISOString().slice(0, 10);
    const items = DEFAULT_ITEMS.map((i) => ({ ...i, completed: false }));
    set({ items, lastDate: today });
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({ items, lastDate: today }));
  },
}));
