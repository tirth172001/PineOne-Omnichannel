"use client"

/**
 * Design settled via wayfinder ticket 02-design-dispute-detail-page (variant A — "Receipt style"),
 * extended with the evidence-defense flow (banner states, evidence side panel, accept-dispute modal)
 * from the Figma "Omni-channel" dispute flow. The detail sections/activity/support footer mirror
 * TransactionDetailContent (components/transactions/transaction-detail-content.tsx) — Figma confirms
 * this is the same underlying transaction detail page with a dispute banner + dispute details layered on top.
 */

import { useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import {
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  CircleIcon,
  CopyIcon,
  CreditCardIcon,
  HeadsetIcon,
  LightningIcon,
  QrCodeIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"
import { StatusPill, type StatusTone } from "@/components/shared/status-pill"
import {
  ActivityTimelineSidepanel,
  type ActivityEvent,
  type ActivityEventTone,
} from "@/components/shared/activity-timeline-sidepanel"
import { Button } from "@/components/ui/button"
import type { DisputeRecord } from "@/components/disputes/disputes-data"
import {
  DisputeEvidencePanel,
  type EvidenceDocuments,
  type EvidenceFieldKey,
  type EvidencePanelMode,
} from "@/components/disputes/dispute-evidence-panel"
import { AcceptDisputeDialog } from "@/components/disputes/accept-dispute-dialog"

export type DisputeDetailRecord = DisputeRecord

type FlowState = "pending" | "submitted" | "rejected" | "won" | "lost"

const HERO_GRADIENT: Record<FlowState, string> = {
  pending: "from-amber-500/20 via-amber-500/8 to-background",
  rejected: "from-amber-500/20 via-amber-500/8 to-background",
  submitted: "from-sky-500/20 via-sky-500/8 to-background",
  won: "from-emerald-500/20 via-emerald-500/8 to-background",
  lost: "from-red-500/20 via-red-500/8 to-background",
}

const BANNER_ICON_TONE: Record<FlowState, string> = {
  pending: "text-amber-600",
  rejected: "text-amber-600",
  submitted: "text-sky-600",
  won: "text-emerald-600",
  lost: "text-red-600",
}

const STATUS_PILL: Record<FlowState, { label: string; tone: StatusTone }> = {
  pending: { label: "Response pending", tone: "processing" },
  rejected: { label: "Response pending", tone: "processing" },
  submitted: { label: "In review", tone: "initiated" },
  won: { label: "Won", tone: "success" },
  lost: { label: "Lost", tone: "failed" },
}

const DEFAULT_SUBMITTED_DOCUMENTS: EvidenceDocuments = {
  invoice: { fileName: "Invoice.pdf" },
  delivery: { fileName: "Delivery.pdf" },
  rebuttal: { fileName: "rebuttal_letter.pdf" },
  refund: { fileName: "refund_details.pdf" },
  additional: { fileName: "additional_documents.pdf" },
}

const DEFAULT_REJECTED_DOCUMENTS: EvidenceDocuments = {
  invoice: { fileName: "Invoice.pdf" },
  delivery: { fileName: "Delivery.pdf" },
  refund: { fileName: "refund_details.pdf" },
  additional: { fileName: "additional_documents.pdf" },
}

const REJECTED_FLAGGED_FIELD: EvidenceFieldKey = "rebuttal"

function initialFlowState(record: DisputeRecord): FlowState {
  if (record.status === "Closed") return record.outcome === "Won" ? "won" : "lost"
  if (record.status === "Reviewing") return "submitted"
  if (record.evidenceIssue) return "rejected"
  return "pending"
}

function initialDocuments(flowState: FlowState): EvidenceDocuments {
  if (flowState === "rejected") return DEFAULT_REJECTED_DOCUMENTS
  if (flowState === "submitted" || flowState === "won" || flowState === "lost") return DEFAULT_SUBMITTED_DOCUMENTS
  return {}
}

function PaymentModeIcon({ mode }: { mode: DisputeRecord["paymentMode"] }) {
  const Icon = mode === "card" ? CreditCardIcon : QrCodeIcon
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
      <Icon className="h-8 w-8 text-primary-foreground" />
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  )
}

function DetailSection({ title, fields }: { title: string; fields: Array<{ label: string; value: ReactNode }> }) {
  return (
    <section className="space-y-6">
      <h3 className="text-xl font-medium leading-6 text-foreground">{title}</h3>
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-3">
        {fields.map((field) => (
          <DetailField key={field.label} label={field.label} value={field.value} />
        ))}
      </div>
    </section>
  )
}

function ActivityItem({
  eventId,
  title,
  subtitle,
  icon,
  onViewMore,
}: {
  eventId: string
  title: string
  subtitle: string
  icon: ReactNode
  onViewMore: (eventId: string) => void
}) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-0 top-0.5">{icon}</div>
      <p className="text-sm text-foreground">{title}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
      <button
        type="button"
        onClick={() => onViewMore(eventId)}
        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary"
      >
        View details <CaretRightIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function DisputeStatusBanner({
  tone,
  message,
  badge,
  actions,
}: {
  tone: FlowState
  message: string
  badge?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3">
      <div className="flex flex-wrap items-center gap-2 text-sm text-foreground">
        <LightningIcon weight="fill" className={`h-4 w-4 shrink-0 ${BANNER_ICON_TONE[tone]}`} />
        <span>{message}</span>
        {badge ? (
          <span className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
            {badge}
          </span>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function DisputeDetailContent({ record }: { record: DisputeDetailRecord }) {
  const [flowState, setFlowState] = useState<FlowState>(() => initialFlowState(record))
  const [documents, setDocuments] = useState<EvidenceDocuments>(() => initialDocuments(initialFlowState(record)))
  const [comment, setComment] = useState("")
  const [panelOpen, setPanelOpen] = useState(false)
  const [panelMode, setPanelMode] = useState<EvidencePanelMode>("defend")
  const [acceptOpen, setAcceptOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [activityPanelOpen, setActivityPanelOpen] = useState(false)

  const activityEvents = useMemo<ActivityEvent[]>(
    () => [
      {
        id: "dispute-raised",
        title: "Dispute raised",
        timestamp: `${record.createdOn}, ${record.time}`,
        tone: "processing",
        details: [
          { label: "Dispute ID", value: record.id },
          { label: "Type", value: record.category },
          { label: "Reason", value: record.reason },
        ],
      },
      {
        id: "settlement-completed",
        title: "Settlement completed",
        timestamp: `${record.createdOn}, ${record.time}`,
        tone: "success",
        details: [
          { label: "Transaction ID", value: record.transactionId },
          { label: "Settlement amount", value: record.amount },
          { label: "Status", value: "Completed" },
        ],
      },
      {
        id: "payment-success",
        title: "Payment success",
        timestamp: `${record.createdOn}, ${record.time}`,
        tone: "success",
        details: [
          { label: "Payment mode", value: record.paymentLabel },
          { label: "Captured amount", value: record.amount },
          { label: "RRN", value: record.rrn },
        ],
      },
      {
        id: "payment-pending",
        title: "Payment pending",
        timestamp: `${record.createdOn}, ${record.time}`,
        tone: "processing",
        details: [
          { label: "Transaction ID", value: record.transactionId },
          { label: "Amount", value: record.amount },
          { label: "State", value: "Pending" },
        ],
      },
      {
        id: "payment-initiated",
        title: "Payment initiated",
        timestamp: `${record.createdOn}, ${record.time}`,
        tone: "initiated",
        details: [
          { label: "Transaction ID", value: record.transactionId },
          { label: "Initiated amount", value: record.amount },
          { label: "Mode", value: record.paymentLabel },
        ],
      },
    ],
    [record]
  )

  const selectedEvent = useMemo(
    () => activityEvents.find((event) => event.id === selectedEventId) ?? null,
    [activityEvents, selectedEventId]
  )

  function openEventDetails(eventId: string) {
    setSelectedEventId(eventId)
    setActivityPanelOpen(true)
  }

  function toneIcon(tone: ActivityEventTone) {
    if (tone === "success") return <CheckCircleIcon className="h-4 w-4 text-success" />
    if (tone === "processing") return <ArrowCounterClockwiseIcon className="h-4 w-4 text-warning" />
    return <CircleIcon className="h-4 w-4 text-chart-4" />
  }

  function openDefendPanel() {
    setPanelMode(flowState === "rejected" ? "reupload" : "defend")
    setPanelOpen(true)
  }

  function openViewPanel() {
    setPanelMode("view")
    setPanelOpen(true)
  }

  function handleEvidenceSubmit() {
    setFlowState("submitted")
    setPanelOpen(false)
    setComment("")
    toast.success("Documents submitted successfully")
  }

  function handleAcceptConfirm() {
    setFlowState("lost")
    toast.success("Dispute accepted — refund adjusted from your upcoming settlement.")
  }

  let bannerMessage = ""
  let bannerBadge: string | undefined
  let bannerActions: ReactNode = null

  if (flowState === "pending") {
    bannerMessage = `Dispute due on ${record.dueDate}`
    bannerBadge = `Due ${record.dueDate}`
    bannerActions = (
      <>
        <Button variant="outline" size="sm" onClick={() => setAcceptOpen(true)}>
          Accept
        </Button>
        <Button variant="outline" size="sm" onClick={openDefendPanel}>
          Defend
        </Button>
      </>
    )
  } else if (flowState === "submitted") {
    bannerMessage = "Documents uploaded successfully, our team is reviewing your documents"
    bannerActions = (
      <Button variant="outline" size="sm" onClick={openViewPanel}>
        View documents
      </Button>
    )
  } else if (flowState === "rejected") {
    bannerMessage = "Some documents are not visible please re-upload some documents"
    bannerActions = (
      <Button variant="outline" size="sm" onClick={openDefendPanel}>
        Re-upload documents
      </Button>
    )
  } else if (flowState === "won") {
    bannerMessage = "Disputes went in your favour, amount will be settled in the next settlement cycle"
  } else {
    bannerMessage = `You've accepted this dispute. ${record.amount} will be adjusted from your upcoming settlement.`
  }

  return (
    <div className="relative p-8">
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-[301px] bg-gradient-to-b ${HERO_GRADIENT[flowState]}`} />
      <div className="relative z-10 mx-auto w-full max-w-[1440px]">
        <div className="flex h-8 w-full items-center justify-between">
          <Button asChild variant="ghost" className="h-8 rounded-md px-2 text-xs text-foreground hover:bg-background/20">
            <Link href="/disputes">
              <ArrowLeftIcon className="mr-1 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        <div className="mt-6">
          <DisputeStatusBanner tone={flowState} message={bannerMessage} badge={bannerBadge} actions={bannerActions} />
        </div>

        <div className="mt-6 h-[140px]">
          <PaymentModeIcon mode={record.paymentMode} />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <p className="text-[36px] font-semibold leading-9 text-foreground">{record.amount}</p>
            <StatusPill label={STATUS_PILL[flowState].label} tone={STATUS_PILL[flowState].tone} />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Payment mode: {record.paymentLabel} <span className="mx-2 text-border">|</span> Transaction amount:{" "}
            {record.amount} <span className="mx-2 text-border">|</span> Transaction on: {record.createdOn}, {record.time}
          </p>
        </div>

        <div className="mt-6 h-px w-full bg-border/70" />

        <div className="mt-6 flex items-start gap-12">
          <div className="w-[744px] shrink-0 space-y-8">
            <DetailSection
              title="Dispute details"
              fields={[
                {
                  label: "Dispute ID",
                  value: (
                    <span className="inline-flex items-center gap-2">
                      {record.id}
                      <CopyIcon className="h-4 w-4 text-muted-foreground" />
                    </span>
                  ),
                },
                { label: "Type", value: record.category },
                { label: "Reason", value: record.reason },
              ]}
            />

            <div className="h-px w-full bg-border/70" />

            <DetailSection
              title="Transaction details"
              fields={[
                {
                  label: "Transaction ID",
                  value: (
                    <span className="inline-flex items-center gap-2">
                      {record.transactionId}
                      <CopyIcon className="h-4 w-4 text-muted-foreground" />
                    </span>
                  ),
                },
                { label: "Product", value: "POS" },
                { label: "Hardware model", value: "Paper POS" },
                { label: "TID", value: "97893918238" },
                { label: "Transaction type", value: "Sale" },
                { label: "Acquirer", value: "ICICI UPI" },
                { label: "POS ID", value: "497547594579" },
                { label: "Branch no", value: "NA" },
              ]}
            />

            <div className="h-px w-full bg-border/70" />

            <DetailSection
              title="Merchant details"
              fields={[
                { label: "Merchant name", value: "PineLabs Private limited" },
                { label: "Merchant city", value: "Noida" },
                { label: "Merchant store", value: "PineLabs - Noida branch" },
                { label: "Store city", value: "Noida" },
                {
                  label: "MID",
                  value: (
                    <span className="inline-flex items-center gap-2">
                      6352699747
                      <CopyIcon className="h-4 w-4 text-muted-foreground" />
                    </span>
                  ),
                },
                { label: "Merchant VPA", value: "6352699747@ptyes" },
                { label: "Host category", value: "1" },
                { label: "Acquirer ID", value: "4" },
                { label: "Amt in ₹", value: record.amount },
                { label: "Batch ID", value: "1" },
                { label: "RRN", value: record.rrn },
              ]}
            />

            <div className="h-px w-full bg-border/70" />

            <DetailSection
              title="Customer details"
              fields={[
                { label: "Customer name", value: "Tirth Nehalkumar Trivedi" },
                { label: "Payment mode ID", value: "6352699747@ptyes" },
              ]}
            />
          </div>

          <div className="h-[760px] w-px shrink-0 bg-border/70" />

          <div className="w-[328px] shrink-0 px-2 py-2">
            <h2 className="text-xl font-medium leading-6 text-foreground">Activity</h2>
            <div className="relative mt-4 space-y-6">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border/70" />
              {activityEvents.map((event) => (
                <ActivityItem
                  key={event.id}
                  eventId={event.id}
                  title={event.title}
                  subtitle={event.timestamp}
                  icon={
                    event.id === "dispute-raised" ? (
                      <LightningIcon weight="fill" className="h-4 w-4 text-amber-600" />
                    ) : (
                      toneIcon(event.tone)
                    )
                  }
                  onViewMore={openEventDetails}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 h-px w-full bg-border/70" />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
              <HeadsetIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Need help with this dispute?</p>
              <p className="text-sm text-muted-foreground">Our support team is available 24x7 to assist you with any questions</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Contact us
          </Button>
        </div>
      </div>

      <DisputeEvidencePanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        mode={panelMode}
        amount={record.amount.replace(/[^\d,]/g, "")}
        documents={documents}
        onDocumentsChange={setDocuments}
        flaggedField={flowState === "rejected" ? REJECTED_FLAGGED_FIELD : null}
        issueMessage={record.evidenceIssue}
        comment={comment}
        onCommentChange={setComment}
        onSubmit={handleEvidenceSubmit}
      />

      <AcceptDisputeDialog open={acceptOpen} onOpenChange={setAcceptOpen} amount={record.amount} onConfirm={handleAcceptConfirm} />

      <ActivityTimelineSidepanel open={activityPanelOpen} onOpenChange={setActivityPanelOpen} event={selectedEvent} />
    </div>
  )
}
