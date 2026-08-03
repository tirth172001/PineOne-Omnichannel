"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  Clock,
  CreditCard,
  Monitor,
  QrCode,
  Smartphone,
  Wallet,
  X,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { HighchartsPanelChart } from "@/components/ui/highcharts"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { ProductWorkspaceNav, type ProductWorkspaceSection } from "@/components/dashboard/product-workspace-nav"
import { PageHeader } from "@/components/ui/panels"
import { OverviewAnalyticsCanvas, type AnalyticsWidget } from "@/components/dashboard/overview-analytics-canvas"
import { SectionSummaryStrip, type SectionSummaryMetric } from "@/components/dashboard/section-summary-strip"
import {
  advanceOnboardingProgress,
  markOnboardingStarted,
  type ProductOnboardingFeature,
  type ProductOnboardingProgress,
} from "@/lib/product-onboarding"

type SectionKey = "overview" | "upi" | "cards" | "emi" | "wallets"
type NavSection = ProductWorkspaceSection
type VasItem = { id: string; name: string; detail: string; enabled: boolean; requiresConfig: boolean }
type VasConfig = { label: string; threshold: string; owner: string }
type CheckoutConfig = {
  brandName: string
  checkoutDomain: string
  supportEmail: string
  accentColor: string
  showPineLabsBranding: boolean
  guestCheckout: boolean
  saveCards: boolean
  failureFallback: boolean
  surchargeControl: boolean
  settlementAlerts: boolean
}

type RightContext =
  | { kind: "transaction"; id: string }
  | { kind: "metric"; title: string; description: string; value: string }
  | { kind: "vas"; id: string }
  | null

const onboardingFeatureLabel: Record<ProductOnboardingFeature, string> = {
  payout: "Payout",
}

const weeklyData = [
  { day: "Mon", upi: 62, cards: 55, emi: 18, wallets: 10 },
  { day: "Tue", upi: 75, cards: 68, emi: 22, wallets: 13 },
  { day: "Wed", upi: 65, cards: 58, emi: 20, wallets: 13 },
  { day: "Thu", upi: 82, cards: 76, emi: 25, wallets: 15 },
  { day: "Fri", upi: 70, cards: 62, emi: 22, wallets: 13 },
  { day: "Sat", upi: 38, cards: 32, emi: 12, wallets: 7 },
  { day: "Sun", upi: 28, cards: 25, emi: 8, wallets: 6 },
]

const methods = [
  { key: "upi", label: "UPI", color: "var(--color-primary)", share: 42, amount: "₹360K" },
  { key: "cards", label: "Cards", color: "var(--color-chart-2)", share: 38, amount: "₹330K" },
  { key: "emi", label: "EMI", color: "var(--color-chart-4)", share: 12, amount: "₹100K" },
  { key: "wallets", label: "Wallets", color: "var(--color-chart-3)", share: 8, amount: "₹70K" },
] as const

const methodOrder: Array<{ key: SectionKey; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "upi", label: "UPI" },
  { key: "cards", label: "Cards" },
  { key: "emi", label: "EMI" },
  { key: "wallets", label: "Wallets" },
]

const onlineTxnMethods = [
  { method: "UPI", label: "Google Pay" },
  { method: "Card", label: "Visa •• 4242" },
  { method: "EMI", label: "Bajaj Fin" },
  { method: "Wallet", label: "Paytm" },
] as const

const onlineTxnStatuses = ["success", "success", "pending", "failed"] as const
const onlineTxnMerchants = ["Rahul Sharma", "Priya Nair", "Arjun Mehta", "Sneha Patel", "Kiran Rao", "Neha Joshi"] as const

const recentTxns = Array.from({ length: 48 }, (_, index) => {
  const methodMeta = onlineTxnMethods[index % onlineTxnMethods.length]
  return {
    id: `TXN-${9201 + index}`,
    method: methodMeta.method,
    label: methodMeta.label,
    amount: 900 + ((index * 1375) % 52000),
    status: onlineTxnStatuses[index % onlineTxnStatuses.length],
    time: `${(index + 1) * 2}m ago`,
    merchant: onlineTxnMerchants[index % onlineTxnMerchants.length],
  }
})

const settlementRows = Array.from({ length: 14 }, (_, index) => {
  const state = index % 3 === 0 ? "Completed" : index % 3 === 1 ? "Processing" : "Needs action"
  const title = state === "Completed" ? "Today's settlement" : state === "Processing" ? "T+1 batch" : "Holdback review"
  return {
    id: `STL-${2081 + index}`,
    title,
    amount: `₹${(84120 + index * 2175).toLocaleString("en-MY")}`,
    state,
  }
})

const disputeRows = Array.from({ length: 14 }, (_, index) => ({
  id: `DP-${3342 + index}`,
  state: index % 2 === 0 ? "Chargeback initiated" : "Evidence required",
  amount: `₹${(4300 + index * 640).toLocaleString("en-MY")}`,
}))

const refundRows = Array.from({ length: 14 }, (_, index) => ({
  id: `RF-${1202 + index}`,
  state: index % 2 === 0 ? "Auto-approved" : "Manual review",
  amount: `₹${(1200 + index * 420).toLocaleString("en-MY")}`,
}))

