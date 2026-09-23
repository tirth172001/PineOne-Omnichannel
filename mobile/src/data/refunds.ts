/**
 * Refunds dataset, ported verbatim from the web app
 * (components/refunds/refunds-content.tsx), including its fixed summary cards.
 */

export type RefundStatus = 'Pending' | 'Success' | 'Failed' | 'Session expired' | 'Cancelled' | 'User cancelled'

export type RefundRow = {
  id: string
  transactionId: string
  refundId: string
  datePrimary: string
  dateSecondary: string
  storeName: string
  storeAddress: string
  amount: string
  amountSub: string
  status: RefundStatus
}

export const refundRows: RefundRow[] = [
  { id: 'r1', transactionId: '1525039333', refundId: '1525039333', datePrimary: '16 Aug 2026', dateSecondary: '10:10 PM', storeName: 'PineLabs - Noida Kiosk', storeAddress: 'PineLabs, Candor TechSpace, Noida, 584800', amount: '₹ 10,000', amountSub: 'EMI', status: 'Pending' },
  { id: 'r2', transactionId: '1525039336', refundId: '1525039336', datePrimary: '18 Aug 2026', dateSecondary: '9:30 PM', storeName: 'PineLabs - Sector 35', storeAddress: 'PineLabs, Candor TechSpace, Noida, 584800', amount: '₹ 30,000', amountSub: 'EMI', status: 'Success' },
  { id: 'r3', transactionId: '1525039339', refundId: '1525039339', datePrimary: '20 Aug 2026', dateSecondary: '3:00 PM', storeName: 'PineLabs - Sector 21', storeAddress: 'PineLabs, Candor TechSpace, Noida, 584800', amount: '₹ 15,000', amountSub: 'EMI', status: 'Failed' },
  { id: 'r4', transactionId: '1525039335', refundId: '1525039335', datePrimary: '21 Aug 2026', dateSecondary: '1:00 PM', storeName: 'PineLabs - Sector 27', storeAddress: 'PineLabs, Candor TechSpace, Noida, 584800', amount: '₹ 20,000', amountSub: 'EMI', status: 'Session expired' },
  { id: 'r5', transactionId: '1525039337', refundId: '1525039337', datePrimary: '19 Aug 2026', dateSecondary: '2:45 PM', storeName: 'PineLabs - Sector 10', storeAddress: 'PineLabs, Candor TechSpace, Noida, 584800', amount: '₹ 18,000', amountSub: 'PX', status: 'Cancelled' },
  { id: 'r6', transactionId: '1525039338', refundId: '1525039338', datePrimary: '22 Aug 2026', dateSecondary: '4:30 PM', storeName: 'PineLabs - Sector 15', storeAddress: 'PineLabs, Candor TechSpace, Noida, 584800', amount: '₹ 40,000', amountSub: 'EMI', status: 'User cancelled' },
  { id: 'r7', transactionId: '1525039334', refundId: '1525039334', datePrimary: '17 Aug 2026', dateSecondary: '11:15 AM', storeName: 'PineLabs - Sector 12', storeAddress: 'PineLabs, Candor TechSpace, Noida, 584800', amount: '₹ 25,000', amountSub: 'EMI', status: 'Success' },
  { id: 'r8', transactionId: '1525039340', refundId: '1525039340', datePrimary: '25 Aug 2026', dateSecondary: '8:00 AM', storeName: 'PineLabs - Sector 32', storeAddress: 'PineLabs, Candor TechSpace, Noida, 584800', amount: '₹ 12,000', amountSub: 'EMI', status: 'Success' },
  { id: 'r9', transactionId: '1525039333', refundId: '1525039333', datePrimary: '24 Aug 2026', dateSecondary: '6:00 PM', storeName: 'PineLabs - Sector 22', storeAddress: 'PineLabs, Candor TechSpace, Noida, 584800', amount: '₹ 35,000', amountSub: 'EMI', status: 'Success' },
  { id: 'r10', transactionId: '1525039341', refundId: '1525039341', datePrimary: '23 Aug 2026', dateSecondary: '5:15 PM', storeName: 'PineLabs - Sector 11', storeAddress: 'PineLabs, Candor TechSpace, Noida, 584800', amount: '₹ 50,000', amountSub: 'EMI', status: 'Success' },
]

export const REFUND_STATUSES: RefundStatus[] = ['Pending', 'Success', 'Failed', 'Session expired', 'Cancelled', 'User cancelled']

/** Web: the two SummaryCardGroup cards (fixed values on web). */
export const REFUND_SUMMARY = [
  { icon: 'spinner', label: 'Refunds pending', value: 1000000, subtext: '1000 payments' },
  { icon: 'checks', label: 'Refunded amount', value: 600000, subtext: '94 payments resolved' },
];

/** Web: the More filters categories. */
export const REFUND_AMOUNT_TYPES = [
  { id: 'EMI', label: 'EMI' },
  { id: 'PX', label: 'PX' },
];

export function refundStatusTone(status: RefundStatus) {
  if (status === 'Success') return 'success' as const;
  if (status === 'Pending') return 'warning' as const;
  return 'danger' as const;
}
