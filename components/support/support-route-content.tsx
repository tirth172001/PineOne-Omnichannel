"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { SupportRequestChatPanel } from "@/components/support/support-request-chat-panel"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"
import { AnimatedNumberText } from "@/components/ui/animated-number-text"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { PageHeader } from "@/components/ui/panels"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { knowledgeTopics } from "@/lib/support-knowledge"
import {
  ChatTextIcon,
  CreditCardIcon,
  MonitorIcon,
  ReceiptIcon,
  ShieldWarningIcon,
} from "@phosphor-icons/react"
type SupportSection = "knowledge" | "queries"
type SupportTicketStatus = "Open" | "In progress" | "Resolved"

type SupportTicket = {
  id: string
  issue: string
  product: string
  posDevice: string
  priority: "High" | "Medium" | "Low"
  status: SupportTicketStatus
  updatedAt: string
}

const supportTickets: SupportTicket[] = [
  {
    id: "SUP-2381",
    issue: "Printer is skipping last line in receipt",
    product: "POS terminal",
    posDevice: "A891 · KA-01-4421",
    priority: "High",
    status: "Open",
    updatedAt: "15 min ago",
  },
  {
    id: "SUP-2374",
    issue: "Settlement batch missing UTR reference",
    product: "Checkout",
    posDevice: "-",
    priority: "Medium",
    status: "In progress",
    updatedAt: "2 hrs ago",
  },
  {
    id: "SUP-2368",
    issue: "UPI collect timeout in afternoon peak",
    product: "Checkout",
    posDevice: "-",
    priority: "Medium",
    status: "Resolved",
    updatedAt: "Yesterday",
  },
]

const statusBadgeClass: Record<SupportTicketStatus, string> = {
  Open: "bg-primary/10 text-primary border-primary/20",
  "In progress": "bg-warning/15 text-warning-foreground border-warning/20",
  Resolved: "bg-success/10 text-success border-success/20",
}

function getTopicIcon(iconKey: string) {
  if (iconKey === "checkout") return CreditCardIcon
  if (iconKey === "pos") return MonitorIcon
  if (iconKey === "settlements") return ReceiptIcon
  return ShieldWarningIcon
}

function SupportQueriesTable() {
  const columns: DataTableColumn<SupportTicket>[] = [
    {
      id: "id",
      header: "Request ID",
      accessorKey: "id",
      width: 130,
      pinnable: true,
    },
    {
      id: "issue",
      header: "Issue",
      accessorKey: "issue",
      width: 320,
    },
    {
      id: "product",
      header: "Product",
      accessorKey: "product",
      width: 130,
      filterOptions: [
        { label: "Checkout", value: "checkout" },
        { label: "POS terminal", value: "pos terminal" },
      ],
      getFilterValue: (row) => row.product.toLowerCase(),
    },
    {
      id: "priority",
      header: "Priority",
      accessorKey: "priority",
      width: 110,
      filterOptions: [
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" },
      ],
      getFilterValue: (row) => row.priority.toLowerCase(),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      width: 140,
      filterOptions: [
        { label: "Open", value: "open" },
        { label: "In progress", value: "in progress" },
        { label: "Resolved", value: "resolved" },
      ],
      getFilterValue: (row) => row.status.toLowerCase(),
      cell: (row) => (
        <Badge variant="outline" className={cn("text-[10px]", statusBadgeClass[row.status])}>
          {row.status}
        </Badge>
      ),
    },
    {
      id: "updatedAt",
      header: "Updated",
      accessorKey: "updatedAt",
      width: 120,
      align: "right",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="rounded-lg border-border/70 bg-card/80">
          <CardContent className="p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Open queries</p>
            <AnimatedNumberText value="8" className="mt-1 text-[18px] font-semibold text-foreground" />
          </CardContent>
        </Card>
        <Card className="rounded-lg border-border/70 bg-card/80">
          <CardContent className="p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">In progress</p>
            <AnimatedNumberText value="5" className="mt-1 text-[18px] font-semibold text-foreground" />
          </CardContent>
        </Card>
        <Card className="rounded-lg border-border/70 bg-card/80">
          <CardContent className="p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Resolved this week</p>
            <AnimatedNumberText value="19" className="mt-1 text-[18px] font-semibold text-foreground" />
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={supportTickets}
        columns={columns}
        rowId={(row) => row.id}
        searchPlaceholder="Search support queries..."
        emptyText="No support queries found"
        initialPinnedColumnIds={["id"]}
        statusColumnId="status"
      />
    </div>
  )
}

function KnowledgeHubCards() {
  const router = useRouter()

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {knowledgeTopics.map((topic) => {
        const Icon = getTopicIcon(topic.iconKey)

        return (
          <button
            key={topic.slug}
            type="button"
            onClick={() => router.push(`/support/knowledge-hub/${topic.slug}`)}
            className="group rounded-lg border border-border/70 bg-card/80 p-4 text-left transition-colors hover:bg-muted/35"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{topic.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{topic.subtitle}</p>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export function SupportRouteContent({ section }: { section: SupportSection }) {
  const pathname = usePathname()
  const [raiseRequestOpen, setRaiseRequestOpen] = useState(false)

  const centerMain = (
    <div className="h-full overflow-y-auto p-4">
      {section === "knowledge" ? <KnowledgeHubCards /> : <SupportQueriesTable />}
    </div>
  )

  return (
    <>
      <PageHeader
        title={section === "knowledge" ? "Knowledge hub" : "Support queries"}
        subtitle={
          section === "knowledge"
            ? "Browse topics and open rich guides with FAQs and training videos."
            : "Track all raised requests and create a new support request when needed."
        }
        actions={
          section === "queries" ? (
            <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setRaiseRequestOpen(true)}>
              <ChatTextIcon className="h-3.5 w-3.5" />
              Raise request
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
              <Link href="/support/support-queries">Support queries</Link>
            </Button>
          )
        }
      />

      <WorkspaceShell centerMain={centerMain} />

      <Sheet open={raiseRequestOpen} onOpenChange={setRaiseRequestOpen}>
        <SheetContent
          side="right"
          a11yTitle="Raise support request"
          a11yDescription="Chat with support assistant, run automated health checks, and raise a support request."
          className="w-full p-0 sm:max-w-[460px]"
        >
          <SupportRequestChatPanel pathname={pathname} onClose={() => setRaiseRequestOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
