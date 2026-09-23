/**
 * Content of the transaction detail screen, ported from the web's
 * components/transactions/transaction-detail-content.tsx and
 * components/shared/activity-timeline-sidepanel.tsx. The web hard-codes most
 * of these values (the same demo merchant, customer and EMI details for every
 * transaction), so they're reproduced as-is.
 */

import { formatInr } from './common';
import type { TransactionRecord } from './transactions';

export type DetailChannel = 'in-store' | 'online';
export type ActivityTone = 'success' | 'failed' | 'processing' | 'initiated';

export type ActivityEvent = {
  id: string;
  title: string;
  timestamp: string;
  tone: ActivityTone;
  badge?: string;
  details: { label: string; value: string }[];
};

export type DetailField = { label: string; value: string; copyable?: boolean };
export type DetailSectionData = { title: string; fields: DetailField[] };

/** Web: formatInr in the detail screen ("₹20,000", no decimals). */
function amount(value: number) {
  return formatInr(value).replace(/\.00$/, '');
}

/** Web: the activityEvents useMemo, per channel and outcome. */
export function getActivityEvents(tx: TransactionRecord, channel: DetailChannel): ActivityEvent[] {
  const at = channel === 'online' ? '27 Aug 2026, 10:00 AM' : `${tx.date}, ${tx.time}`;
  const settlementCompleted: ActivityEvent = {
    id: 'settlement-completed',
    title: 'Settlement completed',
    timestamp: at,
    tone: 'success',
    details: [
      { label: 'Transaction ID', value: tx.transactionId },
      { label: 'Order ID', value: tx.orderId },
      { label: 'Settlement amount', value: amount(tx.amount) },
      { label: 'Status', value: 'Completed' },
      { label: 'Reference', value: 'UTR-8273668191' },
    ],
  };
  const paymentRefund: ActivityEvent = {
    id: 'payment-refund',
    title: 'Payment refund',
    timestamp: at,
    tone: 'processing',
    details: [
      { label: 'Refund ID', value: 'RFD-117903' },
      { label: 'Transaction ID', value: tx.transactionId },
      { label: 'Refund amount', value: '₹5,000' },
      { label: 'Initiated by', value: 'Ops dashboard' },
      { label: 'Current status', value: 'Processing' },
    ],
  };
  const paymentCaptured: ActivityEvent = {
    id: 'payment-captured',
    title: 'Payment captured',
    timestamp: at,
    tone: 'success',
    badge: 'UPI intent',
    details: [
      { label: 'Payment mode', value: tx.provider },
      { label: 'Payment app', value: tx.paymentLabel },
      { label: 'Captured amount', value: amount(tx.amount) },
      { label: 'Gateway response', value: 'Approved' },
      { label: 'RRN', value: tx.rrn },
    ],
  };
  const paymentInitiated: ActivityEvent = {
    id: 'payment-initiated',
    title: 'Payment initiated',
    timestamp: at,
    tone: 'initiated',
    details: [
      { label: 'Order ID', value: tx.orderId },
      { label: 'Initiated amount', value: amount(tx.amount) },
      { label: 'Mode', value: tx.provider },
      { label: 'Source', value: 'Merchant checkout' },
      { label: 'State', value: 'Initiated' },
    ],
  };

  if (channel === 'online') {
    return [
      settlementCompleted,
      paymentRefund,
      paymentCaptured,
      {
        id: 'payment-failed-upi',
        title: 'Payment failed',
        timestamp: at,
        tone: 'failed',
        badge: 'UPI intent',
        details: [
          { label: 'Failure stage', value: 'Debit timeout' },
          { label: 'Reason', value: 'Issuer bank timeout' },
          { label: 'Error code', value: 'U17' },
          { label: 'Retry advised', value: 'Yes' },
          { label: 'Merchant impact', value: 'No debit captured' },
        ],
      },
      {
        id: 'payment-failed-card',
        title: 'Payment failed',
        timestamp: at,
        tone: 'failed',
        badge: 'xx5656 - Mastercard',
        details: [
          { label: 'Card type', value: 'Mastercard' },
          { label: 'Last 4 digits', value: '5656' },
          { label: 'Failure reason', value: 'Insufficient funds' },
          { label: 'Error source', value: 'Issuer bank' },
          { label: 'Auth status', value: 'Declined' },
        ],
      },
      paymentInitiated,
    ];
  }

  if (tx.status.tone === 'failed') {
    return [
      {
        id: 'payment-failed',
        title: 'Payment failed',
        timestamp: at,
        tone: 'failed',
        badge: 'UPI intent',
        details: [
          { label: 'Failure stage', value: 'Debit timeout' },
          { label: 'Reason', value: 'Issuer bank timeout' },
          { label: 'Error code', value: 'U17' },
          { label: 'Retry advised', value: 'Yes' },
          { label: 'Transaction ID', value: tx.transactionId },
        ],
      },
      paymentInitiated,
    ];
  }

  return [settlementCompleted, paymentRefund, paymentCaptured, paymentInitiated];
}

