"use client"

import { useMemo, useState } from "react"
import { ArrowUpDown, Download, SlidersHorizontal } from "lucide-react"

import {
  ListingSummaryCards,
  ListingToolbar,
  type ListingFilter,
} from "@/components/shared/listing-page-primitives"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const disputeRows = [
  {
    createdOn: "12 Aug 2026",
    disputeId: "DSP-2101",
    transactionId: "TXN-5161",
    amount: "₹20,000",
    dueDate: "14 Aug 2026",
    status: "Action pending",
    action: "Defend",
  },
  {
    createdOn: "11 Aug 2026",
    disputeId: "DSP-2102",
    transactionId: "TXN-5162",
    amount: "₹10,000",
    dueDate: "13 Aug 2026",
    status: "Reviewing",
    action: "In review",
  },
  {
    createdOn: "10 Aug 2026",
    disputeId: "DSP-2103",
    transactionId: "TXN-5163",
    amount: "₹30,000",
    dueDate: "12 Aug 2026",
    status: "Closed",
    action: "Closed",
  },
]

export function DisputesContent() {
  const [search, setSearch] = useState("")
  const [statusTab, setStatusTab] = useState("pending")
  const [dateFilter, setDateFilter] = useState("7d")

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return disputeRows.filter((row) => {
      const statusOk =
        statusTab === "pending"
          ? row.status === "Action pending"
          : statusTab === "reviewing"
            ? row.status === "Reviewing"
            : row.status === "Closed"
      if (!statusOk) return false
      if (!q) return true
      return `${row.disputeId} ${row.transactionId} ${row.amount}`.toLowerCase().includes(q)
    })
  }, [search, statusTab])

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
      id: "more",
      type: "button",
      label: "More filters",
      value: "",
      showCaret: true,
    },
  ]

  return (
    <div className="mx-auto w-full max-w-[1512px]">
      <section>
        <div className="px-8 pt-8 pb-0">
          <h1 className="text-[30px] font-semibold leading-none text-foreground">Dispute cases</h1>
        </div>

        <div className="px-8 pt-8 pb-0">
          <Tabs value={statusTab} onValueChange={setStatusTab}>
            <TabsList variant="line" className="h-8 gap-6 bg-transparent p-0">
              <TabsTrigger
                value="pending"
                className="h-8 rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent px-0 py-0 text-sm font-medium text-muted-foreground data-active:!border-x-0 data-active:!border-t-0 data-active:!border-b-2 data-active:!border-primary data-active:!bg-transparent data-active:!text-primary data-active:!shadow-none group-data-[variant=line]/tabs-list:data-active:after:opacity-0"
              >
                Action pending
              </TabsTrigger>
              <TabsTrigger
                value="reviewing"
                className="h-8 rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent px-0 py-0 text-sm font-medium text-muted-foreground data-active:!border-x-0 data-active:!border-t-0 data-active:!border-b-2 data-active:!border-primary data-active:!bg-transparent data-active:!text-primary data-active:!shadow-none group-data-[variant=line]/tabs-list:data-active:after:opacity-0"
              >
                Reviewing
              </TabsTrigger>
              <TabsTrigger
                value="closed"
                className="h-8 rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent px-0 py-0 text-sm font-medium text-muted-foreground data-active:!border-x-0 data-active:!border-t-0 data-active:!border-b-2 data-active:!border-primary data-active:!bg-transparent data-active:!text-primary data-active:!shadow-none group-data-[variant=line]/tabs-list:data-active:after:opacity-0"
              >
                Closed
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Separator />
      </section>

      <div className="space-y-6 px-8 pt-8 pb-8">
        <ListingToolbar
          className="px-0 py-0"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search disputes"
          filters={filters}
          rightActions={
            <>
              <Button variant="ghost">Reset</Button>
              <Button variant="ghost" size="icon-sm">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-sm">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">
                <Download className="h-4 w-4" />
                Download filtered
              </Button>
            </>
          }
        />

        <section>
          <ListingSummaryCards
            className="px-0 py-0"
            cards={[
              { label: "Due today", value: "₹10,30,329" },
              { label: "Disputed trxns", value: "3000" },
            ]}
          />
        </section>

        <section className="space-y-6">
          <div className="overflow-hidden rounded-[8px] border border-border/60 bg-background">
            <div className="overflow-x-auto">
              <Table className="min-w-[1100px]">
                <TableHeader>
                  <TableRow className="h-10 border-border/60 bg-[var(--surface-header)] hover:bg-[var(--surface-header)] [&>th:first-child]:rounded-tl-[8px] [&>th:last-child]:rounded-tr-[8px]">
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
                  {rows.map((row) => (
                    <TableRow key={row.disputeId} className="h-[72px] border-border/60 hover:bg-muted/20">
                      <TableCell className="px-4 text-sm text-foreground">{row.createdOn}</TableCell>
                      <TableCell className="px-4 text-sm text-foreground">{row.disputeId}</TableCell>
                      <TableCell className="px-4 text-sm text-foreground">{row.transactionId}</TableCell>
                      <TableCell className="px-4 text-sm text-foreground">{row.amount}</TableCell>
                      <TableCell className="px-4 text-sm text-foreground">{row.dueDate}</TableCell>
                      <TableCell className="px-4 text-sm text-foreground">{row.status}</TableCell>
                      <TableCell className="px-4 text-sm text-foreground">{row.action}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
