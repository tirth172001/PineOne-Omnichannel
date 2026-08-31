"use client"

import { useMemo, useState } from "react"
import {
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ChecksIcon,
  DownloadIcon,
  EnvelopeSimpleIcon,
  SpinnerIcon,
} from "@phosphor-icons/react"
import { useDateRangeFilter } from "@/components/shared/date-range-filter"
import { ListingToolbar, PAGE_HEADING_CLASSES, type ListingFilter } from "@/components/shared/listing-page-primitives"
import { useMoreFiltersPanel, type MoreFilterCategory } from "@/components/shared/more-filters-panel"
import { SummaryCardGroup } from "@/components/shared/summary-card-group"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

type RefundStatus = "Pending" | "Success" | "Failed" | "Session expired" | "Cancelled" | "User cancelled"

type RefundRow = {
  id: string
  transactionId: string
  refundId: string
  datePrimary: string
  dateSecondary: string
  storeName: string
  storeAddress: string
  amount: string
  amountSub: string
  status: RefundStatus
}

const refundRows: RefundRow[] = [
  { id: "r1", transactionId: "1525039333", refundId: "1525039333", datePrimary: "16 Aug 2026", dateSecondary: "10:10 PM", storeName: "PineLabs - Noida Kiosk", storeAddress: "PineLabs, Candor TechSpace, Noida, 584800", amount: "₹ 10,000", amountSub: "EMI", status: "Pending" },
  { id: "r2", transactionId: "1525039336", refundId: "1525039336", datePrimary: "18 Aug 2026", dateSecondary: "9:30 PM", storeName: "PineLabs - Sector 35", storeAddress: "PineLabs, Candor TechSpace, Noida, 584800", amount: "₹ 30,000", amountSub: "EMI", status: "Success" },
  { id: "r3", transactionId: "1525039339", refundId: "1525039339", datePrimary: "20 Aug 2026", dateSecondary: "3:00 PM", storeName: "PineLabs - Sector 21", storeAddress: "PineLabs, Candor TechSpace, Noida, 584800", amount: "₹ 15,000", amountSub: "EMI", status: "Failed" },
  { id: "r4", transactionId: "1525039335", refundId: "1525039335", datePrimary: "21 Aug 2026", dateSecondary: "1:00 PM", storeName: "PineLabs - Sector 27", storeAddress: "PineLabs, Candor TechSpace, Noida, 584800", amount: "₹ 20,000", amountSub: "EMI", status: "Session expired" },
  { id: "r5", transactionId: "1525039337", refundId: "1525039337", datePrimary: "19 Aug 2026", dateSecondary: "2:45 PM", storeName: "PineLabs - Sector 10", storeAddress: "PineLabs, Candor TechSpace, Noida, 584800", amount: "₹ 18,000", amountSub: "PX", status: "Cancelled" },
  { id: "r6", transactionId: "1525039338", refundId: "1525039338", datePrimary: "22 Aug 2026", dateSecondary: "4:30 PM", storeName: "PineLabs - Sector 15", storeAddress: "PineLabs, Candor TechSpace, Noida, 584800", amount: "₹ 40,000", amountSub: "EMI", status: "User cancelled" },
  { id: "r7", transactionId: "1525039334", refundId: "1525039334", datePrimary: "17 Aug 2026", dateSecondary: "11:15 AM", storeName: "PineLabs - Sector 12", storeAddress: "PineLabs, Candor TechSpace, Noida, 584800", amount: "₹ 25,000", amountSub: "EMI", status: "Success" },
  { id: "r8", transactionId: "1525039340", refundId: "1525039340", datePrimary: "25 Aug 2026", dateSecondary: "8:00 AM", storeName: "PineLabs - Sector 32", storeAddress: "PineLabs, Candor TechSpace, Noida, 584800", amount: "₹ 12,000", amountSub: "EMI", status: "Success" },
  { id: "r9", transactionId: "1525039333", refundId: "1525039333", datePrimary: "24 Aug 2026", dateSecondary: "6:00 PM", storeName: "PineLabs - Sector 22", storeAddress: "PineLabs, Candor TechSpace, Noida, 584800", amount: "₹ 35,000", amountSub: "EMI", status: "Success" },
  { id: "r10", transactionId: "1525039341", refundId: "1525039341", datePrimary: "23 Aug 2026", dateSecondary: "5:15 PM", storeName: "PineLabs - Sector 11", storeAddress: "PineLabs, Candor TechSpace, Noida, 584800", amount: "₹ 50,000", amountSub: "EMI", status: "Success" },
]

const refundStatuses: RefundStatus[] = ["Pending", "Success", "Failed", "Session expired", "Cancelled", "User cancelled"]

function statusDotClass(status: RefundStatus) {
  if (status === "Success") return "bg-emerald-500"
  if (status === "Pending") return "bg-amber-500"
  return "bg-red-500"
}

