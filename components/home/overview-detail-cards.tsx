"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowUUpLeftIcon,
  BankIcon,
  CaretRightIcon,
  ClockIcon,
  CreditCardIcon,
  DotsThreeCircleIcon,
  GavelIcon,
  InfoIcon,
  LightningIcon,
  LockIcon,
  MoneyWavyIcon,
  QrCodeIcon,
} from "@phosphor-icons/react"
import { LogoMark } from "@/components/brand/logo-mark"
import { disputeRecords, type DisputeStatus } from "@/components/disputes/disputes-data"
import { refundRows, type RefundStatus } from "@/components/refunds/refunds-content"
import { BankLogo } from "@/components/shared/bank-logo"
import { StatusPill, type StatusTone } from "@/components/shared/status-pill"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { transactionRows, type PaymentMode } from "@/components/transactions/transactions-data"
import {
  businessProfileAccessScope,
  businessProfileHasAnyPermission,
  useActiveBusinessProfile,
  type BusinessProfile,
} from "@/lib/business-profiles"
import { cn } from "@/lib/utils"

/** Which permission keys (from lib/role-permissions.ts) unlock each card below.
 *  Disputes has no dedicated permission in the catalog yet, so it rides on the
 *  Refunds permissions it's commercially closest to. */
const TRANSACTIONS_PERMISSIONS = ["offline:transactions", "online:view_all_transactions"]
const SETTLEMENTS_PERMISSIONS = ["offline:settlements", "online:view_settlement"]
const REFUNDS_PERMISSIONS = [
  "offline:refunds",
  "offline:refunds_view",
  "online:initiate_refund",
  "online:create_refund",
]

/** Two decimal places, Indian comma grouping — the treatment already used by the
 *  Settlements/Refunds summary totals below, applied everywhere a raw amount is
 *  formatted so every card's currency reads the same way. */
function formatInrAmount(value: number) {
  return value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const SETTLEMENT_STATS: Record<"today" | "yesterday", Record<"pinelabs" | "partner-bank", { total: string; transactions: number; settlements: number; lastSettlement: string }>> = {
  today: {
    pinelabs: { total: "₹1,84,567.72", transactions: 324, settlements: 8, lastSettlement: "4 Aug · 03:00 PM" },
    "partner-bank": { total: "₹42,180.00", transactions: 96, settlements: 3, lastSettlement: "4 Aug · 11:30 AM" },
  },
  yesterday: {
    pinelabs: { total: "₹1,62,300.00", transactions: 298, settlements: 7, lastSettlement: "3 Aug · 03:00 PM" },
    "partner-bank": { total: "₹38,940.00", transactions: 84, settlements: 3, lastSettlement: "3 Aug · 11:30 AM" },
  },
}

const REFUND_STATS: Record<"today" | "yesterday", { total: string; transactions: number }> = {
  today: { total: "₹3,567.00", transactions: 12 },
  yesterday: { total: "₹2,940.00", transactions: 9 },
}

const DISPUTE_STATS: Record<
  "today" | "yesterday",
  { total: string; open: number; inReview: number; closed: number }
> = {
  today: { total: "₹18,400.00", open: 5, inReview: 2, closed: 7 },
  yesterday: { total: "₹15,900.00", open: 4, inReview: 1, closed: 6 },
}

const DISPUTES_HREF = "/disputes"

const REFUND_STATUS_TONE: Record<RefundStatus, StatusTone> = {
  Pending: "processing",
  Success: "success",
  Failed: "failed",
  "Session expired": "failed",
  Cancelled: "failed",
  "User cancelled": "failed",
}

const DISPUTE_STATUS_TONE: Record<DisputeStatus, StatusTone> = {
  "Action pending": "initiated",
  Reviewing: "processing",
  Closed: "success",
}

/** Groups "Net banking" under the "Others" bucket shown in the design, with its
 *  own icon/color per slice of the payment-mode distribution chart. */
const PAY_METHOD_DISPLAY: Record<PaymentMode, { label: string; icon: typeof QrCodeIcon; color: string }> = {
  upi: { label: "UPI", icon: QrCodeIcon, color: "#a9d977" },
  card: { label: "Card", icon: CreditCardIcon, color: "#386663" },
  netbanking: { label: "Others", icon: DotsThreeCircleIcon, color: "#d9b3fb" },
}

/** No separate "yesterday" dataset exists yet for the payment-mode split — scale
 *  today's real distribution down to approximate a plausible day-over-day dip. */
const YESTERDAY_MODE_MULTIPLIER = 0.89

type PaymentStatusKey = "success" | "pending" | "failed"

const PAYMENT_STATUS_OPTIONS: ReadonlyArray<{ value: PaymentStatusKey; label: string }> = [
  { value: "success", label: "Success" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
]

/** "Initiated" has no dedicated tab here — it reads as in-progress, so it
 *  joins "Pending" the same way it would in a merchant's mental model. */
function paymentStatusBucket(tone: StatusTone): PaymentStatusKey {
  if (tone === "success") return "success"
  if (tone === "failed") return "failed"
  return "pending"
}

function RangeToggle<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: ReadonlyArray<{ value: T; label: string; icon?: React.ReactNode }>
}) {
  return (
    <div className="flex items-center gap-1 rounded-md bg-muted p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex h-6 items-center gap-1.5 rounded-[6px] px-2.5 text-xs font-medium transition-colors",
            value === option.value ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  )
}

