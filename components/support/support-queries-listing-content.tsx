"use client"

import { useMemo, useState } from "react"
import { DownloadIcon } from "@phosphor-icons/react"
import { TransactionStyleListingPage, type ListingColumn } from "@/components/shared/transaction-style-listing-page"
import { type ListingFilter } from "@/components/shared/listing-page-primitives"
import { Button } from "@/components/ui/button"

type QueryRow = {
  id: string
  issue: string
  product: string
  priority: string
  status: string
  updatedAt: string
}

const QUERY_ROWS: QueryRow[] = [
  {
    id: "SUP-2381",
    issue: "Printer is skipping last line in receipt",
    product: "POS terminal",
    priority: "High",
    status: "Open",
    updatedAt: "15 min ago",
  },
  {
    id: "SUP-2374",
    issue: "Settlement batch missing UTR reference",
    product: "Payment gateway",
    priority: "Medium",
    status: "In progress",
    updatedAt: "2 hrs ago",
  },
]

export function SupportQueriesListingContent() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return QUERY_ROWS.filter((row) => {
      if (statusFilter !== "all" && row.status.toLowerCase() !== statusFilter) return false
      if (priorityFilter !== "all" && row.priority.toLowerCase() !== priorityFilter) return false
      if (!q) return true
      return `${row.id} ${row.issue} ${row.product}`.toLowerCase().includes(q)
    })
  }, [search, statusFilter, priorityFilter])

  const filters: ListingFilter[] = [
    {
      id: "status",
      type: "select",
      label: "Status",
      value: statusFilter,
      onValueChange: setStatusFilter,
      options: [
        { label: "All status", value: "all" },
        { label: "Open", value: "open" },
        { label: "In progress", value: "in progress" },
        { label: "Resolved", value: "resolved" },
      ],
    },
    {
      id: "priority",
      type: "select",
      label: "Priority",
      value: priorityFilter,
      onValueChange: setPriorityFilter,
      options: [
        { label: "All priority", value: "all" },
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" },
      ],
    },
    { id: "more", type: "button", label: "More filters", value: "", showCaret: true },
  ]

  const columns: Array<ListingColumn<QueryRow>> = [
    { key: "id", header: "Request ID", cell: (row) => row.id },
    { key: "issue", header: "Issue", cell: (row) => row.issue },
    { key: "product", header: "Product", cell: (row) => row.product },
    { key: "priority", header: "Priority", cell: (row) => row.priority },
    { key: "status", header: "Status", cell: (row) => row.status },
    { key: "updated", header: "Updated", align: "right", cell: (row) => row.updatedAt },
  ]

  return (
    <TransactionStyleListingPage
      title="Support queries"
      primaryAction={<Button className="rounded-[8px] border border-primary/60 bg-primary text-primary-foreground hover:bg-primary/90">Raise request</Button>}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search support queries"
      filters={filters}
      rightActions={
        <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">
          <DownloadIcon className="h-4 w-4" />
          Download filtered
        </Button>
      }
      summaryCards={[
        { label: "Open queries", value: "8" },
        { label: "In progress", value: "5" },
      ]}
      columns={columns}
      rows={rows}
      emptyText="No support queries found."
    />
  )
}
