"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CaretLeftIcon, DownloadIcon } from "@phosphor-icons/react"
import { TransactionStyleListingPage, type ListingColumn } from "@/components/shared/transaction-style-listing-page"
import { type ListingFilter } from "@/components/shared/listing-page-primitives"
import { Button } from "@/components/ui/button"
import { getAuditRows, type DeviceAuditRow, type DeviceMode } from "@/lib/terminal-devices-data"

function ModeCell({ mode }: { mode: DeviceMode }) {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-border/70 px-2 text-xs text-foreground">
      <span className={mode === "Integrated" ? "h-1.5 w-1.5 rounded-full bg-primary" : "h-1.5 w-1.5 rounded-full bg-muted-foreground/50"} />
      {mode}
    </span>
  )
}

export function DeviceAuditLogContent() {
  const router = useRouter()
  const rows = useMemo(() => getAuditRows(), [])
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [storeFilter, setStoreFilter] = useState("all")

  const storeOptions = useMemo(() => {
    const names = Array.from(new Set(rows.map((row) => row.storeName)))
    return names.map((name) => ({ label: name, value: name }))
  }, [rows])

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (storeFilter !== "all" && row.storeName !== storeFilter) return false
      if (!query) return true
      return `${row.hardwareId} ${row.model} ${row.changedBy} ${row.storeName}`.toLowerCase().includes(query)
    })
  }, [rows, search, storeFilter])

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
      id: "store",
      type: "select",
      label: "Store",
      value: storeFilter,
      onValueChange: setStoreFilter,
      options: [{ label: "All stores", value: "all" }, ...storeOptions],
    },
  ]

  const columns: Array<ListingColumn<DeviceAuditRow>> = [
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
    {
      key: "changedBy",
      header: "Changed by",
      cell: (row) => (
        <div>
          <p>{row.changedBy}</p>
          <p className="text-xs text-muted-foreground">{row.changedByRole}</p>
        </div>
      ),
    },
    { key: "store", header: "Store name", cell: (row) => row.storeName },
    { key: "previousMode", header: "Previous mode", cell: (row) => <ModeCell mode={row.previousMode} /> },
    { key: "finalMode", header: "Final mode", cell: (row) => <ModeCell mode={row.finalMode} /> },
    {
      key: "date",
      header: "Date",
      cell: (row) => (
        <div>
          <p>{row.date}</p>
          <p className="text-xs text-muted-foreground">{row.time}</p>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="px-8 pt-6">
        <button
          type="button"
          onClick={() => router.push("/offline-payments/manage-devices")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <CaretLeftIcon className="h-4 w-4" />
          Back
        </button>
      </div>
      <TransactionStyleListingPage
        title="Audit log"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by device ID"
        filters={filters}
        rightActions={
          <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">
            <DownloadIcon className="h-4 w-4" />
            Download
          </Button>
        }
        columns={columns}
        rows={filteredRows}
        emptyText="No mode changes recorded yet."
        totalRows={filteredRows.length}
      />
    </div>
  )
}
