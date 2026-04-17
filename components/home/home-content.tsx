"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, CheckCircle2, CircleAlert, Download, FileUp, Loader2, MoreHorizontal, Pause, PenLine, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { HighchartsPanelChart } from "@/components/ui/highcharts"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"
import { cn } from "@/lib/utils"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ProductWorkspaceNav, type ProductWorkspaceSection } from "@/components/dashboard/product-workspace-nav"
import { PageHeader } from "@/components/ui/panels"
import { configuredProductNames } from "@/lib/products-data"
import { OverviewAnalyticsCanvas, type AnalyticsWidget } from "@/components/dashboard/overview-analytics-canvas"
import { SectionSummaryStrip, type SectionSummaryMetric } from "@/components/dashboard/section-summary-strip"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type WindowSegment = "7D" | "30D" | "90D"

interface MetricItem {
  label: string
  value: string
  detail: string
}

interface PerformanceCardConfig {
  id: string
  label: string
  title: string
  ctaLabel: string
  href: string
  metrics: MetricItem[]
  series: {
    processed: number[]
    net: number[]
    success: number[]
  }
}

type TableRowDetail = {
  id: string
  title: string
  description: string
  value: string
  rows: Array<{ label: string; value: string }>
}

type ImeiVerificationStatus = "idle" | "processing" | "completed"
type BulkRefundStatus = "idle" | "processing" | "completed"
type DisputeStatus = "Win" | "Loss" | "In review" | "Pending action"
type RecoveryStatus = "Recovered" | "Recovering" | "At risk" | "Not recovered"
type DisputeActionType = "partial-defend" | "defend" | "accept"

type RefundTableRow = {
  orderId: string
  transactionId: string
  merchantOrderId: string
  amount: number
  transactionType: "Order" | "Payment"
  refundStatus: "Initiated" | "Pending" | "Success" | "Failed"
  paymentMethod: string
  createdAt: string
  product: "Checkout" | "POS Terminal" | "Payment Links"
  refundId: string
}

type RefundTimelineItem = {
  status: string
  timestamp: string
  detail: string
}

type DisputeTimelineItem = {
  status: string
  timestamp: string
  detail: string
}

type DisputeTableRow = {
  disputeId: string
  paymentId: string
  amount: number
  dueDate: string
  status: DisputeStatus
  recoveryStatus: RecoveryStatus
  product: "Checkout" | "POS Terminal" | "Payment Links"
  slaHoursRemaining: number
}

type ReportType = "payment" | "refunds" | "settlements" | "payout"
type ReportStatus = "processing" | "success" | "failed"
type ReportOutputFormat = "excel" | "csv"
type ReportFieldSelectionMode = "all" | "custom"
type ReportCustomizeStep = "fields" | "sequence"
type ScheduleFrequency = "daily" | "weekly" | "monthly"
type ScheduleDeliveryRecipient = "email" | "sftp"
type ScheduledReportStatus = "active" | "paused" | "failed"
type SftpAuthMode = "password" | "ppk"

type GeneratedReportRow = {
  id: string
  reportType: ReportType
  reportName: string
  createdOn: string
  dateRange: string
  status: ReportStatus
  fileFormat: ReportOutputFormat
}

type ScheduledReportRow = {
  id: string
  scheduleName: string
  reportType: ReportType
  frequency: ScheduleFrequency
  format: ReportOutputFormat
  status: ScheduledReportStatus
  createdOn: string
  createdBy: string
  deliveryRecipients: ScheduleDeliveryRecipient[]
  emailRecipient?: string
  sftpHost?: string
  sftpPort?: string
  sftpUserId?: string
  sftpPath?: string
  sftpAuthMode?: SftpAuthMode
  sftpPpkFileName?: string
}

type ReportFieldGroup = {
  id: string
  title: string
  fields: string[]
}

type SavedReportPreset = {
  fields: string[]
  displayNames: Record<string, string>
}

const quarterLabels = ["Q2 2023", "Q3 2023", "Q4 2023", "Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"]
const windowOptions: WindowSegment[] = ["7D", "30D", "90D"]
const windowScale: Record<WindowSegment, number> = {
  "7D": 0.96,
  "30D": 1,
  "90D": 1.05,
}

const alertItems: Array<{ title: string; action: string; href: string }> = [
  { title: "6 disputes need review", action: "Review disputes", href: "/online-payments" },
  { title: "Documentation update pending", action: "Open docs", href: "https://developer.pinelabs.com/" },
  { title: "2 settlement exceptions", action: "View settlements", href: "/offline-payments" },
]

const performanceCards: PerformanceCardConfig[] = [
  {
    id: "overall",
    label: "Overall",
    title: "Overall business performance",
    ctaLabel: "View platform analytics",
    href: "/online-payments",
    metrics: [
      { label: "Gross volume", value: "₹8.6M", detail: "+12.4%" },
      { label: "Payment success", value: "96.8%", detail: "+0.9 pts" },
      { label: "Settlement reliability", value: "99.2%", detail: "2 delayed" },
    ],
    series: {
      processed: [24.2, 22.8, 23.6, 20.4, 24.5, 24.1, 25.7],
      net: [2.1, 0.7, 7.0, 0.2, 0.4, 0.9, 2.3],
      success: [96.3, 96.1, 96.5, 95.9, 96.6, 96.7, 96.8],
    },
  },
  {
    id: "online",
    label: "Checkout",
    title: "Checkout overview",
    ctaLabel: "View online details",
    href: "/online-payments",
    metrics: [
      { label: "Processed value", value: "₹5.1M", detail: "UPI share 44%" },
      { label: "Success rate", value: "96.9%", detail: "+1.1 pts" },
      { label: "Refunds", value: "1.2%", detail: "Within target" },
    ],
    series: {
      processed: [16.4, 15.9, 17.8, 14.6, 18.2, 18.0, 18.9],
      net: [1.9, 1.7, 2.4, 1.2, 2.1, 2.2, 2.5],
      success: [96.1, 95.9, 96.5, 95.6, 96.7, 96.8, 96.9],
    },
  },
  {
    id: "offline",
    label: "POS Terminal",
    title: "POS Terminal overview",
    ctaLabel: "View offline details",
    href: "/offline-payments",
    metrics: [
      { label: "Counter value", value: "₹2.4M", detail: "Tap share growing" },
      { label: "Device uptime", value: "98.7%", detail: "3 unstable" },
      { label: "Settlement lag", value: "0.8%", detail: "Below threshold" },
    ],
    series: {
      processed: [5.8, 5.2, 4.9, 4.7, 5.4, 5.1, 5.8],
      net: [0.6, 0.5, 0.4, 0.3, 0.5, 0.5, 0.6],
      success: [98.3, 98.1, 98.0, 97.8, 98.5, 98.4, 98.7],
    },
  },
  {
    id: "links",
    label: "Pay by link",
    title: "Pay by link overview",
    ctaLabel: "View link details",
    href: "/payment-links",
    metrics: [
      { label: "Processed value", value: "₹1.1M", detail: "3,214 links" },
      { label: "Conversion", value: "39.8%", detail: "+3.1 pts" },
      { label: "Expired links", value: "11.4%", detail: "-1.5 pts" },
    ],
    series: {
      processed: [2.0, 1.7, 2.2, 1.9, 2.4, 2.3, 2.6],
      net: [0.4, 0.2, 0.6, 0.4, 0.6, 0.6, 0.8],
      success: [37.2, 36.8, 38.4, 37.9, 39.1, 39.4, 39.8],
    },
  },
]

const allProductSettlementRows = [
  { id: "APL-STL-01", product: "Checkout", amount: "₹1,42,330", state: "Processing" },
  { id: "APL-STL-02", product: "POS Terminal", amount: "₹1,12,300", state: "Completed" },
  { id: "APL-STL-03", product: "Payment Links", amount: "₹48,300", state: "Completed" },
]

const allProductTransactionRows = [
  {
    orderId: "ORD-41021",
    transactionId: "TXN-990021",
    merchantOrderId: "M-ACM-9021",
    amount: 2450,
    transactionType: "Payment",
    paymentStatus: "Success",
    paymentMethod: "UPI · GPay",
    createdAt: "15 Apr 2026, 11:42 AM",
    product: "Checkout",
    refundedAmount: 0,
  },
  {
    orderId: "ORD-41020",
    transactionId: "TXN-990020",
    merchantOrderId: "M-ACM-9018",
    amount: 5200,
    transactionType: "Payment",
    paymentStatus: "Success",
    paymentMethod: "Card · Visa",
    createdAt: "15 Apr 2026, 11:30 AM",
    product: "POS Terminal",
    refundedAmount: 500,
  },
  {
    orderId: "ORD-41018",
    transactionId: "TXN-990018",
    merchantOrderId: "M-LNK-6622",
    amount: 8000,
    transactionType: "Order",
    paymentStatus: "Pending",
    paymentMethod: "Payment Link · SMS",
    createdAt: "15 Apr 2026, 11:18 AM",
    product: "Payment Links",
    refundedAmount: 0,
  },
  {
    orderId: "ORD-41016",
    transactionId: "TXN-990016",
    merchantOrderId: "M-ACM-9004",
    amount: 1100,
    transactionType: "Payment",
    paymentStatus: "Failed",
    paymentMethod: "Card · MasterCard",
    createdAt: "15 Apr 2026, 10:56 AM",
    product: "Checkout",
    refundedAmount: 0,
  },
  {
    orderId: "ORD-41012",
    transactionId: "TXN-990012",
    merchantOrderId: "M-POS-4501",
    amount: 3190,
    transactionType: "Order",
    paymentStatus: "Initiated",
    paymentMethod: "Tap · RuPay",
    createdAt: "15 Apr 2026, 10:21 AM",
    product: "POS Terminal",
    refundedAmount: 0,
  },
  {
    orderId: "ORD-41008",
    transactionId: "TXN-990008",
    merchantOrderId: "M-LNK-6597",
    amount: 12499,
    transactionType: "Payment",
    paymentStatus: "Success",
    paymentMethod: "Netbanking · HDFC",
    createdAt: "15 Apr 2026, 09:37 AM",
    product: "Payment Links",
    refundedAmount: 1330,
  },
  {
    orderId: "ORD-41005",
    transactionId: "TXN-990005",
    merchantOrderId: "M-ACM-8891",
    amount: 660,
    transactionType: "Order",
    paymentStatus: "Pending",
    paymentMethod: "UPI · PhonePe",
    createdAt: "15 Apr 2026, 09:02 AM",
    product: "Checkout",
    refundedAmount: 0,
  },
  {
    orderId: "ORD-40998",
    transactionId: "TXN-989998",
    merchantOrderId: "M-POS-4489",
    amount: 2899,
    transactionType: "Payment",
    paymentStatus: "Success",
    paymentMethod: "Card · Amex",
    createdAt: "15 Apr 2026, 08:41 AM",
    product: "POS Terminal",
    refundedAmount: 0,
  },
]

const allProductDisputeRows: DisputeTableRow[] = [
  {
    disputeId: "DSP-91021",
    paymentId: "TXN-990021",
    amount: 12500,
    dueDate: "18 Apr 2026, 06:00 PM",
    status: "Pending action",
    recoveryStatus: "At risk",
    product: "Checkout",
    slaHoursRemaining: 22,
  },
  {
    disputeId: "DSP-91020",
    paymentId: "TXN-990020",
    amount: 2300,
    dueDate: "20 Apr 2026, 12:00 PM",
    status: "In review",
    recoveryStatus: "Recovering",
    product: "POS Terminal",
    slaHoursRemaining: 66,
  },
  {
    disputeId: "DSP-91018",
    paymentId: "TXN-990018",
    amount: 1800,
    dueDate: "14 Apr 2026, 05:00 PM",
    status: "Loss",
    recoveryStatus: "Not recovered",
    product: "Payment Links",
    slaHoursRemaining: 0,
  },
  {
    disputeId: "DSP-91012",
    paymentId: "TXN-990012",
    amount: 3190,
    dueDate: "13 Apr 2026, 03:30 PM",
    status: "Win",
    recoveryStatus: "Recovered",
    product: "POS Terminal",
    slaHoursRemaining: 0,
  },
]

const disputeTimelineById: Record<string, DisputeTimelineItem[]> = {
  "DSP-91021": [
    { status: "Dispute raised", timestamp: "15 Apr 2026, 09:10 AM", detail: "Issuer raised chargeback for transaction TXN-990021." },
    { status: "Case assigned", timestamp: "15 Apr 2026, 09:25 AM", detail: "Assigned to Chargeback Ops queue." },
    { status: "Pending action", timestamp: "16 Apr 2026, 11:30 AM", detail: "Merchant evidence is required before SLA cutoff." },
  ],
  "DSP-91020": [
    { status: "Dispute raised", timestamp: "14 Apr 2026, 10:40 AM", detail: "Customer dispute created for in-store card payment." },
    { status: "Defended", timestamp: "14 Apr 2026, 03:15 PM", detail: "Evidence submitted with signed receipt and logs." },
    { status: "In review", timestamp: "15 Apr 2026, 01:20 PM", detail: "Issuer bank is reviewing submitted evidence." },
  ],
  "DSP-91018": [
    { status: "Dispute raised", timestamp: "12 Apr 2026, 11:00 AM", detail: "Chargeback initiated by issuing bank." },
    { status: "In review", timestamp: "13 Apr 2026, 09:35 AM", detail: "Case moved to card network review stage." },
    { status: "Loss", timestamp: "14 Apr 2026, 06:10 PM", detail: "Dispute closed as lost due to unfavorable decision." },
  ],
  "DSP-91012": [
    { status: "Dispute raised", timestamp: "10 Apr 2026, 08:50 AM", detail: "Issuer flagged cardholder claim on POS payment." },
    { status: "Defended", timestamp: "10 Apr 2026, 11:20 AM", detail: "Merchant submitted complete evidence pack." },
    { status: "Win", timestamp: "13 Apr 2026, 04:00 PM", detail: "Chargeback reversed in merchant favor." },
  ],
}

const allProductRefundRows: RefundTableRow[] = [
  {
    orderId: "ORD-41020",
    transactionId: "TXN-990020",
    merchantOrderId: "M-ACM-9018",
    amount: 5200,
    transactionType: "Payment",
    refundStatus: "Success",
    paymentMethod: "Card · Visa",
    createdAt: "15 Apr 2026, 12:05 PM",
    product: "POS Terminal",
    refundId: "RFD-1205",
  },
  {
    orderId: "ORD-41008",
    transactionId: "TXN-990008",
    merchantOrderId: "M-LNK-6597",
    amount: 1330,
    transactionType: "Payment",
    refundStatus: "Pending",
    paymentMethod: "Netbanking · HDFC",
    createdAt: "15 Apr 2026, 11:51 AM",
    product: "Payment Links",
    refundId: "RFD-1198",
  },
  {
    orderId: "ORD-41005",
    transactionId: "TXN-990005",
    merchantOrderId: "M-ACM-8891",
    amount: 660,
    transactionType: "Order",
    refundStatus: "Initiated",
    paymentMethod: "UPI · PhonePe",
    createdAt: "15 Apr 2026, 11:32 AM",
    product: "Checkout",
    refundId: "RFD-1189",
  },
  {
    orderId: "ORD-40998",
    transactionId: "TXN-989998",
    merchantOrderId: "M-POS-4489",
    amount: 2899,
    transactionType: "Payment",
    refundStatus: "Failed",
    paymentMethod: "Card · Amex",
    createdAt: "15 Apr 2026, 11:08 AM",
    product: "POS Terminal",
    refundId: "RFD-1182",
  },
  {
    orderId: "ORD-41016",
    transactionId: "TXN-990016",
    merchantOrderId: "M-ACM-9004",
    amount: 1100,
    transactionType: "Payment",
    refundStatus: "Success",
    paymentMethod: "Card · MasterCard",
    createdAt: "15 Apr 2026, 10:44 AM",
    product: "Checkout",
    refundId: "RFD-1171",
  },
]

