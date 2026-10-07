import { RefundsHeroView } from '@/components/payments/refunds-hero-view';
import { RefundsView } from '@/components/payments/refunds-view';
import { TabScreen } from '@/components/tab-screen';
import { LISTING_HERO_LAYOUT } from '@/constants/experiments';

/** Refunds tab (web: /refunds). */
export default function RefundsScreen() {
  return <TabScreen tab="refunds">{LISTING_HERO_LAYOUT ? <RefundsHeroView /> : <RefundsView />}</TabScreen>;
}
