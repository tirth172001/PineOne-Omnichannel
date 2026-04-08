"use client"

import { useMemo, useState } from "react"
import {
  Smartphone,
  Download,
  RefreshCw,
  Wifi,
  WifiOff,
  BatteryMedium,
  ArrowUpRight,
} from "lucide-react"
import Link from "next/link"
import { PageHeader, PanelEmpty } from "@/components/ui/panels"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HighchartsPanelChart } from "@/components/ui/highcharts"

type DeviceSection = "overview" | "all" | "online" | "offline" | "low-battery"

const devices = [
  { id: "POS-001", name: "Counter 1", status: "online", battery: 85, today: 18500, txns: 67, location: "Main Store" },
  { id: "POS-002", name: "Counter 2", status: "online", battery: 42, today: 14200, txns: 52, location: "Main Store" },
  { id: "POS-003", name: "Mobile Unit", status: "offline", battery: 12, today: 2100, txns: 8, location: "Warehouse" },
  { id: "POS-004", name: "Express Counter", status: "online", battery: 65, today: 12400, txns: 41, location: "Main Store" },
]

const hourly = [
  { time: "6AM", value: 3200 },
  { time: "8AM", value: 7800 },
  { time: "10AM", value: 12500 },
  { time: "12PM", value: 10200 },
  { time: "2PM", value: 14800 },
  { time: "4PM", value: 13200 },
  { time: "6PM", value: 17800 },
  { time: "8PM", value: 11500 },
]

const methodSplit = [
  { name: "Card Tap", y: 45, color: "var(--color-primary)" },
  { name: "Card Insert", y: 25, color: "var(--color-chart-2)" },
  { name: "UPI QR", y: 20, color: "var(--color-chart-4)" },
  { name: "Wallet", y: 10, color: "var(--color-chart-3)" },
]

export function POSDeviceContent() {
  const [query, setQuery] = useState("")
  const [section, setSection] = useState<DeviceSection>("overview")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      devices.filter(
        (d) => {
          if (section === "online" && d.status !== "online") return false
          if (section === "offline" && d.status !== "offline") return false
          if (section === "low-battery" && d.battery > 30) return false
          return (
          d.name.toLowerCase().includes(query.toLowerCase()) ||
          d.id.toLowerCase().includes(query.toLowerCase()) ||
          d.location.toLowerCase().includes(query.toLowerCase())
          )
        }
      ),
    [query, section]
  )
  const selected = devices.find((d) => d.id === selectedId)
  const onlineCount = devices.filter((d) => d.status === "online").length

  const leftContext = (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-border/70 px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Device Views</p>
        <h3 className="mt-1 text-sm font-semibold text-foreground">POS scope</h3>
      </div>
      <div className="space-y-1 p-3">
        {[
          { key: "overview", label: "Overview", helper: "All device metrics" },
          { key: "all", label: "All Devices", helper: `${devices.length} terminals` },
          { key: "online", label: "Online", helper: `${onlineCount} active now` },
          { key: "offline", label: "Offline", helper: `${devices.length - onlineCount} need action` },
          { key: "low-battery", label: "Low Battery", helper: "Battery <= 30%" },
        ].map((item) => {
          const active = section === item.key
          return (
            <button
              key={item.key}
              onClick={() => {
                setSection(item.key as DeviceSection)
                setSelectedId(null)
              }}
              className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                active
                  ? "border-border bg-secondary/70"
                  : "border-transparent hover:border-border hover:bg-secondary/30"
              }`}
            >
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.helper}</p>
            </button>
          )
        })}
      </div>
    </div>
  )

  const revenueOptions = {
    chart: { type: "area" },
    legend: { enabled: false },
    xAxis: { categories: hourly.map((d) => d.time) },
    yAxis: { labels: { format: "{value}" } },
    tooltip: { pointFormat: "<b>₹{point.y}</b>" },
    series: [{ type: "area", name: "Revenue", data: hourly.map((d) => d.value), color: "var(--color-primary)", fillOpacity: 0.18 }],
  } as const

  const splitOptions = {
    chart: { type: "pie" },
    legend: { enabled: false },
    tooltip: { pointFormat: "<b>{point.percentage:.1f}%</b>" },
    series: [{ type: "pie", innerSize: "62%", data: methodSplit }],
  } as const

  const centerMain = (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Online Devices", value: `${onlineCount}/${devices.length}` },
          { label: "Today's Revenue", value: "₹42,500" },
          { label: "Today's Transactions", value: "156" },
          { label: "Success Rate", value: "98.7%" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
            <p className="text-lg font-semibold text-foreground mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Hourly Revenue</p>
          <div className="h-52">
            <HighchartsPanelChart options={revenueOptions} />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Payment Method Mix</p>
          <div className="h-52">
            <HighchartsPanelChart options={splitOptions} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search device id, name, or location..."
            className="h-8 text-xs"
          />
          <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
            <Link href="/onboarding/pos">Add Device</Link>
          </Button>
        </div>
        <div className="divide-y divide-border">
          {filtered.map((device) => {
            const online = device.status === "online"
            return (
              <button
                key={device.id}
                onClick={() => setSelectedId(device.id)}
                className={`intercom-panel-row ${selectedId === device.id ? "intercom-panel-row-active" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{device.name}</p>
                    <p className="text-xs text-muted-foreground">{device.id} · {device.location} · {device.txns} txns</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">₹{device.today.toLocaleString("en-IN")}</p>
                    <Badge variant="outline" className={`text-[10px] mt-1 ${online ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}`}>
                      {online ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                      {device.status}
                    </Badge>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  const rightContext = selected ? (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Device Context</p>
        <p className="text-base font-semibold text-foreground mt-1">{selected.name}</p>
      </div>
      <Separator />
      <div className="space-y-2">
        {[
          ["Device ID", selected.id],
          ["Location", selected.location],
          ["Status", selected.status],
          ["Battery", `${selected.battery}%`],
          ["Today's Revenue", `₹${selected.today.toLocaleString("en-IN")}`],
          ["Transactions", `${selected.txns}`],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{k}</span>
            <span className="text-foreground font-medium">{v}</span>
          </div>
        ))}
      </div>
      <Separator />
      <div className="rounded-xl border border-border bg-muted/35 p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <BatteryMedium className="h-3.5 w-3.5" />
          Battery health and connectivity actions
        </div>
      </div>
      <div className="space-y-2">
        <Button className="w-full">Configure Device</Button>
        <Button variant="outline" className="w-full">Run Connectivity Check</Button>
        <Button variant="ghost" className="w-full text-muted-foreground gap-1.5">
          Device Performance
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  ) : (
    <PanelEmpty
      icon={Smartphone}
      title="Choose a device"
      description="Select a POS device to open contextual diagnostics and operational actions."
    />
  )

  return (
    <>
      <PageHeader title="POS Devices" description="Operate hardware and diagnose issues contextually">
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          Sync
        </Button>
      </PageHeader>
      <WorkspaceShell
        leftContext={leftContext}
        showLeftContext
        centerMain={centerMain}
        rightContext={rightContext}
        showRightContext={Boolean(selected)}
        hideBottomNav={section !== "overview"}
        leftWidth={248}
        leftMaxWidth={300}
        centerMaxWidth={1080}
      />
      {!selected && (
        <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
          Open a device from the center workspace to reveal contextual controls.
        </div>
      )}
    </>
  )
}