const refundTimelineById: Record<string, RefundTimelineItem[]> = {
  "RFD-1205": [
    { status: "Refund requested", timestamp: "15 Apr 2026, 12:05 PM", detail: "Bulk upload request accepted." },
    { status: "Validation completed", timestamp: "15 Apr 2026, 12:07 PM", detail: "Order and transaction mapping passed." },
    { status: "Bank acknowledged", timestamp: "15 Apr 2026, 12:11 PM", detail: "Refund route locked to issuer bank." },
    { status: "Refund successful", timestamp: "15 Apr 2026, 12:15 PM", detail: "Customer account credited." },
  ],
  "RFD-1198": [
    { status: "Refund requested", timestamp: "15 Apr 2026, 11:51 AM", detail: "Bulk upload request accepted." },
    { status: "Validation completed", timestamp: "15 Apr 2026, 11:55 AM", detail: "Reference check passed." },
    { status: "Pending with bank", timestamp: "15 Apr 2026, 12:00 PM", detail: "Awaiting acquiring bank confirmation." },
  ],
  "RFD-1189": [
    { status: "Refund requested", timestamp: "15 Apr 2026, 11:32 AM", detail: "Order refund created from dashboard." },
    { status: "Initiated", timestamp: "15 Apr 2026, 11:34 AM", detail: "Queued for processor handoff." },
  ],
  "RFD-1182": [
    { status: "Refund requested", timestamp: "15 Apr 2026, 11:08 AM", detail: "Request received via bulk upload." },
    { status: "Validation completed", timestamp: "15 Apr 2026, 11:10 AM", detail: "Request payload verified." },
    { status: "Refund failed", timestamp: "15 Apr 2026, 11:15 AM", detail: "Destination account blocked by bank." },
  ],
  "RFD-1171": [
    { status: "Refund requested", timestamp: "15 Apr 2026, 10:44 AM", detail: "Manual refund initiated by support team." },
    { status: "Validation completed", timestamp: "15 Apr 2026, 10:47 AM", detail: "KYC and amount guardrails passed." },
    { status: "Refund successful", timestamp: "15 Apr 2026, 10:55 AM", detail: "Amount settled to customer source account." },
  ],
}

const reportTypeLabel: Record<ReportType, string> = {
  payment: "Payment report",
  refunds: "Refund report",
  settlements: "Settlement report",
  payout: "Payout report",
}

const quickReportCards: Array<{ type: ReportType; title: string; description: string }> = [
  {
    type: "payment",
    title: "Payment report",
    description: "Generate transaction level payment report with status, methods, and product breakdown.",
  },
  {
    type: "refunds",
    title: "Refund report",
    description: "Generate refund level report with initiation, completion, and exception details.",
  },
  {
    type: "settlements",
    title: "Settlement report",
    description: "Generate batch settlement report including deductions, payout amount, and bank references.",
  },
  {
    type: "payout",
    title: "Payout report",
    description: "Generate payout ledger report with recoveries, fees, and final payable values.",
  },
]

const reportFieldLibrary: Record<ReportType, ReportFieldGroup[]> = {
  payment: [
    {
      id: "transaction-details",
      title: "Transaction details",
      fields: [
        "Transaction ID",
        "Merchant ID",
        "Parent transaction ID",
        "Transaction amount",
        "Transaction type",
        "Transaction status",
        "Currency code",
        "Latest action date",
        "Transaction date and time",
        "Transaction completion date and time",
        "Original transaction amount",
        "Refund amount",
        "Captured amount",
        "Override reason",
        "Is transaction cancellable",
      ],
    },
    {
      id: "card-and-payment",
      title: "Card and payment information",
      fields: [
        "Payment mode",
        "Payment method",
        "Card type",
        "Card issuer",
        "Network",
        "Authorization code",
      ],
    },
    {
      id: "merchant-and-acquirer",
      title: "Merchant and acquirer information",
      fields: [
        "Store name",
        "Terminal ID",
        "Acquirer",
        "MCC",
        "Settlement cycle",
      ],
    },
    {
      id: "loan-and-emi",
      title: "EMI and loan details",
      fields: ["EMI tenure", "Interest type", "Loan partner", "Loan status"],
    },
    {
      id: "steps-and-status",
      title: "Transaction steps and status",
      fields: ["Initiated at", "Authorized at", "Captured at", "Settled at", "Final status"],
    },
    {
      id: "customer-contact",
      title: "Customer contact information",
      fields: ["Customer name", "Customer phone", "Customer email"],
    },
    {
      id: "record-meta",
      title: "Record and additional details",
      fields: ["Risk score", "Fraud flag", "Source channel", "Remarks"],
    },
    {
      id: "custom",
      title: "User defined fields",
      fields: ["UDF1", "UDF2", "UDF3", "UDF4"],
    },
  ],
  refunds: [
    {
      id: "refund-core",
      title: "Refund details",
      fields: [
        "Refund ID",
        "Order ID",
        "Transaction ID",
        "Refund amount",
        "Refund type",
        "Refund status",
        "Refund initiated on",
        "Refund completed on",
      ],
    },
    {
      id: "refund-meta",
      title: "Recoveries and reason",
      fields: ["Refund reason", "Recovery status", "Recovery amount", "Failed reason", "Processor remarks"],
    },
  ],
  settlements: [
    {
      id: "settlement-core",
      title: "Settlement details",
      fields: [
        "UTR",
        "Bank reference",
        "Settlement date",
        "Settlement amount",
        "Transaction amount",
        "Deductions",
        "No of transactions",
        "Settlement type",
        "Settlement status",
      ],
    },
    {
      id: "settlement-bank",
      title: "Bank account details",
      fields: ["Bank name", "Account number", "IFSC", "Initiation date", "ETA"],
    },
  ],
  payout: [
    {
      id: "payout-summary",
      title: "Payout breakdown",
      fields: [
        "Total refunds",
        "Loan recovery",
        "Chargeback recovery",
        "AR recovery",
        "Weather recovery",
        "Risk hold",
        "Risk release",
        "Bank holiday adjustment",
        "Statement fee",
        "Same day settlement fee",
        "On-demand settlement fee",
        "Net payable",
        "Final payout to merchant account",
      ],
    },
    {
      id: "payout-bank",
      title: "Bank and transfer details",
      fields: [
        "Currency",
        "IFSC",
        "Account number",
        "Nodal UTR number",
        "Bank reference",
        "Number of UTR amount",
      ],
    },
  ],
}

const initialReportRows: GeneratedReportRow[] = [
  {
    id: "RPT-84012",
    reportType: "payment",
    reportName: "Payment performance MPR",
    createdOn: "16 Apr 2026, 09:15 AM",
    dateRange: "01 Apr 2026 - 15 Apr 2026",
    status: "success",
    fileFormat: "excel",
  },
  {
    id: "RPT-84011",
    reportType: "refunds",
    reportName: "Refund operations weekly",
    createdOn: "16 Apr 2026, 08:52 AM",
    dateRange: "08 Apr 2026 - 15 Apr 2026",
    status: "processing",
    fileFormat: "csv",
  },
  {
    id: "RPT-84009",
    reportType: "settlements",
    reportName: "Settlement reconciliation",
    createdOn: "15 Apr 2026, 05:41 PM",
    dateRange: "14 Apr 2026 - 15 Apr 2026",
    status: "failed",
    fileFormat: "excel",
  },
]

const initialScheduledRows: ScheduledReportRow[] = [
  {
    id: "SCH-5104",
    scheduleName: "Daily payment ops report",
    reportType: "payment",
    frequency: "daily",
    format: "excel",
    status: "active",
    createdOn: "15 Apr 2026, 06:15 PM",
    createdBy: "Tirth Trivedi",
    deliveryRecipients: ["email"],
    emailRecipient: "ops@merchant.com",
  },
  {
    id: "SCH-5103",
    scheduleName: "Weekly refund reconciliation",
    reportType: "refunds",
    frequency: "weekly",
    format: "csv",
    status: "paused",
    createdOn: "14 Apr 2026, 10:05 AM",
    createdBy: "Payments Ops",
    deliveryRecipients: ["email", "sftp"],
    emailRecipient: "finance@merchant.com",
    sftpHost: "reports.merchant.com",
    sftpPort: "22",
    sftpUserId: "merchant_reports",
    sftpPath: "/incoming/refunds/",
    sftpAuthMode: "ppk",
    sftpPpkFileName: "merchant_reports.ppk",
  },
]

const allProductVasRows = [
  { id: "APL-VAS-01", product: "Checkout", service: "Smart routing", status: "enabled", owner: "Payments Ops" },
  { id: "APL-VAS-02", product: "POS Terminal", service: "AMEX acceptance", status: "pending", owner: "Terminal Ops" },
  { id: "APL-VAS-03", product: "Payment Links", service: "Smart reminders", status: "enabled", owner: "Collections Team" },
]

function parseInr(value: string) {
  return Number(value.replace(/[^\d.-]/g, ""))
}

function parseTransactionTimestamp(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function composeDateTime(date: string, time: string, fallback: "start" | "end") {
  if (!date) return null
  const resolvedTime = time || (fallback === "start" ? "00:00" : "23:59")
  const parsed = new Date(`${date}T${resolvedTime}:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function toCsvRow(values: Array<string | number>) {
  return values
    .map((value) => {
      const normalized = String(value ?? "")
      if (!/[",\n]/.test(normalized)) return normalized
      return `"${normalized.replace(/"/g, "\"\"")}"`
    })
    .join(",")
}

function formatDateRangeLabel(start: string, end: string) {
  if (!start || !end) return "Custom range"
  return `${start} - ${end}`
}

