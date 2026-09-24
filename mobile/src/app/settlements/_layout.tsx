import { InnerPageStack } from '@/components/inner-page-stack';

/**
 * Settlements is a stack: the listing at /settlements, with the settlement
 * detail and preferences pushed on top, sliding in from the right (see
 * InnerPageStack).
 */
export default function SettlementsLayout() {
  return <InnerPageStack />;
}
