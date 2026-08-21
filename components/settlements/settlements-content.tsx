"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { BellRingingIcon, DownloadIcon } from "@phosphor-icons/react"
import {
  ListingSummaryCards,
  ListingToolbar,
  type ListingFilter,
} from "@/components/shared/listing-page-primitives"
import { StatusPill, type StatusTone } from "@/components/shared/status-pill"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const settlementRows = [
  {
    batchId: "SLT-11101",
    utr: "UTR-5161",
    bankReference: "BR-3345",
    amount: "₹ 20,000",
    bankAccount: "xx9898",
    settlementDate: "Expected by 10 Aug 2026",
    initiationDate: "10 Aug 2026",
    status: "Processing",
  },
  {
    batchId: "SLT-11102",
    utr: "UTR-5162",
    bankReference: "BR-3346",
    amount: "₹ 30,000",
    bankAccount: "xx9898",
    settlementDate: "11 Aug 2026",
    initiationDate: "10 Aug 2026",
    status: "Settled",
  },
  {
    batchId: "SLT-11103",
    utr: "UTR-5163",
    bankReference: "BR-3347",
    amount: "₹ 18,500",
    bankAccount: "xx9898",
    settlementDate: "12 Aug 2026",
    initiationDate: "11 Aug 2026",
    status: "Settled",
  },
]

function toSettlementTone(status: string): StatusTone {
  return status.toLowerCase().includes("settled") ? "success" : "processing"
}

export function SettlementsContent() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("7d")
  const [statusFilter, setStatusFilter] = useState("all")

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return settlementRows.filter((row) => {
      const statusOk = statusFilter === "all" ? true : row.status.toLowerCase() === statusFilter
      if (!statusOk) return false
      if (!q) return true
      return `${row.utr} ${row.bankReference} ${row.bankAccount}`.toLowerCase().includes(q)
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
        { label: "Processing", value: "processing" },
        { label: "Settled", value: "settled" },
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
        <div className="px-8 pt-8 pb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-[30px] font-semibold leading-none text-foreground">Settlements</h1>
            <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">
              Change settlement preferences
            </Button>
          </div>

          <div className="mt-6 rounded-[8px] border border-border/60 bg-[var(--olive-surface-main)] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm text-foreground">
                <BellRingingIcon className="h-4 w-4 text-primary" />₹20,00,000 upcoming settlement in xx9898, HDFC bank by 7 Aug 2026, 10:00 AM
              </p>
              <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">
                Pause settlement
              </Button>
            </div>
          </div>
        </div>
        <Separator />
      </section>

      <div className="space-y-6 px-8 pt-8 pb-8">
        <ListingToolbar
          className="px-0 py-0"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search settlement"
          filters={filters}
          rightActions={
            <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">
              <DownloadIcon className="h-4 w-4" />
              Download filtered
            </Button>
          }
        />

        <section>
          <ListingSummaryCards
            className="px-0 py-0"
            cards={[
              { label: "Settled amount", value: "₹10,30,329" },
              { label: "Settlement under progress", value: "₹30,329" },
            ]}
          />
        </section>

        <section className="space-y-6">
          <div className="overflow-hidden rounded-[8px] border border-border bg-background">
            <div className="overflow-x-auto">
              <Table className="min-w-[1100px]">
                <TableHeader>
                  <TableRow className="h-10 [&>th:first-child]:rounded-tl-[8px] [&>th:last-child]:rounded-tr-[8px]">
                    <TableHead className="px-4 text-sm font-medium text-muted-foreground">UTR</TableHead>
                    <TableHead className="px-4 text-sm font-medium text-muted-foreground">Bank reference</TableHead>
                    <TableHead className="px-4 text-sm font-medium text-muted-foreground">Settlement amount</TableHead>
                    <TableHead className="px-4 text-sm font-medium text-muted-foreground">Bank account</TableHead>
                    <TableHead className="px-4 text-sm font-medium text-muted-foreground">Settlement date</TableHead>
                    <TableHead className="px-4 text-sm font-medium text-muted-foreground">Initiation date</TableHead>
                    <TableHead className="px-4 text-sm font-medium text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.utr}
                      className="h-[72px] cursor-pointer"
                      onClick={() => router.push(`/settlements/${row.batchId}`)}
                    >
                      <TableCell className="px-4 text-sm text-foreground">{row.utr}</TableCell>
                      <TableCell className="px-4 text-sm text-foreground">{row.bankReference}</TableCell>
                      <TableCell className="px-4 text-sm text-foreground">{row.amount}</TableCell>
                      <TableCell className="px-4 text-sm text-foreground">{row.bankAccount}</TableCell>
                      <TableCell className="px-4 text-sm text-foreground">{row.settlementDate}</TableCell>
                      <TableCell className="px-4 text-sm text-foreground">{row.initiationDate}</TableCell>
                      <TableCell className="px-4 text-sm text-foreground">
                        <StatusPill label={row.status} tone={toSettlementTone(row.status)} />
                      </TableCell>
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
