/**
 * Settlements dataset, ported verbatim from the web app
 * (components/settlements/v3-settlements-content.tsx): 6 seed batches expanded
 * to 120 batches, and 6 seed transactions expanded to the 96 rows every batch
 * detail lists, so mobile shows the same records as the web.
 */

export type SettlementChannel = 'in-store' | 'online'
export type SettlementStatus = 'Created' | 'Initiated' | 'Processing' | 'Settled' | 'Failed' | 'On Hold'
export type SettlementType = 'Normal' | 'SDS' | 'ODS'
export type BankName = 'HDFC' | 'AXIS' | 'ICICI' | 'SBI'
export type PaymentMethod = 'upi' | 'card' | 'netbanking'

export type SettlementRow = {
  id: string
  batchId: string
  utr: string
  grossAmount: number
  deductionsTotal: number
  mdrAmount: number
  gstAmount: number
  platformFees: number
  refundAmount: number
  recoveryAmount: number
  chargebackAmount: number
  netAmount: number
  transactionCount: number
  accountLabel: string
  bankName: BankName
  acquiringBank: BankName
  tid: string
  store: string
  channel: SettlementChannel
  settlementType: SettlementType
  paymentMethod: PaymentMethod
  settlementDatePrimary: string
  settlementDateSecondary: string
  initiationDatePrimary: string
  initiationDateSecondary: string
  status: SettlementStatus
  nextSettlementAt: string
  capturedRange: string
  settlementCycle: 'T+0' | 'T+1' | 'T+2'
  weekendSettlementEnabled: boolean
  odsEnabled: boolean
  odsCutoff: string
}

export type SettlementDetailTransaction = {
  id: string
  storeName: string
  storeAddress: string
  tid: string
  paymentMethodLabel: string
  paymentMethodSubLabel: string
  paymentMethod: PaymentMethod
  transactionAmount: number
  payoutAmount: number
  deductions: number
  mdrRate: string
  mdrAmount: number
  gstAmount: number
  totalDeduction: number
  merchantOrderId: string
  arn: string
  rrn: string
  issuer: string
  network: string
  acquirerId: string
  acquirerName: string
  payoutStatus: SettlementStatus
  paymentDate: string
  paymentTime: string
  product: string
  payoutType: 'EMI' | 'PX'
  transactionType: 'Sale' | 'Refund' | 'Chargeback' | 'Recovery' | 'Adjustment'
}

export const SETTLEMENT_STORES = [
  'PineLabs - Noida Kiosk',
  'PineLabs - Sector 35',
  'PineLabs - Sector 21',
  'PineLabs - Sector 27',
  'PineLabs - Sector 10',
  'PineLabs - Sector 15',
]
export const SETTLEMENT_TIDS = ['TID-10092', 'TID-10093', 'TID-10094', 'TID-10095', 'TID-10096', 'TID-10097']
export const SETTLEMENT_STATUSES: SettlementStatus[] = ['Settled', 'Processing', 'Initiated', 'Created', 'Failed', 'On Hold']
export const SETTLEMENT_TYPES: SettlementType[] = ['Normal', 'SDS', 'ODS']
export const SETTLEMENT_PAYMENT_METHODS: PaymentMethod[] = ['upi', 'card', 'netbanking']
export const SETTLEMENT_BANKS: BankName[] = ['HDFC', 'AXIS', 'ICICI', 'SBI']

