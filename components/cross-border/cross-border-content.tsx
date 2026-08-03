"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Landmark,
  PackageCheck,
  Upload,
} from "lucide-react"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"
import { PageHeader } from "@/components/ui/panels"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HighchartsPanelChart } from "@/components/ui/highcharts"
import { BulkOperationSheet, type BulkOperationState } from "@/components/shared/bulk-operation-sheet"
import { bulkOperationConfigs } from "@/lib/bulk-operations"
import { cn } from "@/lib/utils"

export type CrossBorderSection =
  | "overview"
  | "transactions"
  | "settlements"
  | "disputes"
  | "refunds"
  | "reports"
  | "uploads"
  | "configurations"

type CrossBorderTransactionRow = {
  id: string
  orderId: string
  country: string
  amount: number
  paymentStatus: "Success" | "Failed" | "Pending"
  invoiceStatus: "Uploaded" | "Pending" | "Mismatch"
  awbStatus: "Uploaded" | "Pending" | "Delayed"
  customsReady: "Yes" | "No"
  mismatchAlert: "None" | "Invoice mismatch" | "HS code missing"
}

type UploadBatchRow = {
  id: string
  type: "Invoice" | "AWB"
  createdAt: string
  totalRows: number
  successRows: number
  failedRows: number
  state: "Completed" | "Partial failed" | "Processing"
}

type SettlementRow = {
  id: string
  cycle: string
  bankAccount: string
  grossAmount: number
  deductions: number
  recoveries: number
  netPayout: number
  state: "Completed" | "In progress"
}

const crossBorderSections: Array<{ key: CrossBorderSection; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "transactions", label: "Transactions" },
  { key: "settlements", label: "Settlement" },
  { key: "disputes", label: "Disputes" },
  { key: "refunds", label: "Refunds" },
  { key: "reports", label: "Reports" },
  { key: "uploads", label: "Uploads" },
  { key: "configurations", label: "Configurations" },
]

const initialTransactionRows: CrossBorderTransactionRow[] = [
  {
    id: "CBTXN-1042",
    orderId: "ORD-CB-1042",
    country: "UAE",
    amount: 42890,
    paymentStatus: "Success",
    invoiceStatus: "Uploaded",
    awbStatus: "Uploaded",
    customsReady: "Yes",
    mismatchAlert: "None",
  },
  {
    id: "CBTXN-1041",
    orderId: "ORD-CB-1041",
    country: "Singapore",
    amount: 19850,
    paymentStatus: "Success",
    invoiceStatus: "Pending",
    awbStatus: "Pending",
    customsReady: "No",
    mismatchAlert: "HS code missing",
  },
  {
    id: "CBTXN-1040",
    orderId: "ORD-CB-1040",
    country: "UK",
    amount: 76120,
    paymentStatus: "Failed",
    invoiceStatus: "Mismatch",
    awbStatus: "Delayed",
    customsReady: "No",
    mismatchAlert: "Invoice mismatch",
  },
]

const initialUploadRows: UploadBatchRow[] = [
  {
    id: "UPL-221",
    type: "Invoice",
    createdAt: "25 Apr 2026, 10:42 AM",
    totalRows: 120,
    successRows: 120,
    failedRows: 0,
    state: "Completed",
  },
  {
    id: "UPL-220",
    type: "AWB",
    createdAt: "25 Apr 2026, 09:12 AM",
    totalRows: 80,
    successRows: 76,
    failedRows: 4,
    state: "Partial failed",
  },
]

const settlementRows: SettlementRow[] = [
  {
    id: "CBSTL-992",
    cycle: "16 Apr - 22 Apr",
    bankAccount: "HDFC •• 3381",
    grossAmount: 302930,
    deductions: 8640,
    recoveries: 1200,
    netPayout: 295490,
    state: "Completed",
  },
  {
    id: "CBSTL-993",
    cycle: "23 Apr - 29 Apr",
    bankAccount: "HDFC •• 3381",
    grossAmount: 142330,
    deductions: 3910,
    recoveries: 0,
    netPayout: 138420,
    state: "In progress",
  },
]

