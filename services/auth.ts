import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

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

  async resetPassword(email: string) {
    const redirectTo = Linking.createURL('auth/reset-password');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  },

  async resendVerification(email: string) {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  },

  async signInWithGoogle() {
    const redirectTo = Linking.createURL('auth/callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) throw error;
    if (!data?.url) throw new Error('No OAuth URL returned');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success') return null;

    const url = result.url;
    const fragment = url.split('#')[1] ?? '';
    const params = new URLSearchParams(fragment || (url.split('?')[1] ?? ''));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token') ?? '';
    if (!accessToken) return null;

    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (sessionError) throw sessionError;
    if (!sessionData.session) return null;

    const profile = await authService.getProfile(sessionData.session.user.id);
    return { session: sessionData.session, user: sessionData.session.user, profile };
  },

  async checkUsernameAvailable(username: string): Promise<boolean> {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle();
    return data === null;
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
