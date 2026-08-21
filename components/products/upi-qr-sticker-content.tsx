"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  ArrowsDownUpIcon,
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ColumnsIcon,
  CopyIcon,
  DownloadIcon,
  MagnifyingGlassIcon,
  StorefrontIcon,
} from "@phosphor-icons/react"
import { DetailSidepanelShell } from "@/components/shared/activity-timeline-sidepanel"
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

type DateFilter = "today" | "7d" | "all"
type StatusFilter = "all" | "active"
type SortDirection = "asc" | "desc"
type ColumnKey = "creationDate" | "storeName" | "status" | "action"

type StoreQrRow = {
  id: string
  creationDate: string
  creationTime: string
  storeName: string
  storeAddress: string
  status: "Active"
  upiId: string
}

const storeRows: StoreQrRow[] = [
  { id: "qr-1", creationDate: "12 Jun 2026", creationTime: "10:00 AM", storeName: "PineLabs - Noida Kiosk", storeAddress: "PineLabs, Candor TechSpace, Noida, 584800", status: "Active", upiId: "6352699747@ptyes" },
  { id: "qr-2", creationDate: "16 Jun 2026", creationTime: "2:00 PM", storeName: "PineLabs - Sector 35", storeAddress: "PineLabs, Candor TechSpace, Noida, 584800", status: "Active", upiId: "6352699747@ptyes" },
  { id: "qr-3", creationDate: "15 Jun 2026", creationTime: "1:00 PM", storeName: "PineLabs - Sector 21", storeAddress: "PineLabs, Candor TechSpace, Noida, 584800", status: "Active", upiId: "6352699747@ptyes" },
  { id: "qr-4", creationDate: "17 Jun 2026", creationTime: "3:00 PM", storeName: "PineLabs - Sector 27", storeAddress: "PineLabs, Candor TechSpace, Noida, 584800", status: "Active", upiId: "6352699747@ptyes" },
  { id: "qr-5", creationDate: "14 Jun 2026", creationTime: "12:00 PM", storeName: "PineLabs - Sector 10", storeAddress: "PineLabs, Candor TechSpace, Noida, 584800", status: "Active", upiId: "6352699747@ptyes" },
  { id: "qr-6", creationDate: "18 Jun 2026", creationTime: "4:00 PM", storeName: "PineLabs - Sector 15", storeAddress: "PineLabs, Candor TechSpace, Noida, 584800", status: "Active", upiId: "6352699747@ptyes" },
  { id: "qr-7", creationDate: "13 Jun 2026", creationTime: "11:00 AM", storeName: "PineLabs - Sector 12", storeAddress: "PineLabs, Candor TechSpace, Noida, 584800", status: "Active", upiId: "6352699747@ptyes" },
  { id: "qr-8", creationDate: "19 Jun 2026", creationTime: "5:00 PM", storeName: "PineLabs - Sector 32", storeAddress: "PineLabs, Candor TechSpace, Noida, 584800", status: "Active", upiId: "6352699747@ptyes" },
  { id: "qr-9", creationDate: "12 Jun 2026", creationTime: "10:00 AM", storeName: "PineLabs - Sector 22", storeAddress: "PineLabs, Candor TechSpace, Noida, 584800", status: "Active", upiId: "6352699747@ptyes" },
  { id: "qr-10", creationDate: "20 Jun 2026", creationTime: "6:00 PM", storeName: "PineLabs - Sector 11", storeAddress: "PineLabs, Candor TechSpace, Noida, 584800", status: "Active", upiId: "6352699747@ptyes" },
]

const qrBackgroundSwatches = ["#FFFFFF", "#5478F8", "#4FD387", "#053B29", "#43A114", "#CC8108"] as const

function parseDate(row: StoreQrRow) {
  return new Date(`${row.creationDate} ${row.creationTime}`)
}

function hashSeed(input: string) {
  let hash = 0
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}

function isFinder(x: number, y: number, ox: number, oy: number) {
  if (x < ox || x >= ox + 7 || y < oy || y >= oy + 7) return false
  const lx = x - ox
  const ly = y - oy
  if (lx === 0 || lx === 6 || ly === 0 || ly === 6) return true
  if (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4) return true
  return false
}

