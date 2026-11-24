import { useLocalSearchParams } from 'expo-router';

import { GuideChat } from '@/components/guide/guide-chat';

export default function GuideChatScreen() {
  const { prompt } = useLocalSearchParams<{ prompt?: string }>();
  // Keyed so arriving with a new question starts a fresh chat.
  return <GuideChat key={prompt ?? ''} prompt={prompt} />;
}
