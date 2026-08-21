"use client"

import { type ComponentType, useEffect, useMemo, useState } from "react"
import {
  ArrowsDownUpIcon,
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  CheckIcon,
  ColumnsIcon,
  CopyIcon,
  DotsThreeVerticalIcon,
  DownloadIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type SubscriptionStatus = "Success" | "Cancelled"
type StatusFilter = "all" | "success" | "cancelled"
type DateFilter = "today" | "7d" | "all"
type SortDirection = "asc" | "desc"
type ColumnKey = "creationDate" | "paymentLink" | "merchantOrderId" | "details" | "amount" | "status" | "action"

type SubscriptionRow = {
  id: string
  creationDate: string
  creationTime: string
  paymentLink: string
  merchantOrderId: string
  customerName: string
  customerMasked: string
  amount: number
  status: SubscriptionStatus
}

const pageOneRows: SubscriptionRow[] = [
  {
    id: "sub-1",
    creationDate: "16 Aug 2026",
    creationTime: "10:10 PM",
    paymentLink: "/payment-1129919",
    merchantOrderId: "MCT-ORD-5161",
    customerName: "Tirth trivedi",
    customerMasked: "**9898, tir***gmail.com",
    amount: 20000,
    status: "Success",
  },
  {
    id: "sub-2",
    creationDate: "18 Aug 2026",
    creationTime: "9:30 PM",
    paymentLink: "/payment-1129919",
    merchantOrderId: "MCT-ORD-5163",
    customerName: "Fatima Ahmed",
    customerMasked: "**6789, fatima***gmail.com",
    amount: 10000,
    status: "Success",
  },
  {
    id: "sub-3",
    creationDate: "20 Aug 2026",
    creationTime: "3:00 PM",
    paymentLink: "/payment-1129919",
    merchantOrderId: "MCT-ORD-5164",
    customerName: "Sophia Lee",
    customerMasked: "**9101, sophia***outlook.com",
    amount: 25000,
    status: "Success",
  },
  {
    id: "sub-4",
    creationDate: "21 Aug 2026",
    creationTime: "1:00 PM",
    paymentLink: "/payment-1129919",
    merchantOrderId: "MCT-ORD-5165",
    customerName: "Muhammad Khan",
    customerMasked: "**5678, muham***hotmail.com",
    amount: 30000,
    status: "Cancelled",
  },
  {
    id: "sub-5",
    creationDate: "19 Aug 2026",
    creationTime: "2:45 PM",
    paymentLink: "/payment-1129919",
    merchantOrderId: "MCT-ORD-5166",
    customerName: "Nina Brown",
    customerMasked: "**7890, nina***hotmail.com",
    amount: 35000,
    status: "Success",
  },
  {
    id: "sub-6",
    creationDate: "22 Aug 2026",
    creationTime: "4:30 PM",
    paymentLink: "/payment-1129919",
    merchantOrderId: "MCT-ORD-5167",
    customerName: "Ravi Patel",
    customerMasked: "**2345, ravi***gmail.com",
    amount: 40000,
    status: "Cancelled",
  },
  {
    id: "sub-7",
    creationDate: "17 Aug 2026",
    creationTime: "11:15 AM",
    paymentLink: "/payment-1129919",
    merchantOrderId: "MCT-ORD-5168",
    customerName: "Liam Smith",
    customerMasked: "**3456, liam***yahoo.com",
    amount: 45000,
    status: "Success",
  },
  {
    id: "sub-8",
    creationDate: "25 Aug 2026",
    creationTime: "8:00 AM",
    paymentLink: "/payment-1129919",
    merchantOrderId: "MCT-ORD-5169",
    customerName: "Alice Johnson",
    customerMasked: "**1234, alice***yahoo.com",
    amount: 50000,
    status: "Success",
  },
  {
    id: "sub-9",
    creationDate: "24 Aug 2026",
    creationTime: "6:00 PM",
    paymentLink: "/payment-1129919",
    merchantOrderId: "MCT-ORD-5170",
    customerName: "Tirth trivedi",
    customerMasked: "**9898, tir***gmail.com",
    amount: 55000,
    status: "Cancelled",
  },
  {
    id: "sub-10",
    creationDate: "23 Aug 2026",
    creationTime: "5:15 PM",
    paymentLink: "/payment-1129919",
    merchantOrderId: "MCT-ORD-5171",
    customerName: "Carlos Garcia",
    customerMasked: "**1122, carlos***outlook.com",
    amount: 60000,
    status: "Success",
  },
]

const allRows: SubscriptionRow[] = Array.from({ length: 100 }, (_, index) => {
  const source = pageOneRows[index % pageOneRows.length]
  const cycle = Math.floor(index / pageOneRows.length)
  const orderBase = Number(source.merchantOrderId.replace("MCT-ORD-", ""))
  const linkBase = Number(source.paymentLink.replace("/payment-", ""))

  return {
    ...source,
    id: `sub-${index + 1}`,
    paymentLink: `/payment-${linkBase + cycle}`,
    merchantOrderId: `MCT-ORD-${orderBase + cycle * 10}`,
  }
})

function parseDate(date: string, time: string) {
  const value = new Date(`${date} ${time}`)
  if (!Number.isNaN(value.getTime())) return value
  return new Date(0)
}

function formatInr(amount: number) {
  return `₹ ${amount.toLocaleString("en-MY")}`
}

function toCsvField(value: string | number) {
  const text = String(value)
  if (!/[",\n]/.test(text)) return text
  return `"${text.replace(/"/g, '""')}"`
}

const statusMeta: Record<SubscriptionStatus, { icon: ComponentType<{ className?: string }>; iconClassName: string }> = {
  Success: { icon: CheckCircleIcon, iconClassName: "text-emerald-500" },
  Cancelled: { icon: XCircleIcon, iconClassName: "text-red-500" },
}

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const Icon = statusMeta[status].icon

  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-full border border-border/70 bg-background px-2 pr-3 text-xs font-normal leading-none text-foreground">
      <Icon className={cn("h-3 w-3", statusMeta[status].iconClassName)} />
      {status}
    </span>
  )
}

function SubscriptionsTable({
  rows,
  visibleColumns,
  copiedRowId,
  onCopy,
}: {
  rows: SubscriptionRow[]
  visibleColumns: Record<ColumnKey, boolean>
  copiedRowId: string | null
  onCopy: (row: SubscriptionRow) => void
}) {
  const columnCount = Object.values(visibleColumns).filter(Boolean).length

  return (
    <section className="overflow-hidden rounded-md border border-border/70">
      <div className="overflow-x-auto">
        <Table className="min-w-[1120px]">
          <TableHeader>
            <TableRow className="border-border/70">
              {visibleColumns.creationDate ? (
                <TableHead className="h-10 min-w-[120px] px-3 text-sm font-medium text-muted-foreground">Creation date</TableHead>
              ) : null}
              {visibleColumns.paymentLink ? (
                <TableHead className="h-10 min-w-[200px] px-3 text-sm font-medium text-muted-foreground">Payment link</TableHead>
              ) : null}
              {visibleColumns.merchantOrderId ? (
                <TableHead className="h-10 min-w-[200px] px-3 text-sm font-medium text-muted-foreground">Merchant order ID</TableHead>
              ) : null}
              {visibleColumns.details ? (
                <TableHead className="h-10 min-w-[232px] px-3 text-sm font-medium text-muted-foreground">Details</TableHead>
              ) : null}
              {visibleColumns.amount ? (
                <TableHead className="h-10 min-w-[133px] px-3 text-right text-sm font-medium text-muted-foreground">Amount</TableHead>
              ) : null}
              {visibleColumns.status ? (
                <TableHead className="h-10 min-w-[120px] px-3 text-sm font-medium text-muted-foreground">Status</TableHead>
              ) : null}
              {visibleColumns.action ? (
                <TableHead className="h-10 min-w-[114px] px-3 text-right text-sm font-medium text-muted-foreground">Action</TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="h-[72px] border-border/70">
                <TableCell colSpan={Math.max(1, columnCount)} className="px-3 text-sm text-muted-foreground">
                  No subscriptions found for current filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} className="h-[72px] border-border/70">
                  {visibleColumns.creationDate ? (
                    <TableCell className="px-3 py-4">
                      <p className="text-sm font-medium leading-5 text-foreground">{row.creationDate}</p>
                      <p className="text-sm leading-5 text-muted-foreground">{row.creationTime}</p>
                    </TableCell>
                  ) : null}

                  {visibleColumns.paymentLink ? (
                    <TableCell className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-5 text-foreground">{row.paymentLink}</p>
                        <button
                          type="button"
                          className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground transition hover:text-foreground"
                          onClick={() => onCopy(row)}
                          aria-label={`Copy ${row.paymentLink}`}
                        >
                          {copiedRowId === row.id ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </TableCell>
                  ) : null}

                  {visibleColumns.merchantOrderId ? (
                    <TableCell className="px-3 py-4 text-sm text-foreground">{row.merchantOrderId}</TableCell>
                  ) : null}

                  {visibleColumns.details ? (
                    <TableCell className="px-3 py-4">
                      <p className="text-sm font-medium leading-5 text-foreground">{row.customerName}</p>
                      <p className="text-sm leading-5 text-muted-foreground">{row.customerMasked}</p>
                    </TableCell>
                  ) : null}

                  {visibleColumns.amount ? (
                    <TableCell className="px-3 py-4 text-right text-sm text-foreground">{formatInr(row.amount)}</TableCell>
                  ) : null}

                  {visibleColumns.status ? (
                    <TableCell className="px-3 py-2">
                      <StatusBadge status={row.status} />
                    </TableCell>
                  ) : null}

                  {visibleColumns.action ? (
                    <TableCell className="px-3 py-2 text-right">
                      <Button variant="outline" size="icon-sm" className="h-8 w-[51px] rounded-md">
                        <DotsThreeVerticalIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

export function SubscriptionsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [dateFilter, setDateFilter] = useState<DateFilter>("today")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null)
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    creationDate: true,
    paymentLink: true,
    merchantOrderId: true,
    details: true,
    amount: true,
    status: true,
    action: true,
  })

  const latestDate = useMemo(() => {
    return allRows.reduce<Date | null>((latest, row) => {
      const current = parseDate(row.creationDate, row.creationTime)
      if (!latest || current > latest) return current
      return latest
    }, null)
  }, [])

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    const rangeStart =
      dateFilter === "all" || !latestDate
        ? null
        : (() => {
            const start = new Date(latestDate)
            if (dateFilter === "today") {
              start.setHours(0, 0, 0, 0)
            } else {
              start.setDate(start.getDate() - 6)
              start.setHours(0, 0, 0, 0)
            }
            return start
          })()

    return allRows
      .filter((row) => {
        if (statusFilter !== "all" && row.status.toLowerCase() !== statusFilter) return false

        if (rangeStart) {
          const createdAt = parseDate(row.creationDate, row.creationTime)
          if (createdAt < rangeStart || createdAt > latestDate!) return false
        }

        if (!normalizedQuery) return true

        const value = [
          row.creationDate,
          row.creationTime,
          row.paymentLink,
          row.merchantOrderId,
          row.customerName,
          row.customerMasked,
          row.amount,
          row.status,
        ]
          .join(" ")
          .toLowerCase()

        return value.includes(normalizedQuery)
      })
      .sort((a, b) => {
        const first = parseDate(a.creationDate, a.creationTime).getTime()
        const second = parseDate(b.creationDate, b.creationTime).getTime()
        return sortDirection === "asc" ? first - second : second - first
      })
  }, [dateFilter, latestDate, searchQuery, sortDirection, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage))

  useEffect(() => {
    setPage(1)
  }, [filteredRows, rowsPerPage])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pagedRows = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage
    return filteredRows.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredRows, page, rowsPerPage])

  useEffect(() => {
    if (!copiedRowId) return
    const timeout = window.setTimeout(() => setCopiedRowId(null), 1400)
    return () => window.clearTimeout(timeout)
  }, [copiedRowId])

  function copyPaymentLink(row: SubscriptionRow) {
    const text = row.paymentLink

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        // no-op fallback below
      })
    }

    if (typeof document !== "undefined") {
      const input = document.createElement("input")
      input.value = text
      document.body.appendChild(input)
      input.select()
      try {
        document.execCommand("copy")
      } catch {
        // no-op
      }
      document.body.removeChild(input)
    }

    setCopiedRowId(row.id)
  }

  function exportAllRows() {
    const header = [
      "Creation Date",
      "Creation Time",
      "Payment Link",
      "Merchant Order ID",
      "Details Name",
      "Details Masked",
      "Amount",
      "Status",
    ]

    const body = filteredRows.map((row) =>
      [
        row.creationDate,
        row.creationTime,
        row.paymentLink,
        row.merchantOrderId,
        row.customerName,
        row.customerMasked,
        row.amount,
        row.status,
      ]
        .map(toCsvField)
        .join(",")
    )

    const csv = [[...header].map(toCsvField).join(","), ...body].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const href = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = href
    anchor.download = "subscriptions.csv"
    anchor.click()
    URL.revokeObjectURL(href)
  }

  return (
    <div className="pb-8">
      <div className="space-y-6 px-8 py-8">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <h1 className="text-[30px] font-semibold leading-8 tracking-[-0.4px] text-foreground">Subscriptions</h1>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-[229px]">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search link"
                className="h-8 rounded-md border-input pl-8 pr-3 text-sm"
              />
            </div>

            <Button variant="outline" className="h-8 rounded-md px-2.5 text-sm font-medium">
              Bulk upload
            </Button>
            <Button variant="outline" className="h-8 rounded-md px-2.5 text-sm font-medium">
              Create & manage plans
            </Button>
            <Button className="h-8 rounded-md px-2.5 text-sm font-medium">Create subscription link</Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 gap-1.5 rounded-md px-2.5 text-sm font-medium">
                  {statusFilter === "all" ? "All status" : statusFilter[0].toUpperCase() + statusFilter.slice(1)}
                  <CaretDownIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                  <DropdownMenuRadioItem value="all">All status</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="success">Success</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="cancelled">Cancelled</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 gap-1.5 rounded-md px-2.5 text-sm font-medium">
                  {dateFilter === "today" ? "Today" : dateFilter === "7d" ? "Last 7 days" : "All time"}
                  <CaretDownIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Date</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilter)}>
                  <DropdownMenuRadioItem value="today">Today</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="7d">Last 7 days</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="all">All dates</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" className="h-8 rounded-md px-2.5 text-sm font-medium">
              More filters
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-[51px] rounded-md"
              onClick={() => setSortDirection((current) => (current === "asc" ? "desc" : "asc"))}
              aria-label="Sort rows"
            >
              <ArrowsDownUpIcon className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="h-8 w-[51px] rounded-md" aria-label="Select columns">
                  <ColumnsIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {([
                  ["creationDate", "Creation date"],
                  ["paymentLink", "Payment link"],
                  ["merchantOrderId", "Merchant order ID"],
                  ["details", "Details"],
                  ["amount", "Amount"],
                  ["status", "Status"],
                  ["action", "Action"],
                ] as Array<[ColumnKey, string]>).map(([key, label]) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={visibleColumns[key]}
                    onCheckedChange={(checked) => {
                      setVisibleColumns((current) => {
                        const next = { ...current, [key]: checked === true }
                        const visibleCount = Object.values(next).filter(Boolean).length
                        return visibleCount === 0 ? current : next
                      })
                    }}
                    onSelect={(event) => event.preventDefault()}
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-6 w-px bg-border/70" />
            <Button variant="ghost" className="h-8 gap-1.5 rounded-md px-2.5 text-sm font-medium" onClick={exportAllRows}>
              <DownloadIcon className="h-4 w-4" />
              Export all
            </Button>
          </div>
        </div>
      </div>

      <div className="px-8 pb-6">
        <SubscriptionsTable rows={pagedRows} visibleColumns={visibleColumns} copiedRowId={copiedRowId} onCopy={copyPaymentLink} />

        <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">0 of {allRows.length} row(s) selected.</p>

          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Rows per page</span>
              <Select value={String(rowsPerPage)} onValueChange={(value) => setRowsPerPage(Number(value))}>
                <SelectTrigger size="sm" className="h-8 w-[70px] rounded-lg text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <span className="text-sm font-medium text-foreground">Page {page} of {totalPages}</span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                className="h-8 w-8 rounded-md border-border/60 bg-background/80"
                disabled={page <= 1}
                onClick={() => setPage(1)}
              >
                <CaretDoubleLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                className="h-8 w-8 rounded-md border-border/60 bg-background/80"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <CaretLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                className="h-8 w-8 rounded-md border-border/60 bg-background/80"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              >
                <CaretRightIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                className="h-8 w-8 rounded-md border-border/60 bg-background/80"
                disabled={page >= totalPages}
                onClick={() => setPage(totalPages)}
              >
                <CaretDoubleRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
