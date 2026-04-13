"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PanelEmpty } from "@/components/ui/panels"
import { MessageCircle, Phone, Mail, FileText, CheckCircle2, Clock, X, XCircle, ArrowRight, Plus, Zap } from "lucide-react"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"

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

const automationRows = [
  { id: "AUT-11", title: "Auto-route payment failures", cadence: "Real-time", owner: "Support Ops" },
  { id: "AUT-12", title: "Daily settlement digest", cadence: "Daily", owner: "Finance Ops" },
  { id: "AUT-13", title: "Ticket SLA reminder", cadence: "Hourly", owner: "Support Ops" },
]

const reportRows = [
  { id: "RPT-21", title: "Open tickets report", cadence: "Daily", owner: "Support Ops" },
  { id: "RPT-22", title: "Resolution trend report", cadence: "Weekly", owner: "Operations" },
  { id: "RPT-23", title: "Category volume report", cadence: "Weekly", owner: "Analytics" },
]

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
            <Button variant="ghost" key={l} className="flex flex-col items-center gap-2 rounded-lg bg-muted/35 p-4 transition-colors hover:bg-muted/55">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <I className="h-4 w-4 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-foreground">{l}</p>
                <p className="text-[10px] text-muted-foreground">{sub}</p>
              </div>
            </Button>
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

  const mode = section === "tickets" ? "tickets" : section === "knowledge" ? "categories" : view
  const selectedTicket = tickets.find(t => t.id === selected)

  const categoryColumns: DataTableColumn<(typeof categories)[number]>[] = [
    { id: "id", header: "Code", accessorKey: "id", width: 120, pinnable: true },
    {
      id: "label",
      header: "Category",
      accessorKey: "label",
      width: 260,
      cell: (category) => (
        <div className="flex items-center gap-2">
          <category.icon className="size-3.5 text-muted-foreground" />
          <span>{category.label}</span>
        </div>
      ),
    },
    { id: "count", header: "Articles", getValue: (category) => category.count, align: "right", width: 90 },
  ]

  const ticketColumns: DataTableColumn<(typeof tickets)[number]>[] = [
    { id: "id", header: "Ticket", accessorKey: "id", width: 120, pinnable: true },
    { id: "title", header: "Issue", accessorKey: "title", width: 320 },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      width: 110,
      filterOptions: [
        { label: "Open", value: "open" },
        { label: "Resolved", value: "resolved" },
        { label: "Closed", value: "closed" },
      ],
      cell: (ticket) => {
        const { Icon, badge, label } = statusMap[ticket.status as keyof typeof statusMap]
        return (
          <Badge variant="outline" className={`text-[10px] ${badge}`}>
            <Icon className="mr-1 size-3" />
            {label}
          </Badge>
        )
      },
    },
    { id: "cat", header: "Category", accessorKey: "cat", width: 130 },
    { id: "date", header: "Updated", accessorKey: "date", align: "right", width: 120 },
  ]

  const automationColumns: DataTableColumn<(typeof automationRows)[number]>[] = [
    { id: "id", header: "ID", accessorKey: "id", width: 90, pinnable: true },
    { id: "title", header: "Automation", accessorKey: "title", width: 280 },
    { id: "cadence", header: "Cadence", accessorKey: "cadence", width: 120 },
    { id: "owner", header: "Owner", accessorKey: "owner", width: 130 },
  ]

  const reportColumns: DataTableColumn<(typeof reportRows)[number]>[] = [
    { id: "id", header: "ID", accessorKey: "id", width: 90, pinnable: true },
    { id: "title", header: "Report", accessorKey: "title", width: 280 },
    { id: "cadence", header: "Cadence", accessorKey: "cadence", width: 120 },
    { id: "owner", header: "Owner", accessorKey: "owner", width: 130 },
  ]

  const leftContext = (
    <div className="left-panel-content">
      <p className="left-panel-label">Support</p>
      <div className="left-panel-stack">
        {[
          { key: "overview", label: "Overview" },
          { key: "tickets", label: "Tickets" },
          { key: "knowledge", label: "Knowledge Base" },
          { key: "automation", label: "Automations" },
          { key: "reports", label: "Reports" },
        ].map((item) => {
          const active = section === item.key
          return (
            <Button variant="ghost"
              key={item.key}
              onClick={() => {
                const next = item.key as typeof section
                setSection(next)
                setSelected(null)
                if (next === "tickets") setView("tickets")
                if (next === "knowledge") setView("categories")
              }}
              className={`left-panel-item ${active ? "left-panel-item-active" : "left-panel-item-inactive"}`}
            >
              {item.label}
            </Button>
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
        <div className="space-y-2">
          {section === "overview" && (
            <div className="rounded-lg bg-card/80 px-3 py-2">
              <div className="flex gap-1 rounded-md bg-muted p-0.5">
                {(["categories", "tickets"] as const).map((v) => (
                  <Button
                    variant="ghost"
                    key={v}
                    onClick={() => {
                      setView(v)
                      setSelected(null)
                    }}
                    className={`flex-1 rounded px-2 py-1 text-xs capitalize transition-colors ${view === v ? "bg-card text-foreground font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {v}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {mode === "categories" ? (
            <DataTable
              data={categories}
              columns={categoryColumns}
              rowId={(category) => category.id}
              selectedRowId={selected}
              onRowClick={(category) => setSelected(category.id)}
              searchPlaceholder="Search topics..."
              emptyText="No support topics found"
              initialPinnedColumnIds={["id"]}
            />
          ) : (
            <DataTable
              data={tickets}
              columns={ticketColumns}
              rowId={(ticket) => ticket.id}
              selectedRowId={selected}
              onRowClick={(ticket) => setSelected(ticket.id)}
              searchPlaceholder="Search tickets..."
              emptyText="No tickets found"
              initialPinnedColumnIds={["id"]}
            />
          )}
        </div>
      )}

      {section === "automation" && (
        <DataTable
          data={automationRows}
          columns={automationColumns}
          rowId={(row) => row.id}
          searchPlaceholder="Search automations..."
          emptyText="No automations found"
          initialPinnedColumnIds={["id"]}
        />
      )}

      {section === "reports" && (
        <DataTable
          data={reportRows}
          columns={reportColumns}
          rowId={(row) => row.id}
          searchPlaceholder="Search reports..."
          emptyText="No reports found"
          initialPinnedColumnIds={["id"]}
        />
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
        <Button variant="ghost" size="icon-sm" className="h-8 w-8" aria-label="Close support context panel" onClick={() => setSelected(null)}>
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
      />
    </DashboardLayout>
  )
}