function RefundStatusBadge({ status }: { status: RefundStatus }) {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-xs font-medium text-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(status)}`} />
      {status}
    </span>
  )
}

const moreFilterCategories: MoreFilterCategory[] = [
  {
    id: "amount-type",
    label: "Amount type",
    display: "badge",
    selectionMode: "multi",
    searchable: false,
    options: [
      { id: "EMI", label: "EMI" },
      { id: "PX", label: "PX" },
    ],
  },
]

export function RefundsContent() {
  const [channel, setChannel] = useState<"in-store" | "online">("in-store")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | RefundStatus>("all")
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const dateRangeFilter = useDateRangeFilter()
  const moreFilters = useMoreFiltersPanel(moreFilterCategories)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return refundRows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false
      if (!q) return true
      return `${row.transactionId} ${row.refundId} ${row.storeName}`.toLowerCase().includes(q)
    })
  }, [search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const clampedPage = Math.min(page, totalPages)
  const pagedRows = filtered.slice((clampedPage - 1) * rowsPerPage, (clampedPage - 1) * rowsPerPage + rowsPerPage)

  const filters: ListingFilter[] = [
    dateRangeFilter.filter,
    {
      id: "status",
      type: "select",
      label: "Status",
      value: statusFilter,
      onValueChange: (value) => {
        setStatusFilter(value as typeof statusFilter)
        setPage(1)
      },
      options: [
        { label: "All statuses", value: "all" },
        ...refundStatuses.map((status) => ({ label: status, value: status })),
      ],
    },
  ]

  return (
    <div>
      <section className="flex flex-wrap items-center justify-between gap-4 px-8 pt-8">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className={PAGE_HEADING_CLASSES}>Refunds</h1>
          <Tabs value={channel} onValueChange={(value) => { setChannel(value as typeof channel); setPage(1) }}>
            <TabsList className="h-8 rounded-[8px] bg-muted p-1">
              <TabsTrigger value="in-store" className="h-6 rounded-[6px] border-transparent px-4 py-1 text-sm font-medium text-muted-foreground data-active:!border-transparent data-active:!bg-background data-active:!text-foreground">In-store payments</TabsTrigger>
              <TabsTrigger value="online" className="h-6 rounded-[6px] border-transparent px-4 py-1 text-sm font-medium text-muted-foreground data-active:!border-transparent data-active:!bg-background data-active:!text-foreground">Online payment</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-8">Bulk upload history</Button>
          <Button size="sm" className="h-8">Bulk refunds</Button>
        </div>
      </section>

      <Separator className="mt-6" />

      <section className="px-8 pt-6">
        <SummaryCardGroup
          cards={[
            {
              icon: SpinnerIcon,
              label: "Refunds pending",
              value: (
                <>
                  ₹10,00,000<span className="text-sm font-medium text-muted-foreground">.00</span>
                </>
              ),
              subtext: "1000 payments",
            },
            {
              icon: ChecksIcon,
              label: "Refunded amount",
              value: (
                <>
                  ₹6,00,000<span className="text-sm font-medium text-muted-foreground">.00</span>
                </>
              ),
              subtext: "94 payments resolved",
            },
          ]}
        />
      </section>

      <ListingToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="Search by any ID"
        filters={filters}
        {...moreFilters.toolbarProps}
        rightActions={
          <>
            <Button variant="outline" size="sm" className="h-8">
              <EnvelopeSimpleIcon className="h-4 w-4" />
              Email filtered
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <DownloadIcon className="h-4 w-4" />
              Download filtered
            </Button>
          </>
        }
      />

      <section className="px-8 pb-6">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow className="h-10">
                  <TableHead className="px-4 text-sm font-medium text-muted-foreground">Transaction ID</TableHead>
                  <TableHead className="px-4 text-sm font-medium text-muted-foreground">Refund ID</TableHead>
                  <TableHead className="px-4 text-sm font-medium text-muted-foreground">Refund date</TableHead>
                  <TableHead className="px-4 text-sm font-medium text-muted-foreground">Store name</TableHead>
                  <TableHead className="px-4 text-right text-sm font-medium text-muted-foreground">Amount</TableHead>
                  <TableHead className="px-4 text-sm font-medium text-muted-foreground">Refund status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRows.map((row) => (
                  <TableRow key={row.id} className="h-16 align-top">
                    <TableCell className="px-4 align-top text-sm font-medium text-foreground">{row.transactionId}</TableCell>
                    <TableCell className="px-4 align-top text-sm text-foreground">{row.refundId}</TableCell>
                    <TableCell className="px-4 align-top">
                      <p className="text-sm font-medium text-foreground">{row.datePrimary}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{row.dateSecondary}</p>
                    </TableCell>
                    <TableCell className="px-4 align-top">
                      <p className="text-sm font-medium text-foreground">{row.storeName}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{row.storeAddress}</p>
                    </TableCell>
                    <TableCell className="px-4 text-right align-top">
                      <p className="text-sm font-medium text-foreground">{row.amount}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{row.amountSub}</p>
                    </TableCell>
                    <TableCell className="px-4 align-top"><RefundStatusBadge status={row.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>Total {filtered.length} row(s)</p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">Rows per page</span>
              <Select value={String(rowsPerPage)} onValueChange={(value) => { setRowsPerPage(Number(value)); setPage(1) }}>
                <SelectTrigger size="sm" className="h-8 w-[70px] rounded-[10px] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50].map((value) => <SelectItem key={value} value={String(value)}>{value}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <span className="font-medium text-foreground">Page {clampedPage} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={clampedPage === 1} onClick={() => setPage(1)}><CaretDoubleLeftIcon className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={clampedPage === 1} onClick={() => setPage(clampedPage - 1)}><CaretLeftIcon className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={clampedPage === totalPages} onClick={() => setPage(clampedPage + 1)}><CaretRightIcon className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={clampedPage === totalPages} onClick={() => setPage(totalPages)}><CaretDoubleRightIcon className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
