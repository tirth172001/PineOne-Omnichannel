"use client"

import Link from "next/link"
import { useMemo, useState, type ReactNode } from "react"
import {
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  CircleIcon,
  CopyIcon,
  CreditCardIcon,
  DownloadIcon,
  InfoIcon,
  LightningIcon,
  QrCodeIcon,
  XCircleIcon,
} from "@phosphor-icons/react"
import { StatusPill } from "@/components/shared/status-pill"
import {
  ActivityTimelineSidepanel,
  type ActivityEvent,
  type ActivityEventTone,
  DetailSidepanelShell,
} from "@/components/shared/activity-timeline-sidepanel"
import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import type { TransactionRecord } from "@/components/transactions/transactions-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-MY")}`
}

function PaymentModeIcon({ mode }: { mode: TransactionRecord["paymentMode"] }) {
  const Icon = mode === "card" ? CreditCardIcon : QrCodeIcon
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
      <Icon className="h-8 w-8 text-primary-foreground" />
    </div>
  )
}

function DetailMetaPill({ label }: { label: string }) {
  return (
    <div className="inline-flex h-6 items-center gap-1 rounded-full border border-border/80 bg-background/80 px-2 text-xs text-foreground">
      <span>{label}</span>
      <CopyIcon className="h-3 w-3 text-muted-foreground" />
    </div>
  )
}

function ActivityItem({
  eventId,
  title,
  subtitle,
  icon,
  badge,
  onViewMore,
}: {
  eventId: string
  title: string
  subtitle: string
  icon: ReactNode
  badge?: string
  onViewMore: (eventId: string) => void
}) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-0 top-0.5">{icon}</div>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-foreground">{title}</p>
        {badge ? (
          <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-foreground">
            {badge}
          </span>
        ) : null}
      </div>
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-medium leading-6 text-foreground">{children}</h2>
}

function DetailField({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  )
}

function DetailSection({
  title,
  fields,
}: {
  title: string
  fields: Array<{ label: string; value: ReactNode }>
}) {
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

function getStatusGradientClass(tone: TransactionRecord["status"]["tone"]) {
  if (tone === "success") return "from-success/25 via-success/10 to-background"
  if (tone === "failed") return "from-destructive/25 via-destructive/10 to-background"
  if (tone === "processing") return "from-warning/25 via-warning/10 to-background"
  return "from-chart-3/25 via-chart-3/10 to-background"
}

export function TransactionDetailContent({
  transaction,
  detailChannel = "in-store",
}: {
  transaction: TransactionRecord
  detailChannel?: "in-store" | "online"
}) {
  const isOnlineDetail = detailChannel === "online"
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [activityPanelOpen, setActivityPanelOpen] = useState(false)
  const [refundPanelOpen, setRefundPanelOpen] = useState(false)
  const [refundAmountInput, setRefundAmountInput] = useState(String(transaction.amount))
  const [refundSubmitted, setRefundSubmitted] = useState(false)
  const [chargeSlipPanelOpen, setChargeSlipPanelOpen] = useState(false)
  const [chargeSlipType, setChargeSlipType] = useState<"merchant" | "customer">("merchant")
  const [productDetailPanelOpen, setProductDetailPanelOpen] = useState(false)

  const activityEvents = useMemo<ActivityEvent[]>(
    () =>
      isOnlineDetail
        ? [
            {
              id: "settlement-completed",
              title: "Settlement completed",
              timestamp: "27 Aug 2026, 10:00 AM",
              tone: "success",
              details: [
                { label: "Transaction ID", value: transaction.transactionId },
                { label: "Order ID", value: transaction.orderId },
                { label: "Settlement amount", value: formatInr(transaction.amount) },
                { label: "Status", value: "Completed" },
                { label: "Reference", value: "UTR-8273668191" },
              ],
            },
            {
              id: "payment-refund",
              title: "Payment refund",
              timestamp: "27 Aug 2026, 10:00 AM",
              tone: "processing",
              details: [
                { label: "Refund ID", value: "RFD-117903" },
                { label: "Transaction ID", value: transaction.transactionId },
                { label: "Refund amount", value: "₹5,000" },
                { label: "Initiated by", value: "Ops dashboard" },
                { label: "Current status", value: "Processing" },
              ],
            },
            {
              id: "payment-captured",
              title: "Payment captured",
              timestamp: "27 Aug 2026, 10:00 AM",
              tone: "success",
              badge: "UPI intent",
              details: [
                { label: "Payment mode", value: transaction.provider },
                { label: "Payment app", value: transaction.paymentLabel },
                { label: "Captured amount", value: formatInr(transaction.amount) },
                { label: "Gateway response", value: "Approved" },
                { label: "RRN", value: transaction.rrn },
              ],
            },
            {
              id: "payment-failed-upi",
              title: "Payment failed",
              timestamp: "27 Aug 2026, 10:00 AM",
              tone: "failed",
              badge: "UPI intent",
              details: [
                { label: "Failure stage", value: "Debit timeout" },
                { label: "Reason", value: "Issuer bank timeout" },
                { label: "Error code", value: "U17" },
                { label: "Retry advised", value: "Yes" },
                { label: "Merchant impact", value: "No debit captured" },
              ],
            },
            {
              id: "payment-failed-card",
              title: "Payment failed",
              timestamp: "27 Aug 2026, 10:00 AM",
              tone: "failed",
              badge: "xx5656 - Mastercard",
              details: [
                { label: "Card type", value: "Mastercard" },
                { label: "Last 4 digits", value: "5656" },
                { label: "Failure reason", value: "Insufficient funds" },
                { label: "Error source", value: "Issuer bank" },
                { label: "Auth status", value: "Declined" },
              ],
            },
            {
              id: "payment-initiated",
              title: "Payment initiated",
              timestamp: "27 Aug 2026, 10:00 AM",
              tone: "initiated",
              details: [
                { label: "Order ID", value: transaction.orderId },
                { label: "Initiated amount", value: formatInr(transaction.amount) },
                { label: "Mode", value: transaction.provider },
                { label: "Source", value: "Merchant checkout" },
                { label: "State", value: "Initiated" },
              ],
            },
          ]
        : transaction.status.tone === "failed"
        ? [
            {
              id: "payment-failed",
              title: "Payment failed",
              timestamp: `${transaction.date}, ${transaction.time}`,
              tone: "failed",
              badge: "UPI intent",
              details: [
                { label: "Failure stage", value: "Debit timeout" },
                { label: "Reason", value: "Issuer bank timeout" },
                { label: "Error code", value: "U17" },
                { label: "Retry advised", value: "Yes" },
                { label: "Transaction ID", value: transaction.transactionId },
              ],
            },
            {
              id: "payment-initiated",
              title: "Payment initiated",
              timestamp: `${transaction.date}, ${transaction.time}`,
              tone: "initiated",
              details: [
                { label: "Order ID", value: transaction.orderId },
                { label: "Initiated amount", value: formatInr(transaction.amount) },
                { label: "Mode", value: transaction.provider },
                { label: "Source", value: "Merchant checkout" },
                { label: "State", value: "Initiated" },
              ],
            },
          ]
        : [
            {
              id: "settlement-completed",
              title: "Settlement completed",
              timestamp: `${transaction.date}, ${transaction.time}`,
              tone: "success",
              details: [
                { label: "Transaction ID", value: transaction.transactionId },
                { label: "Order ID", value: transaction.orderId },
                { label: "Settlement amount", value: formatInr(transaction.amount) },
                { label: "Status", value: "Completed" },
                { label: "Reference", value: "UTR-8273668191" },
              ],
            },
            {
              id: "payment-refund",
              title: "Payment refund",
              timestamp: `${transaction.date}, ${transaction.time}`,
              tone: "processing",
              details: [
                { label: "Refund ID", value: "RFD-117903" },
                { label: "Transaction ID", value: transaction.transactionId },
                { label: "Refund amount", value: "₹5,000" },
                { label: "Initiated by", value: "Ops dashboard" },
                { label: "Current status", value: "Processing" },
              ],
            },
            {
              id: "payment-captured",
              title: "Payment captured",
              timestamp: `${transaction.date}, ${transaction.time}`,
              tone: "success",
              badge: "UPI intent",
              details: [
                { label: "Payment mode", value: transaction.provider },
                { label: "Payment app", value: transaction.paymentLabel },
                { label: "Captured amount", value: formatInr(transaction.amount) },
                { label: "Gateway response", value: "Approved" },
                { label: "RRN", value: transaction.rrn },
              ],
            },
            {
              id: "payment-initiated",
              title: "Payment initiated",
              timestamp: `${transaction.date}, ${transaction.time}`,
              tone: "initiated",
              details: [
                { label: "Order ID", value: transaction.orderId },
                { label: "Initiated amount", value: formatInr(transaction.amount) },
                { label: "Mode", value: transaction.provider },
                { label: "Source", value: "Merchant checkout" },
                { label: "State", value: "Initiated" },
              ],
            },
          ],
    [isOnlineDetail, transaction]
  )

  const selectedEvent = useMemo(
    () => activityEvents.find((event) => event.id === selectedEventId) ?? null,
    [activityEvents, selectedEventId]
  )
  const refundableAmount = transaction.amount
  const refundAmount = Number(refundAmountInput || "0")
  const isRefundAmountValid =
    Number.isFinite(refundAmount) && refundAmount > 0 && refundAmount <= refundableAmount
  const isPartialRefund = isRefundAmountValid && refundAmount < refundableAmount
  const chargeSlipFile = chargeSlipType === "merchant" ? "/charge-slips/merchant-slip.pdf" : "/charge-slips/customer-slip.pdf"
  const chargeSlipName = `${chargeSlipType}-chargeslip-${transaction.transactionId}.pdf`

  function openEventDetails(eventId: string) {
    setSelectedEventId(eventId)
    setActivityPanelOpen(true)
  }

  function openRefundPanel() {
    setRefundAmountInput(String(refundableAmount))
    setRefundSubmitted(false)
    setRefundPanelOpen(true)
  }

  function onRefundAmountChange(value: string) {
    const sanitized = value.replace(/[^\d]/g, "")
    setRefundAmountInput(sanitized)
  }

  function initiateRefund() {
    if (!isRefundAmountValid) return
    setRefundSubmitted(true)
  }

  function openProductDetailPanel() {
    setProductDetailPanelOpen(true)
  }

  function toneIcon(tone: ActivityEventTone) {
    if (tone === "success") return <CheckCircleIcon className="h-4 w-4 text-success" />
    if (tone === "failed") return <XCircleIcon className="h-4 w-4 text-destructive" />
    if (tone === "processing") return <ArrowCounterClockwiseIcon className="h-4 w-4 text-warning" />
    return <CircleIcon className="h-4 w-4 text-chart-4" />
  }

  return (
    <TransactionsPlatformShell>
      <div className="relative p-8">
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-[301px] bg-gradient-to-b ${getStatusGradientClass(transaction.status.tone)}`}
        />
        <div className="relative z-10 mx-auto w-full max-w-[1440px]">
          <div className="relative">
            <div className="relative">
                <div className="flex h-8 w-full items-center justify-between">
                <Button asChild variant="ghost" className="h-8 rounded-md px-2 text-xs text-foreground hover:bg-background/20">
                  <Link href="/transactions">
                    <ArrowLeftIcon className="mr-1 h-4 w-4" />
                    Back
                  </Link>
                </Button>
                <div className="flex items-center gap-3">
                  {!isOnlineDetail ? (
                    <Button variant="outline" className="h-8 text-xs" onClick={() => setChargeSlipPanelOpen(true)}>
                      View chargeslip / receipt
                    </Button>
                  ) : null}
                  <Button className="h-8 text-xs" onClick={openRefundPanel}>Refund transaction</Button>
                </div>
              </div>

              <div className="mt-8 h-[180px]">
                <PaymentModeIcon mode={transaction.paymentMode} />
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <p className="text-[36px] font-semibold leading-9 text-foreground">{formatInr(transaction.amount)}</p>
                  <StatusPill label={transaction.status.label} tone={transaction.status.tone} />
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Payment mode: {transaction.provider} <span className="mx-2 text-border">|</span>{" "}
                  {isOnlineDetail ? "Last updated on" : "Transaction on"}: {transaction.date}, {transaction.time}
                </p>
                {isOnlineDetail ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <DetailMetaPill label={`Transaction ID: ${transaction.transactionId}`} />
                    <DetailMetaPill label={`Order ID: ${transaction.orderId}`} />
                    <DetailMetaPill label={`Merchant ID: ${transaction.merchantId}`} />
                  </div>
                ) : null}
              </div>

              <div className="mt-6 h-px w-full bg-border/70" />

              <div className="mt-6 flex items-start gap-12">
                <div className="w-[744px] shrink-0">
                  {isOnlineDetail ? (
                    <>
                      <DetailSection
                        title="Customer details"
                        fields={[
                          { label: "Email", value: "tirth@setu.co" },
                          { label: "Mobile", value: "xx9747" },
                          { label: "VPA", value: "trvd17@ptyes" },
                        ]}
                      />

                      <div className="my-8 h-px w-full bg-border/70" />

                      <DetailSection
                        title="EMI details"
                        fields={[
                          { label: "Loan", value: "₹3,00,000 @ 16% (Low cost)" },
                          { label: "EMI", value: "₹30,000 × 3 months" },
                          { label: "EMI program", value: "Brand EMI" },
                        ]}
                      />

                      <div className="my-8 h-px w-full bg-border/70" />

                      <section className="space-y-6">
                        <h3 className="text-xl font-medium leading-6 text-foreground">Product details</h3>
                        <div className="space-y-3">
                          {[1, 2, 3].map((index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-[8px] border border-border px-4 py-3"
                            >
                              <p className="text-sm text-foreground">Product: GU9838238</p>
                              <button
                                type="button"
                                onClick={openProductDetailPanel}
                                className="inline-flex items-center gap-1 text-xs font-medium text-primary"
                              >
                                View details <CaretRightIcon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </section>
                    </>
                  ) : (
                    <>
                      <DetailSection
                        title="Transaction details"
                        fields={[
                          {
                            label: "Transaction ID",
                            value: (
                              <span className="inline-flex items-center gap-2">
                                {transaction.transactionId}
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

                      <div className="my-8 h-px w-full bg-border/70" />

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
                                {transaction.merchantId}
                                <CopyIcon className="h-4 w-4 text-muted-foreground" />
                              </span>
                            ),
                          },
                          { label: "Merchant VPA", value: "6352699747@ptyes" },
                          { label: "Host category", value: "1" },
                          { label: "Acquirer ID", value: "4" },
                          { label: "Amt in ₹", value: formatInr(transaction.amount) },
                          { label: "Batch ID", value: "1" },
                          { label: "RRN", value: transaction.rrn },
                        ]}
                      />

                      <div className="my-8 h-px w-full bg-border/70" />

                      <DetailSection
                        title="Customer details"
                        fields={[
                          { label: "Customer name", value: "Tirth Nehalkumar Trivedi" },
                          { label: "Payment mode ID", value: "6352699747@ptyes" },
                        ]}
                      />
                    </>
                  )}
                </div>

                <div className="h-[760px] w-px shrink-0 bg-border/70" />

                <div className="w-[328px] shrink-0 px-2 py-2">
                  <SectionTitle>Activity</SectionTitle>
                  <div className="relative mt-4 space-y-6">
                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border/70" />

                    {activityEvents.map((event) => (
                      <ActivityItem
                        key={event.id}
                        eventId={event.id}
                        title={event.title}
                        subtitle={event.timestamp}
                        icon={toneIcon(event.tone)}
                        badge={event.badge}
                        onViewMore={openEventDetails}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ActivityTimelineSidepanel
        open={activityPanelOpen}
        onOpenChange={setActivityPanelOpen}
        event={selectedEvent}
      />

      <DetailSidepanelShell open={productDetailPanelOpen} onOpenChange={setProductDetailPanelOpen} title="Product details">
        <div className="border-b border-muted px-6 py-6">
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Product code</p>
              <p className="text-sm text-foreground">PRD-11101</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Product IMEI</p>
              <p className="text-sm text-foreground">IMEI110110001936783</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Subvention</p>
              <div className="inline-flex items-center gap-1 text-sm text-foreground">
                <span>4.5% (₹3,000)</span>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Subvention type</p>
              <div className="inline-flex items-center gap-1 text-sm text-foreground">
                <LightningIcon className="h-4 w-4" />
                <span>Instant</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Discount</p>
              <p className="text-sm text-foreground">4.5% (₹3,000)</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Additional cashback</p>
              <p className="text-sm text-foreground">NA</p>
            </div>
          </div>
        </div>
      </DetailSidepanelShell>

      <DetailSidepanelShell open={refundPanelOpen} onOpenChange={setRefundPanelOpen} title="Refund transaction">
        <div className="flex min-h-full flex-col">
          <div className="space-y-4 border-b border-muted px-6 py-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Transaction ID</p>
              <p className="text-sm text-foreground">{transaction.transactionId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Refundable amount</p>
              <p className="text-[24px] font-semibold leading-8 text-foreground">{formatInr(refundableAmount)}</p>
            </div>
          </div>

          <div className="space-y-4 px-6 py-6">
            {refundSubmitted ? (
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-success/20 text-success">
                  <CheckCircleIcon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-center text-sm font-semibold text-foreground">Refund initiated</p>
                <p className="mt-1 text-center text-xs text-muted-foreground">
                  {formatInr(refundAmount)} {isPartialRefund ? "partial refund" : "full refund"} initiated for{" "}
                  {transaction.transactionId}.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="refund-amount" className="text-sm text-muted-foreground">
                    Refund amount
                  </label>
                  <Input
                    id="refund-amount"
                    inputMode="numeric"
                    value={refundAmountInput}
                    onChange={(event) => onRefundAmountChange(event.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
                {isPartialRefund ? (
                  <p className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs text-foreground">
                    You are initiating a partial refund of {formatInr(refundAmount)}.
                  </p>
                ) : null}
                {!isRefundAmountValid ? (
                  <p className="text-xs text-destructive">
                    Enter an amount between ₹1 and {formatInr(refundableAmount)}.
                  </p>
                ) : null}
                <Button className="w-full" disabled={!isRefundAmountValid} onClick={initiateRefund}>
                  {isPartialRefund ? "Initiate partial refund" : "Initiate full refund"}
                </Button>
              </>
            )}
          </div>
        </div>
      </DetailSidepanelShell>

      <DetailSidepanelShell open={chargeSlipPanelOpen} onOpenChange={setChargeSlipPanelOpen} title="Charge slip / Receipt">
        <div className="flex min-h-full flex-col">
          <Tabs value={chargeSlipType} onValueChange={(value) => setChargeSlipType(value as "merchant" | "customer")}>
            <div className="border-b border-muted px-6 py-4">
              <TabsList className="w-full">
                <TabsTrigger value="customer">Customer copy</TabsTrigger>
                <TabsTrigger value="merchant">Merchant copy</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 px-6 py-6">
              <TabsContent value="customer" className="h-full">
                <div className="h-full overflow-hidden rounded-md border border-border bg-background">
                  <iframe
                    src="/charge-slips/customer-slip.pdf#toolbar=0&navpanes=0&scrollbar=0"
                    className="h-full w-full"
                    title="Customer copy preview"
                  />
                </div>
              </TabsContent>

              <TabsContent value="merchant" className="h-full">
                <div className="h-full overflow-hidden rounded-md border border-border bg-background">
                  <iframe
                    src="/charge-slips/merchant-slip.pdf#toolbar=0&navpanes=0&scrollbar=0"
                    className="h-full w-full"
                    title="Merchant copy preview"
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="border-t border-muted px-6 py-4">
            <Button asChild className="w-full">
              <a href={chargeSlipFile} download={chargeSlipName}>
                <DownloadIcon className="mr-2 h-4 w-4" />
                Download chargeslip
              </a>
            </Button>
          </div>
        </div>
      </DetailSidepanelShell>
    </TransactionsPlatformShell>
  )
}
