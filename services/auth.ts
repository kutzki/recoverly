import { supabase, getProfile, upsertProfile, SupabaseProfile } from './supabase';

export interface SignUpPayload {
  email: string;
  password: string;
  name?: string;
  username?: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
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
    bio?: string;
    isProfileComplete?: boolean;
  };
}

// ─── Convert Supabase profile row → app User shape ───────────────────────────

function profileToUser(profile: SupabaseProfile, email: string): AuthResponse['user'] {
  return {
    id: profile.id,
    email,
    name: profile.name,
    username: profile.username,
    sobrietyStartDate: profile.sobriety_start_date ?? undefined,
    challenges: profile.challenges ?? [],
    shortTermGoal: profile.short_term_goal ?? undefined,
    location: profile.location ?? undefined,
    dateOfBirth: profile.date_of_birth ?? undefined,
    sponsor: profile.sponsor_name
      ? { name: profile.sponsor_name, phone: profile.sponsor_phone ?? '' }
      : undefined,
    innerCircle: profile.inner_circle ?? [],
    bio: profile.bio ?? undefined,
    isProfileComplete: profile.is_profile_complete ?? false,
  };
}

// ─── Get profile (or create if first sign-up) ─────────────────────────────────

async function getOrCreateProfile(
  userId: string,
  email: string,
  name?: string
): Promise<AuthResponse['user']> {
  const existing = await getProfile(userId);
  if (existing) return profileToUser(existing, email);

  const displayName = name || email.split('@')[0];
  const newProfile: SupabaseProfile = {
    id: userId,
    name: displayName,
    username: '@' + displayName.toLowerCase().replace(/\s+/g, ''),
    sobriety_start_date: null,
    challenges: [],
    short_term_goal: null,
    location: null,
    sponsor_name: null,
    sponsor_phone: null,
    inner_circle: [],
  };

  await upsertProfile(userId, newProfile);
  return profileToUser(newProfile, email);
}

// ─── Auth service ─────────────────────────────────────────────────────────────

export const authService = {
  async signUp(payload: SignUpPayload): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: { name: payload.name || payload.email.split('@')[0] },
      },
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Sign up failed — please try again.');

    // If email confirmation is enabled, data.session is null here.
    // The DB trigger has already created the profile row (security definer bypasses RLS),
    // but we can't read/write it without an active session, so return a minimal user object
    // and let the user sign in after confirming their email.
    if (!data.session) {
      const displayName = payload.name || payload.email.split('@')[0];
      return {
        token: 'pending_email_confirmation',
        user: {
          id: data.user.id,
          email: payload.email,
          name: displayName,
          username: '@' + displayName.toLowerCase().replace(/\s+/g, ''),
        },
      };
    }

    const user = await getOrCreateProfile(data.user.id, payload.email, payload.name);
    return { token: data.session.access_token, user };
  },

  async signIn(payload: SignInPayload): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (error) throw new Error(error.message);
    if (!data.user || !data.session) throw new Error('Sign in failed — please try again.');

    const user = await getOrCreateProfile(data.user.id, data.user.email!);
    return { token: data.session.access_token, user };
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getStoredSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async updateProfile(updates: Partial<AuthResponse['user']>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dbUpdates: Partial<SupabaseProfile> = {};
    if (updates.name !== undefined)             dbUpdates.name = updates.name;
    if (updates.username !== undefined)         dbUpdates.username = updates.username;
    if (updates.sobrietyStartDate !== undefined) dbUpdates.sobriety_start_date = updates.sobrietyStartDate;
    if (updates.challenges !== undefined)       dbUpdates.challenges = updates.challenges;
    if (updates.shortTermGoal !== undefined)    dbUpdates.short_term_goal = updates.shortTermGoal;
    if (updates.location !== undefined)         dbUpdates.location = updates.location;
    if (updates.sponsor !== undefined) {
      dbUpdates.sponsor_name = updates.sponsor.name;
      dbUpdates.sponsor_phone = updates.sponsor.phone;
    }
    if (updates.innerCircle !== undefined)       dbUpdates.inner_circle = updates.innerCircle;
    if (updates.bio !== undefined)               dbUpdates.bio = updates.bio;
    if (updates.dateOfBirth !== undefined)       dbUpdates.date_of_birth = updates.dateOfBirth ?? null;
    if (updates.isProfileComplete !== undefined) dbUpdates.is_profile_complete = updates.isProfileComplete;

    await upsertProfile(user.id, dbUpdates);
  },
};
