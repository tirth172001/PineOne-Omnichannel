import { useSyncExternalStore } from 'react';

/**
 * The signed-in user's own settings, opened from the profile: contact
 * details, password and screen lock, notification channels, language,
 * plus referrals and the Rewards pages. Mirrors the old Pine Labs One app's
 * profile menu (merchant_experience_app: profile, settings, referral,
 * suggestion_feedback); UI-only, no backend.
 */

// ── Store ────────────────────────────────────────────────────────────────

export type NotificationCategory = { key: string; label: string; icon: string };

/** Who hears about what (old app: Channel preferences), per category and role. */
export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  { key: 'TRANSACTION', label: 'Transactions', icon: 'receipt' },
  { key: 'SETTLEMENT', label: 'Settlements', icon: 'bank' },
  { key: 'REFUND', label: 'Refunds', icon: 'arrow-u-up-left' },
  { key: 'RISK', label: 'Risk', icon: 'shield-check' },
  { key: 'CHARGEBACK', label: 'Chargeback', icon: 'gavel' },
  { key: 'SUPPORT', label: 'Support', icon: 'lifebuoy' },
  { key: 'VAS', label: 'VAS', icon: 'diamond' },
  { key: 'ORDER', label: 'Order', icon: 'shopping-cart' },
  { key: 'AR_ACH', label: 'AR/ACH', icon: 'repeat' },
];

/** Who hears about each category: role ids from the Users & roles catalogue (system and custom roles). */
export type NotificationMatrix = Record<string, string[]>;

/** Owners and admins hear about everything; other roles only about what they act on. */
const EVERYONE = ['cat-off-owner', 'cat-off-admin', 'cat-on-owner'];
const DEFAULT_EXTRA: Record<string, string[]> = {
  TRANSACTION: ['cat-off-store-manager', 'cat-off-store-cashier', 'cat-on-operations'],
  SETTLEMENT: ['cat-off-accountant', 'cat-on-finance'],
  REFUND: ['cat-off-store-manager', 'cat-on-operations', 'cat-on-support'],
  RISK: ['cat-on-operations'],
  CHARGEBACK: ['cat-on-operations', 'cat-on-finance'],
  SUPPORT: ['cat-off-store-manager', 'cat-off-user-admin', 'cat-on-support'],
  VAS: [],
  ORDER: ['cat-off-store-manager'],
  AR_ACH: ['cat-off-accountant', 'cat-on-finance'],
};
export function defaultNotificationMatrix(): NotificationMatrix {
  return Object.fromEntries(NOTIFICATION_CATEGORIES.map((category) => [category.key, [...EVERYONE, ...(DEFAULT_EXTRA[category.key] ?? [])]]));
}

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
] as const;
export type LanguageCode = (typeof LANGUAGES)[number]['code'];

type ProfileState = {
  phone: string;
  email: string;
  address: string;
  passwordUpdated: string;
  screenLock: boolean;
  language: LanguageCode;
  notifications: { enableAll: boolean; matrix: NotificationMatrix; updated: string };
  referrals: Referral[];
  claimed: number;
};

