import { Stack } from 'expo-router';

/**
 * Support is a stack: the landing at /support, with the chat, FAQs, videos
 * and tickets pushed on top (web: the shared /support layout). The shell
 * draws the chrome, so the stack's own header is off.
 */
export default function SupportLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