const rows: SettlementRow[] = [
  { id: 'set-1', batchId: 'SLT-11101', utr: '6876347862381', grossAmount: 125000, deductionsTotal: 18450, mdrAmount: 7200, gstAmount: 1296, platformFees: 1200, refundAmount: 4200, recoveryAmount: 1854, chargebackAmount: 1700, netAmount: 106550, transactionCount: 128, accountLabel: 'xx8787', bankName: 'HDFC', acquiringBank: 'HDFC', tid: 'TID-10092', store: 'PineLabs - Noida Kiosk', channel: 'in-store', settlementType: 'SDS', paymentMethod: 'upi', settlementDatePrimary: '16 Aug 2026', settlementDateSecondary: '10:10 PM', initiationDatePrimary: '16 Aug 2026', initiationDateSecondary: '10:00 AM', status: 'Settled', nextSettlementAt: '6:00 PM Today', capturedRange: '15 Aug, 12:00 AM - 11:59 PM', settlementCycle: 'T+1', weekendSettlementEnabled: false, odsEnabled: false, odsCutoff: '8:00 PM' },
  { id: 'set-2', batchId: 'SLT-11102', utr: '6876347862382', grossAmount: 94000, deductionsTotal: 12840, mdrAmount: 5400, gstAmount: 972, platformFees: 850, refundAmount: 2600, recoveryAmount: 1018, chargebackAmount: 1000, netAmount: 81160, transactionCount: 96, accountLabel: 'xx4989', bankName: 'AXIS', acquiringBank: 'AXIS', tid: 'TID-10093', store: 'PineLabs - Sector 35', channel: 'in-store', settlementType: 'Normal', paymentMethod: 'card', settlementDatePrimary: '18 Aug 2026', settlementDateSecondary: '9:30 PM', initiationDatePrimary: '18 Aug 2026', initiationDateSecondary: '10:00 AM', status: 'Processing', nextSettlementAt: '7:30 PM Today', capturedRange: '17 Aug, 12:00 AM - 11:59 PM', settlementCycle: 'T+1', weekendSettlementEnabled: false, odsEnabled: false, odsCutoff: '8:00 PM' },
  { id: 'set-3', batchId: 'SLT-11103', utr: '6876347862383', grossAmount: 183000, deductionsTotal: 22120, mdrAmount: 9600, gstAmount: 1728, platformFees: 1300, refundAmount: 5100, recoveryAmount: 1992, chargebackAmount: 1400, netAmount: 160880, transactionCount: 174, accountLabel: 'xx8787', bankName: 'HDFC', acquiringBank: 'ICICI', tid: 'TID-10094', store: 'PineLabs - Sector 21', channel: 'in-store', settlementType: 'ODS', paymentMethod: 'netbanking', settlementDatePrimary: '20 Aug 2026', settlementDateSecondary: '3:00 PM', initiationDatePrimary: '20 Aug 2026', initiationDateSecondary: '10:00 AM', status: 'Settled', nextSettlementAt: 'On demand', capturedRange: '19 Aug, 12:00 AM - 11:59 PM', settlementCycle: 'T+0', weekendSettlementEnabled: true, odsEnabled: true, odsCutoff: '8:00 PM' },
  { id: 'set-4', batchId: 'SLT-11104', utr: '6876347862384', grossAmount: 72000, deductionsTotal: 9860, mdrAmount: 3400, gstAmount: 612, platformFees: 700, refundAmount: 2500, recoveryAmount: 1048, chargebackAmount: 1600, netAmount: 62140, transactionCount: 84, accountLabel: 'xx7721', bankName: 'SBI', acquiringBank: 'SBI', tid: 'TID-10095', store: 'PineLabs - Sector 27', channel: 'online', settlementType: 'Normal', paymentMethod: 'upi', settlementDatePrimary: '21 Aug 2026', settlementDateSecondary: '1:00 PM', initiationDatePrimary: '21 Aug 2026', initiationDateSecondary: '10:00 AM', status: 'Settled', nextSettlementAt: '12:00 PM Tomorrow', capturedRange: '20 Aug, 12:00 AM - 11:59 PM', settlementCycle: 'T+1', weekendSettlementEnabled: false, odsEnabled: false, odsCutoff: '8:00 PM' },
  { id: 'set-5', batchId: 'SLT-11105', utr: '6876347862385', grossAmount: 214000, deductionsTotal: 30920, mdrAmount: 11800, gstAmount: 2124, platformFees: 1750, refundAmount: 9800, recoveryAmount: 1746, chargebackAmount: 2700, netAmount: 183080, transactionCount: 201, accountLabel: 'xx4989', bankName: 'AXIS', acquiringBank: 'HDFC', tid: 'TID-10096', store: 'PineLabs - Sector 10', channel: 'online', settlementType: 'SDS', paymentMethod: 'card', settlementDatePrimary: '19 Aug 2026', settlementDateSecondary: '2:45 PM', initiationDatePrimary: '19 Aug 2026', initiationDateSecondary: '10:00 AM', status: 'Settled', nextSettlementAt: '12:00 PM Tomorrow', capturedRange: '18 Aug, 12:00 AM - 11:59 PM', settlementCycle: 'T+1', weekendSettlementEnabled: true, odsEnabled: false, odsCutoff: '8:00 PM' },
  { id: 'set-6', batchId: 'SLT-11106', utr: '6876347862386', grossAmount: 156000, deductionsTotal: 17680, mdrAmount: 7600, gstAmount: 1368, platformFees: 1250, refundAmount: 3400, recoveryAmount: 962, chargebackAmount: 1500, netAmount: 138320, transactionCount: 142, accountLabel: 'xx8787', bankName: 'HDFC', acquiringBank: 'AXIS', tid: 'TID-10097', store: 'PineLabs - Sector 15', channel: 'online', settlementType: 'ODS', paymentMethod: 'netbanking', settlementDatePrimary: '22 Aug 2026', settlementDateSecondary: '4:30 PM', initiationDatePrimary: '22 Aug 2026', initiationDateSecondary: '10:00 AM', status: 'Settled', nextSettlementAt: 'On demand till 8:00 PM', capturedRange: '22 Aug, 12:00 AM - 12:00 PM', settlementCycle: 'T+0', weekendSettlementEnabled: true, odsEnabled: true, odsCutoff: '8:00 PM' },
]