/** Web: the in-store (default) detail sections. */
export function getInStoreSections(tx: TransactionRecord): DetailSectionData[] {
  return [
    {
      title: 'Transaction details',
      fields: [
        { label: 'Transaction ID', value: tx.transactionId, copyable: true },
        { label: 'Product', value: 'POS' },
        { label: 'Hardware model', value: 'Paper POS' },
        { label: 'TID', value: '97893918238' },
        { label: 'Transaction type', value: 'Sale' },
        { label: 'Acquirer', value: 'ICICI UPI' },
        { label: 'POS ID', value: '497547594579' },
        { label: 'Branch no', value: 'NA' },
      ],
    },
    {
      title: 'Merchant details',
      fields: [
        { label: 'Merchant name', value: 'PineLabs Private limited' },
        { label: 'Merchant city', value: 'Noida' },
        { label: 'Merchant store', value: 'PineLabs - Noida branch' },
        { label: 'Store city', value: 'Noida' },
        { label: 'MID', value: tx.merchantId, copyable: true },
        { label: 'Merchant VPA', value: '6352699747@ptyes' },
        { label: 'Host category', value: '1' },
        { label: 'Acquirer ID', value: '4' },
        { label: 'Amt in ₹', value: amount(tx.amount) },
        { label: 'Batch ID', value: '1' },
        { label: 'RRN', value: tx.rrn },
      ],
    },
    {
      title: 'Customer details',
      fields: [
        { label: 'Customer name', value: 'Tirth Nehalkumar Trivedi' },
        { label: 'Payment mode ID', value: '6352699747@ptyes' },
      ],
    },
  ];
}

/** Web: the online detail sections (the Product details list follows them). */
export const ONLINE_SECTIONS: DetailSectionData[] = [
  {
    title: 'Customer details',
    fields: [
      { label: 'Email', value: 'tirth@setu.co' },
      { label: 'Mobile', value: 'xx9747' },
      { label: 'VPA', value: 'trvd17@ptyes' },
    ],
  },
  {
    title: 'EMI details',
    fields: [
      { label: 'Loan', value: '₹3,00,000 @ 16% (Low cost)' },
      { label: 'EMI', value: '₹30,000 × 3 months' },
      { label: 'EMI program', value: 'Brand EMI' },
    ],
  },
];

/** Web: three identical "Product: GU9838238" rows, each opening the same product panel. */
export const ONLINE_PRODUCTS = ['GU9838238', 'GU9838238', 'GU9838238'];

/** Web: the Product details side panel. */
export const PRODUCT_DETAIL_FIELDS: (DetailField & { icon?: string; info?: boolean })[] = [
  { label: 'Product code', value: 'PRD-11101' },
  { label: 'Product IMEI', value: 'IMEI110110001936783' },
  { label: 'Subvention', value: '4.5% (₹3,000)', info: true },
  { label: 'Subvention type', value: 'Instant', icon: 'lightning' },
  { label: 'Discount', value: '4.5% (₹3,000)' },
  { label: 'Additional cashback', value: 'NA' },
];

/**
 * Web: ActivityTimelineSidepanel. The web shows this same fixed demo content
 * for whichever activity event is opened, so it's reproduced as-is.
 */
export const ACTIVITY_PANEL = {
  amount: '₹20,00,000',
  statusLabel: 'Failure',
  meta: ['HDFC credit card', 'xx8787', 'VISA network'],
  fields: [
    { label: 'Transaction ID', value: 'txn-11734237493019', copyable: true },
    { label: 'Original transaction amount', value: '₹20,00,000' },
    { label: 'Card category', value: 'Super premium' },
    { label: 'Customer VPA', value: 'srv*****kaoksbi' },
    { label: 'Payer name', value: 'Ms P********AVA' },
    { label: 'Response message', value: 'NA' },
    { label: 'Payment link', value: '/my-pay-101023', copyable: true },
    { label: 'Payment link description', value: 'testing' },
    { label: 'Invoice number', value: 'NA' },
    { label: 'EMI type', value: 'No cost' },
    { label: 'EMI Program', value: 'Bank EMI' },
    { label: 'EMI type', value: 'No cost' },
  ] satisfies DetailField[],
  errorFields: [
    { label: 'Error reason', value: 'CONVENIENCE_FEE_NOT_CONFIGURED' },
    { label: 'Error code', value: 'OPERATION_NOT_ALLOWED' },
    { label: 'Error message', value: 'Convenience fee not configured for merchant' },
    { label: 'Error step', value: 'Payment initiation' },
    { label: 'Error source', value: 'Configurations' },
    { label: 'HTTP status code', value: '422' },
  ] satisfies DetailField[],
  customFields: [
    { label: 'Field 1', value: 'Testing' },
    { label: 'Field 2', value: 'Testing' },
    { label: 'Field 3', value: 'Testing' },
    { label: 'Field 4', value: 'Testing' },
  ] satisfies DetailField[],
};

/** Web: /charge-slips/*.pdf, copied into assets. */
export const CHARGE_SLIPS = {
  customer: require('../../assets/charge-slips/customer-slip.pdf'),
  merchant: require('../../assets/charge-slips/merchant-slip.pdf'),
};
