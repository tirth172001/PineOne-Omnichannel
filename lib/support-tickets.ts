import type { SupportTopicSlug } from "@/lib/support-knowledge"
import { getSupportTopic } from "@/lib/support-knowledge"

export type TicketStatus = "Open" | "In progress" | "Resolved"
export type TicketPriority = "Urgent" | "High" | "Medium" | "Low"

export type TicketTrailStep = {
  title: string
  timestamp: string
  description: string
  complete: boolean
}

export type SupportTicket = {
  id: string
  issue: string
  category: string
  topicSlug: SupportTopicSlug
  product: string
  priority: TicketPriority
  status: TicketStatus
  createdAt: string
  updatedAt: string
  deviceId?: string
  diagnosticRunId?: string
  storeDetails?: { name: string; contact: string; address: string }
}

/** Builds the "Trail of changes" timeline shown in the ticket detail panel — driven off
 *  status so every seeded ticket gets a coherent, status-appropriate trail without having
 *  to hand-author dozens of individual timelines. */
export function buildTicketTrail(ticket: SupportTicket): TicketTrailStep[] {
  const topicLabel = getSupportTopic(ticket.topicSlug)?.label ?? ticket.category
  const steps: TicketTrailStep[] = [
    {
      title: "Ticket created",
      timestamp: ticket.createdAt,
      description: `Request logged for ${topicLabel}.`,
      complete: true,
    },
  ]

  if (ticket.deviceId) {
    steps.push({
      title: "Context captured",
      timestamp: ticket.createdAt,
      description: `${ticket.product} linked with device ${ticket.deviceId}.`,
      complete: true,
    })
  }

  if (ticket.diagnosticRunId) {
    steps.push({
      title: "Diagnostic attached",
      timestamp: ticket.updatedAt,
      description: `Diagnostic run ${ticket.diagnosticRunId} is attached to the request.`,
      complete: true,
    })
  }

  if (ticket.status === "Resolved") {
    steps.push({
      title: "Open with support",
      timestamp: ticket.updatedAt,
      description: "The ticket was reviewed and worked on by the support team.",
      complete: true,
    })
    steps.push({
      title: "Resolved",
      timestamp: ticket.updatedAt,
      description: "The issue was resolved and the ticket was closed.",
      complete: true,
    })
  } else if (ticket.status === "In progress") {
    steps.push({
      title: "Open with support",
      timestamp: ticket.updatedAt,
      description: "The ticket is currently active with the support team.",
      complete: true,
    })
    steps.push({
      title: "In progress",
      timestamp: ticket.updatedAt,
      description: "A support specialist is actively working on this request.",
      complete: false,
    })
  } else {
    steps.push({
      title: "Open with support",
      timestamp: ticket.updatedAt,
      description: "The ticket is currently active with the support team.",
      complete: false,
    })
  }

  return steps
}

export function expectedResolution(ticket: SupportTicket) {
  return ticket.status === "Resolved" ? "Resolved" : `Expected by ${ticket.updatedAt.split(",")[0]}, 8:17 pm`
}

const TIMES = ["12:42 pm", "10:42 am", "8:42 pm", "1:42 am", "11:42 am", "9:42 am", "3:42 am", "2:42 pm", "5:42 pm", "12:42 pm"]

function seedTicket(
  index: number,
  overrides: Partial<SupportTicket> & Pick<SupportTicket, "issue" | "category" | "topicSlug" | "product">
): SupportTicket {
  const day = 6 - Math.floor(index / 3)
  const createdAt = `${Math.max(1, day)} May 26, ${TIMES[index % TIMES.length]}`
  const updatedAt = `06 May 26, ${TIMES[(index + 3) % TIMES.length]}`
  const priorities: TicketPriority[] = ["Urgent", "High", "Medium", "Low"]
  const statuses: TicketStatus[] = ["Open", "Open", "In progress", "Resolved"]

  return {
    id: `PL-ITCH${String(index + 1).padStart(2, "0")}`,
    priority: priorities[index % priorities.length],
    status: statuses[index % statuses.length],
    createdAt,
    updatedAt,
    ...overrides,
  }
}

