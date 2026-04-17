"use client"

import { useState } from "react"
import { Search, Download, Filter, CheckCircle2, XCircle, Clock, CreditCard, QrCode, Wallet, TrendingUp, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageHeader, PanelEmpty } from "@/components/ui/panels"
import { HighchartsPanelChart } from "@/components/ui/highcharts"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"

type PaymentsSection = "overview" | "online" | "offline" | "links" | "high-value"

const transactions = [
  { id: "TXN-9201", method: "UPI", label: "Google Pay", amount: 2450, status: "success", time: "2m ago", merchant: "Rahul Sharma" },
  { id: "TXN-9200", method: "Card", label: "Visa •• 4242", amount: 8900, status: "success", time: "8m ago", merchant: "Priya Nair" },
  { id: "TXN-9199", method: "UPI", label: "PhonePe", amount: 1200, status: "failed", time: "15m ago", merchant: "Arjun Mehta" },
  { id: "TXN-9198", method: "EMI", label: "Bajaj Fin", amount: 45000, status: "success", time: "22m ago", merchant: "Sneha Patel" },
  { id: "TXN-9197", method: "Wallet", label: "Paytm", amount: 600, status: "pending", time: "31m ago", merchant: "Kiran Rao" },
  { id: "TXN-9196", method: "Card", label: "Mastercard •• 1234", amount: 3200, status: "success", time: "45m ago", merchant: "Neha Joshi" },
  { id: "TXN-9195", method: "UPI", label: "BHIM", amount: 950, status: "success", time: "1h ago", merchant: "Vikram Singh" },
  { id: "TXN-9194", method: "Card", label: "Amex •• 8888", amount: 12000, status: "failed", time: "1h 10m ago", merchant: "Anjali Gupta" },
  { id: "TXN-9193", method: "UPI", label: "Google Pay", amount: 3800, status: "success", time: "1h 30m ago", merchant: "Rohit Kumar" },
  { id: "TXN-9192", method: "EMI", label: "HDFC EMI", amount: 28000, status: "success", time: "2h ago", merchant: "Pooja Sharma" },
]

const weeklyData = [
  { day: "Mon", v: 128500 }, { day: "Tue", v: 152400 }, { day: "Wed", v: 134100 },
  { day: "Thu", v: 175200 }, { day: "Fri", v: 143950 }, { day: "Sat", v: 72950 }, { day: "Sun", v: 54200 },
]

const methodData = [
  { name: "UPI", value: 42, color: "var(--color-primary)" },
  { name: "Cards", value: 38, color: "var(--color-chart-2)" },
  { name: "EMI", value: 12, color: "var(--color-chart-4)" },
  { name: "Wallets", value: 8, color: "var(--color-chart-3)" },
]

const failureData = [
  { reason: "Insufficient funds", count: 18 },
  { reason: "Bank timeout", count: 12 },
  { reason: "Invalid OTP", count: 8 },
  { reason: "Card declined", count: 6 },
]

const statusMap = {
  success: { Icon: CheckCircle2, badge: "bg-success/10 text-success border-success/20" },
  failed: { Icon: XCircle, badge: "bg-destructive/10 text-destructive border-destructive/20" },
  pending: { Icon: Clock, badge: "bg-warning/10 text-warning-foreground border-warning/20" },
}

const mIcon: Record<string, React.ComponentType<{ className?: string }>> = { UPI: QrCode, Card: CreditCard, EMI: CreditCard, Wallet: Wallet }

function TxnRow({ txn, selected, onClick }: { txn: typeof transactions[0]; selected: boolean; onClick: () => void }) {
  const { badge } = statusMap[txn.status as keyof typeof statusMap]
  const MI = mIcon[txn.method] ?? CreditCard
  return (
    <Button variant="ghost" onClick={onClick}
      className={`intercom-panel-row !h-auto !justify-start ${selected ? "intercom-panel-row-active" : ""}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
        <MI className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground truncate">{txn.merchant}</p>
          <p className="text-sm font-semibold text-foreground shrink-0">₹{txn.amount.toLocaleString("en-IN")}</p>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground truncate">{txn.label} · {txn.time}</p>
          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 shrink-0 ${badge}`}>{txn.status}</Badge>
        </div>
      </div>
    </Button>
  )
}

