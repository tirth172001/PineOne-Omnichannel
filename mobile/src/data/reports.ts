/**
 * Reports mock data, ported verbatim from the web (components/reports/*):
 * the report catalog, History and Schedule rows, the transaction report's
 * filters and columns, and the schedule panel's frequency notes.
 */
import type { MoreFilterCategory } from '@/components/shared/more-filters';

import type { StatusTone } from './common';

export type ReportKind = 'transaction' | 'settlement';

export type ReportCatalogCard = {
  title: string;
  description: string;
  icon: 'arrows-left-right' | 'chart-pie' | 'arrow-counter-clockwise';
  offlineOnly?: boolean;
};

export type ReportCatalogSection = {
  heading: string;
  /** Only "transaction" gets the filters + columns generate flow; the rest use name + date range. */
  kind: ReportKind;
  cards: ReportCatalogCard[];
};

const TRANSACTIONS_REPORT_DESC =
  'Reports show all transactions for a chosen time period. You can filter and create a report to download or email as a CSV.';
const INFLOW_OUTFLOW_REPORT_DESC =
  'Reports show inflow and outflow for a chosen time period. You can filter and create a report to download or email as a CSV.';
const REFUNDS_REPORT_DESC =
  'Reports show all refunds for a chosen time period. You can filter and create a report to download or email as a CSV.';

export const REPORT_SECTIONS: ReportCatalogSection[] = [
  {
    heading: 'Transaction reports',
    kind: 'transaction',
    cards: [
      { title: 'All transaction reports', description: TRANSACTIONS_REPORT_DESC, icon: 'arrows-left-right' },
      { title: 'EMI transaction report', description: INFLOW_OUTFLOW_REPORT_DESC, icon: 'chart-pie' },
      { title: 'Reward transaction report', description: REFUNDS_REPORT_DESC, icon: 'arrow-counter-clockwise' },
      { title: 'UPI transaction report', description: REFUNDS_REPORT_DESC, icon: 'arrow-counter-clockwise' },
      { title: 'Wallet transaction reports', description: TRANSACTIONS_REPORT_DESC, icon: 'arrows-left-right' },
      { title: 'NBFC transaction report', description: INFLOW_OUTFLOW_REPORT_DESC, icon: 'chart-pie' },
      { title: 'Insurance report', description: REFUNDS_REPORT_DESC, icon: 'arrow-counter-clockwise' },
      { title: 'DCC report', description: REFUNDS_REPORT_DESC, icon: 'arrow-counter-clockwise' },
    ],
  },
  {
    heading: 'Settlement reports',
    kind: 'settlement',
    cards: [
      { title: 'Merchant payout report', description: TRANSACTIONS_REPORT_DESC, icon: 'arrows-left-right' },
      { title: 'Batch detail report', description: INFLOW_OUTFLOW_REPORT_DESC, icon: 'chart-pie' },
    ],
  },
  {
    heading: 'Terminal reports',
    kind: 'settlement',
    cards: [
      { title: 'TID installation report', description: TRANSACTIONS_REPORT_DESC, icon: 'arrows-left-right', offlineOnly: true },
      { title: 'TID deinstallation report', description: INFLOW_OUTFLOW_REPORT_DESC, icon: 'chart-pie', offlineOnly: true },
      { title: 'POS installation report', description: REFUNDS_REPORT_DESC, icon: 'arrow-counter-clockwise', offlineOnly: true },
      { title: 'POS deinstallation report', description: REFUNDS_REPORT_DESC, icon: 'arrow-counter-clockwise', offlineOnly: true },
    ],
  },
  {
    heading: 'Sale summary reports',
    kind: 'settlement',
    cards: [
      { title: 'POS sales report', description: TRANSACTIONS_REPORT_DESC, icon: 'arrows-left-right', offlineOnly: true },
      { title: 'Store sales report', description: INFLOW_OUTFLOW_REPORT_DESC, icon: 'chart-pie', offlineOnly: true },
      { title: 'Acquirer sales report', description: REFUNDS_REPORT_DESC, icon: 'arrow-counter-clockwise' },
      { title: 'Issuer sales report', description: REFUNDS_REPORT_DESC, icon: 'arrow-counter-clockwise' },
      { title: 'UPI sales report', description: TRANSACTIONS_REPORT_DESC, icon: 'arrows-left-right' },
    ],
  },
  {
    heading: 'Financial reports',
    kind: 'settlement',
    cards: [{ title: 'FIRC reports', description: TRANSACTIONS_REPORT_DESC, icon: 'arrows-left-right' }],
  },
  {
    heading: 'Refund reports',
    kind: 'settlement',
    cards: [{ title: 'Refund reports', description: TRANSACTIONS_REPORT_DESC, icon: 'arrows-left-right' }],
  },
];

export const REPORT_TITLES = REPORT_SECTIONS.flatMap((section) => section.cards.map((card) => card.title));

export type ReportHistoryRow = { reportName: string; createdOn: string; dateRange: string; refundStatus: string; action: string };
export type ReportScheduleRow = { name: string; frequency: string; format: string; createdBy: string; status: string; action: string };

