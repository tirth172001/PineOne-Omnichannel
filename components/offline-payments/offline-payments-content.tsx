"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, MoreVertical, Settings, Smartphone, Wifi, WifiOff, X, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { PanelEmpty, PageHeader } from "@/components/ui/panels"
import { HighchartsPanelChart } from "@/components/ui/highcharts"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { ProductWorkspaceNav, type ProductWorkspaceSection } from "@/components/dashboard/product-workspace-nav"
import { OverviewAnalyticsCanvas, type AnalyticsWidget } from "@/components/dashboard/overview-analytics-canvas"
import { SectionSummaryStrip, type SectionSummaryMetric } from "@/components/dashboard/section-summary-strip"
type DeviceSegment = "all" | "a920-pro" | "p2-lite" | "a80" | "offline"
type TransactionMethodView = "all" | "Tap" | "Chip" | "Swipe"
type OfflineNavSection = ProductWorkspaceSection
type DeviceRow = {
  id: string
  hardwareId: string
  hardwareModel: string
  posId: string
  storeName: string
  storeAddress: string
  installationDate: string
  mode: "Standalone" | "Linked"
  name: string
  location: string
  status: "online" | "offline"
  today: string
  txns: number
  model: "A920 Pro" | "P2 Lite" | "A80"
  lastSeen: string
}
type VasItem = { id: string; name: string; detail: string; enabled: boolean; requiresConfig: boolean }
type VasConfig = { label: string; rollout: string; owner: string }
type TableDetail = {
  title: string
  description: string
  value: string
  rows: Array<{ label: string; value: string }>
}

const initialDevices: DeviceRow[] = [
  { id: "POS-001", hardwareId: "000001367160", hardwareModel: "Touch | A920", posId: "2569863", storeName: "PINE LABS LIMITED NOIDA KIOSK", storeAddress: "PineLabs, Candor TechSpace, Noida", installationDate: "17 Oct, 2023", mode: "Standalone", name: "Counter 1", location: "Main Floor", status: "online", today: "₹82,400", txns: 68, model: "A920 Pro", lastSeen: "Now" },
  { id: "POS-002", hardwareId: "000001374921", hardwareModel: "Touch | A910", posId: "2569824", storeName: "PINE LABS LIMITED NOIDA KIOSK", storeAddress: "PineLabs, Candor TechSpace, Noida", installationDate: "17 Oct, 2023", mode: "Standalone", name: "Counter 2", location: "Main Floor", status: "online", today: "₹71,200", txns: 59, model: "A920 Pro", lastSeen: "1 min ago" },
  { id: "POS-003", hardwareId: "000001572835", hardwareModel: "Touch | A910", posId: "2569826", storeName: "PINE LABS LIMITED NOIDA KIOSK", storeAddress: "PineLabs, Candor TechSpace, Noida", installationDate: "17 Oct, 2023", mode: "Standalone", name: "Counter 3", location: "Main Floor", status: "online", today: "₹65,800", txns: 54, model: "A920 Pro", lastSeen: "3 min ago" },
  { id: "POS-004", hardwareId: "000001572836", hardwareModel: "Touch | A910", posId: "2569825", storeName: "PINE LABS LIMITED NOIDA KIOSK", storeAddress: "PineLabs, Candor TechSpace, Noida", installationDate: "17 Oct, 2023", mode: "Standalone", name: "Billing Desk", location: "Ground Floor", status: "online", today: "₹54,300", txns: 45, model: "P2 Lite", lastSeen: "2 min ago" },
  { id: "POS-005", hardwareId: "000002217053", hardwareModel: "Go | A50", posId: "2574976", storeName: "HARISH AMDOSKAR", storeAddress: "Room No 10, Shree Omkar CHS", installationDate: "17 Oct, 2023", mode: "Standalone", name: "Express Lane", location: "Ground Floor", status: "offline", today: "₹0", txns: 0, model: "A920 Pro", lastSeen: "2 hr ago" },
  { id: "POS-006", hardwareId: "000002217678", hardwareModel: "Go | A50", posId: "2575005", storeName: "KIRAN KUMAR ERUKALA 11221", storeAddress: "18-03-189 Vidhya Nagar, Hyderabad", installationDate: "17 Oct, 2023", mode: "Standalone", name: "Food Court", location: "First Floor", status: "online", today: "₹48,100", txns: 39, model: "A80", lastSeen: "Now" },
  { id: "POS-007", hardwareId: "000002825779", hardwareModel: "Go | A50", posId: "1709397", storeName: "MAITRIKKUMAR SANJAYKUMAR", storeAddress: "PineLabs Pvt Ltd, Office North", installationDate: "10 Feb, 2022", mode: "Standalone", name: "Electronics", location: "First Floor", status: "online", today: "₹92,000", txns: 62, model: "A920 Pro", lastSeen: "Now" },
  { id: "POS-008", hardwareId: "000002944210", hardwareModel: "Touch | A920", posId: "2581108", storeName: "BANGALORE RETAIL HUB", storeAddress: "Old Airport Road, Bengaluru", installationDate: "12 Dec, 2023", mode: "Standalone", name: "Mobile Dept", location: "First Floor", status: "online", today: "₹45,600", txns: 37, model: "P2 Lite", lastSeen: "5 min ago" },
  { id: "POS-009", hardwareId: "000003112278", hardwareModel: "Duo | A80", posId: "2581129", storeName: "PINE CASH & CARRY", storeAddress: "MG Road, Bengaluru", installationDate: "05 Nov, 2023", mode: "Standalone", name: "Customer Svc", location: "Entry", status: "offline", today: "₹0", txns: 0, model: "A80", lastSeen: "46 min ago" },
  { id: "POS-010", hardwareId: "000003118456", hardwareModel: "Go | A50", posId: "2581194", storeName: "WAREHOUSE COLLECTION POINT", storeAddress: "Electronic City, Bengaluru", installationDate: "21 Jan, 2024", mode: "Standalone", name: "Warehouse", location: "Basement", status: "online", today: "₹11,600", txns: 10, model: "P2 Lite", lastSeen: "14 min ago" },
]