const reportTemplateRows = [
  { id: "mpr", label: "MPR preset", description: "Settlement + deductions + recoveries reconciliation fields." },
  { id: "stl", label: "Settlement preset", description: "Cycle, payout bank, net payout, and reconciliation columns." },
  { id: "ops", label: "Cross-border ops preset", description: "Invoice/AWB statuses, mismatch alerts, customs-ready flags." },
]

export function CrossBorderContent({ initialSection = "overview" }: { initialSection?: CrossBorderSection } = {}) {
  const crossBorderBulkConfig = bulkOperationConfigs["cross-border-docs"]
  const [section, setSection] = useState<CrossBorderSection>(initialSection)
  const [transactionRows, setTransactionRows] = useState<CrossBorderTransactionRow[]>(initialTransactionRows)
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null)
  const [transactionDocState, setTransactionDocState] = useState({
    invoiceNumber: "",
    invoiceStatus: "Pending",
    awbNumber: "",
    awbStatus: "Pending",
    customsReady: false,
  })

  const [uploadRows, setUploadRows] = useState<UploadBatchRow[]>(initialUploadRows)
  const [bulkOperationOpen, setBulkOperationOpen] = useState(false)
  const [bulkOperationState, setBulkOperationState] = useState<BulkOperationState>("idle")
  const [bulkUploadedFileName, setBulkUploadedFileName] = useState("")
  const [bulkProcessedRows, setBulkProcessedRows] = useState(0)
  const [bulkTotalRows, setBulkTotalRows] = useState(0)
  const [bulkEstimatedMinutes, setBulkEstimatedMinutes] = useState(0)

  const [supportsOnDemandSettlement, setSupportsOnDemandSettlement] = useState(true)

  useEffect(() => {
    setSection(initialSection)
  }, [initialSection])

  useEffect(() => {
    if (bulkOperationState !== "processing" || bulkTotalRows <= 0) return
    const interval = window.setInterval(() => {
      setBulkProcessedRows((current) => {
        const remaining = Math.max(0, bulkTotalRows - current)
        const next = Math.min(bulkTotalRows, current + Math.max(1, Math.ceil(remaining * 0.18)))
        const rowsLeft = Math.max(0, bulkTotalRows - next)
        setBulkEstimatedMinutes(rowsLeft > 0 ? Math.max(1, Math.ceil(rowsLeft / 50)) : 0)
        if (next >= bulkTotalRows) {
          setBulkOperationState("partial-failed")
        }
        return next
      })
    }, 900)
    return () => window.clearInterval(interval)
  }, [bulkOperationState, bulkTotalRows])

  const selectedTransaction = useMemo(
    () => transactionRows.find((row) => row.id === selectedTransactionId) ?? null,
    [selectedTransactionId, transactionRows]
  )

  useEffect(() => {
    if (!selectedTransaction) return
    setTransactionDocState({
      invoiceNumber: `INV-${selectedTransaction.id}`,
      invoiceStatus: selectedTransaction.invoiceStatus,
      awbNumber: selectedTransaction.awbStatus === "Uploaded" ? `AWB-${selectedTransaction.id}` : "",
      awbStatus: selectedTransaction.awbStatus,
      customsReady: selectedTransaction.customsReady === "Yes",
    })
  }, [selectedTransaction])

  const transactionColumns: DataTableColumn<CrossBorderTransactionRow>[] = [
    { id: "id", header: "Transaction ID", accessorKey: "id", width: 130, pinnable: true },
    { id: "orderId", header: "Order", accessorKey: "orderId", width: 130 },
    { id: "country", header: "Country", accessorKey: "country", width: 120 },
    {
      id: "amount",
      header: "Amount",
      getValue: (row) => row.amount,
      width: 120,
      align: "right",
      cell: (row) => <span className="font-medium">₹{row.amount.toLocaleString("en-MY")}</span>,
    },
    { id: "paymentStatus", header: "Payment", accessorKey: "paymentStatus", width: 110 },
    { id: "invoiceStatus", header: "Invoice status", accessorKey: "invoiceStatus", width: 120 },
    { id: "awbStatus", header: "AWB status", accessorKey: "awbStatus", width: 120 },
    { id: "customsReady", header: "Customs ready", accessorKey: "customsReady", width: 120 },
    { id: "mismatchAlert", header: "Mismatch alerts", accessorKey: "mismatchAlert", width: 150 },
  ]

  const uploadColumns: DataTableColumn<UploadBatchRow>[] = [
    { id: "id", header: "Batch ID", accessorKey: "id", width: 120, pinnable: true },
    { id: "type", header: "Document", accessorKey: "type", width: 110 },
    { id: "createdAt", header: "Uploaded on", accessorKey: "createdAt", width: 180 },
    { id: "totalRows", header: "Rows", accessorKey: "totalRows", width: 80, align: "right" },
    { id: "successRows", header: "Success", accessorKey: "successRows", width: 90, align: "right" },
    { id: "failedRows", header: "Failed", accessorKey: "failedRows", width: 90, align: "right" },
    { id: "state", header: "State", accessorKey: "state", width: 120 },
  ]

  const settlementColumns: DataTableColumn<SettlementRow>[] = [
    { id: "id", header: "Cycle ID", accessorKey: "id", width: 120, pinnable: true },
    { id: "cycle", header: "Settlement cycle", accessorKey: "cycle", width: 160 },
    { id: "bankAccount", header: "Bank account", accessorKey: "bankAccount", width: 140 },
    {
      id: "grossAmount",
      header: "Gross",
      getValue: (row) => row.grossAmount,
      align: "right",
      width: 120,
      cell: (row) => `₹${row.grossAmount.toLocaleString("en-MY")}`,
    },
    {
      id: "deductions",
      header: "Deductions",
      getValue: (row) => row.deductions,
      align: "right",
      width: 120,
      cell: (row) => `₹${row.deductions.toLocaleString("en-MY")}`,
    },
    {
      id: "recoveries",
      header: "Recoveries",
      getValue: (row) => row.recoveries,
      align: "right",
      width: 120,
      cell: (row) => `₹${row.recoveries.toLocaleString("en-MY")}`,
    },
    {
      id: "netPayout",
      header: "Net payout",
      getValue: (row) => row.netPayout,
      align: "right",
      width: 120,
      cell: (row) => <span className="font-medium">₹{row.netPayout.toLocaleString("en-MY")}</span>,
    },
    { id: "state", header: "State", accessorKey: "state", width: 100 },
  ]

  const overviewTrendOptions = useMemo(() => {
    const labels = ["Apr 16", "Apr 17", "Apr 18", "Apr 19", "Apr 20", "Apr 21", "Apr 22"]
    return {
      chart: {
        type: "line",
        height: 250,
        marginBottom: 46,
        marginTop: 12,
        marginLeft: 48,
        marginRight: 16,
      },
      xAxis: {
        categories: labels,
        lineWidth: 1,
        tickLength: 0,
      },
      yAxis: {
        min: 0,
        gridLineWidth: 1,
        labels: { enabled: true },
      },
      legend: { enabled: true, align: "left", verticalAlign: "top" },
      series: [
        {
          type: "line",
          name: "Card",
          data: [92000, 101000, 114000, 119500, 127400, 132800, 141300],
          color: "var(--color-primary)",
          marker: { enabled: true, radius: 2.4, lineWidth: 0 },
        },
        {
          type: "line",
          name: "UPI",
          data: [71000, 78000, 82400, 86900, 91400, 98600, 102100],
          color: "var(--color-chart-3)",
          marker: { enabled: true, radius: 2.2, lineWidth: 0 },
          dashStyle: "ShortDash",
        },
        {
          type: "line",
          name: "Netbanking",
          data: [30200, 33900, 36400, 40100, 44800, 46200, 51900],
          color: "var(--color-chart-4)",
          marker: { enabled: true, radius: 2.2, lineWidth: 0 },
        },
      ],
    }
  }, [])

  const nextSettlement = settlementRows.find((row) => row.state === "In progress") ?? settlementRows[0]

  function startBulkOperation() {
    if (!bulkUploadedFileName) return
    const size = 148
    setBulkTotalRows(size)
    setBulkProcessedRows(0)
    setBulkEstimatedMinutes(4)
    setBulkOperationState("processing")
  }

  function handleBulkDone() {
    setBulkOperationOpen(false)
    setBulkOperationState("idle")
    setBulkUploadedFileName("")
    setBulkProcessedRows(0)
    setBulkTotalRows(0)
    setBulkEstimatedMinutes(0)
  }

  function handleRetryFailed() {
    const successRows = Math.max(0, bulkProcessedRows - 5)
    setUploadRows((current) => [
      {
        id: `UPL-${220 + current.length + 1}`,
        type: "AWB",
        createdAt: "26 Apr 2026, 11:08 AM",
        totalRows: bulkTotalRows,
        successRows,
        failedRows: 0,
        state: "Completed",
      },
      ...current,
    ])
    setBulkOperationState("completed")
  }

  function saveTransactionDocs() {
    if (!selectedTransaction) return
    setTransactionRows((current) =>
      current.map((row) =>
        row.id === selectedTransaction.id
          ? {
              ...row,
              invoiceStatus: transactionDocState.invoiceStatus as CrossBorderTransactionRow["invoiceStatus"],
              awbStatus: transactionDocState.awbStatus as CrossBorderTransactionRow["awbStatus"],
              customsReady: transactionDocState.customsReady ? "Yes" : "No",
              mismatchAlert:
                transactionDocState.invoiceStatus === "Mismatch" ? "Invoice mismatch" : row.mismatchAlert,
            }
          : row
      )
    )
  }

  const leftContext = (
    <div className="left-panel-content">
      <p className="left-panel-label">Cross border</p>
      <div className="left-panel-stack">
        {crossBorderSections.map((item) => (
          <Button
            key={item.key}
            variant="ghost"
            onClick={() => setSection(item.key)}
            className={cn(
              "left-panel-item !justify-start",
              section === item.key ? "left-panel-item-active" : "left-panel-item-inactive"
            )}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  )

  const centerMain = (
    <div className="h-full overflow-y-auto space-y-4 p-4">
      {section === "overview" ? (
        <>
          <section className="rounded-lg border border-border/70 bg-card/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Next action required</p>
                <p className="text-sm font-semibold text-foreground">7 shipments pending AWB upload</p>
              </div>
              <Button asChild size="sm" className="h-8 text-xs">
                <Link href="/cross-border/uploads">
                  Upload AWB batch
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-3">
            <article className="rounded-lg border border-border/70 bg-card/80 p-4">
              <p className="text-xs text-muted-foreground">Transactions</p>
              <p className="mt-1 text-xl font-semibold text-foreground">342 · ₹39,82,100</p>
              <p className="mt-1 text-xs text-muted-foreground">Cross-border transaction count and volume</p>
            </article>
            <article className="rounded-lg border border-border/70 bg-card/80 p-4">
              <p className="text-xs text-muted-foreground">Settlement</p>
              <p className="mt-1 text-xl font-semibold text-foreground">₹1,42,330 · 1 cycle</p>
              <p className="mt-1 text-xs text-muted-foreground">Next cycle to {nextSettlement.bankAccount}</p>
            </article>
            <article className="rounded-lg border border-border/70 bg-card/80 p-4">
              <p className="text-xs text-muted-foreground">Nudges</p>
              <p className="mt-1 text-xl font-semibold text-foreground">4 invoice mismatches</p>
              <p className="mt-1 text-xs text-muted-foreground">Resolve mismatches to avoid customs delay</p>
            </article>
          </section>

          <section className="rounded-lg border border-border/70 bg-card/80 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Payment method trends</h3>
              <Badge variant="outline" className="text-[11px]">Last 7 days</Badge>
            </div>
            <HighchartsPanelChart options={overviewTrendOptions} fillParent={false} />
          </section>
        </>
      ) : null}

      {section === "transactions" ? (
        <DataTable
          data={transactionRows}
          columns={transactionColumns}
          rowId={(row) => row.id}
          selectedRowId={selectedTransactionId}
          onRowClick={(row) => setSelectedTransactionId(row.id)}
          searchPlaceholder="Search by transaction, order, or country..."
          initialPinnedColumnIds={["id"]}
        />
      ) : null}

      {section === "settlements" ? (
        <>
          <section className="rounded-lg border border-border/70 bg-card/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Next settlement cycle</p>
                <p className="text-sm font-semibold text-foreground">
                  {nextSettlement.cycle} · ₹{nextSettlement.netPayout.toLocaleString("en-MY")} to {nextSettlement.bankAccount}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Download className="h-3.5 w-3.5" />
                  Download MPR
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Customize MPR
                </Button>
                <Button size="sm" className="h-8 text-xs" disabled={!supportsOnDemandSettlement}>
                  Request on-demand settlement
                </Button>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-2">
              <p className="text-xs text-muted-foreground">Enable on-demand settlement controls</p>
              <Switch checked={supportsOnDemandSettlement} onCheckedChange={setSupportsOnDemandSettlement} />
            </div>
          </section>
          <section className="rounded-lg border border-border/70 bg-card/80 p-4">
            <p className="text-sm font-semibold text-foreground">Recoveries & deductions</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-md border border-border/60 bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Deductions total</p>
                <p className="text-lg font-semibold text-foreground">₹12,550</p>
              </div>
              <div className="rounded-md border border-border/60 bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Recoveries</p>
                <p className="text-lg font-semibold text-foreground">₹1,200</p>
              </div>
              <div className="rounded-md border border-border/60 bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Net payout impact</p>
                <p className="text-lg font-semibold text-foreground">₹11,350</p>
              </div>
            </div>
          </section>
          <DataTable
            data={settlementRows}
            columns={settlementColumns}
            rowId={(row) => row.id}
            searchPlaceholder="Search settlement cycles..."
            initialPinnedColumnIds={["id"]}
          />
        </>
      ) : null}

      {section === "disputes" ? (
        <section className="rounded-lg border border-border/70 bg-card/80 p-4">
          <p className="text-sm font-semibold text-foreground">Cross-border disputes</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Amount in dispute: ₹41,900 · Breaching SLA: ₹12,500. Route to disputes queue for evidence actions.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3 h-8 text-xs">
            <Link href="/cross-border/disputes">Open disputes queue</Link>
          </Button>
        </section>
      ) : null}

      {section === "refunds" ? (
        <section className="rounded-lg border border-border/70 bg-card/80 p-4">
          <p className="text-sm font-semibold text-foreground">Cross-border refunds</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Overall refund amount: ₹3,42,900. Use refund queue for SLA-linked processing and compliance notes.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3 h-8 text-xs">
            <Link href="/cross-border/refunds">View refund queue</Link>
          </Button>
        </section>
      ) : null}

      {section === "reports" ? (
        <>
          <section className="grid gap-3 md:grid-cols-3">
            {reportTemplateRows.map((template) => (
              <article key={template.id} className="rounded-lg border border-border/70 bg-card/80 p-4">
                <p className="text-sm font-semibold text-foreground">{template.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                <Button variant="outline" size="sm" className="mt-3 h-8 text-xs">
                  Use preset
                </Button>
              </article>
            ))}
          </section>
          <section className="rounded-lg border border-border/70 bg-card/80 p-4">
            <p className="text-sm font-semibold text-foreground">Saved presets by product/module</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm">
                <p className="font-medium text-foreground">Cross Border · Settlement · MPR preset</p>
                <p className="text-xs text-muted-foreground">18 columns · Shared with Finance Ops</p>
              </div>
              <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm">
                <p className="font-medium text-foreground">Cross Border · Transactions · Ops preset</p>
                <p className="text-xs text-muted-foreground">22 columns · Shared with Logistics Ops</p>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {section === "uploads" ? (
        <>
          <section className="rounded-lg border border-border/70 bg-card/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">Invoice and AWB upload center</p>
                <p className="text-xs text-muted-foreground">
                  Bulk upload with template validation, row-level errors, and retry workflow.
                </p>
              </div>
              <Button size="sm" className="h-8 text-xs" onClick={() => setBulkOperationOpen(true)}>
                <Upload className="h-3.5 w-3.5" />
                Start bulk upload
              </Button>
            </div>
          </section>
          <DataTable
            data={uploadRows}
            columns={uploadColumns}
            rowId={(row) => row.id}
            searchPlaceholder="Search by upload batch..."
            initialPinnedColumnIds={["id"]}
          />
        </>
      ) : null}

      {section === "configurations" ? (
        <section className="rounded-lg border border-border/70 bg-card/80 p-4">
          <p className="text-sm font-semibold text-foreground">Cross border configuration</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2.5">
              <p className="text-xs text-muted-foreground">Supported corridors</p>
              <p className="text-sm font-medium text-foreground">UAE, Singapore, UK, US</p>
            </div>
            <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2.5">
              <p className="text-xs text-muted-foreground">Compliance mode</p>
              <p className="text-sm font-medium text-foreground">Automated checks enabled</p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )

  const rightContext = selectedTransaction ? (
    <div className="h-full overflow-y-auto p-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Transaction documents</p>
      <div className="mt-3 rounded-lg border border-border/70 bg-card/80 p-4">
        <p className="text-sm font-semibold text-foreground">{selectedTransaction.id}</p>
        <p className="mt-1 text-xs text-muted-foreground">{selectedTransaction.orderId}</p>
        <div className="mt-3 space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Invoice number</p>
            <Input
              value={transactionDocState.invoiceNumber}
              onChange={(event) => setTransactionDocState((current) => ({ ...current, invoiceNumber: event.target.value }))}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Invoice status</p>
            <Select
              value={transactionDocState.invoiceStatus}
              onValueChange={(value) => setTransactionDocState((current) => ({ ...current, invoiceStatus: value }))}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Uploaded">Uploaded</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Mismatch">Mismatch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">AWB number</p>
            <Input
              value={transactionDocState.awbNumber}
              onChange={(event) => setTransactionDocState((current) => ({ ...current, awbNumber: event.target.value }))}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">AWB status</p>
            <Select
              value={transactionDocState.awbStatus}
              onValueChange={(value) => setTransactionDocState((current) => ({ ...current, awbStatus: value }))}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Uploaded">Uploaded</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Delayed">Delayed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-2">
            <p className="text-sm text-foreground">Customs-ready</p>
            <Switch
              checked={transactionDocState.customsReady}
              onCheckedChange={(checked) => setTransactionDocState((current) => ({ ...current, customsReady: checked }))}
            />
          </div>
          <Button className="w-full" onClick={saveTransactionDocs}>
            Save document state
          </Button>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <PageHeader
        title="Cross Border"
        subtitle="PACB workflows for transactions, settlements, and document operations."
        actions={
          <>
            <Badge variant="outline" className="h-8 rounded-md text-xs">
              Payment gateway · Subscription · Payout
            </Badge>
            <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
              <Link href="/settings?module=credentials">Credentials</Link>
            </Button>
          </>
        }
      />
      <WorkspaceShell
        leftContext={leftContext}
        centerMain={centerMain}
        rightContext={rightContext}
        showLeftContext
        showRightContext={Boolean(rightContext)}
      />

      <BulkOperationSheet
        open={bulkOperationOpen}
        onOpenChange={(open) => {
          setBulkOperationOpen(open)
          if (!open && bulkOperationState === "processing") {
            setBulkOperationState("partial-failed")
          }
        }}
        title="Bulk invoice / AWB upload"
        description="Upload invoice and AWB sheets with validation, error export, and retry."
        templateSummary={`${crossBorderBulkConfig.template.columns.length} required columns in template.`}
        status={bulkOperationState}
        progressPercent={bulkTotalRows > 0 ? Math.round((bulkProcessedRows / bulkTotalRows) * 100) : 0}
        processedRows={bulkProcessedRows}
        totalRows={bulkTotalRows}
        estimatedMinutes={bulkEstimatedMinutes}
        uploadedFileName={bulkUploadedFileName}
        onDownloadTemplate={() => {
          // Demo stub for template download action.
        }}
        onFilePicked={(event) => {
          const file = event.target.files?.[0]
          if (!file) return
          setBulkUploadedFileName(file.name)
        }}
        onStart={startBulkOperation}
        onBackground={() => setBulkOperationOpen(false)}
        onDownloadErrors={() => {
          // Demo stub for row-level error export.
        }}
        onRetryFailed={handleRetryFailed}
        onDone={() => {
          setUploadRows((current) => [
            {
              id: `UPL-${220 + current.length + 1}`,
              type: "Invoice",
              createdAt: "26 Apr 2026, 11:24 AM",
              totalRows: bulkTotalRows || 148,
              successRows: bulkTotalRows || 148,
              failedRows: 0,
              state: "Completed",
            },
            ...current,
          ])
          handleBulkDone()
        }}
        startLabel="Validate and process upload"
      />
    </>
  )
}
