import { InnerPageStack } from '@/components/inner-page-stack';

/**
 * More is a stack: the menu at /more, with every module (disputes, reports,
 * products, stores, users, account settings, support) pushed on top, sliding
 * in from the right (see InnerPageStack).
 */
export default function MoreLayout() {
  return <InnerPageStack />;
}
