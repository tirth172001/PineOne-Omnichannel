/**
 * Disputes mock data, ported verbatim from the web
 * (components/disputes/disputes-data.ts, the evidence panel's fields and the
 * detail page's fixed sections and flow states).
 */
import type { PaymentMode, StatusTone } from './common';
import type { DetailRowData } from '@/components/shared/detail-rows';

export type DisputeStatus = 'Action pending' | 'Reviewing' | 'Closed';

export type DisputeRecord = {
  id: string;
  transactionId: string;
  amount: string;
  createdOn: string;
  dueDate: string;
  status: DisputeStatus;
  outcome: 'Won' | 'Lost' | null;
  category: string;
  reason: string;
  channel: 'in-store' | 'online';
  /** Drives the payment-mode icon/label on the detail page hero, same as the transaction detail page. */
  paymentMode: PaymentMode;
  paymentLabel: string;
  /** Time-of-day paired with createdOn for the "Transaction on" line and Activity timestamps. */
  time: string;
  rrn: string;
  /** Set when a previously submitted document was flagged on review — seeds the
   *  detail page's "documents rejected" banner state for this record. */
  evidenceIssue?: string;
};

/** One record per flow state (pending / rejected / submitted / won / lost), duplicated
 *  across both channel tabs, so every stage of the dispute-detail flow is reachable
 *  from the listing regardless of which "In-store" / "Online" tab is active. */
export const disputeRecords: DisputeRecord[] = [
  // Online payments
  {
    id: 'DSP-2101',
    transactionId: 'TXN-5161',
    amount: '₹ 20,000',
    createdOn: '12 Aug 2026',
    dueDate: '14 Aug 2026',
    status: 'Action pending',
    outcome: null,
    category: 'Product not received',
    reason: 'Customer claims the product was never delivered.',
    channel: 'online',
    paymentMode: 'upi',
    paymentLabel: 'UPI',
    time: '10:00 AM',
    rrn: '84754574584754',
    evidenceIssue: 'Chargeslip copy missing. Invoice uploaded is blurry. Please re-upload both documents clearly.',
  },
  {
    id: 'DSP-2103',
    transactionId: 'TXN-5163',
    amount: '₹ 30,000',
    createdOn: '10 Aug 2026',
    dueDate: '15 Aug 2026',
    status: 'Action pending',
    outcome: null,
    category: 'Fraud',
    reason: 'Customer reports the transaction was unauthorized.',
    channel: 'online',
    paymentMode: 'card',
    paymentLabel: 'Card',
    time: '9:30 PM',
    rrn: '6876347862381',
  },
  {
    id: 'DSP-2104',
    transactionId: 'TXN-5164',
    amount: '₹ 25,000',
    createdOn: '9 Aug 2026',
    dueDate: '12 Aug 2026',
    status: 'Closed',
    outcome: 'Won',
    category: 'Service not rendered',
    reason: 'Merchant provided proof of service completion.',
    channel: 'online',
    paymentMode: 'card',
    paymentLabel: 'Card',
    time: '3:00 PM',
    rrn: '6876347862377',
  },
  {
    id: 'DSP-2106',
    transactionId: 'TXN-5166',
    amount: '₹ 18,000',
    createdOn: '7 Aug 2026',
    dueDate: '10 Aug 2026',
    status: 'Reviewing',
    outcome: null,
    category: 'Duplicate charge',
    reason: 'Customer disputes a second, identical charge.',
    channel: 'online',
    paymentMode: 'netbanking',
    paymentLabel: 'Net banking',
    time: '2:45 PM',
    rrn: '6876347862376',
  },
  {
    id: 'DSP-2107',
    transactionId: 'TXN-5167',
    amount: '₹ 12,500',
    createdOn: '6 Aug 2026',
    dueDate: '9 Aug 2026',
    status: 'Closed',
    outcome: 'Lost',
    category: 'Product not received',
    reason: 'Merchant could not provide valid delivery proof.',
    channel: 'online',
    paymentMode: 'netbanking',
    paymentLabel: 'Net banking',
    time: '4:30 PM',
    rrn: '6876347862379',
  },

  // In-store payments
  {
    id: 'DSP-2102',
    transactionId: 'TXN-5162',
    amount: '₹ 10,000',
    createdOn: '11 Aug 2026',
    dueDate: '13 Aug 2026',
    status: 'Reviewing',
    outcome: null,
    category: 'Duplicate charge',
    reason: 'Customer was billed twice for the same order.',
    channel: 'in-store',
    paymentMode: 'upi',
    paymentLabel: 'UPI',
    time: '10:10 PM',
    rrn: '6876347862374',
  },
  {
    id: 'DSP-2105',
    transactionId: 'TXN-5165',
    amount: '₹ 45,000',
    createdOn: '8 Aug 2026',
    dueDate: '11 Aug 2026',
    status: 'Closed',
    outcome: 'Lost',
    category: 'Product not received',
    reason: 'Merchant could not provide valid delivery proof.',
    channel: 'in-store',
    paymentMode: 'card',
    paymentLabel: 'Card',
    time: '1:00 PM',
    rrn: '6876347862378',
  },
  {
    id: 'DSP-2108',
    transactionId: 'TXN-5168',
    amount: '₹ 15,000',
    createdOn: '5 Aug 2026',
    dueDate: '8 Aug 2026',
    status: 'Action pending',
    outcome: null,
    category: 'Fraud',
    reason: 'Customer reports the transaction was unauthorized.',
    channel: 'in-store',
    paymentMode: 'upi',
    paymentLabel: 'UPI',
    time: '11:15 AM',
    rrn: '6876347862375',
  },
  {
    id: 'DSP-2109',
    transactionId: 'TXN-5169',
    amount: '₹ 22,000',
    createdOn: '4 Aug 2026',
    dueDate: '7 Aug 2026',
    status: 'Action pending',
    outcome: null,
    category: 'Product not received',
    reason: 'Customer claims the product was never delivered.',
    channel: 'in-store',
    paymentMode: 'upi',
    paymentLabel: 'UPI',
    time: '8:00 AM',
    rrn: '6876347862380',
    evidenceIssue: "Delivery proof uploaded doesn't match the order ID. Please re-upload the correct document.",
  },
  {
    id: 'DSP-2110',
    transactionId: 'TXN-5170',
    amount: '₹ 33,000',
    createdOn: '3 Aug 2026',
    dueDate: '6 Aug 2026',
    status: 'Closed',
    outcome: 'Won',
    category: 'Service not rendered',
    reason: 'Merchant provided proof of service completion.',
    channel: 'in-store',
    paymentMode: 'netbanking',
    paymentLabel: 'Net banking',
    time: '6:00 PM',
    rrn: '6876347862382',
  },
];

