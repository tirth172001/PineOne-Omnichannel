"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CaretDownIcon, MagnifyingGlassIcon } from "@phosphor-icons/react"
import type { DateRange } from "react-day-picker"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  Download,
  Mail,
  RefreshCcw,
  SlidersHorizontal,
  X,
} from "lucide-react"

import {
  ListingPageHeader,
  ListingSummaryCards,
  ListingToolbar,
  type ListingFilter,
} from "@/components/shared/listing-page-primitives"
import { DetailSidepanelShell } from "@/components/shared/activity-timeline-sidepanel"
import { StatusPill } from "@/components/shared/status-pill"
import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import { transactionRows } from "@/components/transactions/transactions-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
import { cn } from "@/lib/utils"

type ListingMode = "in-store" | "online"
type OnlineView = "order" | "payments"
type DateFilter = "today" | "7d" | "30d"
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

type MoreFilterCategoryKey =
  | "stores"
  | "payment-modes"
  | "hardware-id"
  | "terminal-id"
  | "pos-id"
  | "transaction-modes"
  | "zones"
  | "batch-status"

type MoreFilterOption = {
  id: string
  label: string
  description?: string
}

type MoreFilterSelections = Record<MoreFilterCategoryKey, string[]>

function formatInr(amount: number) {
  return `₹ ${amount.toLocaleString("en-IN")}`
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

function formatDateForInput(date?: Date) {
  if (!date) return ""
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function parseTimeParts(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/)
  if (!match) return { hour: "10", minute: "30", period: "AM" as "AM" | "PM" }
  return { hour: match[1], minute: match[2], period: match[3] as "AM" | "PM" }
}

function TimePickerPopover({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const { hour, minute, period } = parseTimeParts(value)

  const updateTime = (next: Partial<{ hour: string; minute: string; period: "AM" | "PM" }>) => {
    const nextHour = next.hour ?? hour
    const nextMinute = next.minute ?? minute
    const nextPeriod = next.period ?? period
    onChange(`${nextHour}:${nextMinute} ${nextPeriod}`)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start">
          <Clock3 className="h-4 w-4" />
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="w-auto p-3">
        <div className="flex items-center gap-2">
          <Select value={hour} onValueChange={(nextHour) => updateTime({ hour: nextHour })}>
            <SelectTrigger className="w-[72px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, idx) => {
                const hr = String(idx + 1)
                return (
                  <SelectItem key={hr} value={hr}>
                    {hr}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          <span className="text-sm text-muted-foreground">:</span>

          <Select value={minute} onValueChange={(nextMinute) => updateTime({ minute: nextMinute })}>
            <SelectTrigger className="w-[72px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["00", "15", "30", "45"].map((mm) => (
                <SelectItem key={mm} value={mm}>
                  {mm}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={period} onValueChange={(nextPeriod) => updateTime({ period: nextPeriod as "AM" | "PM" })}>
            <SelectTrigger className="w-[76px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function TransactionsContent() {
  const router = useRouter()

  const [mode, setMode] = useState<ListingMode>("in-store")
  const [onlineView, setOnlineView] = useState<OnlineView>("order")
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState<DateFilter>("today")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [paymentModeFilter, setPaymentModeFilter] = useState<"all" | "upi" | "card" | "netbanking">("all")
  const [providerFilter, setProviderFilter] = useState<string>("all")
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<"all" | "order" | "payment">("all")
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [dateOverlayOpen, setDateOverlayOpen] = useState(false)
  const [datePresetDraft, setDatePresetDraft] = useState<"today" | "yesterday" | "week" | "30d" | "custom">("today")
  const [datePresetApplied, setDatePresetApplied] = useState<"today" | "yesterday" | "week" | "30d" | "custom">("today")
  const [dateRangeDraft, setDateRangeDraft] = useState<DateRange | undefined>(() => {
    const from = new Date(2025, 0, 12)
    return { from, to: new Date(from) }
  })
  const [dateRangeApplied, setDateRangeApplied] = useState<DateRange | undefined>(() => {
    const from = new Date(2025, 0, 12)
    return { from, to: new Date(from) }
  })
  const [startTimeDraft, setStartTimeDraft] = useState("10:30 AM")
  const [endTimeDraft, setEndTimeDraft] = useState("10:30 AM")
  const [startTimeApplied, setStartTimeApplied] = useState("10:30 AM")
  const [endTimeApplied, setEndTimeApplied] = useState("10:30 AM")
  const [activeDateField, setActiveDateField] = useState<"start" | "end">("start")
  const [emailPanelOpen, setEmailPanelOpen] = useState(false)
  const [emailDraft, setEmailDraft] = useState("")
  const [addedEmailIds, setAddedEmailIds] = useState(["tirth@setu.co", "passport130872@gmail.com"])
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [activeMoreFilterKey, setActiveMoreFilterKey] = useState<MoreFilterCategoryKey>("stores")
  const [moreFilterSearch, setMoreFilterSearch] = useState("")

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

  const baseMoreFilterSelection: MoreFilterSelections = {
    stores: ["store-0"],
    "payment-modes": [],
    "hardware-id": [],
    "terminal-id": ["terminal-0", "terminal-1"],
    "pos-id": [],
    "transaction-modes": [],
    zones: [],
    "batch-status": [],
  }
  const [draftMoreFilters, setDraftMoreFilters] = useState(baseMoreFilterSelection)
  const [appliedMoreFilters, setAppliedMoreFilters] = useState(baseMoreFilterSelection)

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

  const filteredRows = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase()
    const storeNameCatalog = Array.from(new Set(modeRows.map((row) => row.storeName)))
    const selectedStoreNames = appliedMoreFilters.stores
      .map((id) => Number(id.replace("store-", "")))
      .map((index) => storeNameCatalog[index])
      .filter((value): value is string => Boolean(value))

    const windowStart =
      dateFilter === "today" && latestDate
        ? new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate(), 0, 0, 0)
        : dateFilter === "7d" && latestDate
          ? new Date(new Date(latestDate).setDate(latestDate.getDate() - 6))
          : dateFilter === "30d" && latestDate
            ? new Date(new Date(latestDate).setDate(latestDate.getDate() - 29))
            : null

    return modeRows.filter((row) => {
      if (statusFilter !== "all" && toStatusFilterKey(row.status.label) !== statusFilter) return false
      if (mode === "in-store" && selectedStoreNames.length && !selectedStoreNames.includes(row.storeName)) return false
      if (
        mode === "in-store" &&
        appliedMoreFilters["payment-modes"].length &&
        !appliedMoreFilters["payment-modes"].includes(row.paymentMode)
      ) {
        return false
      }
      if (
        mode === "in-store" &&
        appliedMoreFilters["transaction-modes"].length &&
        !appliedMoreFilters["transaction-modes"].includes(row.transactionType.toLowerCase())
      ) {
        return false
      }
      if (mode === "online" && transactionTypeFilter !== "all") {
        const type = transactionTypeFilter === "order" ? "Order" : "Payment"
        if (row.transactionType !== type) return false
      }
      if (mode === "in-store" && paymentModeFilter !== "all" && row.paymentMode !== paymentModeFilter) return false
      if (mode === "in-store" && providerFilter !== "all" && row.provider !== providerFilter) return false

      if (windowStart) {
        const rowDate = parseDisplayDate(row.date, row.time)
        if (!rowDate || rowDate < windowStart) return false
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
    appliedMoreFilters,
    dateFilter,
    latestDate,
    mode,
    modeRows,
    paymentModeFilter,
    providerFilter,
    search,
    statusFilter,
    transactionTypeFilter,
  ])

  const summaryCards = useMemo(() => {
    const totalCount = filteredRows.length
    const totalVolume = filteredRows.reduce((sum, row) => sum + row.amount, 0)

    return [
      { label: "Total volume", value: formatInr(totalVolume) },
      { label: "Total count", value: `${totalCount}` },
    ]
  }, [filteredRows])

  const dateLabel =
    datePresetApplied === "today"
      ? "Today"
      : datePresetApplied === "yesterday"
        ? "Yesterday"
        : datePresetApplied === "week"
          ? "This week"
          : datePresetApplied === "30d"
            ? "Last 30 days"
            : "Custom"
  const paginationEnabled = dateFilter === "30d"

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage))

  useEffect(() => {
    setPage(1)
  }, [
    dateFilter,
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
      setMoreFiltersOpen(false)
    }
  }, [mode])

  useEffect(() => {
    if (!moreFiltersOpen) return
    setDraftMoreFilters(appliedMoreFilters)
    setMoreFilterSearch("")
  }, [appliedMoreFilters, moreFiltersOpen])

  useEffect(() => {
    setMoreFilterSearch("")
  }, [activeMoreFilterKey])

  useEffect(() => {
    if (!dateOverlayOpen) return
    setDatePresetDraft(datePresetApplied)
    setDateRangeDraft(dateRangeApplied)
    setStartTimeDraft(startTimeApplied)
    setEndTimeDraft(endTimeApplied)
    setActiveDateField("start")
  }, [dateOverlayOpen, datePresetApplied, dateRangeApplied, startTimeApplied, endTimeApplied])

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

  const moreFilterCatalog = useMemo<Record<MoreFilterCategoryKey, { label: string; options: MoreFilterOption[] }>>(
    () => ({
      stores: { label: "Stores", options: storeOptions },
      "payment-modes": {
        label: "Payment modes",
        options: [
          { id: "upi", label: "UPI" },
          { id: "card", label: "Card" },
          { id: "netbanking", label: "Net banking" },
        ],
      },
      "hardware-id": {
        label: "Hardware ID",
        options: [
          { id: "hw-1001", label: "HW-1001" },
          { id: "hw-1002", label: "HW-1002" },
          { id: "hw-1003", label: "HW-1003" },
        ],
      },
      "terminal-id": {
        label: "Terminal ID (TID)",
        options: [
          { id: "terminal-0", label: "97893918238" },
          { id: "terminal-1", label: "97902118241" },
          { id: "terminal-2", label: "98010429157" },
          { id: "terminal-3", label: "98155281722" },
        ],
      },
      "pos-id": {
        label: "POS ID",
        options: [
          { id: "pos-101", label: "495745794579" },
          { id: "pos-102", label: "495745794580" },
          { id: "pos-103", label: "495745794581" },
        ],
      },
      "transaction-modes": {
        label: "Transaction modes",
        options: [
          { id: "payment", label: "Payment" },
          { id: "order", label: "Order" },
        ],
      },
      zones: {
        label: "Zones",
        options: [
          { id: "north", label: "North" },
          { id: "south", label: "South" },
          { id: "west", label: "West" },
          { id: "east", label: "East" },
        ],
      },
      "batch-status": {
        label: "Batch status",
        options: [
          { id: "open", label: "Open" },
          { id: "closed", label: "Closed" },
          { id: "settled", label: "Settled" },
        ],
      },
    }),
    [storeOptions]
  )

  const activeMoreFilter = moreFilterCatalog[activeMoreFilterKey]

  const filteredMoreFilterOptions = useMemo(() => {
    const query = moreFilterSearch.trim().toLowerCase()
    if (!query) return activeMoreFilter.options
    return activeMoreFilter.options.filter((option) => {
      const blob = `${option.label} ${option.description ?? ""}`.toLowerCase()
      return blob.includes(query)
    })
  }, [activeMoreFilter.options, moreFilterSearch])

  const selectedCountByCategory = useMemo(
    () =>
      (Object.keys(moreFilterCatalog) as MoreFilterCategoryKey[]).reduce<Record<MoreFilterCategoryKey, number>>(
        (acc, key) => {
          acc[key] = draftMoreFilters[key].length
          return acc
        },
        {
          stores: 0,
          "payment-modes": 0,
          "hardware-id": 0,
          "terminal-id": 0,
          "pos-id": 0,
          "transaction-modes": 0,
          zones: 0,
          "batch-status": 0,
        }
      ),
    [draftMoreFilters, moreFilterCatalog]
  )

  const totalAppliedMoreFilterCount = useMemo(
    () => Object.values(appliedMoreFilters).reduce((sum, values) => sum + values.length, 0),
    [appliedMoreFilters]
  )

  const isAllVisibleSelected =
    filteredMoreFilterOptions.length > 0 &&
    filteredMoreFilterOptions.every((option) => draftMoreFilters[activeMoreFilterKey].includes(option.id))

  const toggleMoreFilterOption = (category: MoreFilterCategoryKey, optionId: string) => {
    setDraftMoreFilters((current) => {
      const exists = current[category].includes(optionId)
      return {
        ...current,
        [category]: exists
          ? current[category].filter((id) => id !== optionId)
          : [...current[category], optionId],
      }
    })
  }

  const toggleSelectAllVisible = () => {
    setDraftMoreFilters((current) => {
      const currentSet = new Set(current[activeMoreFilterKey])
      const allSelected = filteredMoreFilterOptions.every((option) => currentSet.has(option.id))
      const next = allSelected
        ? current[activeMoreFilterKey].filter(
            (id) => !filteredMoreFilterOptions.some((option) => option.id === id)
          )
        : Array.from(new Set([...current[activeMoreFilterKey], ...filteredMoreFilterOptions.map((option) => option.id)]))

      return {
        ...current,
        [activeMoreFilterKey]: next,
      }
    })
  }

  const clearMoreFilters = () => {
    const cleared: MoreFilterSelections = {
      stores: [],
      "payment-modes": [],
      "hardware-id": [],
      "terminal-id": [],
      "pos-id": [],
      "transaction-modes": [],
      zones: [],
      "batch-status": [],
    }
    setDraftMoreFilters(cleared)
    setAppliedMoreFilters(cleared)
  }

  const applyMoreFilters = () => {
    setAppliedMoreFilters(draftMoreFilters)
    setMoreFiltersOpen(false)
  }

  const clearDateDraft = () => {
    setDatePresetDraft("today")
    const today = new Date()
    setDateRangeDraft({ from: today, to: today })
    setStartTimeDraft("10:30 AM")
    setEndTimeDraft("10:30 AM")
  }

  const applyDateDraft = () => {
    setDatePresetApplied(datePresetDraft)
    setDateRangeApplied(dateRangeDraft)
    setStartTimeApplied(startTimeDraft)
    setEndTimeApplied(endTimeDraft)
    if (datePresetDraft === "today") setDateFilter("today")
    if (datePresetDraft === "week") setDateFilter("7d")
    if (datePresetDraft === "30d") setDateFilter("30d")
    setDateOverlayOpen(false)
  }

  const moreFilterCategoryOrder: MoreFilterCategoryKey[] = [
    "stores",
    "payment-modes",
    "hardware-id",
    "terminal-id",
    "pos-id",
    "transaction-modes",
    "zones",
    "batch-status",
  ]

  const filters: ListingFilter[] = useMemo(() => {
    const datePresetItems: Array<{ key: "today" | "yesterday" | "week" | "30d" | "custom"; label: string }> = [
      { key: "today", label: "Today" },
      { key: "yesterday", label: "Yesterday" },
      { key: "week", label: "This week" },
      { key: "30d", label: "Last 30 days" },
      { key: "custom", label: "Custom" },
    ]

    const sharedFilters: ListingFilter[] = [
      {
        id: "date",
        type: "button",
        label: "",
        value: dateLabel,
        icon: <CalendarIcon className="h-4 w-4" />,
        active: dateOverlayOpen,
        showCaret: true,
        popoverOpen: dateOverlayOpen,
        onPopoverOpenChange: setDateOverlayOpen,
        popoverContentClassName: "w-[760px]",
        popoverContent: (
          <div className="overflow-hidden rounded-[12px] border border-[var(--tx-border-subtle,var(--border))] bg-[var(--tx-surface-panel,var(--sidebar))]">
            <div className="flex items-center justify-between p-3">
              <h3 className="text-[20px] font-semibold leading-7 text-foreground">Date range</h3>
              <div className="flex items-center gap-3">
                <Button variant="link" className="h-auto p-0 text-primary" onClick={clearDateDraft}>
                  Clear filter
                </Button>
                <Button onClick={applyDateDraft}>Apply</Button>
              </div>
            </div>
            <Separator />
            <div className="grid min-h-0 flex-1 grid-cols-[180px_1fr] gap-3 p-3">
              <div className="space-y-1">
                {datePresetItems.map((preset) => (
                  <Button
                    key={preset.key}
                    type="button"
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      datePresetDraft === preset.key ? "bg-accent text-foreground font-semibold hover:bg-accent" : ""
                    )}
                    onClick={() => {
                      setDatePresetDraft(preset.key)
                      const today = new Date()
                      if (preset.key === "today") {
                        setDateRangeDraft({ from: today, to: today })
                        setActiveDateField("start")
                      } else if (preset.key === "yesterday") {
                        const yesterday = new Date(today)
                        yesterday.setDate(today.getDate() - 1)
                        setDateRangeDraft({ from: yesterday, to: yesterday })
                        setActiveDateField("start")
                      } else if (preset.key === "week") {
                        const from = new Date(today)
                        from.setDate(today.getDate() - 6)
                        setDateRangeDraft({ from, to: today })
                        setActiveDateField("start")
                      } else if (preset.key === "30d") {
                        const from = new Date(today)
                        from.setDate(today.getDate() - 29)
                        setDateRangeDraft({ from, to: today })
                        setActiveDateField("start")
                      }
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              <div className="flex min-h-0 flex-col gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-base font-semibold text-foreground">Start date & time</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className={cn("justify-start", activeDateField === "start" ? "border-ring" : "")}
                        onClick={() => setActiveDateField("start")}
                      >
                        <CalendarIcon className="h-4 w-4" />
                        {formatDateForInput(dateRangeDraft?.from) || "Select date"}
                      </Button>
                      <TimePickerPopover value={startTimeDraft} onChange={setStartTimeDraft} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-base font-semibold text-foreground">End date & time</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className={cn("justify-start", activeDateField === "end" ? "border-ring" : "")}
                        onClick={() => setActiveDateField("end")}
                      >
                        <CalendarIcon className="h-4 w-4" />
                        {formatDateForInput(dateRangeDraft?.to) || "Select date"}
                      </Button>
                      <TimePickerPopover value={endTimeDraft} onChange={setEndTimeDraft} />
                    </div>
                  </div>
                </div>

                <div className="overflow-auto rounded-lg border border-[var(--tx-border-subtle,var(--border))] bg-[var(--tx-surface-panel,var(--background))] p-2">
                  <div className="mb-2 inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-foreground">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
                    Selecting {activeDateField === "start" ? "start date" : "end date"}
                  </div>
                  <Calendar
                    mode="single"
                    numberOfMonths={2}
                    selected={activeDateField === "start" ? dateRangeDraft?.from : dateRangeDraft?.to}
                    onSelect={(selectedDate) => {
                      if (!selectedDate) return
                      if (activeDateField === "start") {
                        setDateRangeDraft((current) => ({
                          from: selectedDate,
                          to: current?.to && current.to >= selectedDate ? current.to : selectedDate,
                        }))
                        setActiveDateField("end")
                      } else {
                        setDateRangeDraft((current) => ({
                          from: current?.from && current.from <= selectedDate ? current.from : selectedDate,
                          to: selectedDate,
                        }))
                      }
                      setDatePresetDraft("custom")
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ),
      },
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
    dateLabel,
    mode,
    paymentModeFilter,
    providerFilter,
    providerOptions,
    statusFilter,
    statusOptions,
    dateOverlayOpen,
    datePresetDraft,
    dateRangeDraft,
    startTimeDraft,
    endTimeDraft,
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
      <div className="tx-light-theme mx-auto w-full max-w-[1512px] bg-[var(--tx-surface-page,var(--background))]">
        <ListingPageHeader
          title="Transactions"
          toggles={[
            { label: "In-store payments", value: "in-store" },
            { label: "Online payment", value: "online" },
          ]}
          activeToggle={mode}
          onToggleChange={(value) => setMode(value as ListingMode)}
          primaryAction={
            mode === "online" ? (
              <Button className="rounded-[8px] border border-primary/60 bg-primary text-primary-foreground hover:bg-primary/90">
                Verify IMEI No
              </Button>
            ) : (
              <Button variant="outline" className="rounded-[8px] border-[var(--tx-border-strong,var(--border))] bg-[var(--tx-surface-panel,var(--background))]">
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
            )
          }
          tabs={
            mode === "online" ? (
              <Tabs value={onlineView} onValueChange={(value) => setOnlineView(value as OnlineView)}>
                <TabsList variant="line" className="h-8 gap-6 bg-transparent p-0">
                  <TabsTrigger
                    value="order"
                    className="h-8 rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent px-0 py-0 text-sm font-medium text-muted-foreground data-active:!border-x-0 data-active:!border-t-0 data-active:!border-b-2 data-active:!border-primary data-active:!bg-transparent data-active:!text-primary data-active:!shadow-none group-data-[variant=line]/tabs-list:data-active:after:opacity-0"
                  >
                    By Order
                  </TabsTrigger>
                  <TabsTrigger
                    value="payments"
                    className="h-8 rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent px-0 py-0 text-sm font-medium text-muted-foreground data-active:!border-x-0 data-active:!border-t-0 data-active:!border-b-2 data-active:!border-primary data-active:!bg-transparent data-active:!text-primary data-active:!shadow-none group-data-[variant=line]/tabs-list:data-active:after:opacity-0"
                  >
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
            onMoreFilters={() => undefined}
            moreFiltersCount={mode === "in-store" ? totalAppliedMoreFilterCount : undefined}
            moreFiltersOpen={mode === "in-store" ? moreFiltersOpen : undefined}
            moreFiltersActive={mode === "in-store" ? moreFiltersOpen : undefined}
            onMoreFiltersOpenChange={mode === "in-store" ? setMoreFiltersOpen : undefined}
            moreFiltersContent={
              mode === "in-store" ? (
                <div className="flex h-[620px] flex-col overflow-hidden rounded-[12px] border border-[var(--tx-border-subtle,var(--border))] bg-[var(--tx-surface-panel,var(--sidebar))]">
                  <div className="flex items-center justify-between px-3 py-3">
                    <h3 className="text-[20px] font-semibold leading-7 text-foreground">More filters</h3>
                    <div className="flex items-center gap-3">
                      <Button variant="link" className="h-auto p-0 text-primary" onClick={clearMoreFilters}>
                        Clear filter
                      </Button>
                      <Button onClick={applyMoreFilters}>Apply</Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid min-h-0 flex-1 grid-cols-[220px_1fr] gap-0 p-3">
                    <div className="pr-3">
                      <div className="space-y-1">
                        {moreFilterCategoryOrder.map((category) => {
                          const categoryMeta = moreFilterCatalog[category]
                          const count = selectedCountByCategory[category]
                          return (
                            <button
                              key={category}
                              type="button"
                              onClick={() => setActiveMoreFilterKey(category)}
                              className={cn(
                                "flex h-10 w-full items-center justify-between rounded-[8px] px-3 text-left text-sm font-normal text-foreground transition-colors",
                                activeMoreFilterKey === category
                                  ? "bg-accent text-foreground font-semibold"
                                  : "hover:bg-accent/70"
                              )}
                            >
                              <span>{categoryMeta.label}</span>
                              {count > 0 ? (
                                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-[var(--tx-surface-chip,var(--olive-surface-main))] px-1.5 text-xs font-medium text-[var(--tx-text-primary,var(--foreground))]">
                                  {count}
                                </span>
                              ) : null}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex min-h-0 flex-col pl-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-semibold text-foreground">{activeMoreFilter.label}</h4>
                        <Button variant="link" className="h-auto p-0 text-primary" onClick={toggleSelectAllVisible}>
                          {isAllVisibleSelected ? "Deselect all" : "Select all"}
                        </Button>
                      </div>

                      <div className="relative mt-3">
                        <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={moreFilterSearch}
                          onChange={(event) => setMoreFilterSearch(event.target.value)}
                          placeholder={`Search ${activeMoreFilter.label.toLowerCase()}`}
                          className="pl-9"
                        />
                      </div>

                      <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                        {filteredMoreFilterOptions.map((option) => {
                          const checked = draftMoreFilters[activeMoreFilterKey].includes(option.id)
                          return (
                            <label
                              key={option.id}
                              className={cn(
                                "flex cursor-pointer items-start justify-between rounded-[8px] border px-3 py-2",
                                checked
                                  ? "border-primary/70 bg-[var(--tx-surface-hover,var(--muted))]"
                                  : "border-[var(--tx-border-subtle,var(--border))] bg-transparent"
                              )}
                            >
                              <div className="min-w-0 pr-3">
                                <p className="truncate text-sm font-medium text-foreground">{option.label}</p>
                                {option.description ? (
                                  <p className="truncate text-sm text-muted-foreground">{option.description}</p>
                                ) : null}
                              </div>
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggleMoreFilterOption(activeMoreFilterKey, option.id)}
                                className="mt-1"
                              />
                            </label>
                          )
                        })}

                        {filteredMoreFilterOptions.length === 0 ? (
                          <div className="rounded-[8px] border border-dashed border-[var(--tx-border-subtle,var(--border))] p-4 text-sm text-[var(--tx-text-secondary,var(--muted-foreground))]">
                            No results found.
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ) : undefined
            }
            rightActions={
              mode === "online" ? (
                <>
                  <Button variant="ghost" className="rounded-[8px] px-2 text-primary hover:bg-transparent hover:text-primary">
                    <SlidersHorizontal className="h-4 w-4" />
                    Customise columns
                  </Button>
                  <Button variant="outline" className="rounded-[8px] border-[var(--tx-border-strong,var(--border))] bg-[var(--tx-surface-panel,var(--background))]">
                    <Download className="h-4 w-4" />
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
                    <Mail className="h-4 w-4" />
                    Email filtered
                  </Button>
                  <Button variant="outline" className="rounded-[8px] border-[var(--tx-border-strong,var(--border))] bg-[var(--tx-surface-panel,var(--background))]">
                    <Download className="h-4 w-4" />
                    Download filtered
                  </Button>
                </>
              )
            }
          />

          <ListingSummaryCards className="px-0 py-0" cards={summaryCards} />

          <section className="space-y-6">
            <div className="overflow-hidden rounded-[8px] border border-[var(--tx-border-subtle,var(--border))] bg-[var(--tx-surface-panel,var(--background))]">
              <div className="overflow-x-auto">
                <Table className="min-w-[1100px]">
                  <TableHeader>
                    <TableRow className="h-10 border-[var(--tx-border-subtle,var(--border))] bg-[var(--tx-surface-header,var(--surface-header))] hover:bg-[var(--tx-surface-header,var(--surface-header))] [&>th:first-child]:rounded-tl-[8px] [&>th:last-child]:rounded-tr-[8px]">
                      <TableHead className="px-4 text-sm font-medium text-[var(--tx-text-secondary,var(--muted-foreground))]">Order ID</TableHead>
                      <TableHead className="px-4 text-sm font-medium text-[var(--tx-text-secondary,var(--muted-foreground))]">Merchant ID</TableHead>
                      {isOnlineByPayments ? (
                        <TableHead className="px-4 text-sm font-medium text-[var(--tx-text-secondary,var(--muted-foreground))]">Transaction ID</TableHead>
                      ) : null}
                      <TableHead className="px-4 text-sm font-medium text-[var(--tx-text-secondary,var(--muted-foreground))]">Transaction type</TableHead>
                      <TableHead className="px-4 text-right text-sm font-medium text-[var(--tx-text-secondary,var(--muted-foreground))]">Amount</TableHead>
                      <TableHead className="px-4 text-sm font-medium text-[var(--tx-text-secondary,var(--muted-foreground))]">Payment mode</TableHead>
                      <TableHead className="px-4 text-sm font-medium text-[var(--tx-text-secondary,var(--muted-foreground))]">Created on</TableHead>
                      <TableHead className="px-4 text-sm font-medium text-[var(--tx-text-secondary,var(--muted-foreground))]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleRows.map((row) => (
                      <TableRow
                        key={row.transactionId}
                        className="h-[72px] cursor-pointer border-[var(--tx-border-subtle,var(--border))] hover:bg-[var(--tx-surface-hover,var(--muted))]"
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
                      <TableRow className="h-16 border-[var(--tx-border-subtle,var(--border))]">
                        <TableCell colSpan={tableColCount} className="px-4 text-sm text-[var(--tx-text-secondary,var(--muted-foreground))]">
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
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="h-8 w-8 rounded-[8px] border-[var(--tx-border-strong,var(--border))] bg-[var(--tx-surface-panel,var(--background))]"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="h-8 w-8 rounded-[8px] border-[var(--tx-border-strong,var(--border))] bg-[var(--tx-surface-panel,var(--background))]"
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                      disabled={page >= totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="h-8 w-8 rounded-[8px] border-[var(--tx-border-strong,var(--border))] bg-[var(--tx-surface-panel,var(--background))]"
                      onClick={() => setPage(totalPages)}
                      disabled={page >= totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
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
                <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                    <X className="h-5 w-5" />
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
