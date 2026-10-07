/**
 * Types and formatting shared by every module's mock data (Overview, Payments,
 * Reports…), matching how the web app formats amounts and counts.
 */

export type PaymentMode = 'upi' | 'card' | 'netbanking';
/** Web: StatusTone in components/shared/status-pill.tsx. */
export type StatusTone = 'processing' | 'success' | 'initiated' | 'failed';
export type MetricMode = 'count' | 'amount';

/** Indian digit grouping without decimals: 1942250 → "19,42,250". */
export function formatCount(value: number) {
  const digits = String(Math.round(Math.abs(value)));
  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${value < 0 ? '-' : ''}${rest ? `${rest},` : ''}${lastThree}`;
}

/** "₹19,42,250.00": Indian digit grouping, two decimals (the web's formatInrAmount). */
/** "₹ 20,000" → 20000 (whole rupees, as the mock data's string amounts are). */
export function parseInr(amount: string) {
  return Number(amount.replace(/[^\d]/g, '')) || 0;
}

export function formatInr(value: number) {
  const [rupees, paise] = Math.abs(value).toFixed(2).split('.');
  return `${value < 0 ? '-' : ''}₹${formatCount(Number(rupees))}.${paise}`;
}

/** Web: formatTotal(): "₹…" with decimals by amount, grouped integer by count. */
export function formatMetric(value: number, mode: MetricMode) {
  return mode === 'amount' ? formatInr(value) : formatCount(value);
}

/** Web: formatAxisValue(): compact axis ticks (10.5K / ₹1.2L). */
export function formatAxisValue(value: number, mode: MetricMode) {
  if (mode === 'amount') {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
  }
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${value}`;
}

/** Web: buildAxisTicks(): a "nice" 0..max tick set, de-duplicated for tiny ranges. */
export function buildAxisTicks(maxValue: number, tickCount = 4) {
  if (maxValue <= 0) return [0];
  const rawStep = maxValue / tickCount;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep || 1));
  const normalized = rawStep / magnitude;
  const niceStep = Math.max(1, (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude);
  const ticks: number[] = [];
  for (let tick = 0; tick <= maxValue + niceStep; tick += niceStep) ticks.push(Math.round(tick));
  return Array.from(new Set(ticks));
}
