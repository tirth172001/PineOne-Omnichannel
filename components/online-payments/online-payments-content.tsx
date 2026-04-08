"use client"

import { useMemo, useState } from "react"
import {
  BarChart3,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Filter,
  QrCode,
  Search,
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

type SectionKey = "overview" | "upi" | "cards" | "emi" | "wallets"
type NavSection = "overview" | "transactions" | "settlements" | "disputes" | "refunds" | "reports" | "vas"
type VasItem = { id: string; name: string; detail: string; enabled: boolean; requiresConfig: boolean }
type VasConfig = { label: string; threshold: string; owner: string }

type RightContext =
  | { kind: "transaction"; id: string }
  | { kind: "metric"; title: string; description: string; value: string }
  | { kind: "vas"; id: string }
  | null

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
  { key: "upi", label: "UPI", color: "var(--color-primary)", share: 42, amount: "₹3.6L" },
  { key: "cards", label: "Cards", color: "var(--color-chart-2)", share: 38, amount: "₹3.3L" },
  { key: "emi", label: "EMI", color: "var(--color-chart-4)", share: 12, amount: "₹1.0L" },
  { key: "wallets", label: "Wallets", color: "var(--color-chart-3)", share: 8, amount: "₹0.7L" },
] as const

const methodOrder: Array<{ key: SectionKey; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "upi", label: "UPI" },
  { key: "cards", label: "Cards" },
  { key: "emi", label: "EMI" },
  { key: "wallets", label: "Wallets" },
]

const segmentOptions = ["7D", "30D", "90D"] as const

const recentTxns = [
  { id: "TXN-9201", method: "UPI", label: "Google Pay", amount: 2450, status: "success", time: "2m ago", merchant: "Rahul Sharma" },
  { id: "TXN-9200", method: "Card", label: "Visa •• 4242", amount: 8900, status: "success", time: "8m ago", merchant: "Priya Nair" },
  { id: "TXN-9199", method: "UPI", label: "PhonePe", amount: 1200, status: "failed", time: "15m ago", merchant: "Arjun Mehta" },
  { id: "TXN-9198", method: "EMI", label: "Bajaj Fin", amount: 45000, status: "success", time: "22m ago", merchant: "Sneha Patel" },
  { id: "TXN-9197", method: "Wallet", label: "Paytm", amount: 600, status: "pending", time: "31m ago", merchant: "Kiran Rao" },
  { id: "TXN-9196", method: "Card", label: "MC •• 1234", amount: 3200, status: "success", time: "45m ago", merchant: "Neha Joshi" },
]

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
  success: "bg-success/10 text-success border-success/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-warning/10 text-warning-foreground border-warning/20",
}

const statusIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  failed: XCircle,
  pending: Clock,
}

const methodIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  UPI: QrCode,
  Card: CreditCard,
  EMI: CreditCard,
  Wallet: Wallet,
}

function metricForSection(section: SectionKey) {
  if (section === "overview") {
    return {
      title: "Online Overview",
      subtitle: "Across all payment methods",
      stats: [
        { label: "Revenue", value: "₹1,43,950" },
        { label: "Transactions", value: "167" },
        { label: "Success", value: "96.7%" },
        { label: "Avg Ticket", value: "₹861" },
      ],
    }
  }

  const method = methods.find((item) => item.key === section)
  return {
    title: method?.label ?? "Method",
    subtitle: "Method-specific analytics",
    stats: [
      { label: "Revenue", value: method?.amount ?? "₹0" },
      { label: "Share", value: `${method?.share ?? 0}%` },
      { label: "Success", value: "97.1%" },
      { label: "Avg Ticket", value: "₹926" },
    ],
  }
}