const offlineTransactionRows = [
  { id: "TXN-89012", device: "POS-001", amount: "₹2,450", method: "Tap", status: "Success", time: "11:42 AM", location: "Main Floor" },
  { id: "TXN-89011", device: "POS-004", amount: "₹850", method: "Chip", status: "Success", time: "11:39 AM", location: "Ground Floor" },
  { id: "TXN-89010", device: "POS-007", amount: "₹5,200", method: "Tap", status: "Success", time: "11:30 AM", location: "First Floor" },
  { id: "TXN-89009", device: "POS-005", amount: "₹1,100", method: "Swipe", status: "Failed", time: "11:18 AM", location: "Ground Floor" },
  { id: "TXN-89008", device: "POS-006", amount: "₹3,300", method: "Tap", status: "Success", time: "11:05 AM", location: "First Floor" },
]

const weeklyData = [
  { day: "Mon", tap: 127, chip: 76, swipe: 42 },
  { day: "Tue", tap: 145, chip: 86, swipe: 47 },
  { day: "Wed", tap: 124, chip: 74, swipe: 40 },
  { day: "Thu", tap: 162, chip: 97, swipe: 53 },
  { day: "Fri", tap: 150, chip: 90, swipe: 49 },
  { day: "Sat", tap: 101, chip: 61, swipe: 33 },
  { day: "Sun", tap: 87, chip: 52, swipe: 29 },
]

function parseInr(value: string) {
  return Number(value.replace(/[^\d.-]/g, ""))
}

const deviceTxns = [
  { id: "TXN-D201", amount: 2450, method: "Tap", status: "success", time: "4m ago", card: "Visa •• 8832" },
  { id: "TXN-D200", amount: 850, method: "Chip", status: "success", time: "12m ago", card: "RuPay •• 4521" },
  { id: "TXN-D199", amount: 5200, method: "Tap", status: "success", time: "25m ago", card: "MC •• 2291" },
  { id: "TXN-D198", amount: 1100, method: "Swipe", status: "failed", time: "38m ago", card: "Visa •• 1100" },
  { id: "TXN-D197", amount: 3300, method: "Tap", status: "success", time: "52m ago", card: "Amex •• 3388" },
]

const settlementRows = [
  { id: "STL-901", title: "Today's settlement", amount: "₹1,12,300", state: "Completed" },
  { id: "STL-900", title: "Pending reconciliation", amount: "₹23,400", state: "Processing" },
  { id: "STL-899", title: "Holdback reserve", amount: "₹9,800", state: "Review" },
]

const disputeRows = [
  { id: "DSP-112", state: "Chargeback requested", amount: "₹2,300" },
  { id: "DSP-109", state: "Waiting for evidence", amount: "₹5,900" },
]

const refundRows = [
  { id: "RFD-611", state: "POS refund approved", amount: "₹780" },
  { id: "RFD-603", state: "Pending manager review", amount: "₹2,240" },
]

const reportRows = [
  { id: "RPT-301", title: "Terminal uptime report", cadence: "Daily", owner: "Terminal Ops" },
  { id: "RPT-302", title: "Card mode mix report", cadence: "Weekly", owner: "Store Ops" },
  { id: "RPT-303", title: "Offline settlement report", cadence: "Daily", owner: "Finance Ops" },
]

const defaultVasItems: VasItem[] = [
  { id: "amex-enable", name: "AMEX acceptance", detail: "Enable American Express card acceptance across terminals.", enabled: false, requiresConfig: true },
  { id: "dcc", name: "Dynamic currency conversion", detail: "Offer FX conversion at terminal for international cards.", enabled: true, requiresConfig: true },
  { id: "smart-tipping", name: "Smart tipping", detail: "Preset tip suggestions by merchant category and shift.", enabled: false, requiresConfig: false },
]

const defaultVasConfig: Record<string, VasConfig> = {
  "amex-enable": { label: "AMEX acquiring setup", rollout: "40", owner: "Terminal Ops" },
  dcc: { label: "DCC by corridor", rollout: "25", owner: "Compliance Team" },
  "smart-tipping": { label: "Tip prompts", rollout: "100", owner: "Store Ops" },
}