let state: ProfileState = {
  phone: '98765 43210',
  email: 'tirthtrivedi17@gmail.com',
  address: '1st Floor, 80 Feet Road, Koramangala 4th Block, Bengaluru, Karnataka 560034',
  passwordUpdated: '12 Aug 2026',
  screenLock: false,
  language: 'en',
  notifications: { enableAll: false, matrix: defaultNotificationMatrix(), updated: '04 Nov 2026, 11:20 AM' },
  referrals: [],
  claimed: 0,
};
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
function set(patch: Partial<ProfileState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

export function useProfile() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export const nowLabel = () => new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
export const todayLabel = () => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const updatePhone = (phone: string) => set({ phone });
export const updateEmail = (email: string) => set({ email });
export const updatePassword = () => set({ passwordUpdated: todayLabel() });
export const setScreenLock = (screenLock: boolean) => set({ screenLock });
export const setLanguage = (language: LanguageCode) => set({ language });
export const saveNotifications = (enableAll: boolean, matrix: NotificationMatrix) => set({ notifications: { enableAll, matrix, updated: nowLabel() } });

export const formatPhone = (digits: string) => {
  const clean = digits.replace(/\D/g, '');
  return clean.length === 10 ? `${clean.slice(0, 5)} ${clean.slice(5)}` : clean;
};
/** "+91 •••••• 3210", for where an OTP goes. */
export const maskedPhone = (phone: string) => `+91 ••••• •${phone.replace(/\D/g, '').slice(-4)}`;
export const maskedEmail = (email: string) => {
  const [user = '', domain = ''] = email.split('@');
  return `${user.slice(0, 2)}${'•'.repeat(Math.max(2, user.length - 2))}@${domain}`;
};

// ── Suggest & Report ─────────────────────────────────────────────────────

export type FeedbackType = 'feedback' | 'bug' | 'feature';
export const FEEDBACK_TYPES: Record<FeedbackType, { title: string; line: string; icon: string; heading: string; thanks: string; next: string }> = {
  feedback: {
    title: 'Give feedback',
    line: 'Tell us about your experience!',
    icon: 'smiley',
    heading: 'Tell us how your day went with Pine Labs One!',
    thanks: 'Thanks for your feedback!',
    next: 'We appreciate it and are always working to improve your experience.',
  },
  bug: {
    title: 'Report bugs',
    line: 'Found an issue? Let us know!',
    icon: 'bug',
    heading: 'Something not working as expected? Help us improve by reporting it!',
    thanks: 'Thanks for letting us know!',
    next: 'We will review and fix this as soon as possible.',
  },
  feature: {
    title: 'Request a feature',
    line: 'Got an idea? We would love to hear it!',
    icon: 'lightbulb',
    heading: 'Have an idea? Let us know how we can improve your experience!',
    thanks: 'Thanks for your suggestion!',
    next: 'We will review it soon.',
  },
};
export const FEEDBACK_CATEGORIES = ['Payments', 'Settlements', 'Refunds', 'Devices', 'Payment links', 'Reports', 'Login & account', 'Other'];
export const FEEDBACK_LIMITS = { files: 5, sizeMb: 4, extensions: ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'pdf'] };

// ── Referrals ────────────────────────────────────────────────────────────

export type ReferralCategory = 'inProgress' | 'successful' | 'ineligible';
/** The five stages a referral moves through (old app: Referral timeline). */
export const REFERRAL_STEPS = [
  { title: 'Referred', line: 'Referral submitted' },
  { title: 'Device deployed', line: 'Mini device deployed for the merchant' },
  { title: 'GTV achieved', line: 'Required GTV achieved within eligibility window' },
  { title: 'Referral successful', line: 'Referral became eligible for reward' },
  { title: 'Reward claimed', line: 'Reward has been claimed successfully' },
];

export type Referral = {
  id: string;
  name: string;
  business: string;
  phone: string;
  city: string;
  pincode: string;
  referredOn: string;
  lastUpdate: string;
  /** Index into REFERRAL_STEPS reached so far. */
  stage: number;
  category: ReferralCategory;
  /** Why it can't earn a reward, for ineligible ones. */
  reason?: string;
  /** The number couldn't be reached: the referrer should correct it. */
  needsAction?: boolean;
};

export const REWARD_PER_REFERRAL = 499;

