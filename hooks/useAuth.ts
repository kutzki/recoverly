import { useAuthStore } from '../store/auth';
import { authService } from '../services/auth';
import { router } from 'expo-router';

export function useAuth() {
  const store = useAuthStore();

  const signUp = async (email: string, password: string, name?: string) => {
    const result = await authService.signUp({ email, password, name });
    // Don't setAuth if email confirmation is required — user has no valid session yet
    if (result.token !== 'pending_email_confirmation') {
      store.setAuth(result.user, result.token);
    }
    return result;
  };

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn({ email, password });
    store.setAuth(result.user, result.token);
    return result;
  };

  const signOut = async () => {
    await authService.signOut();
    store.signOut();
    router.replace('/(auth)/sign-in');
  };

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    signUp,
    signIn,
    signOut,
    updateUser: store.updateUser,
  };
}