export function OnlinePaymentsContent() {
  const [query, setQuery] = useState("")
  const [navSection, setNavSection] = useState<NavSection>("overview")
  const [section, setSection] = useState<SectionKey>("overview")
  const [segment, setSegment] = useState<(typeof segmentOptions)[number]>("7D")
  const [rightContext, setRightContext] = useState<RightContext>(null)
  const [vasItems, setVasItems] = useState<VasItem[]>(defaultVasItems)
  const [vasConfigById, setVasConfigById] = useState<Record<string, VasConfig>>(defaultVasConfig)
  const [vasPreferences, setVasPreferences] = useState({
    dailyDigest: true,
    anomalyAlerts: true,
    autoRollout: false,
  })

  const sectionMeta = metricForSection(section)

  const filteredTxns = useMemo(
    () =>
      recentTxns
        .filter((txn) =>
          txn.merchant.toLowerCase().includes(query.toLowerCase()) ||
          txn.method.toLowerCase().includes(query.toLowerCase()) ||
          txn.id.toLowerCase().includes(query.toLowerCase()),
        )
        .filter((txn) => {
          if (section === "overview") return true
          if (section === "upi") return txn.method === "UPI"
          if (section === "cards") return txn.method === "Card"
          if (section === "emi") return txn.method === "EMI"
          if (section === "wallets") return txn.method === "Wallet"
          return true
        }),
    [query, section],
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

  const sectionTrendOptions = {
    chart: { type: "area" },
    xAxis: { categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
    yAxis: { labels: { format: "{value}" } },
    legend: { enabled: false },
    tooltip: { pointFormat: "<b>{point.y}</b>" },
    series: [
      {
        type: "area",
        name: sectionMeta.title,
        data:
          section === "cards"
            ? weeklyData.map((item) => item.cards)
            : section === "emi"
              ? weeklyData.map((item) => item.emi)
              : section === "wallets"
                ? weeklyData.map((item) => item.wallets)
                : weeklyData.map((item) => item.upi),
        color:
          section === "cards"
            ? "var(--color-chart-2)"
            : section === "emi"
              ? "var(--color-chart-4)"
              : section === "wallets"
                ? "var(--color-chart-3)"
                : "var(--color-primary)",
        fillOpacity: 0.16,
      },
    ],
  } as const

  const leftContext = (
    <div className="h-full overflow-y-auto p-3">
      <p className="px-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Online Payments</p>
      <div className="mt-2 space-y-1">
        {[
          { key: "overview", label: "Overview" },
          { key: "transactions", label: "Transactions" },
          { key: "settlements", label: "Settlements" },
          { key: "disputes", label: "Disputes" },
          { key: "refunds", label: "Refunds" },
          { key: "reports", label: "Reports" },
          { key: "vas", label: "Value Added Services" },
        ].map((item) => {
          const active = navSection === item.key
          return (
            <button
              key={item.key}
              onClick={() => {
                setNavSection(item.key as NavSection)
                setRightContext(null)
              }}
              className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                active ? "bg-secondary/70 text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <p className="text-[13px] font-medium">{item.label}</p>
            </button>
          )
        })}
      </div>
    </div>
  )

  const transactionsList = (
    <section className="overflow-hidden rounded-lg bg-card/80">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-[13px] font-semibold text-foreground">Transactions</p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-8 w-48 border-0 bg-muted/70 pl-8 text-xs"
            />
          </div>
          <Button variant="ghost" size="icon-sm" className="h-8 w-8 text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="space-y-1 px-2 pb-2">
        {filteredTxns.map((txn) => {
          const SI = statusIcon[txn.status] ?? CheckCircle2
          const MI = methodIcon[txn.method] ?? CreditCard
          const selected = rightContext?.kind === "transaction" && rightContext.id === txn.id
          return (
            <button
              key={txn.id}
              onClick={() => setRightContext({ kind: "transaction", id: txn.id })}
              className={`intercom-panel-row ${selected ? "intercom-panel-row-active" : ""}`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <MI className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{txn.merchant}</p>
                  <p className="text-sm font-semibold text-foreground">₹{txn.amount.toLocaleString("en-IN")}</p>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-muted-foreground">{txn.label} · {txn.time}</p>
                  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${statusBadge[txn.status]}`}>
                    {txn.status}
                  </Badge>
                </div>
              </div>
              <SI className={`h-4 w-4 shrink-0 ${txn.status === "success" ? "text-success" : txn.status === "failed" ? "text-destructive" : "text-warning"}`} />
            </button>
          )
        })}
      </div>
    </section>
  )

  const centerMain = (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <section className="rounded-lg bg-card/80 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{navSection}</p>
            <h2 className="text-[15px] font-semibold text-foreground">Online payments workspace</h2>
          </div>
          {navSection !== "vas" && (
            <>
              <div className="ml-auto flex items-center gap-1 rounded-md bg-muted/70 p-1">
                {methodOrder.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setSection(option.key)}
                    className={`rounded-sm px-2.5 py-1 text-[11px] ${
                      section === option.key ? "bg-card text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {option.key === "overview" ? "All" : option.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 rounded-md bg-muted/70 p-1">
                {segmentOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSegment(option)}
                    className={`rounded-sm px-2.5 py-1 text-[11px] ${segment === option ? "bg-card text-foreground" : "text-muted-foreground"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {navSection === "overview" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {sectionMeta.stats.map((item) => (
              <div key={item.label} className="rounded-lg bg-card/80 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-[15px] font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>

          <section className="overflow-hidden rounded-lg bg-card/80 p-3">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{sectionMeta.subtitle}</p>
                <h3 className="text-[14px] font-semibold text-foreground">{sectionMeta.title} analytics</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() =>
                  setRightContext({
                    kind: "metric",
                    title: `${sectionMeta.title} drilldown`,
                    description: "Performance is stable. Optimize retries and routing in peak hours.",
                    value: sectionMeta.stats[0]?.value ?? "—",
                  })
                }
              >
                Open Details
              </Button>
            </div>
            <div className="h-64 overflow-hidden rounded-md bg-muted/45 p-2">
              <HighchartsPanelChart options={section === "overview" ? volumeOptions : sectionTrendOptions} />
            </div>
          </section>
          {transactionsList}
        </>
      )}

      {navSection === "transactions" && transactionsList}

      {navSection === "settlements" && (
        <section className="rounded-lg bg-card/80 p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Settlements</p>
          <div className="mt-3 space-y-2">
            {[
              ["Today's settlement", "₹84,120", "Completed"],
              ["T+1 batch", "₹1,42,330", "Processing"],
              ["Holdback review", "₹12,490", "Needs action"],
            ].map(([label, value, state]) => (
              <button
                key={label}
                onClick={() => setRightContext({ kind: "metric", title: String(label), description: "Settlement context and actions.", value: String(value) })}
                className="intercom-panel-row"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{state}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">{value}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {navSection === "disputes" && (
        <section className="rounded-lg bg-card/80 p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Disputes</p>
          <div className="mt-3 space-y-2">
            {[
              ["DP-3342", "Chargeback initiated", "₹4,300"],
              ["DP-3337", "Evidence required", "₹12,500"],
            ].map(([id, state, amount]) => (
              <button
                key={id}
                onClick={() => setRightContext({ kind: "metric", title: String(id), description: "Dispute handling steps and SLA timers.", value: String(amount) })}
                className="intercom-panel-row"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{id}</p>
                  <p className="text-xs text-muted-foreground">{state}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">{amount}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {navSection === "reports" && (
        <section className="rounded-lg bg-card/80 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Reports</p>
            <Button variant="ghost" size="sm" className="h-8 text-xs">Generate report</Button>
          </div>
          <div className="h-64 overflow-hidden rounded-md bg-muted/45 p-2">
            <HighchartsPanelChart options={volumeOptions} />
          </div>
        </section>
      )}

      {navSection === "refunds" && (
        <section className="rounded-lg bg-card/80 p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Refunds</p>
          <div className="mt-3 space-y-2">
            {[
              ["RF-1202", "Auto-approved", "₹1,200"],
              ["RF-1197", "Manual review", "₹4,400"],
            ].map(([id, state, amount]) => (
              <button
                key={id}
                onClick={() => setRightContext({ kind: "metric", title: String(id), description: "Refund state, SLA and next actions.", value: String(amount) })}
                className="intercom-panel-row"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{id}</p>
                  <p className="text-xs text-muted-foreground">{state}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">{amount}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {navSection === "vas" && (
        <section className="rounded-lg bg-card/80 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Value Added Services</p>
          <div className="space-y-4">
            {vasGroups.map((group) => {
              const groupItems = vasItems.filter((item) => group.itemIds.includes(item.id))
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
        <Button variant="ghost" size="icon-sm" className="h-8 w-8" onClick={() => setRightContext(null)}>
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
          <p className="text-xl font-semibold text-foreground">₹{selectedTxn.amount.toLocaleString("en-IN")}</p>
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
        <Button variant="ghost" size="icon-sm" className="h-8 w-8" onClick={() => setRightContext(null)}>
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
        <Button variant="ghost" size="icon-sm" className="h-8 w-8" onClick={() => setRightContext(null)}>
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
    <WorkspaceShell
      leftContext={leftContext}
      showLeftContext
      centerMain={centerMain}
      rightContext={rightPane}
      showRightContext={Boolean(rightContext)}
      leftWidth={260}
      leftMaxWidth={300}
      centerMaxWidth={1080}
    />
  )
}
