import { InnerPageStack } from '@/components/inner-page-stack';

/**
 * Support is a stack: the landing at /support, with chat, FAQs, tickets and
 * videos pushed on top, sliding in from the right (see InnerPageStack).
 */
export default function SupportLayout() {
  return <InnerPageStack />;
}
