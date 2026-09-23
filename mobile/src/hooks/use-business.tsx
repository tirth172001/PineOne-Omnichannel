import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import { ORGANISATIONS, type Organisation, type Shop } from '@/data/businesses';
import { MIN_STORE_SCALE } from '@/data/overview';

type BusinessContextValue = {
  organisation: Organisation;
  /** Selected shop ids; empty means every shop in the organisation. */
  shopIds: string[];
  /** The selected shops (every shop when shopIds is empty). */
  shops: Shop[];
  /** "Koramangala", "3 stores", or "All stores": what the header shows (the web Overview's wording). */
  scopeLabel: string;
  /** Share of the organisation's business in scope (1 for all shops); scales Overview numbers. */
  storeScale: number;
  /** Switching organisation selects its first shop. */
  selectOrganisation: (organisationId: string) => void;
  /** Single shop (header switcher). */
  selectShop: (shopId: string) => void;
  /** Any subset; [] = all shops (Overview's "Change store"). */
  setShopIds: (shopIds: string[]) => void;
};

const BusinessContext = createContext<BusinessContextValue | null>(null);

/**
 * The org and shop(s) the whole app is scoped to. The header switcher and the
 * Overview's "Change store" picker both write here, so they never disagree.
 * In memory only for now.
 */
export function BusinessProvider({ children }: { children: ReactNode }) {
  const [organisationId, setOrganisationId] = useState(ORGANISATIONS[0].id);
  // Starts on a single shop, matching the Figma app shell (Health & Glow · Koramangala).
  const [shopIds, setShopIds] = useState<string[]>([ORGANISATIONS[0].shops[0].id]);

  const value = useMemo(() => {
    const organisation = ORGANISATIONS.find((org) => org.id === organisationId) ?? ORGANISATIONS[0];
    const validIds = shopIds.filter((id) => organisation.shops.some((shop) => shop.id === id));
    const allSelected = validIds.length === 0 || validIds.length === organisation.shops.length;
    const shops = allSelected ? organisation.shops : organisation.shops.filter((shop) => validIds.includes(shop.id));
    const scopeLabel = allSelected ? 'All stores' : shops.length === 1 ? shops[0].name : `${shops.length} stores`;
    const storeScale = allSelected
      ? 1
      : Math.max(
          shops.reduce((sum, shop) => sum + shop.share, 0),
          MIN_STORE_SCALE
        );

    return {
      organisation,
      shopIds: allSelected ? [] : validIds,
      shops,
      scopeLabel,
      storeScale,
      selectOrganisation: (id: string) => {
        const next = ORGANISATIONS.find((org) => org.id === id);
        if (!next) return;
        setOrganisationId(next.id);
        setShopIds([next.shops[0].id]);
      },
      selectShop: (id: string) => setShopIds([id]),
      setShopIds: (ids: string[]) => setShopIds(ids.length === organisation.shops.length ? [] : ids),
    };
  }, [organisationId, shopIds]);

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness() {
  const value = useContext(BusinessContext);
  if (!value) throw new Error('useBusiness must be used inside <BusinessProvider>');
  return value;
}
