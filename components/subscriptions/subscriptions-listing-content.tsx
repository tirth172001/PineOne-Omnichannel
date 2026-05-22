"use client"

import { useMemo, useState } from "react"
import { Download } from "lucide-react"

import { TransactionStyleListingPage, type ListingColumn } from "@/components/shared/transaction-style-listing-page"
import { type ListingFilter } from "@/components/shared/listing-page-primitives"
import { Button } from "@/components/ui/button"

type SubscriptionRow = {
  id: string
  createdDate: string
  createdTime: string
  paymentLink: string
  merchantOrderId: string
  details: string
  amount: string
  status: string
}

const ROWS: SubscriptionRow[] = [
  {
    id: "sub-1",
    createdDate: "20 Aug 2026",
    createdTime: "11:30 AM",
    paymentLink: "pay.pinelabs.com/sub/AB12CD",
    merchantOrderId: "MORD-1127",
    details: "Rahul S. ••8942",
    amount: "₹ 599",
    status: "Success",
  },
  {
    id: "sub-2",
    createdDate: "19 Aug 2026",
    createdTime: "2:10 PM",
    paymentLink: "pay.pinelabs.com/sub/XY88KL",
    merchantOrderId: "MORD-1128",
    details: "Neha P. ••3321",
    amount: "₹ 999",
    status: "Cancelled",
  },
]

export function SubscriptionsListingContent() {
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("7d")
  const [statusFilter, setStatusFilter] = useState("all")

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return ROWS.filter((row) => {
      if (statusFilter !== "all" && row.status.toLowerCase() !== statusFilter) return false
      if (!q) return true
      return `${row.paymentLink} ${row.merchantOrderId} ${row.details}`.toLowerCase().includes(q)
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
        { label: "Success", value: "success" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
    { id: "more", type: "button", label: "More filters", value: "", showCaret: true },
  ]

  const columns: Array<ListingColumn<SubscriptionRow>> = [
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
    { key: "link", header: "Payment link", cell: (row) => row.paymentLink },
    { key: "order", header: "Merchant order ID", cell: (row) => row.merchantOrderId },
    { key: "details", header: "Details", cell: (row) => row.details },
    { key: "amount", header: "Amount", align: "right", cell: (row) => row.amount },
    { key: "status", header: "Status", cell: (row) => row.status },
  ]

  return (
    <TransactionStyleListingPage
      title="Subscriptions"
      primaryAction={
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">Bulk upload</Button>
          <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">Create & manage plans</Button>
          <Button className="rounded-[8px] border border-primary/60 bg-primary text-primary-foreground hover:bg-primary/90">Create subscription link</Button>
        </div>
      }
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search link"
      filters={filters}
      rightActions={
        <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">
          <Download className="h-4 w-4" />
          Download filtered
        </Button>
      }
      summaryCards={[
        { label: "Active subscriptions", value: "6,420" },
        { label: "MRR", value: "₹18,40,000" },
      ]}
      columns={columns}
      rows={rows}
      emptyText="No subscriptions found."
    />
  )
}
