"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ArrowDownUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  Copy,
  Download,
  Search,
} from "lucide-react"
import { StatusPill, type StatusTone } from "@/components/shared/status-pill"
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

type PaymentLinkStatus = "Expired" | "Success" | "Initiated" | "Failed"
type StatusFilter = "all" | "expired" | "success" | "initiated" | "failed"
type DateFilter = "today" | "7d" | "all"
type SortDirection = "asc" | "desc"
type ColumnKey = "creationDate" | "paymentLink" | "transactionId" | "amount" | "expiryDate" | "status"

type PaymentLinkRow = {
  id: string
  creationDate: string
  creationTime: string
  paymentLink: string
  transactionId: string
  amount: number
  expiryDate: string
  expiryTime: string
  status: PaymentLinkStatus
}

const pageOneRows: PaymentLinkRow[] = [
  { id: "pl-1", creationDate: "16 Aug 2026", creationTime: "10:10 PM", paymentLink: "/payment-1129919", transactionId: "TXN-5161", amount: 20000, expiryDate: "16 Aug 2026", expiryTime: "10:10 PM", status: "Expired" },
  { id: "pl-2", creationDate: "18 Aug 2026", creationTime: "9:30 PM", paymentLink: "/payment-1129919", transactionId: "TXN-5163", amount: 10000, expiryDate: "18 Aug 2026", expiryTime: "9:30 PM", status: "Success" },
  { id: "pl-3", creationDate: "20 Aug 2026", creationTime: "3:00 PM", paymentLink: "/payment-1129919", transactionId: "TXN-5164", amount: 25000, expiryDate: "20 Aug 2026", expiryTime: "3:00 PM", status: "Initiated" },
  { id: "pl-4", creationDate: "21 Aug 2026", creationTime: "1:00 PM", paymentLink: "/payment-1129919", transactionId: "TXN-5165", amount: 30000, expiryDate: "21 Aug 2026", expiryTime: "1:00 PM", status: "Failed" },
  { id: "pl-5", creationDate: "19 Aug 2026", creationTime: "2:45 PM", paymentLink: "/payment-1129919", transactionId: "TXN-5166", amount: 35000, expiryDate: "19 Aug 2026", expiryTime: "2:45 PM", status: "Success" },
  { id: "pl-6", creationDate: "22 Aug 2026", creationTime: "4:30 PM", paymentLink: "/payment-1129919", transactionId: "TXN-5167", amount: 40000, expiryDate: "22 Aug 2026", expiryTime: "4:30 PM", status: "Initiated" },
  { id: "pl-7", creationDate: "17 Aug 2026", creationTime: "11:15 AM", paymentLink: "/payment-1129919", transactionId: "TXN-5168", amount: 45000, expiryDate: "17 Aug 2026", expiryTime: "11:15 AM", status: "Success" },
  { id: "pl-8", creationDate: "25 Aug 2026", creationTime: "8:00 AM", paymentLink: "/payment-1129919", transactionId: "TXN-5169", amount: 50000, expiryDate: "25 Aug 2026", expiryTime: "8:00 AM", status: "Failed" },
  { id: "pl-9", creationDate: "24 Aug 2026", creationTime: "6:00 PM", paymentLink: "/payment-1129919", transactionId: "TXN-5170", amount: 55000, expiryDate: "24 Aug 2026", expiryTime: "6:00 PM", status: "Initiated" },
  { id: "pl-10", creationDate: "23 Aug 2026", creationTime: "5:15 PM", paymentLink: "/payment-1129919", transactionId: "TXN-5171", amount: 60000, expiryDate: "23 Aug 2026", expiryTime: "5:15 PM", status: "Expired" },
]

