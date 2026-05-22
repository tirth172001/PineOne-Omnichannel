"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpDown,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleCheck,
  Columns3,
  Copy,
  Download,
  Info,
  Loader2,
  Plus,
  QrCode,
  CreditCard,
  Smartphone,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type SettlementStatus = "Processing" | "Settled"
type BankName = "HDFC" | "AXIS"

type SettlementRow = {
  id: string
  batchId: string
  utr: string
  bankReference: string
  settlementAmount: number
  accountLabel: string
  bankName: BankName
  settlementDatePrimary: string
  settlementDateSecondary: string
  initiationDatePrimary: string
  initiationDateSecondary: string
  status: SettlementStatus
  typeIcon?: "lightning" | "timer"
}

type SettlementDetailTransaction = {
  id: string
  storeName: string
  paymentMethodLabel: string
  paymentMethodSubLabel: string
  paymentMethod: "upi" | "card" | "netbanking"
  transactionAmount: number
  settlementAmount: number
  deductions: number
  paymentDate: string
  paymentTime: string
}

type ColumnKey =
  | "utr"
  | "bankReference"
  | "settlementAmount"
  | "bankAccount"
  | "settlementDate"
  | "initiationDate"
  | "status"

const rows: SettlementRow[] = [
  {
    id: "set-1",
    batchId: "SLT-11101",
    utr: "UTR-5161",
    bankReference: "BR-5161",
    settlementAmount: 20000,
    accountLabel: "XX9898",
    bankName: "HDFC",
    settlementDatePrimary: "Expected by 10 Aug 2026",
    settlementDateSecondary: "10:10 PM",
    initiationDatePrimary: "10 Aug 2026",
    initiationDateSecondary: "10:10 PM",
    status: "Processing",
    typeIcon: "lightning",
  },
  {
    id: "set-2",
    batchId: "SLT-11102",
    utr: "UTR-5163",
    bankReference: "BR-5163",
    settlementAmount: 10000,
    accountLabel: "XX9898",
    bankName: "AXIS",
    settlementDatePrimary: "18 Aug 2026",
    settlementDateSecondary: "9:30 PM",
    initiationDatePrimary: "18 Aug 2026",
    initiationDateSecondary: "9:30 PM",
    status: "Settled",
  },
  {
    id: "set-3",
    batchId: "SLT-11103",
    utr: "UTR-5161",
    bankReference: "BR-5164",
    settlementAmount: 25000,
    accountLabel: "XX9898",
    bankName: "AXIS",
    settlementDatePrimary: "Expected by 10 Aug 2026",
    settlementDateSecondary: "10:10 PM",
    initiationDatePrimary: "10 Aug 2026",
    initiationDateSecondary: "10:10 PM",
    status: "Processing",
    typeIcon: "lightning",
  },
  {
    id: "set-4",
    batchId: "SLT-11104",
    utr: "UTR-5165",
    bankReference: "BR-5165",
    settlementAmount: 30000,
    accountLabel: "XX9898",
    bankName: "HDFC",
    settlementDatePrimary: "Expected by 10 Aug 2026",
    settlementDateSecondary: "10:10 PM",
    initiationDatePrimary: "10 Aug 2026",
    initiationDateSecondary: "10:10 PM",
    status: "Processing",
    typeIcon: "lightning",
  },
  {
    id: "set-5",
    batchId: "SLT-11105",
    utr: "UTR-5166",
    bankReference: "BR-5166",
    settlementAmount: 35000,
    accountLabel: "XX9898",
    bankName: "HDFC",
    settlementDatePrimary: "19 Aug 2026",
    settlementDateSecondary: "2:45 PM",
    initiationDatePrimary: "19 Aug 2026",
    initiationDateSecondary: "2:45 PM",
    status: "Settled",
  },
  {
    id: "set-6",
    batchId: "SLT-11106",
    utr: "UTR-5161",
    bankReference: "BR-5167",
    settlementAmount: 40000,
    accountLabel: "XX9898",
    bankName: "AXIS",
    settlementDatePrimary: "22 Aug 2026",
    settlementDateSecondary: "4:30 PM",
    initiationDatePrimary: "22 Aug 2026",
    initiationDateSecondary: "4:30 PM",
    status: "Settled",
    typeIcon: "timer",
  },
  {
    id: "set-7",
    batchId: "SLT-11107",
    utr: "UTR-5168",
    bankReference: "BR-5168",
    settlementAmount: 45000,
    accountLabel: "XX9898",
    bankName: "HDFC",
    settlementDatePrimary: "17 Aug 2026",
    settlementDateSecondary: "11:15 AM",
    initiationDatePrimary: "17 Aug 2026",
    initiationDateSecondary: "11:15 AM",
    status: "Settled",
  },
  {
    id: "set-8",
    batchId: "SLT-11108",
    utr: "UTR-5169",
    bankReference: "BR-5169",
    settlementAmount: 50000,
    accountLabel: "XX9898",
    bankName: "HDFC",
    settlementDatePrimary: "25 Aug 2026",
    settlementDateSecondary: "8:00 AM",
    initiationDatePrimary: "25 Aug 2026",
    initiationDateSecondary: "8:00 AM",
    status: "Settled",
  },
  {
    id: "set-9",
    batchId: "SLT-11109",
    utr: "UTR-5170",
    bankReference: "BR-5170",
    settlementAmount: 55000,
    accountLabel: "XX9898",
    bankName: "HDFC",
    settlementDatePrimary: "24 Aug 2026",
    settlementDateSecondary: "6:00 PM",
    initiationDatePrimary: "24 Aug 2026",
    initiationDateSecondary: "6:00 PM",
    status: "Settled",
  },
  {
    id: "set-10",
    batchId: "SLT-11110",
    utr: "UTR-5171",
    bankReference: "BR-5171",
    settlementAmount: 60000,
    accountLabel: "XX9898",
    bankName: "HDFC",
    settlementDatePrimary: "23 Aug 2026",
    settlementDateSecondary: "5:15 PM",
    initiationDatePrimary: "23 Aug 2026",
    initiationDateSecondary: "5:15 PM",
    status: "Settled",
  },
]

