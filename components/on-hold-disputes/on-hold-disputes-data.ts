import type { StatusTone } from "@/components/shared/status-pill"

export type OnHoldStatus = "Action pending" | "In review" | "Settlement initiated" | "Rejected" | "Settled"

export type OnHoldRecord = {
  id: string
  transactionId: string
  amount: string
  datePrimary: string
  dateSecondary: string
  status: OnHoldStatus
  reason: string
  channel: "in-store" | "online"
}

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
}

export const onHoldRecords: OnHoldRecord[] = [
  { id: "MER-738723323", transactionId: "MER-738723323", amount: "₹ 20,000", datePrimary: "3 Jul 2026", dateSecondary: "10:00 AM", status: "Action pending", reason: "Upload the requested document", channel: "in-store" },
  { id: "MER-143393030", transactionId: "MER-143393030", amount: "₹ 10,000", datePrimary: "8 Jul 2026", dateSecondary: "3:00 PM", status: "Action pending", reason: "Document not verified. Upload again.", channel: "online" },
  { id: "MER-103992626", transactionId: "MER-103992626", amount: "₹ 25,000", datePrimary: "5 Jul 2026", dateSecondary: "12:00 PM", status: "In review", reason: "Document under review", channel: "in-store" },
  { id: "MER-153493131", transactionId: "MER-153493131", amount: "₹ 30,000", datePrimary: "10 Jul 2026", dateSecondary: "5:00 PM", status: "Settlement initiated", reason: "Approved for next payout cycle", channel: "online" },
  { id: "MER-133292929", transactionId: "MER-133292929", amount: "₹ 35,000", datePrimary: "4 Jul 2026", dateSecondary: "11:00 AM", status: "Rejected", reason: "This transaction won't be settled due to risk issues", channel: "in-store" },
  { id: "MER-123192828", transactionId: "MER-123192828", amount: "₹ 40,000", datePrimary: "9 Jul 2026", dateSecondary: "4:00 PM", status: "Settled", reason: "Settlement completed", channel: "online" },
  { id: "MER-938923525", transactionId: "MER-938923525", amount: "₹ 45,000", datePrimary: "3 Jul 2026", dateSecondary: "10:00 AM", status: "Settled", reason: "Settlement completed", channel: "in-store" },
  { id: "MER-113092727", transactionId: "MER-113092727", amount: "₹ 50,000", datePrimary: "7 Jul 2026", dateSecondary: "2:00 PM", status: "Settled", reason: "Settlement completed", channel: "online" },
  { id: "MER-838823424", transactionId: "MER-838823424", amount: "₹ 55,000", datePrimary: "6 Jul 2026", dateSecondary: "1:00 PM", status: "Settled", reason: "Settlement completed", channel: "in-store" },
  { id: "MER-163593232", transactionId: "MER-163593232", amount: "₹ 60,000", datePrimary: "11 Jul 2026", dateSecondary: "6:00 PM", status: "Settled", reason: "Settlement completed", channel: "online" },
]

export const disputeRecords: DisputeRecord[] = [
  { id: "DSP-2101", transactionId: "TXN-5161", amount: "₹ 20,000", createdOn: "12 Aug 2026", dueDate: "14 Aug 2026", status: "Action pending", outcome: null, category: "Product not received", reason: "Customer claims the product was never delivered.", channel: "online" },
  { id: "DSP-2102", transactionId: "TXN-5162", amount: "₹ 10,000", createdOn: "11 Aug 2026", dueDate: "13 Aug 2026", status: "Reviewing", outcome: null, category: "Duplicate charge", reason: "Customer was billed twice for the same order.", channel: "in-store" },
  { id: "DSP-2103", transactionId: "TXN-5163", amount: "₹ 30,000", createdOn: "10 Aug 2026", dueDate: "15 Aug 2026", status: "Action pending", outcome: null, category: "Fraud", reason: "Customer reports the transaction was unauthorized.", channel: "online" },
  { id: "DSP-2104", transactionId: "TXN-5164", amount: "₹ 25,000", createdOn: "9 Aug 2026", dueDate: "12 Aug 2026", status: "Closed", outcome: "Won", category: "Service not rendered", reason: "Merchant provided proof of service completion.", channel: "online" },
  { id: "DSP-2105", transactionId: "TXN-5165", amount: "₹ 45,000", createdOn: "8 Aug 2026", dueDate: "11 Aug 2026", status: "Closed", outcome: "Lost", category: "Product not received", reason: "Merchant could not provide valid delivery proof.", channel: "in-store" },
  { id: "DSP-2106", transactionId: "TXN-5166", amount: "₹ 18,000", createdOn: "7 Aug 2026", dueDate: "10 Aug 2026", status: "Reviewing", outcome: null, category: "Duplicate charge", reason: "Customer disputes a second, identical charge.", channel: "online" },
]

export function findOnHoldById(id: string) {
  return onHoldRecords.find((record) => record.id === id) ?? null
}

export function findDisputeById(id: string) {
  return disputeRecords.find((record) => record.id === id) ?? null
}

export function disputeActionLabel(record: DisputeRecord) {
  if (record.status === "Closed") return record.outcome === "Won" ? "Won" : "Lost"
  if (record.status === "Reviewing") return "In review"
  return "Defend"
}

export function onHoldStatusTone(status: OnHoldStatus): StatusTone {
  if (status === "Settled") return "success"
  if (status === "Settlement initiated") return "initiated"
  if (status === "Rejected") return "failed"
  return "processing"
}

export function disputeStatusTone(record: Pick<DisputeRecord, "status" | "outcome">): StatusTone {
  if (record.status === "Closed") return record.outcome === "Won" ? "success" : "failed"
  if (record.status === "Reviewing") return "processing"
  return "initiated"
}

export function disputeStatusLabel(record: Pick<DisputeRecord, "status" | "outcome">): string {
  if (record.status === "Closed") return record.outcome === "Won" ? "Won" : "Lost"
  return record.status
}
