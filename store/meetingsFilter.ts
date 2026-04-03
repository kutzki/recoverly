import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'meetingsFilters';

type MeetingsFilterState = {
  meetingType:  string;
  category:     string;
  attendeeType: string;
  onlineOnly:   boolean;
  rangeValue:   number;

  setFilters: (filters: Partial<Omit<MeetingsFilterState, 'setFilters' | 'loadFilters'>>) => void;
  loadFilters: () => Promise<void>;
};

export const useMeetingsFilterStore = create<MeetingsFilterState>((set, get) => ({
  meetingType:  'AA',
  category:     'Closed',
  attendeeType: 'Male',
  onlineOnly:   false,
  rangeValue:   50,

  setFilters: (filters) => {
    set(filters as any);
    // Persist immediately
    const state = get();
    SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({
      meetingType:  state.meetingType,
      category:     state.category,
      attendeeType: state.attendeeType,
      onlineOnly:   state.onlineOnly,
      rangeValue:   state.rangeValue,
      ...filters,
    })).catch(() => {});
  },

  loadFilters: async () => {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set(parsed);
      }
    } catch {
      // ignore
    }
  },
}));
