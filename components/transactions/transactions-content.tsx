"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  DownloadIcon,
  EnvelopeSimpleIcon,
  SlidersHorizontalIcon,
  WalletIcon,
  XIcon,
} from "@phosphor-icons/react"
import {
  getDefaultDateRangePresets,
  useDateRangeFilter,
  type DateRangePreset,
} from "@/components/shared/date-range-filter"
import {
  LINE_TAB_TRIGGER_CLASSES,
  LINE_TABS_LIST_CLASSES,
  ListingPageHeader,
  ListingToolbar,
  type ListingFilter,
} from "@/components/shared/listing-page-primitives"
import { useMoreFiltersPanel, type MoreFilterCategory } from "@/components/shared/more-filters-panel"
import { DetailSidepanelShell } from "@/components/shared/activity-timeline-sidepanel"
import { SummaryCardGroup, type SummaryCardItem } from "@/components/shared/summary-card-group"
import { StatusPill } from "@/components/shared/status-pill"
import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import { transactionRows } from "@/components/transactions/transactions-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ListingMode = "in-store" | "online"
type OnlineView = "order" | "payments"
type StatusFilter =
  | "all"
  | "pending"
  | "success"
  | "failed"
  | "processing"
  | "initiated"
  | "cancelled"
  | "session-expired"
  | "user-cancelled"

type MoreFilterOption = {
  id: string
  label: string
  description?: string
}

function formatInr(amount: number) {
  return `₹ ${amount.toLocaleString("en-MY")}`
}

function parseDisplayDate(date: string, time: string) {
  const primary = new Date(`${date} ${time}`)
  if (!Number.isNaN(primary.getTime())) return primary

  const fallback = new Date(`${date}, ${time}`)
  if (!Number.isNaN(fallback.getTime())) return fallback

  return null
}

function toStatusFilterKey(label: string): StatusFilter {
  const value = label.toLowerCase()
  if (value.includes("session expired")) return "session-expired"
  if (value.includes("user cancelled")) return "user-cancelled"
  if (value.includes("cancel")) return "cancelled"
  if (value.includes("processing")) return "processing"
  if (value.includes("initiated")) return "initiated"
  if (value.includes("pending")) return "pending"
  if (value.includes("success")) return "success"
  return "failed"
}


