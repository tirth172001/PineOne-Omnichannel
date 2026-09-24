import { InnerPageStack } from '@/components/inner-page-stack';

/**
 * Payments is a stack: the transactions listing at /payments, with the
 * transaction detail and analytics pushed on top, sliding in from the right
 * (see InnerPageStack).
 */
export default function PaymentsLayout() {
  return <InnerPageStack />;
}