const settlementDetailTransactions: SettlementDetailTransaction[] = [
  { id: '1525039333', storeName: 'PineLabs - Noida Kiosk', storeAddress: 'Candor TechSpace, Noida', tid: 'TID-10092', paymentMethodLabel: 'UPI', paymentMethodSubLabel: 'HDFC', paymentMethod: 'upi', transactionAmount: 12500, payoutAmount: 12150, deductions: 350, mdrRate: '0.90%', mdrAmount: 260, gstAmount: 47, totalDeduction: 350, merchantOrderId: 'ORD-759201', arn: 'ARN759201001', rrn: 'RRN9821001', issuer: 'HDFC Bank', network: 'UPI', acquirerId: 'ACQ-HDFC-01', acquirerName: 'HDFC', payoutStatus: 'Settled', paymentDate: '16 Aug 2026', paymentTime: '10:10 PM', product: 'POS', payoutType: 'EMI', transactionType: 'Sale' },
  { id: '1525039336', storeName: 'PineLabs - Sector 35', storeAddress: 'Sector 35, Noida', tid: 'TID-10093', paymentMethodLabel: 'Card', paymentMethodSubLabel: 'VISA', paymentMethod: 'card', transactionAmount: 22500, payoutAmount: 21750, deductions: 750, mdrRate: '1.80%', mdrAmount: 560, gstAmount: 101, totalDeduction: 750, merchantOrderId: 'ORD-759202', arn: 'ARN759202001', rrn: 'RRN9821002', issuer: 'ICICI Bank', network: 'VISA', acquirerId: 'ACQ-AXIS-01', acquirerName: 'Axis', payoutStatus: 'Settled', paymentDate: '18 Aug 2026', paymentTime: '9:30 PM', product: 'POS', payoutType: 'EMI', transactionType: 'Sale' },
  { id: '1525039339', storeName: 'PineLabs - Sector 21', storeAddress: 'Sector 21, Noida', tid: 'TID-10094', paymentMethodLabel: 'Card', paymentMethodSubLabel: 'Mastercard', paymentMethod: 'card', transactionAmount: 20000, payoutAmount: 19200, deductions: 800, mdrRate: '1.75%', mdrAmount: 585, gstAmount: 105, totalDeduction: 800, merchantOrderId: 'ORD-759203', arn: 'ARN759203001', rrn: 'RRN9821003', issuer: 'SBI', network: 'Mastercard', acquirerId: 'ACQ-ICICI-01', acquirerName: 'ICICI', payoutStatus: 'Settled', paymentDate: '20 Aug 2026', paymentTime: '3:00 PM', product: 'POS', payoutType: 'EMI', transactionType: 'Sale' },
  { id: '1525039335', storeName: 'PineLabs - Sector 27', storeAddress: 'Sector 27, Noida', tid: 'TID-10095', paymentMethodLabel: 'Card', paymentMethodSubLabel: 'Rupay', paymentMethod: 'card', transactionAmount: 40000, payoutAmount: 38600, deductions: 1400, mdrRate: '1.60%', mdrAmount: 980, gstAmount: 176, totalDeduction: 1400, merchantOrderId: 'ORD-759204', arn: 'ARN759204001', rrn: 'RRN9821004', issuer: 'Axis Bank', network: 'RuPay', acquirerId: 'ACQ-SBI-01', acquirerName: 'SBI', payoutStatus: 'Settled', paymentDate: '21 Aug 2026', paymentTime: '1:00 PM', product: 'POS', payoutType: 'EMI', transactionType: 'Sale' },
  { id: '1525039337', storeName: 'PineLabs - Sector 10', storeAddress: 'Sector 10, Noida', tid: 'TID-10096', paymentMethodLabel: 'Net banking', paymentMethodSubLabel: 'HDFC', paymentMethod: 'netbanking', transactionAmount: 30000, payoutAmount: 28950, deductions: 1050, mdrRate: '1.25%', mdrAmount: 780, gstAmount: 140, totalDeduction: 1050, merchantOrderId: 'ORD-759205', arn: 'ARN759205001', rrn: 'RRN9821005', issuer: 'HDFC Bank', network: 'Net banking', acquirerId: 'ACQ-HDFC-02', acquirerName: 'HDFC', payoutStatus: 'Settled', paymentDate: '19 Aug 2026', paymentTime: '2:45 PM', product: 'POS', payoutType: 'PX', transactionType: 'Recovery' as SettlementDetailTransaction['transactionType'] },
  { id: '1525039338', storeName: 'PineLabs - Sector 15', storeAddress: 'Sector 15, Noida', tid: 'TID-10097', paymentMethodLabel: 'Net banking', paymentMethodSubLabel: 'Axis', paymentMethod: 'netbanking', transactionAmount: 17500, payoutAmount: 16850, deductions: 650, mdrRate: '1.20%', mdrAmount: 420, gstAmount: 76, totalDeduction: 650, merchantOrderId: 'ORD-759206', arn: 'ARN759206001', rrn: 'RRN9821006', issuer: 'Axis Bank', network: 'Net banking', acquirerId: 'ACQ-AXIS-02', acquirerName: 'Axis', payoutStatus: 'Settled', paymentDate: '22 Aug 2026', paymentTime: '4:30 PM', product: 'POS', payoutType: 'EMI', transactionType: 'Refund' },
]

