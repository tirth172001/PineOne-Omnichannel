import { useLocalSearchParams } from 'expo-router';

import { SupportChat } from '@/components/support/support-chat';

export default function SupportChatScreen() {
  const { topic, prompt } = useLocalSearchParams<{ topic?: string; prompt?: string }>();
  // Keyed so arriving with a new topic or prompt starts a fresh chat.
  return <SupportChat key={`${topic ?? ''}|${prompt ?? ''}`} topic={topic} prompt={prompt} />;
}
