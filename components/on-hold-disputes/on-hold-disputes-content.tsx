"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, ChevronDown, Copy, Download, PauseCircle, Search, WalletCards } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
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
import { StatusPill } from "@/components/shared/status-pill"
import {
  disputeActionLabel,
  disputeRecords,
  disputeStatusTone,
  onHoldRecords,
  onHoldStatusTone,
  type OnHoldStatus,
} from "@/components/on-hold-disputes/on-hold-disputes-data"

function parseInr(amount: string) {
  return Number(amount.replace(/[^\d]/g, "")) || 0
}

function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`
}

export function OnHoldDisputesContent() {
  const router = useRouter()
  const [channel, setChannel] = useState<"in-store" | "online">("in-store")
  const [tab, setTab] = useState<"on-hold" | "disputes">("on-hold")
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState<"today" | "all">("today")
  const [statusFilter, setStatusFilter] = useState<"all" | OnHoldStatus>("all")

  const onHoldForChannel = useMemo(
    () => onHoldRecords.filter((row) => row.channel === channel),
    [channel]
  )

  const disputesForChannel = useMemo(
    () => disputeRecords.filter((row) => row.channel === channel),
    [channel]
  )

  const filteredOnHold = useMemo(() => {
    const q = search.trim().toLowerCase()
    return onHoldForChannel.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false
      if (!q) return true
      return `${row.transactionId} ${row.amount} ${row.reason}`.toLowerCase().includes(q)
    })
  }, [onHoldForChannel, search, statusFilter])

  const filteredDisputes = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return disputesForChannel
    return disputesForChannel.filter((row) =>
      `${row.id} ${row.transactionId} ${row.amount}`.toLowerCase().includes(q)
    )
  }, [disputesForChannel, search])

  const onHoldSummary = useMemo(() => {
    const onHoldStatuses = new Set<OnHoldStatus>(["Action pending", "In review", "Settlement initiated"])
    const held = onHoldForChannel.filter((row) => onHoldStatuses.has(row.status))
    const released = onHoldForChannel.filter((row) => row.status === "Settled")
    return {
      heldAmount: held.reduce((sum, row) => sum + parseInr(row.amount), 0),
      heldCount: held.length,
      releasedAmount: released.reduce((sum, row) => sum + parseInr(row.amount), 0),
      releasedCount: released.length,
    }
  }, [onHoldForChannel])

  const onHoldStatuses: OnHoldStatus[] = ["Action pending", "In review", "Settlement initiated", "Rejected", "Settled"]

  return (
    <div>
      <section className="flex flex-wrap items-center gap-4 px-8 pt-8">
        <h1 className="text-3xl font-semibold leading-8 tracking-[-0.4px] text-foreground">On-hold &amp; disputes</h1>
        <Tabs value={channel} onValueChange={(value) => setChannel(value as typeof channel)}>
          <TabsList className="h-8 rounded-[8px] bg-muted p-1">
            <TabsTrigger value="in-store" className="h-6 rounded-[6px] border-transparent px-4 py-1 text-sm font-medium text-muted-foreground data-active:!border-transparent data-active:!bg-background data-active:!text-foreground">In-store payments</TabsTrigger>
            <TabsTrigger value="online" className="h-6 rounded-[6px] border-transparent px-4 py-1 text-sm font-medium text-muted-foreground data-active:!border-transparent data-active:!bg-background data-active:!text-foreground">Online payment</TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      <section className="px-8 pt-8">
        <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
          <TabsList variant="line" className="h-8 gap-6 bg-transparent p-0">
            <TabsTrigger value="on-hold" className="h-8 rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent px-0 py-0 text-sm font-medium text-muted-foreground data-active:!border-x-0 data-active:!border-t-0 data-active:!border-b-2 data-active:!border-primary data-active:!bg-transparent data-active:!text-primary data-active:!shadow-none group-data-[variant=line]/tabs-list:data-active:after:opacity-0">On-hold</TabsTrigger>
            <TabsTrigger value="disputes" className="h-8 rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent px-0 py-0 text-sm font-medium text-muted-foreground data-active:!border-x-0 data-active:!border-t-0 data-active:!border-b-2 data-active:!border-primary data-active:!bg-transparent data-active:!text-primary data-active:!shadow-none group-data-[variant=line]/tabs-list:data-active:after:opacity-0">Disputes</TabsTrigger>
          </TabsList>
        </Tabs>
      </section>
      <Separator className="mt-0" />

      <section className="flex flex-wrap items-center justify-between gap-4 px-8 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-[229px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by any ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-8 rounded-md pl-8"
            />
          </div>
          <div className="h-6 w-px bg-border" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <CalendarDays className="h-4 w-4" />
                {dateFilter === "today" ? "Today" : "All dates"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuRadioGroup value={dateFilter} onValueChange={(value) => setDateFilter(value as typeof dateFilter)}>
                <DropdownMenuRadioItem value="today">Today</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="all">All dates</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Status
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                <DropdownMenuRadioItem value="all">All statuses</DropdownMenuRadioItem>
                {onHoldStatuses.map((status) => <DropdownMenuRadioItem key={status} value={status}>{status}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button variant="outline" size="sm" className="h-8">
          <Download className="h-4 w-4" />
          Download filtered
        </Button>
      </section>

      {tab === "on-hold" ? (
        <>
          <section className="px-8">
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="grid md:grid-cols-2">
                <div className="flex flex-col gap-2 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <PauseCircle className="h-5 w-5 text-foreground" />
                    <p className="text-base font-medium text-card-foreground">Amount on hold</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold leading-7 text-foreground">{formatInr(onHoldSummary.heldAmount)}</p>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">{onHoldSummary.heldCount} payments</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 border-t border-border px-5 py-4 md:border-l md:border-t-0">
                  <div className="flex items-center gap-2">
                    <WalletCards className="h-5 w-5 text-foreground" />
                    <p className="text-base font-medium text-card-foreground">Amount released</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold leading-7 text-foreground">{formatInr(onHoldSummary.releasedAmount)}</p>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">{onHoldSummary.releasedCount} payments resolved</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-8 py-6">
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow className="h-10">
                      <TableHead className="px-4 text-sm font-medium text-muted-foreground">Transaction date</TableHead>
                      <TableHead className="px-4 text-sm font-medium text-muted-foreground">Transaction ID</TableHead>
                      <TableHead className="px-4 text-sm font-medium text-muted-foreground">Amount</TableHead>
                      <TableHead className="px-4 text-sm font-medium text-muted-foreground">Status</TableHead>
                      <TableHead className="px-4 text-sm font-medium text-muted-foreground">Reason or type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOnHold.map((row) => (
                      <TableRow
                        key={row.id}
                        className="h-16 cursor-pointer align-top"
                        onClick={() => router.push(`/on-hold-disputes/on-hold/${row.id}`)}
                      >
                        <TableCell className="px-4 align-top">
                          <p className="text-sm font-medium text-foreground">{row.datePrimary}</p>
                          <p className="mt-0.5 text-sm text-muted-foreground">{row.dateSecondary}</p>
                        </TableCell>
                        <TableCell className="px-4 align-top">
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                            {row.transactionId}
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          </span>
                        </TableCell>
                        <TableCell className="px-4 align-top text-sm font-medium text-foreground">{row.amount}</TableCell>
                        <TableCell className="px-4 align-top"><StatusPill label={row.status} tone={onHoldStatusTone(row.status)} /></TableCell>
                        <TableCell className="px-4 align-top text-sm text-foreground">{row.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </section>
        </>
      ) : (
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
                      onClick={() => router.push(`/on-hold-disputes/disputes/${row.id}`)}
                    >
                      <TableCell className="px-4 align-top text-sm text-foreground">{row.createdOn}</TableCell>
                      <TableCell className="px-4 align-top text-sm font-medium text-foreground">{row.id}</TableCell>
                      <TableCell className="px-4 align-top text-sm text-foreground">{row.transactionId}</TableCell>
                      <TableCell className="px-4 align-top text-sm text-foreground">{row.amount}</TableCell>
                      <TableCell className="px-4 align-top text-sm text-foreground">{row.dueDate}</TableCell>
                      <TableCell className="px-4 align-top"><StatusPill label={row.status} tone={disputeStatusTone(row)} /></TableCell>
                      <TableCell className="px-4 align-top text-sm text-foreground">{disputeActionLabel(row)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
