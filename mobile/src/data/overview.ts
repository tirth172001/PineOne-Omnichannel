import type { ImageSourcePropType } from 'react-native';


/**
 * Mock data for the Overview screen, mirroring the web app's Overview
 * (components/home/home-content.tsx, overview-detail-cards.tsx,
 * overview-analytics-section.tsx, overview-explore-products.tsx) so both
 * platforms show the same content and numbers. UI-only, like the web's
 * lib/*-data.ts.
 *
 * With every shop and channel selected, every number here equals the web's
 * "all stores" figures. Narrower scopes scale the aggregates the same way the
 * web does (it has no per-channel data either).
 */

import { formatCount, type MetricMode, type PaymentMode, type StatusTone } from './common';

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
  { value: 'online', label: 'Online' },
  { value: 'in-store', label: 'In-store' },
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
    pendingAmount: number;
    nextSettlement: string;
  }
> = {
  pinelabs: {
    netAmount: 184567.72,
    transactionsConsidered: 324,
    lastSettlement: 'Today · 03:00 PM',
    pendingAmount: 52340.18,
    nextSettlement: 'Tomorrow · 03:00 PM',
  },
  'partner-bank': {
    netAmount: 42180,
    transactionsConsidered: 96,
    lastSettlement: 'Today · 11:30 AM',
    pendingAmount: 11860,
    nextSettlement: 'Tomorrow · 11:30 AM',
  },
};

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

export const DAY_RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last-7-days', label: 'Last 7 days' },
] as const;
export type DayRange = (typeof DAY_RANGE_OPTIONS)[number]['value'];
export const DEFAULT_ANALYTICS_RANGE: DayRange = 'yesterday';

export const RANGE_MULTIPLIER: Record<DayRange, number> = { today: 1, yesterday: 0.91, 'last-7-days': 1 };
const HOURLY_RANGES: DayRange[] = ['today', 'yesterday'];

export type TrendKind = 'volume' | 'failed' | 'dispute' | 'refund';

export type AnalyticsWidgetId =
  | 'checkout-funnel'
  | 'paymode-distribution'
  | 'payment-volume'
  | 'failed-payments'
  | 'devices-distribution'
  | 'refunds'
  | 'disputes';

/** Web: WIDGET_CATALOG, same order and icons (Phosphor names). */
export const WIDGET_CATALOG: { id: AnalyticsWidgetId; title: string; icon: string }[] = [
  { id: 'checkout-funnel', title: 'Checkout funnel', icon: 'funnel' },
  { id: 'paymode-distribution', title: 'Pay modes', icon: 'chart-pie' },
  { id: 'payment-volume', title: 'Payment volume', icon: 'chart-bar' },
  { id: 'failed-payments', title: 'Failed payments', icon: 'warning' },
  { id: 'devices-distribution', title: 'Devices distribution', icon: 'devices' },
  { id: 'refunds', title: 'Refunds', icon: 'arrow-u-up-left' },
  { id: 'disputes', title: 'Disputes', icon: 'gavel' },
];

/** Chart colors, verbatim from the web: one green for every chart, rose for failures. */
export const CHART_ACCENT_COLOR = '#a9d977';
export const FAILED_PAYMENTS_ACCENT_COLOR = '#fb7185';
export const DEVICE_SECONDARY_COLOR = '#365314';

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOUR_LABELS = ['12 AM', '2 AM', '4 AM', '6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'];

const TREND_BASE: Record<TrendKind, { week: number[]; hour: number[] }> = {
  volume: { week: [162, 148, 171, 158, 183, 129, 96], hour: [3, 2, 2, 6, 15, 24, 29, 25, 20, 27, 22, 10] },
  failed: { week: [18, 22, 15, 27, 19, 12, 9], hour: [1, 0, 1, 2, 3, 4, 5, 4, 3, 4, 3, 2] },
  dispute: { week: [4, 6, 3, 5, 7, 2, 3], hour: [0, 0, 0, 1, 1, 1, 2, 1, 1, 2, 1, 0] },
  refund: { week: [12, 9, 14, 11, 16, 8, 6], hour: [1, 0, 1, 2, 3, 3, 4, 3, 2, 3, 2, 1] },
};

const AMOUNT_PER_UNIT: Record<TrendKind, number> = { volume: 3250, failed: 1800, dispute: 4200, refund: 2100 };

export function getTrendSeries(kind: TrendKind, range: DayRange, mode: MetricMode, scale: number) {
  const isHourly = HOURLY_RANGES.includes(range);
  const base = isHourly ? TREND_BASE[kind].hour : TREND_BASE[kind].week;
  const counts = base.map((value) => Math.round(value * scale));
  return {
    categories: isHourly ? HOUR_LABELS : WEEK_LABELS,
    data: mode === 'amount' ? counts.map((value) => value * AMOUNT_PER_UNIT[kind]) : counts,
  };
}

export type DistributionRow = { key: string; label: string; icon: string; count: number; amount: number };

/** Per-mode totals of the web's whole transactions dataset (230 rows, all stores). */
const PAY_MODE_TOTALS: Record<PaymentMode, { count: number; amount: number }> = {
  upi: { count: 79, amount: 3316250 },
  card: { count: 76, amount: 3096750 },
  netbanking: { count: 75, amount: 3094500 },
};
const ALL_TRANSACTIONS = { count: 230, amount: 9507500 };