function parseRecipients(value: string) {
  return value
    .split(/[,\n;]+/g)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function getUniqueReportFields(type: ReportType) {
  return Array.from(new Set(reportFieldLibrary[type].flatMap((group) => group.fields)))
}

function buildReportId() {
  return `RPT-${Math.floor(10000 + Math.random() * 89999)}`
}

function buildScheduleId() {
  return `SCH-${Math.floor(1000 + Math.random() * 8999)}`
}

function formatTimestampForTable(date = new Date()) {
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

const scheduleFrequencyLabel: Record<ScheduleFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
}

function buildChartOptions(card: PerformanceCardConfig, windowSegment: WindowSegment) {
  const scale = windowScale[windowSegment]
  const processed = card.series.processed.map((value) => Number((value * scale).toFixed(2)))
  const net = card.series.net.map((value) => Number((value * scale).toFixed(2)))
  const success = card.series.success.map((value) => Number((value + (scale - 1) * 1.2).toFixed(2)))

  return {
    chart: { type: "line" },
    xAxis: { categories: quarterLabels },
    yAxis: [
      {
        title: { text: undefined },
        labels: { format: "{value}M" },
      },
      {
        title: { text: undefined },
        opposite: true,
        labels: { format: "{value}%" },
      },
    ],
    legend: { enabled: true, align: "right", verticalAlign: "bottom" },
    tooltip: { shared: true },
    series: [
      {
        type: "line",
        name: "Processed value",
        data: processed,
        color: "var(--color-chart-3)",
        lineWidth: 1.8,
      },
      {
        type: "line",
        name: "Net revenue",
        data: net,
        color: "var(--color-muted-foreground)",
        lineWidth: 1.8,
        dashStyle: "ShortDot",
      },
      {
        type: "line",
        name: "Payment success",
        yAxis: 1,
        data: success,
        color: "var(--color-primary)",
        lineWidth: 1.8,
      },
    ],
  }
}

function PerformanceCard({
  card,
  windowSegment,
  onSelectWindow,
}: {
  card: PerformanceCardConfig
  windowSegment: WindowSegment
  onSelectWindow: (segment: WindowSegment) => void
}) {
  const chartOptions = useMemo(() => buildChartOptions(card, windowSegment), [card, windowSegment])

  return (
    <section className="rounded-lg bg-card/75 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{card.label}</p>
          <h2 className="text-[15px] font-semibold text-foreground">{card.title}</h2>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center rounded-md bg-muted/70 p-0.5">
            {windowOptions.map((item) => (
              <Button variant="ghost"
                key={`${card.id}-${item}`}
                onClick={() => onSelectWindow(item)}
                className={cn(
                  "rounded-sm px-2.5 py-1 text-[11px] transition-colors",
                  windowSegment === item ? "bg-card text-foreground" : "text-muted-foreground",
                )}
              >
                {item}
              </Button>
            ))}
          </div>
          <Button asChild size="sm" className="h-8 rounded-md px-3 text-[11px]">
            <Link href={card.href}>
              {card.ctaLabel}
              <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-3 grid border-y border-border/55 sm:grid-cols-3 sm:divide-x sm:divide-border/55">
        {card.metrics.map((metric, index) => (
          <div
            key={`${card.id}-${metric.label}`}
            className={cn("px-3 py-2", index < 2 ? "border-b border-border/55 sm:border-b-0" : "")}
          >
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{metric.label}</p>
            <p className="mt-1 text-[16px] font-semibold text-foreground">{metric.value}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{metric.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 h-[260px] overflow-hidden rounded-md p-1">
        <HighchartsPanelChart options={chartOptions} />
      </div>
    </section>
  )
}

export function HomeContent({ initialSection = "overview" }: { initialSection?: ProductWorkspaceSection } = {}) {
  const [navSection, setNavSection] = useState<ProductWorkspaceSection>(initialSection)
  const [overviewCustomizeOpen, setOverviewCustomizeOpen] = useState(false)
  const [selectedTableDetail, setSelectedTableDetail] = useState<TableRowDetail | null>(null)
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all")
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null)
  const [refundSheetOpen, setRefundSheetOpen] = useState(false)
  const [refundType, setRefundType] = useState<"full" | "partial">("full")
  const [partialRefundAmount, setPartialRefundAmount] = useState("")
  const [refundStep, setRefundStep] = useState<"form" | "success">("form")
  const [imeiSheetOpen, setImeiSheetOpen] = useState(false)
  const [imeiStatus, setImeiStatus] = useState<ImeiVerificationStatus>("idle")
  const [imeiProcessedRows, setImeiProcessedRows] = useState(0)
  const [imeiTotalRows, setImeiTotalRows] = useState(0)
  const [imeiEstimatedMinutes, setImeiEstimatedMinutes] = useState(0)
  const [imeiBackgroundMode, setImeiBackgroundMode] = useState(false)
  const [imeiBannerVisible, setImeiBannerVisible] = useState(false)
  const [imeiUploadedFileName, setImeiUploadedFileName] = useState("")
  const [imeiUploadedFileSize, setImeiUploadedFileSize] = useState(0)
  const [imeiStartDate, setImeiStartDate] = useState("2026-04-15")
  const [imeiStartTime, setImeiStartTime] = useState("08:00")
  const [imeiEndDate, setImeiEndDate] = useState("2026-04-15")
  const [imeiEndTime, setImeiEndTime] = useState("23:00")
  const [refundTypeFilter, setRefundTypeFilter] = useState("all")
  const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null)
  const [refundDetailSheetOpen, setRefundDetailSheetOpen] = useState(false)
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null)
  const [disputeActionType, setDisputeActionType] = useState<DisputeActionType>("defend")
  const [disputeActionStep, setDisputeActionStep] = useState<"form" | "confirm" | "success">("form")
  const [disputeDefendAmount, setDisputeDefendAmount] = useState("")
  const [disputeComment, setDisputeComment] = useState("")
  const [disputeDocuments, setDisputeDocuments] = useState({
    voiceDelivery: "",
    rebuttalLetter: "",
    refundDetails: "",
    additionalDocuments: "",
  })
  const [bulkRefundSheetOpen, setBulkRefundSheetOpen] = useState(false)
  const [bulkRefundStatus, setBulkRefundStatus] = useState<BulkRefundStatus>("idle")
  const [bulkRefundProcessedRows, setBulkRefundProcessedRows] = useState(0)
  const [bulkRefundTotalRows, setBulkRefundTotalRows] = useState(0)
  const [bulkRefundEstimatedMinutes, setBulkRefundEstimatedMinutes] = useState(0)
  const [bulkRefundBackgroundMode, setBulkRefundBackgroundMode] = useState(false)
  const [bulkRefundBannerVisible, setBulkRefundBannerVisible] = useState(false)
  const [bulkRefundUploadedFileName, setBulkRefundUploadedFileName] = useState("")
  const [bulkRefundUploadedFileSize, setBulkRefundUploadedFileSize] = useState(0)
  const [bulkRefundStartDate, setBulkRefundStartDate] = useState("2026-04-15")
  const [bulkRefundStartTime, setBulkRefundStartTime] = useState("08:00")
  const [bulkRefundEndDate, setBulkRefundEndDate] = useState("2026-04-15")
  const [bulkRefundEndTime, setBulkRefundEndTime] = useState("23:00")
  const [reportRows, setReportRows] = useState<GeneratedReportRow[]>(initialReportRows)
  const [scheduledRows, setScheduledRows] = useState<ScheduledReportRow[]>(initialScheduledRows)
  const [reportsTableView, setReportsTableView] = useState<"report" | "schedule">("report")
  const [generateReportSheetOpen, setGenerateReportSheetOpen] = useState(false)
  const [scheduleReportSheetOpen, setScheduleReportSheetOpen] = useState(false)
  const [customizeReportSheetOpen, setCustomizeReportSheetOpen] = useState(false)
  const [activeReportType, setActiveReportType] = useState<ReportType>("payment")
  const [reportOutputFormat, setReportOutputFormat] = useState<ReportOutputFormat>("excel")
  const [reportSaveAsName, setReportSaveAsName] = useState("")
  const [reportRangeStart, setReportRangeStart] = useState("2026-04-01")
  const [reportRangeEnd, setReportRangeEnd] = useState("2026-04-15")
  const [reportFieldSelectionMode, setReportFieldSelectionMode] = useState<ReportFieldSelectionMode>("all")
  const [reportSelectedFields, setReportSelectedFields] = useState<string[]>(getUniqueReportFields("payment"))
  const [scheduleFrequency, setScheduleFrequency] = useState<ScheduleFrequency>("daily")
  const [scheduleEmailInput, setScheduleEmailInput] = useState("")
  const [scheduleEmailRecipients, setScheduleEmailRecipients] = useState<string[]>(["ops@merchant.com"])
  const [scheduleName, setScheduleName] = useState("")
  const [scheduleDeliveryRecipients, setScheduleDeliveryRecipients] = useState<ScheduleDeliveryRecipient[]>(["email"])
  const [scheduleSftpHost, setScheduleSftpHost] = useState("")
  const [scheduleSftpPort, setScheduleSftpPort] = useState("22")
  const [scheduleSftpUserId, setScheduleSftpUserId] = useState("")
  const [scheduleSftpPassword, setScheduleSftpPassword] = useState("")
  const [scheduleSftpPath, setScheduleSftpPath] = useState("")
  const [scheduleSftpAuthMode, setScheduleSftpAuthMode] = useState<SftpAuthMode>("password")
  const [scheduleSftpPpkFileName, setScheduleSftpPpkFileName] = useState("")
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null)
  const [customizeStep, setCustomizeStep] = useState<ReportCustomizeStep>("fields")
  const [customizeReportType, setCustomizeReportType] = useState<ReportType>("payment")
  const [customizeSelectedFields, setCustomizeSelectedFields] = useState<string[]>(getUniqueReportFields("payment"))
  const [customizeDisplayNames, setCustomizeDisplayNames] = useState<Record<string, string>>({})
  const [draggingField, setDraggingField] = useState<string | null>(null)
  const [reportToast, setReportToast] = useState<string>("")
  const [savedReportPresets, setSavedReportPresets] = useState<Record<ReportType, SavedReportPreset>>(() => {
    const paymentFields = getUniqueReportFields("payment")
    const refundsFields = getUniqueReportFields("refunds")
    const settlementFields = getUniqueReportFields("settlements")
    const payoutFields = getUniqueReportFields("payout")
    return {
      payment: { fields: paymentFields, displayNames: Object.fromEntries(paymentFields.map((field) => [field, field])) },
      refunds: { fields: refundsFields, displayNames: Object.fromEntries(refundsFields.map((field) => [field, field])) },
      settlements: {
        fields: settlementFields,
        displayNames: Object.fromEntries(settlementFields.map((field) => [field, field])),
      },
      payout: { fields: payoutFields, displayNames: Object.fromEntries(payoutFields.map((field) => [field, field])) },
    }
  })

  useEffect(() => {
    setNavSection(initialSection)
  }, [initialSection])

  useEffect(() => {
    setSelectedTableDetail(null)
    setSelectedTransactionId(null)
    setSelectedDisputeId(null)
    setRefundSheetOpen(false)
    setRefundType("full")
    setPartialRefundAmount("")
    setRefundStep("form")
  }, [navSection])

  useEffect(() => {
    setRefundType("full")
    setPartialRefundAmount("")
    setRefundStep("form")
  }, [selectedTransactionId])

  useEffect(() => {
    if (navSection !== "transactions") {
      setImeiSheetOpen(false)
    }
    if (navSection !== "disputes") {
      setSelectedDisputeId(null)
    }
    if (navSection !== "refunds") {
      setBulkRefundSheetOpen(false)
      setRefundDetailSheetOpen(false)
      setSelectedRefundId(null)
    }
    if (navSection !== "reports") {
      setGenerateReportSheetOpen(false)
      setScheduleReportSheetOpen(false)
      setCustomizeReportSheetOpen(false)
      setCustomizeStep("fields")
    }
  }, [navSection])

  useEffect(() => {
    if (imeiStatus !== "processing" || imeiTotalRows <= 0) return
    const interval = window.setInterval(() => {
      setImeiProcessedRows((current) => {
        const remaining = Math.max(0, imeiTotalRows - current)
        const next = Math.min(
          imeiTotalRows,
          current + Math.max(1, Math.ceil(Math.max(3, remaining) * 0.16))
        )
        const rowsLeft = Math.max(0, imeiTotalRows - next)
        setImeiEstimatedMinutes(rowsLeft > 0 ? Math.max(1, Math.ceil(rowsLeft / 30)) : 0)
        if (next >= imeiTotalRows) {
          setImeiStatus("completed")
        }
        return next
      })
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [imeiStatus, imeiTotalRows])

  useEffect(() => {
    if (imeiStatus === "completed" && !imeiSheetOpen) {
      setImeiBackgroundMode(true)
      setImeiBannerVisible(true)
    }
  }, [imeiSheetOpen, imeiStatus])

  useEffect(() => {
    if (bulkRefundStatus !== "processing" || bulkRefundTotalRows <= 0) return
    const interval = window.setInterval(() => {
      setBulkRefundProcessedRows((current) => {
        const remaining = Math.max(0, bulkRefundTotalRows - current)
        const next = Math.min(
          bulkRefundTotalRows,
          current + Math.max(1, Math.ceil(Math.max(3, remaining) * 0.17))
        )
        const rowsLeft = Math.max(0, bulkRefundTotalRows - next)
        setBulkRefundEstimatedMinutes(rowsLeft > 0 ? Math.max(1, Math.ceil(rowsLeft / 35)) : 0)
        if (next >= bulkRefundTotalRows) {
          setBulkRefundStatus("completed")
        }
        return next
      })
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [bulkRefundStatus, bulkRefundTotalRows])

  useEffect(() => {
    if (bulkRefundStatus === "completed" && !bulkRefundSheetOpen) {
      setBulkRefundBackgroundMode(true)
      setBulkRefundBannerVisible(true)
    }
  }, [bulkRefundSheetOpen, bulkRefundStatus])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setReportRows((current) => {
        let hasUpdate = false
        const updated = current.map((row) => {
          if (row.status !== "processing") return row
          hasUpdate = true
          const nextStatus: ReportStatus = Math.random() > 0.14 ? "success" : "failed"
          return { ...row, status: nextStatus }
        })
        return hasUpdate ? updated : current
      })
    }, 5000)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!reportToast) return
    const timeout = window.setTimeout(() => setReportToast(""), 3200)
    return () => window.clearTimeout(timeout)
  }, [reportToast])
  const configuredProducts = useMemo(
    () => [...configuredProductNames],
    []
  )

  const overviewWidgets = useMemo<AnalyticsWidget[]>(
    () => [
      {
        id: "gross-volume",
        title: "Gross volume",
        value: "₹8.6M",
        delta: "+12.4% vs prev period",
        hint: "Across all configured products",
        chart: [6.1, 6.4, 6.2, 6.8, 7.1, 7.4, 8.6],
        compareChart: [5.4, 5.6, 5.8, 6.0, 6.2, 6.5, 6.8],
        views: ["all", "checkout", "pos-terminal", "payment-links"],
        defaultWidth: "wide",
        chartType: "area",
      },
      {
        id: "transactions",
        title: "Total transactions",
        value: "94,210",
        delta: "+8.1%",
        hint: "Successful attempts only",
        chart: [11800, 12120, 12940, 13180, 13620, 14040, 14510],
        compareChart: [11020, 11350, 11620, 12010, 12380, 12720, 13310],
        views: ["all", "checkout", "pos-terminal", "payment-links"],
        chartType: "column",
      },
      {
        id: "payment-mix",
        title: "Payment mix",
        value: "UPI 44%",
        delta: "Cards 34% · POS 22%",
        hint: "Channel composition this period",
        chartType: "pie",
        chartLabels: ["UPI", "Cards", "POS"],
        chart: [44, 34, 22],
        views: ["all", "checkout", "payment-links"],
        defaultWidth: "compact",
      },
      {
        id: "settlement-reliability",
        title: "Settlement reliability",
        value: "99.2%",
        delta: "2 delayed batches",
        hint: "T+1 and T+2 compliance",
        chart: [98.7, 98.9, 99.0, 99.1, 99.2, 99.1, 99.2],
        compareChart: [98.5, 98.6, 98.8, 98.9, 98.9, 99.0, 99.0],
        views: ["all", "checkout", "pos-terminal"],
        chartType: "line",
      },
      {
        id: "configured-products",
        title: "Configured products live",
        value: `${configuredProducts.length}`,
        delta: configuredProducts.join(" • "),
        hint: "Products enabled in this workspace",
        chart: [1, 1, 2, 2, 2, 2, configuredProducts.length || 1],
        views: ["all"],
        chartType: "bar",
        defaultWidth: "compact",
      },
      {
        id: "refund-and-dispute-risk",
        title: "Refund and dispute risk",
        value: "₹21.2k at risk",
        delta: "6 active cases",
        hint: "Total exposure requiring follow-up",
        chart: [34, 29, 26, 24, 23, 22, 21.2],
        compareChart: [36, 33, 31, 29, 27, 25, 24.1],
        views: ["all", "checkout", "pos-terminal", "payment-links"],
        chartType: "line",
      },
    ],
    [configuredProducts]
  )

  const productFilterOptions = [
    { label: "Checkout", value: "Checkout" },
    { label: "POS Terminal", value: "POS Terminal" },
    { label: "Payment Links", value: "Payment Links" },
  ]

  const paymentStatusOptions = [
    { label: "All", value: "all" },
    { label: "Initiated", value: "initiated" },
    { label: "Pending", value: "pending" },
    { label: "Success", value: "success" },
    { label: "Failed", value: "failed" },
  ]

  const filteredTransactionRows = useMemo(
    () =>
      transactionTypeFilter === "all"
        ? allProductTransactionRows
        : allProductTransactionRows.filter(
            (row) => row.transactionType.toLowerCase() === transactionTypeFilter
          ),
    [transactionTypeFilter]
  )

  const filteredRefundRows = useMemo(
    () =>
      refundTypeFilter === "all"
        ? allProductRefundRows
        : allProductRefundRows.filter(
            (row) => row.transactionType.toLowerCase() === refundTypeFilter
          ),
    [refundTypeFilter]
  )

  const imeiSampleTransactions = useMemo(() => {
    const start = composeDateTime(imeiStartDate, imeiStartTime, "start")
    const end = composeDateTime(imeiEndDate, imeiEndTime, "end")
    if (!start || !end || start > end) return []
    return allProductTransactionRows.filter((row) => {
      const createdAt = parseTransactionTimestamp(row.createdAt)
      if (!createdAt) return false
      return createdAt >= start && createdAt <= end
    })
  }, [imeiStartDate, imeiStartTime, imeiEndDate, imeiEndTime])

  const imeiProgressPercent =
    imeiTotalRows > 0 ? Math.min(100, Math.round((imeiProcessedRows / imeiTotalRows) * 100)) : 0

  const imeiStatusMessage =
    imeiStatus === "completed"
      ? `Verification completed for ${imeiTotalRows.toLocaleString("en-IN")} rows.`
      : `${imeiProcessedRows.toLocaleString("en-IN")} of ${imeiTotalRows.toLocaleString("en-IN")} rows processed · ETA ${imeiEstimatedMinutes} min`
  const imeiBannerIsSuccess = imeiStatus === "completed"

  const bulkRefundSampleRows = useMemo(() => {
    const start = composeDateTime(bulkRefundStartDate, bulkRefundStartTime, "start")
    const end = composeDateTime(bulkRefundEndDate, bulkRefundEndTime, "end")
    if (!start || !end || start > end) return []
    return allProductRefundRows.filter((row) => {
      const createdAt = parseTransactionTimestamp(row.createdAt)
      if (!createdAt) return false
      return createdAt >= start && createdAt <= end
    })
  }, [bulkRefundStartDate, bulkRefundStartTime, bulkRefundEndDate, bulkRefundEndTime])

  const bulkRefundProgressPercent =
    bulkRefundTotalRows > 0
      ? Math.min(100, Math.round((bulkRefundProcessedRows / bulkRefundTotalRows) * 100))
      : 0

  const bulkRefundStatusMessage =
    bulkRefundStatus === "completed"
      ? `Bulk refund completed for ${bulkRefundTotalRows.toLocaleString("en-IN")} rows.`
      : `${bulkRefundProcessedRows.toLocaleString("en-IN")} of ${bulkRefundTotalRows.toLocaleString("en-IN")} rows processed · ETA ${bulkRefundEstimatedMinutes} min`

  const bulkRefundBannerIsSuccess = bulkRefundStatus === "completed"

  const selectedTransaction =
    selectedTransactionId
      ? allProductTransactionRows.find((row) => row.transactionId === selectedTransactionId) ?? null
      : null

  const selectedRefund =
    selectedRefundId
      ? allProductRefundRows.find((row) => row.refundId === selectedRefundId) ?? null
      : null
  const selectedDispute =
    selectedDisputeId
      ? allProductDisputeRows.find((row) => row.disputeId === selectedDisputeId) ?? null
      : null
  const selectedDisputeTimeline = selectedDispute ? disputeTimelineById[selectedDispute.disputeId] ?? [] : []
  const disputeDefendAmountValue = Number(disputeDefendAmount || 0)
  const selectedDisputeAmount = selectedDispute?.amount ?? 0
  const hasAllDisputeDocuments =
    Boolean(disputeDocuments.voiceDelivery) &&
    Boolean(disputeDocuments.rebuttalLetter) &&
    Boolean(disputeDocuments.refundDetails) &&
    Boolean(disputeDocuments.additionalDocuments)
  const canSubmitDisputeAction =
    selectedDispute?.status === "Pending action" &&
    (disputeActionType === "accept" ||
      (hasAllDisputeDocuments &&
        disputeComment.trim().length > 0 &&
        (disputeActionType === "defend" ||
          (disputeDefendAmountValue > 0 &&
            disputeDefendAmountValue <= selectedDisputeAmount))))
  const activeReportFieldGroups = reportFieldLibrary[activeReportType]
  const activeReportAllFields = getUniqueReportFields(activeReportType)
  const selectedFieldsForGeneration =
    reportFieldSelectionMode === "all" ? activeReportAllFields : reportSelectedFields
  const activeCustomizeFieldGroups = reportFieldLibrary[customizeReportType]
  const activeCustomizeAllFields = getUniqueReportFields(customizeReportType)
  const canGenerateReport =
    Boolean(reportRangeStart && reportRangeEnd) &&
    (reportFieldSelectionMode === "all" || selectedFieldsForGeneration.length > 0)
  const canSaveCustomizePreset = customizeSelectedFields.length > 0
  const hasValidScheduleEmail =
    !scheduleDeliveryRecipients.includes("email") ||
    (scheduleEmailRecipients.length > 0 &&
      scheduleEmailRecipients.every((email) => isValidEmail(email)))
  const hasValidSftpConfig =
    !scheduleDeliveryRecipients.includes("sftp") ||
    Boolean(
      scheduleSftpHost.trim() &&
        scheduleSftpPort.trim() &&
        scheduleSftpUserId.trim() &&
        scheduleSftpPath.trim() &&
        (scheduleSftpAuthMode === "ppk"
          ? scheduleSftpPpkFileName.trim()
          : scheduleSftpPassword.trim())
    )
  const canCreateSchedule =
    Boolean(scheduleFrequency) &&
    scheduleDeliveryRecipients.length > 0 &&
    hasValidScheduleEmail &&
    hasValidSftpConfig

  const transactionColumns: DataTableColumn<(typeof allProductTransactionRows)[number]>[] = [
    { id: "orderId", header: "Order ID", accessorKey: "orderId", width: 135, pinnable: true },
    { id: "transactionId", header: "Transaction ID", accessorKey: "transactionId", width: 150 },
    { id: "merchantOrderId", header: "Merchant Order ID", accessorKey: "merchantOrderId", width: 175 },
    {
      id: "amount",
      header: "Amount",
      accessorKey: "amount",
      width: 120,
      align: "right",
      cell: (row) => `₹${row.amount.toLocaleString("en-IN")}`,
      getSearchValue: (row) => `${row.amount}`,
    },
    {
      id: "transactionType",
      header: "Transaction Type",
      accessorKey: "transactionType",
      width: 145,
      filterOptions: [
        { label: "Order", value: "order" },
        { label: "Payment", value: "payment" },
      ],
      getFilterValue: (row) => row.transactionType.toLowerCase(),
    },
    {
      id: "paymentStatus",
      header: "Status",
      accessorKey: "paymentStatus",
      width: 120,
      filterOptions: paymentStatusOptions.filter((option) => option.value !== "all"),
      getFilterValue: (row) => row.paymentStatus.toLowerCase(),
    },
    {
      id: "paymentMethod",
      header: "Payment Mode / Method",
      accessorKey: "paymentMethod",
      width: 200,
      filterOptions: Array.from(new Set(allProductTransactionRows.map((row) => row.paymentMethod))).map((method) => ({
        label: method,
        value: method,
      })),
    },
    { id: "createdAt", header: "Creation Date", accessorKey: "createdAt", width: 185 },
    { id: "product", header: "Paid via", accessorKey: "product", width: 150, filterOptions: productFilterOptions },
  ]

  const settlementColumns: DataTableColumn<(typeof allProductSettlementRows)[number]>[] = [
    { id: "id", header: "Settlement ID", accessorKey: "id", width: 130, pinnable: true },
    {
      id: "product",
      header: "Product",
      accessorKey: "product",
      width: 160,
      filterOptions: productFilterOptions,
    },
    { id: "state", header: "State", accessorKey: "state", width: 130 },
    { id: "amount", header: "Amount", accessorKey: "amount", width: 120, align: "right" },
  ]

  const disputeColumns: DataTableColumn<(typeof allProductDisputeRows)[number]>[] = [
    { id: "disputeId", header: "Dispute ID", accessorKey: "disputeId", width: 130, pinnable: true },
    { id: "paymentId", header: "Payment ID", accessorKey: "paymentId", width: 145 },
    {
      id: "amount",
      header: "Amount",
      accessorKey: "amount",
      width: 120,
      align: "right",
      cell: (row) => `₹${row.amount.toLocaleString("en-IN")}`,
      getSearchValue: (row) => `${row.amount}`,
    },
    {
      id: "dueDate",
      header: "Dispute due date",
      accessorKey: "dueDate",
      width: 170,
      getSearchValue: (row) => `${row.dueDate} ${row.slaHoursRemaining}`,
      cell: (row) => (
        <div>
          <p>{row.dueDate}</p>
          {row.status === "Pending action" ? (
            <p className="mt-0.5 text-[10px] text-warning">SLA breach in {row.slaHoursRemaining}h</p>
          ) : null}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      width: 135,
      filterOptions: [
        { label: "Win", value: "win" },
        { label: "Loss", value: "loss" },
        { label: "In review", value: "in review" },
        { label: "Pending action", value: "pending action" },
      ],
      getFilterValue: (row) => row.status.toLowerCase(),
      cell: (row) => (
        <Badge
          variant="outline"
          className={cn(
            "text-[10px]",
            row.status === "Win" && "bg-success/15 border-success/30 text-foreground",
            row.status === "Loss" && "bg-destructive/10 border-destructive/30 text-foreground",
            row.status === "In review" && "bg-muted/60 border-border text-foreground",
            row.status === "Pending action" && "bg-warning/15 border-warning/35 text-foreground",
          )}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      id: "recoveryStatus",
      header: "Recovery status",
      accessorKey: "recoveryStatus",
      width: 135,
      filterOptions: [
        { label: "Recovered", value: "recovered" },
        { label: "Recovering", value: "recovering" },
        { label: "At risk", value: "at risk" },
        { label: "Not recovered", value: "not recovered" },
      ],
      getFilterValue: (row) => row.recoveryStatus.toLowerCase(),
    },
    {
      id: "action",
      header: "Action",
      width: 130,
      cell: (row) =>
        row.status === "Pending action" ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px]"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              setSelectedDisputeId(row.disputeId)
              primeDisputeActionFlow(row, "defend")
            }}
          >
            Take action
          </Button>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
  ]

  const refundColumns: DataTableColumn<(typeof allProductRefundRows)[number]>[] = [
    { id: "orderId", header: "Order ID", accessorKey: "orderId", width: 130, pinnable: true },
    { id: "transactionId", header: "Transaction ID", accessorKey: "transactionId", width: 150 },
    { id: "merchantOrderId", header: "Merchant Order ID", accessorKey: "merchantOrderId", width: 175 },
    {
      id: "amount",
      header: "Amount",
      accessorKey: "amount",
      width: 120,
      align: "right",
      cell: (row) => `₹${row.amount.toLocaleString("en-IN")}`,
      getSearchValue: (row) => `${row.amount}`,
    },
    {
      id: "transactionType",
      header: "Transaction Type",
      accessorKey: "transactionType",
      width: 145,
      filterOptions: [
        { label: "Order", value: "order" },
        { label: "Payment", value: "payment" },
      ],
      getFilterValue: (row) => row.transactionType.toLowerCase(),
    },
    {
      id: "refundStatus",
      header: "Refund Status",
      accessorKey: "refundStatus",
      width: 140,
      filterOptions: paymentStatusOptions.filter((option) => option.value !== "all"),
      getFilterValue: (row) => row.refundStatus.toLowerCase(),
    },
    {
      id: "paymentMethod",
      header: "Payment Mode / Method",
      accessorKey: "paymentMethod",
      width: 200,
      filterOptions: Array.from(new Set(allProductRefundRows.map((row) => row.paymentMethod))).map((method) => ({
        label: method,
        value: method,
      })),
    },
    { id: "createdAt", header: "Creation Date", accessorKey: "createdAt", width: 185 },
    { id: "product", header: "Paid via", accessorKey: "product", width: 150, filterOptions: productFilterOptions },
  ]

  const reportColumns: DataTableColumn<GeneratedReportRow>[] = [
    { id: "reportName", header: "Report name", accessorKey: "reportName", width: 280, pinnable: true },
    { id: "createdOn", header: "Created on", accessorKey: "createdOn", width: 180 },
    { id: "dateRange", header: "Date range", accessorKey: "dateRange", width: 220 },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      width: 130,
      filterOptions: [
        { label: "Processing", value: "processing" },
        { label: "Success", value: "success" },
        { label: "Failed", value: "failed" },
      ],
      cell: (row) => (
        <Badge
          variant="outline"
          className={cn(
            "text-[10px]",
            row.status === "processing" && "bg-warning/15 border-warning/35 text-foreground",
            row.status === "success" && "bg-success/20 border-success/35 text-foreground",
            row.status === "failed" && "bg-destructive/10 border-destructive/30 text-foreground"
          )}
        >
          {row.status === "processing" ? "Processing" : row.status === "success" ? "Success" : "Failed"}
        </Badge>
      ),
    },
    {
      id: "action",
      header: "Action",
      width: 140,
      align: "right",
      cell: (row) =>
        row.status === "success" ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px]"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
            }}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Download
          </Button>
        ) : row.status === "failed" ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px]"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              setActiveReportType(row.reportType)
              setGenerateReportSheetOpen(true)
            }}
          >
            Retry
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">In progress</span>
        ),
    },
  ]

  const scheduleColumns: DataTableColumn<ScheduledReportRow>[] = [
    {
      id: "scheduleName",
      header: "Schedule name and report",
      accessorKey: "scheduleName",
      width: 280,
      pinnable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-foreground">{row.scheduleName}</p>
          <p className="text-[11px] text-muted-foreground">{reportTypeLabel[row.reportType]}</p>
        </div>
      ),
      getSearchValue: (row) => `${row.scheduleName} ${reportTypeLabel[row.reportType]}`,
    },
    {
      id: "frequency",
      header: "Frequency",
      accessorKey: "frequency",
      width: 120,
      filterOptions: [
        { label: "Daily", value: "daily" },
        { label: "Weekly", value: "weekly" },
        { label: "Monthly", value: "monthly" },
      ],
      cell: (row) => scheduleFrequencyLabel[row.frequency],
    },
    {
      id: "format",
      header: "Format",
      accessorKey: "format",
      width: 110,
      filterOptions: [
        { label: "Excel", value: "excel" },
        { label: "CSV", value: "csv" },
      ],
      cell: (row) => row.format.toUpperCase(),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      width: 120,
      filterOptions: [
        { label: "Active", value: "active" },
        { label: "Paused", value: "paused" },
        { label: "Failed", value: "failed" },
      ],
      cell: (row) => (
        <Badge
          variant="outline"
          className={cn(
            "text-[10px]",
            row.status === "active" && "bg-success/20 border-success/35 text-foreground",
            row.status === "paused" && "bg-muted border-border text-foreground",
            row.status === "failed" && "bg-destructive/10 border-destructive/30 text-foreground"
          )}
        >
          {row.status === "active" ? "Active" : row.status === "paused" ? "Paused" : "Failed"}
        </Badge>
      ),
    },
    { id: "createdOn", header: "Created on", accessorKey: "createdOn", width: 180 },
    { id: "createdBy", header: "Created by", accessorKey: "createdBy", width: 160 },
    {
      id: "actions",
      header: "Actions",
      width: 100,
      align: "right",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
              }}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(event) => {
                event.preventDefault()
                setEditingScheduleId(row.id)
                setActiveReportType(row.reportType)
                setReportOutputFormat(row.format)
                setScheduleFrequency(row.frequency)
                setScheduleName(row.scheduleName)
                setScheduleDeliveryRecipients(row.deliveryRecipients.length ? row.deliveryRecipients : ["email"])
                setScheduleEmailInput("")
                setScheduleEmailRecipients(
                  row.emailRecipient ? parseRecipients(row.emailRecipient) : ["ops@merchant.com"]
                )
                setScheduleSftpHost(row.sftpHost ?? "")
                setScheduleSftpPort(row.sftpPort ?? "22")
                setScheduleSftpUserId(row.sftpUserId ?? "")
                setScheduleSftpPath(row.sftpPath ?? "")
                setScheduleSftpAuthMode(row.sftpAuthMode ?? "password")
                setScheduleSftpPpkFileName(row.sftpPpkFileName ?? "")
                setScheduleSftpPassword("")
                setScheduleReportSheetOpen(true)
              }}
            >
              <PenLine className="mr-2 h-3.5 w-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(event) => {
                event.preventDefault()
                if (row.status === "paused") {
                  setReportToast(`${row.scheduleName} is already paused.`)
                  return
                }
                setScheduledRows((current) =>
                  current.map((entry) =>
                    entry.id === row.id
                      ? { ...entry, status: "paused" }
                      : entry
                  )
                )
                setReportToast(`${row.scheduleName} paused.`)
              }}
            >
              <Pause className="mr-2 h-3.5 w-3.5" />
              Pause
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(event) => {
                event.preventDefault()
                setScheduledRows((current) => current.filter((entry) => entry.id !== row.id))
                setReportToast(`${row.scheduleName} deleted.`)
              }}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const vasColumns: DataTableColumn<(typeof allProductVasRows)[number]>[] = [
    { id: "id", header: "Service ID", accessorKey: "id", width: 120, pinnable: true },
    { id: "product", header: "Product", accessorKey: "product", width: 160 },
    { id: "service", header: "Service", accessorKey: "service", width: 220 },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      width: 120,
      filterOptions: [
        { label: "Enabled", value: "enabled" },
        { label: "Pending", value: "pending" },
      ],
      cell: (row) => (
        <Badge variant="outline" className={row.status === "enabled" ? "bg-success/20 border-success/35 text-foreground" : "bg-warning/20 border-warning/35 text-foreground"}>
          {row.status}
        </Badge>
      ),
    },
    { id: "owner", header: "Owner", accessorKey: "owner", width: 150 },
  ]

  const totalTransactionValue = filteredTransactionRows.reduce((sum, row) => sum + row.amount, 0)
  const successfulTransactions = filteredTransactionRows.filter(
    (row) => row.paymentStatus.toLowerCase() === "success"
  ).length
  const refundedTransactionValue = filteredTransactionRows.reduce(
    (sum, row) => sum + row.refundedAmount,
    0
  )
  const settlementInProgress = allProductSettlementRows.filter((row) => row.state !== "Completed").length
  const disputeUnderReviewCount = allProductDisputeRows.filter((row) => row.status === "In review").length
  const disputeAmountUnderReview = allProductDisputeRows
    .filter((row) => row.status === "In review" || row.status === "Pending action")
    .reduce((sum, row) => sum + row.amount, 0)
  const refundExposure = filteredRefundRows.reduce((sum, row) => sum + row.amount, 0)

  const transactionSummaryMetrics: SectionSummaryMetric[] = [
    { label: "Total transactions", value: `${filteredTransactionRows.length}` },
    {
      label: "Total transaction value",
      value: `₹${totalTransactionValue.toLocaleString("en-IN")}`,
    },
    {
      label: "Success rate",
      value: `${filteredTransactionRows.length ? ((successfulTransactions / filteredTransactionRows.length) * 100).toFixed(1) : "0.0"}%`,
      delta: `${successfulTransactions} successful`,
    },
    {
      label: "Refunded amount",
      value: `₹${refundedTransactionValue.toLocaleString("en-IN")}`,
    },
  ]

  const summaryBySection: Partial<Record<ProductWorkspaceSection, SectionSummaryMetric[]>> = {
    transactions: transactionSummaryMetrics,
    settlements: [
      { label: "Total batches", value: `${allProductSettlementRows.length}`, delta: "Across products" },
      { label: "In progress", value: `${settlementInProgress}`, delta: "Awaiting completion" },
      {
        label: "Settlement amount",
        value: `₹${allProductSettlementRows.reduce((sum, row) => sum + parseInr(row.amount), 0).toLocaleString("en-IN")}`,
        delta: "Current cycle",
      },
    ],
    disputes: [
      { label: "Total disputes", value: `${allProductDisputeRows.length}` },
      { label: "Disputes under review", value: `${disputeUnderReviewCount}` },
      { label: "Amount under review", value: `₹${disputeAmountUnderReview.toLocaleString("en-IN")}` },
    ],
    refunds: [
      { label: "Total count", value: `${filteredRefundRows.length}` },
      { label: "Total volume", value: `₹${refundExposure.toLocaleString("en-IN")}` },
    ],
  }

  const headerTitleBySection: Partial<Record<ProductWorkspaceSection, string>> = {
    overview: "Overview",
    transactions: "Transactions",
    settlements: "Settlements",
    disputes: "Disputes",
    refunds: "Refunds",
    reports: "Reports",
    vas: "Value Added Services",
  }

  const headerActionsBySection: Partial<Record<ProductWorkspaceSection, React.ReactNode>> = {
    overview: (
      <Button size="sm" className="h-8 text-xs" onClick={() => setOverviewCustomizeOpen(true)}>
        Customize
      </Button>
    ),
    transactions: (
      <>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => setImeiSheetOpen(true)}
        >
          {imeiStatus === "processing" ? "View IMEI progress" : "View IMEI details"}
        </Button>
        <Button asChild variant="outline" size="sm" className="h-8 text-xs">
          <Link href="/transactions/analytics">Vew analytics</Link>
        </Button>
      </>
    ),
    settlements: (
      <>
        <Button variant="outline" size="sm" className="h-8 text-xs">Export</Button>
        <Button size="sm" className="h-8 text-xs">Run settlement</Button>
      </>
    ),
    disputes: (
      <>
        <Button variant="outline" size="sm" className="h-8 text-xs">Export</Button>
      </>
    ),
    refunds: (
      <>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => setBulkRefundSheetOpen(true)}
        >
          {bulkRefundStatus === "processing" ? "View bulk refund progress" : "Bulk refund"}
        </Button>
        <Button asChild variant="outline" size="sm" className="h-8 text-xs">
          <Link href="/refunds/analytics">Vew analytics</Link>
        </Button>
      </>
    ),
    reports: null,
  }

  const leftContext = (
    <ProductWorkspaceNav
      title="All Products"
      value={navSection}
      onChange={(nextSection) => setNavSection(nextSection)}
    />
  )

  const centerMain = (
    <div className="h-full overflow-y-auto space-y-4 p-4">
      {reportToast ? (
        <Alert className="rounded-lg border-success/35 bg-success/10">
          <CheckCircle2 className="size-4 text-success" />
          <AlertDescription className="text-xs text-foreground">{reportToast}</AlertDescription>
        </Alert>
      ) : null}
      {navSection === "overview" ? (
        <OverviewAnalyticsCanvas
          scopeId="dashboard-overall-overview"
          configuredProducts={configuredProducts}
          widgets={overviewWidgets}
          viewOptions={[
            { label: "All", value: "all" },
            { label: "Checkout", value: "checkout" },
            { label: "POS Terminal", value: "pos-terminal" },
            { label: "Payment Links", value: "payment-links" },
          ]}
          dateOptions={["Today", "Last 7 days", "Last 30 days", "This quarter"]}
          compareOptions={["Yesterday", "Previous period", "Last week"]}
          showViewOptions
          viewSelectorVariant="dropdown"
          showConfiguredProductsBadge={false}
          showAutoRefreshControl={false}
          showCustomizeControl={false}
          toolbarSurface="plain"
          customizeOpen={overviewCustomizeOpen}
          onCustomizeOpenChange={setOverviewCustomizeOpen}
        />
      ) : navSection === "transactions" ? (
        selectedTransaction ? (
          <div className="space-y-4">
            <section className="rounded-lg border border-border/70 bg-card p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Transaction snapshot</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Order ID", selectedTransaction.orderId],
                  ["Transaction ID", selectedTransaction.transactionId],
                  ["Merchant Order ID", selectedTransaction.merchantOrderId],
                  ["Paid via", selectedTransaction.product],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[11px] text-muted-foreground">{label}</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-border/70 bg-card p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Payment details</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["Amount", `₹${selectedTransaction.amount.toLocaleString("en-IN")}`],
                  ["Status", selectedTransaction.paymentStatus],
                  ["Payment mode / method", selectedTransaction.paymentMethod],
                  ["Transaction type", selectedTransaction.transactionType],
                  ["Creation date", selectedTransaction.createdAt],
                  ["Refunded amount", `₹${selectedTransaction.refundedAmount.toLocaleString("en-IN")}`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[11px] text-muted-foreground">{label}</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-border/70 bg-card p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Operational metadata</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  ["Gateway trace", `GW-${selectedTransaction.transactionId.slice(-6)}`],
                  ["Settlement cycle", "T+1"],
                  ["Risk flag", selectedTransaction.paymentStatus === "Failed" ? "Needs review" : "Clear"],
                  ["Customer communication", selectedTransaction.paymentStatus === "Pending" ? "Awaiting confirmation" : "Delivered"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[11px] text-muted-foreground">{label}</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <>
            {imeiBannerVisible && imeiBackgroundMode ? (
              <Alert
                className={cn(
                  "rounded-lg",
                  imeiBannerIsSuccess
                    ? "border-success/35 bg-success/10"
                    : "border-border/70 bg-card"
                )}
              >
                {imeiBannerIsSuccess ? (
                  <CheckCircle2 className="size-4 text-success" />
                ) : (
                  <Loader2 className="size-4 animate-spin text-primary" />
                )}
                <AlertTitle className="text-sm font-medium">
                  {imeiStatus === "processing"
                    ? "IMEI verification in progress"
                    : "IMEI verification complete"}
                </AlertTitle>
                <AlertDescription className="text-xs">
                  {imeiStatusMessage}
                </AlertDescription>
                <AlertAction className="flex items-center gap-1.5">
                  {imeiStatus === "processing" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px]"
                      onClick={() => setImeiSheetOpen(true)}
                    >
                      View progress
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7"
                    aria-label="Dismiss IMEI banner"
                    onClick={() => {
                      setImeiBannerVisible(false)
                      setImeiBackgroundMode(false)
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </AlertAction>
              </Alert>
            ) : null}
            <SectionSummaryStrip metrics={summaryBySection.transactions ?? []} />
            <DataTable
              data={filteredTransactionRows}
              columns={transactionColumns}
              rowId={(row) => row.transactionId}
              selectedRowId={selectedTransactionId}
              onRowClick={(row) => {
                setSelectedTransactionId(row.transactionId)
                setSelectedTableDetail(null)
              }}
              searchPlaceholder="Search by order id, transaction id, merchant order id..."
              initialPinnedColumnIds={["orderId"]}
              statusColumnId="transactionType"
              statusOptions={[
                { label: "All", value: "all" },
                { label: "Orders", value: "order" },
                { label: "Payments", value: "payment" },
              ]}
              statusValue={transactionTypeFilter}
              onStatusChange={setTransactionTypeFilter}
            />
          </>
        )
      ) : navSection === "settlements" ? (
        <>
          <SectionSummaryStrip metrics={summaryBySection.settlements ?? []} />
          <DataTable
            data={allProductSettlementRows}
            columns={settlementColumns}
            rowId={(row) => row.id}
            selectedRowId={selectedTableDetail?.id}
            onRowClick={(row) =>
              setSelectedTableDetail({
                id: row.id,
                title: row.id,
                description: "Settlement detail and payout state.",
                value: row.amount,
                rows: [
                  { label: "Product", value: row.product },
                  { label: "State", value: row.state },
                ],
              })
            }
            searchPlaceholder="Search settlements..."
            initialPinnedColumnIds={["id"]}
          />
        </>
      ) : navSection === "disputes" ? (
        <>
          <SectionSummaryStrip metrics={summaryBySection.disputes ?? []} />
          <DataTable
            data={allProductDisputeRows}
            columns={disputeColumns}
            rowId={(row) => row.disputeId}
            selectedRowId={selectedDisputeId}
            onRowClick={(row) => {
              setSelectedDisputeId(row.disputeId)
              if (row.status === "Pending action") {
                primeDisputeActionFlow(row, "defend")
              } else {
                resetDisputeActionFlow()
              }
              setSelectedTableDetail(null)
            }}
            searchPlaceholder="Search by dispute ID or payment ID..."
            initialPinnedColumnIds={["disputeId"]}
            statusColumnId="status"
            statusOptions={[
              { label: "All", value: "all" },
              { label: "Pending action", value: "pending action" },
              { label: "In review", value: "in review" },
              { label: "Win", value: "win" },
              { label: "Loss", value: "loss" },
            ]}
          />
        </>
      ) : navSection === "refunds" ? (
        <>
          {bulkRefundBannerVisible && bulkRefundBackgroundMode ? (
            <Alert
              className={cn(
                "rounded-lg",
                bulkRefundBannerIsSuccess
                  ? "border-success/35 bg-success/10"
                  : "border-border/70 bg-card"
              )}
            >
              {bulkRefundBannerIsSuccess ? (
                <CheckCircle2 className="size-4 text-success" />
              ) : (
                <Loader2 className="size-4 animate-spin text-primary" />
              )}
              <AlertTitle className="text-sm font-medium">
                {bulkRefundStatus === "processing"
                  ? "Bulk refund processing in progress"
                  : "Bulk refund processing complete"}
              </AlertTitle>
              <AlertDescription className="text-xs">
                {bulkRefundStatusMessage}
              </AlertDescription>
              <AlertAction className="flex items-center gap-1.5">
                {bulkRefundStatus === "processing" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px]"
                    onClick={() => setBulkRefundSheetOpen(true)}
                  >
                    View progress
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7"
                  aria-label="Dismiss bulk refund banner"
                  onClick={() => {
                    setBulkRefundBannerVisible(false)
                    setBulkRefundBackgroundMode(false)
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </AlertAction>
            </Alert>
          ) : null}
          <SectionSummaryStrip metrics={summaryBySection.refunds ?? []} />
          <DataTable
            data={filteredRefundRows}
            columns={refundColumns}
            rowId={(row) => row.refundId}
            selectedRowId={selectedRefundId}
            onRowClick={(row) => {
              setSelectedRefundId(row.refundId)
              setRefundDetailSheetOpen(true)
            }}
            searchPlaceholder="Search by order id, transaction id, merchant order id..."
            initialPinnedColumnIds={["orderId"]}
            statusColumnId="transactionType"
            statusOptions={[
              { label: "All", value: "all" },
              { label: "Orders", value: "order" },
              { label: "Payments", value: "payment" },
            ]}
            statusValue={refundTypeFilter}
            onStatusChange={setRefundTypeFilter}
          />
        </>
      ) : navSection === "reports" ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickReportCards.map((card) => (
              <div key={card.type} className="rounded-lg border border-border/70 bg-card p-3.5">
                <p className="text-sm font-semibold text-foreground">{card.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{card.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => openGenerateReport(card.type)}
                  >
                    Generate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs text-muted-foreground"
                    onClick={() => openScheduleReport(card.type)}
                  >
                    Schedule
                  </Button>
                </div>
              </div>
            ))}
          </section>

          {reportsTableView === "report" ? (
            <>
              <DataTable
                data={reportRows}
                columns={reportColumns}
                rowId={(row) => row.id}
                selectedRowId={selectedTableDetail?.id}
                onRowClick={(row) =>
                  setSelectedTableDetail({
                    id: row.id,
                    title: row.reportName,
                    description: "Generated report details and download status.",
                    value: reportTypeLabel[row.reportType],
                    rows: [
                      { label: "Report ID", value: row.id },
                      { label: "Created on", value: row.createdOn },
                      { label: "Date range", value: row.dateRange },
                      { label: "Format", value: row.fileFormat.toUpperCase() },
                      { label: "Status", value: row.status },
                    ],
                  })
                }
                searchPlaceholder="Search reports..."
                initialPinnedColumnIds={["reportName"]}
                initialVisibleColumnIds={["reportName", "createdOn", "dateRange", "status", "action"]}
                statusAsViewOnly
                includeAllStatusOption={false}
                statusOptions={[
                  { label: "Report", value: "report" },
                  { label: "Schedule", value: "schedule" },
                ]}
                statusValue={reportsTableView}
                onStatusChange={(value) => setReportsTableView(value as "report" | "schedule")}
              />
            </>
          ) : (
            <DataTable
              data={scheduledRows}
              columns={scheduleColumns}
              rowId={(row) => row.id}
              selectedRowId={selectedTableDetail?.id}
              onRowClick={(row) =>
                setSelectedTableDetail({
                  id: row.id,
                  title: row.scheduleName,
                  description: "Scheduled report configuration and delivery settings.",
                  value: reportTypeLabel[row.reportType],
                  rows: [
                    { label: "Frequency", value: row.frequency },
                    { label: "Format", value: row.format.toUpperCase() },
                    {
                      label: "Recipients",
                      value: row.deliveryRecipients.map((recipient) => recipient.toUpperCase()).join(", "),
                    },
                    { label: "Status", value: row.status },
                    { label: "Created on", value: row.createdOn },
                    { label: "Created by", value: row.createdBy },
                  ],
                })
              }
              searchPlaceholder="Search schedules..."
              initialPinnedColumnIds={["scheduleName"]}
              initialVisibleColumnIds={["scheduleName", "frequency", "format", "status", "createdOn", "createdBy", "actions"]}
              statusAsViewOnly
              includeAllStatusOption={false}
              statusOptions={[
                { label: "Report", value: "report" },
                { label: "Schedule", value: "schedule" },
              ]}
              statusValue={reportsTableView}
              onStatusChange={(value) => setReportsTableView(value as "report" | "schedule")}
            />
          )}
        </>
      ) : (
        <DataTable
          data={allProductVasRows}
          columns={vasColumns}
          rowId={(row) => row.id}
          searchPlaceholder="Search services..."
          initialPinnedColumnIds={["id"]}
        />
      )}
    </div>
  )

  const rightContext = selectedDispute ? (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Dispute case</p>
          <p className="text-[16px] font-semibold text-foreground">{selectedDispute.disputeId}</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8"
          aria-label="Close dispute panel"
          onClick={() => setSelectedDisputeId(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <div className="space-y-5 p-6">
        <section className="space-y-2">
          {[
            ["Dispute ID", selectedDispute.disputeId],
            ["Payment ID", selectedDispute.paymentId],
            ["Amount", `₹${selectedDispute.amount.toLocaleString("en-IN")}`],
            ["Due date", selectedDispute.dueDate],
            ["Status", selectedDispute.status],
            ["Recovery status", selectedDispute.recoveryStatus],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-xs font-medium text-foreground text-right">{value}</span>
            </div>
          ))}
          {selectedDispute.status === "Pending action" ? (
            <div className="rounded-md bg-warning/10 px-3 py-2 text-[11px] text-warning">
              SLA breach in {selectedDispute.slaHoursRemaining}h. If no action is taken before due date, dispute may be auto-lost.
            </div>
          ) : null}
          {selectedDispute.status === "Pending action" ? (
            <div className="space-y-3 rounded-lg border border-border/70 bg-card p-3.5">
              <p className="text-xs font-semibold text-foreground">Take action</p>
              {disputeActionStep === "success" ? (
                <div className="space-y-3 rounded-md border border-success/30 bg-success/5 p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                    <div>
                      <p className="text-xs font-medium text-foreground">Dispute action submitted</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {disputeActionType === "accept"
                          ? "Chargeback acceptance has been recorded."
                          : disputeActionType === "partial-defend"
                            ? "Partial defense documents were submitted for review."
                            : "Defense documents were submitted for review."}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => resetDisputeActionFlow()}
                  >
                    Reset form
                  </Button>
                </div>
              ) : disputeActionType === "accept" && disputeActionStep === "confirm" ? (
                <div className="space-y-3 rounded-md border border-warning/35 bg-warning/10 p-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Confirm acceptance</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      By confirming, the chargeback will be accepted and dispute will close as a loss.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 text-xs"
                      onClick={() => setDisputeActionStep("form")}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 flex-1 text-xs"
                      onClick={() => setDisputeActionStep("success")}
                    >
                      Confirm accept
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <RadioGroup
                    value={disputeActionType}
                    onValueChange={(value) => {
                      const selectedAction = value as DisputeActionType
                      setDisputeActionType(selectedAction)
                      setDisputeActionStep("form")
                      if (selectedAction === "partial-defend") {
                        setDisputeDefendAmount(String(selectedDispute.amount))
                      } else {
                        setDisputeDefendAmount("")
                      }
                    }}
                    className="gap-2"
                  >
                    {[
                      {
                        key: "partial-defend",
                        label: "Partially defend",
                        description: "Submit defense for a specific amount.",
                      },
                      {
                        key: "defend",
                        label: "Defend",
                        description: "Submit full defense with all evidence.",
                      },
                      {
                        key: "accept",
                        label: "Accept",
                        description: "Accept chargeback and close the case.",
                      },
                    ].map((item) => (
                      <label
                        key={item.key}
                        htmlFor={`dispute-action-${item.key}`}
                        className={cn(
                          "flex cursor-pointer items-start gap-2 rounded-md border px-2.5 py-2",
                          disputeActionType === item.key ? "border-primary bg-primary/10" : "border-border"
                        )}
                      >
                        <RadioGroupItem
                          id={`dispute-action-${item.key}`}
                          value={item.key}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="text-xs font-medium text-foreground">{item.label}</p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">{item.description}</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>

                  {disputeActionType === "partial-defend" ? (
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground">Amount to defend</p>
                      <Input
                        value={disputeDefendAmount}
                        onChange={(event) => setDisputeDefendAmount(event.target.value)}
                        type="number"
                        placeholder={`Max ${selectedDispute.amount}`}
                        className="h-9"
                      />
                    </div>
                  ) : null}

                  {disputeActionType !== "accept" ? (
                    <div className="space-y-2 rounded-md border border-border/70 bg-muted/20 p-2.5">
                      <p className="text-[11px] font-medium text-foreground">Required documents</p>
                      {[
                        { key: "voiceDelivery", label: "Voice delivery" },
                        { key: "rebuttalLetter", label: "Rebuttal letter" },
                        { key: "refundDetails", label: "Refund details" },
                        { key: "additionalDocuments", label: "Additional documents" },
                      ].map((item) => (
                        <label key={item.key} className="block space-y-1">
                          <span className="text-[11px] text-muted-foreground">{item.label}</span>
                          <Input
                            type="file"
                            onChange={(event) =>
                              handleDisputeDocumentPicked(
                                item.key as keyof typeof disputeDocuments,
                                event
                              )
                            }
                            className="h-9"
                          />
                          {disputeDocuments[item.key as keyof typeof disputeDocuments] ? (
                            <p className="text-[11px] text-muted-foreground">
                              {disputeDocuments[item.key as keyof typeof disputeDocuments]}
                            </p>
                          ) : null}
                        </label>
                      ))}
                      <div className="space-y-1">
                        <p className="text-[11px] text-muted-foreground">Additional comments</p>
                        <Textarea
                          value={disputeComment}
                          onChange={(event) => setDisputeComment(event.target.value)}
                          rows={3}
                          placeholder="Provide context for the issuer review team."
                          className="text-xs"
                        />
                      </div>
                    </div>
                  ) : null}

                  <Button
                    size="sm"
                    className="h-8 w-full text-xs"
                    disabled={!canSubmitDisputeAction}
                    onClick={() => {
                      if (disputeActionType === "accept") {
                        setDisputeActionStep("confirm")
                        return
                      }
                      setDisputeActionStep("success")
                    }}
                  >
                    {disputeActionType === "accept" ? "Proceed to confirmation" : "Submit action"}
                  </Button>
                </>
              )}
            </div>
          ) : null}
        </section>
        <Separator />
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Status timeline</p>
          <div className="mt-3 space-y-0">
            {selectedDisputeTimeline.map((event, index) => (
              <div key={`${event.status}-${event.timestamp}`} className="relative pl-6 pb-4 last:pb-0">
                {index < selectedDisputeTimeline.length - 1 ? (
                  <span className="absolute left-[7px] top-4 h-[calc(100%-8px)] w-px bg-border" />
                ) : null}
                <span className="absolute left-0 top-1.5 h-4 w-4 rounded-full border border-primary/35 bg-background" />
                <p className="text-xs font-medium text-foreground">{event.status}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{event.timestamp}</p>
                <p className="mt-1 text-xs text-muted-foreground">{event.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  ) : selectedTableDetail ? (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Context</p>
          <p className="text-[16px] font-semibold text-foreground">{selectedTableDetail.title}</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8"
          aria-label="Close detail panel"
          onClick={() => setSelectedTableDetail(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <div className="space-y-5 p-6">
        <div>
          <p className="text-xs text-muted-foreground">Current value</p>
          <p className="text-[20px] font-semibold text-foreground">{selectedTableDetail.value}</p>
        </div>
        <Separator />
        <p className="text-sm text-muted-foreground">{selectedTableDetail.description}</p>
        <div className="space-y-2">
          {selectedTableDetail.rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">{row.label}</span>
              <span className="text-xs font-medium text-foreground text-right">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : null

  const isTransactionDetailView = navSection === "transactions" && Boolean(selectedTransaction)
  const refundableAmount = selectedTransaction
    ? Math.max(0, selectedTransaction.amount - selectedTransaction.refundedAmount)
    : 0
  const refundAmountValue =
    refundType === "full" ? refundableAmount : Number(partialRefundAmount || 0)
  const canInitiateRefund =
    Boolean(selectedTransaction) &&
    refundAmountValue > 0 &&
    refundAmountValue <= refundableAmount

  const pageHeaderTitle = isTransactionDetailView
    ? selectedTransaction?.transactionId ?? "Transaction detail"
    : headerTitleBySection[navSection] ?? "Dashboard"
  const pageHeaderSubtitle = isTransactionDetailView
    ? selectedTransaction?.orderId
    : "All Products"
  const selectedRefundTimeline = selectedRefund ? refundTimelineById[selectedRefund.refundId] ?? [] : []
  const pageHeaderActions = isTransactionDetailView ? (
    <Button
      size="sm"
      className="h-8 text-xs"
      onClick={() => setRefundSheetOpen(true)}
      disabled={!refundableAmount}
    >
      Refund transaction
    </Button>
  ) : (
    headerActionsBySection[navSection]
  )

  function resetRefundFlow() {
    setRefundStep("form")
    setRefundType("full")
    setPartialRefundAmount("")
  }

  function resetDisputeActionFlow() {
    setDisputeActionStep("form")
    setDisputeActionType("defend")
    setDisputeDefendAmount("")
    setDisputeComment("")
    setDisputeDocuments({
      voiceDelivery: "",
      rebuttalLetter: "",
      refundDetails: "",
      additionalDocuments: "",
    })
  }

  function primeDisputeActionFlow(dispute: DisputeTableRow, actionType: DisputeActionType = "defend") {
    setDisputeActionStep("form")
    setDisputeActionType(actionType)
    setDisputeDefendAmount(String(dispute.amount))
    setDisputeComment("")
    setDisputeDocuments({
      voiceDelivery: "",
      rebuttalLetter: "",
      refundDetails: "",
      additionalDocuments: "",
    })
  }

  function handleDisputeDocumentPicked(
    key: keyof typeof disputeDocuments,
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]
    if (!file) return
    setDisputeDocuments((current) => ({ ...current, [key]: file.name }))
  }

  function handleInitiateRefund() {
    if (!canInitiateRefund) return
    setRefundStep("success")
  }

  function openGenerateReport(reportType: ReportType) {
    setActiveReportType(reportType)
    setReportOutputFormat("excel")
    setReportSaveAsName("")
    setReportRangeStart("2026-04-01")
    setReportRangeEnd("2026-04-15")
    const preset = savedReportPresets[reportType]
    setReportFieldSelectionMode("all")
    setReportSelectedFields(preset.fields)
    setGenerateReportSheetOpen(true)
  }

  function openScheduleReport(reportType: ReportType) {
    resetScheduleForm()
    setActiveReportType(reportType)
    setScheduleReportSheetOpen(true)
  }

  function toggleGenerateReportField(field: string) {
    setReportSelectedFields((current) =>
      current.includes(field) ? current.filter((entry) => entry !== field) : [...current, field]
    )
  }

  function handleGenerateReport() {
    if (!canGenerateReport) return
    const reportName = reportSaveAsName.trim() || `${reportTypeLabel[activeReportType]} ${new Date().toLocaleDateString("en-IN")}`
    const nextEntry: GeneratedReportRow = {
      id: buildReportId(),
      reportType: activeReportType,
      reportName,
      createdOn: formatTimestampForTable(),
      dateRange: formatDateRangeLabel(reportRangeStart, reportRangeEnd),
      status: "processing",
      fileFormat: reportOutputFormat,
    }
    setReportRows((current) => [nextEntry, ...current])
    setGenerateReportSheetOpen(false)
    setSelectedTableDetail({
      id: nextEntry.id,
      title: reportName,
      description: "Report generation has started.",
      value: reportTypeLabel[activeReportType],
      rows: [
        { label: "Report ID", value: nextEntry.id },
        { label: "Selected fields", value: `${selectedFieldsForGeneration.length}` },
        { label: "Format", value: reportOutputFormat.toUpperCase() },
        { label: "Status", value: "processing" },
      ],
    })
    setReportToast(`${reportName} queued for generation.`)
  }

  function openCustomizeReport(type: ReportType) {
    const preset = savedReportPresets[type]
    setCustomizeReportType(type)
    setCustomizeSelectedFields([...preset.fields])
    setCustomizeDisplayNames({ ...preset.displayNames })
    setCustomizeStep("fields")
    setCustomizeReportSheetOpen(true)
  }

  function toggleCustomizeField(field: string) {
    setCustomizeSelectedFields((current) =>
      current.includes(field) ? current.filter((entry) => entry !== field) : [...current, field]
    )
  }

  function reorderCustomizeFields(source: string, target: string) {
    if (source === target) return
    setCustomizeSelectedFields((current) => {
      const sourceIndex = current.indexOf(source)
      const targetIndex = current.indexOf(target)
      if (sourceIndex === -1 || targetIndex === -1) return current
      const next = [...current]
      next.splice(sourceIndex, 1)
      next.splice(targetIndex, 0, source)
      return next
    })
  }

  function updateCustomizeDisplayName(field: string, value: string) {
    setCustomizeDisplayNames((current) => ({ ...current, [field]: value }))
  }

  function saveReportCustomization() {
    if (!canSaveCustomizePreset) return
    const normalizedDisplayNames = Object.fromEntries(
      customizeSelectedFields.map((field) => [field, customizeDisplayNames[field] || field])
    )
    setSavedReportPresets((current) => ({
      ...current,
      [customizeReportType]: {
        fields: customizeSelectedFields,
        displayNames: normalizedDisplayNames,
      },
    }))
    setCustomizeReportSheetOpen(false)
    setReportToast(`${reportTypeLabel[customizeReportType]} customization saved.`)
  }

  function resetScheduleForm() {
    setEditingScheduleId(null)
    setActiveReportType("payment")
    setReportOutputFormat("excel")
    setScheduleFrequency("daily")
    setScheduleName("")
    setScheduleDeliveryRecipients(["email"])
    setScheduleEmailInput("")
    setScheduleEmailRecipients(["ops@merchant.com"])
    setScheduleSftpHost("")
    setScheduleSftpPort("22")
    setScheduleSftpUserId("")
    setScheduleSftpPassword("")
    setScheduleSftpPath("")
    setScheduleSftpAuthMode("password")
    setScheduleSftpPpkFileName("")
  }

  function toggleScheduleRecipient(recipient: ScheduleDeliveryRecipient) {
    setScheduleDeliveryRecipients((current) => {
      const exists = current.includes(recipient)
      if (exists && current.length === 1) return current
      if (exists) return current.filter((entry) => entry !== recipient)
      return [...current, recipient]
    })
  }

  function addScheduleEmailRecipients(rawValue: string) {
    const candidates = parseRecipients(rawValue)
    if (candidates.length === 0) return
    setScheduleEmailRecipients((current) => {
      const next = [...current]
      for (const candidate of candidates) {
        const normalized = candidate.toLowerCase()
        if (!isValidEmail(normalized)) continue
        if (!next.some((entry) => entry.toLowerCase() === normalized)) {
          next.push(normalized)
        }
      }
      return next
    })
  }

  function removeScheduleEmailRecipient(email: string) {
    setScheduleEmailRecipients((current) => current.filter((entry) => entry !== email))
  }

  function handleScheduleEmailInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" && event.key !== "," && event.key !== ";") return
    event.preventDefault()
    if (!scheduleEmailInput.trim()) return
    addScheduleEmailRecipients(scheduleEmailInput)
    setScheduleEmailInput("")
  }

  function handleSchedulePpkFilePicked(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setScheduleSftpPpkFileName(file.name)
    setScheduleSftpAuthMode("ppk")
    setScheduleSftpPassword("")
  }

  function scheduleReport() {
    if (!canCreateSchedule) return
    const scheduleLabel = scheduleName.trim() || `${scheduleFrequencyLabel[scheduleFrequency]} ${reportTypeLabel[activeReportType]}`
    const parsedEmails = scheduleEmailRecipients
    const nextEntry: ScheduledReportRow = {
      id: editingScheduleId ?? buildScheduleId(),
      scheduleName: scheduleLabel,
      reportType: activeReportType,
      frequency: scheduleFrequency,
      format: reportOutputFormat,
      status: "active",
      createdOn: formatTimestampForTable(),
      createdBy: "Tirth Trivedi",
      deliveryRecipients: scheduleDeliveryRecipients,
      emailRecipient: scheduleDeliveryRecipients.includes("email") ? parsedEmails.join(", ") : undefined,
      sftpHost: scheduleDeliveryRecipients.includes("sftp") ? scheduleSftpHost.trim() : undefined,
      sftpPort: scheduleDeliveryRecipients.includes("sftp") ? scheduleSftpPort.trim() : undefined,
      sftpUserId: scheduleDeliveryRecipients.includes("sftp") ? scheduleSftpUserId.trim() : undefined,
      sftpPath: scheduleDeliveryRecipients.includes("sftp") ? scheduleSftpPath.trim() : undefined,
      sftpAuthMode: scheduleDeliveryRecipients.includes("sftp") ? scheduleSftpAuthMode : undefined,
      sftpPpkFileName:
        scheduleDeliveryRecipients.includes("sftp") && scheduleSftpAuthMode === "ppk"
          ? scheduleSftpPpkFileName
          : undefined,
    }
    setScheduledRows((current) =>
      editingScheduleId
        ? current.map((entry) =>
            entry.id === editingScheduleId
              ? {
                  ...entry,
                  ...nextEntry,
                  createdOn: entry.createdOn,
                  createdBy: entry.createdBy,
                }
              : entry
          )
        : [nextEntry, ...current]
    )
    setReportsTableView("schedule")
    setScheduleReportSheetOpen(false)
    const recipientsSummary = scheduleDeliveryRecipients
      .map((recipient) => (recipient === "email" ? "Email" : "SFTP"))
      .join(" + ")
    setReportToast(
      editingScheduleId
        ? `Updated ${scheduleLabel} schedule (${recipientsSummary}).`
        : `Created ${scheduleLabel} schedule (${recipientsSummary}).`
    )
    resetScheduleForm()
  }

  function handleDownloadImeiSampleSheet() {
    const header = [
      "Order ID",
      "Transaction ID",
      "Merchant Order ID",
      "Amount",
      "Transaction Type",
      "Status",
      "Payment Mode / Method",
      "Creation Date",
      "Product",
      "IMEI",
    ]
    const rows = (imeiSampleTransactions.length ? imeiSampleTransactions : allProductTransactionRows).map(
      (row) =>
        toCsvRow([
          row.orderId,
          row.transactionId,
          row.merchantOrderId,
          row.amount,
          row.transactionType,
          row.paymentStatus,
          row.paymentMethod,
          row.createdAt,
          row.product,
          "",
        ])
    )
    const csv = [toCsvRow(header), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const href = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = href
    anchor.download = `imei-verification-sample-${imeiStartDate}-${imeiEndDate}.csv`
    anchor.click()
    URL.revokeObjectURL(href)
  }

  function handleImeiFilePicked(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setImeiUploadedFileName(file.name)
    setImeiUploadedFileSize(file.size)
  }

  function startImeiVerification() {
    if (!imeiUploadedFileName) return
    const inferredRows = Math.max(
      imeiSampleTransactions.length || 0,
      Math.min(5000, Math.max(30, Math.ceil(imeiUploadedFileSize / 220)))
    )
    setImeiTotalRows(inferredRows)
    setImeiProcessedRows(0)
    setImeiEstimatedMinutes(Math.max(1, Math.ceil(inferredRows / 30)))
    setImeiStatus("processing")
    setImeiBackgroundMode(false)
    setImeiBannerVisible(false)
  }

  function moveImeiProgressToBackground() {
    setImeiBackgroundMode(true)
    setImeiBannerVisible(true)
    setImeiSheetOpen(false)
  }

  function handleDownloadBulkRefundSampleSheet() {
    const header = [
      "Order ID",
      "Transaction ID",
      "Merchant Order ID",
      "Amount",
      "Transaction Type",
      "Refund Status",
      "Payment Mode / Method",
      "Creation Date",
      "Product",
      "Refund Reason",
    ]
    const rows = (bulkRefundSampleRows.length ? bulkRefundSampleRows : allProductRefundRows).map((row) =>
      toCsvRow([
        row.orderId,
        row.transactionId,
        row.merchantOrderId,
        row.amount,
        row.transactionType,
        row.refundStatus,
        row.paymentMethod,
        row.createdAt,
        row.product,
        "",
      ])
    )
    const csv = [toCsvRow(header), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const href = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = href
    anchor.download = `bulk-refund-sample-${bulkRefundStartDate}-${bulkRefundEndDate}.csv`
    anchor.click()
    URL.revokeObjectURL(href)
  }

  function handleBulkRefundFilePicked(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setBulkRefundUploadedFileName(file.name)
    setBulkRefundUploadedFileSize(file.size)
  }

  function startBulkRefundProcessing() {
    if (!bulkRefundUploadedFileName) return
    const inferredRows = Math.max(
      bulkRefundSampleRows.length || 0,
      Math.min(7000, Math.max(50, Math.ceil(bulkRefundUploadedFileSize / 240)))
    )
    setBulkRefundTotalRows(inferredRows)
    setBulkRefundProcessedRows(0)
    setBulkRefundEstimatedMinutes(Math.max(1, Math.ceil(inferredRows / 35)))
    setBulkRefundStatus("processing")
    setBulkRefundBackgroundMode(false)
    setBulkRefundBannerVisible(false)
  }

  function moveBulkRefundProgressToBackground() {
    setBulkRefundBackgroundMode(true)
    setBulkRefundBannerVisible(true)
    setBulkRefundSheetOpen(false)
  }

  return (
    <>
      <PageHeader
        title={pageHeaderTitle}
        subtitle={pageHeaderSubtitle}
        actions={pageHeaderActions}
        onBack={isTransactionDetailView ? () => setSelectedTransactionId(null) : undefined}
        backLabel="Back to transactions"
      />
      <WorkspaceShell
        leftContext={leftContext}
        showLeftContext={false}
        centerMain={centerMain}
        rightContext={rightContext}
        showRightContext={Boolean(selectedTableDetail) || Boolean(selectedDispute)}
      />
      <Sheet
        open={scheduleReportSheetOpen}
        onOpenChange={(open) => {
          setScheduleReportSheetOpen(open)
          if (!open) resetScheduleForm()
        }}
      >
        <SheetContent
          side="right"
          a11yTitle="Schedule report"
          a11yDescription="Configure recurring report generation."
          className="w-full border-l border-border/60 bg-background p-0 sm:max-w-[480px]"
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-border/60 bg-muted/25 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">{editingScheduleId ? "Edit schedule" : "Create schedule"}</p>
              <p className="text-xs text-muted-foreground">Configure report type, recipients, and delivery frequency.</p>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <fieldset className="space-y-2">
                <legend className="text-xs font-medium text-foreground">Report type</legend>
                <RadioGroup
                  value={activeReportType}
                  onValueChange={(value) => setActiveReportType(value as ReportType)}
                  className="grid grid-cols-2 gap-2"
                >
                  {quickReportCards.map((card) => {
                    const id = `schedule-report-type-${card.type}`
                    const active = activeReportType === card.type
                    return (
                      <label
                        key={id}
                        htmlFor={id}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2",
                          active ? "border-primary bg-primary/8" : "border-border/70"
                        )}
                      >
                        <RadioGroupItem id={id} value={card.type} />
                        <span className="text-xs text-foreground">{card.title}</span>
                      </label>
                    )
                  })}
                </RadioGroup>
              </fieldset>

              <Separator />

              <fieldset className="space-y-2">
                <legend className="text-xs font-medium text-foreground">File format</legend>
                <RadioGroup
                  value={reportOutputFormat}
                  onValueChange={(value) => setReportOutputFormat(value as ReportOutputFormat)}
                  className="grid grid-cols-2 gap-2"
                >
                  {[
                    { value: "excel", label: "Excel" },
                    { value: "csv", label: "CSV" },
                  ].map((option) => {
                    const id = `schedule-format-${option.value}`
                    const active = reportOutputFormat === option.value
                    return (
                      <label
                        key={id}
                        htmlFor={id}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2",
                          active ? "border-primary bg-primary/8" : "border-border/70"
                        )}
                      >
                        <RadioGroupItem id={id} value={option.value} />
                        <span className="text-xs text-foreground">{option.label}</span>
                      </label>
                    )
                  })}
                </RadioGroup>
              </fieldset>

              <Separator />

              <fieldset className="space-y-2">
                <legend className="text-xs font-medium text-foreground">Frequency</legend>
                <RadioGroup
                  value={scheduleFrequency}
                  onValueChange={(value) => setScheduleFrequency(value as ScheduleFrequency)}
                  className="grid grid-cols-3 gap-2"
                >
                  {[
                    { value: "daily", label: "Daily" },
                    { value: "weekly", label: "Weekly" },
                    { value: "monthly", label: "Monthly" },
                  ].map((option) => {
                    const id = `schedule-frequency-${option.value}`
                    const active = scheduleFrequency === option.value
                    return (
                      <label
                        key={id}
                        htmlFor={id}
                        className={cn(
                          "flex cursor-pointer items-center justify-center gap-2 rounded-md border px-2.5 py-2",
                          active ? "border-primary bg-primary/8" : "border-border/70"
                        )}
                      >
                        <RadioGroupItem id={id} value={option.value} />
                        <span className="text-xs text-foreground">{option.label}</span>
                      </label>
                    )
                  })}
                </RadioGroup>
              </fieldset>

              <Separator />

              <section className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="schedule-name-input">
                  Schedule name (optional)
                </label>
                <Input
                  id="schedule-name-input"
                  value={scheduleName}
                  onChange={(event) => setScheduleName(event.target.value)}
                  className="h-9"
                  placeholder={`${scheduleFrequencyLabel[scheduleFrequency]} ${reportTypeLabel[activeReportType]}`}
                />
              </section>

              <Separator />

              <fieldset className="space-y-2">
                <legend className="text-xs font-medium text-foreground">Recipients</legend>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border/70 px-2.5 py-2">
                    <input
                      type="checkbox"
                      checked={scheduleDeliveryRecipients.includes("email")}
                      onChange={() => toggleScheduleRecipient("email")}
                      className="h-4 w-4 rounded border-border"
                    />
                    <span className="text-xs text-foreground">Email</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border/70 px-2.5 py-2">
                    <input
                      type="checkbox"
                      checked={scheduleDeliveryRecipients.includes("sftp")}
                      onChange={() => toggleScheduleRecipient("sftp")}
                      className="h-4 w-4 rounded border-border"
                    />
                    <span className="text-xs text-foreground">SFTP</span>
                  </label>
                </div>
                <p className="text-[11px] text-muted-foreground">Select at least one destination.</p>
              </fieldset>

              {scheduleDeliveryRecipients.includes("email") ? (
                <>
                  <Separator />
                  <section className="space-y-2">
                    <label className="text-xs font-medium text-foreground" htmlFor="schedule-email-input">
                      Recipient emails
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="schedule-email-input"
                        value={scheduleEmailInput}
                        onChange={(event) => setScheduleEmailInput(event.target.value)}
                        onKeyDown={handleScheduleEmailInputKeyDown}
                        className="h-9 text-xs"
                        placeholder="Enter email and press Enter"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 text-xs"
                        onClick={() => {
                          if (!scheduleEmailInput.trim()) return
                          addScheduleEmailRecipients(scheduleEmailInput)
                          setScheduleEmailInput("")
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Add multiple users with comma, semicolon, or a new line divider.
                    </p>
                    {scheduleEmailRecipients.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {scheduleEmailRecipients.map((email) => (
                          <Badge
                            key={`schedule-email-${email}`}
                            variant="outline"
                            className="inline-flex items-center gap-1.5 pr-1 text-[10px]"
                          >
                            <span>{email}</span>
                            <button
                              type="button"
                              className="inline-flex h-4 w-4 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
                              aria-label={`Remove ${email}`}
                              onClick={() => removeScheduleEmailRecipient(email)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </section>
                </>
              ) : null}

              {scheduleDeliveryRecipients.includes("sftp") ? (
                <>
                  <Separator />
                  <section className="space-y-2">
                    <p className="text-xs font-medium text-foreground">SFTP details</p>
                    <div className="grid gap-2 sm:grid-cols-[1fr_100px]">
                      <Input
                        value={scheduleSftpHost}
                        onChange={(event) => setScheduleSftpHost(event.target.value)}
                        className="h-9"
                        placeholder="IP / hostname"
                      />
                      <Input
                        value={scheduleSftpPort}
                        onChange={(event) => setScheduleSftpPort(event.target.value)}
                        className="h-9"
                        placeholder="Port"
                      />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        value={scheduleSftpUserId}
                        onChange={(event) => setScheduleSftpUserId(event.target.value)}
                        className="h-9"
                        placeholder="User ID"
                      />
                      <Input
                        value={scheduleSftpPath}
                        onChange={(event) => setScheduleSftpPath(event.target.value)}
                        className="h-9"
                        placeholder="Path"
                      />
                    </div>
                  </section>

                  <Separator />

                  <fieldset className="space-y-2">
                    <legend className="text-xs font-medium text-foreground">SFTP authentication</legend>
                    <RadioGroup
                      value={scheduleSftpAuthMode}
                      onValueChange={(value) => setScheduleSftpAuthMode(value as SftpAuthMode)}
                      className="grid grid-cols-2 gap-2"
                    >
                      {[
                        { value: "password", label: "Password" },
                        { value: "ppk", label: ".ppk file" },
                      ].map((option) => {
                        const id = `schedule-auth-${option.value}`
                        const active = scheduleSftpAuthMode === option.value
                        return (
                          <label
                            key={id}
                            htmlFor={id}
                            className={cn(
                              "flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2",
                              active ? "border-primary bg-primary/8" : "border-border/70"
                            )}
                          >
                            <RadioGroupItem id={id} value={option.value} />
                            <span className="text-xs text-foreground">{option.label}</span>
                          </label>
                        )
                      })}
                    </RadioGroup>
                    {scheduleSftpAuthMode === "password" ? (
                      <Input
                        type="password"
                        value={scheduleSftpPassword}
                        onChange={(event) => setScheduleSftpPassword(event.target.value)}
                        className="h-9"
                        placeholder="User password"
                      />
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <Input
                          type="file"
                          id="schedule-sftp-ppk"
                          accept=".ppk"
                          className="hidden"
                          onChange={handleSchedulePpkFilePicked}
                        />
                        <label htmlFor="schedule-sftp-ppk">
                          <Button type="button" asChild variant="outline" size="sm" className="h-8 text-xs cursor-pointer">
                            <span>
                              <FileUp className="mr-1.5 h-3.5 w-3.5" />
                              Upload .ppk
                            </span>
                          </Button>
                        </label>
                        {scheduleSftpPpkFileName ? (
                          <span className="text-[11px] text-muted-foreground">{scheduleSftpPpkFileName}</span>
                        ) : null}
                      </div>
                    )}
                  </fieldset>
                </>
              ) : null}
            </div>
            <div className="border-t border-border/60 p-4">
              <Button className="w-full" onClick={scheduleReport} disabled={!canCreateSchedule}>
                {editingScheduleId ? "Update schedule" : "Create schedule"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <Sheet
        open={customizeReportSheetOpen}
        onOpenChange={(open) => {
          setCustomizeReportSheetOpen(open)
          if (!open) setCustomizeStep("fields")
        }}
      >
        <SheetContent
          side="right"
          a11yTitle="Customize report"
          a11yDescription="Choose report columns, sequence, and display names."
          className="w-full border-l border-border/60 bg-background p-0 sm:max-w-[560px]"
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-border/60 bg-muted/25 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Customize report</p>
              <p className="text-xs text-muted-foreground">
                {customizeStep === "fields" ? "Choose report type and columns." : "Arrange sequence and edit column labels."}
              </p>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {customizeStep === "fields" ? (
                <>
                  <div className="space-y-2 rounded-lg border border-border/70 bg-card p-4">
                    <p className="text-xs font-medium text-foreground">Report type</p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickReportCards.map((card) => (
                        <Button
                          key={`customize-${card.type}`}
                          variant={customizeReportType === card.type ? "secondary" : "outline"}
                          size="sm"
                          className="h-8 justify-start text-xs"
                          onClick={() => openCustomizeReport(card.type)}
                        >
                          {card.title}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3 rounded-lg border border-border/70 bg-card p-4">
                    {activeCustomizeFieldGroups.map((group) => (
                      <div key={`customize-group-${group.id}`} className="space-y-1.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {group.title}
                        </p>
                        <div className="grid gap-1.5">
                          {group.fields.map((field) => (
                            <label
                              key={`customize-field-${group.id}-${field}`}
                              className="flex cursor-pointer items-center gap-2 rounded-md border border-border/60 bg-muted/20 px-2.5 py-2"
                            >
                              <input
                                type="checkbox"
                                checked={customizeSelectedFields.includes(field)}
                                onChange={() => toggleCustomizeField(field)}
                                className="h-4 w-4 shrink-0 rounded-sm border border-border bg-background"
                              />
                              <span className="text-xs text-foreground">{field}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-3 rounded-lg border border-border/70 bg-card p-4">
                  <p className="text-xs font-medium text-foreground">
                    Sequence and rename columns ({customizeSelectedFields.length})
                  </p>
                  <div className="space-y-2">
                    {customizeSelectedFields.map((field) => (
                      <div
                        key={`sequence-${field}`}
                        draggable
                        onDragStart={() => setDraggingField(field)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                          if (!draggingField) return
                          reorderCustomizeFields(draggingField, field)
                          setDraggingField(null)
                        }}
                        onDragEnd={() => setDraggingField(null)}
                        className="flex items-center gap-2 rounded-md border border-border/70 bg-muted/20 px-2.5 py-2"
                      >
                        <span className="cursor-grab text-xs text-muted-foreground">::</span>
                        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{field}</span>
                        <Input
                          value={customizeDisplayNames[field] ?? field}
                          onChange={(event) => updateCustomizeDisplayName(field, event.target.value)}
                          className="h-8 w-[220px]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-border/60 p-4">
              {customizeStep === "fields" ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setCustomizeReportSheetOpen(false)
                      setCustomizeStep("fields")
                    }}
                  >
                    Discard
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!canSaveCustomizePreset}
                    onClick={() => setCustomizeStep("sequence")}
                  >
                    Next
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setCustomizeStep("fields")}>
                    Back
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setCustomizeReportSheetOpen(false)
                      setCustomizeStep("fields")
                    }}
                  >
                    Discard
                  </Button>
                  <Button className="flex-1" disabled={!canSaveCustomizePreset} onClick={saveReportCustomization}>
                    Save changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <Sheet
        open={generateReportSheetOpen}
        onOpenChange={(open) => {
          setGenerateReportSheetOpen(open)
        }}
      >
        <SheetContent
          side="right"
          a11yTitle="Generate report"
          a11yDescription="Choose format, date range, and fields before generating report."
          className="w-full border-l border-border/60 bg-background p-0 sm:max-w-[560px]"
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-border/60 bg-muted/25 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Generate {reportTypeLabel[activeReportType]}</p>
              <p className="text-xs text-muted-foreground">Configure output, date duration, and fields.</p>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <div className="space-y-2 rounded-lg border border-border/70 bg-card p-4">
                <p className="text-xs font-medium text-foreground">Report type</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickReportCards.map((card) => (
                    <Button
                      key={`generate-${card.type}`}
                      variant={activeReportType === card.type ? "secondary" : "outline"}
                      size="sm"
                      className="h-8 justify-start text-xs"
                      onClick={() => {
                        setActiveReportType(card.type)
                        const preset = savedReportPresets[card.type]
                        setReportSelectedFields(preset.fields)
                      }}
                    >
                      {card.title}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 border-b border-border/60 pb-4">
                <p className="text-xs font-medium text-foreground">File format</p>
                <div className="flex gap-2">
                  <Button
                    variant={reportOutputFormat === "excel" ? "secondary" : "outline"}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setReportOutputFormat("excel")}
                  >
                    Excel
                  </Button>
                  <Button
                    variant={reportOutputFormat === "csv" ? "secondary" : "outline"}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setReportOutputFormat("csv")}
                  >
                    CSV
                  </Button>
                </div>
              </div>
              <div className="space-y-2 border-b border-border/60 pb-4">
                <p className="text-xs font-medium text-foreground">Save report as (optional)</p>
                <Input
                  value={reportSaveAsName}
                  onChange={(event) => setReportSaveAsName(event.target.value)}
                  placeholder={`${reportTypeLabel[activeReportType]} ${new Date().toLocaleDateString("en-IN")}`}
                  className="h-9"
                />
              </div>
              <div className="space-y-2 border-b border-border/60 pb-4">
                <p className="text-xs font-medium text-foreground">Date range</p>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" value={reportRangeStart} onChange={(event) => setReportRangeStart(event.target.value)} className="h-9" />
                  <Input type="date" value={reportRangeEnd} onChange={(event) => setReportRangeEnd(event.target.value)} className="h-9" />
                </div>
              </div>
              <div className="space-y-3 pb-1">
                <p className="text-xs font-medium text-foreground">Fields</p>
                <RadioGroup
                  value={reportFieldSelectionMode}
                  onValueChange={(value) => setReportFieldSelectionMode(value as ReportFieldSelectionMode)}
                  className="grid grid-cols-2 gap-2"
                >
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border/70 px-2.5 py-2">
                    <RadioGroupItem value="all" />
                    <span className="text-xs text-foreground">All fields</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border/70 px-2.5 py-2">
                    <RadioGroupItem value="custom" />
                    <span className="text-xs text-foreground">Custom fields</span>
                  </label>
                </RadioGroup>
                {reportFieldSelectionMode === "custom" ? (
                  <div className="space-y-3">
                    {activeReportFieldGroups.map((group) => (
                      <div key={`generate-group-${group.id}`} className="space-y-1.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {group.title}
                        </p>
                        <div className="grid gap-1.5">
                          {group.fields.map((field) => (
                            <label
                              key={`generate-field-${group.id}-${field}`}
                              className="flex cursor-pointer items-center gap-2 rounded-md border border-border/60 bg-muted/20 px-2.5 py-2"
                            >
                              <input
                                type="checkbox"
                                checked={reportSelectedFields.includes(field)}
                                onChange={() => toggleGenerateReportField(field)}
                                className="h-4 w-4 shrink-0 rounded-sm border border-border bg-background"
                              />
                              <span className="text-xs text-foreground">{field}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
                  <div className="rounded-md bg-muted/30 p-2.5">
                    <p className="text-[11px] text-muted-foreground">
                      Selected fields ({selectedFieldsForGeneration.length})
                    </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {selectedFieldsForGeneration.map((field) => (
                      <Badge key={`selected-field-${field}`} variant="outline" className="text-[10px]">
                        {savedReportPresets[activeReportType].displayNames[field] || field}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-border/60 p-4">
              <Button className="w-full" disabled={!canGenerateReport} onClick={handleGenerateReport}>
                Generate report
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <Sheet
        open={imeiSheetOpen}
        onOpenChange={(open) => {
          if (!open && (imeiStatus === "processing" || imeiStatus === "completed")) {
            setImeiBackgroundMode(true)
            setImeiBannerVisible(true)
          }
          setImeiSheetOpen(open)
        }}
      >
        <SheetContent
          side="right"
          a11yTitle="Verify IMEI details"
          a11yDescription="Download sample sheet, upload filled IMEI file, and track verification status."
          className="w-full border-l border-border/60 bg-background p-0 sm:max-w-[460px]"
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-border/60 bg-muted/25 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Verify IMEI details</p>
              <p className="text-xs text-muted-foreground">
                Download the sample sheet, fill IMEI values, and upload for verification.
              </p>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {imeiStatus === "processing" ? (
                <div className="space-y-4 rounded-lg border border-border/70 bg-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Processing uploaded sheet</p>
                      <p className="text-xs text-muted-foreground">{imeiStatusMessage}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{imeiProgressPercent}%</span>
                  </div>
                  <Progress value={imeiProgressPercent} className="h-2.5" />
                  <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                    File: <span className="font-medium text-foreground">{imeiUploadedFileName}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={moveImeiProgressToBackground}
                  >
                    Progress in background
                  </Button>
                </div>
              ) : imeiStatus === "completed" ? (
                <div className="space-y-4 rounded-lg border border-success/30 bg-card p-4">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-success/20 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">IMEI verification complete</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {imeiTotalRows.toLocaleString("en-IN")} rows processed successfully.
                    </p>
                  </div>
                  <div className="grid gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Processed rows</span>
                      <span className="font-medium text-foreground">
                        {imeiProcessedRows.toLocaleString("en-IN")} / {imeiTotalRows.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Upload</span>
                      <span className="font-medium text-foreground">{imeiUploadedFileName}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setImeiSheetOpen(false)
                      setImeiStatus("idle")
                      setImeiBackgroundMode(false)
                      setImeiBannerVisible(false)
                    }}
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 rounded-lg border border-border/70 bg-card p-4">
                    <p className="text-xs font-medium text-foreground">1. Configure sample download range</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">From date</label>
                        <Input
                          type="date"
                          value={imeiStartDate}
                          onChange={(event) => setImeiStartDate(event.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">From time</label>
                        <Input
                          type="time"
                          value={imeiStartTime}
                          onChange={(event) => setImeiStartTime(event.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">To date</label>
                        <Input
                          type="date"
                          value={imeiEndDate}
                          onChange={(event) => setImeiEndDate(event.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">To time</label>
                        <Input
                          type="time"
                          value={imeiEndTime}
                          onChange={(event) => setImeiEndTime(event.target.value)}
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                      <p className="text-xs text-muted-foreground">
                        {imeiSampleTransactions.length.toLocaleString("en-IN")} transactions in selected range
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={handleDownloadImeiSampleSheet}
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Download sample excel
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-lg border border-border/70 bg-card p-4">
                    <p className="text-xs font-medium text-foreground">2. Upload filled IMEI file</p>
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-center">
                      <FileUp className="h-5 w-5 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-foreground">Upload filled file</p>
                        <p className="text-[11px] text-muted-foreground">Supports .csv, .xlsx, .xls</p>
                      </div>
                      <Input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleImeiFilePicked}
                        className="sr-only"
                      />
                    </label>
                    {imeiUploadedFileName ? (
                      <div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                        Selected file: <span className="font-medium text-foreground">{imeiUploadedFileName}</span>
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </div>
            {imeiStatus === "idle" ? (
              <div className="border-t border-border/60 p-4">
                <Button
                  className="w-full"
                  disabled={!imeiUploadedFileName}
                  onClick={startImeiVerification}
                >
                  Upload and verify IMEI
                </Button>
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
      <Sheet
        open={bulkRefundSheetOpen}
        onOpenChange={(open) => {
          if (!open && (bulkRefundStatus === "processing" || bulkRefundStatus === "completed")) {
            setBulkRefundBackgroundMode(true)
            setBulkRefundBannerVisible(true)
          }
          setBulkRefundSheetOpen(open)
        }}
      >
        <SheetContent
          side="right"
          a11yTitle="Bulk refund"
          a11yDescription="Download sample sheet, upload filled refund file, and track processing status."
          className="w-full border-l border-border/60 bg-background p-0 sm:max-w-[460px]"
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-border/60 bg-muted/25 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Bulk refund</p>
              <p className="text-xs text-muted-foreground">
                Download the sample sheet, fill refund rows, and upload to process in bulk.
              </p>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {bulkRefundStatus === "processing" ? (
                <div className="space-y-4 rounded-lg border border-border/70 bg-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Processing uploaded bulk refund file</p>
                      <p className="text-xs text-muted-foreground">{bulkRefundStatusMessage}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{bulkRefundProgressPercent}%</span>
                  </div>
                  <Progress value={bulkRefundProgressPercent} className="h-2.5" />
                  <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                    File: <span className="font-medium text-foreground">{bulkRefundUploadedFileName}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={moveBulkRefundProgressToBackground}
                  >
                    Progress in background
                  </Button>
                </div>
              ) : bulkRefundStatus === "completed" ? (
                <div className="space-y-4 rounded-lg border border-success/30 bg-card p-4">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-success/20 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">Bulk refund processing complete</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {bulkRefundTotalRows.toLocaleString("en-IN")} rows processed successfully.
                    </p>
                  </div>
                  <div className="grid gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Processed rows</span>
                      <span className="font-medium text-foreground">
                        {bulkRefundProcessedRows.toLocaleString("en-IN")} / {bulkRefundTotalRows.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Upload</span>
                      <span className="font-medium text-foreground">{bulkRefundUploadedFileName}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setBulkRefundSheetOpen(false)
                      setBulkRefundStatus("idle")
                      setBulkRefundBackgroundMode(false)
                      setBulkRefundBannerVisible(false)
                    }}
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 rounded-lg border border-border/70 bg-card p-4">
                    <p className="text-xs font-medium text-foreground">1. Configure sample download range</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">From date</label>
                        <Input
                          type="date"
                          value={bulkRefundStartDate}
                          onChange={(event) => setBulkRefundStartDate(event.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">From time</label>
                        <Input
                          type="time"
                          value={bulkRefundStartTime}
                          onChange={(event) => setBulkRefundStartTime(event.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">To date</label>
                        <Input
                          type="date"
                          value={bulkRefundEndDate}
                          onChange={(event) => setBulkRefundEndDate(event.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">To time</label>
                        <Input
                          type="time"
                          value={bulkRefundEndTime}
                          onChange={(event) => setBulkRefundEndTime(event.target.value)}
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                      <p className="text-xs text-muted-foreground">
                        {bulkRefundSampleRows.length.toLocaleString("en-IN")} refund rows in selected range
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={handleDownloadBulkRefundSampleSheet}
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Download sample excel
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3 rounded-lg border border-border/70 bg-card p-4">
                    <p className="text-xs font-medium text-foreground">2. Upload filled refund file</p>
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-center">
                      <FileUp className="h-5 w-5 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-foreground">Upload filled file</p>
                        <p className="text-[11px] text-muted-foreground">Supports .csv, .xlsx, .xls</p>
                      </div>
                      <Input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleBulkRefundFilePicked}
                        className="sr-only"
                      />
                    </label>
                    {bulkRefundUploadedFileName ? (
                      <div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                        Selected file: <span className="font-medium text-foreground">{bulkRefundUploadedFileName}</span>
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </div>
            {bulkRefundStatus === "idle" ? (
              <div className="border-t border-border/60 p-4">
                <Button
                  className="w-full"
                  disabled={!bulkRefundUploadedFileName}
                  onClick={startBulkRefundProcessing}
                >
                  Upload and process bulk refund
                </Button>
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
      <Sheet
        open={refundDetailSheetOpen}
        onOpenChange={(open) => {
          setRefundDetailSheetOpen(open)
          if (!open) {
            setSelectedRefundId(null)
          }
        }}
      >
        <SheetContent
          side="right"
          a11yTitle="Refund details"
          a11yDescription="Detailed refund information and status timeline."
          className="w-full border-l border-border/60 bg-background p-0 sm:max-w-[460px]"
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-border/60 bg-muted/25 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">
                {selectedRefund?.refundId ?? "Refund details"}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedRefund
                  ? `${selectedRefund.orderId} · ${selectedRefund.product}`
                  : "Select a refund row to view details"}
              </p>
            </div>
            {selectedRefund ? (
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                <section className="rounded-lg border border-border/70 bg-card p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Refund snapshot</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[
                      ["Order ID", selectedRefund.orderId],
                      ["Transaction ID", selectedRefund.transactionId],
                      ["Merchant Order ID", selectedRefund.merchantOrderId],
                      ["Amount", `₹${selectedRefund.amount.toLocaleString("en-IN")}`],
                      ["Transaction type", selectedRefund.transactionType],
                      ["Refund status", selectedRefund.refundStatus],
                      ["Payment mode / method", selectedRefund.paymentMethod],
                      ["Created at", selectedRefund.createdAt],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-[11px] text-muted-foreground">{label}</p>
                        <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="rounded-lg border border-border/70 bg-card p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Status timeline</p>
                  <div className="mt-3 space-y-0">
                    {selectedRefundTimeline.map((event, index) => (
                      <div key={`${event.status}-${event.timestamp}`} className="relative pl-6 pb-4 last:pb-0">
                        {index < selectedRefundTimeline.length - 1 ? (
                          <span className="absolute left-[7px] top-4 h-[calc(100%-8px)] w-px bg-border" />
                        ) : null}
                        <span className="absolute left-0 top-1.5 h-4 w-4 rounded-full border border-primary/35 bg-background" />
                        <p className="text-xs font-medium text-foreground">{event.status}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{event.timestamp}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{event.detail}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
      <Sheet
        open={refundSheetOpen}
        onOpenChange={(open) => {
          setRefundSheetOpen(open)
          if (!open) resetRefundFlow()
        }}
      >
        <SheetContent
          side="right"
          a11yTitle="Refund transaction"
          a11yDescription="Choose full or partial refund and initiate refund."
          className="w-full border-l border-border/60 bg-background p-0 sm:max-w-[420px]"
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-border/60 bg-muted/25 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Refund transaction</p>
              <p className="text-xs text-muted-foreground">
                {selectedTransaction?.transactionId ?? "Select a transaction"} · Refundable ₹
                {refundableAmount.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {refundStep === "success" ? (
                <div className="space-y-4 rounded-lg border border-border/70 bg-card p-4 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-success/20 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Refund initiated</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      ₹{refundAmountValue.toLocaleString("en-IN")} will be processed for{" "}
                      {selectedTransaction?.transactionId}.
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setRefundSheetOpen(false)
                      resetRefundFlow()
                    }}
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border/70 bg-card p-4">
                    <p className="text-xs font-medium text-foreground">Choose refund type</p>
                    <div className="mt-3 grid gap-2">
                      <button
                        type="button"
                        onClick={() => setRefundType("full")}
                        className={cn(
                          "rounded-md border px-3 py-2 text-left text-xs transition-colors",
                          refundType === "full"
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border text-muted-foreground"
                        )}
                      >
                        Full refund
                      </button>
                      <button
                        type="button"
                        onClick={() => setRefundType("partial")}
                        className={cn(
                          "rounded-md border px-3 py-2 text-left text-xs transition-colors",
                          refundType === "partial"
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border text-muted-foreground"
                        )}
                      >
                        Partial refund
                      </button>
                    </div>
                  </div>

                  {refundType === "partial" ? (
                    <div className="rounded-lg border border-border/70 bg-card p-4">
                      <p className="text-xs text-muted-foreground">Refund amount</p>
                      <Input
                        value={partialRefundAmount}
                        onChange={(event) => setPartialRefundAmount(event.target.value)}
                        type="number"
                        placeholder={`Max ${refundableAmount}`}
                        className="mt-2 h-9"
                      />
                    </div>
                  ) : null}
                </div>
              )}
            </div>
            {refundStep === "form" ? (
              <div className="border-t border-border/60 p-4">
                <Button className="w-full" disabled={!canInitiateRefund} onClick={handleInitiateRefund}>
                  Initiate refund
                </Button>
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
