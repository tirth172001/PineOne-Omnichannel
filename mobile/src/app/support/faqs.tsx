import { useLocalSearchParams } from 'expo-router';

import { SupportFaqs } from '@/components/support/support-faqs';

export default function SupportFaqsScreen() {
  const { topic } = useLocalSearchParams<{ topic?: string }>();
  return <SupportFaqs initialTopic={topic} />;
}
