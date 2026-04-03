import { supabase } from './supabase';

export type UserProfile = {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  bio: string | null;
  location: string | null;
  sobriety_start_date: string | null;
  substance: string | null;
  short_term_goal: string | null;
  challenges: string[] | null;
  sponsor_name: string | null;
  sponsor_phone: string | null;
  inner_circle: { name: string; phone: string; relationship?: string }[] | null;
  user_type: 'SEEKER' | 'GUARDIAN';
  guardian_code: string | null;
  guardian_code_expires_at: string | null;
  is_profile_complete: boolean;
  created_at: string;
};

export const authService = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const profile = await authService.getProfile(data.user.id);
    return { session: data.session, user: data.user, profile };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data as UserProfile;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as UserProfile;
  },

  async getStoredSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
};
