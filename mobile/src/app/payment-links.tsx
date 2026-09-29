import { useLocalSearchParams } from 'expo-router';

import { PaymentLinks } from '@/components/products/payment-links';

/** /payment-links (web: /payment-links). `?create=1` opens the create panel (Overview quick action). */
export default function PaymentLinksScreen() {
  const { create } = useLocalSearchParams<{ create?: string }>();
  return <PaymentLinks startCreating={create === '1'} />;
}
