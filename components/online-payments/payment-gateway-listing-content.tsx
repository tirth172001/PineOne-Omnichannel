"use client"

import { useMemo, useState } from "react"
import { DownloadIcon } from "@phosphor-icons/react"
import { TransactionStyleListingPage, type ListingColumn } from "@/components/shared/transaction-style-listing-page"
import { type ListingFilter } from "@/components/shared/listing-page-primitives"
import { Button } from "@/components/ui/button"

type GatewayRow = {
  id: string
  orderId: string
  merchantId: string
  transactionType: string
  amount: string
  paymentMode: string
  createdDate: string
  createdTime: string
  status: string
}

const GATEWAY_ROWS: GatewayRow[] = [
  {
    id: "gw-1",
    orderId: "ORD-7120",
    merchantId: "MCNT-2380",
    transactionType: "Payment",
    amount: "₹ 50,000",
    paymentMode: "UPI",
    createdDate: "25 Aug 2026",
    createdTime: "8:00 AM",
    status: "Success",
  },
  {
    id: "gw-2",
    orderId: "ORD-7121",
    merchantId: "MCNT-2381",
    transactionType: "Payment",
    amount: "₹ 35,000",
    paymentMode: "Card",
    createdDate: "24 Aug 2026",
    createdTime: "6:00 PM",
    status: "Failed",
  },
]

export function PaymentGatewayListingContent() {
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("7d")
  const [statusFilter, setStatusFilter] = useState("all")

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return GATEWAY_ROWS.filter((row) => {
      if (statusFilter !== "all" && row.status.toLowerCase() !== statusFilter) return false
      if (!q) return true
      return `${row.orderId} ${row.merchantId} ${row.paymentMode}`.toLowerCase().includes(q)
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
        { label: "Last 30D", value: "30d" },
      ],
    },
    {
      id: "status",
      type: "select",
      label: "Status",
      value: statusFilter,
      onValueChange: setStatusFilter,
      options: [
        { label: "Status", value: "all" },
        { label: "Success", value: "success" },
        { label: "Failed", value: "failed" },
      ],
    },
    { id: "more", type: "button", label: "More filters", value: "", showCaret: true },
  ]

  const columns: Array<ListingColumn<GatewayRow>> = [
    { key: "orderId", header: "Order ID", cell: (row) => row.orderId },
    { key: "merchant", header: "Merchant ID", cell: (row) => row.merchantId },
    { key: "type", header: "Transaction type", cell: (row) => row.transactionType },
    { key: "amount", header: "Amount", align: "right", cell: (row) => row.amount },
    { key: "mode", header: "Payment mode", cell: (row) => row.paymentMode },
    {
      key: "created",
      header: "Created on",
      cell: (row) => (
        <div>
          <p>{row.createdDate}</p>
          <p className="text-xs text-muted-foreground">{row.createdTime}</p>
        </div>
      ),
    },
    { key: "status", header: "Status", cell: (row) => row.status },
  ]

  return (
    <TransactionStyleListingPage
      title="Payment gateway"
      primaryAction={<Button className="rounded-[8px] border border-primary/60 bg-primary text-primary-foreground hover:bg-primary/90">View insights</Button>}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by any value"
      filters={filters}
      rightActions={
        <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">
          <DownloadIcon className="h-4 w-4" />
          Download filtered
        </Button>
      }
      summaryCards={[
        { label: "Total volume", value: "₹10,30,329" },
        { label: "Total count", value: "3000" },
      ]}
      columns={columns}
      rows={rows}
      emptyText="No payments found."
    />
  )
}
