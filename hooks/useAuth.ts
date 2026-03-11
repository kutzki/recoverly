import { useAuthStore } from '../store/auth';
import { authService } from '../services/auth';
import { router } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setAuth, signOut: storeSignOut, updateUser } =
    useAuthStore(
      useShallow((s) => ({
        user: s.user,
        isAuthenticated: s.isAuthenticated,
        isLoading: s.isLoading,
        setAuth: s.setAuth,
        signOut: s.signOut,
        updateUser: s.updateUser,
      }))
    );

  const signUp = async (email: string, password: string, name?: string) => {
    const result = await authService.signUp({ email, password, name });
    // Don't setAuth if email confirmation is required — user has no valid session yet
    if (result.token !== 'pending_email_confirmation') {
      setAuth(result.user, result.token);
    }
    return result;
  };

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn({ email, password });
    setAuth(result.user, result.token);
    return result;
  };

  const signOut = async () => {
    // storeSignOut disconnects Stream services then calls authService.signOut() internally
    await storeSignOut();
    router.replace('/(auth)/sign-in');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateUser,
  };
}
