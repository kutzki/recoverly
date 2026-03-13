import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../services/supabase';
import { authService, UserProfile } from '../services/auth';
import { connectStreamChat, disconnectStreamChat } from '../services/streamChat';

type AuthState = {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setAuth: (user: UserProfile, token: string) => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user:            null,
  token:           null,
  isLoading:       true,
  isAuthenticated: false,

  setAuth: async (user, token) => {
    set({ user, token, isAuthenticated: true, isLoading: false });

    // Connect Stream Chat in the background — don't block navigation
    const sobrietyDays = user.sobriety_start_date
      ? Math.floor((Date.now() - new Date(user.sobriety_start_date).getTime()) / 86_400_000)
      : 0;
    connectStreamChat(user.id, user.name ?? user.username ?? 'User', user.avatar_url ?? undefined, sobrietyDays).catch(() => {});
  },

  updateUser: async (updates) => {
    const { user } = get();
    if (!user) return;
    // Optimistic update
    set({ user: { ...user, ...updates } });
    try {
      await authService.updateProfile(user.id, updates);
    } catch {
      // Revert on failure
      set({ user });
    }
  },

  signOut: async () => {
    await disconnectStreamChat();
    await authService.signOut();
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadStoredAuth: async () => {
    try {
      const session = await authService.getStoredSession();
      if (!session) {
        set({ isLoading: false });
        return;
      }

      const profile = await authService.getProfile(session.user.id);
      if (!profile) {
        set({ isLoading: false });
        return;
      }

      await get().setAuth(profile, session.access_token);
    } catch {
      set({ isLoading: false });
    }
  },
}));
