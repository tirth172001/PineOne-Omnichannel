"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DotsThreeVerticalIcon, DownloadIcon, FileTextIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

import { TransactionStyleListingPage, type ListingColumn } from "@/components/shared/transaction-style-listing-page"
import { type ListingFilter } from "@/components/shared/listing-page-primitives"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { readDummyAuthSession } from "@/lib/dummy-auth"
import {
  getDeviceRows,
  recordModeChange,
  toggleDeviceStatus,
  type DeviceMode,
  type TerminalDeviceRow,
} from "@/lib/terminal-devices-data"

function ModePill({ mode }: { mode: DeviceMode }) {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-border/70 px-2 text-xs text-foreground">
      <span className={mode === "Integrated" ? "h-1.5 w-1.5 rounded-full bg-primary" : "h-1.5 w-1.5 rounded-full bg-muted-foreground/50"} />
      {mode}
    </span>
  )
}

export function PosTerminalsListingContent() {
  const router = useRouter()
  const [rows, setRows] = useState<TerminalDeviceRow[]>(() => getDeviceRows())
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("today")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (statusFilter !== "all" && row.mode.toLowerCase() !== statusFilter) return false
      if (!query) return true
      return `${row.model} ${row.hardwareId} ${row.posId} ${row.storeName}`.toLowerCase().includes(query)
    })
  }, [rows, search, statusFilter])

  function currentActor() {
    const session = readDummyAuthSession()
    return { name: session?.name ?? "Admin", role: session?.role ?? "Admin" }
  }

  function handleChangeMode(device: TerminalDeviceRow, nextMode: DeviceMode) {
    const { name, role } = currentActor()
    const result = recordModeChange(device.id, nextMode, name, role)
    if (!result) return
    setRows((current) => current.map((row) => (row.id === device.id ? result.device : row)))
    toast.success(`${device.model} switched to ${nextMode}`)
  }

  function handleToggleStatus(device: TerminalDeviceRow) {
    const updated = toggleDeviceStatus(device.id)
    if (!updated) return
    setRows((current) => current.map((row) => (row.id === device.id ? updated : row)))
    toast.success(`${device.model} ${updated.status === "Active" ? "reactivated" : "deactivated"}`)
  }

  function handleAddDevice() {
    const first = rows[0]
    const newRow: TerminalDeviceRow = {
      ...first,
      id: `dev-new-${Date.now()}`,
      model: "Touch A910",
      hardwareId: `HRD-${Math.floor(100000 + Math.random() * 900000)}`,
      posId: `POS-${Math.floor(700000000 + Math.random() * 90000000)}`,
      installationDate: "Just now",
      installationTime: "",
      mode: "Standalone",
      status: "Active",
    }
    setRows((current) => [newRow, ...current])
    toast.success(`${newRow.model} added`)
  }

  const filters: ListingFilter[] = [
    {
      id: "date",
      type: "select",
      label: "Today",
      value: dateFilter,
      onValueChange: setDateFilter,
      options: [
        { label: "Today", value: "today" },
        { label: "Last 7D", value: "7d" },
        { label: "All dates", value: "all" },
      ],
    },
    {
      id: "status",
      type: "select",
      label: "Status",
      value: statusFilter,
      onValueChange: setStatusFilter,
      options: [
        { label: "All status", value: "all" },
        { label: "Standalone", value: "standalone" },
        { label: "Integrated", value: "integrated" },
      ],
    },
    { id: "more", type: "button", label: "More filters", value: "", showCaret: true },
  ]

  const columns: Array<ListingColumn<TerminalDeviceRow>> = [
    {
      key: "model",
      header: "Hardware model ID",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.model}</p>
          <p className="text-xs text-muted-foreground">{row.hardwareId}</p>
        </div>
      ),
    },
    { key: "posId", header: "POS ID", cell: (row) => row.posId },
    {
      key: "installation",
      header: "Installation date",
      cell: (row) => (
        <div>
          <p>{row.installationDate}</p>
          <p className="text-xs text-muted-foreground">{row.installationTime}</p>
        </div>
      ),
    },
    {
      key: "store",
      header: "Store name",
      cell: (row) => (
        <div>
          <p>{row.storeName}</p>
          <p className="text-xs text-muted-foreground">{row.storeAddress}</p>
        </div>
      ),
    },
    {
      key: "mode",
      header: "Mode",
      cell: (row) => <ModePill mode={row.mode} />,
    },
    {
      key: "action",
      header: "Action",
      align: "right",
      cell: (row) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md border-border/70 bg-transparent">
                <DotsThreeVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onSelect={() => handleChangeMode(row, row.mode === "Standalone" ? "Integrated" : "Standalone")}>
                Change mode to {row.mode === "Standalone" ? "Integrated" : "Standalone"}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleToggleStatus(row)}>
                {row.status === "Active" ? "Deactivate device" : "Reactivate device"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <TransactionStyleListingPage
      title="Terminal devices"
      primaryAction={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-[8px] border-border/70 bg-background"
            onClick={() => router.push("/offline-payments/manage-devices/audit-log")}
          >
            <FileTextIcon className="h-4 w-4" />
            Audit log
          </Button>
          <Button
            className="rounded-[8px] border border-primary/60 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleAddDevice}
          >
            Add new device
          </Button>
        </div>
      }
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by device ID"
      filters={filters}
      rightActions={
        <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">
          <DownloadIcon className="h-4 w-4" />
          Download filtered
        </Button>
      }
      columns={columns}
      rows={filteredRows}
      emptyText="No devices found for current filters."
      totalRows={filteredRows.length}
    />
  )
}