export const SUPPORT_TICKETS: SupportTicket[] = [
  seedTicket(0, { issue: "PoS terminal not responding during a transaction", category: "Terminal & Hardware Issue", topicSlug: "device-hardware", product: "Pine Touch", deviceId: "TOU-ITCH-01", diagnosticRunId: "diag-seeded-touch-01", status: "Open" }),
  seedTicket(1, { issue: "PoS terminal not responding during a transaction", category: "Terminal & Hardware Issue", topicSlug: "device-hardware", product: "Pine Touch", deviceId: "TOU-ITCH-02", diagnosticRunId: "diag-seeded-touch-02", status: "Open" }),
  seedTicket(2, { issue: "PoS terminal not responding during a transaction", category: "Terminal & Hardware Issue", topicSlug: "device-hardware", product: "Pine Touch", deviceId: "TOU-ITCH-03", diagnosticRunId: "diag-seeded-touch-03", status: "In progress" }),
  seedTicket(3, { issue: "Failed transaction — what to do", category: "Payment acceptance", topicSlug: "payments", product: "Pine Checkout", status: "Open" }),
  seedTicket(4, { issue: "Failed transaction — what to do", category: "Payment acceptance", topicSlug: "payments", product: "Pine Checkout", status: "Resolved" }),
  seedTicket(5, { issue: "Checkout success rate dropped for card payments", category: "Payment acceptance", topicSlug: "payments", product: "Pine Checkout", status: "In progress" }),
  seedTicket(6, { issue: "UPI QR not working at checkout", category: "UPI QR & Collect", topicSlug: "upi", product: "UPI", status: "Open" }),
  seedTicket(7, { issue: "UPI QR not working at checkout", category: "UPI QR & Collect", topicSlug: "upi", product: "UPI", status: "Open" }),
  seedTicket(8, { issue: "Customer debited but order shows failed", category: "UPI QR & Collect", topicSlug: "upi", product: "UPI", status: "Resolved" }),
  seedTicket(9, { issue: "Report download failed", category: "Reports & Analytics", topicSlug: "reports", product: "Pine GrowthHub", status: "Open" }),
  seedTicket(10, { issue: "Scheduled report missing from history", category: "Reports & Analytics", topicSlug: "reports", product: "Pine GrowthHub", status: "In progress" }),
  seedTicket(11, { issue: "Settlement amount lower than expected", category: "Settlement & Payouts", topicSlug: "settlements", product: "Pine GrowthHub", status: "Open" }),
  seedTicket(12, { issue: "UTR reference missing on settlement batch", category: "Settlement & Payouts", topicSlug: "settlements", product: "Pine GrowthHub", status: "Resolved" }),
  seedTicket(13, { issue: "Unable to reset account password", category: "Account & Access", topicSlug: "account-access", product: "Pine Checkout", status: "Open" }),
  seedTicket(14, { issue: "New team member invite not received", category: "Account & Access", topicSlug: "account-access", product: "Pine Checkout", status: "In progress" }),
  seedTicket(15, { issue: "PoS device restarting mid-transaction", category: "Terminal & Hardware Issue", topicSlug: "device-hardware", product: "Pine Go", deviceId: "GO-ITCH-04", diagnosticRunId: "diag-seeded-go-04", status: "Open" }),
  seedTicket(16, { issue: "Paper roll not printing on billing counter", category: "Terminal & Hardware Issue", topicSlug: "device-hardware", product: "Pine Go", deviceId: "GO-ITCH-05", diagnosticRunId: "diag-seeded-go-05", status: "Resolved" }),
  seedTicket(17, { issue: "Need onboarding videos for new store staff", category: "Training", topicSlug: "training", product: "Pine Touch", status: "Open" }),
  seedTicket(18, { issue: "DCC not showing at checkout for international card", category: "Pine Checkout", topicSlug: "pine-checkout", product: "Pine Checkout", status: "Open" }),
  seedTicket(19, { issue: "Battery draining fast on handheld terminal", category: "Terminal & Hardware Issue", topicSlug: "device-hardware", product: "Pine Go", deviceId: "GO-ITCH-06", diagnosticRunId: "diag-seeded-go-06", status: "In progress" }),
]

export function findTicketById(id: string) {
  return SUPPORT_TICKETS.find((ticket) => ticket.id === id) ?? null
}
