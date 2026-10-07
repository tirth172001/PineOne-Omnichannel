import { SettlementsHeroView } from '@/components/payments/settlements-hero-view';
import { SettlementsView } from '@/components/payments/settlements-view';
import { TabScreen } from '@/components/tab-screen';
import { LISTING_HERO_LAYOUT } from '@/constants/experiments';

/** Settlements tab (web: /settlements). */
export default function SettlementsScreen() {
  return <TabScreen tab="settlements">{LISTING_HERO_LAYOUT ? <SettlementsHeroView /> : <SettlementsView />}</TabScreen>;
}
