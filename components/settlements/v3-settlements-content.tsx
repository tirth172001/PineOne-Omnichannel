"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BadgeIndianRupee,
  Banknote,
  Clock3,
  Info,
  Landmark,
  Rocket,
  Sun,
  TimerReset,
  WalletCards,
  X,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { PageHeader } from "@/components/ui/panels"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"

type SettlementType = "on-demand" | "same-day" | "t-plus"
type SettlementStatus = "Processing" | "Settled"

type SettlementBatch = {
  id: string
  utr: string
  bankReference: string
  settlementDate: string
  settlementAmount: number
  transactionAmount: number
  deductions: number
  finalSettlementAmount: number
  paymentMethods: string
  paymentMethodGroup: "UPI-led" | "Card-led" | "Mixed"
  bankName: string
  bankCode: string
  bankLast4: string
  initiationDate: string
  transactionCount: number
  status: SettlementStatus
  eta?: string
  type: SettlementType
  cycleLabel: string
}

type SettlementTransaction = {
  id: string
  batchId: string
  transactionId: string
  storeName: string
  paymentMethod: string
  transactionAmount: number
  payoutAmount: number
  deductions: number
  customerVpa: string
  orderId: string
  status: "Settled" | "Processing"
}

const settlementTypeConfig: Record<
  SettlementType,
  { label: string; icon: typeof Rocket; iconClassName: string }
> = {
  "on-demand": {
    label: "On-demand settlement",
    icon: Rocket,
    iconClassName: "text-muted-foreground/90",
  },
  "same-day": {
    label: "Same day settlement",
    icon: Sun,
    iconClassName: "text-muted-foreground/90",
  },
  "t-plus": {
    label: "T+1 settlement",
    icon: TimerReset,
    iconClassName: "text-muted-foreground/90",
  },
}

const settlementBatches: SettlementBatch[] = [
  {
    id: "SET-BATCH-2105",
    utr: "HDFC240416A1782",
    bankReference: "BR-9981021",
    settlementDate: "16 Apr 2026",
    settlementAmount: 286500,
    transactionAmount: 295240,
    deductions: 8740,
    finalSettlementAmount: 286500,
    paymentMethods: "UPI, Cards, Netbanking",
    paymentMethodGroup: "Mixed",
    bankName: "HDFC Bank",
    bankCode: "HDFC",
    bankLast4: "4821",
    initiationDate: "16 Apr 2026, 09:05 AM",
    transactionCount: 312,
    status: "Settled",
    type: "same-day",
    cycleLabel: "Same day",
  },
  {
    id: "SET-BATCH-2104",
    utr: "ICIC240416C2284",
    bankReference: "BR-9980974",
    settlementDate: "16 Apr 2026",
    settlementAmount: 131820,
    transactionAmount: 136990,
    deductions: 5170,
    finalSettlementAmount: 131820,
    paymentMethods: "UPI, Payment links",
    paymentMethodGroup: "UPI-led",
    bankName: "ICICI Bank",
    bankCode: "ICICI",
    bankLast4: "6632",
    initiationDate: "16 Apr 2026, 12:40 PM",
    transactionCount: 146,
    status: "Processing",
    eta: "Estimated by 03:15 PM",
    type: "on-demand",
    cycleLabel: "On-demand",
  },
  {
    id: "SET-BATCH-2103",
    utr: "AXIS240415T1093",
    bankReference: "BR-9980412",
    settlementDate: "15 Apr 2026",
    settlementAmount: 128560,
    transactionAmount: 133010,
    deductions: 4450,
    finalSettlementAmount: 128560,
    paymentMethods: "Cards, POS",
    paymentMethodGroup: "Card-led",
    bankName: "Axis Bank",
    bankCode: "AXIS",
    bankLast4: "1904",
    initiationDate: "15 Apr 2026, 08:15 PM",
    transactionCount: 121,
    status: "Settled",
    type: "t-plus",
    cycleLabel: "T+1",
  },
]

