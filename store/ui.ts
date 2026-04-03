import { create } from 'zustand';

type UIState = {
  isMenuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  isJournalOpen: boolean;
  openJournal: () => void;
  closeJournal: () => void;
  isChecklistOpen: boolean;
  openChecklist: () => void;
  closeChecklist: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  isMenuOpen: false,
  openMenu: () => set({ isMenuOpen: true }),
  closeMenu: () => set({ isMenuOpen: false }),
  isJournalOpen: false,
  openJournal: () => set({ isJournalOpen: true }),
  closeJournal: () => set({ isJournalOpen: false }),
  isChecklistOpen: false,
  openChecklist: () => set({ isChecklistOpen: true }),
  closeChecklist: () => set({ isChecklistOpen: false }),
}));
