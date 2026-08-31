import type { StatusTone } from "@/components/shared/status-pill"
import type { PaymentMode } from "@/components/transactions/transactions-data"

export type DisputeStatus = "Action pending" | "Reviewing" | "Closed"

export type DisputeRecord = {
  id: string
  transactionId: string
  amount: string
  createdOn: string
  dueDate: string
  status: DisputeStatus
  outcome: "Won" | "Lost" | null
  category: string
  reason: string
  channel: "in-store" | "online"
  /** Drives the payment-mode icon/label on the detail page hero, same as the transaction detail page. */
  paymentMode: PaymentMode
  paymentLabel: string
  /** Time-of-day paired with createdOn for the "Transaction on" line and Activity timestamps. */
  time: string
  rrn: string
  /** Set when a previously submitted document was flagged on review — seeds the
   *  detail page's "documents rejected" banner state for this record. */
  evidenceIssue?: string
}

/** One record per flow state (pending / rejected / submitted / won / lost), duplicated
 *  across both channel tabs, so every stage of the dispute-detail flow is reachable
 *  from the listing regardless of which "In-store" / "Online" tab is active. */
export const disputeRecords: DisputeRecord[] = [
  // Online payments
  { id: "DSP-2101", transactionId: "TXN-5161", amount: "₹ 20,000", createdOn: "12 Aug 2026", dueDate: "14 Aug 2026", status: "Action pending", outcome: null, category: "Product not received", reason: "Customer claims the product was never delivered.", channel: "online", paymentMode: "upi", paymentLabel: "UPI", time: "10:00 AM", rrn: "84754574584754", evidenceIssue: "Chargeslip copy missing. Invoice uploaded is blurry. Please re-upload both documents clearly." },
  { id: "DSP-2103", transactionId: "TXN-5163", amount: "₹ 30,000", createdOn: "10 Aug 2026", dueDate: "15 Aug 2026", status: "Action pending", outcome: null, category: "Fraud", reason: "Customer reports the transaction was unauthorized.", channel: "online", paymentMode: "card", paymentLabel: "Card", time: "9:30 PM", rrn: "6876347862381" },
  { id: "DSP-2104", transactionId: "TXN-5164", amount: "₹ 25,000", createdOn: "9 Aug 2026", dueDate: "12 Aug 2026", status: "Closed", outcome: "Won", category: "Service not rendered", reason: "Merchant provided proof of service completion.", channel: "online", paymentMode: "card", paymentLabel: "Card", time: "3:00 PM", rrn: "6876347862377" },
  { id: "DSP-2106", transactionId: "TXN-5166", amount: "₹ 18,000", createdOn: "7 Aug 2026", dueDate: "10 Aug 2026", status: "Reviewing", outcome: null, category: "Duplicate charge", reason: "Customer disputes a second, identical charge.", channel: "online", paymentMode: "netbanking", paymentLabel: "Net banking", time: "2:45 PM", rrn: "6876347862376" },
  { id: "DSP-2107", transactionId: "TXN-5167", amount: "₹ 12,500", createdOn: "6 Aug 2026", dueDate: "9 Aug 2026", status: "Closed", outcome: "Lost", category: "Product not received", reason: "Merchant could not provide valid delivery proof.", channel: "online", paymentMode: "netbanking", paymentLabel: "Net banking", time: "4:30 PM", rrn: "6876347862379" },

  // In-store payments
  { id: "DSP-2102", transactionId: "TXN-5162", amount: "₹ 10,000", createdOn: "11 Aug 2026", dueDate: "13 Aug 2026", status: "Reviewing", outcome: null, category: "Duplicate charge", reason: "Customer was billed twice for the same order.", channel: "in-store", paymentMode: "upi", paymentLabel: "UPI", time: "10:10 PM", rrn: "6876347862374" },
  { id: "DSP-2105", transactionId: "TXN-5165", amount: "₹ 45,000", createdOn: "8 Aug 2026", dueDate: "11 Aug 2026", status: "Closed", outcome: "Lost", category: "Product not received", reason: "Merchant could not provide valid delivery proof.", channel: "in-store", paymentMode: "card", paymentLabel: "Card", time: "1:00 PM", rrn: "6876347862378" },
  { id: "DSP-2108", transactionId: "TXN-5168", amount: "₹ 15,000", createdOn: "5 Aug 2026", dueDate: "8 Aug 2026", status: "Action pending", outcome: null, category: "Fraud", reason: "Customer reports the transaction was unauthorized.", channel: "in-store", paymentMode: "upi", paymentLabel: "UPI", time: "11:15 AM", rrn: "6876347862375" },
  { id: "DSP-2109", transactionId: "TXN-5169", amount: "₹ 22,000", createdOn: "4 Aug 2026", dueDate: "7 Aug 2026", status: "Action pending", outcome: null, category: "Product not received", reason: "Customer claims the product was never delivered.", channel: "in-store", paymentMode: "upi", paymentLabel: "UPI", time: "8:00 AM", rrn: "6876347862380", evidenceIssue: "Delivery proof uploaded doesn't match the order ID. Please re-upload the correct document." },
  { id: "DSP-2110", transactionId: "TXN-5170", amount: "₹ 33,000", createdOn: "3 Aug 2026", dueDate: "6 Aug 2026", status: "Closed", outcome: "Won", category: "Service not rendered", reason: "Merchant provided proof of service completion.", channel: "in-store", paymentMode: "netbanking", paymentLabel: "Net banking", time: "6:00 PM", rrn: "6876347862382" },
]

export function findDisputeById(id: string) {
  return disputeRecords.find((record) => record.id === id) ?? null
}

export function disputeActionLabel(record: DisputeRecord) {
  if (record.status === "Closed") return record.outcome === "Won" ? "Won" : "Lost"
  if (record.status === "Reviewing") return "In review"
  if (record.evidenceIssue) return "Re-upload"
  return "Defend"
}

export function disputeStatusTone(record: Pick<DisputeRecord, "status" | "outcome" | "evidenceIssue">): StatusTone {
  if (record.status === "Closed") return record.outcome === "Won" ? "success" : "failed"
  if (record.status === "Reviewing") return "processing"
  if (record.evidenceIssue) return "failed"
  return "initiated"
}

export function disputeStatusLabel(record: Pick<DisputeRecord, "status" | "outcome" | "evidenceIssue">): string {
  if (record.status === "Closed") return record.outcome === "Won" ? "Won" : "Lost"
  if (record.status !== "Reviewing" && record.evidenceIssue) return "Documents rejected"
  return record.status
}