const settlementTransactions: SettlementTransaction[] = [
  {
    id: "TRX-4011982",
    batchId: "SET-BATCH-2105",
    transactionId: "TXN-9917281",
    storeName: "Pine Store · Indiranagar",
    paymentMethod: "UPI · PhonePe",
    transactionAmount: 3499,
    payoutAmount: 3443,
    deductions: 56,
    customerVpa: "tirth@okaxis",
    orderId: "ORD-882712",
    status: "Settled",
  },
  {
    id: "TRX-4011983",
    batchId: "SET-BATCH-2105",
    transactionId: "TXN-9917282",
    storeName: "Pine Store · Koramangala",
    paymentMethod: "Card · Visa",
    transactionAmount: 7100,
    payoutAmount: 6980,
    deductions: 120,
    customerVpa: "card",
    orderId: "ORD-882715",
    status: "Settled",
  },
  {
    id: "TRX-4011984",
    batchId: "SET-BATCH-2104",
    transactionId: "TXN-9917210",
    storeName: "Pine Kiosk · Phoenix Mall",
    paymentMethod: "Payment Link · SMS",
    transactionAmount: 9400,
    payoutAmount: 9250,
    deductions: 150,
    customerVpa: "link",
    orderId: "ORD-882611",
    status: "Processing",
  },
  {
    id: "TRX-4011985",
    batchId: "SET-BATCH-2104",
    transactionId: "TXN-9917213",
    storeName: "Pine Store · MG Road",
    paymentMethod: "UPI · GPay",
    transactionAmount: 1750,
    payoutAmount: 1722,
    deductions: 28,
    customerVpa: "name@okhdfc",
    orderId: "ORD-882620",
    status: "Processing",
  },
  {
    id: "TRX-4011986",
    batchId: "SET-BATCH-2103",
    transactionId: "TXN-9917002",
    storeName: "Pine Store · Whitefield",
    paymentMethod: "Card · RuPay",
    transactionAmount: 2890,
    payoutAmount: 2842,
    deductions: 48,
    customerVpa: "card",
    orderId: "ORD-882442",
    status: "Settled",
  },
]

function inr(value: number) {
  return `₹${value.toLocaleString("en-IN")}`
}

function SettlementTypeIcon({ type }: { type: SettlementType }) {
  const config = settlementTypeConfig[type]
  const Icon = config.icon
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center justify-center">
          <Icon className={`h-4 w-4 ${config.iconClassName}`} />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {config.label}
      </TooltipContent>
    </Tooltip>
  )
}