const settlementDetailTransactions: SettlementDetailTransaction[] = [
  { id: "TXN-5161", storeName: "PineLabs - Indiranagar", paymentMethodLabel: "GPay", paymentMethodSubLabel: "UPI", paymentMethod: "upi", transactionAmount: 20000, settlementAmount: 19000, deductions: 1000, paymentDate: "16 Aug 2026", paymentTime: "10:10 PM" },
  { id: "TXN-5163", storeName: "PineLabs - BTM Layout", paymentMethodLabel: "Visa XX6765", paymentMethodSubLabel: "Card", paymentMethod: "card", transactionAmount: 10000, settlementAmount: 25000, deductions: 1200, paymentDate: "18 Aug 2026", paymentTime: "9:30 PM" },
  { id: "TXN-5164", storeName: "PineLabs - MG Road", paymentMethodLabel: "Mastercard XX6765", paymentMethodSubLabel: "Card", paymentMethod: "card", transactionAmount: 25000, settlementAmount: 24500, deductions: 950, paymentDate: "20 Aug 2026", paymentTime: "3:00 PM" },
  { id: "TXN-5165", storeName: "PineLabs - Whitefield", paymentMethodLabel: "Rupay XX6765", paymentMethodSubLabel: "Card", paymentMethod: "card", transactionAmount: 30000, settlementAmount: 22000, deductions: 1389, paymentDate: "21 Aug 2026", paymentTime: "1:00 PM" },
  { id: "TXN-5166", storeName: "PineLabs - Jayanagar", paymentMethodLabel: "HDFC XX6765", paymentMethodSubLabel: "Net banking", paymentMethod: "netbanking", transactionAmount: 35000, settlementAmount: 19000, deductions: 983, paymentDate: "19 Aug 2026", paymentTime: "2:45 PM" },
  { id: "TXN-5167", storeName: "PineLabs - Marathahalli", paymentMethodLabel: "Axis XX9892", paymentMethodSubLabel: "Net banking", paymentMethod: "netbanking", transactionAmount: 40000, settlementAmount: 27500, deductions: 1750, paymentDate: "22 Aug 2026", paymentTime: "4:30 PM" },
  { id: "TXN-5168", storeName: "PineLabs - Koramangala", paymentMethodLabel: "CRED", paymentMethodSubLabel: "UPI", paymentMethod: "upi", transactionAmount: 45000, settlementAmount: 26000, deductions: 2000, paymentDate: "17 Aug 2026", paymentTime: "11:15 AM" },
  { id: "TXN-5169", storeName: "PineLabs - Ulsoor", paymentMethodLabel: "PhonePe", paymentMethodSubLabel: "UPI", paymentMethod: "upi", transactionAmount: 50000, settlementAmount: 23000, deductions: 1500, paymentDate: "25 Aug 2026", paymentTime: "8:00 AM" },
  { id: "TXN-5170", storeName: "PineLabs - Indiranagar", paymentMethodLabel: "PayTm", paymentMethodSubLabel: "UPI", paymentMethod: "upi", transactionAmount: 55000, settlementAmount: 21500, deductions: 800, paymentDate: "24 Aug 2026", paymentTime: "6:00 PM" },
  { id: "TXN-5171", storeName: "PineLabs - HSR Layout", paymentMethodLabel: "PhonePe", paymentMethodSubLabel: "UPI", paymentMethod: "upi", transactionAmount: 60000, settlementAmount: 20000, deductions: 1000, paymentDate: "23 Aug 2026", paymentTime: "5:15 PM" },
]

