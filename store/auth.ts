import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  sobrietyStartDate?: string;
  challenges?: string[];
  shortTermGoal?: string;
  location?: string;
  dateOfBirth?: string;
  sponsor?: { name: string; phone: string };
  innerCircle?: Array<{ name: string; phone: string }>;
  isProfileComplete?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (updates: Partial<User>) => void;
  signOut: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: (user, token) => {
    SecureStore.setItemAsync('user_data', JSON.stringify(user));
    SecureStore.setItemAsync('auth_token', token);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  updateUser: (updates) => {
    const current = get().user;
    const updated = { ...(current || { id: '', email: '', name: '', username: '' }), ...updates } as User;
    SecureStore.setItemAsync('user_data', JSON.stringify(updated));
    set({ user: updated });
  },

  signOut: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user_data');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadStoredAuth: async () => {
    try {
      const [token, userData] = await Promise.all([
        SecureStore.getItemAsync('auth_token'),
        SecureStore.getItemAsync('user_data'),
      ]);
      if (token && userData) {
        set({ token, user: JSON.parse(userData), isAuthenticated: true });
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