function InfoAmount({
  triggerLabel,
  gross,
  deductions,
  finalAmount,
}: {
  triggerLabel: string
  gross: number
  deductions: number
  finalAmount: number
}) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span>{triggerLabel}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" aria-label="View settlement amount breakdown" className="inline-flex">
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-64 text-xs">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span>Total amount picked</span>
              <span className="font-medium">{inr(gross)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Deductions</span>
              <span className="font-medium">- {inr(deductions)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-1.5">
              <span>Final settlement amount</span>
              <span className="font-semibold">{inr(finalAmount)}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

interface V3SettlementsContentProps {
  initialBatchId?: string
}

export function V3SettlementsContent({ initialBatchId }: V3SettlementsContentProps) {
  const router = useRouter()
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null)
  const [onDemandEnabled, setOnDemandEnabled] = useState(false)
  const [sameDayEnabled, setSameDayEnabled] = useState(false)
  const [pendingMode, setPendingMode] = useState<Exclude<SettlementType, "t-plus"> | null>(null)
  const [modeConfirmed, setModeConfirmed] = useState(false)

  const selectedBatch = useMemo(
    () => (initialBatchId ? settlementBatches.find((batch) => batch.id === initialBatchId) ?? null : null),
    [initialBatchId],
  )

  const batchTransactions = useMemo(
    () =>
      selectedBatch
        ? settlementTransactions.filter((transaction) => transaction.batchId === selectedBatch.id)
        : [],
    [selectedBatch],
  )

  const selectedTransaction = useMemo(
    () =>
      selectedTransactionId
        ? settlementTransactions.find((transaction) => transaction.id === selectedTransactionId) ?? null
        : null,
    [selectedTransactionId],
  )

  const todaysPayoutAmount = settlementBatches
    .filter((batch) => batch.settlementDate === "16 Apr 2026")
    .reduce((sum, batch) => sum + batch.finalSettlementAmount, 0)
  const todaysGrossAmount = settlementBatches
    .filter((batch) => batch.settlementDate === "16 Apr 2026")
    .reduce((sum, batch) => sum + batch.transactionAmount, 0)
  const todaysDeductions = settlementBatches
    .filter((batch) => batch.settlementDate === "16 Apr 2026")
    .reduce((sum, batch) => sum + batch.deductions, 0)

  const settledTransactionCount = settlementBatches.reduce((sum, batch) => sum + batch.transactionCount, 0)
  const completedBatchCount = settlementBatches.filter((batch) => batch.status === "Settled").length

  const settlementColumns: DataTableColumn<SettlementBatch>[] = [
    {
      id: "utr",
      header: "UTR",
      accessorKey: "utr",
      width: 220,
      pinnable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium text-foreground">{row.utr}</p>
          <SettlementTypeIcon type={row.type} />
        </div>
      ),
      getSearchValue: (row) => `${row.utr} ${row.cycleLabel}`,
    },
    { id: "bankReference", header: "Bank reference", accessorKey: "bankReference", width: 160 },
    {
      id: "settlementDate",
      header: "Settlement date",
      accessorKey: "settlementDate",
      width: 130,
      filterOptions: [
        { label: "Today", value: "today" },
        { label: "Previous day", value: "previous-day" },
      ],
      getFilterValue: (row) => (row.settlementDate === "16 Apr 2026" ? "today" : "previous-day"),
    },
    {
      id: "settlementAmount",
      header: "Settlement amount",
      width: 165,
      align: "right",
      getValue: (row) => row.settlementAmount,
      cell: (row) => (
        <InfoAmount
          triggerLabel={inr(row.settlementAmount)}
          gross={row.transactionAmount}
          deductions={row.deductions}
          finalAmount={row.finalSettlementAmount}
        />
      ),
    },
    { id: "paymentMethods", header: "Payment methods", accessorKey: "paymentMethods", width: 220 },
    {
      id: "paymentMethodGroup",
      header: "Method group",
      accessorKey: "paymentMethodGroup",
      width: 130,
      filterOptions: [
        { label: "UPI-led", value: "upi-led" },
        { label: "Card-led", value: "card-led" },
        { label: "Mixed", value: "mixed" },
      ],
      getFilterValue: (row) => row.paymentMethodGroup.toLowerCase(),
    },
    {
      id: "transactionAmount",
      header: "Transaction amount",
      width: 145,
      align: "right",
      getValue: (row) => row.transactionAmount,
      cell: (row) => inr(row.transactionAmount),
    },
    {
      id: "bankAccount",
      header: "Bank account",
      width: 220,
      filterOptions: [
        { label: "HDFC Bank", value: "hdfc bank" },
        { label: "ICICI Bank", value: "icici bank" },
        { label: "Axis Bank", value: "axis bank" },
      ],
      getFilterValue: (row) => row.bankName.toLowerCase(),
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-muted text-[9px] font-semibold text-muted-foreground">
            {row.bankCode.slice(0, 2)}
          </div>
          <p className="text-xs text-foreground">{row.bankName} · •••• {row.bankLast4}</p>
        </div>
      ),
      getSearchValue: (row) => `${row.bankName} ${row.bankLast4}`,
    },
    { id: "initiationDate", header: "Initiation date", accessorKey: "initiationDate", width: 190 },
    {
      id: "transactionCount",
      header: "No. of transactions",
      accessorKey: "transactionCount",
      width: 160,
      align: "right",
      getValue: (row) => row.transactionCount,
      cell: (row) => row.transactionCount.toLocaleString("en-IN"),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      width: 110,
      filterOptions: [
        { label: "Processing", value: "processing" },
        { label: "Settled", value: "settled" },
      ],
      getFilterValue: (row) => row.status.toLowerCase(),
      cell: (row) => (
        <Badge variant="outline" className={row.status === "Settled" ? "bg-success/15 border-success/30 text-foreground text-[10px]" : "bg-warning/15 border-warning/30 text-foreground text-[10px]"}>
          {row.status}
        </Badge>
      ),
    },
    {
      id: "eta",
      header: "ETA",
      accessorKey: "eta",
      width: 160,
      cell: (row) =>
        row.status === "Processing" ? (
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" />
            {row.eta ?? "Pending"}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        ),
    },
  ]

  const transactionColumns: DataTableColumn<SettlementTransaction>[] = [
    { id: "transactionId", header: "Transaction ID", accessorKey: "transactionId", width: 165, pinnable: true },
    { id: "storeName", header: "Store name", accessorKey: "storeName", width: 220 },
    { id: "paymentMethod", header: "Payment method", accessorKey: "paymentMethod", width: 180 },
    {
      id: "transactionAmount",
      header: "Transaction amount",
      width: 150,
      align: "right",
      getValue: (row) => row.transactionAmount,
      cell: (row) => inr(row.transactionAmount),
    },
    {
      id: "payoutAmount",
      header: "Payout amount",
      width: 140,
      align: "right",
      getValue: (row) => row.payoutAmount,
      cell: (row) => inr(row.payoutAmount),
    },
    {
      id: "deductions",
      header: "Deductions",
      width: 120,
      align: "right",
      getValue: (row) => row.deductions,
      cell: (row) => inr(row.deductions),
    },
  ]

  const handleModeToggle = (mode: Exclude<SettlementType, "t-plus">) => {
    if (mode === "on-demand" && onDemandEnabled) {
      setOnDemandEnabled(false)
      return
    }
    if (mode === "same-day" && sameDayEnabled) {
      setSameDayEnabled(false)
      return
    }
    setPendingMode(mode)
    setModeConfirmed(false)
  }

  const pendingModeConfig = pendingMode ? settlementTypeConfig[pendingMode] : null
  const pendingRequestedAmount = pendingMode === "same-day" ? 95000 : 120000
  const pendingFee = pendingMode === "same-day" ? 190 : 420
  const pendingGst = pendingMode === "same-day" ? 34 : 76
  const pendingNetPayout = pendingRequestedAmount - pendingFee - pendingGst

  const pageHeaderActions = selectedBatch ? (
    <>
      <Badge variant="outline" className="text-xs">
        {selectedBatch.cycleLabel}
      </Badge>
      <Badge variant="outline" className="text-xs">
        {selectedBatch.bankName} · •••• {selectedBatch.bankLast4}
      </Badge>
      <Badge variant="outline" className="text-xs">
        {selectedBatch.transactionCount.toLocaleString("en-IN")} transactions
      </Badge>
    </>
  ) : (
    <div className="flex items-center gap-2">
      <div className="flex h-8 items-center gap-2 rounded-md border border-border/70 bg-card px-2.5">
        <Rocket className="h-3.5 w-3.5" />
        <span className="text-xs font-medium text-foreground">On-demand</span>
        <Switch
          checked={onDemandEnabled}
          onCheckedChange={(checked) => {
            if (checked) {
              handleModeToggle("on-demand")
              return
            }
            setOnDemandEnabled(false)
          }}
          aria-label="Toggle on-demand settlement"
          className="data-[state=checked]:bg-primary"
        />
      </div>
      <div className="flex h-8 items-center gap-2 rounded-md border border-border/70 bg-card px-2.5">
        <Sun className="h-3.5 w-3.5" />
        <span className="text-xs font-medium text-foreground">Same day</span>
        <Switch
          checked={sameDayEnabled}
          onCheckedChange={(checked) => {
            if (checked) {
              handleModeToggle("same-day")
              return
            }
            setSameDayEnabled(false)
          }}
          aria-label="Toggle same day settlement"
          className="data-[state=checked]:bg-primary"
        />
      </div>
    </div>
  )

  const rightContext = selectedTransaction ? (
    <div className="h-full overflow-y-auto p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Transaction details</p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="h-7 w-7 rounded-md"
          onClick={() => setSelectedTransactionId(null)}
          aria-label="Close transaction details panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="rounded-lg border border-border/70 bg-card/80 p-4 space-y-3">
        {[
          ["Transaction ID", selectedTransaction.transactionId],
          ["Order ID", selectedTransaction.orderId],
          ["Store", selectedTransaction.storeName],
          ["Payment method", selectedTransaction.paymentMethod],
          ["Customer", selectedTransaction.customerVpa],
          ["Transaction amount", inr(selectedTransaction.transactionAmount)],
          ["Payout amount", inr(selectedTransaction.payoutAmount)],
          ["Deductions", inr(selectedTransaction.deductions)],
          ["Status", selectedTransaction.status],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 text-xs">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground text-right">{value}</span>
          </div>
        ))}
      </div>
    </div>
  ) : null

  const centerMain = selectedBatch ? (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border/70 bg-card/80 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Settlement amount</p>
          <p className="mt-1 text-base font-semibold text-foreground">{inr(selectedBatch.settlementAmount)}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-card/80 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Transaction amount</p>
          <p className="mt-1 text-base font-semibold text-foreground">{inr(selectedBatch.transactionAmount)}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-card/80 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Deductions</p>
          <p className="mt-1 text-base font-semibold text-foreground">{inr(selectedBatch.deductions)}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-card/80 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</p>
          <p className="mt-1 text-base font-semibold text-foreground">{selectedBatch.status}</p>
        </div>
      </div>

      <DataTable
        data={batchTransactions}
        columns={transactionColumns}
        rowId={(row) => row.id}
        selectedRowId={selectedTransactionId}
        onRowClick={(row) => setSelectedTransactionId(row.id)}
        searchPlaceholder="Search settlement transactions..."
        initialPinnedColumnIds={["transactionId"]}
      />
    </div>
  ) : (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <section className="rounded-lg border border-primary/30 bg-primary/8 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">On-demand settlement available</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                You are eligible for on-demand settlement up to{" "}
                <span className="font-semibold text-foreground">{inr(120000)}</span> today.
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  setPendingMode("on-demand")
                  setModeConfirmed(false)
                }}
              >
                Settle now
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border/70 bg-card/80 p-3">
          <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <WalletCards className="h-3.5 w-3.5" />
            Today&apos;s payout
          </p>
          <div className="mt-1 text-[18px] font-semibold text-foreground">
            <InfoAmount
              triggerLabel={inr(todaysPayoutAmount)}
              gross={todaysGrossAmount}
              deductions={todaysDeductions}
              finalAmount={todaysPayoutAmount}
            />
          </div>
        </div>
        <div className="rounded-lg border border-border/70 bg-card/80 p-3">
          <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <BadgeIndianRupee className="h-3.5 w-3.5" />
            No. of transactions settled
          </p>
          <p className="mt-1 text-[18px] font-semibold text-foreground">{settledTransactionCount.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-card/80 p-3">
          <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Landmark className="h-3.5 w-3.5" />
            Settlement batches completed
          </p>
          <p className="mt-1 text-[18px] font-semibold text-foreground">{completedBatchCount}</p>
        </div>
      </div>

      <DataTable
        data={settlementBatches}
        columns={settlementColumns}
        rowId={(row) => row.id}
        onRowClick={(row) => router.push(`/settlements/${row.id}`)}
        searchPlaceholder="Search by UTR, reference, bank..."
        initialPinnedColumnIds={["utr"]}
        statusColumnId="status"
        statusOptions={[
          { label: "Processing", value: "processing" },
          { label: "Settled", value: "settled" },
        ]}
      />
    </div>
  )

  return (
    <>
      <PageHeader
        title={selectedBatch ? selectedBatch.id : "Settlements"}
        subtitle={selectedBatch ? selectedBatch.utr : "Default cycle is T+1 day"}
        actions={pageHeaderActions}
        onBack={selectedBatch ? () => router.push("/settlements") : undefined}
        backLabel="Back to settlement batches"
      />

      <WorkspaceShell
        centerMain={centerMain}
        rightContext={rightContext}
        showRightContext={Boolean(selectedTransaction)}
      />

      <Sheet
        open={Boolean(pendingMode)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingMode(null)
            setModeConfirmed(false)
          }
        }}
      >
        <SheetContent
          side="right"
          a11yTitle={`${pendingModeConfig?.label ?? "Settlement"} charge confirmation`}
          a11yDescription="Review additional charges for this settlement mode and confirm."
          className="w-full border-l border-border/70 bg-background p-0 sm:max-w-[430px]"
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-border/60 px-4 py-3">
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                {pendingModeConfig ? <pendingModeConfig.icon className="h-4 w-4 text-primary" /> : null}
                {pendingModeConfig?.label ?? "Settlement mode"}
              </p>
              <p className="text-xs text-muted-foreground">This mode has additional charges compared to default T+1 settlement.</p>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {!modeConfirmed ? (
                <>
                  <div className="rounded-lg border border-border/70 bg-card/80 p-4 space-y-2">
                    <p className="text-xs font-medium text-foreground">Charge breakdown</p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Requested amount</span>
                        <span className="font-medium text-foreground">{inr(pendingRequestedAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{pendingMode === "same-day" ? "Same-day fee (0.20%)" : "On-demand fee (0.35%)"}</span>
                        <span className="font-medium text-foreground">- {inr(pendingFee)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">GST on fee</span>
                        <span className="font-medium text-foreground">- {inr(pendingGst)}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-border/60 pt-1.5">
                        <span className="text-foreground">Net payout</span>
                        <span className="font-semibold text-foreground">{inr(pendingNetPayout)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      if (pendingMode === "on-demand") setOnDemandEnabled(true)
                      if (pendingMode === "same-day") setSameDayEnabled(true)
                      setModeConfirmed(true)
                    }}
                  >
                    Enable {pendingMode === "same-day" ? "same day" : "on-demand"}
                  </Button>
                </>
              ) : (
                <div className="rounded-lg border border-success/30 bg-card/80 p-4 space-y-3">
                  <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Banknote className="h-4 w-4 text-success" />
                    Mode enabled
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pendingMode === "same-day" ? "Same day settlement" : "On-demand settlement"} is enabled for eligible payouts.
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setPendingMode(null)
                      setModeConfirmed(false)
                    }}
                  >
                    Done
                  </Button>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