export function findDisputeById(id: string) {
  return disputeRecords.find((record) => record.id === id) ?? null;
}

export function disputeActionLabel(record: DisputeRecord) {
  if (record.status === 'Closed') return record.outcome === 'Won' ? 'Won' : 'Lost';
  if (record.status === 'Reviewing') return 'In review';
  if (record.evidenceIssue) return 'Re-upload';
  return 'Defend';
}

export function disputeStatusTone(record: Pick<DisputeRecord, 'status' | 'outcome' | 'evidenceIssue'>): StatusTone {
  if (record.status === 'Closed') return record.outcome === 'Won' ? 'success' : 'failed';
  if (record.status === 'Reviewing') return 'processing';
  if (record.evidenceIssue) return 'failed';
  return 'initiated';
}

export function disputeStatusLabel(record: Pick<DisputeRecord, 'status' | 'outcome' | 'evidenceIssue'>): string {
  if (record.status === 'Closed') return record.outcome === 'Won' ? 'Won' : 'Lost';
  if (record.status !== 'Reviewing' && record.evidenceIssue) return 'Documents rejected';
  return record.status;
}

export const DISPUTE_STATUSES: DisputeStatus[] = ['Action pending', 'Reviewing', 'Closed'];

export function parseInr(amount: string) {
  return Number(amount.replace(/[^\d]/g, '')) || 0;
}

/** The detail page's flow (web: FlowState in dispute-detail-content.tsx). */
export type DisputeFlowState = 'pending' | 'submitted' | 'rejected' | 'won' | 'lost';

export function initialFlowState(record: DisputeRecord): DisputeFlowState {
  if (record.status === 'Closed') return record.outcome === 'Won' ? 'won' : 'lost';
  if (record.status === 'Reviewing') return 'submitted';
  if (record.evidenceIssue) return 'rejected';
  return 'pending';
}

export const FLOW_STATUS_PILL: Record<DisputeFlowState, { label: string; tone: StatusTone }> = {
  pending: { label: 'Response pending', tone: 'processing' },
  rejected: { label: 'Response pending', tone: 'processing' },
  submitted: { label: 'In review', tone: 'initiated' },
  won: { label: 'Won', tone: 'success' },
  lost: { label: 'Lost', tone: 'failed' },
};

/** Banner lightning colour (Tailwind amber/sky/emerald/red 600). */
export const FLOW_BANNER_COLOR: Record<DisputeFlowState, string> = {
  pending: '#d97706',
  rejected: '#d97706',
  submitted: '#0284c7',
  won: '#059669',
  lost: '#dc2626',
};

export type EvidenceFieldKey = 'invoice' | 'delivery' | 'rebuttal' | 'refund' | 'additional';

export type EvidenceDocument = { fileName: string };

export type EvidenceDocuments = Partial<Record<EvidenceFieldKey, EvidenceDocument>>;

export type EvidencePanelMode = 'defend' | 'view' | 'reupload';

export const EVIDENCE_FIELDS: { key: EvidenceFieldKey; label: string; placeholder: string }[] = [
  { key: 'invoice', label: 'Invoice / Bill copy', placeholder: 'Upload invoice / Bill copy' },
  { key: 'delivery', label: 'Delivery / Service proof', placeholder: 'Upload delivery / service proof' },
  { key: 'rebuttal', label: 'Rebuttal letter / ID proof', placeholder: 'Upload rebuttal letter / ID proof' },
  { key: 'refund', label: 'Refund details', placeholder: 'Upload refund details' },
  { key: 'additional', label: 'Additional documents', placeholder: 'Upload additional documents' },
];

