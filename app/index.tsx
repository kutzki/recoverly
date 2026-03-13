import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/auth';
import { useChecklistStore } from '../store/checklist';
import { useProgressStore } from '../store/progress';
import { Colors } from '../constants/colors';

export default function Index() {
  const isLoading        = useAuthStore((s) => s.isLoading);
  const isAuthenticated  = useAuthStore((s) => s.isAuthenticated);
  const user             = useAuthStore((s) => s.user);
  const loadStoredAuth   = useAuthStore((s) => s.loadStoredAuth);
  const loadChecklist    = useChecklistStore((s) => s.loadChecklist);
  const loadProgress     = useProgressStore((s) => s.loadProgress);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadChecklist();
      loadProgress(user.id);
    }
  }, [isAuthenticated, user?.id]);

  if (isLoading) {
    // Blank white screen while session is restored — no spinner, no text.
    // The native splash screen covers this until JS is ready.
    return <View style={styles.root} />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(onboarding)/slide-1" />;
  }

  if (!user?.is_profile_complete) {
    return <Redirect href="/(setup)/welcome" />;
  }

  return <Redirect href="/(app)/home" />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
});
