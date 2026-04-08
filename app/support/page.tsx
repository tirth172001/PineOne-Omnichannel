"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PanelEmpty } from "@/components/ui/panels"
import { Search, MessageCircle, Phone, Mail, FileText, CheckCircle2, Clock, X, XCircle, ArrowRight, Plus, Zap } from "lucide-react"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"

const categories = [
  { id: "payments", label: "Payments & Transactions", icon: Zap, count: 24 },
  { id: "settlements", label: "Settlements & Payouts", icon: FileText, count: 12 },
  { id: "devices", label: "POS Devices", icon: Phone, count: 8 },
  { id: "account", label: "Account & KYC", icon: FileText, count: 6 },
  { id: "integration", label: "Integration & API", icon: FileText, count: 15 },
]

const tickets = [
  { id: "TKT-1236", title: "Payment gateway timeout during peak hours", status: "open", date: "30 min ago", cat: "payments" },
  { id: "TKT-1235", title: "Settlement not received for Apr 5", status: "open", date: "3 hours ago", cat: "settlements" },
  { id: "TKT-1234", title: "UPI transaction failed — customer charged", status: "resolved", date: "2 days ago", cat: "payments" },
  { id: "TKT-1233", title: "Settlement delay inquiry — March batch", status: "resolved", date: "5 days ago", cat: "settlements" },
  { id: "TKT-1232", title: "POS terminal not connecting to Bluetooth", status: "resolved", date: "1 week ago", cat: "devices" },
]

const articles: Record<string, Array<{ title: string; desc: string }>> = {
  payments: [
    { title: "Why do UPI transactions fail?", desc: "Common reasons and how to prevent them" },
    { title: "Checking payment status in the dashboard", desc: "Step-by-step guide" },
    { title: "Refund process and timelines", desc: "How to initiate and track refunds" },
    { title: "EMI not showing at checkout", desc: "Troubleshoot EMI availability issues" },
  ],
  settlements: [
    { title: "Understanding settlement cycles", desc: "T+1, T+2 and instant settlement explained" },
    { title: "Why is my settlement on hold?", desc: "Common reasons and resolution steps" },
    { title: "How to change bank account for settlements", desc: "Update banking details safely" },
  ],
  devices: [
    { title: "POS device setup guide", desc: "Step-by-step activation walkthrough" },
    { title: "Troubleshoot Bluetooth connectivity", desc: "Common fixes for connection issues" },
    { title: "Updating POS firmware", desc: "How to keep your device up to date" },
  ],
  account: [
    { title: "Completing KYC verification", desc: "Documents required and submission steps" },
    { title: "Adding a team member", desc: "Roles, permissions, and invitations" },
    { title: "Changing business category", desc: "Impact and process explained" },
  ],
  integration: [
    { title: "Getting started with Pine One API", desc: "Authentication, endpoints, webhooks" },
    { title: "Webhook setup and testing", desc: "Configure and verify event delivery" },
    { title: "SDK installation guide", desc: "Node.js, Python, PHP, and more" },
    { title: "Test mode vs Live mode", desc: "How to switch and what changes" },
  ],
}

const statusMap = {
  open: { Icon: Clock, badge: "bg-primary/10 text-primary border-primary/20", label: "Open" },
  resolved: { Icon: CheckCircle2, badge: "bg-success/10 text-success border-success/20", label: "Resolved" },
  closed: { Icon: XCircle, badge: "bg-muted text-muted-foreground border-border", label: "Closed" },
}

function TicketDetail({ ticket }: { ticket: typeof tickets[0] }) {
  const { Icon, badge, label } = statusMap[ticket.status as keyof typeof statusMap]
  return (
    <div className="p-5 space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted shrink-0">
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-base font-semibold text-foreground">{ticket.title}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant="outline" className={`text-xs gap-1 ${badge}`}>
              <Icon className="h-3 w-3" />{label}
            </Badge>
            <span className="text-xs text-muted-foreground">{ticket.date}</span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        {[["Ticket ID", ticket.id], ["Category", ticket.cat], ["Opened", ticket.date], ["Last Updated", ticket.date]].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{k}</span>
            <span className="text-xs font-medium text-foreground capitalize">{v}</span>
          </div>
        ))}
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Conversation</p>
        <div className="space-y-3">
          <div className="bg-muted/40 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground mb-1">You · {ticket.date}</p>
            <p className="text-sm text-foreground">I&apos;m facing an issue with {ticket.title.toLowerCase()}. Please help resolve this as soon as possible.</p>
          </div>
          {ticket.status === "resolved" && (
            <div className="bg-primary/5 rounded-lg p-3">
              <p className="text-[10px] text-primary mb-1">Pine One Support · Resolved</p>
              <p className="text-sm text-foreground">This issue has been resolved. Please let us know if you face any further issues.</p>
            </div>
          )}
        </div>
      </div>

      {ticket.status === "open" && (
        <div>
          <Input placeholder="Type your reply..." className="h-9 text-sm bg-muted border-border mb-2" />
          <Button size="sm" className="gap-1.5">Send Reply</Button>
        </div>
      )}
    </div>
  )
}

