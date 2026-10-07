import type { ImageSourcePropType } from 'react-native';

/**
 * Mock data for the Overview screen, mirroring the web app's Overview
 * (components/home/home-content.tsx, overview-detail-cards.tsx,
 * overview-explore-products.tsx) so both
 * platforms show the same content and numbers. UI-only, like the web's
 * lib/*-data.ts.
 *
 * With every shop and channel selected, every number here equals the web's
 * "all stores" figures. Narrower scopes scale the aggregates the same way the
 * web does (it has no per-channel data either).
 */

import type { PaymentMode, StatusTone } from './common';

export { buildAxisTicks, formatAxisValue, formatCount, formatInr, formatMetric } from './common';
export type { MetricMode, PaymentMode, StatusTone } from './common';

/* ------------------------------------------------------------------ */
/* Greeting                                                            */
/* ------------------------------------------------------------------ */

/** Web: getTimeOfDayGreeting() in home-content.tsx. */
export function getTimeOfDayGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ------------------------------------------------------------------ */
/* Scope: channel filter                                               */
/* ------------------------------------------------------------------ */

export const CHANNEL_OPTIONS = [
  { value: 'all', label: 'All channels' },
  { value: 'in-store', label: 'In-store' },
  { value: 'online', label: 'Online' },
] as const;
export type ChannelFilter = (typeof CHANNEL_OPTIONS)[number]['value'];

/** Web: CHANNEL_MULTIPLIER. There's no online/in-store split in the data, so the channel scales aggregates. */
export const CHANNEL_MULTIPLIER: Record<ChannelFilter, number> = { all: 1, online: 0.57, 'in-store': 0.43 };

/** Web applies a 4% floor when a store subset is selected, so tiny scopes never read as zero. */
export const MIN_STORE_SCALE = 0.04;

/* ------------------------------------------------------------------ */
/* Today's payments / settlement cards                                 */
/* ------------------------------------------------------------------ */

export type RecentPayment = {
  transactionId: string;
  amount: number;
  time: string;
  paymentMode: PaymentMode;
  status: { label: string; tone: StatusTone };
};

/** The web's "today" sample: the first 48 rows of its transactions dataset (all stores). */
export const TODAY_PAYMENTS = {
  totalAmount: 1942250,
  count: 48,
  failedCount: 24,
  recent: [
    { transactionId: '1525039333', amount: 20000, time: '10:10 PM', paymentMode: 'upi', status: { label: 'Pending', tone: 'processing' } },
    { transactionId: '1525039336', amount: 10000, time: '9:30 PM', paymentMode: 'card', status: { label: 'Success', tone: 'success' } },
    { transactionId: '1525039339', amount: 25000, time: '3:00 PM', paymentMode: 'card', status: { label: 'Failed', tone: 'failed' } },
  ] satisfies RecentPayment[],
};

export type SettlementSource = 'pinelabs' | 'partner-bank';

export const SETTLEMENT_SOURCES: { value: SettlementSource; label: string }[] = [
  { value: 'pinelabs', label: 'Pine Labs' },
  { value: 'partner-bank', label: 'Partner Bank' },
];

/** Web: SETTLEMENT_TODAY_STATS (amounts in rupees). */
export const SETTLEMENT_TODAY: Record<
  SettlementSource,
  {
    netAmount: number;
    transactionsConsidered: number;
    lastSettlement: string;
    /** The Overview card's wording (Figma 6470:737). */
    lastSettledLabel: string;
    pendingAmount: number;
    nextSettlement: string;
    nextSettlementLabel: string;
  }
> = {
  pinelabs: {
    netAmount: 184567.72,
    transactionsConsidered: 324,
    lastSettlement: 'Today · 03:00 PM',
    lastSettledLabel: 'Last settled at 3 PM today',
    pendingAmount: 52340.18,
    nextSettlement: 'Tomorrow · 03:00 PM',
    nextSettlementLabel: 'Today by 6 PM',
  },
  'partner-bank': {
    netAmount: 42180,
    transactionsConsidered: 96,
    lastSettlement: 'Today · 11:30 AM',
    lastSettledLabel: 'Last settled at 11:30 AM today',
    pendingAmount: 11860,
    nextSettlement: 'Tomorrow · 11:30 AM',
    nextSettlementLabel: 'Today by 7:30 PM',
  },
};

/* ------------------------------------------------------------------ */
/* Explore products                                                    */
/* ------------------------------------------------------------------ */

export const PRODUCT_BANNERS: { id: string; alt: string; image: ImageSourcePropType }[] = [
  { id: 'growthhub', alt: 'Drive more walk-ins to your store with GrowthHub', image: require('../../assets/images/overview-products/growthhub.png') },
  { id: 'smartbill', alt: 'SmartBill for smarter business', image: require('../../assets/images/overview-products/smartbill.png') },
  { id: 'myemi', alt: 'myEMI — no-cost EMIs on purchases as low as ₹3,000', image: require('../../assets/images/overview-products/myemi.png') },
  { id: 'contactless', alt: 'Contactless payments made quicker', image: require('../../assets/images/overview-products/contactless.png') },
];
