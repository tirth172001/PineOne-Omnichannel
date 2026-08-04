"use client"

import { useMemo, useState } from "react"
import { Download } from "lucide-react"

import { TransactionStyleListingPage, type ListingColumn } from "@/components/shared/transaction-style-listing-page"
import { type ListingFilter } from "@/components/shared/listing-page-primitives"
import { Button } from "@/components/ui/button"

type PosRow = {
  id: string
  model: string
  hardwareId: string
  posId: string
  installationDate: string
  installationTime: string
  storeName: string
  storeAddress: string
  status: "Standalone" | "Linked"
}

const POS_ROWS: PosRow[] = [
  {
    id: "pos-1",
    model: "A910",
    hardwareId: "HRD-9033",
    posId: "POS-1277",
    installationDate: "21 Jun 2026",
    installationTime: "9:00 AM",
    storeName: "PineLabs - Noida Kiosk",
    storeAddress: "PineLabs, Candor TechSpace, Noida, 584800",
    status: "Standalone",
  },
  {
    id: "pos-2",
    model: "A77",
    hardwareId: "HRD-9044",
    posId: "POS-1284",
    installationDate: "20 Jun 2026",
    installationTime: "12:30 PM",
    storeName: "PineLabs - Sector 35",
    storeAddress: "PineLabs, Candor TechSpace, Noida, 584800",
    status: "Linked",
  },
]

export function PosTerminalsListingContent() {
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("7d")
  const [statusFilter, setStatusFilter] = useState("all")

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return POS_ROWS.filter((row) => {
      if (statusFilter !== "all" && row.status.toLowerCase() !== statusFilter) return false
      if (!q) return true
      return `${row.model} ${row.hardwareId} ${row.posId} ${row.storeName}`.toLowerCase().includes(q)
    })
  }, [search, statusFilter])

  const filters: ListingFilter[] = [
    {
      id: "date",
      type: "select",
      label: "Date",
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
        { label: "Linked", value: "linked" },
      ],
    },
    { id: "more", type: "button", label: "More filters", value: "", showCaret: true },
  ]

  const columns: Array<ListingColumn<PosRow>> = [
    {
      key: "model",
      header: "Model & hardware ID",
      cell: (row) => (
        <div>
          <p>{row.model}</p>
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
      key: "status",
      header: "Status",
      cell: (row) => (
        <span className="inline-flex h-6 items-center rounded-full border border-border/70 px-2 text-xs">{row.status}</span>
      ),
    },
  ]

  return (
    <TransactionStyleListingPage
      title="POS terminals"
      primaryAction={
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">Manage stores & users</Button>
          <Button className="rounded-[8px] border border-primary/60 bg-primary text-primary-foreground hover:bg-primary/90">Add new device</Button>
        </div>
      }
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search device"
      filters={filters}
      rightActions={
        <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">
          <Download className="h-4 w-4" />
          Download filtered
        </Button>
      }
      summaryCards={[
        { label: "Total devices", value: "214" },
        { label: "Active locations", value: "86" },
      ]}
      columns={columns}
      rows={rows}
      emptyText="No devices found."
    />
  )
}
