import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'meetingsFilters';

type MeetingsFilterState = {
  meetingType:  string;
  category:     string;
  attendeeType: string;
  onlineOnly:   boolean;
  rangeValue:   number;
  langFilter:   string | null;
  typeFilter:   string | null;
  formatFilter: string | null;
  communityFilter: string | null;

  setFilters: (filters: Partial<Omit<MeetingsFilterState, 'setFilters' | 'loadFilters'>>) => void;
  loadFilters: () => Promise<void>;
};

export const useMeetingsFilterStore = create<MeetingsFilterState>((set, get) => ({
  meetingType:  'AA',
  category:     'Closed',
  attendeeType: 'Male',
  onlineOnly:   false,
  rangeValue:   50,
  langFilter:   'en',
  typeFilter:   null,
  formatFilter: null,
  communityFilter: null,

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
      langFilter:   state.langFilter,
      typeFilter:   state.typeFilter,
      formatFilter: state.formatFilter,
      communityFilter: state.communityFilter,
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
