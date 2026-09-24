import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import { ORGANISATIONS, type Organisation, type Shop } from '@/data/businesses';
import { CHANNEL_MULTIPLIER, CHANNEL_OPTIONS, type ChannelFilter, MIN_STORE_SCALE } from '@/data/overview';

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
  /** Overview's channel: all, in-store or online (only Overview offers "All channels"). */
  channel: ChannelFilter;
  /** "All channels", "In-store" or "Online". */
  channelLabel: string;
  /** Share of the business on the chosen channel (1 for all); scales Overview numbers. */
  channelScale: number;
  /**
   * The channel for channel-split pages (Payments, Disputes, Reports): always
   * in-store or online — the current channel, or the last one picked when
   * Overview is on All channels (in-store to start).
   */
  specificChannel: SpecificChannel;
  /** Header / title subtext, e.g. "Koramangala · In-store", "Online" (no stores online), "All stores · All channels". */
  scopeText: (allowAllChannels: boolean) => string;
  /** Applies a whole scope at once (the header switcher's Apply). */
  applyScope: (scope: { organisationId: string; shopIds: string[]; channel: ChannelFilter }) => void;
  /** Switching organisation selects its first shop. */
  selectOrganisation: (organisationId: string) => void;
  /** Single shop (header switcher). */
  selectShop: (shopId: string) => void;
  /** Any subset; [] = all shops (Overview's "Change store"). */
  setShopIds: (shopIds: string[]) => void;
};

export type SpecificChannel = Exclude<ChannelFilter, 'all'>;

const BusinessContext = createContext<BusinessContextValue | null>(null);

/**
 * The org, shop(s) and channel the whole app is scoped to. Only the header
 * switcher changes them: pages have no store or channel filters of their own
 * (global switching only). "All channels" exists only on Overview; the
 * channel-split pages read `specificChannel`. Stores only apply in-store.
 * In memory only for now.
 */
export function BusinessProvider({ children }: { children: ReactNode }) {
  const [organisationId, setOrganisationId] = useState(ORGANISATIONS[0].id);
  // Starts on a single shop, matching the Figma app shell (Health & Glow · Koramangala).
  const [shopIds, setShopIds] = useState<string[]>([ORGANISATIONS[0].shops[0].id]);
  const [channel, setChannel] = useState<ChannelFilter>('all');
  const [lastSpecific, setLastSpecific] = useState<SpecificChannel>('in-store');

  const value = useMemo(() => {
    const specificChannel: SpecificChannel = channel === 'all' ? lastSpecific : channel;
    const organisation = ORGANISATIONS.find((org) => org.id === organisationId) ?? ORGANISATIONS[0];
    const validIds = shopIds.filter((id) => organisation.shops.some((shop) => shop.id === id));
    const allSelected = validIds.length === 0 || validIds.length === organisation.shops.length;
    const shops = allSelected ? organisation.shops : organisation.shops.filter((shop) => validIds.includes(shop.id));
    const scopeLabel = allSelected ? 'All stores' : shops.length === 1 ? shops[0].name : `${shops.length} stores`;
    // Online has no stores, so a store selection doesn't narrow it.
    const storeScale = allSelected || channel === 'online'
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
      channel,
      channelLabel: CHANNEL_OPTIONS.find((option) => option.value === channel)?.label ?? 'All channels',
      channelScale: CHANNEL_MULTIPLIER[channel],
      specificChannel,
      scopeText: (allowAllChannels: boolean) => {
        const shown: ChannelFilter = allowAllChannels ? channel : specificChannel;
        const label = CHANNEL_OPTIONS.find((option) => option.value === shown)?.label ?? 'All channels';
        return shown === 'online' ? label : `${scopeLabel} · ${label}`;
      },
      applyScope: (scope: { organisationId: string; shopIds: string[]; channel: ChannelFilter }) => {
        const next = ORGANISATIONS.find((org) => org.id === scope.organisationId) ?? organisation;
        setOrganisationId(next.id);
        setShopIds(scope.shopIds.length === next.shops.length ? [] : scope.shopIds);
        setChannel(scope.channel);
        if (scope.channel !== 'all') setLastSpecific(scope.channel);
      },
      selectOrganisation: (id: string) => {
        const next = ORGANISATIONS.find((org) => org.id === id);
        if (!next) return;
        setOrganisationId(next.id);
        setShopIds([next.shops[0].id]);
      },
      selectShop: (id: string) => setShopIds([id]),
      setShopIds: (ids: string[]) => setShopIds(ids.length === organisation.shops.length ? [] : ids),
    };
  }, [organisationId, shopIds, channel, lastSpecific]);

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness() {
  const value = useContext(BusinessContext);
  if (!value) throw new Error('useBusiness must be used inside <BusinessProvider>');
  return value;
}