export const EVIDENCE_PANEL_COPY: Record<EvidencePanelMode, { title: string; sectionTitle: string }> = {
  defend: { title: 'Defend dispute', sectionTitle: 'Upload supporting proofs' },
  view: { title: 'Response details', sectionTitle: 'Supporting proofs' },
  reupload: { title: 'Re-upload documents', sectionTitle: 'Upload supporting proofs' },
};

const DEFAULT_SUBMITTED_DOCUMENTS: EvidenceDocuments = {
  invoice: { fileName: 'Invoice.pdf' },
  delivery: { fileName: 'Delivery.pdf' },
  rebuttal: { fileName: 'rebuttal_letter.pdf' },
  refund: { fileName: 'refund_details.pdf' },
  additional: { fileName: 'additional_documents.pdf' },
};

const DEFAULT_REJECTED_DOCUMENTS: EvidenceDocuments = {
  invoice: { fileName: 'Invoice.pdf' },
  delivery: { fileName: 'Delivery.pdf' },
  refund: { fileName: 'refund_details.pdf' },
  additional: { fileName: 'additional_documents.pdf' },
};

/** The field flagged as blurry in the re-upload flow. */
export const REJECTED_FLAGGED_FIELD: EvidenceFieldKey = 'rebuttal';

export function initialDocuments(flowState: DisputeFlowState): EvidenceDocuments {
  if (flowState === 'rejected') return DEFAULT_REJECTED_DOCUMENTS;
  if (flowState === 'submitted' || flowState === 'won' || flowState === 'lost') return DEFAULT_SUBMITTED_DOCUMENTS;
  return {};
}

/** The detail page's sections (fixed demo values, as on web). */
export function getDisputeSections(record: DisputeRecord): { title: string; rows: DetailRowData[] }[] {
  return [
    {
      title: 'Dispute details',
      rows: [
        { label: 'Dispute ID', value: record.id, copyable: true },
        { label: 'Type', value: record.category },
        { label: 'Reason', value: record.reason },
      ],
    },
    {
      title: 'Transaction details',
      rows: [
        { label: 'Transaction ID', value: record.transactionId, copyable: true },
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
      rows: [
        { label: 'Merchant name', value: 'PineLabs Private limited' },
        { label: 'Merchant city', value: 'Noida' },
        { label: 'Merchant store', value: 'PineLabs - Noida branch' },
        { label: 'Store city', value: 'Noida' },
        { label: 'MID', value: '6352699747', copyable: true },
        { label: 'Merchant VPA', value: '6352699747@ptyes' },
        { label: 'Host category', value: '1' },
        { label: 'Acquirer ID', value: '4' },
        { label: 'Amt in ₹', value: record.amount },
        { label: 'Batch ID', value: '1' },
        { label: 'RRN', value: record.rrn },
      ],
    },
    {
      title: 'Customer details',
      rows: [
        { label: 'Customer name', value: 'Tirth Nehalkumar Trivedi' },
        { label: 'Payment mode ID', value: '6352699747@ptyes' },
      ],
    },
  ];
}

/** The detail page's Activity events (web: activityEvents in dispute-detail-content.tsx). */
export function getDisputeActivity(record: DisputeRecord) {
  const at = `${record.createdOn}, ${record.time}`;
  return [
    {
      id: 'dispute-raised',
      title: 'Dispute raised',
      timestamp: at,
      tone: 'processing' as const,
      icon: { icon: 'lightning-fill', color: '#d97706' },
      details: [
        { label: 'Dispute ID', value: record.id },
        { label: 'Type', value: record.category },
        { label: 'Reason', value: record.reason },
      ],
    },
    {
      id: 'settlement-completed',
      title: 'Settlement completed',
      timestamp: at,
      tone: 'success' as const,
      details: [
        { label: 'Transaction ID', value: record.transactionId },
        { label: 'Settlement amount', value: record.amount },
        { label: 'Status', value: 'Completed' },
      ],
    },
    {
      id: 'payment-success',
      title: 'Payment success',
      timestamp: at,
      tone: 'success' as const,
      details: [
        { label: 'Payment mode', value: record.paymentLabel },
        { label: 'Captured amount', value: record.amount },
        { label: 'RRN', value: record.rrn },
      ],
    },
    {
      id: 'payment-pending',
      title: 'Payment pending',
      timestamp: at,
      tone: 'processing' as const,
      details: [
        { label: 'Transaction ID', value: record.transactionId },
        { label: 'Amount', value: record.amount },
        { label: 'State', value: 'Pending' },
      ],
    },
    {
      id: 'payment-initiated',
      title: 'Payment initiated',
      timestamp: at,
      tone: 'initiated' as const,
      details: [
        { label: 'Transaction ID', value: record.transactionId },
        { label: 'Initiated amount', value: record.amount },
        { label: 'Mode', value: record.paymentLabel },
      ],
    },
  ];
}
