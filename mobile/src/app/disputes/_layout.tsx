import { InnerPageStack } from '@/components/inner-page-stack';

/**
 * Disputes is a stack: the listing at /disputes, with a dispute's detail
 * pushed on top, sliding in from the right (see InnerPageStack).
 */
export default function DisputesLayout() {
  return <InnerPageStack />;
}
