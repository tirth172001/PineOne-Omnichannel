"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  BankIcon,
  CaretRightIcon,
  ClockIcon,
  CreditCardIcon,
  QrCodeIcon,
  TrendUpIcon,
} from "@phosphor-icons/react"
import { StatusPill } from "@/components/shared/status-pill"
import { Button } from "@/components/ui/button"
import { transactionRows, type PaymentMode } from "@/components/transactions/transactions-data"
import { cn } from "@/lib/utils"

const RANGE_STATS: Record<"today" | "yesterday", { total: string; successful: number; pending: number; failed: number; deltaPct: number }> = {
  today: { total: "₹1,35,000", successful: 30, pending: 3, failed: 2, deltaPct: 12 },
  yesterday: { total: "₹1,20,540", successful: 26, pending: 4, failed: 3, deltaPct: 8 },
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

const DISPUTE_STATS = {
  total: "₹18,400",
  open: 5,
  inReview: 2,
  closed: 7,
  href: "/disputes",
}

const PAYMENT_MODE_META: Record<PaymentMode, { label: string; icon: typeof QrCodeIcon }> = {
  upi: { label: "UPI", icon: QrCodeIcon },
  card: { label: "Card", icon: CreditCardIcon },
  netbanking: { label: "Net banking", icon: BankIcon },
}

function RangeToggle({ value, onChange }: { value: "today" | "yesterday"; onChange: (value: "today" | "yesterday") => void }) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-border/70 bg-muted p-0.5">
      {(["today", "yesterday"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "h-7 rounded-[6px] px-2.5 text-xs font-medium capitalize transition-colors",
            value === option ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

function CardHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-3">
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
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

function paymentModeIcon(mode: PaymentMode) {
  return PAYMENT_MODE_META[mode].icon
}

function TransactionsOverviewCard() {
  const [range, setRange] = useState<"today" | "yesterday">("today")
  const stats = RANGE_STATS[range]
  const recentTransactions = transactionRows.filter((row) => row.status.tone === "success").slice(0, 3)
  const totalCount = stats.successful + stats.pending + stats.failed

  return (
    <article className="rounded-[8px] border border-border/60 bg-background">
      <CardHeader title="Today’s payment" right={<RangeToggle value={range} onChange={setRange} />} />

      <div className="flex flex-wrap items-end justify-between gap-3 px-4 pb-4">
        <div>
          <p className="text-[28px] font-semibold leading-none text-foreground">{stats.total}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex h-6 items-center rounded-full bg-success/10 px-2.5 text-xs font-medium text-success">
              {totalCount} Transactions
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
              <TrendUpIcon className="h-3.5 w-3.5" weight="bold" />
              {stats.deltaPct}% since yesterday
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <StatusPill label={`${stats.successful} success`} tone="success" />
          <StatusPill label={`${stats.pending} pending`} tone="processing" />
          <StatusPill label={`${stats.failed} failed`} tone="failed" />
        </div>
      </div>

      <div className="border-t border-border/60">
        {recentTransactions.map((transaction, index) => {
          const Icon = paymentModeIcon(transaction.paymentMode)
          return (
            <div
              key={transaction.transactionId}
              className={cn("flex items-center gap-3 px-4 py-3", index > 0 && "border-t border-border/50")}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/70 bg-muted text-muted-foreground">
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">₹{transaction.amount.toLocaleString("en-IN")}</p>
                  <StatusPill label={transaction.status.label} tone={transaction.status.tone} />
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {transaction.date} &middot; {transaction.time}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <CardFooter label="Transaction history" href="/transactions" />
    </article>
  )
}

function SettlementsOverviewCard() {
  const [range, setRange] = useState<"today" | "yesterday">("today")
  const [settledBy, setSettledBy] = useState<"pinelabs" | "partner-bank">("pinelabs")
  const stats = SETTLEMENT_STATS[range][settledBy]

  return (
    <article className="rounded-[8px] border border-border/60 bg-background">
      <CardHeader title="Settlements" right={<RangeToggle value={range} onChange={setRange} />} />

      <div className="flex border-b border-border/60 px-4">
        {(["pinelabs", "partner-bank"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSettledBy(option)}
            className={cn(
              "flex-1 border-b-2 pb-2.5 text-center text-sm font-medium transition-colors",
              settledBy === option
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {option === "pinelabs" ? "By PineLabs" : "By partner bank"}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        <p className="text-[28px] font-semibold leading-none text-foreground">{stats.total}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="inline-flex h-6 items-center rounded-full bg-success/10 px-2.5 text-xs font-medium text-success">
            {stats.transactions} Transactions
          </span>
          <span className="inline-flex h-6 items-center rounded-full bg-muted px-2.5 text-xs font-medium text-foreground">
            {stats.settlements} Settlements
          </span>
        </div>
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

  return (
    <article className="rounded-[8px] border border-border/60 bg-background">
      <CardHeader title="Refunds" right={<RangeToggle value={range} onChange={setRange} />} />

      <div className="px-4 pb-4">
        <p className="text-[28px] font-semibold leading-none text-foreground">{stats.total}</p>
        <span className="mt-2.5 inline-flex h-6 items-center rounded-full bg-success/10 px-2.5 text-xs font-medium text-success">
          {stats.transactions} Transactions
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
        <p className="text-sm text-muted-foreground">View all refunds</p>
        <Button asChild type="button" variant="ghost" size="icon-sm" className="h-8 w-8 text-primary hover:text-primary">
          <Link href="/refunds" aria-label="View all refunds">
            <CaretRightIcon className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </article>
  )
}

function DisputesOverviewCard() {
  return (
    <article className="rounded-[8px] border border-border/60 bg-background">
      <CardHeader title="Disputes" />

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-4">
        <p className="text-[28px] font-semibold leading-none text-foreground">{DISPUTE_STATS.total}</p>

        <div className="flex items-center gap-1.5">
          <StatusPill label={`${DISPUTE_STATS.open} open`} tone="initiated" />
          <StatusPill label={`${DISPUTE_STATS.inReview} in review`} tone="processing" />
          <StatusPill label={`${DISPUTE_STATS.closed} closed`} tone="success" />
        </div>
      </div>

      <CardFooter label="Dispute history" href={DISPUTE_STATS.href} />
    </article>
  )
}

function PaymentModeDistributionCard() {
  const distribution = useMemo(() => {
    const totals: Record<PaymentMode, { count: number; amount: number }> = {
      upi: { count: 0, amount: 0 },
      card: { count: 0, amount: 0 },
      netbanking: { count: 0, amount: 0 },
    }
    for (const row of transactionRows) {
      totals[row.paymentMode].count += 1
      totals[row.paymentMode].amount += row.amount
    }
    const totalCount = transactionRows.length
    return (Object.keys(totals) as PaymentMode[])
      .map((mode) => ({
        mode,
        count: totals[mode].count,
        amount: totals[mode].amount,
        pct: totalCount === 0 ? 0 : Math.round((totals[mode].count / totalCount) * 100),
      }))
      .sort((a, b) => b.count - a.count)
  }, [])

  return (
    <article className="rounded-[8px] border border-border/60 bg-background">
      <CardHeader title="Payment mode distribution" />

      <div className="space-y-4 px-4 pb-4">
        {distribution.map(({ mode, count, amount, pct }) => {
          const meta = PAYMENT_MODE_META[mode]
          return (
            <div key={mode} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <meta.icon className="h-4 w-4 text-muted-foreground" />
                  {meta.label}
                </span>
                <span className="text-sm text-muted-foreground">
                  {count} txns &middot; <span className="font-medium text-foreground">₹{amount.toLocaleString("en-IN")}</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-muted-foreground/50" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      <CardFooter label="Payment mode breakdown" href="/transactions" />
    </article>
  )
}

export function OverviewDetailCards() {
  return (
    <section className="w-full space-y-4">
      <TransactionsOverviewCard />
      <PaymentModeDistributionCard />
      <SettlementsOverviewCard />
      <RefundsOverviewCard />
      <DisputesOverviewCard />
    </section>
  )
}