export const REPORT_HISTORY_ROWS: ReportHistoryRow[] = [
  { reportName: 'Transactions report - weekly', createdOn: '12 Aug 2026', dateRange: '05 Aug - 11 Aug', refundStatus: 'Completed', action: 'Download' },
  { reportName: 'Refund report', createdOn: '11 Aug 2026', dateRange: '04 Aug - 10 Aug', refundStatus: 'Processing', action: 'View' },
];

export const REPORT_SCHEDULE_ROWS: ReportScheduleRow[] = [
  { name: 'Weekly settlement summary', frequency: 'Weekly', format: 'CSV', createdBy: 'Tirth', status: 'Active', action: 'Edit' },
  { name: 'Daily transaction dump', frequency: 'Daily', format: 'XLSX', createdBy: 'Ops', status: 'Paused', action: 'Resume' },
];

export const REPORT_STATUS_OPTIONS = [
  { value: 'all', label: 'Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'processing', label: 'Processing' },
  { value: 'failed', label: 'Failed' },
] as const;

export const REPORT_MORE_FILTERS: MoreFilterCategory[] = [
  {
    id: 'category',
    label: 'Report category',
    display: 'card',
    selectionMode: 'multi',
    options: REPORT_SECTIONS.map((section) => ({ id: section.heading, label: section.heading })),
  },
  {
    id: 'channel',
    label: 'Channel',
    display: 'list',
    selectionMode: 'single',
    searchable: false,
    options: [
      { id: 'online', label: 'Online' },
      { id: 'offline', label: 'Offline' },
    ],
  },
  {
    id: 'format',
    label: 'Format',
    display: 'badge',
    selectionMode: 'multi',
    searchable: false,
    options: [
      { id: 'csv', label: 'CSV' },
      { id: 'xlsx', label: 'XLSX' },
      { id: 'pdf', label: 'PDF' },
    ],
  },
];

/** Web: toReportTone(). */
export function reportStatusTone(status: string): StatusTone {
  const normalized = status.toLowerCase();
  if (normalized.includes('completed') || normalized.includes('active')) return 'success';
  if (normalized.includes('processing')) return 'processing';
  if (normalized.includes('paused')) return 'initiated';
  return 'failed';
}

export type ReportFilterField = { id: string; label: string; options: string[] };

export const REPORT_FILTER_FIELDS: ReportFilterField[] = [
  { id: 'zones', label: 'Select zones', options: ['North', 'South', 'East', 'West'] },
  { id: 'paymentMode', label: 'Select payment mode', options: ['UPI', 'Card', 'Net banking'] },
  { id: 'issuers', label: 'Select issuers', options: ['HDFC', 'ICICI', 'Axis', 'SBI'] },
  { id: 'transactionType', label: 'Select transaction type', options: ['Sale', 'Refund', 'Void'] },
  { id: 'batchStatus', label: 'Select batch status', options: ['Open', 'Closed'] },
  { id: 'transactionStatus', label: 'Select transaction status', options: ['Success', 'Failed', 'Pending'] },
  { id: 'dcc', label: 'DCC transactions', options: ['Yes', 'No'] },
  { id: 'nfc', label: 'NFC report', options: ['Yes', 'No'] },
  { id: 'states', label: 'Select states', options: ['Delhi', 'Maharashtra', 'Karnataka', 'Uttar Pradesh'] },
];

export const REPORT_COLUMNS = [
  'Zone',
  'Store name',
  'City',
  'POS',
  'Hardware model',
  'Hardware ID',
  'Acquirer',
  'TID',
  'MID',
  'Batch no',
  'Payment mode',
  'Customer payment mode ID',
  'Name',
  'Card issuer',
  'Card type',
  'Card network',
  'Card colour',
  'Transaction ID',
  'Invoice',
  'Approval code',
  'Type',
  'Amount',
  'TIP amount',
  'Currency',
  'Date',
  'Batch status',
  'Txn status',
  'Settlement date',
  'Bill invoice',
  'RRN',
  'EMI txn',
  'EMI month',
  'Contact less',
  'Acquirer response code',
];

export const DEFAULT_REPORT_COLUMNS = REPORT_COLUMNS.filter((column) => column !== 'Acquirer response code');

export type ScheduleFrequency = 'Daily' | 'Weekly' | 'Monthly';

export const SCHEDULE_FREQUENCY_NOTE: Record<ScheduleFrequency, string> = {
  Daily: "Includes previous day's data from 00:00 AM to 11:59 PM",
  Weekly: "Includes the previous 7 days' data, delivered every Monday",
  Monthly: "Includes the previous calendar month's data, delivered on the 1st",
};

/** Web: nextDeliveryDate() — "25 September". */
export function nextDeliveryDate(frequency: ScheduleFrequency, from = new Date()) {
  const date = new Date(from);
  date.setDate(date.getDate() + (frequency === 'Daily' ? 1 : frequency === 'Weekly' ? 7 : 30));
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export const MAX_SCHEDULE_EMAILS = 15;
