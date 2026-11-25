import { useLocalSearchParams } from 'expo-router';

import { GuideChat } from '@/components/guide/guide-chat';

export default function GuideChatScreen() {
  const { prompt, chat } = useLocalSearchParams<{ prompt?: string; chat?: string }>();
  // Keyed so arriving with a new question (or a saved chat from History) starts there.
  return <GuideChat key={chat ?? prompt ?? ''} prompt={prompt} chatId={chat} />;
}