export function TransactionsContent() {
  const router = useRouter()

  const [mode, setMode] = useState<ListingMode>("in-store")
  const [onlineView, setOnlineView] = useState<OnlineView>("order")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [paymentModeFilter, setPaymentModeFilter] = useState<"all" | "upi" | "card" | "netbanking">("all")
  const [providerFilter, setProviderFilter] = useState<string>("all")
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<"all" | "order" | "payment">("all")
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [emailPanelOpen, setEmailPanelOpen] = useState(false)
  const [emailDraft, setEmailDraft] = useState("")
  const [addedEmailIds, setAddedEmailIds] = useState(["tirth@setu.co", "passport130872@gmail.com"])

  const suggestedEmailIds = useMemo(
    () => [
      "tirthtrivedi17@gmail.com",
      "jane.doe@example.com",
      "john.smith@mail.com",
      "alice.jones@domain.com",
      "bob.brown@service.org",
    ],
    []
  )

  const modeRows = useMemo(() => {
    const targetType =
      mode === "in-store" ? "Payment" : onlineView === "order" ? "Order" : "Payment"
    return transactionRows.filter((row) => row.transactionType === targetType)
  }, [mode, onlineView])

  const latestDate = useMemo(() => {
    const timestamps = modeRows
      .map((row) => parseDisplayDate(row.date, row.time)?.getTime() ?? Number.NEGATIVE_INFINITY)
      .filter((value) => Number.isFinite(value))

    if (!timestamps.length) return null
    return new Date(Math.max(...timestamps))
  }, [modeRows])

  const storeOptions = useMemo<MoreFilterOption[]>(() => {
    const seen = new Map<string, string>()
    modeRows.forEach((row) => {
      if (!seen.has(row.storeName)) seen.set(row.storeName, row.storeAddress)
    })

    return Array.from(seen.entries()).map(([label, description], index) => ({
      id: `store-${index}`,
      label,
      description,
    }))
  }, [modeRows])

  const moreFilterCategories: MoreFilterCategory[] = useMemo(
    () => [
      { id: "stores", label: "Stores", display: "card", selectionMode: "multi", options: storeOptions },
      {
        id: "payment-modes",
        label: "Payment modes",
        display: "card",
        selectionMode: "multi",
        options: [
          { id: "upi", label: "UPI" },
          { id: "card", label: "Card" },
          { id: "netbanking", label: "Net banking" },
        ],
      },
      {
        id: "hardware-id",
        label: "Hardware ID",
        display: "card",
        selectionMode: "multi",
        options: [
          { id: "hw-1001", label: "HW-1001" },
          { id: "hw-1002", label: "HW-1002" },
          { id: "hw-1003", label: "HW-1003" },
        ],
      },
      {
        id: "terminal-id",
        label: "Terminal ID (TID)",
        display: "card",
        selectionMode: "multi",
        options: [
          { id: "terminal-0", label: "97893918238" },
          { id: "terminal-1", label: "97902118241" },
          { id: "terminal-2", label: "98010429157" },
          { id: "terminal-3", label: "98155281722" },
        ],
      },
      {
        id: "pos-id",
        label: "POS ID",
        display: "card",
        selectionMode: "multi",
        options: [
          { id: "pos-101", label: "495745794579" },
          { id: "pos-102", label: "495745794580" },
          { id: "pos-103", label: "495745794581" },
        ],
      },
      {
        id: "transaction-modes",
        label: "Transaction modes",
        display: "card",
        selectionMode: "multi",
        options: [
          { id: "payment", label: "Payment" },
          { id: "order", label: "Order" },
        ],
      },
      {
        id: "zones",
        label: "Zones",
        display: "card",
        selectionMode: "multi",
        options: [
          { id: "north", label: "North" },
          { id: "south", label: "South" },
          { id: "west", label: "West" },
          { id: "east", label: "East" },
        ],
      },
      {
        id: "batch-status",
        label: "Batch status",
        display: "card",
        selectionMode: "multi",
        options: [
          { id: "open", label: "Open" },
          { id: "closed", label: "Closed" },
          { id: "settled", label: "Settled" },
        ],
      },
    ],
    [storeOptions]
  )

  const moreFilters = useMoreFiltersPanel(moreFilterCategories)

  const datePresets: DateRangePreset[] = useMemo(() => {
    if (!latestDate) return getDefaultDateRangePresets()
    return [
      { id: "today", label: "Today", getRange: () => ({ from: latestDate, to: latestDate }) },
      {
        id: "yesterday",
        label: "Yesterday",
        getRange: () => {
          const day = new Date(latestDate)
          day.setDate(day.getDate() - 1)
          return { from: day, to: day }
        },
      },
      {
        id: "week",
        label: "This week",
        getRange: () => {
          const from = new Date(latestDate)
          from.setDate(from.getDate() - 6)
          return { from, to: latestDate }
        },
      },
      {
        id: "30d",
        label: "Last 30 days",
        getRange: () => {
          const from = new Date(latestDate)
          from.setDate(from.getDate() - 29)
          return { from, to: latestDate }
        },
      },
      { id: "custom", label: "Custom" },
    ]
  }, [latestDate])
  const dateRangeFilter = useDateRangeFilter({ presets: datePresets, initialPresetId: "30d" })

  const filteredRows = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase()
    const storeNameCatalog = Array.from(new Set(modeRows.map((row) => row.storeName)))
    const appliedStores = moreFilters.applied.stores ?? []
    const appliedPaymentModes = moreFilters.applied["payment-modes"] ?? []
    const appliedTransactionModes = moreFilters.applied["transaction-modes"] ?? []
    const selectedStoreNames = appliedStores
      .map((id) => Number(id.replace("store-", "")))
      .map((index) => storeNameCatalog[index])
      .filter((value): value is string => Boolean(value))

    const appliedRange = dateRangeFilter.applied.range
    const windowStart = appliedRange?.from ? new Date(appliedRange.from) : null
    if (windowStart) windowStart.setHours(0, 0, 0, 0)
    const windowEnd = appliedRange?.to ? new Date(appliedRange.to) : windowStart
    if (windowEnd) windowEnd.setHours(23, 59, 59, 999)

    return modeRows.filter((row) => {
      if (statusFilter !== "all" && toStatusFilterKey(row.status.label) !== statusFilter) return false
      if (mode === "in-store" && selectedStoreNames.length && !selectedStoreNames.includes(row.storeName)) return false
      if (mode === "in-store" && appliedPaymentModes.length && !appliedPaymentModes.includes(row.paymentMode)) {
        return false
      }
      if (
        mode === "in-store" &&
        appliedTransactionModes.length &&
        !appliedTransactionModes.includes(row.transactionType.toLowerCase())
      ) {
        return false
      }
      if (mode === "online" && transactionTypeFilter !== "all") {
        const type = transactionTypeFilter === "order" ? "Order" : "Payment"
        if (row.transactionType !== type) return false
      }
      if (mode === "in-store" && paymentModeFilter !== "all" && row.paymentMode !== paymentModeFilter) return false
      if (mode === "in-store" && providerFilter !== "all" && row.provider !== providerFilter) return false

      if (windowStart && windowEnd) {
        const rowDate = parseDisplayDate(row.date, row.time)
        if (!rowDate || rowDate < windowStart || rowDate > windowEnd) return false
      }

      if (!normalizedQuery) return true

      const blob = [
        row.orderId,
        row.transactionId,
        row.merchantId,
        row.transactionType,
        row.rrn,
        row.storeName,
        row.storeAddress,
        row.paymentLabel,
        row.provider,
        row.date,
        row.time,
        row.status.label,
      ]
        .join(" ")
        .toLowerCase()

      return blob.includes(normalizedQuery)
    })
  }, [
    dateRangeFilter.applied,
    mode,
    modeRows,
    moreFilters.applied,
    paymentModeFilter,
    providerFilter,
    search,
    statusFilter,
    transactionTypeFilter,
  ])

  const summaryCards = useMemo<SummaryCardItem[]>(() => {
    const totalCount = filteredRows.length
    const totalVolume = filteredRows.reduce((sum, row) => sum + row.amount, 0)

    return [
      {
        icon: WalletIcon,
        label: "Total volume",
        value: (
          <>
            {formatInr(totalVolume)}
            <span className="text-sm font-medium text-muted-foreground">.00</span>
          </>
        ),
        subtext: `${totalCount} payments`,
      },
    ]
  }, [filteredRows])

  const paginationEnabled = true

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage))

  useEffect(() => {
    setPage(1)
  }, [
    dateRangeFilter.applied,
    mode,
    onlineView,
    paymentModeFilter,
    providerFilter,
    rowsPerPage,
    search,
    statusFilter,
    transactionTypeFilter,
  ])

  useEffect(() => {
    if (mode === "online") {
      setOnlineView("order")
      setTransactionTypeFilter("all")
      setPaymentModeFilter("all")
      setProviderFilter("all")
      moreFilters.toolbarProps.onMoreFiltersOpenChange(false)
    }
  }, [mode])

  const visibleRows = useMemo(() => {
    if (!paginationEnabled) return filteredRows
    const start = (page - 1) * rowsPerPage
    return filteredRows.slice(start, start + rowsPerPage)
  }, [filteredRows, page, rowsPerPage, paginationEnabled])

  const isOnlineByPayments = mode === "online" && onlineView === "payments"
  const tableColCount = isOnlineByPayments ? 8 : 7

  const statusOptions = useMemo(
    () => [
      { label: "Status", value: "all" },
      { label: "Pending", value: "pending" },
      { label: "Success", value: "success" },
      { label: "Failed", value: "failed" },
      { label: "Processing", value: "processing" },
      { label: "Initiated", value: "initiated" },
      { label: "Cancelled", value: "cancelled" },
      { label: "Session expired", value: "session-expired" },
      { label: "User cancelled", value: "user-cancelled" },
    ],
    []
  )

  const providerOptions = useMemo(() => {
    const options = Array.from(new Set(transactionRows.map((row) => row.provider))).sort((a, b) =>
      a.localeCompare(b)
    )
    return [{ label: "All providers", value: "all" }, ...options.map((option) => ({ label: option, value: option }))]
  }, [])

  const filters: ListingFilter[] = useMemo(() => {
    const sharedFilters: ListingFilter[] = [
      dateRangeFilter.filter,
      {
        id: "status",
        type: "select",
        label: "Status",
        value: statusFilter,
        onValueChange: (value) => setStatusFilter(value as StatusFilter),
        options: statusOptions,
      },
    ]

    if (mode === "online") {
      return [
        ...sharedFilters,
        {
          id: "transaction-type",
          type: "select",
          label: "Transaction type",
          value: transactionTypeFilter,
          onValueChange: (value) => setTransactionTypeFilter(value as "all" | "order" | "payment"),
          options: [
            { label: "All", value: "all" },
            { label: "Order", value: "order" },
            { label: "Payment", value: "payment" },
          ],
        },
      ]
    }

    return [
      ...sharedFilters,
      {
        id: "payment-mode",
        type: "select",
        label: "Payment mode",
        value: paymentModeFilter,
        onValueChange: (value) => setPaymentModeFilter(value as "all" | "upi" | "card" | "netbanking"),
        options: [
          { label: "All modes", value: "all" },
          { label: "UPI", value: "upi" },
          { label: "Card", value: "card" },
          { label: "Net banking", value: "netbanking" },
        ],
      },
      {
        id: "provider",
        type: "select",
        label: "Provider",
        value: providerFilter,
        onValueChange: (value) => setProviderFilter(value),
        options: providerOptions,
      },
    ]
  }, [
    dateRangeFilter.filter,
    mode,
    paymentModeFilter,
    providerFilter,
    providerOptions,
    statusFilter,
    statusOptions,
    transactionTypeFilter,
  ])

  const addEmailId = (email: string) => {
    const normalized = email.trim().toLowerCase()
    if (!normalized) return
    if (addedEmailIds.some((existing) => existing.toLowerCase() === normalized)) return
    setAddedEmailIds((current) => [...current, email.trim()])
    setEmailDraft("")
  }

  const removeEmailId = (email: string) => {
    setAddedEmailIds((current) => current.filter((item) => item !== email))
  }

  return (
    <TransactionsPlatformShell>
      <div className="tx-light-theme w-full bg-[var(--tx-surface-page,var(--background))]">
        <ListingPageHeader
          title="Payments"
          toggles={[
            { label: "In-store payments", value: "in-store" },
            { label: "Online payment", value: "online" },
          ]}
          activeToggle={mode}
          onToggleChange={(value) => setMode(value as ListingMode)}
          primaryAction={
            mode === "online" ? (
              <Button>
                Verify IMEI No
              </Button>
            ) : undefined
          }
          tabs={
            mode === "online" ? (
              <Tabs value={onlineView} onValueChange={(value) => setOnlineView(value as OnlineView)}>
                <TabsList variant="line" className={LINE_TABS_LIST_CLASSES}>
                  <TabsTrigger value="order" className={LINE_TAB_TRIGGER_CLASSES}>
                    By Order
                  </TabsTrigger>
                  <TabsTrigger value="payments" className={LINE_TAB_TRIGGER_CLASSES}>
                    By payments
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            ) : undefined
          }
        />

        <div className="space-y-6 px-8 pt-8 pb-8">
          <ListingToolbar
            className="px-0 py-0"
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={mode === "in-store" ? "Search by any ID" : "Search by any value"}
            filters={filters}
            moreFiltersCount={mode === "in-store" ? moreFilters.toolbarProps.moreFiltersCount : undefined}
            moreFiltersOpen={mode === "in-store" ? moreFilters.toolbarProps.moreFiltersOpen : undefined}
            moreFiltersActive={mode === "in-store" ? moreFilters.toolbarProps.moreFiltersActive : undefined}
            onMoreFiltersOpenChange={mode === "in-store" ? moreFilters.toolbarProps.onMoreFiltersOpenChange : undefined}
            moreFiltersContent={mode === "in-store" ? moreFilters.toolbarProps.moreFiltersContent : undefined}
            rightActions={
              mode === "online" ? (
                <>
                  <Button variant="ghost" className="rounded-[8px] px-2 text-primary hover:bg-transparent hover:text-primary">
                    <SlidersHorizontalIcon className="h-4 w-4" />
                    Customise columns
                  </Button>
                  <Button variant="outline" className="rounded-[8px] border-[var(--tx-border-strong,var(--border))] bg-[var(--tx-surface-panel,var(--background))]">
                    <DownloadIcon className="h-4 w-4" />
                    Download filtered
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="rounded-[8px] border-[var(--tx-border-strong,var(--border))] bg-[var(--tx-surface-panel,var(--background))]"
                    onClick={() => setEmailPanelOpen(true)}
                  >
                    <EnvelopeSimpleIcon className="h-4 w-4" />
                    Email filtered
                  </Button>
                  <Button variant="outline" className="rounded-[8px] border-[var(--tx-border-strong,var(--border))] bg-[var(--tx-surface-panel,var(--background))]">
                    <DownloadIcon className="h-4 w-4" />
                    Download filtered
                  </Button>
                </>
              )
            }
          />

          <SummaryCardGroup cards={summaryCards} />

          <section className="space-y-6">
            <div className="overflow-hidden rounded-[8px] border border-border bg-card">
              <div className="overflow-x-auto">
                <Table className="min-w-[68.75rem]">
                  <TableHeader>
                    <TableRow className="h-10 [&>th:first-child]:rounded-tl-[8px] [&>th:last-child]:rounded-tr-[8px]">
                      <TableHead className="px-4 text-sm font-medium text-muted-foreground">Order ID</TableHead>
                      <TableHead className="px-4 text-sm font-medium text-muted-foreground">Merchant ID</TableHead>
                      {isOnlineByPayments ? (
                        <TableHead className="px-4 text-sm font-medium text-muted-foreground">Transaction ID</TableHead>
                      ) : null}
                      <TableHead className="px-4 text-sm font-medium text-muted-foreground">Transaction type</TableHead>
                      <TableHead className="px-4 text-right text-sm font-medium text-muted-foreground">Amount</TableHead>
                      <TableHead className="px-4 text-sm font-medium text-muted-foreground">Payment mode</TableHead>
                      <TableHead className="px-4 text-sm font-medium text-muted-foreground">Created on</TableHead>
                      <TableHead className="px-4 text-sm font-medium text-muted-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleRows.map((row) => (
                      <TableRow
                        key={row.transactionId}
                        className="h-[4.5rem] cursor-pointer"
                        onClick={() =>
                          router.push(
                            `/transactions/${row.transactionId}?channel=${mode === "online" ? "online" : "in-store"}`
                          )
                        }
                      >
                        <TableCell className="px-4 text-sm text-foreground">{row.orderId}</TableCell>
                        <TableCell className="px-4 text-sm text-foreground">{row.merchantId}</TableCell>
                        {isOnlineByPayments ? (
                          <TableCell className="px-4 text-sm text-foreground">{row.transactionId}</TableCell>
                        ) : null}
                        <TableCell className="px-4 text-sm text-foreground">{row.transactionType}</TableCell>
                        <TableCell className="px-4 text-right text-sm font-medium text-foreground">{formatInr(row.amount)}</TableCell>
                        <TableCell className="px-4">
                          <div className="space-y-0.5">
                            <p className="text-sm text-foreground">{row.paymentLabel}</p>
                            <p className="text-xs text-[var(--tx-text-secondary,var(--muted-foreground))]">{row.provider}</p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="space-y-0.5">
                            <p className="text-sm text-foreground">{row.date}</p>
                            <p className="text-xs text-[var(--tx-text-secondary,var(--muted-foreground))]">{row.time}</p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4">
                          <StatusPill label={row.status.label} tone={row.status.tone} />
                        </TableCell>
                      </TableRow>
                    ))}

                    {!visibleRows.length ? (
                      <TableRow className="h-16">
                        <TableCell colSpan={tableColCount} className="px-4 text-sm text-muted-foreground">
                          No transactions found.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            </div>

            {paginationEnabled ? (
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <p className="text-xs text-[var(--tx-text-secondary,var(--muted-foreground))]">
                  0 of {filteredRows.length} row(s) selected.
                </p>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">Rows per page</span>
                    <Select
                      value={String(rowsPerPage)}
                      onValueChange={(value) => setRowsPerPage(Number(value))}
                    >
                      <SelectTrigger className="h-8 w-[72px] rounded-[8px] border-[var(--tx-border-strong,var(--border))] bg-[var(--tx-surface-panel,var(--background))] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <p className="text-xs font-medium text-foreground">
                    Page {page} of {totalPages}
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="h-8 w-8 rounded-[8px] border-[var(--tx-border-strong,var(--border))] bg-[var(--tx-surface-panel,var(--background))]"
                      onClick={() => setPage(1)}
                      disabled={page <= 1}
                    >
                      <CaretDoubleLeftIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="h-8 w-8 rounded-[8px] border-[var(--tx-border-strong,var(--border))] bg-[var(--tx-surface-panel,var(--background))]"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={page <= 1}
                    >
                      <CaretLeftIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="h-8 w-8 rounded-[8px] border-[var(--tx-border-strong,var(--border))] bg-[var(--tx-surface-panel,var(--background))]"
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                      disabled={page >= totalPages}
                    >
                      <CaretRightIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="h-8 w-8 rounded-[8px] border-[var(--tx-border-strong,var(--border))] bg-[var(--tx-surface-panel,var(--background))]"
                      onClick={() => setPage(totalPages)}
                      disabled={page >= totalPages}
                    >
                      <CaretDoubleRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <DetailSidepanelShell
        open={emailPanelOpen}
        onOpenChange={setEmailPanelOpen}
        title="Email transaction report"
      >
        <div className="flex min-h-full flex-col">
          <section className="border-b border-muted px-6 py-6">
            <h3 className="text-base font-semibold text-foreground">Email IDs</h3>
            <div className="mt-1 space-y-3">
              <div className="relative">
                <EnvelopeSimpleIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={emailDraft}
                  onChange={(event) => setEmailDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      addEmailId(emailDraft)
                    }
                  }}
                  placeholder="Enter email ID"
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedEmailIds.map((email) => (
                  <Badge key={email} asChild variant="outline">
                    <button type="button" onClick={() => addEmailId(email)}>
                      {email}
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </section>

          <section className="border-b border-muted px-6 py-6">
            <h3 className="text-base font-semibold text-foreground">Added email IDs</h3>
            <p className="mt-1 text-base font-normal text-muted-foreground">
              Email with transaction excel will be sent to all below email IDs
            </p>
            <div className="mt-3 space-y-3">
              {addedEmailIds.map((email) => (
                <div
                  key={email}
                  className="flex h-9 items-center justify-between rounded-lg border border-border/70 bg-muted/20 px-4"
                >
                  <span className="text-sm text-foreground">{email}</span>
                  <button
                    type="button"
                    onClick={() => removeEmailId(email)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                  >
                    <XIcon className="h-5 w-5" />
                    <span className="sr-only">Remove {email}</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          <div className="px-6 py-6">
            <Button>Send email</Button>
          </div>
        </div>
      </DetailSidepanelShell>
    </TransactionsPlatformShell>
  )
}