const reportRows = Array.from({ length: 14 }, (_, index) => ({
  id: `RPT-${201 + index}`,
  title: index % 3 === 0 ? "Gateway success report" : index % 3 === 1 ? "Method mix report" : "Settlement variance report",
  cadence: index % 2 === 0 ? "Daily" : "Weekly",
  owner: index % 2 === 0 ? "Payments Ops" : "Growth Team",
}))

const defaultVasItems: VasItem[] = [
  { id: "smart-routing", name: "Smart routing", detail: "Route by success likelihood across gateways.", enabled: true, requiresConfig: true },
  { id: "upi-intent", name: "UPI intent boost", detail: "Dynamic app-ordering and intent retries.", enabled: false, requiresConfig: false },
  { id: "tokenization", name: "Card tokenization", detail: "Token vault for repeat checkout acceleration.", enabled: true, requiresConfig: true },
]

const defaultVasConfig: Record<string, VasConfig> = {
  "smart-routing": { label: "Success-first routing", threshold: "85", owner: "Payments Ops" },
  "upi-intent": { label: "Intent retry booster", threshold: "70", owner: "Growth Team" },
  tokenization: { label: "Token reuse policy", threshold: "90", owner: "Risk Team" },
}

const vasGroups = [
  { id: "core", title: "Checkout optimization", itemIds: ["smart-routing", "upi-intent"] },
  { id: "experience", title: "Repeat payment experience", itemIds: ["tokenization"] },
] as const

const statusBadge: Record<string, string> = {
  success: "bg-success/20 text-foreground border-success/35",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-warning/20 text-foreground border-warning/30",
}

function parseInr(value: string) {
  return Number(value.replace(/[^\d.-]/g, ""))
}

