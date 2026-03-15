import { Stack } from 'expo-router';

// Entrance animation is provided by PanicOverlay in app/(app)/_layout.tsx.
// Sub-screens (bad-day, etc.) slide in from the right as normal push transitions.
export default function SOSLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"          options={{ animation: 'none' }} />
      <Stack.Screen name="bad-day"         options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="feel-like-using" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="just-relapsed"   options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="self-harm"       options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="feeling-anxious" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
