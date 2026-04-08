"use client"

import { useMemo, useState } from "react"
import { Globe, Download, RefreshCw, Settings } from "lucide-react"
import { PageHeader, PanelEmpty } from "@/components/ui/panels"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HighchartsPanelChart } from "@/components/ui/highcharts"

type IntlSection = "overview" | "all" | "usd" | "eur" | "gbp" | "risk"

const weeklyData = [
  { day: "Mon", amount: 2450, txns: 12 },
  { day: "Tue", amount: 3200, txns: 15 },
  { day: "Wed", amount: 2800, txns: 14 },
  { day: "Thu", amount: 4100, txns: 18 },
  { day: "Fri", amount: 3650, txns: 16 },
  { day: "Sat", amount: 2100, txns: 8 },
  { day: "Sun", amount: 1850, txns: 6 },
]

const currencyData = [
  { name: "USD", y: 45, color: "var(--color-primary)" },
  { name: "EUR", y: 25, color: "var(--color-chart-2)" },
  { name: "GBP", y: 15, color: "var(--color-chart-4)" },
  { name: "AED", y: 10, color: "var(--color-chart-3)" },
  { name: "Others", y: 5, color: "var(--color-chart-5)" },
]

const transactions = [
  { id: "INT-001", customer: "John Smith", amount: "$450.00", currency: "USD", country: "United States", status: "completed", time: "2 mins ago" },
  { id: "INT-002", customer: "Emma Wilson", amount: "£280.00", currency: "GBP", country: "United Kingdom", status: "completed", time: "15 mins ago" },
  { id: "INT-003", customer: "Hans Mueller", amount: "€520.00", currency: "EUR", country: "Germany", status: "pending", time: "32 mins ago" },
  { id: "INT-004", customer: "Ahmed Al-Rashid", amount: "AED 1,200", currency: "AED", country: "UAE", status: "completed", time: "1 hour ago" },
  { id: "INT-005", customer: "Sarah Chen", amount: "SGD 380.00", currency: "SGD", country: "Singapore", status: "failed", time: "2 hours ago" },
]

export function InternationalPaymentsContent() {
  const [query, setQuery] = useState("")
  const [section, setSection] = useState<IntlSection>("overview")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      transactions.filter(
        (t) => {
          if (section === "usd" && t.currency !== "USD") return false
          if (section === "eur" && t.currency !== "EUR") return false
          if (section === "gbp" && t.currency !== "GBP") return false
          if (section === "risk" && t.status === "completed") return false
          return (
          t.customer.toLowerCase().includes(query.toLowerCase()) ||
          t.id.toLowerCase().includes(query.toLowerCase()) ||
          t.country.toLowerCase().includes(query.toLowerCase()) ||
          t.currency.toLowerCase().includes(query.toLowerCase())
          )
        }
      ),
    [query, section]
  )
  const selected = transactions.find((t) => t.id === selectedId)

  const leftContext = (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-border/70 px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Cross-Border Views</p>
        <h3 className="mt-1 text-sm font-semibold text-foreground">Currency and risk scope</h3>
      </div>
      <div className="space-y-1 p-3">
        {[
          { key: "overview", label: "Overview", helper: "Global summary" },
          { key: "all", label: "All Transfers", helper: `${transactions.length} records` },
          { key: "usd", label: "USD", helper: "Dollar settlements" },
          { key: "eur", label: "EUR", helper: "Euro settlements" },
          { key: "gbp", label: "GBP", helper: "Pound settlements" },
          { key: "risk", label: "Risk Queue", helper: "Pending + failed" },
        ].map((item) => {
          const active = section === item.key
          return (
            <button
              key={item.key}
              onClick={() => {
                setSection(item.key as IntlSection)
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

  const amountOptions = {
    chart: { type: "area" },
    legend: { enabled: false },
    xAxis: { categories: weeklyData.map((d) => d.day) },
    yAxis: { labels: { format: "{value}" } },
    tooltip: { pointFormat: "<b>${point.y}</b>" },
    series: [{ type: "area", name: "Amount", data: weeklyData.map((d) => d.amount), color: "var(--color-primary)", fillOpacity: 0.18 }],
  } as const

  const currencyOptions = {
    chart: { type: "pie" },
    legend: { enabled: false },
    tooltip: { pointFormat: "<b>{point.percentage:.1f}%</b>" },
    series: [{ type: "pie", name: "Share", innerSize: "60%", data: currencyData }],
  } as const

  const centerMain = (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Volume", value: "$12,450" },
          { label: "Transactions", value: "89" },
          { label: "Success Rate", value: "96.8%" },
          { label: "Countries", value: "18 active" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
            <p className="text-lg font-semibold text-foreground mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Weekly Cross-border Volume</p>
          <div className="h-52">
            <HighchartsPanelChart options={amountOptions} />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Currency Share</p>
          <div className="h-52">
            <HighchartsPanelChart options={currencyOptions} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-3 border-b border-border">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by customer, country, currency, transaction id..."
            className="h-8 text-xs"
          />
        </div>
        <div className="divide-y divide-border">
          {filtered.map((txn) => (
            <button
              key={txn.id}
              onClick={() => setSelectedId(txn.id)}
              className={`intercom-panel-row ${selectedId === txn.id ? "intercom-panel-row-active" : ""}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{txn.customer}</p>
                  <p className="text-xs text-muted-foreground">{txn.id} · {txn.country} · {txn.currency}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{txn.amount}</p>
                  <Badge variant="outline" className="text-[10px] mt-1 capitalize">{txn.status}</Badge>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const rightContext = selected ? (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Cross-border Context</p>
        <p className="text-base font-semibold text-foreground mt-1">{selected.id}</p>
      </div>
      <Separator />
      <div className="space-y-2">
        {[
          ["Customer", selected.customer],
          ["Country", selected.country],
          ["Currency", selected.currency],
          ["Status", selected.status],
          ["Amount", selected.amount],
          ["Time", selected.time],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{k}</span>
            <span className="text-foreground font-medium capitalize">{v}</span>
          </div>
        ))}
      </div>
      <Separator />
      <div className="space-y-2">
        <Button className="w-full">View FX Breakdown</Button>
        <Button variant="outline" className="w-full">Open Compliance Check</Button>
        <Button variant="ghost" className="w-full text-muted-foreground">Attach Settlement Note</Button>
      </div>
    </div>
  ) : (
    <PanelEmpty
      icon={Globe}
      title="Select an international transaction"
      description="Open contextual settlement, FX, and compliance actions from the inspector."
    />
  )

  return (
    <>
      <PageHeader title="International Payments" description="Contextual cross-border operations workspace">
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Settings className="h-3.5 w-3.5" />
          Settings
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
          Select a transaction in the center workspace to reveal cross-border context.
        </div>
      )}
    </>
  )
}
