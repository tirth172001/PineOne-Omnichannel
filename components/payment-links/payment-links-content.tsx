"use client"

import { useState } from "react"
import { Link2, Plus, Copy, Share2, CheckCircle2, X, XCircle, Clock, Search, Filter, Download, QrCode, Mail, MessageSquare, ExternalLink, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { PanelEmpty } from "@/components/ui/panels"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"

type LinkSection = "overview" | "active" | "paid" | "expired" | "create"
type LinkNavSection = "overview" | "transactions" | "settlements" | "disputes" | "refunds" | "reports" | "vas"
type VasItem = { id: string; name: string; detail: string; enabled: boolean; requiresConfig: boolean }
type VasConfig = { label: string; cadence: string; owner: string }

const links = [
  { id: "PL-001", name: "Anniversary Sale — 20% off", amount: 2499, status: "active", created: "Today", expires: "7 days", views: 48, conversions: 12, revenue: "₹29,988" },
  { id: "PL-002", name: "Custom Order — Laptop Stand", amount: 3200, status: "active", created: "Yesterday", expires: "14 days", views: 8, conversions: 3, revenue: "₹9,600" },
  { id: "PL-003", name: "Bulk Office Supplies", amount: 12500, status: "paid", created: "2 days ago", expires: "Paid", views: 5, conversions: 1, revenue: "₹12,500" },
  { id: "PL-004", name: "Website Redesign Deposit", amount: 25000, status: "active", created: "3 days ago", expires: "10 days", views: 3, conversions: 0, revenue: "₹0" },
  { id: "PL-005", name: "Product Photography Pack", amount: 8000, status: "expired", created: "5 days ago", expires: "Expired", views: 22, conversions: 8, revenue: "₹64,000" },
  { id: "PL-006", name: "Event Catering Advance", amount: 15000, status: "active", created: "6 days ago", expires: "4 days", views: 12, conversions: 4, revenue: "₹60,000" },
  { id: "PL-007", name: "Monthly Subscription", amount: 999, status: "paid", created: "Last week", expires: "Paid", views: 30, conversions: 28, revenue: "₹27,972" },
  { id: "PL-008", name: "Consulting Fee — March", amount: 18000, status: "expired", created: "10 days ago", expires: "Expired", views: 4, conversions: 0, revenue: "₹0" },
]

const defaultVasItems: VasItem[] = [
  { id: "smart-reminders", name: "Smart reminders", detail: "Auto-send follow-ups based on payer intent windows.", enabled: true, requiresConfig: true },
  { id: "brand-templates", name: "Branded templates", detail: "Use custom themes and dynamic fields for link pages.", enabled: false, requiresConfig: true },
  { id: "partial-payments", name: "Partial payments", detail: "Allow split collections with due-date milestones.", enabled: false, requiresConfig: false },
]

const defaultVasConfig: Record<string, VasConfig> = {
  "smart-reminders": { label: "Reminder workflow", cadence: "24", owner: "Collections Team" },
  "brand-templates": { label: "Branded checkout", cadence: "0", owner: "Design Ops" },
  "partial-payments": { label: "Split collection", cadence: "48", owner: "Finance Ops" },
}

const vasGroups = [
  { id: "collection", title: "Collection acceleration", itemIds: ["smart-reminders", "partial-payments"] },
  { id: "branding", title: "Experience and branding", itemIds: ["brand-templates"] },
] as const

const statusMap = {
  active: { Icon: Clock, badge: "bg-primary/10 text-primary border-primary/20", label: "Active" },
  paid: { Icon: CheckCircle2, badge: "bg-success/10 text-success border-success/20", label: "Paid" },
  expired: { Icon: XCircle, badge: "bg-muted text-muted-foreground border-border", label: "Expired" },
}

function LinkRow({ link, selected, onClick }: { link: typeof links[0]; selected: boolean; onClick: () => void }) {
  const { badge, label } = statusMap[link.status as keyof typeof statusMap]
  return (
    <button onClick={onClick}
      className={`intercom-panel-row ${selected ? "intercom-panel-row-active" : ""}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
        <Link2 className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground truncate">{link.name}</p>
          <p className="text-sm font-semibold text-foreground shrink-0">₹{link.amount.toLocaleString("en-IN")}</p>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground">{link.created} · {link.conversions}/{link.views} conversions</p>
          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 shrink-0 ${badge}`}>{label}</Badge>
        </div>
      </div>
    </button>
  )
}

function LinkDetail({ link }: { link: typeof links[0] }) {
  const { Icon, badge, label } = statusMap[link.status as keyof typeof statusMap]
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
          <Link2 className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-foreground">{link.name}</p>
          <p className="text-2xl font-bold text-foreground mt-0.5">₹{link.amount.toLocaleString("en-IN")}</p>
          <Badge variant="outline" className={`mt-1.5 text-xs gap-1 ${badge}`}>
            <Icon className="h-3 w-3" />{label}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Share row */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Share Link</p>
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
          <p className="text-xs text-muted-foreground flex-1 truncate font-mono">pinelabs.one/pay/{link.id.toLowerCase()}</p>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 shrink-0" onClick={handleCopy}>
            <Copy className="h-3 w-3" />{copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          {[{I: Mail, l:"Email"},{I: MessageSquare, l:"SMS"},{I: Share2, l:"Share"}].map(({I, l}) => (
            <Button key={l} variant="outline" size="sm" className="flex-1 h-8 gap-1.5 text-xs">
              <I className="h-3.5 w-3.5" />{l}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[{l:"Views",v:`${link.views}`},{l:"Conversions",v:`${link.conversions}`},{l:"Revenue",v:link.revenue}].map(s => (
          <div key={s.l} className="rounded-lg bg-muted/40 px-3 py-2.5 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">{s.l}</p>
            <p className="text-sm font-bold text-foreground">{s.v}</p>
          </div>
        ))}
      </div>

      {/* Conversion bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs text-muted-foreground">Conversion rate</p>
          <p className="text-sm font-bold text-foreground">{link.views > 0 ? Math.round((link.conversions/link.views)*100) : 0}%</p>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${link.views > 0 ? Math.round((link.conversions/link.views)*100) : 0}%` }} />
        </div>
      </div>

      <Separator />

      {/* Details */}
      <div className="space-y-3">
        {[["Link ID", link.id],["Created", link.created],["Expires", link.expires],["Amount", `₹${link.amount.toLocaleString("en-IN")}`]].map(([k,v]) => (
          <div key={k} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{k}</span>
            <span className="text-xs font-medium text-foreground">{v}</span>
          </div>
        ))}
      </div>

      {/* QR code placeholder */}
      <div className="flex items-center gap-4 rounded-lg bg-muted/40 p-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-card/70">
          <QrCode className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">QR Code</p>
          <p className="text-xs text-muted-foreground mt-0.5">Share as image or print for in-store display</p>
          <Button variant="outline" size="sm" className="mt-2 h-7 text-xs gap-1.5"><Download className="h-3 w-3" />Download QR</Button>
        </div>
      </div>

      {link.status === "active" && (
        <Button variant="ghost" size="sm" className="w-full gap-1.5 text-destructive hover:text-destructive">
          Deactivate Link
        </Button>
      )}
    </div>
  )
}

function CreateLinkForm() {
  return (
    <div className="p-5 space-y-4">
      <p className="text-sm font-semibold text-foreground">New Payment Link</p>
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Link Name</Label>
          <Input placeholder="e.g. Product order, Invoice #123" className="h-9 text-sm bg-muted border-border" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Amount (₹)</Label>
          <Input placeholder="0.00" type="number" className="h-9 text-sm bg-muted border-border" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Expiry (days)</Label>
          <Input placeholder="7" type="number" className="h-9 text-sm bg-muted border-border" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Description (optional)</Label>
          <Input placeholder="Add a note for your customer" className="h-9 text-sm bg-muted border-border" />
        </div>
        <Button className="w-full gap-1.5">
          <Plus className="h-4 w-4" /> Create Payment Link
        </Button>
      </div>
    </div>
  )
}

export function PaymentLinksContent() {
  const [selected, setSelected] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [navSection, setNavSection] = useState<LinkNavSection>("overview")
  const [section, setSection] = useState<LinkSection>("overview")
  const [rightTab, setRightTab] = useState<"detail" | "create">("detail")
  const [vasItems, setVasItems] = useState<VasItem[]>(defaultVasItems)
  const [selectedVasId, setSelectedVasId] = useState<string | null>(null)
  const [vasConfigById, setVasConfigById] = useState<Record<string, VasConfig>>(defaultVasConfig)
  const [vasPreferences, setVasPreferences] = useState({
    reminderDigest: true,
    approvalGuardrails: true,
    autoPublish: false,
  })

  const selectedLink = links.find(l => l.id === selected)
  const selectedVas = vasItems.find((item) => item.id === selectedVasId) ?? null
  const selectedVasConfig = selectedVas ? vasConfigById[selectedVas.id] : null
  const filtered = links
    .filter((l) => {
      if (section === "overview") return true
      if (section === "create") return true
      return l.status === section
    })
    .filter(l => l.name.toLowerCase().includes(query.toLowerCase()))

  const leftContext = (
    <div className="h-full overflow-y-auto p-3">
      <p className="px-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Pay By Link</p>
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
                setNavSection(item.key as LinkNavSection)
                setSelected(null)
                setSelectedVasId(null)
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

  const centerMain = (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <section className="rounded-lg bg-card/80 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{navSection}</p>
            <h2 className="text-[15px] font-semibold text-foreground">Payment links workspace</h2>
          </div>
          {navSection !== "vas" && (
            <div className="ml-auto flex items-center gap-1 rounded-md bg-muted/70 p-1">
              {[
                { key: "overview", label: "All" },
                { key: "active", label: "Active" },
                { key: "paid", label: "Paid" },
                { key: "expired", label: "Expired" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSection(item.key as LinkSection)}
                  className={`rounded-sm px-2.5 py-1 text-[11px] ${
                    section === item.key ? "bg-card text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {(navSection === "overview" || navSection === "transactions") && (
        <>
          {navSection === "overview" && (
            <div className="grid grid-cols-4 gap-3">
              {[{l:"Active",v:`${links.filter(l=>l.status==="active").length}`},{l:"Paid",v:`${links.filter(l=>l.status==="paid").length}`},{l:"Expired",v:`${links.filter(l=>l.status==="expired").length}`},{l:"Revenue",v:"₹2.03L"}].map(s => (
                <div key={s.l} className="rounded-lg bg-card/80 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
                  <p className="mt-1 text-[15px] font-semibold text-foreground">{s.v}</p>
                </div>
              ))}
            </div>
          )}

          <div className="overflow-hidden rounded-lg bg-card/80">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search links..." value={query} onChange={e => setQuery(e.target.value)} className="h-8 border-0 bg-muted/70 pl-8 text-xs" />
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setRightTab("create"); setSelected(null) }}>
                Create
              </Button>
            </div>
            <div className="space-y-1 px-2 pb-2">
              {filtered.map(l => <LinkRow key={l.id} link={l} selected={selected===l.id} onClick={() => { setSelected(l.id); setRightTab("detail") }} />)}
            </div>
          </div>
        </>
      )}

      {navSection === "settlements" && (
        <section className="rounded-lg bg-card/80 p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Settlements</p>
          <div className="mt-3 space-y-2">
            {[
              ["Collected today", "₹48,300", "Completed"],
              ["Pending collection", "₹18,900", "In progress"],
            ].map(([title, value, state]) => (
              <button key={title} onClick={() => setRightTab("create")} className="intercom-panel-row">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{title}</p>
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
              ["LNK-884", "Customer reversed transfer", "₹2,400"],
              ["LNK-871", "Payer bank timeout", "₹1,800"],
            ].map(([id, state, value]) => (
              <button key={id} onClick={() => setRightTab("create")} className="intercom-panel-row">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{id}</p>
                  <p className="text-xs text-muted-foreground">{state}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">{value}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {navSection === "reports" && (
        <section className="rounded-lg bg-card/80 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Reports</p>
            <Button variant="ghost" size="sm" className="h-8 text-xs">Generate report</Button>
          </div>
          <div className="space-y-2">
            {["Link conversion report", "Collection velocity report", "Channel performance report"].map((r) => (
              <button key={r} className="intercom-panel-row">
                <p className="text-sm text-foreground">{r}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {navSection === "refunds" && (
        <section className="rounded-lg bg-card/80 p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Refunds</p>
          <div className="mt-3 space-y-2">
            {[
              ["PLR-392", "Refund completed", "₹999"],
              ["PLR-381", "Waiting bank confirmation", "₹1,850"],
            ].map(([id, status, value]) => (
              <button key={id} onClick={() => setRightTab("create")} className="intercom-panel-row">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{id}</p>
                  <p className="text-xs text-muted-foreground">{status}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">{value}</p>
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
                  key: "reminderDigest",
                  label: "Reminder digest",
                  desc: "Share daily reminder effectiveness across active links.",
                },
                {
                  key: "approvalGuardrails",
                  label: "Approval guardrails",
                  desc: "Require review before high-value VAS changes are applied.",
                },
                {
                  key: "autoPublish",
                  label: "Auto publish templates",
                  desc: "Automatically publish approved branded templates.",
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
            <p className="text-xs text-muted-foreground">Reminder cadence (hours)</p>
            <Input
              value={selectedVasConfig.cadence}
              onChange={(event) =>
                setVasConfigById((current) => ({
                  ...current,
                  [selectedVas.id]: { ...current[selectedVas.id], cadence: event.target.value },
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
  ) : rightTab === "create" ? <CreateLinkForm /> : selectedLink ? <LinkDetail link={selectedLink} /> : (
    <PanelEmpty icon={Link2} title="Select a payment link" description="Click a link to open contextual actions like sharing, QR, and lifecycle controls." />
  )

  const rightContext = (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Context</p>
          <p className="text-[16px] font-semibold text-foreground">
            {selectedVas ? "Service configuration" : rightTab === "create" ? "Create link" : "Link detail"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8"
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
      showLeftContext
      centerMain={centerMain}
      rightContext={rightContext}
      showRightContext={Boolean(selectedVas) || rightTab === "create" || Boolean(selectedLink)}
      leftWidth={248}
      leftMaxWidth={300}
      centerMaxWidth={1080}
    />
  )
}
