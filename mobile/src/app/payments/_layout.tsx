import { Stack } from 'expo-router';

/**
 * Payments is a stack: the transactions listing at /payments, with the
 * transaction detail and analytics pushed on top so back navigation and
 * gestures work natively. The shell draws the chrome, so the stack's own
 * header is off.
 */
export default function PaymentsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
