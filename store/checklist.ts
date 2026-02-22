import { create } from 'zustand';

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;   // toggle on/off
  current: number;      // today's count
  target: number;       // daily target
}

interface ChecklistState {
  items: ChecklistItem[];
  toggleItem: (id: string) => void;
  resetDaily: () => void;
}

const defaultItems: ChecklistItem[] = [
  { id: 'fellowship', label: 'Fellowship', completed: true, current: 2, target: 5 },
  { id: 'sponsor', label: 'Contact Sponsor', completed: false, current: 0, target: 1 },
  { id: 'meditate', label: 'Pray or Meditate', completed: false, current: 0, target: 1 },
  { id: 'journal', label: 'Daily Journal', completed: false, current: 0, target: 1 },
  { id: 'meeting', label: 'Attended Meeting', completed: true, current: 1, target: 1 },
];

export const useChecklistStore = create<ChecklistState>((set) => ({
  items: defaultItems,

  toggleItem: (id) =>
    set((s) => ({
      items: s.items.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
              current: !item.completed
                ? Math.min(item.current + 1, item.target)
                : Math.max(item.current - 1, 0),
            }
          : item
      ),
    })),

  resetDaily: () =>
    set({
      items: defaultItems.map(item => ({ ...item, completed: false, current: 0 })),
    }),
}));