function createQrMatrix(seed: string, size = 29) {
  const base = hashSeed(seed)
  const matrix: boolean[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => false))
  const finderOffsets: [number, number][] = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ]

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (finderOffsets.some(([ox, oy]) => isFinder(x, y, ox, oy))) {
        matrix[y][x] = true
        continue
      }
      const value = ((x + 17) * 2246822519) ^ ((y + 31) * 3266489917) ^ base
      const normalized = Math.abs(Math.sin(value) * 10000) % 1
      matrix[y][x] = normalized > 0.55
    }
  }

  return matrix
}

function toCsvField(value: string | number) {
  const text = String(value)
  if (!/[",\n]/.test(text)) return text
  return `"${text.replace(/"/g, "\"\"")}"`
}

function QrMatrixPreview({ seed, backgroundColor }: { seed: string; backgroundColor: string }) {
  const matrix = useMemo(() => createQrMatrix(seed), [seed])
  const darkBackground = backgroundColor !== "#FFFFFF"
  const qrColor = darkBackground ? "#FFFFFF" : "#1F1F1F"
  const subTextColor = darkBackground ? "rgba(255,255,255,0.85)" : "#333333"

  return (
    <div className="w-full overflow-hidden rounded-md border border-border/70">
      <div className="flex flex-col items-center justify-center gap-6 px-6 py-9" style={{ backgroundColor }}>
        <div className="text-center">
          <p className="text-[43px] font-semibold leading-none tracking-[-0.03em]" style={{ color: qrColor }}>
            pine labs
          </p>
          <p className="mt-2 text-sm font-medium" style={{ color: subTextColor }}>
            Scan & pay via any UPI apps
          </p>
        </div>

        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${matrix[0]?.length ?? 0}, minmax(0, 1fr))`,
            gap: 2,
          }}
        >
          {matrix.flatMap((row, rowIndex) =>
            row.map((filled, colIndex) => (
              <div key={`${rowIndex}-${colIndex}`} className="flex h-[8px] w-[8px] items-center justify-center">
                {filled ? <span className="h-full w-full rounded-[1px]" style={{ backgroundColor: qrColor }} /> : null}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-2">
          {["PhonePe", "Paytm", "GPay", "CRED", "+50"].map((label) => (
            <span
              key={label}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-medium"
              style={{
                borderColor: darkBackground ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.18)",
                color: darkBackground ? "#FFFFFF" : "#1F1F1F",
                backgroundColor: darkBackground ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.72)",
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 bg-background px-6 py-2">
        <p className="text-sm font-medium text-foreground">UPI ID / VPA: 6352699747@ptyes</p>
        <CopyIcon className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  )
}

function StoreQrPreviewPanel({
  row,
  backgroundColor,
  onBackgroundColorChange,
}: {
  row: StoreQrRow | null
  backgroundColor: string
  onBackgroundColorChange: (color: string) => void
}) {
  if (!row) return null

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <section className="space-y-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted p-1.5">
            <StorefrontIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-[40px] font-semibold leading-[1.06] tracking-[-0.03em] text-foreground">{row.storeName}</p>
            <p className="mt-1 text-2xl leading-8 text-muted-foreground">{row.storeAddress}</p>
          </div>
          <Button variant="link" className="h-8 px-0 text-sm text-primary hover:text-primary/80" asChild>
            <Link href={`/transactions?source=qr&store=${encodeURIComponent(row.storeName)}`}>View transactions on this QR</Link>
          </Button>
        </section>

        <QrMatrixPreview seed={`${row.id}-${row.upiId}-${backgroundColor}`} backgroundColor={backgroundColor} />

        <section className="flex items-center justify-center gap-2">
          {qrBackgroundSwatches.map((swatch) => {
            const selected = backgroundColor === swatch
            return (
              <button
                key={swatch}
                type="button"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full"
                onClick={() => onBackgroundColorChange(swatch)}
                aria-label={`Use ${swatch} background`}
              >
                <span className="h-8 w-8 rounded-full" style={{ backgroundColor: swatch }} />
                <span
                  className={`absolute inset-0 rounded-full border-2 ${selected ? "border-primary" : "border-border/70"}`}
                />
              </button>
            )
          })}
        </section>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-border/70 bg-card p-6">
        <Button variant="outline" className="h-9 rounded-md text-sm" asChild>
          <Link href="/products/in-store-payments/upi-qr-sticker?order=true">Order QR sticker</Link>
        </Button>
        <Button
          className="h-9 rounded-md text-sm"
          onClick={() => {
            if (typeof window !== "undefined") window.print()
          }}
        >
          Download & print QR
        </Button>
      </div>
    </div>
  )
}

export function UpiQrStickerContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [dateFilter, setDateFilter] = useState<DateFilter>("today")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    creationDate: true,
    storeName: true,
    status: true,
    action: true,
  })
  const [panelOpen, setPanelOpen] = useState(false)
  const [previewStoreId, setPreviewStoreId] = useState<string | null>(null)
  const [qrBackgroundColor, setQrBackgroundColor] = useState<string>(qrBackgroundSwatches[0])

  const latestDate = useMemo(
    () =>
      storeRows.reduce<Date | null>((latest, row) => {
        const current = parseDate(row)
        if (Number.isNaN(current.getTime())) return latest
        if (!latest || current > latest) return current
        return latest
      }, null),
    []
  )

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    const rangeStart =
      dateFilter === "all" || !latestDate
        ? null
        : (() => {
            const start = new Date(latestDate)
            if (dateFilter === "today") start.setHours(0, 0, 0, 0)
            if (dateFilter === "7d") start.setDate(start.getDate() - 6)
            return start
          })()

    return storeRows
      .filter((row) => {
        if (statusFilter !== "all" && row.status.toLowerCase() !== statusFilter) return false
        if (rangeStart && parseDate(row) < rangeStart) return false

        if (!normalizedQuery) return true
        const value = `${row.creationDate} ${row.creationTime} ${row.storeName} ${row.storeAddress} ${row.status} ${row.upiId}`.toLowerCase()
        return value.includes(normalizedQuery)
      })
      .sort((a, b) => {
        const first = parseDate(a).getTime()
        const second = parseDate(b).getTime()
        const direction = sortDirection === "asc" ? 1 : -1
        return (first - second) * direction
      })
  }, [dateFilter, latestDate, searchQuery, sortDirection, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage))
  const pagedRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return filteredRows.slice(start, start + rowsPerPage)
  }, [filteredRows, page, rowsPerPage])

  const selectedStore = useMemo(
    () => (previewStoreId ? storeRows.find((row) => row.id === previewStoreId) ?? null : null),
    [previewStoreId]
  )

  function openPreview(storeId: string) {
    setPreviewStoreId(storeId)
    setPanelOpen(true)
  }

  function exportAll() {
    const header = ["Creation Date", "Creation Time", "Store Name", "Store Address", "Status", "UPI ID"]
    const body = filteredRows.map((row) =>
      [row.creationDate, row.creationTime, row.storeName, row.storeAddress, row.status, row.upiId]
        .map(toCsvField)
        .join(",")
    )
    const csv = [header.map(toCsvField).join(","), ...body].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "store-qr-listing.csv"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="pb-8">
        <div className="space-y-6 px-8 py-8">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <h1 className="text-[30px] font-semibold leading-8 tracking-[-0.4px] text-foreground">Store QR stickers</h1>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-[229px]">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search store"
                  className="h-8 rounded-md border-input pl-8 pr-3 text-sm"
                />
              </div>
              <Button className="h-8 rounded-md px-2.5 text-sm font-medium">Create QR for a store</Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-8 gap-1.5 rounded-md px-2.5 text-sm font-medium">
                    {statusFilter === "all" ? "All status" : "Active"}
                    <CaretDownIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                    <DropdownMenuRadioItem value="all">All status</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-8 gap-1.5 rounded-md px-2.5 text-sm font-medium">
                    {dateFilter === "today" ? "Today" : dateFilter === "7d" ? "Last 7D" : "All dates"}
                    <CaretDownIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Date range</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilter)}>
                    <DropdownMenuRadioItem value="today">Today</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="7d">Last 7D</DropdownMenuRadioItem>
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
              >
                <ArrowsDownUpIcon className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="h-8 w-[51px] rounded-md">
                    <ColumnsIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {([
                    ["creationDate", "Creation date"],
                    ["storeName", "Store name"],
                    ["status", "Status"],
                    ["action", "Action"],
                  ] as Array<[ColumnKey, string]>).map(([key, label]) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={visibleColumns[key]}
                      onCheckedChange={(checked) =>
                        setVisibleColumns((current) => {
                          const next = { ...current, [key]: checked === true }
                          const visibleCount = Object.values(next).filter(Boolean).length
                          return visibleCount === 0 ? current : next
                        })
                      }
                      onSelect={(event) => event.preventDefault()}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="h-6 w-px bg-border/70" />
              <Button variant="ghost" className="h-8 gap-1.5 rounded-md px-2.5 text-sm font-medium" onClick={exportAll}>
                <DownloadIcon className="h-4 w-4" />
                Export all
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border/70 px-8 py-8">
          <div className="space-y-4">
            <section className="overflow-hidden rounded-md border border-border/70">
              <Table className="min-w-[1120px]">
                <TableHeader>
                  <TableRow className="h-10 border-border/70 bg-muted/35 hover:bg-muted/35">
                    {visibleColumns.creationDate ? (
                      <TableHead className="h-10 w-[168px] px-3 text-sm font-medium text-muted-foreground">Creation date</TableHead>
                    ) : null}
                    {visibleColumns.storeName ? <TableHead className="h-10 w-[639px] px-3 text-sm font-medium text-muted-foreground">Store name</TableHead> : null}
                    {visibleColumns.status ? <TableHead className="h-10 w-[199px] px-3 text-sm font-medium text-muted-foreground">Status</TableHead> : null}
                    {visibleColumns.action ? <TableHead className="h-10 w-[114px] px-3 text-right text-sm font-medium text-muted-foreground">Action</TableHead> : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedRows.length === 0 ? (
                    <TableRow className="h-[72px] border-border/70 hover:bg-transparent">
                      <TableCell className="px-3 text-sm text-muted-foreground" colSpan={4}>
                        No stores found for current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedRows.map((row) => (
                      <TableRow key={row.id} className="h-[72px] border-border/70 hover:bg-accent/35">
                        {visibleColumns.creationDate ? (
                          <TableCell className="px-3">
                            <p className="text-sm leading-5 text-foreground">{row.creationDate}</p>
                            <p className="text-sm leading-5 text-muted-foreground">{row.creationTime}</p>
                          </TableCell>
                        ) : null}
                        {visibleColumns.storeName ? (
                          <TableCell className="px-3">
                            <p className="text-sm leading-5 text-foreground">{row.storeName}</p>
                            <p className="text-sm leading-5 text-muted-foreground">{row.storeAddress}</p>
                          </TableCell>
                        ) : null}
                        {visibleColumns.status ? (
                          <TableCell className="px-3">
                            <span className="inline-flex h-6 items-center gap-1 rounded-full border border-border/70 px-2 pr-3 text-xs text-foreground">
                              <span className="h-1.5 w-1.5 rounded-full border border-[#3b82f6] bg-transparent" />
                              {row.status}
                            </span>
                          </TableCell>
                        ) : null}
                        {visibleColumns.action ? (
                          <TableCell className="px-3 text-right">
                            <Button variant="outline" className="h-8 rounded-md px-2.5 text-sm" onClick={() => openPreview(row.id)}>
                              View QR
                            </Button>
                          </TableCell>
                        ) : null}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </section>

            <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm">0 of 100 row(s) selected.</p>
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Rows per page</span>
                  <Select
                    value={String(rowsPerPage)}
                    onValueChange={(value) => {
                      setRowsPerPage(Number(value))
                      setPage(1)
                    }}
                  >
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
                  <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md border-border/60 bg-background/80" disabled={page <= 1} onClick={() => setPage(1)}>
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
      </div>

      <DetailSidepanelShell open={panelOpen} onOpenChange={setPanelOpen} title="Store QR preview" desktopWidth={458}>
        <StoreQrPreviewPanel row={selectedStore} backgroundColor={qrBackgroundColor} onBackgroundColorChange={setQrBackgroundColor} />
      </DetailSidepanelShell>
    </>
  )
}
