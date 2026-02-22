import { useAuthStore } from '../store/auth';
import { authService } from '../services/auth';
import { router } from 'expo-router';

export function useAuth() {
  const store = useAuthStore();

  const signUp = async (email: string, password: string, name?: string) => {
    const result = await authService.signUp({ email, password, name });
    store.setAuth(result.user, result.token);
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