function TxnDetail({ txn }: { txn: typeof transactions[0] }) {
  const { Icon, badge } = statusMap[txn.status as keyof typeof statusMap]
  const MI = mIcon[txn.method] ?? CreditCard
  return (
    <div className="p-5 space-y-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted shrink-0">
          <MI className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">₹{txn.amount.toLocaleString("en-IN")}</p>
          <p className="text-sm text-muted-foreground">{txn.merchant}</p>
          <Badge variant="outline" className={`mt-1.5 text-xs gap-1 ${badge}`}>
            <Icon className="h-3 w-3" />{txn.status}
          </Badge>
        </div>
      </div>
      <Separator />
      <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
        {[["Transaction ID", txn.id], ["Method", `${txn.method} · ${txn.label}`], ["Time", txn.time], ["Reference", `REF${txn.id.replace("TXN-","")}`]].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between px-4 py-3">
            <span className="text-xs text-muted-foreground">{k}</span>
            <span className="text-xs font-medium text-foreground">{v}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {txn.status === "success" && <Button variant="outline" size="sm" className="flex-1">Initiate Refund</Button>}
        <Button variant="outline" size="sm" className="flex-1 gap-1.5"><Download className="h-3.5 w-3.5" />Receipt</Button>
      </div>
    </div>
  )
}

function Analytics() {
  const volumeOptions = {
    chart: { type: "area" },
    xAxis: { categories: weeklyData.map((d) => d.day) },
    yAxis: {
      labels: { format: "{value}" },
    },
    tooltip: {
      pointFormat: "<b>₹{point.y}</b>",
    },
    legend: { enabled: false },
    series: [
      {
        type: "area",
        name: "Revenue",
        data: weeklyData.map((d) => d.v),
        color: "var(--color-primary)",
        fillOpacity: 0.18,
      },
    ],
  } as const

  const methodOptions = {
    chart: { type: "pie" },
    legend: { enabled: false },
    tooltip: { pointFormat: "<b>{point.percentage:.1f}%</b>" },
    series: [
      {
        type: "pie",
        name: "Share",
        innerSize: "62%",
        data: methodData.map((d) => ({ name: d.name, y: d.value, color: d.color })),
      },
    ],
  } as const

  return (
    <div className="p-5 space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">7-Day Volume</p>
        <div className="h-36">
          <HighchartsPanelChart options={volumeOptions} />
        </div>
      </div>
      <Separator />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Payment Methods</p>
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 shrink-0">
            <HighchartsPanelChart options={methodOptions} />
          </div>
          <div className="space-y-2 flex-1">
            {methodData.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm" style={{ backgroundColor: d.color }} /><span className="text-xs text-muted-foreground">{d.name}</span></div>
                <span className="text-xs font-semibold text-foreground">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Separator />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Top Failure Reasons</p>
        <div className="space-y-2.5">
          {failureData.map(d => (
            <div key={d.reason} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground flex-1">{d.reason}</span>
              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-destructive/70 rounded-full" style={{ width: `${(d.count/18)*100}%` }} /></div>
              <span className="text-xs font-medium text-foreground w-4 text-right">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div className="bg-muted/40 rounded-lg border border-border p-4 space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">vs. Industry Benchmark</p>
        {[["Success Rate","96.7%","94.2%"],["Avg Ticket","₹861","₹720"],["Failure Rate","3.3%","5.8%"]].map(([l,y,b]) => (
          <div key={l} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{l}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{b} avg</span>
              <span className="text-xs font-semibold text-success">{y}</span>
              <TrendingUp className="h-3 w-3 text-success" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PaymentsContent() {
  const [selected, setSelected] = useState<string|null>(null)
  const [query, setQuery] = useState("")
  const [section, setSection] = useState<PaymentsSection>("overview")
  const [contextMode, setContextMode] = useState<"detail" | "analytics" | null>(null)
  const selectedTxn = transactions.find(t => t.id === selected)
  const filtered = transactions
    .filter((t) => {
      if (section === "overview") return true
      if (section === "online") return t.method === "UPI" || t.method === "Card" || t.method === "Wallet"
      if (section === "offline") return t.method === "Card" || t.method === "EMI"
      if (section === "links") return t.method === "Wallet" || t.method === "UPI"
      if (section === "high-value") return t.amount >= 5000
      return true
    })
    .filter((t) => t.merchant.toLowerCase().includes(query.toLowerCase()) || t.id.toLowerCase().includes(query.toLowerCase()))

  const leftContext = (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-border/70 px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Payment Views</p>
        <h3 className="mt-1 text-sm font-semibold text-foreground">Operations scope</h3>
      </div>
      <div className="space-y-1 p-3">
        {[
          { key: "overview", label: "Overview", helper: `${transactions.length} events` },
          { key: "online", label: "Online Flow", helper: "UPI / Cards / Wallets" },
          { key: "offline", label: "Offline Flow", helper: "Card + EMI counters" },
          { key: "links", label: "Pay by Link", helper: "Collection events" },
          { key: "high-value", label: "High Value", helper: "₹5,000 and above" },
        ].map((item) => {
          const active = section === item.key
          return (
            <Button variant="ghost"
              key={item.key}
              onClick={() => {
                setSection(item.key as PaymentsSection)
                setSelected(null)
                setContextMode(null)
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

  const centerMain = (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
        Context-aware routing found one payment anomaly in the selected scope.
        <Button
          variant="link"
          size="sm"
          className="ml-1 h-auto p-0 text-xs text-foreground underline"
          onClick={() => setContextMode("analytics")}
        >
          Open insight
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[{l:"Today",v:"₹2.34L"},{l:"Success",v:"96.7%"},{l:"Failed",v:"3.3%"},{l:"Txns",v:"234"}].map(s => (
          <div key={s.l} className="rounded-xl border border-border bg-card p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.l}</p>
            <p className="text-base font-semibold text-foreground mt-1">{s.v}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search transactions..." value={query} onChange={e => setQuery(e.target.value)} className="pl-8 h-8 text-xs" />
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setContextMode("analytics")}>
            <BarChart3 className="h-3.5 w-3.5" />
            Insights
          </Button>
        </div>
        <div className="divide-y divide-border">
          {filtered.map(txn => (
            <TxnRow
              key={txn.id}
              txn={txn}
              selected={selected===txn.id}
              onClick={() => {
                setSelected(txn.id)
                setContextMode("detail")
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )

  const rightContext = contextMode === "analytics" ? (
    <Analytics />
  ) : selectedTxn ? (
    <TxnDetail txn={selectedTxn} />
  ) : (
    <PanelEmpty icon={BarChart3} title="Select a transaction" description="Choose a transaction to reveal contextual actions and detailed metadata." />
  )

  return (
    <>
      <PageHeader title="Payments" description="Transactions · Settlements · Refunds">
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs"><Download className="h-3.5 w-3.5" />Export</Button>
        {contextMode && (
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setContextMode(null)}>
            Close Context
          </Button>
        )}
      </PageHeader>
      <WorkspaceShell
        leftContext={leftContext}
        showLeftContext={false}
        centerMain={centerMain}
        rightContext={rightContext}
        showRightContext={contextMode === "analytics" || Boolean(selectedTxn)}
        hideBottomNav={section !== "overview"}
        leftWidth={248}
        leftMaxWidth={300}
      />
    </>
  )
}