const PAY_MODE_META: Record<PaymentMode, { label: string; icon: string }> = {
  upi: { label: 'UPI', icon: 'qr-code' },
  card: { label: 'Card', icon: 'credit-card' },
  netbanking: { label: 'Net banking', icon: 'dots-three-circle' },
};
/** Web: PAY_MODE_WEIGHT, skewing toward UPI as real Indian merchants do. */
const PAY_MODE_WEIGHT: Record<PaymentMode, number> = { upi: 1.85, card: 1, netbanking: 0.55 };
/** Web: EXTRA_PAY_MODES, display-only rows sized as a fraction of the real total. */
const EXTRA_PAY_MODES = [
  { key: 'wallet', label: 'Wallet', icon: 'wallet', fraction: 0.24 },
  { key: 'bank-transfer', label: 'Bank transfer', icon: 'bank', fraction: 0.17 },
  { key: 'pay-later', label: 'Pay later', icon: 'calendar-check', fraction: 0.09 },
];

export function getPayModeRows(storeScale: number, channelScale: number, range: DayRange): DistributionRow[] {
  const scale = storeScale * channelScale * RANGE_MULTIPLIER[range];
  const realRows = (['upi', 'card', 'netbanking'] as PaymentMode[]).map((mode) => ({
    key: mode,
    ...PAY_MODE_META[mode],
    count: Math.max(1, Math.round(PAY_MODE_TOTALS[mode].count * PAY_MODE_WEIGHT[mode] * scale)),
    amount: Math.round(PAY_MODE_TOTALS[mode].amount * PAY_MODE_WEIGHT[mode] * scale),
  }));
  const totalCount = realRows.reduce((sum, row) => sum + row.count, 0);
  const totalAmount = realRows.reduce((sum, row) => sum + row.amount, 0);
  const extraRows = EXTRA_PAY_MODES.map(({ fraction, ...extra }) => ({
    ...extra,
    count: Math.max(1, Math.round(totalCount * fraction)),
    amount: Math.round(totalAmount * fraction),
  }));
  return [...realRows, ...extraRows].sort((a, b) => b.count - a.count);
}

/** Web: DEVICE_SPLIT. */
const DEVICE_SPLIT = { mobile: 0.62, desktop: 0.38 };

export function getDeviceRows(storeScale: number, channelScale: number, range: DayRange): DistributionRow[] {
  const scale = storeScale * channelScale * RANGE_MULTIPLIER[range];
  const totalCount = Math.max(1, Math.round(ALL_TRANSACTIONS.count * scale));
  const totalAmount = Math.round(ALL_TRANSACTIONS.amount * scale);
  return [
    {
      key: 'mobile',
      label: 'Mobile',
      icon: 'device-mobile',
      count: Math.round(totalCount * DEVICE_SPLIT.mobile),
      amount: Math.round(totalAmount * DEVICE_SPLIT.mobile),
    },
    {
      key: 'desktop',
      label: 'Desktop',
      icon: 'desktop',
      count: Math.round(totalCount * DEVICE_SPLIT.desktop),
      amount: Math.round(totalAmount * DEVICE_SPLIT.desktop),
    },
  ];
}

/** Web: FUNNEL_STAGE_DEFS / FUNNEL_CONVERSION_RATES / FUNNEL_BASE_CART_INITIATED. */
const FUNNEL_STAGES = ['Cart Initiated', 'Logged In', 'Address Selected', 'Paymode Selected', 'Payment Initiated', 'Order Placed'];
const FUNNEL_CONVERSION_RATES = [0.7, 0.6, 0.5, 0.4, 0.1];
const FUNNEL_BASE_CART_INITIATED = 1000;

export type FunnelStage = {
  label: string;
  count: number;
  /** "70% of 1,000": share of the previous stage (null for the first). */
  conversionLabel: string | null;
  /** Drop-off to the next stage (null for the last). */
  dropOff: { percent: number; of: number } | null;
};

export function getFunnel(scale: number) {
  const counts = [Math.round(FUNNEL_BASE_CART_INITIATED * scale)];
  FUNNEL_CONVERSION_RATES.forEach((rate) => counts.push(Math.round(counts[counts.length - 1] * rate)));
  const stages: FunnelStage[] = FUNNEL_STAGES.map((label, index) => {
    const next = counts[index + 1];
    return {
      label,
      count: counts[index],
      conversionLabel:
        index === 0
          ? null
          : `${Math.round((counts[index] / Math.max(counts[index - 1], 1)) * 100)}% of ${formatCount(counts[index - 1])}`,
      dropOff:
        next === undefined
          ? null
          : {
              percent: counts[index] > 0 ? Math.round((Math.max(0, counts[index] - next) / counts[index]) * 100) : 0,
              of: counts[index],
            },
    };
  });
  const overallConversion = counts[0] > 0 ? Math.round((counts[counts.length - 1] / counts[0]) * 100) : 0;
  return { stages, overallConversion, base: counts[0] };
}

/* ------------------------------------------------------------------ */
/* Explore products                                                    */
/* ------------------------------------------------------------------ */

export const PRODUCT_BANNERS: { id: string; alt: string; image: ImageSourcePropType }[] = [
  { id: 'growthhub', alt: 'Drive more walk-ins to your store with GrowthHub', image: require('../../assets/images/overview-products/growthhub.png') },
  { id: 'smartbill', alt: 'SmartBill for smarter business', image: require('../../assets/images/overview-products/smartbill.png') },
  { id: 'myemi', alt: 'myEMI — no-cost EMIs on purchases as low as ₹3,000', image: require('../../assets/images/overview-products/myemi.png') },
  { id: 'contactless', alt: 'Contactless payments made quicker', image: require('../../assets/images/overview-products/contactless.png') },
];
