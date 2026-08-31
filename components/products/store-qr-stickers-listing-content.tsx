"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { CopyIcon, DownloadIcon, QrCodeIcon, StorefrontIcon } from "@phosphor-icons/react"
import { DetailSidepanelShell } from "@/components/shared/activity-timeline-sidepanel"
import { useDateRangeFilter } from "@/components/shared/date-range-filter"
import { type ListingFilter } from "@/components/shared/listing-page-primitives"
import { useMoreFiltersPanel, type MoreFilterCategory } from "@/components/shared/more-filters-panel"
import { TransactionStyleListingPage, type ListingColumn } from "@/components/shared/transaction-style-listing-page"
import { Button } from "@/components/ui/button"

type StoreQrRow = {
  id: string
  createdDate: string
  createdTime: string
  storeName: string
  storeAddress: string
  status: string
}

const STORE_ROWS: StoreQrRow[] = [
  {
    id: "qr-1",
    createdDate: "20 Aug 2026",
    createdTime: "11:30 AM",
    storeName: "PineLabs - Noida Kiosk",
    storeAddress: "PineLabs, Candor TechSpace, Noida, 584800",
    status: "Active",
  },
  {
    id: "qr-2",
    createdDate: "18 Aug 2026",
    createdTime: "4:10 PM",
    storeName: "PineLabs - Sector 35",
    storeAddress: "PineLabs, Candor TechSpace, Noida, 584800",
    status: "Active",
  },
]

const moreFilterCategories: MoreFilterCategory[] = [
  {
    id: "status",
    label: "Status",
    display: "badge",
    selectionMode: "multi",
    searchable: false,
    options: [{ id: "active", label: "Active" }],
  },
]

export function StoreQrStickersListingContent() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [qrPanelOpen, setQrPanelOpen] = useState(false)
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const dateRangeFilter = useDateRangeFilter()
  const moreFilters = useMoreFiltersPanel(moreFilterCategories)

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return STORE_ROWS.filter((row) => {
      if (statusFilter !== "all" && row.status.toLowerCase() !== statusFilter) return false
      if (!q) return true
      return `${row.storeName} ${row.storeAddress}`.toLowerCase().includes(q)
    })
  }, [search, statusFilter])

  const filters: ListingFilter[] = [
    dateRangeFilter.filter,
    {
      id: "status",
      type: "select",
      label: "Status",
      value: statusFilter,
      onValueChange: setStatusFilter,
      options: [
        { label: "All status", value: "all" },
        { label: "Active", value: "active" },
      ],
    },
  ]

  const columns: Array<ListingColumn<StoreQrRow>> = [
    {
      key: "created",
      header: "Creation date",
      cell: (row) => (
        <div>
          <p>{row.createdDate}</p>
          <p className="text-xs text-muted-foreground">{row.createdTime}</p>
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
      cell: (row) => <span className="inline-flex h-6 items-center rounded-full border border-border/70 px-2 text-xs">{row.status}</span>,
    },
    {
      key: "action",
      header: "Action",
      align: "right",
      cell: (row) => (
        <Button
          variant="outline"
          className="h-8 rounded-[8px]"
          onClick={() => {
            setSelectedStoreId(row.id)
            setQrPanelOpen(true)
          }}
        >
          View QR
        </Button>
      ),
    },
  ]

  const selectedStore = useMemo(
    () => (selectedStoreId ? STORE_ROWS.find((row) => row.id === selectedStoreId) ?? null : null),
    [selectedStoreId]
  )

  return (
    <>
      <TransactionStyleListingPage
        title="Store QR stickers"
        primaryAction={<Button>Create QR for a store</Button>}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search store"
        filters={filters}
        {...moreFilters.toolbarProps}
        rightActions={
          <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">
            <DownloadIcon className="h-4 w-4" />
            Download filtered
          </Button>
        }
        summaryCards={[
          { label: "Total stores", value: "140" },
          { label: "QR active", value: "140" },
        ]}
        columns={columns}
        rows={rows}
        emptyText="No stores found."
      />

      <DetailSidepanelShell open={qrPanelOpen && Boolean(selectedStore)} onOpenChange={setQrPanelOpen} title="Store QR preview" desktopWidth={458}>
        {selectedStore ? (
          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <section className="space-y-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted p-1.5">
                  <StorefrontIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold leading-tight text-foreground">{selectedStore.storeName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedStore.storeAddress}</p>
                </div>
                <Button variant="link" className="h-8 px-0 text-sm text-primary hover:text-primary/80" asChild>
                  <Link href={`/transactions?source=qr&store=${encodeURIComponent(selectedStore.storeName)}`}>
                    View transactions on this QR
                  </Link>
                </Button>
              </section>

              <section className="rounded-[8px] border border-border/70 bg-card p-6">
                <div className="flex flex-col items-center gap-4">
                  <p className="text-2xl font-semibold leading-none tracking-tight text-foreground">pine labs</p>
                  <div className="inline-flex h-40 w-40 items-center justify-center rounded-md border border-border/70 bg-background">
                    <QrCodeIcon className="h-24 w-24 text-foreground" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>UPI ID: 6352699747@ptyes</span>
                    <CopyIcon className="h-3.5 w-3.5" />
                  </div>
                </div>
              </section>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border/70 bg-card p-6">
              <Button variant="outline" className="h-9 rounded-md text-sm">Order QR sticker</Button>
              <Button className="h-9 rounded-md text-sm">Download & print QR</Button>
            </div>
          </div>
        ) : null}
      </DetailSidepanelShell>
    </>
  )
}
