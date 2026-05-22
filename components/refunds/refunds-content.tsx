"use client"

import { useMemo, useState } from "react"
import { Download, Search } from "lucide-react"

import { ListingSummaryCards } from "@/components/shared/listing-page-primitives"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const rows = [
  {
    orderId: "ORD-5161",
    transactionId: "TXN-5161",
    merchantId: "MCNT-5161",
    amount: "₹20,000",
    paymentMode: "UPI",
    paymentDate: "16 Aug 2026",
    refundStatus: "Pending",
  },
  {
    orderId: "ORD-5162",
    transactionId: "TXN-5162",
    merchantId: "MCNT-5162",
    amount: "₹10,000",
    paymentMode: "Card",
    paymentDate: "18 Aug 2026",
    refundStatus: "Success",
  },
  {
    orderId: "ORD-5163",
    transactionId: "TXN-5163",
    merchantId: "MCNT-5163",
    amount: "₹30,000",
    paymentMode: "Net banking",
    paymentDate: "19 Aug 2026",
    refundStatus: "Failed",
  },
]

export function RefundsContent() {
  const [channel, setChannel] = useState("online")
  const [view, setView] = useState("payments")
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("7d")
  const [statusFilter, setStatusFilter] = useState("all")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((row) => {
      const statusOk = statusFilter === "all" ? true : row.refundStatus.toLowerCase() === statusFilter
      if (!statusOk) return false
      if (!q) return true
      return `${row.orderId} ${row.transactionId} ${row.merchantId}`.toLowerCase().includes(q)
    })
  }, [search, statusFilter])

  return (
    <div className="mx-auto w-full max-w-[1512px]">
      <section>
        <div className="px-8 pt-8 pb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-[30px] font-semibold leading-none text-foreground">Refunds</h1>
              <Tabs value={channel} onValueChange={setChannel}>
                <TabsList className="rounded-[8px] border border-border/70 bg-[var(--olive-surface-main)] p-1">
                  <TabsTrigger
                    value="in-store"
                    className="rounded-[8px] px-3 py-1.5 text-sm font-medium text-muted-foreground data-active:!rounded-[var(--radius-token-xs)] data-active:!bg-accent-foreground data-active:!text-background"
                  >
                    In-store payments
                  </TabsTrigger>
                  <TabsTrigger
                    value="online"
                    className="rounded-[8px] px-3 py-1.5 text-sm font-medium text-muted-foreground data-active:!rounded-[var(--radius-token-xs)] data-active:!bg-accent-foreground data-active:!text-background"
                  >
                    Online payments
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Button className="rounded-[8px] border border-primary/60 bg-primary text-primary-foreground hover:bg-primary/90">
              Bulk refunds
            </Button>
          </div>
        </div>
        <Separator />
      </section>

      <div className="space-y-6 px-8 pt-8 pb-8">
        <section className="px-0 py-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex max-w-full flex-nowrap items-center gap-3">
              <div className="relative w-[300px] shrink-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search refunds"
                  className="rounded-[8px] border-border/70 bg-background pl-10"
                />
              </div>

              <Separator orientation="vertical" className="h-8" />

              <Tabs value={view} onValueChange={setView}>
                <TabsList className="rounded-[8px] border border-border/70 bg-[var(--olive-surface-main)] p-1">
                  <TabsTrigger value="orders" className="px-3">
                    By orders
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="px-3">
                    By payments
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="min-w-[110px] rounded-[8px] border-border/70 bg-background px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7d">Last 7D</SelectItem>
                  <SelectItem value="30d">Last 30D</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="min-w-[110px] rounded-[8px] border-border/70 bg-background px-3">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">
                More filters
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">
                <Download className="h-4 w-4" />
                Download filtered
              </Button>
            </div>
          </div>
        </section>

        <section>
          <ListingSummaryCards
            className="px-0 py-0"
            cards={[
              { label: "Refund amount", value: "₹10,30,329" },
              { label: "Refund transactions", value: "3000" },
            ]}
          />
        </section>

        <section className="space-y-6">
          <div className="overflow-hidden rounded-[8px] border border-border/60 bg-background">
            <div className="overflow-x-auto">
              <Table className="min-w-[1100px]">
                <TableHeader>
                  <TableRow className="h-10 border-border/60 bg-[var(--surface-header)] hover:bg-[var(--surface-header)] [&>th:first-child]:rounded-tl-[8px] [&>th:last-child]:rounded-tr-[8px]">
                    <TableHead className="px-4 text-sm font-medium text-muted-foreground">Order ID</TableHead>
                    <TableHead className="px-4 text-sm font-medium text-muted-foreground">Transaction ID</TableHead>
                    <TableHead className="px-4 text-sm font-medium text-muted-foreground">Merchant ID</TableHead>
                    <TableHead className="px-4 text-sm font-medium text-muted-foreground">Amount</TableHead>
                    <TableHead className="px-4 text-sm font-medium text-muted-foreground">Payment mode</TableHead>
                    <TableHead className="px-4 text-sm font-medium text-muted-foreground">Payment date</TableHead>
                    <TableHead className="px-4 text-sm font-medium text-muted-foreground">Refund status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => (
                    <TableRow key={row.transactionId} className="h-[72px] border-border/60 hover:bg-muted/20">
                      <TableCell className="px-4 text-sm text-foreground">{row.orderId}</TableCell>
                      <TableCell className="px-4 text-sm text-foreground">{row.transactionId}</TableCell>
                      <TableCell className="px-4 text-sm text-foreground">{row.merchantId}</TableCell>
                      <TableCell className="px-4 text-sm text-foreground">{row.amount}</TableCell>
                      <TableCell className="px-4 text-sm text-foreground">{row.paymentMode}</TableCell>
                      <TableCell className="px-4 text-sm text-foreground">{row.paymentDate}</TableCell>
                      <TableCell className="px-4 text-sm text-foreground">{row.refundStatus}</TableCell>
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