const DAY_RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
] as const

const SETTLED_BY_OPTIONS = [
  { value: "pinelabs", label: "Pine Labs", icon: <LogoMark className="h-3.5 w-3.5 text-foreground" /> },
  { value: "partner-bank", label: "Partner Bank", icon: <BankLogo bank="HDFC" size={14} /> },
] as const

function CardHeader({
  title,
  icon: Icon,
  right,
}: {
  title: string
  icon?: typeof QrCodeIcon
  right?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      </div>
      {right}
    </div>
  )
}

function CardFooter({ label, href }: { label: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <Button asChild type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-primary hover:text-primary">
        <Link href={href}>
          View all
          <CaretRightIcon className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  )
}

/** Dims the trailing ".XX" of a formatted amount, matching the number-card
 *  style from Figma — the whole rupees read as the "real" number, the paise
 *  fade out. Works on any pre-formatted "₹1,84,567.72"-style string. */
function DimmedDecimalAmount({ value, className }: { value: string; className?: string }) {
  const dotIndex = value.lastIndexOf(".")
  if (dotIndex === -1) return <span className={cn("tabular-nums", className)}>{value}</span>
  return (
    <span className={cn("tabular-nums", className)}>
      {value.slice(0, dotIndex)}
      <span className="text-[14px] text-muted-foreground/50">{value.slice(dotIndex)}</span>
    </span>
  )
}

