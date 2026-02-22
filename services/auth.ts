import api from './api';
import * as SecureStore from 'expo-secure-store';

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
  };
}

export const authService = {
  async signUp(payload: SignUpPayload): Promise<AuthResponse> {
    // Try real API; fall back to mock for demo
    try {
      const { data } = await api.post<AuthResponse>('/auth/signup', payload);
      await SecureStore.setItemAsync('auth_token', data.token);
      return data;
    } catch {
      // Mock auth until backend is ready
      const mock = mockAuth(payload.email, payload.name);
      await SecureStore.setItemAsync('auth_token', mock.token);
      return mock;
    }
  },

  async signIn(payload: SignInPayload): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/signin', payload);
      await SecureStore.setItemAsync('auth_token', data.token);
      return data;
    } catch {
      const mock = mockAuth(payload.email);
      await SecureStore.setItemAsync('auth_token', mock.token);
      return mock;
    }
  },

  async signOut(): Promise<void> {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user_data');
  },

  async getStoredToken(): Promise<string | null> {
    return SecureStore.getItemAsync('auth_token');
  },

  async updateProfile(data: Partial<AuthResponse['user']>): Promise<void> {
    try {
      await api.patch('/user/profile', data);
    } catch {
      // Store locally if API fails
    }
    const stored = await SecureStore.getItemAsync('user_data');
    const user = stored ? JSON.parse(stored) : {};
    await SecureStore.setItemAsync('user_data', JSON.stringify({ ...user, ...data }));
  },
};

function mockAuth(email: string, name?: string): AuthResponse {
  return {
    token: 'mock_token_' + Date.now(),
    user: {
      id: 'mock_user_1',
      email,
      name: name || email.split('@')[0],
      username: '@' + (name || email.split('@')[0]).toLowerCase().replace(/\s/g, ''),
      sobrietyStartDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      sponsor: { name: 'Jack', phone: '888-888-8888' },
      innerCircle: [
        { name: 'Sarah', phone: '555-123-4567' },
        { name: 'Mike', phone: '555-234-5678' },
      ],
    },
  };
}