export const settlementRows: SettlementRow[] = Array.from({ length: 120 }, (_, index) => {
  const source = rows[index % rows.length]!
  const cycle = Math.floor(index / rows.length)
  const grossAmount = source.grossAmount + cycle * 4200 + index * 130
  const deductionsTotal = source.deductionsTotal + cycle * 360 + (index % 5) * 90
  const channel: SettlementChannel = index % 2 === 0 ? 'in-store' : 'online'
  const mdrAmount = Math.round(deductionsTotal * 0.38)
  const gstAmount = Math.round(mdrAmount * 0.18)
  const platformFees = Math.round(deductionsTotal * 0.08)
  const refundAmount = Math.round(deductionsTotal * 0.24)
  const recoveryAmount = Math.round(deductionsTotal * 0.1)
  const chargebackAmount = Math.max(deductionsTotal - mdrAmount - gstAmount - platformFees - refundAmount - recoveryAmount, 0)
  return {
    ...source,
    id: `set-${index + 1}`,
    batchId: `SLT-${11101 + index}`,
    utr: String(Number(source.utr) + cycle * 17 + index),
    grossAmount,
    deductionsTotal,
    mdrAmount,
    gstAmount,
    platformFees,
    refundAmount,
    recoveryAmount,
    chargebackAmount,
    netAmount: grossAmount - deductionsTotal,
    transactionCount: source.transactionCount + cycle * 3 + (index % 7),
    status: channel === 'online' ? 'Settled' : SETTLEMENT_STATUSES[index % SETTLEMENT_STATUSES.length]!,
    settlementType: SETTLEMENT_TYPES[index % SETTLEMENT_TYPES.length]!,
    paymentMethod: SETTLEMENT_PAYMENT_METHODS[index % SETTLEMENT_PAYMENT_METHODS.length]!,
    acquiringBank: SETTLEMENT_BANKS[index % SETTLEMENT_BANKS.length]!,
    bankName: SETTLEMENT_BANKS[(index + 1) % SETTLEMENT_BANKS.length]!,
    store: SETTLEMENT_STORES[index % SETTLEMENT_STORES.length]!,
    tid: SETTLEMENT_TIDS[index % SETTLEMENT_TIDS.length]!,
    channel,
    settlementCycle: channel === 'online' ? (index % 6 === 5 ? 'T+0' : index % 4 === 1 ? 'T+2' : 'T+1') : source.settlementCycle,
    weekendSettlementEnabled: channel === 'online' ? index % 4 === 1 : source.weekendSettlementEnabled,
    odsEnabled: channel === 'online' ? index % 6 === 5 : source.odsEnabled,
  }
})

