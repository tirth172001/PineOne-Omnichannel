import { Stack } from 'expo-router';

/**
 * Settlements is a stack: the listing at /settlements, with the settlement
 * detail and preferences pushed on top. The shell draws the chrome, so the
 * stack's own header is off.
 */
export default function SettlementsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