const SEED_REFERRALS: Referral[] = [
  { id: 'REF-2041', name: 'Ankit Sharma', business: 'Sharma General Store', phone: '98111 22334', city: 'Bengaluru', pincode: '560034', referredOn: '02 Nov 2026', lastUpdate: '18 Nov 2026', stage: 3, category: 'successful' },
  { id: 'REF-2036', name: 'Meera Nair', business: 'Nair Bakes', phone: '99001 45671', city: 'Kochi', pincode: '682016', referredOn: '28 Oct 2026', lastUpdate: '15 Nov 2026', stage: 4, category: 'successful' },
  { id: 'REF-2049', name: 'Rahul Verma', business: 'Verma Electronics', phone: '98450 11122', city: 'Bengaluru', pincode: '560068', referredOn: '10 Nov 2026', lastUpdate: '17 Nov 2026', stage: 1, category: 'inProgress' },
  { id: 'REF-2051', name: 'Pooja Iyer', business: 'Iyer Pharmacy', phone: '97400 98765', city: 'Chennai', pincode: '600020', referredOn: '12 Nov 2026', lastUpdate: '12 Nov 2026', stage: 0, category: 'inProgress', needsAction: true },
  { id: 'REF-2053', name: 'Sandeep Gill', business: 'Gill Sweets', phone: '98140 33221', city: 'Ludhiana', pincode: '141001', referredOn: '14 Nov 2026', lastUpdate: '19 Nov 2026', stage: 2, category: 'inProgress' },
  { id: 'REF-2012', name: 'Kavya Reddy', business: 'Reddy Textiles', phone: '90000 12345', city: 'Hyderabad', pincode: '500034', referredOn: '20 Sep 2026', lastUpdate: '20 Oct 2026', stage: 0, category: 'ineligible', reason: 'Not onboarded within 30 days' },
  { id: 'REF-2019', name: 'Imran Khan', business: 'Khan Mobiles', phone: '98200 77665', city: 'Mumbai', pincode: '400050', referredOn: '01 Oct 2026', lastUpdate: '31 Oct 2026', stage: 1, category: 'ineligible', reason: 'GTV not achieved within 30 days' },
];
state = { ...state, referrals: SEED_REFERRALS };

export const LEADERBOARD = [
  { rank: 1, name: 'Vikram Stores', city: 'Pune', referrals: 24 },
  { rank: 2, name: 'Lakshmi Traders', city: 'Chennai', referrals: 19 },
  { rank: 3, name: 'Fresh Mart', city: 'Delhi', referrals: 17 },
  { rank: 4, name: 'City Opticals', city: 'Jaipur', referrals: 14 },
  { rank: 5, name: 'Om Medicals', city: 'Ahmedabad', referrals: 12 },
  { rank: 6, name: 'Green Basket', city: 'Bengaluru', referrals: 11 },
  { rank: 7, name: 'Style Hub', city: 'Kolkata', referrals: 9 },
];
export const MY_RANK = 42;

export function referralSummary(referrals: Referral[], claimed: number) {
  const count = (category: ReferralCategory) => referrals.filter((referral) => referral.category === category).length;
  const successful = count('successful');
  const inProgress = count('inProgress');
  const earned = successful * REWARD_PER_REFERRAL;
  return {
    total: referrals.length,
    successful,
    inProgress,
    ineligible: count('ineligible'),
    needsAction: referrals.filter((referral) => referral.needsAction).length,
    earned,
    // Already claimed rewards (stage 4) and this session's claim aren't available again.
    available: Math.max(0, referrals.filter((referral) => referral.category === 'successful' && referral.stage < 4).length * REWARD_PER_REFERRAL - claimed),
    pending: inProgress * REWARD_PER_REFERRAL,
  };
}

export function addReferral(input: { name: string; phone: string; business: string; pincode: string; city: string }) {
  const referral: Referral = {
    id: `REF-${2060 + state.referrals.length}`,
    ...input,
    phone: formatPhone(input.phone),
    referredOn: todayLabel(),
    lastUpdate: todayLabel(),
    stage: 0,
    category: 'inProgress',
  };
  set({ referrals: [referral, ...state.referrals] });
  return referral;
}
export function updateReferralPhone(id: string, phone: string) {
  set({ referrals: state.referrals.map((referral) => (referral.id === id ? { ...referral, phone: formatPhone(phone), needsAction: false, lastUpdate: todayLabel() } : referral)) });
}
export function claimRewards(amount: number) {
  set({ claimed: state.claimed + amount });
}

// ── Rewards: Prime, Marketplace ──────────────────────────────────────────

/**
 * Prime membership. The tier is the old app's (primeDetails { isPrime,
 * isStar }: PRIME, STAR for Mini merchants, or none). The rest — dates,
 * fee, benefits, steps, terms, FAQs, device prices — was on Pine Labs' web
 * page in the old app, so here it is PLACEHOLDER copy for the layout; swap
 * in the real Prime programme details.
 */
