"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowsCounterClockwiseIcon,
  BankIcon,
  CalendarXIcon,
  CaretRightIcon,
  CheckIcon,
  ClockIcon,
  CreditCardIcon,
  DotsThreeCircleIcon,
  LightningIcon,
  LockIcon,
  MagnifyingGlassIcon,
  MoneyWavyIcon,
  QrCodeIcon,
  TrayIcon,
} from "@phosphor-icons/react"
import { LogoMark } from "@/components/brand/logo-mark"
import { BankLogo } from "@/components/shared/bank-logo"
import type { FilterOption, ListingFilter } from "@/components/shared/listing-page-primitives"
import { StatusPill } from "@/components/shared/status-pill"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { transactionRows, type PaymentMode, type TransactionRecord } from "@/components/transactions/transactions-data"
import {
  businessProfileAccessScope,
  businessProfileHasAnyPermission,
  businessProfileStores,
  useActiveBusinessProfile,
  type BusinessProfile,
} from "@/lib/business-profiles"
import type { StoreRecord } from "@/lib/stores-data"
import { cn } from "@/lib/utils"

/** Which permission keys (from lib/role-permissions.ts) unlock each card below. */
export const TRANSACTIONS_PERMISSIONS = ["offline:transactions", "online:view_all_transactions"]
export const SETTLEMENTS_PERMISSIONS = ["offline:settlements", "online:view_settlement"]

/** Two decimal places, Indian comma grouping — the treatment already used by the
 *  Settlements/Refunds summary totals below, applied everywhere a raw amount is
 *  formatted so every card's currency reads the same way. */
export function formatInrAmount(value: number) {
  return value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function parseInrAmount(value: string) {
  return Number(value.replace(/[^0-9.-]/g, ""))
}

/** Today's settlement breakdown per settlement source — gross amount collected,
 *  the charges Pine Labs/the partner bank deduct before payout, the count of
 *  transactions folded into today's run, and the bank account the payout landed in.
 *  pendingAmount is money already collected today that hasn't been swept into a
 *  settlement batch yet (post settlement-cutoff transactions) — separate from
 *  netAmount, which is what's already landed in the bank. */
const SETTLEMENT_TODAY_STATS: Record<
  "pinelabs" | "partner-bank",
  {
    grossAmount: string
    charges: string
    netAmount: string
    transactionsConsidered: number
    settlements: number
    lastSettlement: string
    bank: string
    accountMasked: string
    pendingAmount: string
    pendingTransactions: number
    nextSettlement: string
  }
> = {
  pinelabs: {
    grossAmount: "₹1,89,419.90",
    charges: "₹4,852.18",
    netAmount: "₹1,84,567.72",
    transactionsConsidered: 324,
    settlements: 8,
    lastSettlement: "Today · 03:00 PM",
    bank: "HDFC",
    accountMasked: "HDFC Bank •••• 4821",
    pendingAmount: "₹52,340.18",
    pendingTransactions: 64,
    nextSettlement: "Tomorrow · 03:00 PM",
  },
  "partner-bank": {
    grossAmount: "₹43,120.00",
    charges: "₹940.00",
    netAmount: "₹42,180.00",
    transactionsConsidered: 96,
    settlements: 3,
    lastSettlement: "Today · 11:30 AM",
    bank: "ICICI",
    accountMasked: "ICICI Bank •••• 9204",
    pendingAmount: "₹11,860.00",
    pendingTransactions: 18,
    nextSettlement: "Tomorrow · 11:30 AM",
  },
}

/** Today's transactions are sampled from the front of the shared transactions
 *  dataset so the total and the "last 3" list below stay consistent with each
 *  other and with the rest of the app (same records power /transactions). */
const TODAY_TRANSACTIONS_SAMPLE_SIZE = 48
const RECENT_TRANSACTIONS_COUNT = 3

export type SettlementScenario = "normal" | "holiday" | "multi-bank"

/** A bank holiday (or a payout hold) means the settlement cycle simply didn't run
 *  today — the card should say so plainly rather than showing a misleading ₹0.
 *  Today's collections still pile up as pending, though, so that's worth
 *  surfacing (with an on-demand "Settle now" way to get it early). */
const HOLIDAY_SETTLEMENT_INFO = {
  reason: "Bank holiday — settlement cycle didn't run today",
  nextSettlement: "Resumes tomorrow · 03:00 PM",
  lastSettlement: "Yesterday · 03:00 PM",
  pendingAmount: "₹1,42,880.60",
  pendingTransactions: 211,
}

/** Some merchants split payouts across more than one bank account (e.g. a Pine
 *  Labs nodal account plus a couple of partner-bank accounts) — today's run
 *  landed money in three different places, so the card lists each instead of
 *  collapsing to one "Settled to" row. */
const MULTI_BANK_SETTLEMENT_TODAY = {
  netAmount: "₹2,26,747.72",
  transactionsConsidered: 420,
  settlements: 11,
  lastSettlement: "Today · 03:00 PM",
  pendingAmount: "₹38,210.00",
  pendingTransactions: 47,
  nextSettlement: "Tomorrow · 03:00 PM",
  banks: [
    { bank: "HDFC", accountMasked: "HDFC Bank •••• 4821", amount: "₹1,84,567.72" },
    { bank: "ICICI", accountMasked: "ICICI Bank •••• 9204", amount: "₹31,200.00" },
    { bank: "AXIS", accountMasked: "Axis Bank •••• 1163", amount: "₹10,980.00" },
  ],
}

/** Same segmented-pill toggle style as the view toggles in ListingPageHeader
 *  (components/shared/listing-page-primitives.tsx) — reused here via the real
 *  Tabs primitive instead of a hand-rolled div/button pill. */
export const OVERVIEW_TABS_LIST_CLASSES = "h-8 rounded-[8px] bg-muted p-1"
export const OVERVIEW_TABS_TRIGGER_CLASSES =
  "h-6 gap-1.5 rounded-[6px] border-transparent px-3 py-1 text-xs font-medium text-muted-foreground data-active:!border-transparent data-active:!bg-background data-active:!text-foreground"

export const DAY_RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last-7-days", label: "Last 7 days" },
] as const