const vasGroups = [
  { id: "acceptance", title: "Card and currency acceptance", itemIds: ["amex-enable", "dcc"] },
  { id: "experience", title: "In-store experience", itemIds: ["smart-tipping"] },
] as const

function DeviceDetail({ device }: { device: DeviceRow }) {
  const online = device.status === "online"
  return (
    <div className="p-5 space-y-5">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ${online ? "bg-success/10" : "bg-muted"}`}>
          {online ? <Wifi className="h-6 w-6 text-success" /> : <WifiOff className="h-6 w-6 text-muted-foreground" />}
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold text-foreground">{device.name}</p>
          <p className="text-sm text-muted-foreground">{device.location} · {device.model}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant="outline" className={`text-xs gap-1 ${online ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}`}>
              {online ? <><span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />Online</> : "Offline"}
            </Badge>
            <Badge variant="outline" className="text-xs text-muted-foreground">{device.id}</Badge>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs shrink-0">
          <Settings className="h-3.5 w-3.5" />Configure
        </Button>
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Today's Revenue", v: device.today },
          { l: "Transactions", v: `${device.txns}` },
          { l: "Success Rate", v: online ? "98.4%" : "—" },
        ].map(s => (
          <div key={s.l} className="bg-muted/40 rounded-lg px-3 py-2.5 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">{s.l}</p>
            <p className="text-sm font-bold text-foreground">{s.v}</p>
          </div>
        ))}
      </div>

      {!online && (
        <div className="flex items-start gap-2.5 rounded-lg bg-warning/10 px-3 py-3">
          <WifiOff className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning-foreground">Device Offline</p>
            <p className="text-xs text-warning-foreground/80 mt-0.5">Check network connectivity and power supply. Last seen 2 hours ago.</p>
            <Button size="sm" className="mt-2 h-7 text-xs gap-1">Ping Device</Button>
          </div>
        </div>
      )}

      {online && (
        <>
          <Separator />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Recent Transactions</p>
            <div className="space-y-2">
              {deviceTxns.map(t => {
                const success = t.status === "success"
                return (
                  <div key={t.id} className="flex items-center gap-3 py-2">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-md shrink-0 ${success ? "bg-success/10" : "bg-destructive/10"}`}>
                      {success ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{t.card}</p>
                      <p className="text-[10px] text-muted-foreground">{t.method} · {t.time}</p>
                    </div>
                    <p className="text-xs font-semibold text-foreground">₹{t.amount.toLocaleString("en-IN")}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function mapInitialModelToSegment(model?: string): DeviceSegment {
  const normalized = model?.trim().toLowerCase()
  if (!normalized) return "all"
  if (normalized === "a891") return "a920-pro"
  if (normalized === "mini") return "p2-lite"
  if (normalized === "go" || normalized === "duo" || normalized === "voice-pod") return "a80"
  return "all"
}

export function OfflinePaymentsContent({
  initialSection,
  initialModel,
}: {
  initialSection?: OfflineNavSection
  initialModel?: string
} = {}) {
  const showInternalBack = initialSection !== undefined
  const [navSection, setNavSection] = useState<OfflineNavSection>(initialSection ?? "overview")
  const [overviewCustomizeOpen, setOverviewCustomizeOpen] = useState(false)
  const [deviceRows, setDeviceRows] = useState<DeviceRow[]>(initialDevices)
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([])
  const deviceSegment = mapInitialModelToSegment(initialModel)
  const [transactionView, setTransactionView] = useState<TransactionMethodView>("all")
  const [rightTab, setRightTab] = useState<"detail" | "analytics" | "add-device">("detail")
  const [selectedTableDetail, setSelectedTableDetail] = useState<TableDetail | null>(null)
  const [newDeviceForm, setNewDeviceForm] = useState({
    name: "",
    location: "",
    model: "A920 Pro" as DeviceRow["model"],
    status: "online" as DeviceRow["status"],
  })
  const [vasItems, setVasItems] = useState<VasItem[]>(defaultVasItems)
  const [selectedVasId, setSelectedVasId] = useState<string | null>(null)
  const [vasConfigById, setVasConfigById] = useState<Record<string, VasConfig>>(defaultVasConfig)
  const [vasPreferences, setVasPreferences] = useState({
    offlineAlerts: true,
    nightRollout: false,
    dailyDigest: true,
  })
  const selectedDevice = deviceRows.find((d) => d.id === selected)
  const selectedVas = vasItems.find((item) => item.id === selectedVasId) ?? null
  const selectedVasConfig = selectedVas ? vasConfigById[selectedVas.id] : null
  const filteredOfflineTransactions = useMemo(
    () =>
      offlineTransactionRows.filter((row) => {
        if (transactionView === "all") return true
        return row.method === transactionView
      }),
    [transactionView]
  )

  useEffect(() => {
    setSelectedTableDetail(null)
    if (navSection !== "manage-devices") {
      setSelected(null)
    }
  }, [navSection])
  const paymentModeSeries = useMemo(
    () =>
      transactionView === "Chip"
        ? weeklyData.map((d) => d.chip)
        : transactionView === "Swipe"
          ? weeklyData.map((d) => d.swipe)
          : transactionView === "Tap"
            ? weeklyData.map((d) => d.tap)
            : weeklyData.map((d) => d.tap + d.chip + d.swipe),
    [transactionView]
  )
  const filteredDevices = deviceRows
    .filter((d) => {
      if (deviceSegment === "all") return true
      if (deviceSegment === "offline") return d.status === "offline"
      if (deviceSegment === "a920-pro") return d.model === "A920 Pro"
      if (deviceSegment === "p2-lite") return d.model === "P2 Lite"
      if (deviceSegment === "a80") return d.model === "A80"
      return true
    })
  useEffect(() => {
    const validDeviceIds = new Set(filteredDevices.map((device) => device.id))
    setSelectedDeviceIds((current) => current.filter((id) => validDeviceIds.has(id)))
  }, [filteredDevices])
  const allFilteredSelected =
    filteredDevices.length > 0 && filteredDevices.every((device) => selectedDeviceIds.includes(device.id))
  const onlineCount = deviceRows.filter((d) => d.status === "online").length
  const offlineCount = deviceRows.length - onlineCount
  const successOfflineCount = filteredOfflineTransactions.filter((row) => row.status === "Success").length
  const totalOfflineValue = filteredOfflineTransactions.reduce((sum, row) => sum + parseInr(row.amount), 0)
  const offlineSuccessRate = filteredOfflineTransactions.length
    ? (successOfflineCount / filteredOfflineTransactions.length) * 100
    : 0
  const averageOfflineTicket = filteredOfflineTransactions.length
    ? Math.round(totalOfflineValue / filteredOfflineTransactions.length)
    : 0
  const processingSettlementCount = settlementRows.filter((row) => row.state !== "Completed").length
  const offlineWidgets = useMemo<AnalyticsWidget[]>(
    () => [
      {
        id: "offline-processed-value",
        title: "Processed value",
        value: `₹${totalOfflineValue.toLocaleString("en-IN")}`,
        delta: transactionView === "all" ? "All terminal modes" : `${transactionView} mode`,
        hint: "Captured at POS terminals",
        chart: paymentModeSeries,
        compareChart: paymentModeSeries.map((point) => Number((point * 0.9).toFixed(2))),
        defaultWidth: "wide",
      },
      {
        id: "offline-total-transactions",
        title: "Total transactions",
        value: `${filteredOfflineTransactions.length}`,
        delta: `${successOfflineCount} approved`,
        hint: "Transactions for current filters",
        chart: paymentModeSeries.map((point) => Number((point * 1.1).toFixed(2))),
      },
      {
        id: "offline-success-rate",
        title: "Approval rate",
        value: `${offlineSuccessRate.toFixed(1)}%`,
        delta: `${filteredOfflineTransactions.length - successOfflineCount} declined`,
        hint: "Card-present acceptance health",
        chart: [96.3, 96.8, 97.1, 97.3, 97.4, 97.6, Number(offlineSuccessRate.toFixed(1))],
      },
      {
        id: "offline-avg-ticket",
        title: "Average ticket",
        value: `₹${averageOfflineTicket.toLocaleString("en-IN")}`,
        delta: "In-store blended basket",
        hint: "Useful for staffing and campaign slots",
        chart: [1750, 1810, 1890, 1940, 2010, 2080, averageOfflineTicket || 2000],
      },
      {
        id: "offline-terminal-health",
        title: "Terminal health",
        value: `${onlineCount}/${deviceRows.length}`,
        delta: offlineCount ? `${offlineCount} currently offline` : "All terminals online",
        hint: "Live connectivity and uptime",
        chart: [84, 86, 87, 89, 91, 93, offlineCount ? 90 : 95],
      },
      {
        id: "offline-settlement-readiness",
        title: "Settlement readiness",
        value: `${Math.max(0, settlementRows.length - processingSettlementCount)}/${settlementRows.length}`,
        delta: processingSettlementCount ? `${processingSettlementCount} pending action` : "All batches complete",
        hint: "Reconciliation watch",
        chart: [88, 89, 90, 91, 92, 93, processingSettlementCount ? 91 : 95],
      },
    ],
    [
      averageOfflineTicket,
      deviceRows.length,
      filteredOfflineTransactions.length,
      offlineCount,
      offlineSuccessRate,
      onlineCount,
      paymentModeSeries,
      processingSettlementCount,
      successOfflineCount,
      totalOfflineValue,
      transactionView,
    ]
  )
  const configuredOfflineProducts = useMemo(
    () => ["Tap", "Chip", "Swipe", ...Array.from(new Set(deviceRows.map((row) => row.model)))],
    [deviceRows]
  )
  const canCreateDevice = newDeviceForm.name.trim().length > 0 && newDeviceForm.location.trim().length > 0
  const typeOptions = {
    chart: { type: "column" },
    xAxis: { categories: weeklyData.map((d) => d.day) },
    yAxis: { labels: { format: "{value}" } },
    tooltip: { shared: true },
    plotOptions: { column: { stacking: "normal" as const } },
    series: [
      { type: "column", name: "Card Tap", data: weeklyData.map((d) => d.tap), color: "var(--color-primary)" },
      { type: "column", name: "Chip", data: weeklyData.map((d) => d.chip), color: "var(--color-chart-2)" },
      { type: "column", name: "Swipe", data: weeklyData.map((d) => d.swipe), color: "var(--color-chart-3)" },
    ],
  } as const

  const handleCreateDevice = () => {
    if (!canCreateDevice) return
    const nextNumber =
      deviceRows.reduce((max, device) => {
        const numeric = Number(device.id.replace("POS-", ""))
        return Number.isNaN(numeric) ? max : Math.max(max, numeric)
      }, 0) + 1
    const nextDevice: DeviceRow = {
      id: `POS-${String(nextNumber).padStart(3, "0")}`,
      hardwareId: String(300000000000 + nextNumber).padStart(12, "0"),
      hardwareModel:
        newDeviceForm.model === "A920 Pro"
          ? "Touch | A920"
          : newDeviceForm.model === "P2 Lite"
            ? "Go | A50"
            : "Duo | A80",
      posId: String(2580000 + nextNumber),
      storeName: newDeviceForm.name.trim().toUpperCase(),
      storeAddress: `${newDeviceForm.location.trim()}, Bengaluru`,
      installationDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      mode: "Standalone",
      name: newDeviceForm.name.trim(),
      location: newDeviceForm.location.trim(),
      model: newDeviceForm.model,
      status: newDeviceForm.status,
      today: "₹0",
      txns: 0,
      lastSeen: "Now",
    }
    setDeviceRows((current) => [nextDevice, ...current])
    setSelected(nextDevice.id)
    setRightTab("detail")
    setNewDeviceForm({
      name: "",
      location: "",
      model: "A920 Pro",
      status: "online",
    })
  }

  const deviceColumns: DataTableColumn<DeviceRow>[] = [
    {
      id: "select",
      header: allFilteredSelected ? "✓" : "",
      width: 44,
      align: "center",
      searchable: false,
      hideable: false,
      draggable: false,
      pinnable: false,
      cell: (device) => (
        <div className="flex items-center justify-center" onClick={(event) => event.stopPropagation()}>
          <Checkbox
            checked={selectedDeviceIds.includes(device.id)}
            onCheckedChange={(checked) =>
              setSelectedDeviceIds((current) =>
                checked ? Array.from(new Set([...current, device.id])) : current.filter((id) => id !== device.id)
              )
            }
            aria-label={`Select ${device.hardwareId}`}
          />
        </div>
      ),
    },
    {
      id: "hardware",
      header: "Hardware ID / Model",
      width: 260,
      pinnable: true,
      getValue: (device) => device.hardwareId,
      getSearchValue: (device) => `${device.hardwareId} ${device.hardwareModel} ${device.model}`,
      cell: (device) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-muted/40 text-muted-foreground">
            <Smartphone className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{device.hardwareId}</p>
            <p className="truncate text-xs text-muted-foreground">{device.hardwareModel}</p>
          </div>
        </div>
      ),
    },
    {
      id: "posId",
      header: "POS ID",
      accessorKey: "posId",
      width: 110,
    },
    {
      id: "storeName",
      header: "Store Name",
      width: 280,
      getValue: (device) => device.storeName,
      getSearchValue: (device) => `${device.storeName} ${device.storeAddress}`,
      cell: (device) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{device.storeName}</p>
          <p className="truncate text-xs text-muted-foreground">{device.storeAddress}</p>
        </div>
      ),
    },
    {
      id: "installationDate",
      header: "Installation Date",
      accessorKey: "installationDate",
      width: 140,
    },
    {
      id: "mode",
      header: "Mode",
      accessorKey: "mode",
      width: 120,
      filterOptions: [
        { label: "Standalone", value: "Standalone" },
        { label: "Linked", value: "Linked" },
      ],
      cell: (device) => (
        <Badge
          variant="outline"
          className={
            device.mode === "Standalone"
              ? "border-warning/60 bg-warning/20 text-foreground dark:text-warning"
              : "border-primary/35 bg-primary/15 text-foreground dark:text-primary"
          }
        >
          {device.mode}
        </Badge>
      ),
    },
    {
      id: "action",
      header: "Action",
      width: 72,
      align: "center",
      searchable: false,
      hideable: false,
      draggable: false,
      pinnable: false,
      getValue: () => "",
      cell: () => (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="h-7 w-7 rounded-md"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
          aria-label="Open row actions"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  const transactionColumns: DataTableColumn<(typeof offlineTransactionRows)[number]>[] = [
    { id: "id", header: "Transaction", accessorKey: "id", width: 140, pinnable: true },
    { id: "device", header: "Device", accessorKey: "device", width: 110 },
    { id: "location", header: "Location", accessorKey: "location", width: 130 },
    {
      id: "method",
      header: "Method",
      accessorKey: "method",
      width: 100,
      filterOptions: [
        { label: "Tap", value: "Tap" },
        { label: "Chip", value: "Chip" },
        { label: "Swipe", value: "Swipe" },
      ],
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      width: 120,
      filterOptions: [
        { label: "Success", value: "Success" },
        { label: "Failed", value: "Failed" },
      ],
      cell: (transaction) => (
        <Badge
          variant="outline"
          className={
            transaction.status === "Success"
              ? "bg-success/20 text-foreground border-success/35"
              : "bg-destructive/20 text-foreground border-destructive/35"
          }
        >
          {transaction.status}
        </Badge>
      ),
    },
    { id: "amount", header: "Amount", accessorKey: "amount", align: "right", width: 120 },
    { id: "time", header: "Time", accessorKey: "time", align: "right", width: 110 },
  ]

  const settlementColumns: DataTableColumn<(typeof settlementRows)[number]>[] = [
    { id: "id", header: "Batch", accessorKey: "id", width: 110, pinnable: true },
    { id: "title", header: "Settlement", accessorKey: "title", width: 220 },
    {
      id: "state",
      header: "State",
      accessorKey: "state",
      width: 120,
      filterOptions: [
        { label: "Completed", value: "Completed" },
        { label: "Processing", value: "Processing" },
        { label: "Review", value: "Review" },
      ],
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
      title="POS Terminal"
      value={navSection}
      showManageDevices
      onChange={(nextSection) => {
        setNavSection(nextSection)
        setSelected(null)
        setSelectedVasId(null)
        setRightTab("detail")
      }}
    />
  )

  const transactionsAmount = filteredOfflineTransactions.reduce((sum, row) => sum + parseInr(row.amount), 0)
  const successTransactions = filteredOfflineTransactions.filter((row) => row.status === "Success").length
  const settlementInProgress = settlementRows.filter((row) => row.state !== "Completed").length
  const disputeAmount = disputeRows.reduce((sum, row) => sum + parseInr(row.amount), 0)
  const refundAmount = refundRows.reduce((sum, row) => sum + parseInr(row.amount), 0)

  const summaryBySection: Partial<Record<OfflineNavSection, SectionSummaryMetric[]>> = {
    transactions: [
      { label: "Total transactions", value: `${filteredOfflineTransactions.length}`, delta: `${successTransactions} successful` },
      { label: "Processed value", value: `₹${transactionsAmount.toLocaleString("en-IN")}` },
      { label: "Approval rate", value: `${offlineSuccessRate.toFixed(1)}%`, delta: "Card-present flow" },
      { label: "Active terminals", value: `${onlineCount}/${deviceRows.length}`, delta: `${offlineCount} offline` },
    ],
    settlements: [
      { label: "Total batches", value: `${settlementRows.length}`, delta: "Current cycle" },
      { label: "In progress", value: `${settlementInProgress}`, delta: "Awaiting completion" },
      { label: "Completed", value: `${settlementRows.length - settlementInProgress}`, delta: "Reconciled" },
      {
        label: "Settlement amount",
        value: `₹${settlementRows.reduce((sum, row) => sum + parseInr(row.amount), 0).toLocaleString("en-IN")}`,
        delta: "Across listed batches",
      },
    ],
    disputes: [
      { label: "Open disputes", value: `${disputeRows.length}`, delta: "Needs action" },
      { label: "Exposure", value: `₹${disputeAmount.toLocaleString("en-IN")}`, delta: "Disputed amount" },
      { label: "Evidence pending", value: `${disputeRows.filter((row) => /evidence/i.test(row.state)).length}`, delta: "High priority" },
    ],
    refunds: [
      { label: "Open refunds", value: `${refundRows.length}`, delta: "Current queue" },
      { label: "Refund value", value: `₹${refundAmount.toLocaleString("en-IN")}`, delta: "Potential payout" },
      { label: "Manual review", value: `${refundRows.filter((row) => /review/i.test(row.state)).length}`, delta: "Operator needed" },
    ],
    reports: [
      { label: "Scheduled reports", value: `${reportRows.length}`, delta: "Active schedules" },
      { label: "Daily reports", value: `${reportRows.filter((row) => row.cadence === "Daily").length}`, delta: "Run every day" },
      { label: "Weekly reports", value: `${reportRows.filter((row) => row.cadence === "Weekly").length}`, delta: "Run weekly" },
    ],
  }

  const headerTitleBySection: Partial<Record<OfflineNavSection, string>> = {
    overview: "Overview",
    transactions: "Transactions",
    settlements: "Settlements",
    disputes: "Disputes",
    refunds: "Refunds",
    reports: "Reports",
    "manage-devices": "Manage Devices",
    vas: "Value Added Services",
  }

  const headerActionsBySection: Partial<Record<OfflineNavSection, React.ReactNode>> = {
    overview: (
      <Button size="sm" className="h-8 text-xs" onClick={() => setOverviewCustomizeOpen(true)}>
        Customize
      </Button>
    ),
    transactions: (
      <>
        <Button variant="outline" size="sm" className="h-8 text-xs">Export</Button>
        <Button variant="outline" size="sm" className="h-8 text-xs">More actions</Button>
        <Button size="sm" className="h-8 text-xs">Capture payment</Button>
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
        <Button size="sm" className="h-8 text-xs">Issue refund</Button>
      </>
    ),
    reports: (
      <>
        <Button variant="outline" size="sm" className="h-8 text-xs">Export</Button>
        <Button size="sm" className="h-8 text-xs">Generate report</Button>
      </>
    ),
    "manage-devices": (
      <Button
        size="sm"
        className="h-8 text-xs"
        onClick={() => {
          setSelected(null)
          setRightTab("add-device")
        }}
      >
        Add device
      </Button>
    ),
  }

  const pageHeader = (
    <PageHeader
      title={headerTitleBySection[navSection] ?? "In-store payment"}
      subtitle="In-store payment"
      actions={headerActionsBySection[navSection]}
      backHref={showInternalBack ? "/products/in-store-payments" : undefined}
      backLabel="Back to In-store payment"
    />
  )

  const centerMain = (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {navSection === "overview" && (
        <OverviewAnalyticsCanvas
          scopeId="offline-payments-overview"
          widgets={offlineWidgets}
          configuredProducts={configuredOfflineProducts}
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

      {navSection === "transactions" && (
        <>
          <SectionSummaryStrip metrics={summaryBySection.transactions ?? []} />

          <DataTable
            data={filteredOfflineTransactions}
            columns={transactionColumns}
            rowId={(transaction) => transaction.id}
            searchPlaceholder="Search transactions..."
            emptyText="No transactions found"
            initialPinnedColumnIds={["id"]}
            onRowClick={(row) => {
              setSelected(null)
              setSelectedTableDetail({
                title: row.id,
                description: "Transaction detail and operational context.",
                value: row.amount,
                rows: [
                  { label: "Device", value: row.device },
                  { label: "Method", value: row.method },
                  { label: "Status", value: row.status },
                  { label: "Location", value: row.location },
                  { label: "Time", value: row.time },
                ],
              })
              setRightTab("detail")
            }}
          />
        </>
      )}

      {navSection === "manage-devices" && (
        <>
          <div className="grid grid-cols-4 gap-3">
            {[{l:"Total Devices",v:`${deviceRows.length}`},{l:"Online",v:`${onlineCount}`},{l:"Revenue",v:"₹4.71L"},{l:"Alerts",v:"2 Offline"}].map(s => (
              <div key={s.l} className="rounded-lg bg-card/80 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
                <p className="mt-1 text-[15px] font-semibold text-foreground">{s.v}</p>
              </div>
            ))}
          </div>

          <DataTable
            data={filteredDevices}
            columns={deviceColumns}
            rowId={(device) => device.id}
            selectedRowId={selected}
            onRowClick={(device) => {
              setSelected(device.id)
              setSelectedTableDetail(null)
              setRightTab("detail")
            }}
            searchPlaceholder="Search devices..."
            emptyText="No devices found"
            initialPinnedColumnIds={["id"]}
          />
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
            onRowClick={(row) => {
              setSelected(null)
              setSelectedTableDetail({
                title: row.id,
                description: "Settlement detail and payout status.",
                value: row.amount,
                rows: [
                  { label: "Title", value: row.title },
                  { label: "State", value: row.state },
                ],
              })
              setRightTab("detail")
            }}
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
            onRowClick={(row) => {
              setSelected(null)
              setSelectedTableDetail({
                title: row.id,
                description: "Dispute case detail and required actions.",
                value: row.amount,
                rows: [{ label: "Current state", value: row.state }],
              })
              setRightTab("detail")
            }}
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
            onRowClick={(row) => {
              setSelected(null)
              setSelectedTableDetail({
                title: row.id,
                description: "Report configuration and owner context.",
                value: row.title,
                rows: [
                  { label: "Cadence", value: row.cadence },
                  { label: "Owner", value: row.owner },
                ],
              })
              setRightTab("detail")
            }}
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
            onRowClick={(row) => {
              setSelected(null)
              setSelectedTableDetail({
                title: row.id,
                description: "Refund request details and processing context.",
                value: row.amount,
                rows: [{ label: "Current state", value: row.state }],
              })
              setRightTab("detail")
            }}
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
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelectedVasId(item.id)}>
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
                  key: "offlineAlerts",
                  label: "Offline incident alerts",
                  desc: "Notify teams when enabled services fail on terminal clusters.",
                },
                {
                  key: "nightRollout",
                  label: "Night rollout window",
                  desc: "Apply pending VAS changes after business hours.",
                },
                {
                  key: "dailyDigest",
                  label: "Daily health digest",
                  desc: "Send summary of enabled VAS performance by store.",
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

  const rightContextBody = selectedVas ? (
    <div className="p-6 space-y-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Value-added service</p>
        <h4 className="mt-1 text-[18px] font-semibold text-foreground">{selectedVas.name}</h4>
      </div>
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
            <p className="text-xs text-muted-foreground">Rollout (%)</p>
            <Input
              value={selectedVasConfig.rollout}
              onChange={(event) =>
                setVasConfigById((current) => ({
                  ...current,
                  [selectedVas.id]: { ...current[selectedVas.id], rollout: event.target.value },
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
        <Button className="w-full" onClick={() => setSelectedVasId(null)}>Save details</Button>
        <Button variant="outline" className="w-full" onClick={() => setSelectedVasId(null)}>Cancel</Button>
      </div>
    </div>
  ) : rightTab === "add-device" ? (
    <div className="p-6 space-y-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Device onboarding</p>
        <h4 className="mt-1 text-[18px] font-semibold text-foreground">Add POS device</h4>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">Device name</p>
          <Input
            value={newDeviceForm.name}
            onChange={(event) => setNewDeviceForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Counter 11"
            className="mt-1 h-8 bg-background/50 text-xs"
          />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Store location</p>
          <Input
            value={newDeviceForm.location}
            onChange={(event) => setNewDeviceForm((current) => ({ ...current, location: event.target.value }))}
            placeholder="Second floor"
            className="mt-1 h-8 bg-background/50 text-xs"
          />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Device model</p>
          <select
            value={newDeviceForm.model}
            onChange={(event) =>
              setNewDeviceForm((current) => ({ ...current, model: event.target.value as DeviceRow["model"] }))
            }
            className="mt-1 h-8 w-full rounded-md border border-border bg-background/50 px-2 text-xs text-foreground"
          >
            <option value="A920 Pro">A920 Pro</option>
            <option value="P2 Lite">P2 Lite</option>
            <option value="A80">A80</option>
          </select>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Connection status</p>
          <select
            value={newDeviceForm.status}
            onChange={(event) =>
              setNewDeviceForm((current) => ({ ...current, status: event.target.value as DeviceRow["status"] }))
            }
            className="mt-1 h-8 w-full rounded-md border border-border bg-background/50 px-2 text-xs text-foreground"
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Button className="w-full" disabled={!canCreateDevice} onClick={handleCreateDevice}>
          Add and configure
        </Button>
        <Button variant="outline" className="w-full" onClick={() => setRightTab("detail")}>
          Cancel
        </Button>
      </div>
    </div>
  ) : rightTab === "detail" ? (
    navSection !== "manage-devices" && selectedTableDetail ? (
      <div className="p-6 space-y-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Record detail</p>
          <h4 className="mt-1 text-[18px] font-semibold text-foreground">{selectedTableDetail.title}</h4>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Current value</p>
          <p className="text-[20px] font-semibold text-foreground">{selectedTableDetail.value}</p>
        </div>
        <Separator />
        <p className="text-sm text-muted-foreground">{selectedTableDetail.description}</p>
        <div className="space-y-2">
          {selectedTableDetail.rows.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <span className="text-xs font-medium text-foreground text-right">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    ) : selectedDevice ? <DeviceDetail device={selectedDevice} /> : (
      <PanelEmpty
        icon={Wifi}
        title={navSection === "manage-devices" ? "Select a device" : "Select a row"}
        description={
          navSection === "manage-devices"
            ? "Click a POS device to view its status, transactions and configuration."
            : "Click any row in the table to open detail context."
        }
      />
    )
  ) : (
    <div className="mt-0 overflow-auto px-5 py-4 space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">7-Day Transactions by Type</p>
        <div className="h-48">
          <HighchartsPanelChart options={typeOptions} />
        </div>
        <div className="flex items-center gap-4 mt-2">
          {[{l:"Card Tap",c:"var(--color-primary)"},{l:"Chip",c:"var(--color-chart-2)"},{l:"Swipe",c:"var(--color-chart-3)"}].map(l => (
            <div key={l.l} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{backgroundColor:l.c}} /><span className="text-xs text-muted-foreground">{l.l}</span></div>
          ))}
        </div>
      </div>
      <Separator />
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Revenue by Device</p>
        {deviceRows.filter(d => d.status==="online").sort((a,b) => parseInt(b.today.replace(/[₹,]/g,"")) - parseInt(a.today.replace(/[₹,]/g,""))).map(d => (
          <div key={d.id} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-28 shrink-0 truncate">{d.name}</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.round(parseInt(d.today.replace(/[₹,]/g,""))/920*100)}%` }} />
            </div>
            <span className="text-xs font-medium text-foreground w-16 text-right shrink-0">{d.today}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const rightContext = (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Context</p>
          <p className="text-[16px] font-semibold text-foreground">
            {selectedVas
              ? "Service configuration"
              : rightTab === "add-device"
                ? "Add device"
                : rightTab === "detail"
                  ? navSection === "manage-devices"
                    ? "Device detail"
                    : "Context detail"
                  : "Analytics"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8"
          aria-label="Close contextual panel"
          onClick={() => {
            setSelectedVasId(null)
            setSelected(null)
            setSelectedTableDetail(null)
            setRightTab("detail")
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      {rightContextBody}
    </div>
  )

  return (
    <>
      {pageHeader}
      <WorkspaceShell
        leftContext={leftContext}
        showLeftContext={false}
        centerMain={centerMain}
        rightContext={rightContext}
        showRightContext={
          Boolean(selectedVas) ||
          rightTab === "analytics" ||
          rightTab === "add-device" ||
          Boolean(selectedDevice) ||
          Boolean(selectedTableDetail)
        }
        leftWidth={248}
        leftMaxWidth={300}
      />
    </>
  )
}
