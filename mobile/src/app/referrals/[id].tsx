import { useLocalSearchParams } from 'expo-router';

import { ReferralDetail } from '@/components/profile/referrals';

/** /referrals/[id]: one referral and its timeline. */
export default function ReferralDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ReferralDetail id={id ?? ''} />;
}