export const CHANNEL_OPTIONS = [
  { value: "all", label: "All channels" },
  { value: "online", label: "Online" },
  { value: "in-store", label: "In-store" },
] as const
export type ChannelFilter = (typeof CHANNEL_OPTIONS)[number]["value"]

/** No online/in-store split exists on the shared transactions/settlement datasets
 *  yet, so the channel filter scales the aggregates instead of re-filtering rows —
 *  applied consistently everywhere a channel filter shows up on the overview. */
export const CHANNEL_MULTIPLIER: Record<ChannelFilter, number> = { all: 1, online: 0.57, "in-store": 0.43 }

/** Empty storeIds means "all stores" — the same convention used everywhere
 *  else in this file (useOverviewScope, StoreScopeNote, the cards below). */
export function filterTransactionsByStore(
  rows: TransactionRecord[],
  stores: StoreRecord[],
  storeIds: string[]
) {
  if (storeIds.length === 0) return rows
  const selectedNames = new Set(
    stores.filter((store) => storeIds.includes(store.storeId)).map((store) => store.name)
  )
  if (selectedNames.size === 0) return rows
  return rows.filter((row) => selectedNames.has(row.storeName))
}

const SETTLED_BY_OPTIONS = [
  { value: "pinelabs", label: "Pine Labs", icon: <LogoMark className="h-3.5 w-3.5 text-foreground" /> },
  { value: "partner-bank", label: "Partner Bank", icon: <BankLogo bank="HDFC" size={14} /> },
] as const

const PAY_MODE_ICON: Record<PaymentMode, typeof QrCodeIcon> = {
  upi: QrCodeIcon,
  card: CreditCardIcon,
  netbanking: DotsThreeCircleIcon,
}

