"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PanelEmpty, PageHeader } from "@/components/ui/panels"
import { TrendingUp, Wallet, Users, Landmark, ShoppingCart, RefreshCw, Shield, CheckCircle2, ArrowRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"

const useCases = [
  {
    id: "increase-sales",
    title: "Increase Sales & Conversion",
    description: "Boost average order value and reduce cart abandonment",
    icon: TrendingUp,
    color: "bg-primary/10 text-primary",
    stats: "Up to 40% higher AOV",
    tag: "Growth",
    products: [
      { id: "emi", name: "EMI", impact: "Increase ticket size with installments", href: "/products/emi" },
      { id: "pay-later", name: "Pay Later", impact: "Convert price-sensitive customers", href: "/products/pay-later" },
      { id: "offers", name: "Bank Offers", impact: "Attract customers with discounts", href: "/products/offers" },
      { id: "credit-line-upi", name: "Credit Line on UPI", impact: "Enable larger purchases", href: "/products/credit-line-upi" },
    ],
  },
  {
    id: "manage-cash-flow",
    title: "Manage Cash Flow",
    description: "Get faster access to your money and manage working capital",
    icon: Wallet,
    color: "bg-chart-2/10 text-chart-2",
    stats: "Same-day settlements",
    tag: "Finance",
    products: [
      { id: "instant-settlement", name: "Instant Settlement", impact: "Get paid within hours", href: "/offline-payments" },
      { id: "merchant-lending", name: "Merchant Lending", impact: "Quick loans when you need them", href: "/products/merchant-lending" },
      { id: "working-capital", name: "Working Capital", impact: "Bridge short-term gaps", href: "/products/working-capital" },
    ],
  },
  {
    id: "engage-customers",
    title: "Engage & Retain Customers",
    description: "Build loyalty and keep customers coming back",
    icon: Users,
    color: "bg-chart-3/10 text-chart-3",
    stats: "25% increase in repeat visits",
    tag: "Loyalty",
    products: [
      { id: "loyalty", name: "Loyalty Programs", impact: "Reward repeat purchases", href: "/products/loyalty" },
      { id: "gift-cards", name: "Gift Cards", impact: "Attract new customers", href: "/products/gift-cards" },
      { id: "subscriptions", name: "Subscriptions", impact: "Predictable recurring revenue", href: "/products/subscriptions" },
    ],
  },
  {
    id: "get-credit",
    title: "Get Business Credit",
    description: "Access financing based on your transaction history",
    icon: Landmark,
    color: "bg-chart-4/10 text-chart-4",
    stats: "Pre-approved up to ₹5L",
    tag: "Lending",
    products: [
      { id: "merchant-lending", name: "Merchant Lending", impact: "Instant approval, quick disbursal", href: "/products/merchant-lending" },
      { id: "working-capital", name: "Working Capital", impact: "Flexible repayment terms", href: "/products/working-capital" },
    ],
  },
  {
    id: "sell-online",
    title: "Start Selling Online",
    description: "Accept payments on your website or app",
    icon: ShoppingCart,
    color: "bg-chart-5/10 text-chart-5",
    stats: "Omnichannel presence",
    tag: "Online",
    products: [
      { id: "payment-gateway", name: "Payment Gateway", impact: "Online card and UPI payments", href: "/online-payments" },
      { id: "payment-links", name: "Payment Links", impact: "Accept payments via WhatsApp/SMS", href: "/payment-links" },
      { id: "invoicing", name: "Invoicing", impact: "Send professional invoices", href: "/products/invoicing" },
    ],
  },
  {
    id: "automate-payments",
    title: "Automate Recurring Payments",
    description: "Set up automatic billing for memberships and services",
    icon: RefreshCw,
    color: "bg-primary/10 text-primary",
    stats: "Reduce manual collection",
    tag: "Automation",
    products: [
      { id: "subscriptions", name: "Subscriptions", impact: "Auto-charge customers", href: "/products/subscriptions" },
      { id: "mandates", name: "e-Mandates", impact: "Authorized recurring debits", href: "/products/subscriptions" },
    ],
  },
  {
    id: "protect-business",
    title: "Protect Your Business",
    description: "Prevent fraud and secure your transactions",
    icon: Shield,
    color: "bg-chart-2/10 text-chart-2",
    stats: "AI-powered protection",
    tag: "Security",
    products: [
      { id: "fraud-protection", name: "Fraud Protection", impact: "Block suspicious transactions", href: "/products/fraud-protection" },
      { id: "chargeback-management", name: "Chargeback Management", impact: "Dispute resolution support", href: "/support" },
    ],
  },
]

function UseCaseRow({ uc, selected, onClick }: { uc: typeof useCases[0]; selected: boolean; onClick: () => void }) {
  const Icon = uc.icon
  return (
    <button onClick={onClick}
      className={`intercom-panel-row ${selected ? "intercom-panel-row-active" : ""}`}>
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${uc.color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{uc.title}</p>
        <p className="text-xs text-muted-foreground">{uc.products.length} products · {uc.stats}</p>
      </div>
      <Badge variant="outline" className="text-[9px] shrink-0">{uc.tag}</Badge>
    </button>
  )
}

function UseCaseDetail({ uc }: { uc: typeof useCases[0] }) {
  const Icon = uc.icon
  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ${uc.color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">{uc.title}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{uc.description}</p>
          <Badge variant="outline" className="mt-1.5 text-xs text-primary border-primary/30 bg-primary/10">{uc.tag}</Badge>
        </div>
      </div>

      {/* Impact stat */}
      <div className="bg-primary/5 rounded-lg border border-primary/20 p-4">
        <p className="text-sm text-foreground">
          <span className="font-bold text-primary">{uc.stats}</span>
          {" "}when merchants use these products together
        </p>
      </div>

      <Separator />

      {/* Products */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Recommended Products · {uc.products.length}</p>
        <div className="space-y-2">
          {uc.products.map(product => (
            <Link key={product.id} href={product.href}
              className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-colors">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.impact}</p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      <Separator />

      {/* Category overview */}
      <div className="bg-muted/40 rounded-lg border border-border p-4 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Quick Stats</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { l: "Products", v: `${uc.products.length}` },
            { l: "Active", v: `${Math.ceil(uc.products.length / 2)}` },
            { l: "Available", v: `${Math.floor(uc.products.length / 2)}` },
          ].map(s => (
            <div key={s.l} className="text-center">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">{s.l}</p>
              <p className="text-sm font-bold text-foreground">{s.v}</p>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full gap-1.5" asChild>
        <Link href={uc.products[0]?.href ?? "/products"}>
          Get Started <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  )
}

export function UseCasesContent() {
  const [selected, setSelected] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const filtered = useCases.filter(uc =>
    uc.title.toLowerCase().includes(query.toLowerCase()) ||
    uc.tag.toLowerCase().includes(query.toLowerCase()) ||
    uc.products.some(p => p.name.toLowerCase().includes(query.toLowerCase()))
  )

  const selectedUC = useCases.find(uc => uc.id === selected)
  const centerMain = (
    <div className="h-full overflow-y-auto p-5 space-y-4">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-3 py-2 border-b border-border shrink-0 flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground">Business Goals</p>
          <Badge variant="outline" className="text-[10px]">{useCases.length} use cases</Badge>
        </div>
        <div className="px-3 py-2 border-b border-border shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search goals..." value={query} onChange={e => setQuery(e.target.value)} className="pl-8 h-8 text-xs" />
          </div>
        </div>
        <div className="divide-y divide-border">
          {filtered.map(uc => (
            <UseCaseRow key={uc.id} uc={uc} selected={selected === uc.id} onClick={() => setSelected(uc.id)} />
          ))}
          {filtered.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No matching goals found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const rightContext = selectedUC ? <UseCaseDetail uc={selectedUC} /> : (
    <PanelEmpty icon={TrendingUp} title="Choose a goal" description="Select a business goal to open recommended product bundles and actionable next steps." />
  )

  return (
    <>
      <PageHeader title="Use Cases" description="Not sure which product you need? Start with your goal.">
        {selectedUC && (
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelected(null)}>
            Close Context
          </Button>
        )}
      </PageHeader>
      <WorkspaceShell centerMain={centerMain} rightContext={rightContext} showRightContext={Boolean(selectedUC)} />
    </>
  )
}
