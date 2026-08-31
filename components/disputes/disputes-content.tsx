"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircleIcon, DownloadIcon, GavelIcon } from "@phosphor-icons/react"
import { useDateRangeFilter } from "@/components/shared/date-range-filter"
import { ListingToolbar, PAGE_HEADING_CLASSES, type ListingFilter } from "@/components/shared/listing-page-primitives"
import { StatusPill } from "@/components/shared/status-pill"
import { SummaryCardGroup } from "@/components/shared/summary-card-group"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  disputeActionLabel,
  disputeRecords,
  disputeStatusLabel,
  disputeStatusTone,
  type DisputeStatus,
} from "@/components/disputes/disputes-data"

function parseInr(amount: string) {
  return Number(amount.replace(/[^\d]/g, "")) || 0
}

function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`
}

const disputeStatuses: DisputeStatus[] = ["Action pending", "Reviewing", "Closed"]

export function DisputesContent() {
  const router = useRouter()
  const [channel, setChannel] = useState<"in-store" | "online">("in-store")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | DisputeStatus>("all")
  const dateRangeFilter = useDateRangeFilter()

  const disputesForChannel = useMemo(
    () => disputeRecords.filter((row) => row.channel === channel),
    [channel]
  )

  const filteredDisputes = useMemo(() => {
    const q = search.trim().toLowerCase()
    return disputesForChannel.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false
      if (!q) return true
      return `${row.id} ${row.transactionId} ${row.amount}`.toLowerCase().includes(q)
    })
  }, [disputesForChannel, search, statusFilter])

  const disputeSummary = useMemo(() => {
    const unresolved = disputesForChannel.filter((row) => row.status !== "Closed")
    const won = disputesForChannel.filter((row) => row.status === "Closed" && row.outcome === "Won")
    return {
      disputedAmount: unresolved.reduce((sum, row) => sum + parseInr(row.amount), 0),
      disputedCount: unresolved.length,
      wonAmount: won.reduce((sum, row) => sum + parseInr(row.amount), 0),
      wonCount: won.length,
    }
  }, [disputesForChannel])

  const filters: ListingFilter[] = [
    dateRangeFilter.filter,
    {
      id: "status",
      type: "select",
      label: "Status",
      value: statusFilter,
      onValueChange: (value) => setStatusFilter(value as typeof statusFilter),
      options: [
        { label: "All statuses", value: "all" },
        ...disputeStatuses.map((status) => ({ label: status, value: status })),
      ],
    },
  ]

  return (
    <div>
      <section className="flex flex-wrap items-center gap-4 px-8 pt-8">
        <h1 className={PAGE_HEADING_CLASSES}>Disputes</h1>
        <Tabs value={channel} onValueChange={(value) => setChannel(value as typeof channel)}>
          <TabsList className="h-8 rounded-[8px] bg-muted p-1">
            <TabsTrigger value="in-store" className="h-6 rounded-[6px] border-transparent px-4 py-1 text-sm font-medium text-muted-foreground data-active:!border-transparent data-active:!bg-background data-active:!text-foreground">In-store payments</TabsTrigger>
            <TabsTrigger value="online" className="h-6 rounded-[6px] border-transparent px-4 py-1 text-sm font-medium text-muted-foreground data-active:!border-transparent data-active:!bg-background data-active:!text-foreground">Online payment</TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      <Separator className="mt-6" />

      <section className="px-8 pt-6">
        <SummaryCardGroup
          cards={[
            {
              icon: GavelIcon,
              label: "Disputed amount",
              value: disputeSummary.disputedAmount > 0 ? (
                <>
                  {formatInr(disputeSummary.disputedAmount)}
                  <span className="text-sm font-medium text-muted-foreground">.00</span>
                </>
              ) : (
                "₹0"
              ),
              subtext: `among ${disputeSummary.disputedCount} payment${disputeSummary.disputedCount === 1 ? "" : "s"}`,
            },
            {
              icon: CheckCircleIcon,
              label: "Won amount",
              value: disputeSummary.wonAmount > 0 ? (
                <>
                  {formatInr(disputeSummary.wonAmount)}
                  <span className="text-sm font-medium text-muted-foreground">.00</span>
                </>
              ) : (
                "₹0"
              ),
              subtext: `among ${disputeSummary.wonCount} payment${disputeSummary.wonCount === 1 ? "" : "s"}`,
            },
          ]}
        />
      </section>

      <ListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by any ID"
        filters={filters}
        rightActions={
          <Button variant="outline" size="sm" className="h-8">
            <DownloadIcon className="h-4 w-4" />
            Download filtered
          </Button>
        }
      />

      <section className="px-8 py-6">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="h-10">
                  <TableHead className="px-4 text-sm font-medium text-muted-foreground">Created on</TableHead>
                  <TableHead className="px-4 text-sm font-medium text-muted-foreground">Dispute ID</TableHead>
                  <TableHead className="px-4 text-sm font-medium text-muted-foreground">Transaction ID</TableHead>
                  <TableHead className="px-4 text-sm font-medium text-muted-foreground">Amount</TableHead>
                  <TableHead className="px-4 text-sm font-medium text-muted-foreground">Dispute due date</TableHead>
                  <TableHead className="px-4 text-sm font-medium text-muted-foreground">Status</TableHead>
                  <TableHead className="px-4 text-sm font-medium text-muted-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDisputes.map((row) => (
                  <TableRow
                    key={row.id}
                    className="h-16 cursor-pointer align-top"
                    onClick={() => router.push(`/disputes/${row.id}`)}
                  >
                    <TableCell className="px-4 align-top text-sm text-foreground">{row.createdOn}</TableCell>
                    <TableCell className="px-4 align-top text-sm font-medium text-foreground">{row.id}</TableCell>
                    <TableCell className="px-4 align-top text-sm text-foreground">{row.transactionId}</TableCell>
                    <TableCell className="px-4 align-top text-sm text-foreground">{row.amount}</TableCell>
                    <TableCell className="px-4 align-top text-sm text-foreground">{row.dueDate}</TableCell>
                    <TableCell className="px-4 align-top"><StatusPill label={disputeStatusLabel(row)} tone={disputeStatusTone(row)} /></TableCell>
                    <TableCell className="px-4 align-top text-sm text-foreground">{disputeActionLabel(row)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </div>
  )
}
