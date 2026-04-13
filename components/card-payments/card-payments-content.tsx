"use client"

import { useMemo, useState } from "react"
import {
  CreditCard,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock3,
  ArrowUpRight,
} from "lucide-react"
import { PageHeader, PanelEmpty } from "@/components/ui/panels"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HighchartsPanelChart } from "@/components/ui/highcharts"

type CardSection = "overview" | "visa" | "mastercard" | "rupay" | "amex"

const trendData = [
  { day: "Mon", amount: 95000 },
  { day: "Tue", amount: 112000 },
  { day: "Wed", amount: 98000 },
  { day: "Thu", amount: 125000 },
  { day: "Fri", amount: 145000 },
  { day: "Sat", amount: 168000 },
  { day: "Sun", amount: 128450 },
]

const networkData = [
  { name: "Visa", y: 42, color: "var(--color-chart-2)" },
  { name: "Mastercard", y: 28, color: "var(--color-chart-4)" },
  { name: "RuPay", y: 22, color: "var(--color-primary)" },
  { name: "Amex", y: 8, color: "var(--color-chart-5)" },
]

const transactions = [
  { id: "TXN-C001", customer: "Rahul Sharma", card: "Visa •• 4532", amount: 3250, status: "success", time: "2 min ago", channel: "Tap" },
  { id: "TXN-C002", customer: "Priya Nair", card: "Mastercard •• 8721", amount: 1850, status: "success", time: "5 min ago", channel: "Chip & PIN" },
  { id: "TXN-C003", customer: "Arjun Mehta", card: "RuPay •• 6234", amount: 5100, status: "success", time: "8 min ago", channel: "Tap" },
  { id: "TXN-C004", customer: "Sneha Patel", card: "Visa •• 9087", amount: 2450, status: "failed", time: "12 min ago", channel: "Swipe" },
  { id: "TXN-C005", customer: "Neha Joshi", card: "Amex •• 3456", amount: 7200, status: "pending", time: "15 min ago", channel: "Tap" },
]

const statusMap = {
  success: { icon: CheckCircle2, className: "bg-success/10 text-success border-success/20" },
  failed: { icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
  pending: { icon: Clock3, className: "bg-warning/10 text-warning-foreground border-warning/20" },
}

export function CardPaymentsContent() {
  const [query, setQuery] = useState("")
  const [section, setSection] = useState<CardSection>("overview")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      transactions.filter(
        (t) => {
          if (section === "visa" && !t.card.toLowerCase().includes("visa")) return false
          if (section === "mastercard" && !t.card.toLowerCase().includes("mastercard")) return false
          if (section === "rupay" && !t.card.toLowerCase().includes("rupay")) return false
          if (section === "amex" && !t.card.toLowerCase().includes("amex")) return false
          return (
          t.customer.toLowerCase().includes(query.toLowerCase()) ||
          t.id.toLowerCase().includes(query.toLowerCase()) ||
          t.card.toLowerCase().includes(query.toLowerCase())
          )
        }
      ),
    [query, section]
  )
  const selected = transactions.find((t) => t.id === selectedId)

  const leftContext = (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-border/70 px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Network Views</p>
        <h3 className="mt-1 text-sm font-semibold text-foreground">Card operations</h3>
      </div>
      <div className="space-y-1 p-3">
        {[
          { key: "overview", label: "Overview", helper: "All card networks" },
          { key: "visa", label: "Visa", helper: "Network drilldown" },
          { key: "mastercard", label: "Mastercard", helper: "Network drilldown" },
          { key: "rupay", label: "RuPay", helper: "Network drilldown" },
          { key: "amex", label: "Amex", helper: "Network drilldown" },
        ].map((item) => {
          const active = section === item.key
          return (
            <Button variant="ghost"
              key={item.key}
              onClick={() => {
                setSection(item.key as CardSection)
                setSelectedId(null)
              }}
              className={`w-full rounded-lg border px-3 py-2 !h-auto !justify-start text-left transition-colors ${
                active
                  ? "border-border bg-secondary/70"
                  : "border-transparent hover:border-border hover:bg-secondary/30"
              }`}
            >
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.helper}</p>
            </Button>
          )
        })}
      </div>
    </div>
  )

  const trendOptions = {
    chart: { type: "area" },
    legend: { enabled: false },
    xAxis: { categories: trendData.map((d) => d.day) },
    yAxis: { labels: { format: "{value}" } },
    tooltip: { pointFormat: "<b>₹{point.y}</b>" },
    series: [
      {
        type: "area",
        name: "Revenue",
        data: trendData.map((d) => d.amount),
        color: "var(--color-primary)",
        fillOpacity: 0.16,
      },
    ],
  } as const

  const networkOptions = {
    chart: { type: "pie" },
    legend: { enabled: false },
    tooltip: { pointFormat: "<b>{point.percentage:.1f}%</b>" },
    series: [
      {
        type: "pie",
        innerSize: "64%",
        name: "Networks",
        data: networkData,
      },
    ],
  } as const

  const centerMain = (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Today's Transactions", value: "231" },
          { label: "Today's Revenue", value: "₹1,28,450" },
          { label: "Success Rate", value: "97.4%" },
          { label: "Avg Ticket", value: "₹556" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
            <p className="text-lg font-semibold text-foreground mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Weekly Revenue Trend</p>
          <div className="h-52">
            <HighchartsPanelChart options={trendOptions} />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Card Network Share</p>
          <div className="h-52">
            <HighchartsPanelChart options={networkOptions} />
          </div>
          <div className="space-y-1">
            {networkData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-semibold text-foreground">{d.y}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by transaction id, customer, or card..."
            className="h-8 text-xs"
          />
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </Button>
        </div>
        <div className="divide-y divide-border">
          {filtered.map((t) => {
            const status = statusMap[t.status as keyof typeof statusMap]
            const Icon = status.icon
            return (
              <Button variant="ghost"
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`intercom-panel-row !h-auto !justify-start ${selectedId === t.id ? "intercom-panel-row-active" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.customer}</p>
                    <p className="text-xs text-muted-foreground">{t.id} · {t.card} · {t.channel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">₹{t.amount.toLocaleString("en-IN")}</p>
                    <Badge variant="outline" className={`text-[10px] mt-1 ${status.className}`}>
                      <Icon className="h-3 w-3 mr-1" />
                      {t.status}
                    </Badge>
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )

  const rightContext = selected ? (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Transaction Inspector</p>
        <p className="text-base font-semibold text-foreground mt-1">{selected.id}</p>
      </div>
      <Separator />
      <div className="space-y-2">
        {[
          ["Customer", selected.customer],
          ["Card", selected.card],
          ["Channel", selected.channel],
          ["Time", selected.time],
          ["Amount", `₹${selected.amount.toLocaleString("en-IN")}`],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{k}</span>
            <span className="text-foreground font-medium">{v}</span>
          </div>
        ))}
      </div>
      <Separator />
      <div className="space-y-2">
        <Button className="w-full">Initiate Refund</Button>
        <Button variant="outline" className="w-full">Download Receipt</Button>
        <Button variant="ghost" className="w-full text-muted-foreground">Attach Internal Note</Button>
      </div>
    </div>
  ) : (
    <PanelEmpty
      icon={CreditCard}
      title="Choose a transaction"
      description="Select a card transaction to open contextual actions and operational details."
    />
  )

  return (
    <>
      <PageHeader title="Card Payments" description="Operate card acceptance with contextual actions">
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5" />
          Export
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
        rightWidth={360}
      />
      {!selected && (
        <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
          Click any transaction row to open the contextual inspector.
        </div>
      )}
    </>
  )
}