function CategoryDetail({ catId }: { catId: string }) {
  const arts = articles[catId] ?? []
  return (
    <div className="p-5 space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Help Articles</p>
        <div className="space-y-2">
          {arts.map(a => (
            <div key={a.title} className="flex cursor-pointer items-center gap-3 rounded-lg bg-muted/35 p-3 transition-colors hover:bg-muted/55">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Still need help?</p>
        <div className="grid grid-cols-3 gap-2">
          {[{ I: MessageCircle, l: "Live Chat", sub: "24/7" }, { I: Phone, l: "Call Us", sub: "1800-xxx-xxxx" }, { I: Mail, l: "Email", sub: "support@pinelabs.com" }].map(({ I, l, sub }) => (
            <button key={l} className="flex flex-col items-center gap-2 rounded-lg bg-muted/35 p-4 transition-colors hover:bg-muted/55">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <I className="h-4 w-4 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-foreground">{l}</p>
                <p className="text-[10px] text-muted-foreground">{sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SupportPage() {
  const [section, setSection] = useState<"overview" | "tickets" | "knowledge" | "automation" | "reports">("overview")
  const [view, setView] = useState<"categories" | "tickets">("categories")
  const [selected, setSelected] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const mode = section === "tickets" ? "tickets" : section === "knowledge" ? "categories" : view
  const filteredTickets = tickets.filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
  const filteredCategories = categories.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
  const selectedTicket = tickets.find(t => t.id === selected)

  const leftContext = (
    <div className="h-full overflow-y-auto p-3">
      <p className="px-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Support</p>
      <div className="mt-2 space-y-1">
        {[
          { key: "overview", label: "Overview" },
          { key: "tickets", label: "Tickets" },
          { key: "knowledge", label: "Knowledge Base" },
          { key: "automation", label: "Automations" },
          { key: "reports", label: "Reports" },
        ].map((item) => {
          const active = section === item.key
          return (
            <button
              key={item.key}
              onClick={() => {
                const next = item.key as typeof section
                setSection(next)
                setSelected(null)
                if (next === "tickets") setView("tickets")
                if (next === "knowledge") setView("categories")
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
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{section}</p>
            <h2 className="text-[15px] font-semibold text-foreground">Support workspace</h2>
          </div>
          <Button size="sm" className="ml-auto h-8 gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> New Ticket
          </Button>
        </div>
      </section>

      {(section === "overview" || section === "tickets" || section === "knowledge") && (
      <div className="overflow-hidden rounded-lg bg-card/80">
        {section === "overview" && (
          <div className="px-3 py-2">
            <div className="flex gap-1 rounded-md bg-muted p-0.5">
            {(["categories", "tickets"] as const).map(v => (
              <button key={v} onClick={() => { setView(v); setSelected(null) }}
                className={`flex-1 rounded px-2 py-1 text-xs capitalize transition-colors ${view === v ? "bg-card text-foreground font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {v}
              </button>
            ))}
          </div>
          </div>
        )}

        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder={mode === "categories" ? "Search topics..." : "Search tickets..."} value={query} onChange={e => setQuery(e.target.value)} className="h-8 border-0 bg-muted/70 pl-8 text-xs" />
          </div>
        </div>

        <div className="space-y-1 px-2 pb-2">
          {mode === "categories" ? (
            filteredCategories.map(cat => {
              const Icon = cat.icon
              const sel = selected === cat.id
              return (
                <button key={cat.id} onClick={() => setSelected(cat.id)}
                  className={`intercom-panel-row ${sel ? "intercom-panel-row-active" : ""}`}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{cat.label}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{cat.count} articles</span>
                </button>
              )
            })
          ) : (
            filteredTickets.map(ticket => {
              const { Icon, badge, label } = statusMap[ticket.status as keyof typeof statusMap]
              const sel = selected === ticket.id
              return (
                <button key={ticket.id} onClick={() => setSelected(ticket.id)}
                  className={`intercom-panel-row ${sel ? "intercom-panel-row-active" : ""}`}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{ticket.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground">{ticket.date}</p>
                      <Badge variant="outline" className={`text-[9px] gap-0.5 px-1.5 py-0 ${badge}`}>
                        <Icon className="h-2.5 w-2.5" />{label}
                      </Badge>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>
      )}

      {section === "automation" && (
        <section className="rounded-lg bg-card/80 p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Automations</p>
          <div className="mt-3 space-y-2">
            {["Auto-route payment failures", "Daily settlement digest", "Ticket SLA reminder"].map((a) => (
              <button key={a} className="intercom-panel-row">
                <p className="text-sm text-foreground">{a}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {section === "reports" && (
        <section className="rounded-lg bg-card/80 p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Reports</p>
          <div className="mt-3 space-y-2">
            {["Open tickets report", "Resolution trend report", "Category volume report"].map((r) => (
              <button key={r} className="intercom-panel-row">
                <p className="text-sm text-foreground">{r}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )

  const rightContextBody =
    mode === "tickets" && selectedTicket ? (
      <TicketDetail ticket={selectedTicket} />
    ) : mode === "categories" && selected ? (
      <CategoryDetail catId={selected} />
    ) : (
      <PanelEmpty
        icon={mode === "tickets" ? MessageCircle : FileText}
        title={mode === "tickets" ? "Select a ticket" : "Select a topic"}
        description={mode === "tickets" ? "View your support tickets and conversations here." : "Browse help articles by category or search for your issue."}
      />
    )

  const rightContext = (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Context</p>
          <p className="text-[16px] font-semibold text-foreground">{mode === "tickets" ? "Ticket detail" : "Support topic"}</p>
        </div>
        <Button variant="ghost" size="icon-sm" className="h-8 w-8" onClick={() => setSelected(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      {rightContextBody}
    </div>
  )

  return (
    <DashboardLayout>
      <WorkspaceShell
        leftContext={leftContext}
        showLeftContext
        centerMain={centerMain}
        rightContext={rightContext}
        showRightContext={Boolean(selected)}
        leftWidth={248}
        leftMaxWidth={300}
        centerMaxWidth={1080}
      />
    </DashboardLayout>
  )
}
