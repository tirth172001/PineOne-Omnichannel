import { Stack } from 'expo-router';

/**
 * Payments is a stack: the tabbed listing (Transactions / Settlements /
 * Refunds) at /payments, with details, analytics and preferences pushed on
 * top so back navigation and gestures work natively. The shell draws the
 * chrome, so the stack's own header is off.
 */
export default function PaymentsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
