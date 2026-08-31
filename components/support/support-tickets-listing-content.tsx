"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeftIcon } from "@phosphor-icons/react"
import { StatusPill, type StatusTone } from "@/components/shared/status-pill"
import { Button } from "@/components/ui/button"
import { useDateRangeFilter } from "@/components/shared/date-range-filter"
import { type ListingFilter } from "@/components/shared/listing-page-primitives"
import { TransactionStyleListingPage, type ListingColumn } from "@/components/shared/transaction-style-listing-page"
import { TicketDetailPanel } from "@/components/support/ticket-detail-panel"
import { TicketEditPanel, type TicketEditDraft } from "@/components/support/ticket-edit-panel"
import { SUPPORT_TICKETS, type SupportTicket, type TicketStatus } from "@/lib/support-tickets"

function ticketStatusTone(status: TicketStatus): StatusTone {
  if (status === "Resolved") return "success"
  if (status === "In progress") return "initiated"
  return "processing"
}

const STATUS_OPTIONS: TicketStatus[] = ["Open", "In progress", "Resolved"]

export function SupportTicketsListingContent() {
  const [tickets, setTickets] = useState<SupportTicket[]>(SUPPORT_TICKETS)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | TicketStatus>("all")
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const dateRangeFilter = useDateRangeFilter()

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tickets.filter((ticket) => {
      if (statusFilter !== "all" && ticket.status !== statusFilter) return false
      if (!q) return true
      return `${ticket.id} ${ticket.issue} ${ticket.category} ${ticket.product}`.toLowerCase().includes(q)
    })
  }, [tickets, search, statusFilter])

  const filters: ListingFilter[] = [
    {
      id: "status",
      type: "select",
      label: "All",
      value: statusFilter,
      onValueChange: (value) => setStatusFilter(value as typeof statusFilter),
      options: [
        { label: "All", value: "all" },
        ...STATUS_OPTIONS.map((status) => ({ label: status, value: status })),
      ],
    },
    dateRangeFilter.filter,
  ]

  function openDetail(ticket: SupportTicket) {
    setSelectedTicket(ticket)
    setDetailOpen(true)
  }

  function openEdit(ticket: SupportTicket) {
    setSelectedTicket(ticket)
    setDetailOpen(false)
    setEditOpen(true)
  }

  function handleSaveEdit(draft: TicketEditDraft) {
    if (!selectedTicket) return
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              category: draft.category,
              product: draft.product,
              issue: draft.issueDescription,
              deviceId: draft.posId || ticket.deviceId,
              storeDetails: { name: draft.storeName, contact: draft.storeContact, address: draft.storeAddress },
            }
          : ticket
      )
    )
  }

  const columns: Array<ListingColumn<SupportTicket>> = [
    { key: "reference", header: "Reference", cell: (row) => <span className="font-medium">{row.id}</span> },
    {
      key: "issue",
      header: "Issue",
      cell: (row) => (
        <div>
          <p className="text-foreground">{row.issue}</p>
          <p className="text-xs text-muted-foreground">{row.category}</p>
        </div>
      ),
    },
    { key: "status", header: "Status", cell: (row) => <StatusPill label={row.status} tone={ticketStatusTone(row.status)} /> },
    { key: "priority", header: "Priority", cell: (row) => row.priority },
    { key: "product", header: "Product", cell: (row) => row.product },
    { key: "created", header: "Created", cell: (row) => row.createdAt },
    { key: "updated", header: "Updated", cell: (row) => row.updatedAt },
  ]

  return (
    <>
      <div className="px-8 pt-6">
        <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 rounded-md px-2 text-xs text-foreground hover:bg-muted">
          <Link href="/support">
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <TransactionStyleListingPage
        title="Support tickets"
        subtitle={`${rows.length} of ${tickets.length} tickets`}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search support tickets"
        filters={filters}
        columns={columns}
        rows={rows}
        onRowClick={openDetail}
        emptyText="No support tickets found."
        totalRows={rows.length}
      />

      <TicketDetailPanel
        open={detailOpen}
        onOpenChange={setDetailOpen}
        ticket={selectedTicket}
        onEdit={openEdit}
      />
      <TicketEditPanel open={editOpen} onOpenChange={setEditOpen} ticket={selectedTicket} onSave={handleSaveEdit} />
    </>
  )
}