function TransactionsOverviewCard() {
  const [range, setRange] = useState<"today" | "yesterday">("today")
  const [statusFilter, setStatusFilter] = useState<PaymentStatusKey>("success")

  const todayStatusModeTotals = useMemo(() => {
    const emptyModeTotals = (): Record<PaymentMode, { count: number; amount: number }> => ({
      upi: { count: 0, amount: 0 },
      card: { count: 0, amount: 0 },
      netbanking: { count: 0, amount: 0 },
    })
    const totals: Record<PaymentStatusKey, Record<PaymentMode, { count: number; amount: number }>> = {
      success: emptyModeTotals(),
      pending: emptyModeTotals(),
      failed: emptyModeTotals(),
    }
    for (const row of transactionRows) {
      const bucket = paymentStatusBucket(row.status.tone)
      totals[bucket][row.paymentMode].count += 1
      totals[bucket][row.paymentMode].amount += row.amount
    }
    return totals
  }, [])

  const modeDistribution = useMemo(() => {
    const modes: PaymentMode[] = ["upi", "card", "netbanking"]
    const todayTotals = todayStatusModeTotals[statusFilter]
    const totals =
      range === "today"
        ? todayTotals
        : modes.reduce(
            (acc, mode) => {
              acc[mode] = {
                count: Math.round(todayTotals[mode].count * YESTERDAY_MODE_MULTIPLIER),
                amount: Math.round(todayTotals[mode].amount * YESTERDAY_MODE_MULTIPLIER),
              }
              return acc
            },
            {} as Record<PaymentMode, { count: number; amount: number }>
          )

    return modes
      .map((mode) => ({ mode, count: totals[mode].count, amount: totals[mode].amount }))
      .sort((a, b) => b.count - a.count)
  }, [range, statusFilter, todayStatusModeTotals])

  const modeTotalCount = modeDistribution.reduce((sum, { count }) => sum + count, 0)
  const modeTotalAmount = modeDistribution.reduce((sum, { amount }) => sum + amount, 0)

  return (
    <article className="rounded-[8px] border border-border/60 bg-background">
      <CardHeader
        title="Payments"
        icon={MoneyWavyIcon}
        right={<RangeToggle value={range} onChange={setRange} options={DAY_RANGE_OPTIONS} />}
      />

      <div className="flex justify-center border-t border-border/60 px-4 py-4">
        <RangeToggle value={statusFilter} onChange={setStatusFilter} options={PAYMENT_STATUS_OPTIONS} />
      </div>

      <div className="flex flex-col items-center px-4 py-6 text-center">
        <DimmedDecimalAmount
          value={`₹${formatInrAmount(modeTotalAmount)}`}
          className="text-[24px] font-semibold leading-none text-foreground"
        />
        <p className="mt-1 text-sm tabular-nums text-muted-foreground">{modeTotalCount} Transactions</p>
      </div>

      {modeTotalCount > 0 ? (
        <>
          <div className="px-4 py-4">
            <div className="flex h-8 w-full overflow-hidden rounded-md">
              {modeDistribution.map(({ mode, count, amount }) =>
                count > 0 ? (
                  <Tooltip key={mode}>
                    <TooltipTrigger asChild>
                      <div
                        className="h-full transition-opacity hover:opacity-80"
                        style={{
                          width: `${(count / modeTotalCount) * 100}%`,
                          backgroundColor: PAY_METHOD_DISPLAY[mode].color,
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      {PAY_METHOD_DISPLAY[mode].label} · {Math.round((count / modeTotalCount) * 100)}% ·{" "}
                      {count} txns · ₹{formatInrAmount(amount)}
                    </TooltipContent>
                  </Tooltip>
                ) : null
              )}
            </div>
          </div>

          <div className="border-t border-border/60">
            {modeDistribution.map(({ mode, count, amount }, index) => {
              const meta = PAY_METHOD_DISPLAY[mode]
              return count > 0 ? (
                <Link
                  key={mode}
                  href="/transactions"
                  className={cn(
                    "flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40",
                    index > 0 && "border-t border-border/50"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <meta.icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <span className="shrink-0 text-sm font-medium text-foreground">{meta.label}</span>
                    <DimmedDecimalAmount
                      value={`₹${formatInrAmount(amount)}`}
                      className="truncate text-sm text-muted-foreground"
                    />
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-medium tabular-nums text-foreground">{count} Transactions</span>
                    <CaretRightIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ) : null
            })}
          </div>
        </>
      ) : (
        <p className="border-t border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
          No {PAYMENT_STATUS_OPTIONS.find((option) => option.value === statusFilter)?.label.toLowerCase()} transactions
          for this range.
        </p>
      )}

      <CardFooter label="Transaction history" href="/transactions" />
    </article>
  )
}

function SettlementsOverviewCard() {
  const profile = useActiveBusinessProfile()
  // Partner-bank settlement is an in-store/POS concept — online-only businesses
  // never see this source, so there's nothing to switch between for them.
  const showPartnerBankTab = businessProfileAccessScope(profile) !== "Online"

  const [range, setRange] = useState<"today" | "yesterday">("today")
  const [settledBy, setSettledBy] = useState<"pinelabs" | "partner-bank">("pinelabs")
  const stats = SETTLEMENT_STATS[range][showPartnerBankTab ? settledBy : "pinelabs"]

  return (
    <article className="rounded-[8px] border border-border/60 bg-background">
      <CardHeader
        title="Settlements"
        icon={BankIcon}
        right={<RangeToggle value={range} onChange={setRange} options={DAY_RANGE_OPTIONS} />}
      />

      {showPartnerBankTab ? (
        <div className="flex justify-center border-t border-border/60 px-4 py-4">
          <RangeToggle value={settledBy} onChange={setSettledBy} options={SETTLED_BY_OPTIONS} />
        </div>
      ) : null}

      <div
        className={cn(
          "flex flex-col items-center px-4 py-6 text-center",
          !showPartnerBankTab && "border-t border-border/60"
        )}
      >
        <DimmedDecimalAmount value={stats.total} className="text-[24px] font-semibold leading-none text-foreground" />
        <p className="mt-1 text-sm tabular-nums text-muted-foreground">
          {stats.transactions} Transactions · {stats.settlements} Settlements
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <ClockIcon className="h-4 w-4" />
          Last settlement time
          <span className="font-medium text-foreground">{stats.lastSettlement}</span>
        </p>
        <Button asChild type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-primary hover:text-primary">
          <Link href="/settlements">
            View all
            <CaretRightIcon className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </article>
  )
}

function RefundsOverviewCard() {
  const [range, setRange] = useState<"today" | "yesterday">("today")
  const stats = REFUND_STATS[range]
  const recentRefunds = refundRows.slice(0, 3)

  return (
    <article className="rounded-[8px] border border-border/60 bg-background">
      <CardHeader
        title="Refunds"
        icon={ArrowUUpLeftIcon}
        right={<RangeToggle value={range} onChange={setRange} options={DAY_RANGE_OPTIONS} />}
      />

      <div className="flex flex-col items-center border-t border-border/60 px-4 py-6 text-center">
        <DimmedDecimalAmount value={stats.total} className="text-[24px] font-semibold leading-none text-foreground" />
        <p className="mt-1 text-sm tabular-nums text-muted-foreground">{stats.transactions} Transactions</p>
      </div>

      <div className="border-t border-border/60">
        {recentRefunds.map((row, index) => (
          <Link
            key={row.id}
            href="/refunds"
            className={cn(
              "flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40",
              index > 0 && "border-t border-border/50"
            )}
          >
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-foreground">{row.refundId}</span>
              <span className="text-xs tabular-nums text-muted-foreground">{row.amount}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusPill label={row.status} tone={REFUND_STATUS_TONE[row.status]} />
              <CaretRightIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>

      <CardFooter label="View all refunds" href="/refunds" />
    </article>
  )
}

function DisputesOverviewCard() {
  const [range, setRange] = useState<"today" | "yesterday">("today")
  const stats = DISPUTE_STATS[range]
  const recentDisputes = disputeRecords.slice(0, 3)

  return (
    <article className="rounded-[8px] border border-border/60 bg-background">
      <CardHeader
        title="Disputes"
        icon={GavelIcon}
        right={<RangeToggle value={range} onChange={setRange} options={DAY_RANGE_OPTIONS} />}
      />

      <div className="flex flex-col items-center border-t border-border/60 px-4 py-6 text-center">
        <DimmedDecimalAmount value={stats.total} className="text-[24px] font-semibold leading-none text-foreground" />
        <p className="mt-1 text-sm tabular-nums text-muted-foreground">
          {stats.open} open · {stats.inReview} in review · {stats.closed} closed
        </p>
      </div>

      <div className="border-t border-border/60">
        {recentDisputes.map((row, index) => (
          <Link
            key={row.id}
            href={`/disputes/${row.id}`}
            className={cn(
              "flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40",
              index > 0 && "border-t border-border/50"
            )}
          >
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-foreground">{row.id}</span>
              <span className="text-xs tabular-nums text-muted-foreground">{row.amount}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusPill label={row.status} tone={DISPUTE_STATUS_TONE[row.status]} />
              <CaretRightIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>

      <CardFooter label="Dispute history" href={DISPUTES_HREF} />
    </article>
  )
}

function ScopeBanner({ profile }: { profile: BusinessProfile }) {
  const scope = businessProfileAccessScope(profile)
  const scopeLabel =
    scope === "In-store and Online" ? "in-store and online" : scope === "Online" ? "online" : "in-store"

  return (
    <div className="flex items-center gap-2 rounded-[8px] border border-border/60 bg-muted/40 px-3.5 py-2 text-xs text-muted-foreground">
      <InfoIcon className="h-3.5 w-3.5 shrink-0" />
      <span>
        Showing <span className="font-medium text-foreground">{scopeLabel}</span> payment data — based on your role
        as <span className="font-medium text-foreground">{profile.roleLabel}</span>.
      </span>
    </div>
  )
}

/** Same on-demand settlement callout shown on the Settlements page itself
 *  (v3-settlements-content.tsx), for in-store businesses only there too. */
function OnDemandSettlementBanner() {
  return (
    <div className="flex items-center gap-3 rounded-[8px] border border-border/60 bg-[#eef2ff] px-4 py-3 dark:bg-[#1a1f3a]">
      <LightningIcon className="h-5 w-5 shrink-0 text-[#4f46e5] dark:text-[#a5b4fc]" />
      <p className="min-w-0 flex-1 text-sm font-medium text-foreground">
        Get some settlement in your account today via On-Demand settlement
      </p>
      <Button variant="outline" size="sm" className="h-8 shrink-0 bg-background">
        Settle now
      </Button>
    </div>
  )
}

export function OverviewDetailCards() {
  const profile = useActiveBusinessProfile()

  const canViewTransactions = businessProfileHasAnyPermission(profile, TRANSACTIONS_PERMISSIONS)
  const canViewSettlements = businessProfileHasAnyPermission(profile, SETTLEMENTS_PERMISSIONS)
  const canViewRefunds = businessProfileHasAnyPermission(profile, REFUNDS_PERMISSIONS)

  const hasAnyCard = canViewTransactions || canViewSettlements || canViewRefunds
  // On-demand settlement is an in-store/POS concept, same gate the Settlements
  // page itself uses (channel === "in-store") for this banner.
  const showOnDemandSettlement = canViewSettlements && businessProfileAccessScope(profile) !== "Online"

  return (
    <section className="w-full space-y-4">
      <ScopeBanner profile={profile} />

      {canViewTransactions ? <TransactionsOverviewCard /> : null}
      {showOnDemandSettlement ? <OnDemandSettlementBanner /> : null}
      {canViewSettlements ? <SettlementsOverviewCard /> : null}
      {canViewRefunds ? <RefundsOverviewCard /> : null}
      {canViewRefunds ? <DisputesOverviewCard /> : null}

      {!hasAnyCard ? (
        <article className="flex items-center gap-3 rounded-[8px] border border-dashed border-border/70 bg-background px-4 py-6 text-sm text-muted-foreground">
          <LockIcon className="h-4 w-4 shrink-0" />
          Your current role ({profile.roleLabel}) doesn't have permission to view payment data here.
        </article>
      ) : null}
    </section>
  )
}
