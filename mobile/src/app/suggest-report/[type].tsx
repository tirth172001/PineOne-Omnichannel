import { useLocalSearchParams } from 'expo-router';

import { SuggestReportForm } from '@/components/profile/suggest-report';

/** /suggest-report/feedback | bug | feature. */
export default function SuggestReportFormScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  return <SuggestReportForm type={type ?? ''} />;
}
