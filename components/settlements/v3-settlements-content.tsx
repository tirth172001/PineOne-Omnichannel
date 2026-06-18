"use client"

import { useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleAlert,
  Clock3,
  Copy,
  CreditCard,
  Download,
  Headphones,
  Hourglass,
  Mail,
  QrCode,
  ReceiptText,
  Search,
  Settings2,
  Smartphone,
  WalletCards,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
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

function inr(value: number) {
  return `₹ ${value.toLocaleString("en-IN")}`
}

function formatAmountWithPaise(value: number) {
  return value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function channelLabel(channel: SettlementChannel) {
  return channel === "in-store" ? "In-store" : "Online"
}

function paymentMethodLabel(method: PaymentMethod) {
  if (method === "upi") return "UPI"
  if (method === "card") return "Card"
  return "Net banking"
}

function HdfcMark({ size = 20 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="relative inline-flex shrink-0 items-center justify-center bg-white"
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-0 bg-[#ed1c24]" />
      <span className="absolute inset-[22%] bg-white" />
      <span className="absolute inset-[36%] bg-[#0073bc]" />
    </span>
  )
}

function PaymentIcon({ method }: { method: PaymentMethod }) {
  const Icon = method === "upi" ? QrCode : method === "card" ? CreditCard : Smartphone
  return <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
}

function StatusBadge({ status }: { status: SettlementStatus }) {
  const tone =
    status === "Settled"
      ? "bg-secondary text-secondary-foreground"
      : status === "Failed"
        ? "bg-destructive/10 text-destructive"
        : "bg-muted text-muted-foreground"

  return (
    <span className={`inline-flex h-6 items-center rounded-md px-2 text-xs font-medium ${tone}`}>
      {status}
    </span>
  )
}

function DetailMetaPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-full border border-border/80 bg-background/80 px-2 text-xs text-foreground">
      {children}
    </span>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-xl font-medium leading-6 text-foreground">{children}</h2>
}

function DetailField({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  )
}

function DetailSection({
  title,
  fields,
}: {
  title: string
  fields: Array<{ label: string; value: ReactNode }>
}) {
  return (
    <section className="space-y-6">
      <h3 className="text-xl font-medium leading-6 text-foreground">{title}</h3>
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-3">
        {fields.map((field) => (
          <DetailField key={field.label} label={field.label} value={field.value} />
        ))}
      </div>
    </section>
  )
}

function SettlementActivityItem({
  title,
  subtitle,
  detail,
  icon,
}: {
  title: string
  subtitle: string
  detail?: string
  icon: ReactNode
}) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-0 top-0.5">{icon}</div>
      <p className="text-sm text-foreground">{title}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
      {detail ? <p className="mt-1 text-xs font-medium text-primary">{detail}</p> : null}
    </div>
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
          <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md" disabled={page <= 1} onClick={() => onPageChange(1)}><ChevronsLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md" disabled={page >= totalPages} onClick={() => onPageChange(Math.min(totalPages, page + 1))}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md" disabled={page >= totalPages} onClick={() => onPageChange(totalPages)}><ChevronsRight className="h-4 w-4" /></Button>
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
  const [summaryPeriod, setSummaryPeriod] = useState<"today" | "yesterday">("today")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<"today" | "all">("today")
  const [statusFilter, setStatusFilter] = useState<"all" | SettlementStatus>("all")
  const [typeFilter, setTypeFilter] = useState<"all" | SettlementType>("all")
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentMethod>("all")
  const [bankFilter, setBankFilter] = useState<"all" | Lowercase<BankName>>("all")
  const [storeFilter, setStoreFilter] = useState<"all" | string>("all")
  const [tidFilter, setTidFilter] = useState<"all" | string>("all")
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [detailRowsPerPage, setDetailRowsPerPage] = useState(10)
  const [detailPage, setDetailPage] = useState(1)

  const channelRows = useMemo(() => settlementRows.filter((row) => row.channel === channel), [channel])

  const summary = useMemo(() => {
    const settledRows = channelRows.filter((row) => row.status === "Settled")
    const openRows = channelRows.filter((row) => row.status !== "Settled")
    const settledAmount = settledRows.reduce((total, row) => total + row.netAmount, 0)
    const unsettledAmount = openRows.reduce((total, row) => total + row.netAmount, 0)
    const settledCount = settledRows.reduce((total, row) => total + row.transactionCount, 0)
    const totalCount = channelRows.reduce((total, row) => total + row.transactionCount, 0)
    return {
      merchantBalance: settledAmount + unsettledAmount,
      settledAmount,
      unsettledAmount,
      settledCount,
      totalCount,
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
      const dateOk = dateFilter === "all" || dateFilter === "today"
      if (!bankOk || !statusOk || !typeOk || !paymentOk || !storeOk || !tidOk || !dateOk) return false
      if (!query) return true
      return `${row.batchId} ${row.utr} ${row.bankName} ${row.acquiringBank} ${row.tid} ${row.store}`.toLowerCase().includes(query)
    })
  }, [bankFilter, channelRows, dateFilter, paymentFilter, searchQuery, statusFilter, storeFilter, tidFilter, typeFilter])

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

  const detailBreakup = useMemo(() => {
    const adjustments = currentSettlement.channel === "online" ? currentSettlement.platformFees : Math.round(currentSettlement.deductionsTotal * 0.14)
    const loanRecovery = currentSettlement.channel === "online" ? currentSettlement.recoveryAmount : Math.round(currentSettlement.deductionsTotal * 0.12)
    const other = Math.max(
      currentSettlement.deductionsTotal -
      currentSettlement.refundAmount -
      currentSettlement.mdrAmount -
      currentSettlement.gstAmount -
      adjustments -
      loanRecovery -
      currentSettlement.chargebackAmount,
      0
    )

    return {
      grossAmount: currentSettlement.grossAmount,
      refunds: currentSettlement.refundAmount,
      mdr: currentSettlement.mdrAmount,
      taxes: currentSettlement.gstAmount,
      adjustments,
      loanRecovery,
      chargebacks: currentSettlement.chargebackAmount,
      other,
    }
  }, [currentSettlement])

  const detailDeductionRows = useMemo(() => {
    return [
      { label: "Refunds", value: detailBreakup.refunds },
      { label: "MDR", value: detailBreakup.mdr },
      { label: "Taxes", value: detailBreakup.taxes },
      { label: "Adjustments", value: detailBreakup.adjustments },
      { label: "Loan recovery", value: detailBreakup.loanRecovery },
      ...(currentSettlement.channel === "online" ? [{ label: "Chargebacks", value: detailBreakup.chargebacks }] : []),
      { label: "Other deductions", value: detailBreakup.other },
    ].filter((item) => item.value > 0)
  }, [currentSettlement.channel, detailBreakup])

  const transactionSplit = useMemo(() => {
    return ["Sale", "Refund", "Chargeback", "Recovery", "Adjustment"].map((type) => ({
      type,
      count: filteredDetailRows.filter((row) => row.transactionType === type).length,
    }))
  }, [filteredDetailRows])

  if (isDetailMode) {
    const payoutLabel = currentSettlement.channel === "online" ? "Net settlement" : "Payout amount"
    const settlementActivityItems = [
      {
        title: currentSettlement.status === "Settled" ? "Settlement completed" : "Settlement updated",
        subtitle: `${currentSettlement.settlementDatePrimary}, ${currentSettlement.settlementDateSecondary}`,
        detail: `UTR ${currentSettlement.utr}`,
        icon:
          currentSettlement.status === "Failed" ? (
            <CircleAlert className="h-4 w-4 text-destructive" />
          ) : currentSettlement.status === "Settled" ? (
            <CheckCircle className="h-4 w-4 text-success" />
          ) : (
            <Clock3 className="h-4 w-4 text-warning" />
          ),
      },
      {
        title: "Payout initiated",
        subtitle: `${currentSettlement.initiationDatePrimary}, ${currentSettlement.initiationDateSecondary}`,
        detail: `${currentSettlement.bankName} bank, ${currentSettlement.accountLabel}`,
        icon: <Building2 className="h-4 w-4 text-chart-4" />,
      },
      {
        title: "Deductions reconciled",
        subtitle: inr(currentSettlement.deductionsTotal),
        detail: `${detailDeductionRows.length} deduction heads`,
        icon: <ReceiptText className="h-4 w-4 text-muted-foreground" />,
      },
      {
        title: "Transactions captured",
        subtitle: `${currentSettlement.transactionCount} transactions`,
        detail: currentSettlement.capturedRange,
        icon: <WalletCards className="h-4 w-4 text-muted-foreground" />,
      },
    ]

    return (
      <div className="relative p-8">
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-[301px] bg-gradient-to-b ${getSettlementStatusGradientClass(currentSettlement.status)}`}
        />
        <div className="relative z-10 mx-auto w-full max-w-[1440px]">
          <div className="flex h-8 items-center justify-between">
            <Button asChild variant="ghost" className="h-8 rounded-md px-2 text-xs text-foreground hover:bg-background/20">
              <Link href="/settlements">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Download className="h-4 w-4" />
              Download receipt
            </Button>
          </div>

          <section className="mt-8 min-h-[180px]">
            <HdfcMark size={48} />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <h1 className="text-[36px] font-semibold leading-9 text-foreground">{inr(currentSettlement.netAmount)}</h1>
              <StatusBadge status={currentSettlement.status} />
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {payoutLabel}: {currentSettlement.bankName} bank, {currentSettlement.accountLabel}{" "}
              <span className="mx-2 text-border">|</span>
              Settled on: {currentSettlement.settlementDatePrimary}, {currentSettlement.settlementDateSecondary}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <DetailMetaPill>
                Batch ID: {currentSettlement.batchId}
                <Copy className="h-3 w-3 text-muted-foreground" />
              </DetailMetaPill>
              <DetailMetaPill>
                UTR: {currentSettlement.utr}
                <Copy className="h-3 w-3 text-muted-foreground" />
              </DetailMetaPill>
              <DetailMetaPill>{currentSettlement.settlementCycle} cycle</DetailMetaPill>
              <DetailMetaPill>{channelLabel(currentSettlement.channel)} payments</DetailMetaPill>
            </div>
          </section>

          <div className="mt-6 h-px w-full bg-border/70" />

          <div className="mt-6 grid gap-12 xl:grid-cols-[minmax(0,744px)_1px_minmax(280px,328px)]">
            <div className="min-w-0">
              <DetailSection
                title="Settlement details"
                fields={[
                  { label: "Settlement ID", value: currentSettlement.batchId },
                  { label: "UTR", value: currentSettlement.utr },
                  { label: "Settlement status", value: <StatusBadge status={currentSettlement.status} /> },
                  { label: "Settlement type", value: currentSettlement.settlementType },
                  { label: "Settlement cycle", value: currentSettlement.settlementCycle },
                  { label: "Transaction count", value: currentSettlement.transactionCount.toLocaleString("en-IN") },
                  { label: "Captured range", value: currentSettlement.capturedRange },
                  { label: "Initiated on", value: `${currentSettlement.initiationDatePrimary}, ${currentSettlement.initiationDateSecondary}` },
                  { label: "Completed on", value: `${currentSettlement.settlementDatePrimary}, ${currentSettlement.settlementDateSecondary}` },
                ]}
              />

              <div className="my-8 h-px w-full bg-border/70" />

              <DetailSection
                title="Bank and payout details"
                fields={[
                  { label: "Payout account", value: `${currentSettlement.bankName} bank, ${currentSettlement.accountLabel}` },
                  { label: "Acquiring bank", value: currentSettlement.acquiringBank },
                  { label: "TID", value: currentSettlement.tid },
                  { label: "Store", value: currentSettlement.store },
                  { label: "Payment method", value: paymentMethodLabel(currentSettlement.paymentMethod) },
                  { label: "Next settlement", value: currentSettlement.nextSettlementAt },
                  { label: "Weekend settlement", value: currentSettlement.weekendSettlementEnabled ? "Enabled" : "Not enabled" },
                  { label: "ODS", value: currentSettlement.odsEnabled ? `Enabled till ${currentSettlement.odsCutoff}` : "Not enabled" },
                ]}
              />

              <div className="my-8 h-px w-full bg-border/70" />

              <section className="space-y-6">
                <SectionTitle>Settlement breakup</SectionTitle>
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-3">
                  <DetailField label="Gross amount" value={inr(detailBreakup.grossAmount)} />
                  <DetailField label="Total deductions" value={inr(currentSettlement.deductionsTotal)} />
                  <DetailField label={payoutLabel} value={inr(currentSettlement.netAmount)} />
                </div>
              </section>

              <div className="my-8 h-px w-full bg-border/70" />

              <section className="space-y-6">
                <SectionTitle>Deduction details</SectionTitle>
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-3">
                  {detailDeductionRows.map((item) => (
                    <DetailField key={item.label} label={item.label} value={inr(item.value)} />
                  ))}
                </div>
              </section>

              <div className="my-8 h-px w-full bg-border/70" />

              <section className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                  <Headphones className="h-4 w-4 text-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-4 text-foreground">Need help with this settlement?</p>
                  <p className="mt-1 text-sm text-muted-foreground">Contact support for deductions, UTR, bank retry, or risk on-hold queries.</p>
                </div>
                <Button variant="outline" size="sm" className="h-8 shrink-0">Contact us</Button>
              </section>
            </div>

            <div className="hidden min-h-[760px] w-px bg-border/70 xl:block" />

            <aside className="min-w-0 px-2 py-2">
              <SectionTitle>Activity</SectionTitle>
              <div className="relative mt-4 space-y-6">
                <div className="absolute bottom-2 left-[7px] top-2 w-px bg-border/70" />
                {settlementActivityItems.map((event) => (
                  <SettlementActivityItem
                    key={event.title}
                    title={event.title}
                    subtitle={event.subtitle}
                    detail={event.detail}
                    icon={event.icon}
                  />
                ))}
              </div>
            </aside>
          </div>

          <section className="mt-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-medium leading-6 text-foreground">Transactions settled</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {currentSettlement.channel === "online"
                    ? "Search by transaction ID, merchant order ID, ARN, or RRN. Rows can open the transaction detail view."
                    : "Count split by transaction type for this in-store settlement."}
                </p>
              </div>
              <div className="flex gap-2">
                {transactionSplit.map((item) => (
                  <span key={item.type} className="inline-flex h-8 items-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground">
                    {item.type}: {item.count}
                  </span>
                ))}
              </div>
            </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <Table className="min-w-[1104px]">
                <TableHeader>
                  <TableRow className="h-10">
                    <TableHead className="px-3 text-sm font-medium text-muted-foreground">Transaction ID</TableHead>
                    <TableHead className="px-3 text-sm font-medium text-muted-foreground">{currentSettlement.channel === "online" ? "Created on" : "Transaction date"}</TableHead>
                    <TableHead className="px-3 text-sm font-medium text-muted-foreground">{currentSettlement.channel === "online" ? "Merchant order ID" : "Store"}</TableHead>
                    <TableHead className="px-3 text-sm font-medium text-muted-foreground">{currentSettlement.channel === "online" ? "ARN / RRN" : "Payment mode"}</TableHead>
                    <TableHead className="px-3 text-right text-sm font-medium text-muted-foreground">Transaction amount</TableHead>
                    <TableHead className="px-3 text-right text-sm font-medium text-muted-foreground">{currentSettlement.channel === "online" ? "Net settlement" : "Payout amount"}</TableHead>
                    <TableHead className="px-3 text-right text-sm font-medium text-muted-foreground">Deductions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailPagedRows.map((row, index) => (
                    <TableRow key={`${row.id}-${index}`} className="h-16 cursor-pointer align-top" onClick={() => router.push(`/transactions/${row.id}`)}>
                      <TableCell className="px-3 align-top text-sm font-medium text-foreground">{row.id}</TableCell>
                      <TableCell className="px-3 align-top">
                        <p className="text-sm font-medium text-foreground">{row.paymentDate}</p>
                        <p className="text-sm text-muted-foreground">{row.paymentTime}</p>
                      </TableCell>
                      <TableCell className="px-3 align-top">
                        {currentSettlement.channel === "online" ? (
                          <>
                            <p className="text-sm font-medium text-foreground">{row.merchantOrderId}</p>
                            <p className="text-sm text-muted-foreground">{row.payoutStatus} payout</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-foreground">{row.storeName}</p>
                            <p className="max-w-[224px] truncate text-sm text-muted-foreground">{row.storeAddress}</p>
                            <p className="text-sm text-muted-foreground">{row.tid}</p>
                          </>
                        )}
                      </TableCell>
                      <TableCell className="px-3 align-top">
                        {currentSettlement.channel === "online" ? (
                          <>
                            <p className="text-sm font-medium text-foreground">{row.arn}</p>
                            <p className="text-sm text-muted-foreground">{row.rrn}</p>
                          </>
                        ) : (
                          <div className="flex items-start gap-2">
                            <PaymentIcon method={row.paymentMethod} />
                            <div>
                              <p className="text-sm font-medium text-foreground">{row.paymentMethodLabel}</p>
                              <p className="text-sm text-muted-foreground">{row.paymentMethodSubLabel}</p>
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-3 text-right align-top"><p className="text-sm font-medium text-foreground">{inr(row.transactionAmount)}</p></TableCell>
                      <TableCell className="px-3 text-right align-top"><p className="text-sm font-medium text-foreground">{inr(row.payoutAmount)}</p></TableCell>
                      <TableCell className="px-3 text-right align-top">
                        <p className="text-sm font-medium text-foreground">{inr(row.totalDeduction)}</p>
                        {currentSettlement.channel === "online" ? <p className="text-sm text-muted-foreground">MDR {row.mdrRate} + GST</p> : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

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
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="px-8 py-8">
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-semibold leading-8 tracking-[-0.4px] text-foreground">Settlements</h1>
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
            <Clock3 className="h-4 w-4" />
            {channel === "online" ? "T+1 / T+2" : "T+1 standard"}
            <span className="h-4 w-px bg-border" />
            Settlement preferences
          </Link>
        </Button>
      </section>


      <section className="mt-7">
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${channel === "online" ? "bg-muted text-foreground" : "bg-secondary text-secondary-foreground"}`}>
              {channel === "online" ? <AlertTriangle className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{channel === "online" ? "Merchant action required" : `Enable faster settlements for ${channelLabel(channel)}`}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {channel === "online"
                  ? "Pending payouts can include unprocessed, pending settlement, risk-on-hold, and bank-rejected payouts. Risk holds may release up to 120 days after capture."
                  : "On Demand Settlement can be enabled for in-store payments. Pricing is configured separately for this channel."}
              </p>
            </div>
            <Button variant="outline" size="sm" className="h-8 shrink-0">Enable ODS</Button>
          </div>
        </div>
      </section>

      <section className="mt-4 h-[200px] overflow-hidden rounded-lg border border-border bg-card">
        <div className="grid h-full md:grid-cols-2">
          <div className="flex min-w-0 flex-col border-b border-border md:border-r md:border-b-0">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-foreground" />
                <p className="text-base font-medium text-card-foreground">Settled amount</p>
              </div>
              <Tabs value={summaryPeriod} onValueChange={(value) => setSummaryPeriod(value as typeof summaryPeriod)}>
                <TabsList className="h-8 rounded-[8px] bg-muted p-1">
                  <TabsTrigger value="today" className="h-6 rounded-[6px] border-transparent px-2 py-1 text-sm data-active:!border-transparent data-active:!bg-background">Today</TabsTrigger>
                  <TabsTrigger value="yesterday" className="h-6 rounded-[6px] border-transparent px-2 py-1 text-sm data-active:!border-transparent data-active:!bg-background">Yesterday</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex h-[136px] flex-col justify-between px-5 py-4">
              <div>
                <p className="text-xl font-semibold leading-7 text-foreground">₹{formatAmountWithPaise(summary.settledAmount)}</p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">{summary.settledCount} / {summary.totalCount} payments settled</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="flex min-w-0 flex-1 items-center gap-1 text-sm font-medium text-muted-foreground">
                  Settled in <HdfcMark size={14} /> HDFC bank, xx8787
                </p>
                <Button variant="link" className="h-6 p-0 text-sm text-primary underline">View deductions</Button>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="flex h-16 items-center gap-2 border-b border-border px-4">
              <Hourglass className="h-6 w-6 text-foreground" />
              <p className="text-base font-medium text-card-foreground">Yet to be settled</p>
            </div>
            <div className="flex h-[136px] flex-col justify-between px-5 py-4">
              <div>
                <p className="text-xl font-semibold leading-7 text-foreground">₹{formatAmountWithPaise(summary.unsettledAmount)}</p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">{summary.remainingCount} payments remaining</p>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Next {channelLabel(channel)} settlement by <span className="text-foreground">{summary.nextSettlementAt}</span></p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-[229px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={channel === "online" ? "Search UTR number" : "Search Settlement ID or UTR"}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setPage(1)
              }}
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
              <DropdownMenuRadioGroup value={dateFilter} onValueChange={(value) => { setDateFilter(value as typeof dateFilter); setPage(1) }}>
                <DropdownMenuRadioItem value="today">Today</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="all">All dates</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                More filters
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-secondary px-1 text-xs text-secondary-foreground">7</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-[520px] w-56 overflow-y-auto">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => { setStatusFilter(value as typeof statusFilter); setPage(1) }}>
                <DropdownMenuRadioItem value="all">All statuses</DropdownMenuRadioItem>
                {statuses.map((status) => <DropdownMenuRadioItem key={status} value={status}>{status}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Settlement type</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={typeFilter} onValueChange={(value) => { setTypeFilter(value as typeof typeFilter); setPage(1) }}>
                <DropdownMenuRadioItem value="all">All types</DropdownMenuRadioItem>
                {settlementTypes.map((type) => <DropdownMenuRadioItem key={type} value={type}>{type}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Payment method</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={paymentFilter} onValueChange={(value) => { setPaymentFilter(value as typeof paymentFilter); setPage(1) }}>
                <DropdownMenuRadioItem value="all">All methods</DropdownMenuRadioItem>
                {paymentMethods.map((method) => <DropdownMenuRadioItem key={method} value={method}>{paymentMethodLabel(method)}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Acquiring bank</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={bankFilter} onValueChange={(value) => { setBankFilter(value as typeof bankFilter); setPage(1) }}>
                <DropdownMenuRadioItem value="all">All banks</DropdownMenuRadioItem>
                {banks.map((bank) => <DropdownMenuRadioItem key={bank} value={bank.toLowerCase()}>{bank}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>TID</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={tidFilter} onValueChange={(value) => { setTidFilter(value); setPage(1) }}>
                <DropdownMenuRadioItem value="all">All TIDs</DropdownMenuRadioItem>
                {tids.map((tid) => <DropdownMenuRadioItem key={tid} value={tid}>{tid}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Store</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={storeFilter} onValueChange={(value) => { setStoreFilter(value); setPage(1) }}>
                <DropdownMenuRadioItem value="all">All stores</DropdownMenuRadioItem>
                {stores.map((store) => <DropdownMenuRadioItem key={store} value={store}>{store}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-8">
            <Mail className="h-4 w-4" />
            Email filtered
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            <ReceiptText className="h-4 w-4" />
            {channel === "online" ? "Download UTR report" : "Download MPR"}
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            <Download className="h-4 w-4" />
            Download settlement report
          </Button>
        </div>
      </section>

      <section className="mt-7 space-y-4">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <Table className="min-w-[1104px]">
              <TableHeader>
                <TableRow className="h-10">
                  <TableHead className="px-3 text-sm font-medium text-muted-foreground">{channel === "online" ? "UTR" : "Settlement ID"}</TableHead>
                  <TableHead className="px-3 text-sm font-medium text-muted-foreground">{channel === "online" ? "Settled on" : "UTR"}</TableHead>
                  <TableHead className="px-3 text-right text-sm font-medium text-muted-foreground">Gross amount</TableHead>
                  <TableHead className="px-3 text-right text-sm font-medium text-muted-foreground">Deductions</TableHead>
                  <TableHead className="px-3 text-right text-sm font-medium text-muted-foreground">{channel === "online" ? "Net settlement" : "Net amount"}</TableHead>
                  <TableHead className="px-3 text-sm font-medium text-muted-foreground">{channel === "online" ? "Refund / chargeback" : "Settled on"}</TableHead>
                  <TableHead className="px-3 text-sm font-medium text-muted-foreground">Status</TableHead>
                  <TableHead className="px-3 text-sm font-medium text-muted-foreground">{channel === "online" ? "Cycle" : "Channel"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRows.map((row) => (
                  <TableRow key={row.id} className="h-16 cursor-pointer align-top" onClick={() => router.push(`/settlements/${row.batchId}`)}>
                    <TableCell className="px-3 align-top text-sm font-medium text-foreground">
                      {channel === "online" ? (
                        <span className="inline-flex items-center gap-2">
                          {row.utr}
                          {row.settlementType !== "Normal" ? <Zap className="h-4 w-4 text-muted-foreground" /> : null}
                        </span>
                      ) : (
                        <>
                          <p>{row.batchId}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{row.settlementType} / {row.transactionCount} txns</p>
                        </>
                      )}
                    </TableCell>
                    <TableCell className="px-3 align-top text-sm font-medium text-foreground">
                      {channel === "online" ? (
                        <>
                          <p>{row.settlementDatePrimary}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{row.settlementDateSecondary}</p>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          {row.utr}
                          {row.settlementType !== "Normal" ? <Zap className="h-4 w-4 text-muted-foreground" /> : null}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-3 text-right align-top"><p className="text-sm font-medium text-foreground">{inr(row.grossAmount)}</p></TableCell>
                    <TableCell className="px-3 text-right align-top">
                      <p className="text-sm font-medium text-foreground">{inr(row.deductionsTotal)}</p>
                      {channel === "online" ? <p className="text-sm text-muted-foreground">MDR + GST</p> : null}
                    </TableCell>
                    <TableCell className="px-3 text-right align-top"><p className="text-sm font-medium text-foreground">{inr(row.netAmount)}</p></TableCell>
                    <TableCell className="px-3 align-top">
                      {channel === "online" ? (
                        <>
                          <p className="text-sm font-medium text-foreground">{inr(row.refundAmount + row.chargebackAmount)}</p>
                          <p className="text-sm text-muted-foreground">Refunds + chargebacks</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-foreground">{row.settlementDatePrimary}</p>
                          <p className="text-sm text-muted-foreground">{row.settlementDateSecondary}</p>
                        </>
                      )}
                    </TableCell>
                    <TableCell className="px-3 align-top"><StatusBadge status={row.status} /></TableCell>
                    <TableCell className="px-3 align-top">
                      {channel === "online" ? (
                        <>
                          <p className="text-sm font-medium text-foreground">{row.settlementCycle}</p>
                          <p className="text-sm text-muted-foreground">{row.odsEnabled ? `ODS till ${row.odsCutoff}` : row.weekendSettlementEnabled ? "Weekend enabled" : "Standard"}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-foreground">{channelLabel(row.channel)}</p>
                          <p className="text-sm text-muted-foreground">{row.acquiringBank} / {row.tid}</p>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
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
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="h-8">Save changes</Button>
      </div>

      <section className="mt-8 flex flex-col gap-4">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card">
          <Settings2 className="h-5 w-5 text-foreground" />
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-3xl font-semibold leading-8 tracking-[-0.4px] text-foreground">Settlement preferences</h1>
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
              <Building2 className="h-5 w-5 text-muted-foreground" />
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
              <CircleAlert className="h-5 w-5 text-muted-foreground" />
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