function inr(value: number) {
  return `₹ ${value.toLocaleString("en-IN")}`
}

function StatusBadge({ status }: { status: SettlementStatus }) {
  return (
    <span className="inline-flex h-7 items-center gap-1 rounded-full border border-border/70 bg-background px-2.5 text-xs text-foreground">
      {status === "Processing" ? (
        <Loader2 className="h-3 w-3 text-warning" />
      ) : (
        <CircleCheck className="h-3 w-3 text-success" />
      )}
      {status}
    </span>
  )
}

function RowTypeIcon({ typeIcon }: { typeIcon?: SettlementRow["typeIcon"] }) {
  if (!typeIcon) return null
  return <span className="text-muted-foreground">{typeIcon === "timer" ? "◌" : "⚡"}</span>
}

function getSettlementStatusGradientClass(status?: SettlementStatus) {
  if (status === "Settled") return "from-success/25 via-success/10 to-background"
  return "from-warning/25 via-warning/10 to-background"
}

interface V3SettlementsContentProps {
  initialBatchId?: string
}

export function V3SettlementsContent({ initialBatchId }: V3SettlementsContentProps) {
  const router = useRouter()
  const isDetailMode = Boolean(initialBatchId)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "processing" | "settled">("all")
  const [dateFilter, setDateFilter] = useState<"today" | "all">("today")
  const [bankFilter, setBankFilter] = useState<"all" | "hdfc" | "axis">("all")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [onDemandEnabled, setOnDemandEnabled] = useState(false)
  const [sameDayEnabled, setSameDayEnabled] = useState(false)
  const [settlementPaused, setSettlementPaused] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    utr: true,
    bankReference: true,
    settlementAmount: true,
    bankAccount: true,
    settlementDate: true,
    initiationDate: true,
    status: true,
  })
  const [detailRowsPerPage, setDetailRowsPerPage] = useState(10)
  const [detailPage, setDetailPage] = useState(1)

  const filteredDetailRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return settlementDetailTransactions
    return settlementDetailTransactions.filter((row) => {
      return (
        row.id.toLowerCase().includes(query) ||
        row.storeName.toLowerCase().includes(query) ||
        row.paymentMethodLabel.toLowerCase().includes(query) ||
        row.paymentMethodSubLabel.toLowerCase().includes(query)
      )
    })
  }, [searchQuery])

  const detailTotalPages = Math.max(1, Math.ceil(filteredDetailRows.length / detailRowsPerPage))
  const detailClampedPage = Math.min(detailPage, detailTotalPages)
  const detailPagedRows = useMemo(() => {
    const start = (detailClampedPage - 1) * detailRowsPerPage
    return filteredDetailRows.slice(start, start + detailRowsPerPage)
  }, [detailClampedPage, detailRowsPerPage, filteredDetailRows])
  const currentSettlement = useMemo(() => {
    if (!initialBatchId) return null
    return rows.find((row) => row.batchId === initialBatchId) ?? null
  }, [initialBatchId])

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return rows
      .filter((row) => {
        if (!query) return true
        return (
          row.utr.toLowerCase().includes(query) ||
          row.bankReference.toLowerCase().includes(query) ||
          row.accountLabel.toLowerCase().includes(query) ||
          row.bankName.toLowerCase().includes(query)
        )
      })
      .filter((row) => (statusFilter === "all" ? true : row.status.toLowerCase() === statusFilter))
      .filter((row) => {
        if (bankFilter === "all") return true
        return row.bankName.toLowerCase() === bankFilter
      })
      .filter((row) => {
        if (dateFilter === "all") return true
        return ["set-1", "set-2", "set-3", "set-4"].includes(row.id)
      })
      .sort((a, b) => (sortDirection === "asc" ? a.settlementAmount - b.settlementAmount : b.settlementAmount - a.settlementAmount))
  }, [bankFilter, dateFilter, searchQuery, sortDirection, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage))
  const clampedPage = Math.min(page, totalPages)
  const pagedRows = useMemo(() => {
    const start = (clampedPage - 1) * rowsPerPage
    return filteredRows.slice(start, start + rowsPerPage)
  }, [clampedPage, filteredRows, rowsPerPage])

  function exportFilteredCsv() {
    const header = [
      "UTR",
      "Bank reference",
      "Settlement amount",
      "Bank account",
      "Settlement date",
      "Initiation date",
      "Status",
    ]
    const csvRows = filteredRows.map((row) =>
      [
        row.utr,
        row.bankReference,
        row.settlementAmount,
        `${row.accountLabel} ${row.bankName}`,
        `${row.settlementDatePrimary} ${row.settlementDateSecondary}`,
        `${row.initiationDatePrimary} ${row.initiationDateSecondary}`,
        row.status,
      ].join(","),
    )
    const blob = new Blob([[header.join(","), ...csvRows].join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "settlements-filtered.csv"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (isDetailMode) {
    return (
      <div className="relative pb-8">
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-[301px] bg-gradient-to-b ${getSettlementStatusGradientClass(currentSettlement?.status)}`}
        />
        <div className="relative z-10 space-y-8 px-8 py-8">
          <div className="flex h-8 items-center">
            <Button asChild variant="ghost" className="h-8 px-2 text-xs hover:bg-background/20">
              <Link href="/settlements">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>

          <div className="w-full space-y-6">
            <div className="space-y-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#ff4a32]">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] bg-white">
                  <Plus className="h-5 w-5 text-[#ff4a32]" />
                </span>
              </span>
              <div className="flex items-center gap-2">
                <p className="text-[30px] font-semibold leading-[36px] text-foreground">₹1,20,000</p>
                <span className="inline-flex items-center p-1.5">
                  <Info className="h-6 w-6 text-muted-foreground" />
                </span>
                <span className="inline-flex h-6 items-center gap-1 rounded-full border border-border/80 bg-background pl-2 pr-3 text-xs leading-none text-foreground">
                  {currentSettlement?.status === "Processing" ? (
                    <Loader2 className="h-3 w-3 text-warning" />
                  ) : (
                    <CircleCheck className="h-3 w-3 text-success" />
                  )}
                  {currentSettlement?.status ?? "Processing"}
                </span>
              </div>
              <div className="flex items-start gap-4 text-base leading-6 text-muted-foreground">
                <span>Bank: xx4989, {currentSettlement?.bankName ?? "HDFC"} bank</span>
                <span className="h-6 w-px bg-border/70" />
                <span>Transactions: 32 transactions</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="inline-flex h-6 items-center gap-1 rounded-full border border-border/80 bg-background px-2 text-xs leading-none text-foreground">
                  Settlement batch ID: {currentSettlement?.batchId ?? initialBatchId}
                  <Copy className="h-3 w-3 text-muted-foreground" />
                </span>
                <span className="inline-flex h-6 items-center gap-1 rounded-full border border-border/80 bg-background px-2 text-xs leading-none text-foreground">
                  Merchant ID: MCT-11101
                  <Copy className="h-3 w-3 text-muted-foreground" />
                </span>
              </div>
            </div>

            <div className="h-px w-full bg-border/70" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="h-8">All mode <ChevronDown className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" className="h-8">Today <ChevronDown className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" className="h-8">More filters</Button>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="h-8 px-2.5 text-sm">Reset</Button>
                <div className="h-6 w-px bg-border/70" />
                <Button variant="ghost" size="icon-sm" className="h-8 w-[51px]"><ArrowUpDown className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon-sm" className="h-8 w-[51px]"><Columns3 className="h-4 w-4" /></Button>
                <div className="h-6 w-px bg-border/70" />
                <div className="relative w-[229px]">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search transaction"
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value)
                      setDetailPage(1)
                    }}
                    className="h-8 rounded-md pl-8"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="overflow-hidden rounded-md border border-border/70">
                <div className="overflow-x-auto">
                  <Table className="min-w-[1120px]">
                    <TableHeader>
                      <TableRow className="h-10 border-border/70">
                        <TableHead className="px-3 text-sm font-medium text-muted-foreground">Transaction ID</TableHead>
                        <TableHead className="px-3 text-sm font-medium text-muted-foreground">Store name</TableHead>
                        <TableHead className="px-3 text-sm font-medium text-muted-foreground">Payment mode</TableHead>
                        <TableHead className="px-3 text-right text-sm font-medium text-muted-foreground">Transaction amount</TableHead>
                        <TableHead className="px-3 text-right text-sm font-medium text-muted-foreground">Settlement amount</TableHead>
                        <TableHead className="px-3 text-right text-sm font-medium text-muted-foreground">Deductions</TableHead>
                        <TableHead className="px-3 text-sm font-medium text-muted-foreground">Payment date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailPagedRows.map((row) => {
                        const Icon = row.paymentMethod === "upi" ? QrCode : row.paymentMethod === "card" ? CreditCard : Smartphone
                        return (
                          <TableRow key={row.id} className="h-[72px] border-border/70">
                            <TableCell className="px-3 text-sm text-foreground">{row.id}</TableCell>
                            <TableCell className="px-3 text-sm text-foreground">{row.storeName}</TableCell>
                            <TableCell className="px-3">
                              <div className="flex items-start gap-2">
                                <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm text-foreground">{row.paymentMethodLabel}</p>
                                  <p className="text-sm text-muted-foreground">{row.paymentMethodSubLabel}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-3 text-right text-sm text-foreground">{inr(row.transactionAmount)}</TableCell>
                            <TableCell className="px-3 text-right text-sm text-foreground">{inr(row.settlementAmount)}</TableCell>
                            <TableCell className="px-3 text-right text-sm text-foreground">₹ {row.deductions}</TableCell>
                            <TableCell className="px-3">
                              <p className="text-sm text-foreground">{row.paymentDate}</p>
                              <p className="text-sm text-muted-foreground">{row.paymentTime}</p>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <p>0 of {filteredDetailRows.length} row(s) selected.</p>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">Rows per page</span>
                    <Select value={String(detailRowsPerPage)} onValueChange={(value) => { setDetailRowsPerPage(Number(value)); setDetailPage(1) }}>
                      <SelectTrigger size="sm" className="h-8 w-[70px] rounded-lg text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-sm font-medium text-foreground">Page {detailClampedPage} of {detailTotalPages}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md border-border/60 bg-background/80" disabled={detailClampedPage <= 1} onClick={() => setDetailPage(1)}><ChevronsLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md border-border/60 bg-background/80" disabled={detailClampedPage <= 1} onClick={() => setDetailPage((current) => Math.max(1, current - 1))}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md border-border/60 bg-background/80" disabled={detailClampedPage >= detailTotalPages} onClick={() => setDetailPage((current) => Math.min(detailTotalPages, current + 1))}><ChevronRight className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md border-border/60 bg-background/80" disabled={detailClampedPage >= detailTotalPages} onClick={() => setDetailPage(detailTotalPages)}><ChevronsRight className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-8">
      <div className="space-y-6 px-8 py-8">
        <div className="rounded-xl border border-border bg-card px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-[5px] bg-muted">
                <Building2 className="h-4 w-4 text-foreground" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">₹20,00,000 upcoming settlement on 7 Aug 2026, 10:00 AM</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Amount will be settled in HDFC, xx8989 bank account</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSettlementPaused((current) => !current)}>
              {settlementPaused ? "Resume settlement" : "Pause settlement"}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <h1 className="text-[30px] font-semibold leading-[32px] tracking-[-0.4px] text-foreground">Settlements</h1>
          <div className="flex items-center gap-3">
            <div className="relative w-[229px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search settlements"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                  setPage(1)
                }}
                className="h-8 rounded-md pl-8"
              />
            </div>
            <Button variant="outline" size="sm" className="h-8" onClick={() => setPreferencesOpen(true)}>
              Change settlement preferences
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">All Status <ChevronDown className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => { setStatusFilter(value as typeof statusFilter); setPage(1) }}>
                  <DropdownMenuRadioItem value="all">All Status</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="processing">Processing</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="settled">Settled</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">Today <ChevronDown className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuRadioGroup value={dateFilter} onValueChange={(value) => { setDateFilter(value as typeof dateFilter); setPage(1) }}>
                  <DropdownMenuRadioItem value="today">Today</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="all">All dates</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">More filters</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuLabel>Bank account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={bankFilter} onValueChange={(value) => { setBankFilter(value as typeof bankFilter); setPage(1) }}>
                  <DropdownMenuRadioItem value="all">All banks</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="hdfc">HDFC</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="axis">AXIS</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon-sm" className="h-8 w-[51px]" onClick={() => setSortDirection((current) => (current === "asc" ? "desc" : "asc"))}>
              <ArrowUpDown className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-8 w-[51px] items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                >
                  <Columns3 className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {([
                  ["utr", "UTR"],
                  ["bankReference", "Bank reference"],
                  ["settlementAmount", "Settlement amount"],
                  ["bankAccount", "Bank account"],
                  ["settlementDate", "Settlement date"],
                  ["initiationDate", "Initiation date"],
                  ["status", "Status"],
                ] as Array<[ColumnKey, string]>).map(([key, label]) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={visibleColumns[key]}
                    onCheckedChange={(checked) => {
                      setVisibleColumns((current) => {
                        const next = { ...current, [key]: checked === true }
                        if (Object.values(next).filter(Boolean).length === 0) return current
                        return next
                      })
                    }}
                    onSelect={(event) => event.preventDefault()}
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-6 w-px bg-border/70" />

            <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={exportFilteredCsv}>
              <Download className="h-4 w-4" />Export filtered
            </Button>
          </div>
        </div>
      </div>

      <div className="border-y border-border/60 px-8 py-8">
        <div className="grid grid-cols-4 gap-2">
          <div>
            <p className="text-sm text-muted-foreground">Settled amount</p>
            <p className="mt-2 text-2xl font-semibold leading-6 tracking-[-0.4px] text-foreground">₹ 10,30,329</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Processing amount</p>
            <p className="mt-2 text-2xl font-semibold leading-6 tracking-[-0.4px] text-foreground">₹ 30,329</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">No of transaction settled</p>
            <p className="mt-2 text-2xl font-semibold leading-6 tracking-[-0.4px] text-foreground">3000</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total deductions</p>
            <p className="mt-2 text-2xl font-semibold leading-6 tracking-[-0.4px] text-foreground">₹ 10,000</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-8 py-8">
        <div className="overflow-hidden rounded-md border border-border/70">
          <div className="overflow-x-auto">
            <Table className="min-w-[1120px]">
              <TableHeader>
                <TableRow className="h-10 border-border/70">
                  {visibleColumns.utr ? <TableHead className="px-3 text-sm font-medium text-muted-foreground">UTR</TableHead> : null}
                  {visibleColumns.bankReference ? <TableHead className="px-3 text-sm font-medium text-muted-foreground">Bank reference</TableHead> : null}
                  {visibleColumns.settlementAmount ? <TableHead className="px-3 text-right text-sm font-medium text-muted-foreground">Settlement amount</TableHead> : null}
                  {visibleColumns.bankAccount ? <TableHead className="px-3 text-sm font-medium text-muted-foreground">Bank account</TableHead> : null}
                  {visibleColumns.settlementDate ? <TableHead className="px-3 text-sm font-medium text-muted-foreground">Settlement date</TableHead> : null}
                  {visibleColumns.initiationDate ? <TableHead className="px-3 text-sm font-medium text-muted-foreground">Initiation date</TableHead> : null}
                  {visibleColumns.status ? <TableHead className="px-3 text-sm font-medium text-muted-foreground">Status</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                  {pagedRows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="h-[72px] cursor-pointer border-border/70 hover:bg-muted/20"
                    onClick={() => router.push(`/settlements/${row.batchId}`)}
                  >
                    {visibleColumns.utr ? (
                      <TableCell className="px-3">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <span>{row.utr}</span>
                          <RowTypeIcon typeIcon={row.typeIcon} />
                        </div>
                      </TableCell>
                    ) : null}
                    {visibleColumns.bankReference ? <TableCell className="px-3 text-sm text-foreground">{row.bankReference}</TableCell> : null}
                    {visibleColumns.settlementAmount ? <TableCell className="px-3 text-right text-sm text-foreground">{inr(row.settlementAmount)}</TableCell> : null}
                    {visibleColumns.bankAccount ? (
                      <TableCell className="px-3">
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-sm bg-muted text-[10px] font-semibold text-foreground">
                            {row.bankName === "HDFC" ? "H" : "A"}
                          </span>
                          <div>
                            <p className="text-sm text-foreground">{row.accountLabel}</p>
                            <p className="text-sm text-muted-foreground">{row.bankName}</p>
                          </div>
                        </div>
                      </TableCell>
                    ) : null}
                    {visibleColumns.settlementDate ? (
                      <TableCell className="px-3">
                        <p className="text-sm text-foreground">{row.settlementDatePrimary}</p>
                        <p className="text-sm text-muted-foreground">{row.settlementDateSecondary}</p>
                      </TableCell>
                    ) : null}
                    {visibleColumns.initiationDate ? (
                      <TableCell className="px-3">
                        <p className="text-sm text-foreground">{row.initiationDatePrimary}</p>
                        <p className="text-sm text-muted-foreground">{row.initiationDateSecondary}</p>
                      </TableCell>
                    ) : null}
                    {visibleColumns.status ? (
                      <TableCell className="px-3">
                        <StatusBadge status={row.status} />
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>0 of {filteredRows.length} row(s) selected.</p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Rows per page</span>
              <Select
                value={String(rowsPerPage)}
                onValueChange={(value) => {
                  setRowsPerPage(Number(value))
                  setPage(1)
                }}
              >
                <SelectTrigger size="sm" className="h-8 w-[70px] rounded-lg text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm font-medium text-foreground">Page {clampedPage} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md border-border/60 bg-background/80" disabled={clampedPage <= 1} onClick={() => setPage(1)}>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md border-border/60 bg-background/80" disabled={clampedPage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md border-border/60 bg-background/80" disabled={clampedPage >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md border-border/60 bg-background/80" disabled={clampedPage >= totalPages} onClick={() => setPage(totalPages)}>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Sheet open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <SheetContent
          side="right"
          a11yTitle="Settlement preferences"
          a11yDescription="Manage settlement mode preferences for your account."
          className="w-full border-l border-border/60 bg-background p-0 sm:max-w-[420px]"
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-border/60 bg-muted/25 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Settlement preferences</p>
              <p className="text-xs text-muted-foreground">Choose which settlement modes are enabled.</p>
            </div>
            <div className="flex-1 space-y-3 p-4">
              <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">On-demand settlement</p>
                  <p className="text-xs text-muted-foreground">Additional fee applies</p>
                </div>
                <Switch checked={onDemandEnabled} onCheckedChange={setOnDemandEnabled} aria-label="Toggle on-demand settlement" />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Same day settlement</p>
                  <p className="text-xs text-muted-foreground">Faster payout cycle</p>
                </div>
                <Switch checked={sameDayEnabled} onCheckedChange={setSameDayEnabled} aria-label="Toggle same day settlement" />
              </div>
            </div>
            <div className="border-t border-border/60 p-4">
              <Button className="w-full" onClick={() => setPreferencesOpen(false)}>Save preferences</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
