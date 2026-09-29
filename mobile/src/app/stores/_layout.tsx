import { InnerPageStack } from '@/components/inner-page-stack';

/**
 * Stores is a stack: the listing at /stores, with a store's detail pushed on
 * top, sliding in from the right (see InnerPageStack).
 */
export default function StoresLayout() {
  return <InnerPageStack />;
}