export function OnlinePaymentsContent({
  initialSection,
  onboardingFeature,
}: {
  initialSection?: NavSection
  onboardingFeature?: ProductOnboardingFeature | null
} = {}) {
  const showInternalBack = initialSection !== undefined
  const [navSection, setNavSection] = useState<NavSection>(initialSection ?? "overview")
  const [section, setSection] = useState<SectionKey>("overview")
  const [overviewCustomizeOpen, setOverviewCustomizeOpen] = useState(false)
  const [rightContext, setRightContext] = useState<RightContext>(null)
  const [vasItems, setVasItems] = useState<VasItem[]>(defaultVasItems)
  const [vasConfigById, setVasConfigById] = useState<Record<string, VasConfig>>(defaultVasConfig)
  const [vasPreferences, setVasPreferences] = useState({
    dailyDigest: true,
    anomalyAlerts: true,
    autoRollout: false,
  })
  const [checkoutConfig, setCheckoutConfig] = useState<CheckoutConfig>({
    brandName: "Acme Commerce",
    checkoutDomain: "pay.acme.com",
    supportEmail: "payments@acme.com",
    accentColor: "#1f6f4a",
    showPineLabsBranding: false,
    guestCheckout: true,
    saveCards: true,
    failureFallback: true,
    surchargeControl: false,
    settlementAlerts: true,
  })
  const [configSaveState, setConfigSaveState] = useState<"idle" | "saving" | "saved">("idle")
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile")
  const [onboardingProgress, setOnboardingProgress] = useState<ProductOnboardingProgress | null>(null)

  const updateCheckoutConfig = (updater: (current: CheckoutConfig) => CheckoutConfig) => {
    setCheckoutConfig((current) => updater(current))
    setConfigSaveState("idle")
  }

  useEffect(() => {
    if (navSection !== "configurations" || !onboardingFeature) return
    setOnboardingProgress(markOnboardingStarted(onboardingFeature, 4))
  }, [navSection, onboardingFeature])

  const handleSaveConfiguration = () => {
    setConfigSaveState("saving")
    window.setTimeout(() => {
      setConfigSaveState("saved")
      if (onboardingFeature) {
        setOnboardingProgress(advanceOnboardingProgress(onboardingFeature, 1))
      }
    }, 500)
  }

  const filteredTxns = useMemo(
    () =>
      recentTxns
        .filter((txn) => {
          if (section === "overview") return true
          if (section === "upi") return txn.method === "UPI"
          if (section === "cards") return txn.method === "Card"
          if (section === "emi") return txn.method === "EMI"
          if (section === "wallets") return txn.method === "Wallet"
          return true
        }),
    [section],
  )
  const sectionSeries = useMemo(
    () =>
      section === "cards"
        ? weeklyData.map((item) => item.cards)
        : section === "emi"
          ? weeklyData.map((item) => item.emi)
          : section === "wallets"
            ? weeklyData.map((item) => item.wallets)
            : weeklyData.map((item) => item.upi),
    [section]
  )
  const aggregateSeries = useMemo(
    () => weeklyData.map((item) => item.upi + item.cards + item.emi + item.wallets),
    []
  )
  const selectedMethod = section === "overview" ? null : methods.find((item) => item.key === section)
  const successCount = filteredTxns.filter((txn) => txn.status === "success").length
  const failedAndPendingCount = filteredTxns.filter((txn) => txn.status !== "success").length
  const processedValue = filteredTxns.reduce((total, txn) => total + txn.amount, 0)
  const averageTicket = filteredTxns.length ? Math.round(processedValue / filteredTxns.length) : 0
  const successRate = filteredTxns.length ? (successCount / filteredTxns.length) * 100 : 0
  const processingSettlements = settlementRows.filter((row) => row.state !== "Completed").length
  const configuredProducts =
    section === "overview"
      ? methods.map((item) => item.label)
      : selectedMethod
        ? [selectedMethod.label]
        : ["UPI"]
  const overviewWidgets = useMemo<AnalyticsWidget[]>(
    () => [
      {
        id: "processed-value",
        title: "Processed value",
        value: `₹${processedValue.toLocaleString("en-MY")}`,
        delta: `${section === "overview" ? "All methods" : selectedMethod?.label ?? "UPI"} scope`,
        hint: "Settled and authorized flow",
        chart: section === "overview" ? aggregateSeries : sectionSeries,
        compareChart: (section === "overview" ? aggregateSeries : sectionSeries).map((point) =>
          Number((point * 0.92).toFixed(2))
        ),
        defaultWidth: "wide",
      },
      {
        id: "txn-volume",
        title: "Total transactions",
        value: `${filteredTxns.length}`,
        delta: `${successCount} successful`,
        hint: "Captured in selected date range",
        chart: (section === "overview" ? aggregateSeries : sectionSeries).map((point) =>
          Number((point * 1.28).toFixed(2))
        ),
      },
      {
        id: "success-rate",
        title: "Success rate",
        value: `${successRate.toFixed(1)}%`,
        delta: `${failedAndPendingCount} need attention`,
        hint: "Includes gateway retries",
        chart: [95.4, 95.9, 96.2, 96.3, 96.6, 96.7, Number(successRate.toFixed(1))],
        compareChart: [94.8, 95.1, 95.5, 95.8, 96.0, 96.1, Number((successRate - 0.7).toFixed(1))],
      },
      {
        id: "avg-ticket",
        title: "Average ticket",
        value: `₹${averageTicket.toLocaleString("en-MY")}`,
        delta: section === "overview" ? "Blended ticket size" : `${selectedMethod?.label ?? "UPI"} ticket size`,
        hint: "Useful for pricing and incentives",
        chart: [750, 790, 810, 845, 880, 910, averageTicket || 880],
      },
      {
        id: "method-share",
        title: section === "overview" ? "Top method share" : `${selectedMethod?.label ?? "UPI"} share`,
        value: section === "overview" ? "42%" : `${selectedMethod?.share ?? 42}%`,
        delta: section === "overview" ? "UPI is leading this period" : "Of online processed value",
        hint: "Payment mix insight",
        chart: [34, 36, 37, 39, 40, 41, section === "overview" ? 42 : selectedMethod?.share ?? 42],
      },
      {
        id: "settlement-readiness",
        title: "Settlement readiness",
        value: `${Math.max(0, settlementRows.length - processingSettlements)}/${settlementRows.length}`,
        delta: processingSettlements ? `${processingSettlements} batches in progress` : "All batches clear",
        hint: "Operational risk watch",
        chart: [88, 89, 91, 93, 95, 96, processingSettlements ? 94 : 97],
      },
    ],
    [
      aggregateSeries,
      averageTicket,
      failedAndPendingCount,
      filteredTxns.length,
      processedValue,
      processingSettlements,
      section,
      sectionSeries,
      selectedMethod?.label,
      selectedMethod?.share,
      successCount,
      successRate,
    ]
  )

  const selectedTxn =
    rightContext?.kind === "transaction"
      ? recentTxns.find((txn) => txn.id === rightContext.id) || null
      : null
  const selectedVas = rightContext?.kind === "vas" ? vasItems.find((item) => item.id === rightContext.id) ?? null : null
  const selectedVasConfig = selectedVas ? vasConfigById[selectedVas.id] : null

  const volumeOptions = {
    chart: { type: "column" },
    xAxis: { categories: weeklyData.map((item) => item.day) },
    yAxis: { labels: { format: "{value}" } },
    tooltip: { shared: true },
    plotOptions: {
      column: { stacking: "normal" as const },
    },
    series: [
      { type: "column", data: weeklyData.map((item) => item.upi), name: "UPI", color: "var(--color-primary)" },
      { type: "column", data: weeklyData.map((item) => item.cards), name: "Cards", color: "var(--color-chart-2)" },
      { type: "column", data: weeklyData.map((item) => item.emi), name: "EMI", color: "var(--color-chart-4)" },
      { type: "column", data: weeklyData.map((item) => item.wallets), name: "Wallets", color: "var(--color-chart-3)" },
    ],
  } as const

  const transactionColumns: DataTableColumn<(typeof recentTxns)[number]>[] = [
    { id: "id", header: "ID", accessorKey: "id", width: 120, pinnable: true },
    { id: "merchant", header: "Merchant", accessorKey: "merchant", width: 180 },
    {
      id: "method",
      header: "Method",
      accessorKey: "method",
      filterOptions: methods.map((method) => ({ label: method.label, value: method.label })),
      width: 110,
    },
    { id: "label", header: "Instrument", accessorKey: "label", width: 150 },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      filterOptions: [
        { label: "Success", value: "success" },
        { label: "Pending", value: "pending" },
        { label: "Failed", value: "failed" },
      ],
      width: 110,
      cell: (txn) => (
        <Badge variant="outline" className={`text-[10px] capitalize ${statusBadge[txn.status]}`}>
          {txn.status}
        </Badge>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      getValue: (txn) => txn.amount,
      align: "right",
      width: 120,
      cell: (txn) => <span className="font-medium tabular-nums">₹{txn.amount.toLocaleString("en-MY")}</span>,
    },
    { id: "time", header: "Time", accessorKey: "time", width: 90, align: "right" },
  ]

  const settlementColumns: DataTableColumn<(typeof settlementRows)[number]>[] = [
    { id: "id", header: "Batch", accessorKey: "id", width: 120, pinnable: true },
    { id: "title", header: "Settlement", accessorKey: "title", width: 220 },
    {
      id: "state",
      header: "State",
      accessorKey: "state",
      filterOptions: [
        { label: "Completed", value: "Completed" },
        { label: "Processing", value: "Processing" },
        { label: "Needs action", value: "Needs action" },
      ],
      width: 130,
    },
    { id: "amount", header: "Amount", accessorKey: "amount", align: "right", width: 120 },
  ]

  const disputeColumns: DataTableColumn<(typeof disputeRows)[number]>[] = [
    { id: "id", header: "Dispute ID", accessorKey: "id", width: 120, pinnable: true },
    { id: "state", header: "Status", accessorKey: "state", width: 220 },
    { id: "amount", header: "Amount", accessorKey: "amount", align: "right", width: 120 },
  ]

  const refundColumns: DataTableColumn<(typeof refundRows)[number]>[] = [
    { id: "id", header: "Refund ID", accessorKey: "id", width: 120, pinnable: true },
    { id: "state", header: "State", accessorKey: "state", width: 220 },
    { id: "amount", header: "Amount", accessorKey: "amount", align: "right", width: 120 },
  ]

  const reportColumns: DataTableColumn<(typeof reportRows)[number]>[] = [
    { id: "id", header: "Report ID", accessorKey: "id", width: 120, pinnable: true },
    { id: "title", header: "Report", accessorKey: "title", width: 260 },
    { id: "cadence", header: "Cadence", accessorKey: "cadence", width: 120 },
    { id: "owner", header: "Owner", accessorKey: "owner", width: 140 },
  ]

  const leftContext = (
    <ProductWorkspaceNav
      title="Checkout"
      value={navSection}
      showConfigurations
      configurationsLabel="Configuration"
      onChange={(nextSection) => {
        setNavSection(nextSection)
        setRightContext(null)
      }}
    />
  )

  const transactionsList = (
    <DataTable
      data={filteredTxns}
      columns={transactionColumns}
      rowId={(txn) => txn.id}
      selectedRowId={rightContext?.kind === "transaction" ? rightContext.id : null}
      onRowClick={(txn) => setRightContext({ kind: "transaction", id: txn.id })}
      searchPlaceholder="Search transactions..."
      emptyText="No transactions found"
      initialPinnedColumnIds={["id"]}
    />
  )
  const transactionValue = filteredTxns.reduce((sum, txn) => sum + txn.amount, 0)
  const transactionSuccessCount = filteredTxns.filter((txn) => txn.status === "success").length
  const transactionSuccessRate = filteredTxns.length
    ? ((transactionSuccessCount / filteredTxns.length) * 100).toFixed(1)
    : "0.0"
  const settlementProcessingCount = settlementRows.filter((row) => row.state !== "Completed").length
  const disputeExposure = disputeRows.reduce((sum, row) => sum + parseInr(row.amount), 0)
  const refundExposure = refundRows.reduce((sum, row) => sum + parseInr(row.amount), 0)

  const summaryBySection: Partial<Record<NavSection, SectionSummaryMetric[]>> = {
    transactions: [
      { label: "Total transactions", value: `${filteredTxns.length}`, delta: `${transactionSuccessCount} successful` },
      { label: "Processed value", value: `₹${transactionValue.toLocaleString("en-MY")}`, delta: "Selected window" },
      { label: "Success rate", value: `${transactionSuccessRate}%`, delta: "Including retries" },
      { label: "Pending or failed", value: `${filteredTxns.length - transactionSuccessCount}`, delta: "Needs review" },
    ],
    settlements: [
      { label: "Total batches", value: `${settlementRows.length}`, delta: "Current cycle" },
      { label: "In progress", value: `${settlementProcessingCount}`, delta: "Awaiting completion" },
      { label: "Completed", value: `${settlementRows.length - settlementProcessingCount}`, delta: "Settled" },
      {
        label: "Settlement amount",
        value: `₹${settlementRows.reduce((sum, row) => sum + parseInr(row.amount), 0).toLocaleString("en-MY")}`,
        delta: "Across listed batches",
      },
    ],
    disputes: [
      { label: "Open disputes", value: `${disputeRows.length}`, delta: "Requires action" },
      { label: "Total exposure", value: `₹${disputeExposure.toLocaleString("en-MY")}`, delta: "At risk value" },
      { label: "Evidence required", value: `${disputeRows.filter((row) => /evidence/i.test(row.state)).length}`, delta: "High priority" },
    ],
    refunds: [
      { label: "Open refunds", value: `${refundRows.length}`, delta: "Current requests" },
      { label: "Refund value", value: `₹${refundExposure.toLocaleString("en-MY")}`, delta: "Potential payout" },
      { label: "Manual review", value: `${refundRows.filter((row) => /manual/i.test(row.state)).length}`, delta: "Needs operator" },
    ],
    reports: [
      { label: "Scheduled reports", value: `${reportRows.length}`, delta: "Active automations" },
      { label: "Daily cadence", value: `${reportRows.filter((row) => row.cadence === "Daily").length}`, delta: "Runs each day" },
      { label: "Weekly cadence", value: `${reportRows.filter((row) => row.cadence === "Weekly").length}`, delta: "Runs weekly" },
    ],
  }

  const headerTitleBySection: Partial<Record<NavSection, string>> = {
    overview: "Overview",
    configurations: "Configuration",
    transactions: "Transactions",
    settlements: "Settlements",
    disputes: "Disputes",
    refunds: "Refunds",
    reports: "Reports",
    vas: "Value Added Services",
  }

  const headerActionsBySection: Partial<Record<NavSection, React.ReactNode>> = {
    overview: (
      <Button size="sm" className="h-8 text-xs" onClick={() => setOverviewCustomizeOpen(true)}>
        Customize
      </Button>
    ),
    configurations: (
      <>
        <Button asChild variant="outline" size="sm" className="h-8 text-xs">
          <Link href="/settings?module=credentials">Credentials</Link>
        </Button>
        <Button
          size="sm"
          className="h-8 text-xs"
          disabled={configSaveState === "saving"}
          onClick={handleSaveConfiguration}
        >
          {configSaveState === "saving" ? "Saving..." : "Save configuration"}
        </Button>
      </>
    ),
    transactions: (
      <>
        <Button variant="outline" size="sm" className="h-8 text-xs">Export</Button>
        <Button variant="outline" size="sm" className="h-8 text-xs">More actions</Button>
        <Button size="sm" className="h-8 text-xs">Create transaction</Button>
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
        <Button size="sm" className="h-8 text-xs">Resolve dispute</Button>
      </>
    ),
    refunds: (
      <>
        <Button variant="outline" size="sm" className="h-8 text-xs">Export</Button>
        <Button size="sm" className="h-8 text-xs">Initiate refund</Button>
      </>
    ),
    reports: (
      <>
        <Button variant="outline" size="sm" className="h-8 text-xs">Export</Button>
        <Button size="sm" className="h-8 text-xs">Generate report</Button>
      </>
    ),
  }

  const pageHeader = (
    <PageHeader
      title={headerTitleBySection[navSection] ?? "Checkout"}
      subtitle="Checkout"
      actions={headerActionsBySection[navSection]}
      backHref={showInternalBack ? "/online-payments" : undefined}
      backLabel="Back to Checkout"
    />
  )
  const enabledPreviewServices = vasItems.filter((item) => item.enabled).map((item) => item.name)

  const centerMain = (
    <div
      className={`h-full p-4 space-y-4 ${
        navSection === "configurations" ? "overflow-hidden" : "overflow-y-auto"
      }`}
    >
      {navSection === "overview" && (
        <OverviewAnalyticsCanvas
          scopeId="online-payments-overview"
          widgets={overviewWidgets}
          configuredProducts={configuredProducts}
          dateOptions={["Today", "Last 7 days", "Last 30 days", "This quarter"]}
          compareOptions={["Yesterday", "Previous period", "Last week"]}
          showViewOptions={false}
          showConfiguredProductsBadge={false}
          showAutoRefreshControl={false}
          showCustomizeControl={false}
          toolbarSurface="plain"
          customizeOpen={overviewCustomizeOpen}
          onCustomizeOpenChange={setOverviewCustomizeOpen}
        />
      )}

      {navSection === "configurations" && (
        <section className="h-full min-h-0">
          <div className="grid h-full min-h-0 gap-6 xl:grid-cols-2">
            <div className="h-full min-h-0 overflow-y-auto space-y-4 pr-2">
              {onboardingFeature && onboardingProgress && (
                <div className="rounded-lg border border-warning/35 bg-warning/10 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {onboardingFeatureLabel[onboardingFeature]} setup progress
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {onboardingProgress.stepsCompleted}/{onboardingProgress.totalSteps} steps complete
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Save configuration to record progress and continue onboarding.
                      </p>
                    </div>
                    <Badge variant="outline" className="border-warning/35 bg-warning/20 text-[10px] text-foreground">
                      {onboardingProgress.status === "configured" ? "Configured" : "In progress"}
                    </Badge>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-warning transition-all"
                      style={{
                        width: `${Math.max(
                          8,
                          (onboardingProgress.stepsCompleted / Math.max(1, onboardingProgress.totalSteps)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="rounded-lg bg-card/80 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Whitelabel identity</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Brand name</p>
                    <Input
                      value={checkoutConfig.brandName}
                      onChange={(event) => updateCheckoutConfig((current) => ({ ...current, brandName: event.target.value }))}
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Checkout domain</p>
                    <Input
                      value={checkoutConfig.checkoutDomain}
                      onChange={(event) => updateCheckoutConfig((current) => ({ ...current, checkoutDomain: event.target.value }))}
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Support email</p>
                    <Input
                      value={checkoutConfig.supportEmail}
                      onChange={(event) => updateCheckoutConfig((current) => ({ ...current, supportEmail: event.target.value }))}
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Accent token / color</p>
                    <Input
                      value={checkoutConfig.accentColor}
                      onChange={(event) => updateCheckoutConfig((current) => ({ ...current, accentColor: event.target.value }))}
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="mt-3 rounded-lg border border-border px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">Hide Pine Labs branding</p>
                    <Switch
                      checked={!checkoutConfig.showPineLabsBranding}
                      onCheckedChange={(checked) =>
                        updateCheckoutConfig((current) => ({ ...current, showPineLabsBranding: !checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-card/80 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Checkout controls</p>
                <div className="mt-3 divide-y divide-border rounded-lg border border-border overflow-hidden">
                  {[
                    { key: "guestCheckout", label: "Guest checkout" },
                    { key: "saveCards", label: "Saved cards" },
                    { key: "failureFallback", label: "Failure fallback" },
                    { key: "surchargeControl", label: "Surcharge control" },
                    { key: "settlementAlerts", label: "Settlement alerts" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-3 px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <Switch
                        checked={checkoutConfig[item.key as keyof CheckoutConfig] as boolean}
                        onCheckedChange={(checked) =>
                          updateCheckoutConfig((current) => ({
                            ...current,
                            [item.key]: checked,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-card/80 p-4">
                <div className="space-y-4">
                  {vasGroups.map((group) => {
                    const groupItems = vasItems.filter((item) => group.itemIds.some((groupId) => groupId === item.id))
                    return (
                      <div key={group.id}>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{group.title}</p>
                        <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                          {groupItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                              <p className="text-sm font-medium text-foreground">{item.name}</p>
                              <div className="flex items-center gap-2 shrink-0">
                                {item.requiresConfig && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={() => setRightContext({ kind: "vas", id: item.id })}
                                  >
                                    Configure
                                  </Button>
                                )}
                                <Switch
                                  checked={item.enabled}
                                  onCheckedChange={(checked) => {
                                    setVasItems((current) =>
                                      current.map((entry) => (entry.id === item.id ? { ...entry, enabled: checked } : entry)),
                                    )
                                    setConfigSaveState("idle")
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <aside className="self-start pt-2 xl:sticky xl:top-4">
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/35 p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className={`h-7 w-7 ${previewDevice === "mobile" ? "bg-card text-foreground" : "text-muted-foreground"}`}
                    aria-label="Mobile preview"
                    title="Mobile preview"
                    onClick={() => setPreviewDevice("mobile")}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className={`h-7 w-7 ${previewDevice === "desktop" ? "bg-card text-foreground" : "text-muted-foreground"}`}
                    aria-label="Desktop preview"
                    title="Desktop preview"
                    onClick={() => setPreviewDevice("desktop")}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {previewDevice === "mobile" ? (
                <div className="mt-3 flex h-[70vh] min-h-[560px] justify-center">
                  <div className="h-full w-[310px] max-h-full rounded-[2.25rem] border border-border bg-neutral-950 p-2 shadow-xl">
                    <div className="h-full overflow-hidden rounded-[1.9rem] border border-neutral-800 bg-background flex flex-col">
                      <div className="flex justify-center pt-2">
                        <div className="h-5 w-28 rounded-full bg-neutral-900" />
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-foreground">{checkoutConfig.brandName || "Brand name"}</p>
                            <p className="text-[10px] text-muted-foreground">{checkoutConfig.checkoutDomain || "checkout.domain.com"}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {checkoutConfig.showPineLabsBranding ? "Co-branded" : "Whitelabel"}
                          </Badge>
                        </div>
                        <div className="rounded-md border border-border px-3 py-2">
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Order total</p>
                          <p className="mt-0.5 text-base font-semibold text-foreground">₹4,850</p>
                          <p className="text-[10px] text-muted-foreground">Invoice #CHK-20481</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-md border border-border/70 px-2 py-1.5">
                            <p className="text-[10px] text-muted-foreground">Guest checkout</p>
                            <p className="text-xs font-medium text-foreground">{checkoutConfig.guestCheckout ? "Enabled" : "Disabled"}</p>
                          </div>
                          <div className="rounded-md border border-border/70 px-2 py-1.5">
                            <p className="text-[10px] text-muted-foreground">Saved cards</p>
                            <p className="text-xs font-medium text-foreground">{checkoutConfig.saveCards ? "Enabled" : "Disabled"}</p>
                          </div>
                        </div>
                        <div
                          className="h-8 w-full rounded-md text-xs font-semibold text-white flex items-center justify-center"
                          style={{ backgroundColor: checkoutConfig.accentColor || "#1f6f4a" }}
                        >
                          Pay securely
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Enabled services</p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {enabledPreviewServices.length ? (
                              enabledPreviewServices.map((service) => (
                                <Badge key={service} variant="outline" className="text-[10px]">
                                  {service}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-[10px]">No services</Badge>
                            )}
                          </div>
                        </div>
                        <p className="mt-auto text-[10px] text-muted-foreground">Support: {checkoutConfig.supportEmail || "support@merchant.com"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 h-[70vh] min-h-[560px] rounded-xl border border-border bg-background shadow-xl overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-border px-4 py-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                    <div className="ml-2 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground">
                      {(checkoutConfig.checkoutDomain || "checkout.domain.com") + "/checkout"}
                    </div>
                  </div>
                  <div className="p-5 h-[calc(100%-2.5rem)] overflow-hidden">
                    <div className="mx-auto h-full max-w-2xl rounded-lg border border-border bg-card/70 p-4 flex flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{checkoutConfig.brandName || "Brand name"}</p>
                          <p className="text-xs text-muted-foreground">Secure checkout</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {checkoutConfig.showPineLabsBranding ? "Co-branded" : "Whitelabel"}
                        </Badge>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4 flex-1">
                        <div className="space-y-3">
                          <div className="rounded-md border border-border px-3 py-2">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Order total</p>
                            <p className="mt-0.5 text-lg font-semibold text-foreground">₹4,850</p>
                            <p className="text-[10px] text-muted-foreground">Invoice #CHK-20481</p>
                          </div>
                          <div className="rounded-md border border-border px-3 py-2">
                            <p className="text-xs font-medium text-foreground">Customer details</p>
                            <div className="mt-2 space-y-1.5">
                              <div className="h-8 rounded-md border border-border/70 bg-background" />
                              <div className="h-8 rounded-md border border-border/70 bg-background" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="rounded-md border border-border px-3 py-2">
                            <p className="text-xs font-medium text-foreground">Payment methods</p>
                            <div className="mt-2 space-y-1.5">
                              <div className="h-8 rounded-md border border-border/70 bg-background flex items-center px-2 text-[11px] text-foreground">
                                Guest checkout: {checkoutConfig.guestCheckout ? "Enabled" : "Disabled"}
                              </div>
                              <div className="h-8 rounded-md border border-border/70 bg-background flex items-center px-2 text-[11px] text-foreground">
                                Saved cards: {checkoutConfig.saveCards ? "Enabled" : "Disabled"}
                              </div>
                              <div className="h-8 rounded-md border border-border/70 bg-background flex items-center px-2 text-[11px] text-foreground">
                                Failure fallback: {checkoutConfig.failureFallback ? "Enabled" : "Disabled"}
                              </div>
                            </div>
                          </div>
                          <div className="rounded-md border border-border px-3 py-2">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Enabled services</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {enabledPreviewServices.length ? (
                                enabledPreviewServices.map((service) => (
                                  <Badge key={service} variant="outline" className="text-[10px]">
                                    {service}
                                  </Badge>
                                ))
                              ) : (
                                <Badge variant="outline" className="text-[10px]">No services</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        className="mt-4 h-9 w-full rounded-md text-sm font-semibold text-white flex items-center justify-center"
                        style={{ backgroundColor: checkoutConfig.accentColor || "#1f6f4a" }}
                      >
                        Pay securely
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>
      )}

      {navSection === "transactions" && (
        <>
          <SectionSummaryStrip metrics={summaryBySection.transactions ?? []} />
          {transactionsList}
        </>
      )}

      {navSection === "settlements" && (
        <>
          <SectionSummaryStrip metrics={summaryBySection.settlements ?? []} />
          <DataTable
            data={settlementRows}
            columns={settlementColumns}
            rowId={(row) => row.id}
            searchPlaceholder="Search settlements..."
            emptyText="No settlements found"
            initialPinnedColumnIds={["id"]}
            onRowClick={(row) =>
              setRightContext({
                kind: "metric",
                title: row.title,
                description: "Settlement context and actions.",
                value: row.amount,
              })
            }
          />
        </>
      )}

      {navSection === "disputes" && (
        <>
          <SectionSummaryStrip metrics={summaryBySection.disputes ?? []} />
          <DataTable
            data={disputeRows}
            columns={disputeColumns}
            rowId={(row) => row.id}
            searchPlaceholder="Search disputes..."
            emptyText="No disputes found"
            initialPinnedColumnIds={["id"]}
            onRowClick={(row) =>
              setRightContext({
                kind: "metric",
                title: row.id,
                description: "Dispute handling steps and SLA timers.",
                value: row.amount,
              })
            }
          />
        </>
      )}

      {navSection === "reports" && (
        <>
          <SectionSummaryStrip metrics={summaryBySection.reports ?? []} />
          <DataTable
            data={reportRows}
            columns={reportColumns}
            rowId={(row) => row.id}
            searchPlaceholder="Search reports..."
            emptyText="No reports found"
            initialPinnedColumnIds={["id"]}
            onRowClick={(row) =>
              setRightContext({
                kind: "metric",
                title: row.title,
                description: `${row.cadence} report owned by ${row.owner}.`,
                value: row.id,
              })
            }
          />
        </>
      )}

      {navSection === "refunds" && (
        <>
          <SectionSummaryStrip metrics={summaryBySection.refunds ?? []} />
          <DataTable
            data={refundRows}
            columns={refundColumns}
            rowId={(row) => row.id}
            searchPlaceholder="Search refunds..."
            emptyText="No refunds found"
            initialPinnedColumnIds={["id"]}
            onRowClick={(row) =>
              setRightContext({
                kind: "metric",
                title: row.id,
                description: "Refund state, SLA and next actions.",
                value: row.amount,
              })
            }
          />
        </>
      )}

      {navSection === "vas" && (
        <section className="rounded-lg bg-card/80 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Value Added Services</p>
          <div className="space-y-4">
            {vasGroups.map((group) => {
              const groupItems = vasItems.filter((item) => group.itemIds.some((groupId) => groupId === item.id))
              return (
                <div key={group.id}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">{group.title}</p>
                  <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                    {groupItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between px-4 py-3 gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.detail}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {item.requiresConfig && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => setRightContext({ kind: "vas", id: item.id })}
                            >
                              Configure
                            </Button>
                          )}
                          <Switch
                            checked={item.enabled}
                            onCheckedChange={(checked) =>
                              setVasItems((current) =>
                                current.map((entry) => (entry.id === item.id ? { ...entry, enabled: checked } : entry)),
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <Separator className="my-4" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Operational preferences</p>
            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
              {[
                {
                  key: "dailyDigest",
                  label: "Daily service summary",
                  desc: "Receive consolidated VAS health and impact metrics daily.",
                },
                {
                  key: "anomalyAlerts",
                  label: "Anomaly alerts",
                  desc: "Notify operations when VAS performance drops below baseline.",
                },
                {
                  key: "autoRollout",
                  label: "Auto rollout",
                  desc: "Auto-enable approved VAS on newly onboarded merchants.",
                },
              ].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{pref.label}</p>
                    <p className="text-xs text-muted-foreground">{pref.desc}</p>
                  </div>
                  <Switch
                    checked={vasPreferences[pref.key as keyof typeof vasPreferences]}
                    onCheckedChange={(checked) =>
                      setVasPreferences((current) => ({ ...current, [pref.key]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )

  const rightPane = selectedTxn ? (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Transaction</p>
          <h3 className="text-[16px] font-semibold text-foreground">Transaction detail</h3>
        </div>
        <Button variant="ghost" size="icon-sm" className="h-8 w-8" aria-label="Close transaction panel" onClick={() => setRightContext(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <div className="space-y-5 p-6">
        <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xl font-semibold text-foreground">₹{selectedTxn.amount.toLocaleString("en-MY")}</p>
          <p className="text-sm text-muted-foreground">{selectedTxn.merchant}</p>
          <Badge variant="outline" className={`mt-1 text-xs ${statusBadge[selectedTxn.status]}`}>
            {selectedTxn.status}
          </Badge>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        {[
          ["Transaction ID", selectedTxn.id],
          ["Method", `${selectedTxn.method} · ${selectedTxn.label}`],
          ["Time", selectedTxn.time],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-xs font-medium text-foreground">{value}</span>
          </div>
        ))}
      </div>

        <div className="space-y-2">
          <Button className="w-full">Primary action</Button>
          <Button variant="outline" className="w-full">View receipt</Button>
        </div>
      </div>
    </div>
  ) : rightContext?.kind === "metric" ? (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Insight</p>
          <h3 className="text-[16px] font-semibold text-foreground">{rightContext.title}</h3>
        </div>
        <Button variant="ghost" size="icon-sm" className="h-8 w-8" aria-label="Close insight panel" onClick={() => setRightContext(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <div className="space-y-5 p-6">
      <div>
        <p className="text-xs text-muted-foreground">Current value</p>
        <p className="text-[20px] font-semibold text-foreground">{rightContext.value}</p>
      </div>
      <Separator />
      <div>
        <p className="text-xs text-muted-foreground">Why it matters</p>
        <p className="text-sm text-foreground">{rightContext.description}</p>
      </div>
      <div className="space-y-2">
        <Button className="w-full">Run optimization</Button>
        <Button variant="outline" className="w-full" onClick={() => setRightContext(null)}>
          Close
        </Button>
      </div>
      </div>
    </div>
  ) : selectedVas ? (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Value-added service</p>
          <h3 className="text-[16px] font-semibold text-foreground">{selectedVas.name}</h3>
        </div>
        <Button variant="ghost" size="icon-sm" className="h-8 w-8" aria-label="Close value-added service panel" onClick={() => setRightContext(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <div className="space-y-5 p-6">
        <p className="text-sm leading-relaxed text-muted-foreground">{selectedVas.detail}</p>
        {selectedVasConfig && (
          <div className="space-y-3 rounded-md olive-surface-chip p-3">
            <div>
              <p className="text-xs text-muted-foreground">Configuration label</p>
              <Input
                value={selectedVasConfig.label}
                onChange={(event) =>
                  setVasConfigById((current) => ({
                    ...current,
                    [selectedVas.id]: { ...current[selectedVas.id], label: event.target.value },
                  }))
                }
                className="mt-1 h-8 bg-background/50 text-xs"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Automation threshold (%)</p>
              <Input
                value={selectedVasConfig.threshold}
                onChange={(event) =>
                  setVasConfigById((current) => ({
                    ...current,
                    [selectedVas.id]: { ...current[selectedVas.id], threshold: event.target.value },
                  }))
                }
                className="mt-1 h-8 bg-background/50 text-xs"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Owner team</p>
              <Input
                value={selectedVasConfig.owner}
                onChange={(event) =>
                  setVasConfigById((current) => ({
                    ...current,
                    [selectedVas.id]: { ...current[selectedVas.id], owner: event.target.value },
                  }))
                }
                className="mt-1 h-8 bg-background/50 text-xs"
              />
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Button
            className="w-full"
            variant={selectedVas.enabled ? "secondary" : "default"}
            onClick={() =>
              setVasItems((current) =>
                current.map((entry) => (entry.id === selectedVas.id ? { ...entry, enabled: !entry.enabled } : entry)),
              )
            }
          >
            {selectedVas.enabled ? "Disable service" : "Enable service"}
          </Button>
          <Button variant="default" className="w-full" onClick={() => setRightContext(null)}>
            Save details
          </Button>
          <Button variant="outline" className="w-full" onClick={() => setRightContext(null)}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      {pageHeader}
      <WorkspaceShell
        leftContext={leftContext}
        showLeftContext={false}
        centerMain={centerMain}
        rightContext={rightPane}
        showRightContext={Boolean(rightContext)}
        leftWidth={260}
        leftMaxWidth={300}
      />
    </>
  )
}
