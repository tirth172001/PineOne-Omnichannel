/**
 * Payment links mock data, ported verbatim from the web
 * (components/payment-links/payment-links-listing-content.tsx).
 */
import type { StatusTone } from './common';

export type PaymentLinkStatus = 'Created' | 'Expired' | 'Fully paid' | 'Cancelled';

export type PaymentLinkRow = {
  id: string;
  createdDate: string;
  createdTime: string;
  paymentLink: string;
  invoiceNumber: string;
  amount: string;
  description: string;
  expiryDate: string;
  expiryTime: string;
  customerEmail: string;
  customerMobile: string;
  status: PaymentLinkStatus;
};

export const PAYMENT_LINK_STATUSES: PaymentLinkStatus[] = ['Created', 'Expired', 'Fully paid', 'Cancelled'];

export function paymentLinkTone(status: PaymentLinkStatus): StatusTone {
  if (status === 'Fully paid') return 'success';
  if (status === 'Created') return 'initiated';
  if (status === 'Expired') return 'processing';
  return 'failed';
}

export type PaymentLinkSearchField = 'paymentId' | 'originalAmount' | 'invoiceNumber' | 'customerPhone' | 'customerEmail';

export const PAYMENT_LINK_SEARCH_FIELDS: { id: PaymentLinkSearchField; label: string }[] = [
  { id: 'paymentId', label: 'Payment ID' },
  { id: 'originalAmount', label: 'Original amount' },
  { id: 'invoiceNumber', label: 'Invoice number' },
  { id: 'customerPhone', label: 'Customer phone' },
  { id: 'customerEmail', label: 'Customer email' },
];

export function matchesSearchField(row: PaymentLinkRow, field: PaymentLinkSearchField, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  switch (field) {
    case 'paymentId':
      return row.paymentLink.toLowerCase().includes(q);
    case 'originalAmount':
      return row.amount.toLowerCase().includes(q);
    case 'invoiceNumber':
      return row.invoiceNumber.toLowerCase().includes(q);
    case 'customerPhone':
      return row.customerMobile.toLowerCase().includes(q);
    case 'customerEmail':
      return row.customerEmail.toLowerCase().includes(q);
  }
}

export function generatePaymentLinkId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function formatCreatedNow() {
  const now = new Date();
  return {
    date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
  };
}

export const PAYMENT_LINK_ROWS: PaymentLinkRow[] = [
  {
    id: 'plink-1',
    createdDate: '12 Aug 2026',
    createdTime: '10:10 PM',
    paymentLink: 'PL9K3M2Q',
    invoiceNumber: 'INV-5161',
    amount: '₹ 20,000',
    description: 'Consultation fee',
    expiryDate: '19 Aug 2026',
    expiryTime: '10:10 PM',
    customerEmail: 'rahul.sharma@pinelabs-demo.in',
    customerMobile: '+91 98765 43210',
    status: 'Fully paid',
  },
  {
    id: 'plink-2',
    createdDate: '13 Aug 2026',
    createdTime: '9:30 PM',
    paymentLink: 'PL7H1L9R',
    invoiceNumber: 'INV-5162',
    amount: '₹ 10,000',
    description: 'Advance booking amount',
    expiryDate: '20 Aug 2026',
    expiryTime: '9:30 PM',
    customerEmail: 'priya.menon@gmail.com',
    customerMobile: '+91 91234 56780',
    status: 'Created',
  },
  {
    id: 'plink-3',
    createdDate: '14 Aug 2026',
    createdTime: '3:00 PM',
    paymentLink: 'PL4D8N6T',
    invoiceNumber: 'INV-5163',
    amount: '₹ 25,000',
    description: 'Annual maintenance contract',
    expiryDate: '16 Aug 2026',
    expiryTime: '3:00 PM',
    customerEmail: 'arjun.verma@outlook.com',
    customerMobile: '+91 99887 65432',
    status: 'Expired',
  },
  {
    id: 'plink-4',
    createdDate: '15 Aug 2026',
    createdTime: '1:00 PM',
    paymentLink: 'PL2X5V8W',
    invoiceNumber: 'INV-5164',
    amount: '₹ 30,000',
    description: 'Product return refund',
    expiryDate: '22 Aug 2026',
    expiryTime: '1:00 PM',
    customerEmail: 'sneha.iyer@yahoo.com',
    customerMobile: '+91 90123 45678',
    status: 'Cancelled',
  },
  {
    id: 'plink-5',
    createdDate: '16 Aug 2026',
    createdTime: '2:45 PM',
    paymentLink: 'PL6B3Y1Z',
    invoiceNumber: 'INV-5165',
    amount: '₹ 35,000',
    description: 'Event registration fee',
    expiryDate: '23 Aug 2026',
    expiryTime: '2:45 PM',
    customerEmail: 'vikram.rao@gmail.com',
    customerMobile: '+91 98765 12340',
    status: 'Fully paid',
  },
  {
    id: 'plink-6',
    createdDate: '17 Aug 2026',
    createdTime: '4:30 PM',
    paymentLink: 'PL1C9F4G',
    invoiceNumber: '-',
    amount: '₹ 5,000',
    description: '-',
    expiryDate: '24 Aug 2026',
    expiryTime: '4:30 PM',
    customerEmail: 'neha.kapoor@pinelabs-demo.in',
    customerMobile: '+91 93456 78901',
    status: 'Created',
  },
  {
    id: 'plink-7',
    createdDate: '18 Aug 2026',
    createdTime: '11:15 AM',
    paymentLink: 'PL8J2K5H',
    invoiceNumber: 'INV-5167',
    amount: '₹ 45,000',
    description: 'Franchise onboarding fee',
    expiryDate: '20 Aug 2026',
    expiryTime: '11:15 AM',
    customerEmail: 'amitkumar@rediffmail.com',
    customerMobile: '+91 97654 32109',
    status: 'Expired',
  },
  {
    id: 'plink-8',
    createdDate: '19 Aug 2026',
    createdTime: '8:00 AM',
    paymentLink: 'PL3P7Q9S',
    invoiceNumber: 'INV-5168',
    amount: '₹ 50,000',
    description: 'Wholesale order advance',
    expiryDate: '26 Aug 2026',
    expiryTime: '8:00 AM',
    customerEmail: 'divya.nair@gmail.com',
    customerMobile: '+91 96543 21098',
    status: 'Fully paid',
  },
];

export const PAYMENT_LINK_DESCRIPTION_MAX = 110;
