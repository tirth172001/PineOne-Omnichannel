"use client"

import { useMemo, useState } from "react"
import {
  ArrowDownUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  Download,
  MoreVertical,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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

type TerminalStatus = "Standalone" | "Linked"
type DateFilter = "today" | "7d" | "all"
type StatusFilter = "all" | "Standalone" | "Linked"
type SortDirection = "asc" | "desc"
type ColumnKey = "modelHardware" | "posId" | "installationDate" | "storeName" | "status" | "action"

type PosTerminalRow = {
  id: string
  model: string
  hardwareId: string
  posId: string
  installationDate: string
  installationTime: string
  storeName: string
  storeAddress: string
  status: TerminalStatus
}

const initialRows: PosTerminalRow[] = [
  {
    id: "row-1",
    model: "Touch A910",
    hardwareId: "HRD-1101",
    posId: "POS-1101",
    installationDate: "12 Jun 2026",
    installationTime: "10:00 AM",
    storeName: "PineLabs - Noida Kiosk",
    storeAddress: "PineLabs, Candor TechSpace, Noida, 584800",
    status: "Standalone",
  },
  {
    id: "row-2",
    model: "Voice POD",
    hardwareId: "HRD-1109",
    posId: "POS-1105",
    installationDate: "16 Jun 2026",
    installationTime: "2:00 PM",
    storeName: "PineLabs - Sector 35",
    storeAddress: "PineLabs, Candor TechSpace, Noida, 584800",
    status: "Standalone",
  },
  {
    id: "row-3",
    model: "Duo",
    hardwareId: "HRD-4412",
    posId: "POS-1108",
    installationDate: "15 Jun 2026",
    installationTime: "1:00 PM",
    storeName: "PineLabs - Sector 21",
    storeAddress: "PineLabs, Candor TechSpace, Noida, 584800",
    status: "Standalone",
  },
  {
    id: "row-4",
    model: "Go",
    hardwareId: "HRD-6619",
    posId: "POS-1103",
    installationDate: "17 Jun 2026",
    installationTime: "3:00 PM",
    storeName: "PineLabs - Sector 27",
    storeAddress: "PineLabs, Candor TechSpace, Noida, 584800",
    status: "Standalone",
  },
  {
    id: "row-5",
    model: "Mini",
    hardwareId: "HRD-3315",
    posId: "POS-1104",
    installationDate: "14 Jun 2026",
    installationTime: "12:00 PM",
    storeName: "PineLabs - Sector 10",
    storeAddress: "PineLabs, Candor TechSpace, Noida, 584800",
    status: "Standalone",
  },
  {
    id: "row-6",
    model: "A910",
    hardwareId: "HRD-5508",
    posId: "POS-1106",
    installationDate: "18 Jun 2026",
    installationTime: "4:00 PM",
    storeName: "PineLabs - Sector 15",
    storeAddress: "PineLabs, Candor TechSpace, Noida, 584800",
    status: "Standalone",
  },
  {
    id: "row-7",
    model: "Mini",
    hardwareId: "HRD-2210",
    posId: "POS-1101",
    installationDate: "13 Jun 2026",
    installationTime: "11:00 AM",
    storeName: "PineLabs - Sector 12",
    storeAddress: "PineLabs, Candor TechSpace, Noida, 584800",
    status: "Standalone",
  },
  {
    id: "row-8",
    model: "Go",
    hardwareId: "HRD-7714",
    posId: "POS-1109",
    installationDate: "19 Jun 2026",
    installationTime: "5:00 PM",
    storeName: "PineLabs - Sector 32",
    storeAddress: "PineLabs, Candor TechSpace, Noida, 584800",
    status: "Standalone",
  },
  {
    id: "row-9",
    model: "Mini",
    hardwareId: "HRD-8816",
    posId: "POS-1107",
    installationDate: "12 Jun 2026",
    installationTime: "10:00 AM",
    storeName: "PineLabs - Sector 22",
    storeAddress: "PineLabs, Candor TechSpace, Noida, 584800",
    status: "Standalone",
  },
  {
    id: "row-10",
    model: "A910",
    hardwareId: "HRD-1109",
    posId: "POS-1102",
    installationDate: "20 Jun 2026",
    installationTime: "6:00 PM",
    storeName: "PineLabs - Sector 11",
    storeAddress: "PineLabs, Candor TechSpace, Noida, 584800",
    status: "Standalone",
  },
]

function parseDateTime(row: PosTerminalRow) {
  return new Date(`${row.installationDate} ${row.installationTime}`)
}

function toCsvField(value: string | number) {
  const text = String(value)
  if (!/[",\n]/.test(text)) return text
  return `"${text.replace(/"/g, "\"\"")}"`
}

export function ManageDevicesContent({ initialModel }: { initialModel?: string }) {
  const [rows, setRows] = useState<PosTerminalRow[]>(initialRows)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [dateFilter, setDateFilter] = useState<DateFilter>("today")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    modelHardware: true,
    posId: true,
    installationDate: true,
    storeName: true,
    status: true,
    action: true,
  })

  const latestDate = useMemo(
    () => rows.reduce<Date | null>((latest, row) => {
      const current = parseDateTime(row)
      if (Number.isNaN(current.getTime())) return latest
      if (!latest || current > latest) return current
      return latest
    }, null),
    [rows]
  )

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const modelQuery = initialModel?.trim().toLowerCase() ?? ""

    const rangeStart =
      dateFilter === "all" || !latestDate
        ? null
        : (() => {
            const start = new Date(latestDate)
            if (dateFilter === "today") start.setHours(0, 0, 0, 0)
            if (dateFilter === "7d") start.setDate(start.getDate() - 6)
            return start
          })()

    return rows
      .filter((row) => {
        if (statusFilter !== "all" && row.status !== statusFilter) return false
        if (rangeStart && parseDateTime(row) < rangeStart) return false

        if (modelQuery) {
          const modelValue = row.model.toLowerCase()
          if (!modelValue.includes(modelQuery)) return false
        }

        if (!normalizedQuery) return true

        const value = [
          row.model,
          row.hardwareId,
          row.posId,
          row.installationDate,
          row.installationTime,
          row.storeName,
          row.storeAddress,
          row.status,
        ]
          .join(" ")
          .toLowerCase()

        return value.includes(normalizedQuery)
      })
      .sort((a, b) => {
        const first = parseDateTime(a).getTime()
        const second = parseDateTime(b).getTime()
        const direction = sortDirection === "asc" ? 1 : -1
        return (first - second) * direction
      })
  }, [dateFilter, initialModel, latestDate, rows, searchQuery, sortDirection, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage))
  const pagedRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return filteredRows.slice(start, start + rowsPerPage)
  }, [filteredRows, page, rowsPerPage])

  const allPageSelected = pagedRows.length > 0 && pagedRows.every((row) => selectedIds.includes(row.id))
  const selectedCount = selectedIds.filter((id) => filteredRows.some((row) => row.id === id)).length

  function handleToggleRowSelection(id: string, checked: boolean) {
    setSelectedIds((current) => (checked ? Array.from(new Set([...current, id])) : current.filter((item) => item !== id)))
  }

  function handleTogglePageSelection(checked: boolean) {
    setSelectedIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, ...pagedRows.map((row) => row.id)]))
      }
      const pageIds = new Set(pagedRows.map((row) => row.id))
      return current.filter((id) => !pageIds.has(id))
    })
  }

  function handleExportAll() {
    const header = [
      "Model",
      "Hardware ID",
      "POS ID",
      "Installation Date",
      "Installation Time",
      "Store Name",
      "Store Address",
      "Status",
    ]

    const body = filteredRows.map((row) =>
      [
        row.model,
        row.hardwareId,
        row.posId,
        row.installationDate,
        row.installationTime,
        row.storeName,
        row.storeAddress,
        row.status,
      ]
        .map(toCsvField)
        .join(",")
    )

    const csv = [header.map(toCsvField).join(","), ...body].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "pos-terminals.csv"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function handleAddDevice() {
    const nextId = rows.length + 1
    const newRow: PosTerminalRow = {
      id: `row-${nextId}`,
      model: "A910",
      hardwareId: `HRD-${String(9000 + nextId)}`,
      posId: `POS-${String(1200 + nextId)}`,
      installationDate: "21 Jun 2026",
      installationTime: "9:00 AM",
      storeName: "PineLabs - New Store",
      storeAddress: "PineLabs, Candor TechSpace, Noida, 584800",
      status: "Standalone",
    }
    setRows((current) => [newRow, ...current])
  }

  return (
    <div className="pb-8">
      <div className="space-y-6 px-8 py-8">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <h1 className="text-[30px] font-semibold leading-8 tracking-[-0.4px] text-foreground">POS terminals</h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-[229px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search device"
                className="h-8 rounded-md border-input pl-8 pr-3 text-sm"
              />
            </div>
            <Button variant="outline" className="h-8 rounded-md px-2.5 text-sm font-medium">
              Manage stores & users
            </Button>
            <Button className="h-8 rounded-md px-2.5 text-sm font-medium" onClick={handleAddDevice}>
              Add new device
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 gap-1.5 rounded-md px-2.5 text-sm font-medium">
                  {statusFilter === "all" ? "All status" : statusFilter}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                  <DropdownMenuRadioItem value="all">All status</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Standalone">Standalone</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Linked">Linked</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 gap-1.5 rounded-md px-2.5 text-sm font-medium">
                  {dateFilter === "today" ? "Today" : dateFilter === "7d" ? "Last 7D" : "All dates"}
                  <ChevronDown className="h-4 w-4" />
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
              <ArrowDownUp className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="h-8 w-[51px] rounded-md">
                  <Columns3 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {([
                  ["modelHardware", "Model & hardware ID"],
                  ["posId", "POS ID"],
                  ["installationDate", "Installation date"],
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
            <Button variant="ghost" className="h-8 gap-1.5 rounded-md px-2.5 text-sm font-medium" onClick={handleExportAll}>
              <Download className="h-4 w-4" />
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
                <TableRow className="h-10 border-border/70 hover:bg-transparent">
                  <TableHead className="h-10 w-[85px] px-3">
                    <div className="flex items-center justify-center">
                      <Checkbox checked={allPageSelected} onCheckedChange={(checked) => handleTogglePageSelection(checked === true)} />
                    </div>
                  </TableHead>
                  {visibleColumns.modelHardware ? (
                    <TableHead className="h-10 w-[168px] px-3 text-sm font-medium text-muted-foreground">Model & hardware ID</TableHead>
                  ) : null}
                  {visibleColumns.posId ? <TableHead className="h-10 w-[133px] px-3 text-sm font-medium text-muted-foreground">POS ID</TableHead> : null}
                  {visibleColumns.installationDate ? (
                    <TableHead className="h-10 w-[168px] px-3 text-sm font-medium text-muted-foreground">Installation date</TableHead>
                  ) : null}
                  {visibleColumns.storeName ? <TableHead className="h-10 w-[332px] px-3 text-sm font-medium text-muted-foreground">Store name</TableHead> : null}
                  {visibleColumns.status ? <TableHead className="h-10 w-[120px] px-3 text-sm font-medium text-muted-foreground">Status</TableHead> : null}
                  {visibleColumns.action ? <TableHead className="h-10 w-[114px] px-3 text-right text-sm font-medium text-muted-foreground">Action</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRows.length === 0 ? (
                  <TableRow className="h-[72px] border-border/70 hover:bg-transparent">
                    <TableCell className="px-3 text-sm text-muted-foreground" colSpan={7}>
                      No devices found for current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedRows.map((row) => (
                    <TableRow key={row.id} className="h-[72px] border-border/70 hover:bg-transparent">
                      <TableCell className="px-3">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={selectedIds.includes(row.id)}
                            onCheckedChange={(checked) => handleToggleRowSelection(row.id, checked === true)}
                            aria-label={`Select ${row.hardwareId}`}
                          />
                        </div>
                      </TableCell>
                      {visibleColumns.modelHardware ? (
                        <TableCell className="px-3">
                          <p className="text-sm leading-5 text-foreground">{row.model}</p>
                          <p className="text-sm leading-5 text-muted-foreground">{row.hardwareId}</p>
                        </TableCell>
                      ) : null}
                      {visibleColumns.posId ? <TableCell className="px-3 text-sm text-foreground">{row.posId}</TableCell> : null}
                      {visibleColumns.installationDate ? (
                        <TableCell className="px-3">
                          <p className="text-sm leading-5 text-foreground">{row.installationDate}</p>
                          <p className="text-sm leading-5 text-muted-foreground">{row.installationTime}</p>
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
                            <span className="h-1.5 w-1.5 rounded-[2px] bg-[#eab308]" />
                            {row.status}
                          </span>
                        </TableCell>
                      ) : null}
                      {visibleColumns.action ? (
                        <TableCell className="px-3 text-right">
                          <Button variant="outline" size="icon-sm" className="h-8 w-[51px] rounded-md border-border/70 bg-transparent">
                            <MoreVertical className="h-4 w-4" />
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
            <p className="text-sm">
              {selectedCount} of {filteredRows.length} row(s) selected.
            </p>
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
    </div>
  )
}
