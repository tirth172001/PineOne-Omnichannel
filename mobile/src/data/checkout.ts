/**
 * Checkout builder mock data, ported verbatim from the web
 * (components/checkout/checkout-content.tsx and checkout-color-picker.tsx).
 */

export const DEFAULT_CHECKOUT_COLOR = '#173814';

export type PaymodeListItem = { name: string; active: boolean };

export type PaymodeCard = {
  /** Phosphor icon, or "upi" for the UPI wordmark tile. */
  icon: string;
  title: string;
  subtitle: string;
  active: boolean;
  logos?: boolean;
  pills?: string[];
  action: string;
  footerNote?: { text: string; tone: 'muted' | 'error' };
  detail: PaymodeListItem[];
};

const BANK_ISSUERS: PaymodeListItem[] = [
  { name: 'HDFC Bank', active: true },
  { name: 'ICICI Bank', active: true },
  { name: 'State Bank of India', active: true },
  { name: 'Axis Bank', active: false },
  { name: 'Kotak Mahindra Bank', active: false },
  { name: 'Yes Bank', active: false },
  { name: 'IDFC First Bank', active: false },
  { name: 'Punjab National Bank', active: false },
];

const NET_BANKING_BANKS: PaymodeListItem[] = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'IDFC First Bank',
  'Yes Bank',
  'IndusInd Bank',
  'Federal Bank',
  'RBL Bank',
  'Bank of India',
].map((name) => ({ name, active: false }));

const UPI_APPS: PaymodeListItem[] = [
  { name: 'Google Pay', active: true },
  { name: 'PhonePe', active: true },
  { name: 'Paytm', active: true },
  { name: 'BHIM', active: true },
  { name: 'Amazon Pay', active: false },
  { name: 'WhatsApp Pay', active: false },
  { name: 'Mobikwik', active: false },
  { name: 'CRED Pay', active: false },
];

const WALLET_PROVIDERS: PaymodeListItem[] = [
  'Paytm Wallet',
  'Amazon Pay Balance',
  'Mobikwik',
  'Freecharge',
  'PhonePe Wallet',
  'Airtel Money',
  'JioMoney',
  'Ola Money',
].map((name) => ({ name, active: false }));

export const PAYMODE_CARDS: PaymodeCard[] = [
  { icon: 'credit-card', title: 'Debit cards', subtitle: '3 / 3 issuers enabled', active: true, logos: true, action: 'View details', detail: BANK_ISSUERS },
  { icon: 'credit-card', title: 'Credit cards', subtitle: '3 / 3 issuers enabled', active: true, logos: true, action: 'View details', detail: BANK_ISSUERS },
  {
    icon: 'bank',
    title: 'Net banking',
    subtitle: '15 banks supported',
    active: false,
    action: 'View supported banks',
    footerNote: { text: 'You are not eligible', tone: 'muted' },
    detail: NET_BANKING_BANKS,
  },
  {
    icon: 'upi',
    title: 'UPI',
    subtitle: 'UPI intent and UPI collect services are available',
    active: false,
    pills: ['UPI intent', 'UPI collect'],
    action: 'Edit details',
    detail: UPI_APPS,
  },
  { icon: 'calendar-blank', title: 'EMI', subtitle: '3 / 3 issuers enabled', active: true, logos: true, action: 'View details', detail: BANK_ISSUERS },
  {
    icon: 'wallet',
    title: 'Wallets',
    subtitle: '3 wallet services provided on the platform',
    active: false,
    action: 'View supported wallets',
    footerNote: { text: 'Payment mode disabled by PineLabs', tone: 'error' },
    detail: WALLET_PROVIDERS,
  },
];

export type Hsv = { h: number; s: number; v: number };

/** Web: hsvToHex() in checkout-color-picker.tsx. */
export function hsvToHex(h: number, s: number, v: number) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let rgb: [number, number, number];
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${rgb.map(toHex).join('')}`;
}

/** Web: hexToHsv() in checkout-color-picker.tsx. */
export function hexToHsv(hex: string): Hsv {
  const clean = hex.replace('#', '');
  const normalized =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const bigint = Number.parseInt(normalized, 16);
  if (Number.isNaN(bigint) || normalized.length !== 6) return { h: 0, s: 0, v: 0 };
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

export function isHexColor(value: string) {
  return /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}