const allRows: PaymentLinkRow[] = Array.from({ length: 100 }, (_, index) => {
  const source = pageOneRows[index % pageOneRows.length]
  const cycle = Math.floor(index / pageOneRows.length)
  const txnBase = Number(source.transactionId.replace("TXN-", ""))
  const linkBase = Number(source.paymentLink.replace("/payment-", ""))

  return {
    ...source,
    id: `pl-${index + 1}`,
    paymentLink: `/payment-${linkBase + cycle}`,
    transactionId: `TXN-${txnBase + cycle * 10}`,
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

function toPaymentLinkTone(status: PaymentLinkStatus): StatusTone {
  if (status === "Success") return "success"
  if (status === "Initiated") return "initiated"
  if (status === "Expired") return "processing"
  return "failed"
}

function PaymentLinksTable({
  rows,
  visibleColumns,
  copiedRowId,
  onCopy,
}: {
  rows: PaymentLinkRow[]
  visibleColumns: Record<ColumnKey, boolean>
  copiedRowId: string | null
  onCopy: (row: PaymentLinkRow) => void
}) {
  const columnCount = Object.values(visibleColumns).filter(Boolean).length

  return (
    <section className="overflow-hidden rounded-md border border-border">
      <div className="overflow-x-auto">
        <Table className="min-w-[1120px]">
          <TableHeader>
            <TableRow className="h-10">
              {visibleColumns.creationDate ? (
                <TableHead className="h-10 min-w-[168px] px-3 text-sm font-medium text-muted-foreground">Creation date</TableHead>
              ) : null}
              {visibleColumns.paymentLink ? (
                <TableHead className="h-10 min-w-[279px] px-3 text-sm font-medium text-muted-foreground">Payment link</TableHead>
              ) : null}
              {visibleColumns.transactionId ? (
                <TableHead className="h-10 min-w-[151px] px-3 text-sm font-medium text-muted-foreground">Transaction ID</TableHead>
              ) : null}
              {visibleColumns.amount ? (
                <TableHead className="h-10 min-w-[146px] px-3 text-right text-sm font-medium text-muted-foreground">Amount</TableHead>
              ) : null}
              {visibleColumns.expiryDate ? (
                <TableHead className="h-10 min-w-[256px] px-3 text-sm font-medium text-muted-foreground">Expiry date</TableHead>
              ) : null}
              {visibleColumns.status ? (
                <TableHead className="h-10 min-w-[120px] px-3 text-sm font-medium text-muted-foreground">Status</TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="h-[72px]">
                <TableCell colSpan={Math.max(1, columnCount)} className="px-3 text-sm text-muted-foreground">
                  No payment links found for current filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} className="h-[72px]">
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
                          {copiedRowId === row.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </TableCell>
                  ) : null}
                  {visibleColumns.transactionId ? <TableCell className="px-3 py-4 text-sm text-foreground">{row.transactionId}</TableCell> : null}
                  {visibleColumns.amount ? <TableCell className="px-3 py-4 text-right text-sm text-foreground">{formatInr(row.amount)}</TableCell> : null}
                  {visibleColumns.expiryDate ? (
                    <TableCell className="px-3 py-4">
                      <p className="text-sm font-medium leading-5 text-foreground">{row.expiryDate}</p>
                      <p className="text-sm leading-5 text-muted-foreground">{row.expiryTime}</p>
                    </TableCell>
                  ) : null}
                  {visibleColumns.status ? (
                    <TableCell className="px-3 py-2">
                      <StatusPill label={row.status} tone={toPaymentLinkTone(row.status)} />
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

export function PaymentLinksContent() {
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
    transactionId: true,
    amount: true,
    expiryDate: true,
    status: true,
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
          row.transactionId,
          row.amount,
          row.expiryDate,
          row.expiryTime,
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

  function copyPaymentLink(row: PaymentLinkRow) {
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
    const header = ["Creation Date", "Creation Time", "Payment Link", "Transaction ID", "Amount", "Expiry Date", "Expiry Time", "Status"]
    const body = filteredRows.map((row) =>
      [
        row.creationDate,
        row.creationTime,
        row.paymentLink,
        row.transactionId,
        row.amount,
        row.expiryDate,
        row.expiryTime,
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
    anchor.download = "payment-links.csv"
    anchor.click()
    URL.revokeObjectURL(href)
  }

  return (
    <div className="pb-8">
      <div className="space-y-6 px-8 py-8">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <h1 className="text-[30px] font-semibold leading-8 tracking-[-0.4px] text-foreground">Payment links or QR codes</h1>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-[229px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search payment link"
                className="h-8 rounded-md border-input pl-8 pr-3 text-sm"
              />
            </div>

            <Button variant="outline" className="h-8 rounded-md px-2.5 text-sm font-medium">
              Configure page UI
            </Button>
            <Button variant="outline" className="h-8 rounded-md px-2.5 text-sm font-medium">
              Manage pay modes
            </Button>
            <Button className="h-8 rounded-md px-2.5 text-sm font-medium">Create new link</Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 gap-1.5 rounded-md px-2.5 text-sm font-medium">
                  {statusFilter === "all" ? "All status" : statusFilter[0].toUpperCase() + statusFilter.slice(1)}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                  <DropdownMenuRadioItem value="all">All status</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="expired">Expired</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="success">Success</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="initiated">Initiated</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="failed">Failed</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 gap-1.5 rounded-md px-2.5 text-sm font-medium">
                  {dateFilter === "today" ? "Today" : dateFilter === "7d" ? "Last 7 days" : "All time"}
                  <ChevronDown className="h-4 w-4" />
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
              <ArrowDownUp className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="h-8 w-[51px] rounded-md" aria-label="Select columns">
                  <Columns3 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {([
                  ["creationDate", "Creation date"],
                  ["paymentLink", "Payment link"],
                  ["transactionId", "Transaction ID"],
                  ["amount", "Amount"],
                  ["expiryDate", "Expiry date"],
                  ["status", "Status"],
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
              <Download className="h-4 w-4" />
              Export all
            </Button>
          </div>
        </div>
      </div>

      <div className="px-8 pb-6">
        <PaymentLinksTable rows={pagedRows} visibleColumns={visibleColumns} copiedRowId={copiedRowId} onCopy={copyPaymentLink} />

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
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                className="h-8 w-8 rounded-md border-border/60 bg-background/80"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                className="h-8 w-8 rounded-md border-border/60 bg-background/80"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                className="h-8 w-8 rounded-md border-border/60 bg-background/80"
                disabled={page >= totalPages}
                onClick={() => setPage(totalPages)}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