export const PRIME = {
  tier: 'PRIME' as 'PRIME' | 'STAR',
  plan: 'Annual plan',
  fee: 4999,
  memberSince: '14 Mar 2025',
  renewsOn: '14 Mar 2027',
  period: '14 Mar 2026 – 14 Mar 2027',
  benefits: [
    { icon: 'percent', title: 'Lower MDR on cards', line: '0.15% off on every domestic card payment', saved: 9840, badge: 'Active' },
    { icon: 'printer', title: 'Free paper rolls', line: 'Up to 20 rolls a month, delivered to your store', saved: 4200, badge: '12 of 20 used' },
    { icon: 'device-mobile', title: 'Device replacement', line: 'Faulty devices swapped within 48 hours', saved: 3000, badge: '1 of 2 used' },
    { icon: 'lightning', title: 'Priority settlements', line: 'Settled ahead of the regular queue', saved: 1380, badge: 'Active' },
    { icon: 'headphones', title: 'Priority support', line: 'A dedicated line, open 24×7', saved: 0, badge: '24×7' },
  ],
  steps: ['Pay the yearly fee, deducted from a settlement', 'Every benefit switches on the same day, on all your stores', 'Your savings add up here, month by month'],
  terms: [
    'Benefits apply to every store and device under this business.',
    'Unused paper rolls and replacements don’t carry over.',
    'Membership renews on its date unless it’s turned off 7 days before.',
  ],
  faqs: [
    { q: 'How is the membership fee charged?', a: 'It’s deducted from a settlement on the renewal date and shows in that settlement’s deductions.' },
    { q: 'Do new stores get Prime benefits?', a: 'Yes. Any store added to this business gets every benefit from the day it goes live.' },
    { q: 'What if a free paper roll order doesn’t arrive?', a: 'Raise a ticket from Support with the order ID.' },
  ],
  /** Marketplace products with a Prime price. */
  deals: [
    { productId: 'p-mini', price: 1999 },
    { productId: 'p-soundbox', price: 1199 },
    { productId: 'p-pos', price: 8499 },
    { productId: 'p-standee', price: 199 },
  ],
};

export type Product = {
  id: string;
  name: string;
  line: string;
  price: number;
  mrp?: number;
  /** Shown when there's no product photo yet. */
  icon: string;
  /** The product photo (the old app's marketing images); supplies don't have one yet. */
  image?: number;
  category: 'Supplies' | 'Accessories' | 'Devices';
};
export const PRODUCTS: Product[] = [
  { id: 'p-mini', name: 'Pine Labs Mini', line: 'Card tap, UPI QR and voice alerts in 10 languages', price: 2499, mrp: 3999, icon: 'speaker-high', image: require('../../assets/images/marketplace/mini.png'), category: 'Devices' },
  { id: 'p-soundbox', name: 'QR soundbox', line: 'Static UPI QR with instant payment alerts', price: 1499, mrp: 1999, icon: 'qr-code', image: require('../../assets/images/marketplace/qr-soundbox.png'), category: 'Devices' },
  { id: 'p-pos', name: 'Android POS terminal', line: 'Cards, UPI, EMI and printed receipts in one device', price: 9999, mrp: 14999, icon: 'cash-register', image: require('../../assets/images/marketplace/android-pos.png'), category: 'Devices' },
  { id: 'p-standee', name: 'QR standee', line: 'Counter stand for your store UPI QR', price: 299, icon: 'qr-code', image: require('../../assets/images/marketplace/qr-standee.png'), category: 'Accessories' },
  { id: 'p-rolls-10', name: 'Thermal paper rolls (10)', line: '57mm × 15m, fits every Pine Labs POS', price: 450, mrp: 600, icon: 'printer', category: 'Supplies' },
  { id: 'p-rolls-50', name: 'Thermal paper rolls (50)', line: 'Bulk pack, 57mm × 15m', price: 1999, mrp: 3000, icon: 'printer', category: 'Supplies' },
  { id: 'p-charger', name: 'POS charger', line: 'Original 5V / 2A adapter with cable', price: 799, icon: 'lightning', category: 'Accessories' },
  { id: 'p-battery', name: 'Spare battery', line: 'For A910 and A50 terminals', price: 1299, icon: 'battery-full', category: 'Accessories' },
];