export const settlementDetailRows: SettlementDetailTransaction[] = Array.from({ length: 96 }, (_, index) => {
  const source = settlementDetailTransactions[index % settlementDetailTransactions.length]!
  const cycle = Math.floor(index / settlementDetailTransactions.length)
  const transactionAmount = source.transactionAmount + cycle * 350 + (index % 4) * 125
  const deductions = source.deductions + cycle * 25
  return {
    ...source,
    id: String(Number(source.id) + cycle * 10),
    transactionAmount,
    deductions,
    totalDeduction: deductions,
    mdrAmount: Math.round(deductions * 0.58),
    gstAmount: Math.round(deductions * 0.1),
    payoutAmount: transactionAmount - deductions,
    merchantOrderId: `ORD-${759201 + index}`,
    arn: `ARN${759201 + index}001`,
    rrn: `RRN${9821001 + index}`,
    transactionType: ['Sale', 'Refund', 'Chargeback', 'Recovery', 'Adjustment'][index % 5] as SettlementDetailTransaction['transactionType'],
  }
})

export const SETTLEMENT_ACCOUNTS: { bank: string; bankName: string; accountNumber: string }[] = [
  { bank: 'ICICI', bankName: 'ICICI bank', accountNumber: 'xx9898' },
  { bank: 'ICICI', bankName: 'ICICI bank', accountNumber: 'xx9898' },
  { bank: 'ICICI', bankName: 'ICICI bank', accountNumber: 'xx9898' },
  { bank: 'ICICI', bankName: 'ICICI bank', accountNumber: 'xx9898' },
  { bank: 'ICICI', bankName: 'ICICI bank', accountNumber: 'xx9898' },
  { bank: 'ICICI', bankName: 'ICICI bank', accountNumber: 'xx9898' },
]

export function findSettlement(batchId: string) {
  return settlementRows.find((row) => row.batchId === batchId) ?? settlementRows[0]!;
}

export function paymentMethodLabel(method: PaymentMethod) {
  if (method === 'upi') return 'UPI';
  if (method === 'card') return 'Card';
  return 'Net banking';
}

export function channelLabel(channel: SettlementChannel) {
  return channel === 'in-store' ? 'In-store' : 'Online';
}

/** Web: the summary useMemo over one channel's batches. */
export function getSettlementSummary(channel: SettlementChannel) {
  const channelRows = settlementRows.filter((row) => row.channel === channel);
  const settledRows = channelRows.filter((row) => row.status === 'Settled');
  const openRows = channelRows.filter((row) => row.status !== 'Settled');
  const sum = (list: SettlementRow[], pick: (row: SettlementRow) => number) => list.reduce((total, row) => total + pick(row), 0);
  const settledAmount = sum(settledRows, (row) => row.netAmount);
  const settledCount = sum(settledRows, (row) => row.transactionCount);
  const totalCount = sum(channelRows, (row) => row.transactionCount);
  return {
    settledAmount,
    unsettledAmount: sum(openRows, (row) => row.netAmount),
    deductionsAmount: sum(settledRows, (row) => row.deductionsTotal),
    grossAmount: sum(settledRows, (row) => row.grossAmount),
    refundsAmount: sum(settledRows, (row) => row.refundAmount),
    mdrAmount: sum(settledRows, (row) => row.mdrAmount),
    gstAmount: sum(settledRows, (row) => row.gstAmount),
    othersAmount: sum(settledRows, (row) => row.platformFees + row.recoveryAmount + row.chargebackAmount),
    settledCount,
    batchCount: settledRows.length,
    failedCount: channelRows.filter((row) => row.status === 'Failed').length,
    onHoldCount: sum(channelRows.filter((row) => row.status === 'On Hold'), (row) => row.transactionCount),
    remainingCount: Math.max(totalCount - settledCount, 0),
    nextSettlementAt: openRows[0]?.nextSettlementAt ?? '6:00 PM Today',
  };
}
