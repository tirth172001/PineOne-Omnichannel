"use client"

import { useState } from "react"
import { Wifi, WifiOff, CheckCircle2, X, XCircle, Plus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { PanelEmpty } from "@/components/ui/panels"
import { HighchartsPanelChart } from "@/components/ui/highcharts"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { ProductWorkspaceNav, type ProductWorkspaceSection } from "@/components/dashboard/product-workspace-nav"
type DeviceSegment = "all" | "a920-pro" | "p2-lite" | "a80" | "offline"
type OfflineNavSection = ProductWorkspaceSection
type DeviceRow = {
  id: string
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

const initialDevices: DeviceRow[] = [
  { id: "POS-001", name: "Counter 1", location: "Main Floor", status: "online", today: "₹82,400", txns: 68, model: "A920 Pro", lastSeen: "Now" },
  { id: "POS-002", name: "Counter 2", location: "Main Floor", status: "online", today: "₹71,200", txns: 59, model: "A920 Pro", lastSeen: "1 min ago" },
  { id: "POS-003", name: "Counter 3", location: "Main Floor", status: "online", today: "₹65,800", txns: 54, model: "A920 Pro", lastSeen: "3 min ago" },
  { id: "POS-004", name: "Billing Desk", location: "Ground Floor", status: "online", today: "₹54,300", txns: 45, model: "P2 Lite", lastSeen: "2 min ago" },
  { id: "POS-005", name: "Express Lane", location: "Ground Floor", status: "offline", today: "₹0", txns: 0, model: "A920 Pro", lastSeen: "2 hr ago" },
  { id: "POS-006", name: "Food Court", location: "First Floor", status: "online", today: "₹48,100", txns: 39, model: "A80", lastSeen: "Now" },
  { id: "POS-007", name: "Electronics", location: "First Floor", status: "online", today: "₹92,000", txns: 62, model: "A920 Pro", lastSeen: "Now" },
  { id: "POS-008", name: "Mobile Dept", location: "First Floor", status: "online", today: "₹45,600", txns: 37, model: "P2 Lite", lastSeen: "5 min ago" },
  { id: "POS-009", name: "Customer Svc", location: "Entry", status: "offline", today: "₹0", txns: 0, model: "A80", lastSeen: "46 min ago" },
  { id: "POS-010", name: "Warehouse", location: "Basement", status: "online", today: "₹11,600", txns: 10, model: "P2 Lite", lastSeen: "14 min ago" },
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

export function OfflinePaymentsContent({ initialSection }: { initialSection?: OfflineNavSection } = {}) {
  const [navSection, setNavSection] = useState<OfflineNavSection>(initialSection ?? "transactions")
  const [deviceRows, setDeviceRows] = useState<DeviceRow[]>(initialDevices)
  const [selected, setSelected] = useState<string | null>(null)
  const [deviceSegment, setDeviceSegment] = useState<DeviceSegment>("all")
  const [rightTab, setRightTab] = useState<"detail" | "analytics" | "add-device">("detail")
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
  const filteredDevices = deviceRows
    .filter((d) => {
      if (deviceSegment === "all") return true
      if (deviceSegment === "offline") return d.status === "offline"
      if (deviceSegment === "a920-pro") return d.model === "A920 Pro"
      if (deviceSegment === "p2-lite") return d.model === "P2 Lite"
      if (deviceSegment === "a80") return d.model === "A80"
      return true
    })
  const onlineCount = deviceRows.filter((d) => d.status === "online").length
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
    { id: "id", header: "Device", accessorKey: "id", width: 110, pinnable: true },
    { id: "name", header: "Name", accessorKey: "name", width: 170 },
    { id: "location", header: "Location", accessorKey: "location", width: 140 },
    {
      id: "model",
      header: "Model",
      accessorKey: "model",
      width: 120,
      filterOptions: [
        { label: "A920 Pro", value: "A920 Pro" },
        { label: "P2 Lite", value: "P2 Lite" },
        { label: "A80", value: "A80" },
      ],
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      width: 110,
      filterOptions: [
        { label: "Online", value: "online" },
        { label: "Offline", value: "offline" },
      ],
      cell: (device) => (
        <Badge
          variant="outline"
          className={device.status === "online" ? "bg-success/20 text-foreground border-success/35" : "bg-muted text-muted-foreground border-border"}
        >
          {device.status}
        </Badge>
      ),
    },
    { id: "txns", header: "Txns", getValue: (device) => device.txns, align: "right", width: 90 },
    { id: "today", header: "Today", accessorKey: "today", align: "right", width: 120 },
    { id: "lastSeen", header: "Last Seen", accessorKey: "lastSeen", width: 110, align: "right" },
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

  const leftContext = (
    <ProductWorkspaceNav
      title="Offline Payments"
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

  const centerMain = (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <section className="rounded-lg bg-card/80 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {navSection === "manage-devices" ? "manage devices" : navSection}
            </p>
            <h2 className="text-[15px] font-semibold text-foreground">Offline payments workspace</h2>
          </div>
          {navSection === "manage-devices" && (
            <div className="ml-auto flex items-center gap-1 rounded-md bg-muted/70 p-1">
              {[
                { key: "all", label: "All" },
                { key: "a920-pro", label: "A920 Pro" },
                { key: "p2-lite", label: "P2 Lite" },
                { key: "a80", label: "A80" },
                { key: "offline", label: "Offline" },
              ].map((item) => (
                <Button variant="ghost"
                  key={item.key}
                  onClick={() => setDeviceSegment(item.key as DeviceSegment)}
                  className={`rounded-sm px-2.5 py-1 text-[11px] ${
                    deviceSegment === item.key ? "bg-card text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </section>

      {navSection === "transactions" && (
        <>
          <div className="grid grid-cols-4 gap-3">
            {[{l:"Transactions",v:"2,146"},{l:"Approved",v:"2,104"},{l:"Declined",v:"42"},{l:"Volume",v:"₹18.6L"}].map(s => (
              <div key={s.l} className="rounded-lg bg-card/80 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
                <p className="mt-1 text-[15px] font-semibold text-foreground">{s.v}</p>
              </div>
            ))}
          </div>

          <DataTable
            data={offlineTransactionRows}
            columns={transactionColumns}
            rowId={(transaction) => transaction.id}
            searchPlaceholder="Search transactions..."
            emptyText="No transactions found"
            initialPinnedColumnIds={["id"]}
            toolbarActions={
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setRightTab("analytics")}>
                Analytics
              </Button>
            }
            onRowClick={() => setRightTab("analytics")}
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
              setRightTab("detail")
            }}
            searchPlaceholder="Search devices..."
            emptyText="No devices found"
            initialPinnedColumnIds={["id"]}
            toolbarActions={
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setRightTab("analytics")}>
                  Analytics
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => {
                    setSelected(null)
                    setSelectedVasId(null)
                    setRightTab("add-device")
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add device
                </Button>
              </div>
            }
          />
        </>
      )}

      {navSection === "settlements" && (
        <DataTable
          data={settlementRows}
          columns={settlementColumns}
          rowId={(row) => row.id}
          searchPlaceholder="Search settlements..."
          emptyText="No settlements found"
          initialPinnedColumnIds={["id"]}
          onRowClick={() => setRightTab("analytics")}
        />
      )}

      {navSection === "disputes" && (
        <DataTable
          data={disputeRows}
          columns={disputeColumns}
          rowId={(row) => row.id}
          searchPlaceholder="Search disputes..."
          emptyText="No disputes found"
          initialPinnedColumnIds={["id"]}
          onRowClick={() => setRightTab("analytics")}
        />
      )}

      {navSection === "reports" && (
        <section className="rounded-lg bg-card/80 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Reports</p>
            <Button variant="ghost" size="sm" className="h-8 text-xs">Generate report</Button>
          </div>
          <div className="h-56 rounded-md bg-muted/45 p-2">
            <HighchartsPanelChart options={typeOptions} />
          </div>
        </section>
      )}

      {navSection === "refunds" && (
        <DataTable
          data={refundRows}
          columns={refundColumns}
          rowId={(row) => row.id}
          searchPlaceholder="Search refunds..."
          emptyText="No refunds found"
          initialPinnedColumnIds={["id"]}
          onRowClick={() => setRightTab("analytics")}
        />
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
    selectedDevice ? <DeviceDetail device={selectedDevice} /> : (
      <PanelEmpty
        icon={Wifi}
        title={navSection === "manage-devices" ? "Select a device" : "No contextual detail"}
        description={
          navSection === "manage-devices"
            ? "Click a POS device to view its status, transactions and configuration."
            : "Pick a row or open analytics to see deeper context here."
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
      <WorkspaceShell
        leftContext={leftContext}
        showLeftContext={false}
        centerMain={centerMain}
      rightContext={rightContext}
      showRightContext={Boolean(selectedVas) || rightTab === "analytics" || rightTab === "add-device" || Boolean(selectedDevice)}
      leftWidth={248}
      leftMaxWidth={300}
    />
  )
}
