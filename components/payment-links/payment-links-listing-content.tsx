"use client"

import { useMemo, useState } from "react"
import { Download } from "lucide-react"

import { TransactionStyleListingPage, type ListingColumn } from "@/components/shared/transaction-style-listing-page"
import { type ListingFilter } from "@/components/shared/listing-page-primitives"
import { Button } from "@/components/ui/button"

type PaymentLinkRow = {
  id: string
  createdDate: string
  createdTime: string
  paymentLink: string
  transactionId: string
  amount: string
  expiryDate: string
  expiryTime: string
  status: string
}

const ROWS: PaymentLinkRow[] = [
  {
    id: "plink-1",
    createdDate: "20 Aug 2026",
    createdTime: "11:30 AM",
    paymentLink: "pay.pinelabs.com/p/AB12CD",
    transactionId: "TXN-9021",
    amount: "₹ 2,500",
    expiryDate: "25 Aug 2026",
    expiryTime: "11:30 AM",
    status: "Success",
  },
  {
    id: "plink-2",
    createdDate: "19 Aug 2026",
    createdTime: "2:10 PM",
    paymentLink: "pay.pinelabs.com/p/XY88KL",
    transactionId: "TXN-9018",
    amount: "₹ 3,200",
    expiryDate: "24 Aug 2026",
    expiryTime: "2:10 PM",
    status: "Initiated",
  },
]

export function PaymentLinksListingContent() {
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("7d")
  const [statusFilter, setStatusFilter] = useState("all")

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return ROWS.filter((row) => {
      if (statusFilter !== "all" && row.status.toLowerCase() !== statusFilter) return false
      if (!q) return true
      return `${row.paymentLink} ${row.transactionId}`.toLowerCase().includes(q)
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
        { label: "Initiated", value: "initiated" },
        { label: "Failed", value: "failed" },
      ],
    },
    { id: "more", type: "button", label: "More filters", value: "", showCaret: true },
  ]

  const columns: Array<ListingColumn<PaymentLinkRow>> = [
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
    { key: "txn", header: "Transaction ID", cell: (row) => row.transactionId },
    { key: "amount", header: "Amount", align: "right", cell: (row) => row.amount },
    {
      key: "expiry",
      header: "Expiry date",
      cell: (row) => (
        <div>
          <p>{row.expiryDate}</p>
          <p className="text-xs text-muted-foreground">{row.expiryTime}</p>
        </div>
      ),
    },
    { key: "status", header: "Status", cell: (row) => row.status },
  ]

  return (
    <TransactionStyleListingPage
      title="Payment links or QR codes"
      primaryAction={
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">Configure page UI</Button>
          <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">Manage pay modes</Button>
          <Button className="rounded-[8px] border border-primary/60 bg-primary text-primary-foreground hover:bg-primary/90">Create new link</Button>
        </div>
      }
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search payment link"
      filters={filters}
      rightActions={
        <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">
          <Download className="h-4 w-4" />
          Download filtered
        </Button>
      }
      summaryCards={[
        { label: "Links created", value: "1,248" },
        { label: "Successful collections", value: "836" },
      ]}
      columns={columns}
      rows={rows}
      emptyText="No payment links found."
    />
  )
}
