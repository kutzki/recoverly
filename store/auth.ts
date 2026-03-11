import { create } from 'zustand';
import { connectStreamChat, disconnectStreamChat } from '../services/streamChat';
import { connectStreamFeed, disconnectStreamFeed } from '../services/streamFeed';
import { disconnectStreamVideo } from '../services/streamVideo';
import { supabase, getProfile } from '../services/supabase';
import { authService } from '../services/auth';
import { useProgressStore } from './progress';
import { useChecklistStore } from './checklist';

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
  bio?: string;
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
  updateUser: (updates: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

async function connectStreamServices(user: User) {
  try {
    await connectStreamChat(user.id, user.name, undefined, user.challenges, user.sobrietyStartDate);
  } catch (err) {
    console.warn('[Auth] StreamChat connect failed:', err);
  }
  try {
    await connectStreamFeed(user.id);
  } catch (err) {
    console.warn('[Auth] StreamFeed connect failed:', err);
  }
  // StreamVideo (WebRTC) is initialized lazily on the call screen to avoid
  // loading libwebrtc.so at app startup, which causes a 5-second ANR.
}

async function disconnectStreamServices() {
  await disconnectStreamChat().catch(() => {});
  disconnectStreamFeed();
  await disconnectStreamVideo().catch(() => {});
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: (user, token) => {
    set({ user, token, isAuthenticated: true, isLoading: false });
    connectStreamServices(user);
    if (user.sobrietyStartDate) {
      useProgressStore.getState().setSobrietyStart(user.sobrietyStartDate);
    }
    useProgressStore.getState().loadProgress();
    useChecklistStore.getState().loadChecklist();
  },

  updateUser: async (updates) => {
    const current = get().user;
    const updated = {
      ...(current || { id: '', email: '', name: '', username: '' }),
      ...updates,
    } as User;
    // Optimistic update
    set({ user: updated });
    try {
      // Persist to Supabase — awaited so callers can catch save failures
      await authService.updateProfile(updates);
    } catch (err) {
      // Revert to previous state if the server update fails
      set({ user: current });
      throw err;
    }
  },

  signOut: async () => {
    await disconnectStreamServices();
    await authService.signOut();
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadStoredAuth: async () => {
    try {
      // Supabase persists the session automatically via SecureStore adapter
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await getProfile(session.user.id);

        if (profile) {
          const user: User = {
            id: profile.id,
            email: session.user.email!,
            name: profile.name,
            username: profile.username,
            sobrietyStartDate: profile.sobriety_start_date ?? undefined,
            challenges: profile.challenges ?? [],
            shortTermGoal: profile.short_term_goal ?? undefined,
            location: profile.location ?? undefined,
            dateOfBirth: profile.date_of_birth ?? undefined,
            bio: profile.bio ?? undefined,
            sponsor: profile.sponsor_name
              ? { name: profile.sponsor_name, phone: profile.sponsor_phone ?? '' }
              : undefined,
            innerCircle: profile.inner_circle ?? [],
            isProfileComplete: profile.is_profile_complete ?? false,
          };

          set({ token: session.access_token, user, isAuthenticated: true });
          connectStreamServices(user);

          if (user.sobrietyStartDate) {
            useProgressStore.getState().setSobrietyStart(user.sobrietyStartDate);
          }
          await useProgressStore.getState().loadProgress();
          await useChecklistStore.getState().loadChecklist();
        }
      }
    } catch (e) {
      console.warn('[Auth] loadStoredAuth error:', e);
    } finally {
      set({ isLoading: false });
    }
  },
}));
