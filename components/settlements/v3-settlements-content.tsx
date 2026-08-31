"use client"

import { useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowClockwiseIcon,
  ArrowLeftIcon,
  BuildingsIcon,
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  ClockIcon,
  CopyIcon,
  CreditCardIcon,
  DeviceMobileIcon,
  DownloadIcon,
  EnvelopeSimpleIcon,
  FastForwardIcon,
  HeadphonesIcon,
  HourglassIcon,
  InfoIcon,
  LightningIcon,
  MagnifyingGlassIcon,
  QrCodeIcon,
  ReceiptIcon,
  SlidersIcon,
  WalletIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react"
import { BankLogo } from "@/components/shared/bank-logo"
import { useDateRangeFilter } from "@/components/shared/date-range-filter"
import { ListingToolbar, PAGE_HEADING_CLASSES, type ListingFilter } from "@/components/shared/listing-page-primitives"
import { useMoreFiltersPanel, type MoreFilterCategory } from "@/components/shared/more-filters-panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type SettlementChannel = "in-store" | "online"
type SettlementStatus = "Created" | "Initiated" | "Processing" | "Settled" | "Failed" | "On Hold"
type SettlementType = "Normal" | "SDS" | "ODS"
type BankName = "HDFC" | "AXIS" | "ICICI" | "SBI"
type PaymentMethod = "upi" | "card" | "netbanking"

type SettlementRow = {
  id: string
  batchId: string
  utr: string
  grossAmount: number
  deductionsTotal: number
  mdrAmount: number
  gstAmount: number
  platformFees: number
  refundAmount: number
  recoveryAmount: number
  chargebackAmount: number
  netAmount: number
  transactionCount: number
  accountLabel: string
  bankName: BankName
  acquiringBank: BankName
  tid: string
  store: string
  channel: SettlementChannel
  settlementType: SettlementType
  paymentMethod: PaymentMethod
  settlementDatePrimary: string
  settlementDateSecondary: string
  initiationDatePrimary: string
  initiationDateSecondary: string
  status: SettlementStatus
  nextSettlementAt: string
  capturedRange: string
  settlementCycle: "T+0" | "T+1" | "T+2"
  weekendSettlementEnabled: boolean
  odsEnabled: boolean
  odsCutoff: string
}

type SettlementDetailTransaction = {
  id: string
  storeName: string
  storeAddress: string
  tid: string
  paymentMethodLabel: string
  paymentMethodSubLabel: string
  paymentMethod: PaymentMethod
  transactionAmount: number
  payoutAmount: number
  deductions: number
  mdrRate: string
  mdrAmount: number
  gstAmount: number
  totalDeduction: number
  merchantOrderId: string
  arn: string
  rrn: string
  issuer: string
  network: string
  acquirerId: string
  acquirerName: string
  payoutStatus: SettlementStatus
  paymentDate: string
  paymentTime: string
  product: string
  payoutType: "EMI" | "PX"
  transactionType: "Sale" | "Refund" | "Chargeback" | "Recovery" | "Adjustment"
}

const stores = [
  "PineLabs - Noida Kiosk",
  "PineLabs - Sector 35",
  "PineLabs - Sector 21",
  "PineLabs - Sector 27",
  "PineLabs - Sector 10",
  "PineLabs - Sector 15",
]
const tids = ["TID-10092", "TID-10093", "TID-10094", "TID-10095", "TID-10096", "TID-10097"]
const statuses: SettlementStatus[] = ["Settled", "Processing", "Initiated", "Created", "Failed", "On Hold"]
const settlementTypes: SettlementType[] = ["Normal", "SDS", "ODS"]
const paymentMethods: PaymentMethod[] = ["upi", "card", "netbanking"]
const banks: BankName[] = ["HDFC", "AXIS", "ICICI", "SBI"]

const rows: SettlementRow[] = [
  { id: "set-1", batchId: "SLT-11101", utr: "6876347862381", grossAmount: 125000, deductionsTotal: 18450, mdrAmount: 7200, gstAmount: 1296, platformFees: 1200, refundAmount: 4200, recoveryAmount: 1854, chargebackAmount: 1700, netAmount: 106550, transactionCount: 128, accountLabel: "xx8787", bankName: "HDFC", acquiringBank: "HDFC", tid: "TID-10092", store: "PineLabs - Noida Kiosk", channel: "in-store", settlementType: "SDS", paymentMethod: "upi", settlementDatePrimary: "16 Aug 2026", settlementDateSecondary: "10:10 PM", initiationDatePrimary: "16 Aug 2026", initiationDateSecondary: "10:00 AM", status: "Settled", nextSettlementAt: "6:00 PM Today", capturedRange: "15 Aug, 12:00 AM - 11:59 PM", settlementCycle: "T+1", weekendSettlementEnabled: false, odsEnabled: false, odsCutoff: "8:00 PM" },
  { id: "set-2", batchId: "SLT-11102", utr: "6876347862382", grossAmount: 94000, deductionsTotal: 12840, mdrAmount: 5400, gstAmount: 972, platformFees: 850, refundAmount: 2600, recoveryAmount: 1018, chargebackAmount: 1000, netAmount: 81160, transactionCount: 96, accountLabel: "xx4989", bankName: "AXIS", acquiringBank: "AXIS", tid: "TID-10093", store: "PineLabs - Sector 35", channel: "in-store", settlementType: "Normal", paymentMethod: "card", settlementDatePrimary: "18 Aug 2026", settlementDateSecondary: "9:30 PM", initiationDatePrimary: "18 Aug 2026", initiationDateSecondary: "10:00 AM", status: "Processing", nextSettlementAt: "7:30 PM Today", capturedRange: "17 Aug, 12:00 AM - 11:59 PM", settlementCycle: "T+1", weekendSettlementEnabled: false, odsEnabled: false, odsCutoff: "8:00 PM" },
  { id: "set-3", batchId: "SLT-11103", utr: "6876347862383", grossAmount: 183000, deductionsTotal: 22120, mdrAmount: 9600, gstAmount: 1728, platformFees: 1300, refundAmount: 5100, recoveryAmount: 1992, chargebackAmount: 1400, netAmount: 160880, transactionCount: 174, accountLabel: "xx8787", bankName: "HDFC", acquiringBank: "ICICI", tid: "TID-10094", store: "PineLabs - Sector 21", channel: "in-store", settlementType: "ODS", paymentMethod: "netbanking", settlementDatePrimary: "20 Aug 2026", settlementDateSecondary: "3:00 PM", initiationDatePrimary: "20 Aug 2026", initiationDateSecondary: "10:00 AM", status: "Settled", nextSettlementAt: "On demand", capturedRange: "19 Aug, 12:00 AM - 11:59 PM", settlementCycle: "T+0", weekendSettlementEnabled: true, odsEnabled: true, odsCutoff: "8:00 PM" },
  { id: "set-4", batchId: "SLT-11104", utr: "6876347862384", grossAmount: 72000, deductionsTotal: 9860, mdrAmount: 3400, gstAmount: 612, platformFees: 700, refundAmount: 2500, recoveryAmount: 1048, chargebackAmount: 1600, netAmount: 62140, transactionCount: 84, accountLabel: "xx7721", bankName: "SBI", acquiringBank: "SBI", tid: "TID-10095", store: "PineLabs - Sector 27", channel: "online", settlementType: "Normal", paymentMethod: "upi", settlementDatePrimary: "21 Aug 2026", settlementDateSecondary: "1:00 PM", initiationDatePrimary: "21 Aug 2026", initiationDateSecondary: "10:00 AM", status: "Settled", nextSettlementAt: "12:00 PM Tomorrow", capturedRange: "20 Aug, 12:00 AM - 11:59 PM", settlementCycle: "T+1", weekendSettlementEnabled: false, odsEnabled: false, odsCutoff: "8:00 PM" },
  { id: "set-5", batchId: "SLT-11105", utr: "6876347862385", grossAmount: 214000, deductionsTotal: 30920, mdrAmount: 11800, gstAmount: 2124, platformFees: 1750, refundAmount: 9800, recoveryAmount: 1746, chargebackAmount: 2700, netAmount: 183080, transactionCount: 201, accountLabel: "xx4989", bankName: "AXIS", acquiringBank: "HDFC", tid: "TID-10096", store: "PineLabs - Sector 10", channel: "online", settlementType: "SDS", paymentMethod: "card", settlementDatePrimary: "19 Aug 2026", settlementDateSecondary: "2:45 PM", initiationDatePrimary: "19 Aug 2026", initiationDateSecondary: "10:00 AM", status: "Settled", nextSettlementAt: "12:00 PM Tomorrow", capturedRange: "18 Aug, 12:00 AM - 11:59 PM", settlementCycle: "T+1", weekendSettlementEnabled: true, odsEnabled: false, odsCutoff: "8:00 PM" },
  { id: "set-6", batchId: "SLT-11106", utr: "6876347862386", grossAmount: 156000, deductionsTotal: 17680, mdrAmount: 7600, gstAmount: 1368, platformFees: 1250, refundAmount: 3400, recoveryAmount: 962, chargebackAmount: 1500, netAmount: 138320, transactionCount: 142, accountLabel: "xx8787", bankName: "HDFC", acquiringBank: "AXIS", tid: "TID-10097", store: "PineLabs - Sector 15", channel: "online", settlementType: "ODS", paymentMethod: "netbanking", settlementDatePrimary: "22 Aug 2026", settlementDateSecondary: "4:30 PM", initiationDatePrimary: "22 Aug 2026", initiationDateSecondary: "10:00 AM", status: "Settled", nextSettlementAt: "On demand till 8:00 PM", capturedRange: "22 Aug, 12:00 AM - 12:00 PM", settlementCycle: "T+0", weekendSettlementEnabled: true, odsEnabled: true, odsCutoff: "8:00 PM" },
]

const settlementDetailTransactions: SettlementDetailTransaction[] = [
  { id: "1525039333", storeName: "PineLabs - Noida Kiosk", storeAddress: "Candor TechSpace, Noida", tid: "TID-10092", paymentMethodLabel: "UPI", paymentMethodSubLabel: "HDFC", paymentMethod: "upi", transactionAmount: 12500, payoutAmount: 12150, deductions: 350, mdrRate: "0.90%", mdrAmount: 260, gstAmount: 47, totalDeduction: 350, merchantOrderId: "ORD-759201", arn: "ARN759201001", rrn: "RRN9821001", issuer: "HDFC Bank", network: "UPI", acquirerId: "ACQ-HDFC-01", acquirerName: "HDFC", payoutStatus: "Settled", paymentDate: "16 Aug 2026", paymentTime: "10:10 PM", product: "POS", payoutType: "EMI", transactionType: "Sale" },
  { id: "1525039336", storeName: "PineLabs - Sector 35", storeAddress: "Sector 35, Noida", tid: "TID-10093", paymentMethodLabel: "Card", paymentMethodSubLabel: "VISA", paymentMethod: "card", transactionAmount: 22500, payoutAmount: 21750, deductions: 750, mdrRate: "1.80%", mdrAmount: 560, gstAmount: 101, totalDeduction: 750, merchantOrderId: "ORD-759202", arn: "ARN759202001", rrn: "RRN9821002", issuer: "ICICI Bank", network: "VISA", acquirerId: "ACQ-AXIS-01", acquirerName: "Axis", payoutStatus: "Settled", paymentDate: "18 Aug 2026", paymentTime: "9:30 PM", product: "POS", payoutType: "EMI", transactionType: "Sale" },
  { id: "1525039339", storeName: "PineLabs - Sector 21", storeAddress: "Sector 21, Noida", tid: "TID-10094", paymentMethodLabel: "Card", paymentMethodSubLabel: "Mastercard", paymentMethod: "card", transactionAmount: 20000, payoutAmount: 19200, deductions: 800, mdrRate: "1.75%", mdrAmount: 585, gstAmount: 105, totalDeduction: 800, merchantOrderId: "ORD-759203", arn: "ARN759203001", rrn: "RRN9821003", issuer: "SBI", network: "Mastercard", acquirerId: "ACQ-ICICI-01", acquirerName: "ICICI", payoutStatus: "Settled", paymentDate: "20 Aug 2026", paymentTime: "3:00 PM", product: "POS", payoutType: "EMI", transactionType: "Sale" },
  { id: "1525039335", storeName: "PineLabs - Sector 27", storeAddress: "Sector 27, Noida", tid: "TID-10095", paymentMethodLabel: "Card", paymentMethodSubLabel: "Rupay", paymentMethod: "card", transactionAmount: 40000, payoutAmount: 38600, deductions: 1400, mdrRate: "1.60%", mdrAmount: 980, gstAmount: 176, totalDeduction: 1400, merchantOrderId: "ORD-759204", arn: "ARN759204001", rrn: "RRN9821004", issuer: "Axis Bank", network: "RuPay", acquirerId: "ACQ-SBI-01", acquirerName: "SBI", payoutStatus: "Settled", paymentDate: "21 Aug 2026", paymentTime: "1:00 PM", product: "POS", payoutType: "EMI", transactionType: "Sale" },
  { id: "1525039337", storeName: "PineLabs - Sector 10", storeAddress: "Sector 10, Noida", tid: "TID-10096", paymentMethodLabel: "Net banking", paymentMethodSubLabel: "HDFC", paymentMethod: "netbanking", transactionAmount: 30000, payoutAmount: 28950, deductions: 1050, mdrRate: "1.25%", mdrAmount: 780, gstAmount: 140, totalDeduction: 1050, merchantOrderId: "ORD-759205", arn: "ARN759205001", rrn: "RRN9821005", issuer: "HDFC Bank", network: "Net banking", acquirerId: "ACQ-HDFC-02", acquirerName: "HDFC", payoutStatus: "Settled", paymentDate: "19 Aug 2026", paymentTime: "2:45 PM", product: "POS", payoutType: "PX", transactionType: "Recovery" as SettlementDetailTransaction["transactionType"] },
  { id: "1525039338", storeName: "PineLabs - Sector 15", storeAddress: "Sector 15, Noida", tid: "TID-10097", paymentMethodLabel: "Net banking", paymentMethodSubLabel: "Axis", paymentMethod: "netbanking", transactionAmount: 17500, payoutAmount: 16850, deductions: 650, mdrRate: "1.20%", mdrAmount: 420, gstAmount: 76, totalDeduction: 650, merchantOrderId: "ORD-759206", arn: "ARN759206001", rrn: "RRN9821006", issuer: "Axis Bank", network: "Net banking", acquirerId: "ACQ-AXIS-02", acquirerName: "Axis", payoutStatus: "Settled", paymentDate: "22 Aug 2026", paymentTime: "4:30 PM", product: "POS", payoutType: "EMI", transactionType: "Refund" },
]

const settlementRows: SettlementRow[] = Array.from({ length: 120 }, (_, index) => {
  const source = rows[index % rows.length]!
  const cycle = Math.floor(index / rows.length)
  const grossAmount = source.grossAmount + cycle * 4200 + index * 130
  const deductionsTotal = source.deductionsTotal + cycle * 360 + (index % 5) * 90
  const channel: SettlementChannel = index % 2 === 0 ? "in-store" : "online"
  const mdrAmount = Math.round(deductionsTotal * 0.38)
  const gstAmount = Math.round(mdrAmount * 0.18)
  const platformFees = Math.round(deductionsTotal * 0.08)
  const refundAmount = Math.round(deductionsTotal * 0.24)
  const recoveryAmount = Math.round(deductionsTotal * 0.1)
  const chargebackAmount = Math.max(deductionsTotal - mdrAmount - gstAmount - platformFees - refundAmount - recoveryAmount, 0)
  return {
    ...source,
    id: `set-${index + 1}`,
    batchId: `SLT-${11101 + index}`,
    utr: String(Number(source.utr) + cycle * 17 + index),
    grossAmount,
    deductionsTotal,
    mdrAmount,
    gstAmount,
    platformFees,
    refundAmount,
    recoveryAmount,
    chargebackAmount,
    netAmount: grossAmount - deductionsTotal,
    transactionCount: source.transactionCount + cycle * 3 + (index % 7),
    status: channel === "online" ? "Settled" : statuses[index % statuses.length]!,
    settlementType: settlementTypes[index % settlementTypes.length]!,
    paymentMethod: paymentMethods[index % paymentMethods.length]!,
    acquiringBank: banks[index % banks.length]!,
    bankName: banks[(index + 1) % banks.length]!,
    store: stores[index % stores.length]!,
    tid: tids[index % tids.length]!,
    channel,
    settlementCycle: channel === "online" ? (index % 6 === 5 ? "T+0" : index % 4 === 1 ? "T+2" : "T+1") : source.settlementCycle,
    weekendSettlementEnabled: channel === "online" ? index % 4 === 1 : source.weekendSettlementEnabled,
    odsEnabled: channel === "online" ? index % 6 === 5 : source.odsEnabled,
  }
})

const detailRows: SettlementDetailTransaction[] = Array.from({ length: 96 }, (_, index) => {
  const source = settlementDetailTransactions[index % settlementDetailTransactions.length]!
  const cycle = Math.floor(index / settlementDetailTransactions.length)
  const transactionAmount = source.transactionAmount + cycle * 350 + (index % 4) * 125
  const deductions = source.deductions + cycle * 25
  return {
    ...source,
    id: String(Number(source.id) + cycle * 10),
    transactionAmount,
    deductions,
    totalDeduction: deductions,
    mdrAmount: Math.round(deductions * 0.58),
    gstAmount: Math.round(deductions * 0.1),
    payoutAmount: transactionAmount - deductions,
    merchantOrderId: `ORD-${759201 + index}`,
    arn: `ARN${759201 + index}001`,
    rrn: `RRN${9821001 + index}`,
    transactionType: ["Sale", "Refund", "Chargeback", "Recovery", "Adjustment"][index % 5] as SettlementDetailTransaction["transactionType"],
  }
})

function rm(value: number) {
  return `₹ ${value.toLocaleString("en-MY")}`
}

function formatAmountWithSen(value: number) {
  return value.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatAmount(value: number) {
  return value.toLocaleString("en-MY", { maximumFractionDigits: 0 })
}

function AmountText({ value }: { value: number }) {
  const [ringgit, sen] = formatAmountWithSen(value).split(".")
  return (
    <p className="text-xl font-semibold leading-7 text-foreground">
      ₹{ringgit}
      <span className="text-sm font-medium text-muted-foreground">.{sen}</span>
    </p>
  )
}

function channelLabel(channel: SettlementChannel) {
  return channel === "in-store" ? "In-store" : "Online"
}

function paymentMethodLabel(method: PaymentMethod) {
  if (method === "upi") return "UPI"
  if (method === "card") return "Card"
  return "Net banking"
}

const settlementMoreFilterCategories: MoreFilterCategory[] = [
  {
    id: "type",
    label: "Settlement type",
    display: "list",
    selectionMode: "single",
    searchable: false,
    options: settlementTypes.map((type) => ({ id: type, label: type })),
  },
  {
    id: "payment",
    label: "Payment method",
    display: "list",
    selectionMode: "single",
    searchable: false,
    options: paymentMethods.map((method) => ({ id: method, label: paymentMethodLabel(method) })),
  },
  {
    id: "bank",
    label: "Acquiring bank",
    display: "list",
    selectionMode: "single",
    searchable: false,
    options: banks.map((bank) => ({ id: bank.toLowerCase(), label: bank })),
  },
  {
    id: "tid",
    label: "TID",
    display: "list",
    selectionMode: "single",
    options: tids.map((tid) => ({ id: tid, label: tid })),
  },
  {
    id: "store",
    label: "Store",
    display: "list",
    selectionMode: "single",
    options: stores.map((store) => ({ id: store, label: store })),
  },
]

function PaymentIcon({ method }: { method: PaymentMethod }) {
  const Icon = method === "upi" ? QrCodeIcon : method === "card" ? CreditCardIcon : DeviceMobileIcon
  return <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
}

function StatusBadge({ status }: { status: SettlementStatus }) {
  const dot =
    status === "Settled"
      ? "bg-success"
      : status === "Failed"
        ? "bg-destructive"
        : status === "Initiated"
          ? "bg-status-info"
          : status === "Processing" || status === "On Hold"
            ? "bg-warning"
            : "bg-muted-foreground"

  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-xs font-medium text-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  )
}

function getSettlementStatusGradientClass(status: SettlementStatus) {
  if (status === "Settled") return "from-success/25 via-success/10 to-background"
  if (status === "Failed") return "from-destructive/25 via-destructive/10 to-background"
  if (status === "Processing" || status === "Initiated") return "from-warning/25 via-warning/10 to-background"
  return "from-chart-3/25 via-chart-3/10 to-background"
}

function PaginationControls({
  page,
  totalPages,
  rowsPerPage,
  totalRows,
  onPageChange,
  onRowsPerPageChange,
}: {
  page: number
  totalPages: number
  rowsPerPage: number
  totalRows: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (value: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
      <p>Total {totalRows} row(s)</p>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">Rows per page</span>
          <Select value={String(rowsPerPage)} onValueChange={(value) => onRowsPerPageChange(Number(value))}>
            <SelectTrigger size="sm" className="h-8 w-[70px] rounded-[10px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <span className="font-medium text-foreground">Page {page} of {totalPages}</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md" disabled={page <= 1} onClick={() => onPageChange(1)}><CaretDoubleLeftIcon className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}><CaretLeftIcon className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md" disabled={page >= totalPages} onClick={() => onPageChange(Math.min(totalPages, page + 1))}><CaretRightIcon className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md" disabled={page >= totalPages} onClick={() => onPageChange(totalPages)}><CaretDoubleRightIcon className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  )
}

interface V3SettlementsContentProps {
  initialBatchId?: string
}

export function V3SettlementsContent({ initialBatchId }: V3SettlementsContentProps) {
  const router = useRouter()
  const isDetailMode = Boolean(initialBatchId)
  const [channel, setChannel] = useState<SettlementChannel>("in-store")
  const [summaryPeriod, setSummaryPeriod] = useState<"today" | "yesterday" | "7days">("today")
  const [deductionsOpen, setDeductionsOpen] = useState(false)
  const [showAllDeductions, setShowAllDeductions] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | SettlementStatus>("all")
  const dateRangeFilter = useDateRangeFilter()
  const moreFilters = useMoreFiltersPanel(settlementMoreFilterCategories)
  const typeFilter = moreFilters.applied.type?.[0] ?? "all"
  const paymentFilter = (moreFilters.applied.payment?.[0] as PaymentMethod | undefined) ?? "all"
  const bankFilter = (moreFilters.applied.bank?.[0] as Lowercase<BankName> | undefined) ?? "all"
  const storeFilter = moreFilters.applied.store?.[0] ?? "all"
  const tidFilter = moreFilters.applied.tid?.[0] ?? "all"
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [detailRowsPerPage, setDetailRowsPerPage] = useState(10)
  const [detailPage, setDetailPage] = useState(1)

  const channelRows = useMemo(() => settlementRows.filter((row) => row.channel === channel), [channel])

  const summary = useMemo(() => {
    const settledRows = channelRows.filter((row) => row.status === "Settled")
    const openRows = channelRows.filter((row) => row.status !== "Settled")
    const failedRows = channelRows.filter((row) => row.status === "Failed")
    const onHoldRows = channelRows.filter((row) => row.status === "On Hold")
    const settledAmount = settledRows.reduce((total, row) => total + row.netAmount, 0)
    const unsettledAmount = openRows.reduce((total, row) => total + row.netAmount, 0)
    const deductionsAmount = settledRows.reduce((total, row) => total + row.deductionsTotal, 0)
    const grossAmount = settledRows.reduce((total, row) => total + row.grossAmount, 0)
    const refundsAmount = settledRows.reduce((total, row) => total + row.refundAmount, 0)
    const mdrAmount = settledRows.reduce((total, row) => total + row.mdrAmount, 0)
    const gstAmount = settledRows.reduce((total, row) => total + row.gstAmount, 0)
    const othersAmount = settledRows.reduce((total, row) => total + row.platformFees + row.recoveryAmount + row.chargebackAmount, 0)
    const settledCount = settledRows.reduce((total, row) => total + row.transactionCount, 0)
    const totalCount = channelRows.reduce((total, row) => total + row.transactionCount, 0)
    return {
      merchantBalance: settledAmount + unsettledAmount,
      settledAmount,
      unsettledAmount,
      deductionsAmount,
      grossAmount,
      refundsAmount,
      mdrAmount,
      gstAmount,
      othersAmount,
      settledCount,
      totalCount,
      batchCount: settledRows.length,
      failedCount: failedRows.length,
      onHoldCount: onHoldRows.reduce((total, row) => total + row.transactionCount, 0),
      remainingCount: Math.max(totalCount - settledCount, 0),
      nextSettlementAt: openRows[0]?.nextSettlementAt ?? "6:00 PM Today",
    }
  }, [channelRows])

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return channelRows.filter((row) => {
      const bankOk = bankFilter === "all" || row.acquiringBank.toLowerCase() === bankFilter
      const statusOk = statusFilter === "all" || row.status === statusFilter
      const typeOk = typeFilter === "all" || row.settlementType === typeFilter
      const paymentOk = paymentFilter === "all" || row.paymentMethod === paymentFilter
      const storeOk = storeFilter === "all" || row.store === storeFilter
      const tidOk = tidFilter === "all" || row.tid === tidFilter
      if (!bankOk || !statusOk || !typeOk || !paymentOk || !storeOk || !tidOk) return false
      if (!query) return true
      return `${row.batchId} ${row.utr} ${row.bankName} ${row.acquiringBank} ${row.tid} ${row.store}`.toLowerCase().includes(query)
    })
  }, [bankFilter, channelRows, paymentFilter, searchQuery, statusFilter, storeFilter, tidFilter, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage))
  const clampedPage = Math.min(page, totalPages)
  const pagedRows = useMemo(() => {
    const start = (clampedPage - 1) * rowsPerPage
    return filteredRows.slice(start, start + rowsPerPage)
  }, [clampedPage, filteredRows, rowsPerPage])

  const filteredDetailRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return detailRows
    return detailRows.filter((row) =>
      `${row.id} ${row.merchantOrderId} ${row.arn} ${row.rrn} ${row.storeName} ${row.storeAddress} ${row.tid} ${row.paymentMethodLabel} ${row.paymentMethodSubLabel}`.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const detailTotalPages = Math.max(1, Math.ceil(filteredDetailRows.length / detailRowsPerPage))
  const detailClampedPage = Math.min(detailPage, detailTotalPages)
  const detailPagedRows = useMemo(() => {
    const start = (detailClampedPage - 1) * detailRowsPerPage
    return filteredDetailRows.slice(start, start + detailRowsPerPage)
  }, [detailClampedPage, detailRowsPerPage, filteredDetailRows])

  const currentSettlement = useMemo(() => {
    if (!initialBatchId) return settlementRows[0]!
    return settlementRows.find((row) => row.batchId === initialBatchId) ?? settlementRows[0]!
  }, [initialBatchId])

  if (isDetailMode) {
    const cardDeductions = [
      { label: "Refunds", value: currentSettlement.refundAmount },
      { label: "Chargeback", value: currentSettlement.chargebackAmount },
      { label: "Loan recovery", value: currentSettlement.recoveryAmount },
      { label: "MSF / MDR", value: currentSettlement.mdrAmount },
      { label: "MCF", value: currentSettlement.platformFees },
    ]
    const extraDeductions = [{ label: "GST", value: currentSettlement.gstAmount }]
    const visibleDeductions = showAllDeductions ? [...cardDeductions, ...extraDeductions] : cardDeductions

    return (
      <div className="relative">
        <div className={`pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b ${getSettlementStatusGradientClass(currentSettlement.status)}`} />
        <div className="relative z-10 px-8 py-6">
          <Button asChild variant="ghost" className="h-8 rounded-md px-2 text-sm text-foreground hover:bg-background/30">
            <Link href="/settlements">
              <ArrowLeftIcon className="mr-1 h-4 w-4" />
              Back
            </Link>
          </Button>

          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <div className="min-w-0">
              <BankLogo bank={currentSettlement.bankName} size={48} />
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <h1 className="text-[32px] font-semibold leading-9 text-foreground">{rm(currentSettlement.netAmount)}</h1>
                <StatusBadge status={currentSettlement.status} />
              </div>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <p>Settled to: {currentSettlement.bankName} bank, {currentSettlement.accountLabel} on {currentSettlement.settlementDatePrimary}, {currentSettlement.settlementDateSecondary}</p>
                <p>Initiated on: {currentSettlement.initiationDatePrimary}, {currentSettlement.initiationDateSecondary}</p>
              </div>
              <span className="mt-4 inline-flex h-6 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-xs font-medium text-foreground">
                UTR: {currentSettlement.utr}
                <CopyIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="space-y-3 px-4 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Gross amount</span>
                  <span className="font-medium text-foreground">₹{formatAmount(currentSettlement.grossAmount)}</span>
                </div>
                {visibleDeductions.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-destructive">- ₹{formatAmount(item.value)}</span>
                  </div>
                ))}
                <div className="pt-1 text-center">
                  <Button variant="link" className="h-6 gap-1 p-0 text-sm text-primary" onClick={() => setShowAllDeductions((prev) => !prev)}>
                    {showAllDeductions ? "View less" : "View all"}
                    <CaretDownIcon className={`h-4 w-4 transition-transform ${showAllDeductions ? "rotate-180" : ""}`} />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border px-4 py-4 text-sm">
                <span className="text-muted-foreground">Net settled amount</span>
                <span className="font-semibold text-foreground">₹{formatAmount(currentSettlement.netAmount)}</span>
              </div>
            </div>
          </div>

          <div className="-mx-8 mt-8 border-t border-border" />

          <section className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold leading-7 text-foreground">{currentSettlement.transactionCount} Transactions included</h2>
              <div className="flex items-center gap-3">
                <div className="relative w-[229px]">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by Trxn ID"
                    value={searchQuery}
                    onChange={(event) => { setSearchQuery(event.target.value); setDetailPage(1) }}
                    className="h-8 rounded-md pl-8"
                  />
                </div>
                <Button size="sm" className="h-8">
                  <DownloadIcon className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <Table className="min-w-[1000px]">
                  <TableHeader>
                    <TableRow className="h-10">
                      <TableHead className="px-4 text-sm font-medium text-muted-foreground">Transaction ID</TableHead>
                      <TableHead className="px-4 text-sm font-medium text-muted-foreground">Transaction date</TableHead>
                      <TableHead className="px-4 text-sm font-medium text-muted-foreground">Store name</TableHead>
                      <TableHead className="px-4 text-sm font-medium text-muted-foreground">Payment mode</TableHead>
                      <TableHead className="px-4 text-right text-sm font-medium text-muted-foreground">Transaction amount</TableHead>
                      <TableHead className="px-4 text-right text-sm font-medium text-muted-foreground">Deduction</TableHead>
                      <TableHead className="px-4 text-right text-sm font-medium text-muted-foreground">Payout amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailPagedRows.map((row, index) => (
                      <TableRow key={`${row.id}-${index}`} className="h-16 cursor-pointer align-top" onClick={() => router.push(`/transactions/${row.id}`)}>
                        <TableCell className="px-4 align-top text-sm font-medium text-foreground">{row.id}</TableCell>
                        <TableCell className="px-4 align-top">
                          <p className="text-sm font-medium text-foreground">{row.paymentDate}</p>
                          <p className="mt-0.5 text-sm text-muted-foreground">{row.paymentTime}</p>
                        </TableCell>
                        <TableCell className="px-4 align-top">
                          <p className="text-sm font-medium text-foreground">{row.storeName}</p>
                          <p className="mt-0.5 max-w-[224px] truncate text-sm text-muted-foreground">{row.storeAddress}</p>
                        </TableCell>
                        <TableCell className="px-4 align-top">
                          <div className="flex items-start gap-2">
                            <PaymentIcon method={row.paymentMethod} />
                            <div>
                              <p className="text-sm font-medium text-foreground">{row.paymentMethodLabel}</p>
                              <p className="mt-0.5 text-sm text-muted-foreground">{row.paymentMethodSubLabel}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 text-right align-top text-sm font-medium text-foreground">{rm(row.transactionAmount)}</TableCell>
                        <TableCell className="px-4 text-right align-top text-sm font-medium text-foreground">{rm(row.totalDeduction)}</TableCell>
                        <TableCell className="px-4 text-right align-top text-sm font-medium text-foreground">{rm(row.payoutAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="mt-4">
              <PaginationControls
                page={detailClampedPage}
                totalPages={detailTotalPages}
                rowsPerPage={detailRowsPerPage}
                totalRows={filteredDetailRows.length}
                onPageChange={setDetailPage}
                onRowsPerPageChange={(value) => {
                  setDetailRowsPerPage(value)
                  setDetailPage(1)
                }}
              />
            </div>
          </section>

          <div className="-mx-8 mt-8 border-t border-border" />

          <section className="mt-6 flex items-center gap-3">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
              <HeadphonesIcon className="h-4 w-4 text-foreground" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Need help with this settlement?</p>
              <p className="mt-1 text-sm text-muted-foreground">Our support team is available 24x7 to assist you with any questions</p>
            </div>
            <Button variant="outline" size="sm" className="h-8 shrink-0">Contact us</Button>
          </section>
        </div>
      </div>
    )
  }

  const settlementFilters: ListingFilter[] = [
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
        ...statuses.map((status) => ({ label: status, value: status })),
      ],
    },
  ]

  return (
    <div className="px-8 py-8">
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className={PAGE_HEADING_CLASSES}>Settlements</h1>
          <Tabs value={channel} onValueChange={(value) => { setChannel(value as SettlementChannel); setPage(1) }}>
            <TabsList className="h-8 rounded-[8px] bg-muted p-1">
              <TabsTrigger value="in-store" className="h-6 rounded-[6px] border-transparent px-4 py-1 text-sm font-medium text-muted-foreground data-active:!border-transparent data-active:!bg-background data-active:!text-foreground">
                In-store payments
              </TabsTrigger>
              <TabsTrigger value="online" className="h-6 rounded-[6px] border-transparent px-4 py-1 text-sm font-medium text-muted-foreground data-active:!border-transparent data-active:!bg-background data-active:!text-foreground">
                Online payment
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Button asChild variant="outline" size="sm" className="h-8">
          <Link href="/settlements/preferences">
            <SlidersIcon className="h-4 w-4" />
            Change settlement preferences
          </Link>
        </Button>
      </section>

      <section className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ArrowClockwiseIcon className="h-4 w-4" />
          Settlement cycle: <span className="font-medium text-foreground">{channel === "online" ? "T+1 / T+2 days" : "T+1 days"}</span>
        </span>
        <span className="h-4 w-px bg-border" />
        <span className="inline-flex items-center gap-1.5">
          <BuildingsIcon className="h-4 w-4" />
          Settlement account: <BankLogo bank="HDFC" size={14} /> <span className="font-medium text-foreground">HDFC bank, xx8787</span>
        </span>
      </section>

      <div className="-mx-8 mt-6 border-t border-border" />

      <section className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        <div className="grid md:grid-cols-2">
          <div className="flex min-w-0 flex-col border-b border-border md:border-r md:border-b-0">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-foreground" />
                <p className="text-base font-medium text-card-foreground">Settled amount</p>
              </div>
              <Tabs value={summaryPeriod} onValueChange={(value) => setSummaryPeriod(value as typeof summaryPeriod)}>
                <TabsList className="h-8 rounded-[8px] bg-muted p-1">
                  <TabsTrigger value="today" className="h-6 rounded-[6px] border-transparent px-2 py-1 text-sm data-active:!border-transparent data-active:!bg-background">Today</TabsTrigger>
                  <TabsTrigger value="yesterday" className="h-6 rounded-[6px] border-transparent px-2 py-1 text-sm data-active:!border-transparent data-active:!bg-background">Yesterday</TabsTrigger>
                  <TabsTrigger value="7days" className="h-6 rounded-[6px] border-transparent px-2 py-1 text-sm data-active:!border-transparent data-active:!bg-background">7 days</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex min-h-[136px] flex-col gap-4 px-5 py-4">
              <div>
                <AmountText value={summary.settledAmount} />
                <p className="mt-2 text-sm font-medium text-muted-foreground">{summary.settledCount} payments settled in {summary.batchCount} batches</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span><span className="text-destructive">₹{formatAmount(summary.deductionsAmount)}</span> <span className="text-muted-foreground">deductions</span></span>
                <Button variant="link" className="h-5 p-0 text-sm text-primary underline" onClick={() => setDeductionsOpen(true)}>View breakdown</Button>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="flex h-14 items-center gap-2 border-b border-border px-4">
              <HourglassIcon className="h-5 w-5 text-foreground" />
              <p className="text-base font-medium text-card-foreground">Remaining amount</p>
            </div>
            <div className="flex min-h-[136px] flex-col gap-4 px-5 py-4">
              <div>
                <AmountText value={summary.unsettledAmount} />
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-muted-foreground">
                  <span>{summary.remainingCount} payments remaining</span>
                  <span className="h-4 w-px bg-border" />
                  <span>Next settlement by <span className="text-foreground">{summary.nextSettlementAt}</span></span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                <span><span className="text-destructive">{summary.failedCount}</span> <span className="text-muted-foreground">settlement failed</span></span>
                <Button variant="link" className="h-5 p-0 text-sm text-primary underline">View</Button>
                <span className="h-4 w-px bg-border" />
                <span><span className="text-destructive">{summary.onHoldCount}</span> <span className="text-muted-foreground">payments on hold</span></span>
                <Button variant="link" className="h-5 p-0 text-sm text-primary underline">View</Button>
              </div>
            </div>
          </div>
        </div>

        {channel === "in-store" ? (
          <div className="flex items-center gap-3 border-t border-border bg-[#eef2ff] px-4 py-3 dark:bg-[#1a1f3a]">
            <LightningIcon className="h-5 w-5 shrink-0 text-[#4f46e5] dark:text-[#a5b4fc]" />
            <p className="min-w-0 flex-1 text-sm font-medium text-foreground">
              Get some settlement in your account today via On-Demand settlement
            </p>
            <Button variant="outline" size="sm" className="h-8 shrink-0 bg-background">Settle now</Button>
          </div>
        ) : null}
      </section>

      <Sheet open={deductionsOpen} onOpenChange={setDeductionsOpen}>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-[464px]">
          <SheetHeader className="flex-row items-center justify-between border-b border-border px-6 py-4">
            <SheetTitle className="text-lg font-medium text-foreground">Deductions</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-5 border-b border-border px-6 py-6 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Gross amount</span>
              <span className="font-semibold text-foreground">₹{formatAmount(summary.grossAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Refunds</span>
              <span className="font-semibold text-destructive">- ₹{formatAmount(summary.refundsAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">MSF / MDR</span>
              <span className="font-semibold text-destructive">- ₹{formatAmount(summary.mdrAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">GST</span>
              <span className="font-semibold text-destructive">- ₹{formatAmount(summary.gstAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                Others
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </span>
              <span className="font-semibold text-destructive">- ₹{formatAmount(summary.othersAmount)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between px-6 py-6 text-sm">
            <span className="text-muted-foreground">Net settled amount</span>
            <span className="font-semibold text-foreground">₹{formatAmount(summary.settledAmount)}</span>
          </div>
        </SheetContent>
      </Sheet>

      <ListingToolbar
        className="mt-6 px-0 py-0"
        search={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setPage(1)
        }}
        searchPlaceholder="Search by UTR or Trxn ID"
        filters={settlementFilters}
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

      <section className="mt-7 space-y-4">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <Table className="min-w-[1104px]">
              <TableHeader>
                {channel === "online" ? (
                  <TableRow className="h-10">
                    <TableHead className="px-3 text-sm font-medium text-muted-foreground">UTR</TableHead>
                    <TableHead className="px-3 text-sm font-medium text-muted-foreground">Settled on</TableHead>
                    <TableHead className="px-3 text-right text-sm font-medium text-muted-foreground">Gross amount</TableHead>
                    <TableHead className="px-3 text-right text-sm font-medium text-muted-foreground">Deductions</TableHead>
                    <TableHead className="px-3 text-right text-sm font-medium text-muted-foreground">Net settlement</TableHead>
                    <TableHead className="px-3 text-sm font-medium text-muted-foreground">Refund / chargeback</TableHead>
                    <TableHead className="px-3 text-sm font-medium text-muted-foreground">Status</TableHead>
                    <TableHead className="px-3 text-sm font-medium text-muted-foreground">Cycle</TableHead>
                  </TableRow>
                ) : (
                  <TableRow className="h-10">
                    <TableHead className="px-4 text-sm font-medium text-muted-foreground">UTR</TableHead>
                    <TableHead className="px-4 text-sm font-medium text-muted-foreground">Gross amount</TableHead>
                    <TableHead className="px-4 text-sm font-medium text-muted-foreground">Total Deduction</TableHead>
                    <TableHead className="px-4 text-sm font-medium text-muted-foreground">Net settlement</TableHead>
                    <TableHead className="px-4 text-sm font-medium text-muted-foreground">Settled date</TableHead>
                    <TableHead className="px-4 text-sm font-medium text-muted-foreground">Bank</TableHead>
                    <TableHead className="px-4 text-sm font-medium text-muted-foreground">Status</TableHead>
                  </TableRow>
                )}
              </TableHeader>
              <TableBody>
                {pagedRows.map((row) => (
                  channel === "online" ? (
                    <TableRow key={row.id} className="h-16 cursor-pointer align-top" onClick={() => router.push(`/settlements/${row.batchId}`)}>
                      <TableCell className="px-3 align-top text-sm font-medium text-foreground">
                        <span className="inline-flex items-center gap-2">
                          {row.utr}
                          {row.settlementType !== "Normal" ? <LightningIcon className="h-4 w-4 text-muted-foreground" /> : null}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 align-top text-sm font-medium text-foreground">
                        <p>{row.settlementDatePrimary}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{row.settlementDateSecondary}</p>
                      </TableCell>
                      <TableCell className="px-3 text-right align-top text-sm font-medium text-foreground">{rm(row.grossAmount)}</TableCell>
                      <TableCell className="px-3 text-right align-top">
                        <p className="text-sm font-medium text-foreground">{rm(row.deductionsTotal)}</p>
                        <p className="text-sm text-muted-foreground">MDR + GST</p>
                      </TableCell>
                      <TableCell className="px-3 text-right align-top text-sm font-medium text-foreground">{rm(row.netAmount)}</TableCell>
                      <TableCell className="px-3 align-top">
                        <p className="text-sm font-medium text-foreground">{rm(row.refundAmount + row.chargebackAmount)}</p>
                        <p className="text-sm text-muted-foreground">Refunds + chargebacks</p>
                      </TableCell>
                      <TableCell className="px-3 align-top"><StatusBadge status={row.status} /></TableCell>
                      <TableCell className="px-3 align-top">
                        <p className="text-sm font-medium text-foreground">{row.settlementCycle}</p>
                        <p className="text-sm text-muted-foreground">{row.odsEnabled ? `ODS till ${row.odsCutoff}` : row.weekendSettlementEnabled ? "Weekend enabled" : "Standard"}</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={row.id} className="h-16 cursor-pointer align-top" onClick={() => router.push(`/settlements/${row.batchId}`)}>
                      <TableCell className="px-4 align-top">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                          <span>{row.utr}</span>
                          <CopyIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <span>{row.transactionCount} payments</span>
                          {row.settlementType === "ODS" ? (
                            <>
                              <span className="h-3 w-px bg-border" />
                              <span className="inline-flex items-center gap-1 font-medium text-[#4f46e5] dark:text-[#a5b4fc]">
                                <LightningIcon className="h-3.5 w-3.5" />
                                On-Demand
                              </span>
                            </>
                          ) : row.settlementType === "SDS" ? (
                            <>
                              <span className="h-3 w-px bg-border" />
                              <span className="inline-flex items-center gap-1 font-medium text-success">
                                <FastForwardIcon className="h-3.5 w-3.5" />
                                Same-Day
                              </span>
                            </>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 align-top text-sm font-medium text-foreground">{rm(row.grossAmount)}</TableCell>
                      <TableCell className="px-4 align-top">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                          {rm(row.deductionsTotal)}
                          <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        </span>
                      </TableCell>
                      <TableCell className="px-4 align-top text-sm font-medium text-foreground">{rm(row.netAmount)}</TableCell>
                      <TableCell className="px-4 align-top">
                        <p className="text-sm font-medium text-foreground">{row.settlementDatePrimary}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">{row.settlementDateSecondary}</p>
                      </TableCell>
                      <TableCell className="px-4 align-top">
                        <div className="flex items-center gap-2">
                          <BankLogo bank={row.acquiringBank} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">{row.acquiringBank} bank</p>
                            <p className="mt-0.5 text-sm text-muted-foreground">{row.accountLabel}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 align-top"><StatusBadge status={row.status} /></TableCell>
                    </TableRow>
                  )
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <PaginationControls
          page={clampedPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalRows={filteredRows.length}
          onPageChange={setPage}
          onRowsPerPageChange={(value) => {
            setRowsPerPage(value)
            setPage(1)
          }}
        />
      </section>
    </div>
  )
}

export function V3SettlementPreferencesContent() {
  const [channel, setChannel] = useState<SettlementChannel>("in-store")
  const [selectedCycle, setSelectedCycle] = useState<"T+1" | "T+2" | "T+0">("T+1")

  const cycleOptions: Array<{
    value: "T+1" | "T+2" | "T+0"
    title: string
    description: string
    settlementTime: string
    holidayBehavior: string
    stages: string[]
  }> = [
    {
      value: "T+1",
      title: "T+1 settlement",
      description: "Transactions captured between 12 AM and 12 AM are picked up and settled on the next configured settlement day.",
      settlementTime: channel === "online" ? "Usually completed by 12 PM, can run through the day" : "Next day settlement window, typically by 6 PM",
      holidayBehavior: "If the next day is a bank holiday and weekend settlement is not enabled, settlement moves to the next working day.",
      stages: ["Capture day", "T+1 payout", "Skip holiday", "Next working day"],
    },
    {
      value: "T+2",
      title: "T+2 settlement",
      description: "Transactions are settled two working days after capture. This is configured at merchant/MID level, not payment-method level.",
      settlementTime: "Two working days after capture, based on merchant setup",
      holidayBehavior: "Bank holidays and non-enabled weekends are skipped, so the payout rolls forward to the next available working day.",
      stages: ["Capture day", "T+1 hold", "T+2 payout", "Skip holiday"],
    },
    {
      value: "T+0",
      title: "Same day / on demand",
      description: "Eligible merchants can receive same-day or on-demand settlement when SDS/ODS configuration, pricing, and limits are enabled.",
      settlementTime: channel === "online" ? "ODS can be requested till 8 PM with minimum amount Re 1" : "Same-day settlement based on enabled in-store service",
      holidayBehavior: "Holiday or weekend settlement works only when the merchant has that value-added service enabled.",
      stages: ["Capture", "Request", "Same-day payout", "VAS required"],
    },
  ]

  return (
    <div className="px-8 py-8">
      <div className="flex h-8 items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="h-8 px-2">
          <Link href="/settlements">
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="h-8">Save changes</Button>
      </div>

      <section className="mt-8 flex flex-col gap-4">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card">
          <SlidersIcon className="h-5 w-5 text-foreground" />
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <h1 className={PAGE_HEADING_CLASSES}>Settlement preferences</h1>
          <Tabs value={channel} onValueChange={(value) => setChannel(value as SettlementChannel)}>
            <TabsList className="h-8 rounded-[8px] bg-muted p-1">
              <TabsTrigger value="in-store" className="h-6 rounded-[6px] border-transparent px-4 py-1 text-sm font-medium text-muted-foreground data-active:!border-transparent data-active:!bg-background data-active:!text-foreground">
                In-store payments
              </TabsTrigger>
              <TabsTrigger value="online" className="h-6 rounded-[6px] border-transparent px-4 py-1 text-sm font-medium text-muted-foreground data-active:!border-transparent data-active:!bg-background data-active:!text-foreground">
                Online payment
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-base font-medium text-muted-foreground">
          <span>Channel: <span className="text-foreground">{channelLabel(channel)} payments</span></span>
          <span className="h-6 w-px bg-border" />
          <span>Settlement bank: <span className="text-foreground">{channel === "online" ? "Online MID account, xx7721" : "HDFC bank, xx8787"}</span></span>
          <span className="h-6 w-px bg-border" />
          <span>Current cycle: <span className="text-foreground">{selectedCycle}</span></span>
        </div>
        <p className="max-w-4xl text-sm font-medium text-muted-foreground">
          Configure how settlements are scheduled and which bank account receives payouts for this channel. Settlement cycle is a merchant-level setup and is not configured separately for each payment method.
        </p>
      </section>

      <Tabs defaultValue="settlement-cycle" className="mt-10 gap-0">
        <TabsList variant="line" className="h-auto w-full justify-start gap-8 border-b border-border p-0">
          <TabsTrigger value="settlement-cycle" className="h-14 flex-none rounded-none px-0 text-base font-medium data-active:text-primary data-active:after:bg-primary">
            Settlement cycle
          </TabsTrigger>
          <TabsTrigger value="bank-accounts" className="h-14 flex-none rounded-none px-0 text-base font-medium data-active:text-primary data-active:after:bg-primary">
            Bank accounts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settlement-cycle" className="pt-6">
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Choose settlement cycle</h2>
              <p className="mt-1 text-sm text-muted-foreground">Select one cycle for {channelLabel(channel)} payments. Holidays and non-enabled weekends are skipped automatically.</p>
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              {cycleOptions.map((option) => {
                const isSelected = selectedCycle === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedCycle(option.value)}
                    className={`flex min-h-[244px] flex-col rounded-xl border bg-card px-4 py-4 text-left transition-colors ${isSelected ? "border-primary" : "border-border hover:bg-muted/40"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{option.title}</p>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">{option.value}</p>
                      </div>
                      <span className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isSelected ? "border-primary" : "border-border"}`}>
                        <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? "bg-primary" : "bg-transparent"}`} />
                      </span>
                    </div>
                    <div className="mt-4 rounded-lg bg-muted px-3 py-3">
                      <div className="grid grid-cols-4 gap-2">
                        {option.stages.map((stage, stageIndex) => (
                          <div key={stage} className="relative">
                            {stageIndex < option.stages.length - 1 ? (
                              <span className={`absolute left-[22px] right-[-8px] top-2 h-px ${isSelected ? "bg-primary" : "bg-border"}`} />
                            ) : null}
                            <span className={`relative z-10 inline-flex h-4 w-4 items-center justify-center rounded-full border ${isSelected ? "border-primary bg-primary" : "border-border bg-card"}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-primary-foreground" : "bg-muted-foreground/50"}`} />
                            </span>
                            <p className="mt-2 text-[11px] font-medium leading-4 text-foreground">{stage}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-5 text-muted-foreground">{option.description}</p>
                    <div className="mt-auto space-y-3 pt-4">
                      <div className="rounded-lg bg-muted px-3 py-2">
                        <p className="text-xs font-medium text-muted-foreground">Settlement timing</p>
                        <p className="mt-1 text-sm font-medium text-foreground">{option.settlementTime}</p>
                      </div>
                      <div className="rounded-lg bg-muted px-3 py-2">
                        <p className="text-xs font-medium text-muted-foreground">Holiday handling</p>
                        <p className="mt-1 text-sm font-medium text-foreground">{option.holidayBehavior}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="bank-accounts" className="pt-6">
          <section className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card px-4 py-4">
              <BuildingsIcon className="h-5 w-5 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold text-foreground">Active settlement account</p>
              <p className="mt-1 text-sm text-muted-foreground">This bank account receives settled payouts for {channelLabel(channel)} payments.</p>
              <div className="mt-4 rounded-lg bg-muted px-3 py-3">
                <p className="text-xs font-medium text-muted-foreground">Bank account</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{channel === "online" ? "Online MID account, xx7721" : "HDFC bank, xx8787"}</p>
                <p className="mt-1 text-xs text-muted-foreground">Incorrect or frozen bank details may move payouts into pending payout handling.</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="h-8">Update bank account</Button>
                <Button variant="outline" size="sm" className="h-8">View audit history</Button>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card px-4 py-4">
              <WarningCircleIcon className="h-5 w-5 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold text-foreground">Bank account checks</p>
              <p className="mt-1 text-sm text-muted-foreground">Use this area for verification status, retry notes, and account update requirements.</p>
              <div className="mt-4 space-y-2">
                <div className="rounded-lg bg-muted px-3 py-2">
                  <p className="text-xs font-medium text-muted-foreground">Verification status</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">Verified</p>
                </div>
                <div className="rounded-lg bg-muted px-3 py-2">
                  <p className="text-xs font-medium text-muted-foreground">Payout retry status</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">No failed retry pending</p>
                </div>
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}