export function CardHeader({
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

/** Dims the trailing ".XX" of a formatted amount, matching the number-card
 *  style from Figma — the whole rupees read as the "real" number, the paise
 *  fade out. Works on any pre-formatted "₹1,84,567.72"-style string. */
export function DimmedDecimalAmount({ value, className }: { value: string; className?: string }) {
  const dotIndex = value.lastIndexOf(".")
  if (dotIndex === -1) return <span className={cn("tabular-nums", className)}>{value}</span>
  return (
    <span className={cn("tabular-nums", className)}>
      {value.slice(0, dotIndex)}
      <span className="text-[14px] text-muted-foreground/50">{value.slice(dotIndex)}</span>
    </span>
  )
}

/** Empty storeIds means "all stores" — same convention as filterTransactionsByStore. */
function StoreScopeLabel({
  isMultiStore,
  storeIds,
  selectedStoreNames,
}: {
  isMultiStore: boolean
  storeIds: string[]
  selectedStoreNames: string[]
}) {
  if (storeIds.length === 1 && selectedStoreNames[0]) return <> · {selectedStoreNames[0]}</>
  if (storeIds.length > 1) return <> · {storeIds.length} stores</>
  if (isMultiStore) return <> · Across all stores</>
  return null
}

/** Sits under a section title (Overview / Analytics) and states plainly which
 *  store(s) data is being shown for — with an inline "Edit" link that opens a
 *  searchable, multi-select store picker rather than leaving a standing filter
 *  chip in the toolbar. Driven by useOverviewScope() so both sections agree on
 *  the same selection. */
export function StoreScopeNote({
  isMultiStore,
  stores,
  storeIds,
  onStoreIdsChange,
}: {
  isMultiStore: boolean
  stores: StoreRecord[]
  storeIds: string[]
  onStoreIdsChange: (storeIds: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [draftStoreIds, setDraftStoreIds] = useState<string[]>(storeIds)

  if (!isMultiStore) return null

  const selectedStoreNames = stores.filter((store) => storeIds.includes(store.storeId)).map((store) => store.name)
  const query = search.trim().toLowerCase()
  const filteredStores = query ? stores.filter((store) => store.name.toLowerCase().includes(query)) : stores
  const isAllSelected = draftStoreIds.length === 0

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setDraftStoreIds(storeIds)
      setSearch("")
    }
  }

  function toggleStore(storeId: string) {
    setDraftStoreIds((current) =>
      current.includes(storeId) ? current.filter((id) => id !== storeId) : [...current, storeId]
    )
  }

  function handleApply() {
    onStoreIdsChange(draftStoreIds)
    setOpen(false)
  }

  return (
    <>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>
          {storeIds.length === 0 ? (
            "Showing data across all stores"
          ) : storeIds.length === 1 ? (
            <>
              Showing data for <span className="font-medium text-foreground">{selectedStoreNames[0]}</span>
            </>
          ) : (
            <>
              Showing data for <span className="font-medium text-foreground">{storeIds.length} stores</span>
            </>
          )}
        </span>
        <button
          type="button"
          onClick={() => handleOpenChange(true)}
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          Change store
          <ArrowsCounterClockwiseIcon className="h-3.5 w-3.5" />
        </button>
      </p>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="gap-0 p-0 sm:max-w-[420px]">
          <DialogHeader className="px-4 pt-4 pb-3">
            <DialogTitle>Change stores</DialogTitle>
            <DialogDescription>Choose one or more stores to show data for.</DialogDescription>
          </DialogHeader>

          <div className="px-4 pb-3">
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search stores"
                className="h-9 pl-9"
              />
            </div>
          </div>

          <div className="max-h-[320px] overflow-y-auto px-2 pb-2">
            {!query ? (
              <button
                type="button"
                onClick={() => setDraftStoreIds([])}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                  isAllSelected && "bg-muted"
                )}
              >
                <span className={cn(isAllSelected ? "font-medium text-foreground" : "text-foreground")}>
                  All stores
                </span>
                {isAllSelected ? <CheckIcon className="h-4 w-4 shrink-0 text-primary" /> : null}
              </button>
            ) : null}

            {filteredStores.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">No stores match &quot;{search}&quot;.</p>
            ) : (
              filteredStores.map((store) => {
                const checked = draftStoreIds.includes(store.storeId)
                return (
                  <button
                    key={store.storeId}
                    type="button"
                    onClick={() => toggleStore(store.storeId)}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                  >
                    <Checkbox checked={checked} className="pointer-events-none" />
                    <span className="text-foreground">{store.name}</span>
                  </button>
                )
              })
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-overview-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {draftStoreIds.length === 0 ? "All stores" : `${draftStoreIds.length} selected`}
            </p>
            <Button type="button" size="sm" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function TransactionsOverviewCard({
  stores,
  isMultiStore,
  channel,
  showChannelFilter,
  storeIds,
  overrideTransactions,
}: {
  stores: StoreRecord[]
  isMultiStore: boolean
  channel: ChannelFilter
  showChannelFilter: boolean
  /** Empty array = all stores. */
  storeIds: string[]
  /** Lets the scenario preview page force an exact dataset (e.g. [] for the
   *  "no transactions yet today" empty state) instead of the live sample. */
  overrideTransactions?: TransactionRecord[]
}) {
  const selectedStoreNames = stores.filter((store) => storeIds.includes(store.storeId)).map((store) => store.name)

  const storeFilteredTransactions = useMemo(() => {
    if (overrideTransactions) return overrideTransactions
    return filterTransactionsByStore(transactionRows, stores, storeIds).slice(0, TODAY_TRANSACTIONS_SAMPLE_SIZE)
  }, [overrideTransactions, stores, storeIds])
  const channelScale = CHANNEL_MULTIPLIER[showChannelFilter ? channel : "all"]
  const recentTransactions = useMemo(
    () => storeFilteredTransactions.slice(0, RECENT_TRANSACTIONS_COUNT),
    [storeFilteredTransactions]
  )
  const todayTotalAmount = useMemo(
    () => Math.round(storeFilteredTransactions.reduce((sum, row) => sum + row.amount, 0) * channelScale),
    [storeFilteredTransactions, channelScale]
  )
  const todayTotalCount = Math.max(
    0,
    Math.round(storeFilteredTransactions.length * channelScale)
  )
  const failedCount = Math.max(
    0,
    Math.round(storeFilteredTransactions.filter((row) => row.status.tone === "failed").length * channelScale)
  )

  return (
    <article className="rounded-[8px] border border-overview-border bg-background">
      <CardHeader
        title="Today's payments"
        icon={MoneyWavyIcon}
        right={<span className="text-xs font-medium text-muted-foreground">Today</span>}
      />

      {todayTotalCount === 0 ? (
        <div className="flex flex-col items-center gap-2 border-t border-overview-border px-4 py-10 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <TrayIcon className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium text-foreground">No transactions yet today</p>
          <p className="max-w-[260px] text-xs text-muted-foreground">
            New transactions will show up here as customers pay
            <StoreScopeLabel isMultiStore={isMultiStore} storeIds={storeIds} selectedStoreNames={selectedStoreNames} />.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 divide-x divide-overview-border border-t border-overview-border">
          <div className="px-4 py-4">
            <DimmedDecimalAmount
              value={`₹${formatInrAmount(todayTotalAmount)}`}
              className="text-[24px] font-semibold leading-none text-foreground"
            />
            <p className="mt-1.5 text-sm tabular-nums text-muted-foreground">
              {todayTotalCount} payments
              {failedCount > 0 ? (
                <>
                  {" "}
                  · <span className="text-destructive">{failedCount} Failed</span>
                </>
              ) : null}
              <StoreScopeLabel isMultiStore={isMultiStore} storeIds={storeIds} selectedStoreNames={selectedStoreNames} />
            </p>
          </div>

          <div className="flex flex-col justify-center">
            {recentTransactions.map((row, index) => {
              const ModeIcon = PAY_MODE_ICON[row.paymentMode]
              return (
                <Link
                  key={row.transactionId}
                  href={`/transactions/${row.transactionId}`}
                  className={cn(
                    "flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40",
                    index > 0 && "border-t border-overview-border"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2 text-sm">
                    <ModeIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium tabular-nums text-foreground">₹{formatInrAmount(row.amount)}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{row.time}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusPill label={row.status.label} tone={row.status.tone} />
                    <CaretRightIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end border-t border-overview-border px-4 py-3">
        <Button asChild type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-primary hover:text-primary">
          <Link href="/transactions">
            View payment history
            <CaretRightIcon className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </article>
  )
}

/** Highlighted row showing money already collected that hasn't landed in the
 *  bank yet, with an on-demand "Settle now" way to pull it early — on-demand
 *  settlement is an in-store/POS concept, so the CTA is hidden for online-only
 *  merchants while the pending amount itself still shows for everyone. */
function PendingSettlementRow({
  amount,
  transactions,
  nextSettlement,
  showSettleNow,
}: {
  amount: string
  transactions: number
  nextSettlement?: string
  showSettleNow: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-overview-border bg-[#eef2ff] px-4 py-3 dark:bg-[#1a1f3a]">
      <div className="flex min-w-0 items-start gap-2.5">
        <LightningIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#4f46e5] dark:text-[#a5b4fc]" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {amount} <span className="font-normal text-muted-foreground">yet to settle</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {transactions} transactions{nextSettlement ? ` · Next settlement ${nextSettlement}` : ""}
          </p>
        </div>
      </div>
      {showSettleNow ? (
        <Button type="button" variant="outline" size="sm" className="h-8 shrink-0 bg-background">
          Settle now
        </Button>
      ) : null}
    </div>
  )
}

export function SettlementsOverviewCard({
  stores,
  isMultiStore,
  channel,
  showChannelFilter,
  storeIds,
  profile: profileOverride,
  scenario = "normal",
}: {
  stores: StoreRecord[]
  isMultiStore: boolean
  channel: ChannelFilter
  showChannelFilter: boolean
  /** Empty array = all stores. */
  storeIds: string[]
  /** Lets the scenario preview page force a profile without touching the
   *  global active-profile switcher. Falls back to the live profile. */
  profile?: BusinessProfile
  scenario?: SettlementScenario
}) {
  const liveProfile = useActiveBusinessProfile()
  const profile = profileOverride ?? liveProfile
  // Partner-bank settlement is an in-store/POS concept — online-only businesses
  // never see this source, so there's nothing to switch between for them.
  const showPartnerBankTab = scenario === "normal" && businessProfileAccessScope(profile) !== "Online"
  // On-demand settlement is also an in-store/POS concept, but independent of
  // scenario — it should still show up during a holiday or a multi-bank run.
  const showSettleNow = businessProfileAccessScope(profile) !== "Online"

  const [settledBy, setSettledBy] = useState<"pinelabs" | "partner-bank">("pinelabs")
  const baseStats = SETTLEMENT_TODAY_STATS[showPartnerBankTab ? settledBy : "pinelabs"]

  const storeScale = useMemo(() => {
    if (storeIds.length === 0) return 1
    const filtered = filterTransactionsByStore(transactionRows, stores, storeIds)
    return Math.max(filtered.length / Math.max(transactionRows.length, 1), 0.04)
  }, [stores, storeIds])
  const channelScale = CHANNEL_MULTIPLIER[showChannelFilter ? channel : "all"]
  const combinedScale = storeScale * channelScale

  const stats = useMemo(
    () => ({
      grossAmount: `₹${formatInrAmount(parseInrAmount(baseStats.grossAmount) * combinedScale)}`,
      charges: `₹${formatInrAmount(parseInrAmount(baseStats.charges) * combinedScale)}`,
      netAmount: `₹${formatInrAmount(parseInrAmount(baseStats.netAmount) * combinedScale)}`,
      transactionsConsidered: Math.max(1, Math.round(baseStats.transactionsConsidered * combinedScale)),
      settlements: Math.max(1, Math.round(baseStats.settlements * combinedScale)),
      lastSettlement: baseStats.lastSettlement,
      bank: baseStats.bank,
      accountMasked: baseStats.accountMasked,
      pendingAmount: `₹${formatInrAmount(parseInrAmount(baseStats.pendingAmount) * combinedScale)}`,
      pendingTransactions: Math.max(0, Math.round(baseStats.pendingTransactions * combinedScale)),
      nextSettlement: baseStats.nextSettlement,
    }),
    [baseStats, combinedScale]
  )

  if (scenario === "holiday") {
    return (
      <article className="rounded-[8px] border border-overview-border bg-background">
        <CardHeader
          title="Settlements"
          icon={BankIcon}
          right={<span className="text-xs font-medium text-muted-foreground">Today</span>}
        />

        <div className="flex flex-col items-center gap-2 border-t border-overview-border px-4 py-10 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CalendarXIcon className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium text-foreground">No settlement today</p>
          <p className="max-w-[280px] text-xs text-muted-foreground">
            {HOLIDAY_SETTLEMENT_INFO.reason}. {HOLIDAY_SETTLEMENT_INFO.nextSettlement}.
          </p>
        </div>

        <PendingSettlementRow
          amount={HOLIDAY_SETTLEMENT_INFO.pendingAmount}
          transactions={HOLIDAY_SETTLEMENT_INFO.pendingTransactions}
          showSettleNow={showSettleNow}
        />

        <div className="flex items-center justify-between gap-3 border-t border-overview-border px-4 py-3">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ClockIcon className="h-4 w-4" />
            Last settlement
            <span className="font-medium text-foreground">{HOLIDAY_SETTLEMENT_INFO.lastSettlement}</span>
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

  if (scenario === "multi-bank") {
    const multiBank = MULTI_BANK_SETTLEMENT_TODAY
    return (
      <article className="rounded-[8px] border border-overview-border bg-background">
        <CardHeader
          title="Settlements"
          icon={BankIcon}
          right={<span className="text-xs font-medium text-muted-foreground">Today</span>}
        />

        <div className="flex flex-col items-center border-t border-overview-border px-4 py-6 text-center">
          <DimmedDecimalAmount
            value={multiBank.netAmount}
            className="text-[24px] font-semibold leading-none text-foreground"
          />
          <p className="mt-1 text-sm tabular-nums text-muted-foreground">
            {multiBank.transactionsConsidered} Transactions considered · {multiBank.settlements} Settlements
          </p>
        </div>

        <div className="border-t border-overview-border">
          <p className="px-4 pt-3 pb-1 text-xs uppercase tracking-wide text-muted-foreground">
            Settled across {multiBank.banks.length} banks
          </p>
          {multiBank.banks.map((bank, index) => (
            <div
              key={bank.bank}
              className={cn(
                "flex items-center justify-between px-4 py-2.5 text-sm",
                index > 0 && "border-t border-overview-border"
              )}
            >
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <BankLogo bank={bank.bank} size={14} />
                {bank.accountMasked}
              </span>
              <DimmedDecimalAmount value={bank.amount} className="font-medium text-foreground" />
            </div>
          ))}
        </div>

        <PendingSettlementRow
          amount={multiBank.pendingAmount}
          transactions={multiBank.pendingTransactions}
          nextSettlement={multiBank.nextSettlement}
          showSettleNow={showSettleNow}
        />

        <div className="flex items-center justify-between gap-3 border-t border-overview-border px-4 py-3">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ClockIcon className="h-4 w-4" />
            Last settlement
            <span className="font-medium text-foreground">{multiBank.lastSettlement}</span>
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

  return (
    <article className="rounded-[8px] border border-overview-border bg-background">
      <CardHeader
        title="Today's settlement"
        icon={BankIcon}
        right={
          showPartnerBankTab ? (
            <Tabs value={settledBy} onValueChange={(value) => setSettledBy(value as "pinelabs" | "partner-bank")}>
              <TabsList className={OVERVIEW_TABS_LIST_CLASSES}>
                {SETTLED_BY_OPTIONS.map((option) => (
                  <TabsTrigger key={option.value} value={option.value} className={OVERVIEW_TABS_TRIGGER_CLASSES}>
                    {option.icon}
                    {option.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">Today</span>
          )
        }
      />

      <div className="grid grid-cols-2 divide-x divide-overview-border border-t border-overview-border">
        <div className="px-4 py-4">
          <DimmedDecimalAmount
            value={stats.netAmount}
            className="text-[24px] font-semibold leading-none text-foreground"
          />
          <p className="mt-1.5 text-sm tabular-nums text-muted-foreground">
            {stats.transactionsConsidered} payments · Last settlement {stats.lastSettlement}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between px-4 py-4 text-sm">
            <span className="text-muted-foreground">Yet to settle</span>
            <DimmedDecimalAmount value={stats.pendingAmount} className="font-medium text-foreground" />
          </div>
          <div className="flex items-center justify-between border-t border-overview-border px-4 py-4 text-sm">
            <span className="text-muted-foreground">Next settlement</span>
            <span className="font-medium text-foreground">{stats.nextSettlement}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-overview-border px-4 py-3">
        <Button asChild type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-primary hover:text-primary">
          <Link href="/settlements">
            View settlements history
            <CaretRightIcon className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </article>
  )
}

/** Shared store/channel scope for the overview page — the greeting row renders
 *  the filter controls themselves (so they sit in the same row as "Good
 *  morning, ..."), while OverviewDetailCards and OverviewAnalyticsSection each
 *  consume the resulting scope to filter/scale their own numbers. One hook so
 *  every consumer agrees on what "all stores" / "online" / etc. means. */
export function useOverviewScope() {
  const profile = useActiveBusinessProfile()
  const stores = useMemo(() => businessProfileStores(profile), [profile])
  const isMultiStore = stores.length > 1
  const showChannelFilter = businessProfileAccessScope(profile) === "In-store and Online"

  const [channel, setChannel] = useState<ChannelFilter>("all")
  /** Empty array = all stores — lets the picker support selecting more than
   *  one store at once instead of forcing a single choice. */
  const [storeIds, setStoreIds] = useState<string[]>([])

  const channelFilter: ListingFilter = {
    id: "channel",
    type: "select",
    label: "Channel",
    value: channel,
    onValueChange: (value) => setChannel(value as ChannelFilter),
    options: CHANNEL_OPTIONS.map((option): FilterOption => ({ label: option.label, value: option.value })),
  }

  const selectedStoreNames = stores.filter((store) => storeIds.includes(store.storeId)).map((store) => store.name)

  return {
    profile,
    stores,
    isMultiStore,
    showChannelFilter,
    channel,
    storeIds,
    setStoreIds,
    selectedStoreNames,
    channelFilter,
  }
}

/** Section 1 of the overview: today's Transactions and Settlements, stacked
 *  vertically so each card has the full width to itself. Both cards share the
 *  same store/channel filter — driven from the greeting row above, via
 *  useOverviewScope() — so they always describe the same slice of the
 *  business. */
export function OverviewDetailCards({
  stores,
  isMultiStore,
  showChannelFilter,
  channel,
  storeIds,
}: {
  stores: StoreRecord[]
  isMultiStore: boolean
  showChannelFilter: boolean
  channel: ChannelFilter
  storeIds: string[]
}) {
  const profile = useActiveBusinessProfile()
  const canViewTransactions = businessProfileHasAnyPermission(profile, TRANSACTIONS_PERMISSIONS)
  const canViewSettlements = businessProfileHasAnyPermission(profile, SETTLEMENTS_PERMISSIONS)
  const hasAnyCard = canViewTransactions || canViewSettlements

  return (
    <section className="w-full">
      {hasAnyCard ? (
        <div className="flex flex-col gap-4">
          {canViewTransactions ? (
            <TransactionsOverviewCard
              stores={stores}
              isMultiStore={isMultiStore}
              channel={channel}
              showChannelFilter={showChannelFilter}
              storeIds={storeIds}
            />
          ) : null}
          {canViewSettlements ? (
            <SettlementsOverviewCard
              stores={stores}
              isMultiStore={isMultiStore}
              channel={channel}
              showChannelFilter={showChannelFilter}
              storeIds={storeIds}
            />
          ) : null}
        </div>
      ) : (
        <article className="flex items-center gap-3 rounded-[8px] border border-dashed border-overview-border bg-background px-4 py-6 text-sm text-muted-foreground">
          <LockIcon className="h-4 w-4 shrink-0" />
          Your current role ({profile.roleLabel}) doesn't have permission to view payment data here.
        </article>
      )}
    </section>
  )
}
