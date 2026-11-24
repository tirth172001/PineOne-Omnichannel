import { useLocalSearchParams } from 'expo-router';

import { PrimeMembership } from '@/components/profile/prime';
import { PRIME_HERO_VARIANTS, type PrimeHeroVariant } from '@/components/profile/prime-hero';

/** /prime (profile → Rewards → Prime membership); ?hero=a…f picks the hero variation to compare. */
export default function PrimeScreen() {
  const { hero } = useLocalSearchParams<{ hero?: string }>();
  const variant = PRIME_HERO_VARIANTS.find((item) => item === hero) as PrimeHeroVariant | undefined;
  return <PrimeMembership heroVariant={variant ?? 'a'} />;
}
