/**
 * Transaction Analytics widgets, ported verbatim from the web's
 * components/transactions/transactions-analytics-content.tsx, plus the date /
 * compare scaling from components/dashboard/overview-analytics-canvas.tsx.
 */

export type AnalyticsChartType = 'line' | 'area' | 'column' | 'bar' | 'pie';

export type TransactionAnalyticsWidget = {
  id: string;
  title: string;
  value: string;
  delta?: string;
  chart: number[];
  compareChart?: number[];
  chartLabels?: string[];
  chartType: AnalyticsChartType;
};

const totalPaymentsProcessed = 12720;
const totalAmountPaid = 193890;
const averageCompletionMins = 3;
const successfulPayments = 12213;
const failedPayments = totalPaymentsProcessed - successfulPayments;
const successRate = (successfulPayments / totalPaymentsProcessed) * 100;

/** The web formats these with en-MY (thousands grouping), e.g. "12,720". */
const grouped = (value: number) => value.toLocaleString('en-US');

export const TRANSACTION_ANALYTICS_WIDGETS: TransactionAnalyticsWidget[] = [
  {
    id: 'total-payments-processed',
    title: 'Total payments processed',
    value: grouped(totalPaymentsProcessed),
    delta: '+4.6% vs previous period',
    chart: [11140, 11390, 11680, 11820, 12110, 12340, 12720],
    compareChart: [10810, 10970, 11090, 11360, 11640, 11810, 12130],
    chartType: 'column',
  },
  {
    id: 'total-amount-paid',
    title: 'Total amount paid',
    value: `₹${grouped(totalAmountPaid)}`,
    delta: '+6.2% vs previous period',
    chart: [164000, 169500, 172300, 178600, 182200, 188400, 193890],
    compareChart: [152200, 157800, 161500, 166900, 170600, 176300, 182900],
    chartType: 'area',
  },
  {
    id: 'avg-completion-time',
    title: 'Average time to complete payment',
    value: `${averageCompletionMins} mins`,
    delta: '-0.4 mins improvement',
    chart: [3.8, 3.6, 3.5, 3.4, 3.3, 3.1, 3],
    compareChart: [4.1, 3.9, 3.8, 3.6, 3.5, 3.4, 3.2],
    chartType: 'line',
  },
  {
    id: 'success-rate',
    title: 'Successful payments from total attempted',
    value: `${successRate.toFixed(0)}%`,
    delta: `${grouped(successfulPayments)} successful`,
    chart: [94, 94.4, 95, 95.4, 95.9, 96.2, Number(successRate.toFixed(0))],
    compareChart: [92.8, 93.4, 93.9, 94.1, 94.8, 95.1, 95.4],
    chartType: 'area',
  },
  {
    id: 'error-split',
    title: 'Error split',
    value: `${grouped(failedPayments)} failed`,
    delta: 'Business vs technical declines',
    chartType: 'pie',
    chartLabels: ['Business decline', 'Technical decline'],
    chart: [92, 8],
  },
  {
    id: 'payment-app-split',
    title: 'Split of payment apps used by customer',
    value: 'Top payment app mix',
    delta: 'GooglePay leads',
    chartType: 'pie',
    chartLabels: ['GooglePay', 'PhonePe', 'BHIM', 'PayTM'],
    chart: [30, 26, 26, 18],
  },
  {
    id: 'bank-split',
    title: 'Split of customer bank accounts',
    value: 'Top issuing banks',
    delta: 'ABC, ICICI and Axis dominate',
    chartType: 'pie',
    chartLabels: ['ABC', 'ICICI', 'Axis', 'HDFC', 'IDFC', 'Others'],
    chart: [25.5, 19.5, 18, 15, 12, 10],
  },
  {
    id: 'business-decline-reasons',
    title: 'Business decline reason trend',
    value: 'Insufficient funds 3.64%',
    delta: 'Top business decline driver',
    chartType: 'bar',
    chartLabels: ['Insufficient funds', 'Suspected fraud', 'Invalid mPIN', 'Limit exceeded', 'PIN tries exceeded'],
    chart: [3.64, 0.68, 0.68, 0.07, 0.06],
  },
  {
    id: 'technical-decline-reasons',
    title: 'Technical decline reason trend',
    value: 'Remitter CBS offline 0.07%',
    delta: 'Top technical decline driver',
    chartType: 'bar',
    chartLabels: ['Remitter CBS offline', 'Timeout', 'Cut off in progress', 'Internal exception', 'Unable to notify customer'],
    chart: [0.07, 0.06, 0.02, 0.01, 0.005],
  },
  {
    id: 'failed-count',
    title: 'Count of failed payments',
    value: grouped(failedPayments),
    delta: 'Decline stack monitored',
    chart: [240, 230, 215, 205, 198, 193, failedPayments],
    compareChart: [265, 258, 250, 241, 231, 220, 210],
    chartType: 'line',
  },
];

export const ANALYTICS_WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Web: the view, date and compare options passed to OverviewAnalyticsCanvas. */
export const ANALYTICS_VIEW_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'checkout', label: 'Checkout' },
  { value: 'pos-terminal', label: 'POS Terminal' },
  { value: 'payment-links', label: 'Payment Links' },
] as const;
export const ANALYTICS_DATE_OPTIONS = ['Today', 'Last 7 days', 'Last 30 days', 'This quarter'].map((value) => ({ value, label: value }));
export const ANALYTICS_COMPARE_OPTIONS = ['Yesterday', 'Previous period', 'Last week'].map((value) => ({
  value,
  label: `Compare: ${value}`,
}));
/** The canvas defaults to its second date option and first compare option. */
export const DEFAULT_ANALYTICS_DATE = 'Last 7 days';
export const DEFAULT_ANALYTICS_COMPARE = 'Yesterday';

/** Web: the canvas scales every chart by the date range… */
export function dateScale(range: string) {
  if (range === 'Today') return 0.88;
  if (range === 'Last 30 days') return 1.18;
  if (range === 'This quarter') return 1.26;
  return 1;
}

/** …and the comparison series by the compare range. */
export function compareScale(range: string) {
  if (range === 'Yesterday') return 0.92;
  if (range === 'Previous period') return 0.9;
  if (range === 'Last week') return 0.86;
  return 0.9;
}
