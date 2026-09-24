import { Stack } from 'expo-router';

/**
 * More is a stack: the menu at /more, with every module (disputes, products,
 * stores, users, account settings) pushed on top. The shell draws the
 * chrome, so the stack's own header is off.
 */
export default function MoreLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
