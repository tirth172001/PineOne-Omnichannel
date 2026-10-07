import { DisputesHeroView } from '@/components/disputes/disputes-hero-view';
import { DisputesList } from '@/components/disputes/disputes-list';
import { LISTING_HERO_LAYOUT } from '@/constants/experiments';

export default function DisputesScreen() {
  return LISTING_HERO_LAYOUT ? <DisputesHeroView /> : <DisputesList />;
}
