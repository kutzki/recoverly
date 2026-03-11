import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppState, AppStateStatus, StyleSheet } from 'react-native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { Jost_400Regular, Jost_500Medium } from '@expo-google-fonts/jost';
import { useAuthStore } from '../store/auth';
import { useChecklistStore } from '../store/checklist';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { initSentry, Sentry } from '../services/sentry';

// Initialise Sentry at module load — before any component renders.
// This ensures native crashes and ANRs are captured even on cold start.
initSentry();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 1000 * 60 * 5 } },
});

function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Jost_400Regular,
    Jost_500Medium,
  });

  const loadStoredAuth = useAuthStore((s) => s.loadStoredAuth);
  const loadChecklist = useChecklistStore((s) => s.loadChecklist);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    loadStoredAuth();
    // Reload checklist on every foreground transition so it resets correctly
    // if midnight has passed while the app was backgrounded or left open.
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        loadChecklist();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, []);

  // Keep the native splash screen visible while fonts load.
  // Return null (not a View) so expo-router knows to hold the splash.
  // If font loading errors, proceed anyway with system font fallback.
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(setup)" />
              <Stack.Screen name="(app)" />
            </Stack>
          </ErrorBoundary>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });

// Sentry.wrap adds its own error boundary and enables React component
// stack traces in crash reports.
export default Sentry.wrap(RootLayout);
