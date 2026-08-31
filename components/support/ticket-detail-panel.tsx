"use client"

import { CheckCircleIcon, CircleIcon, PencilSimpleIcon } from "@phosphor-icons/react"
import { StatusPill, type StatusTone } from "@/components/shared/status-pill"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { getSupportTopic } from "@/lib/support-knowledge"
import { buildTicketTrail, expectedResolution, type SupportTicket, type TicketStatus } from "@/lib/support-tickets"

function ticketStatusTone(status: TicketStatus): StatusTone {
  if (status === "Resolved") return "success"
  if (status === "In progress") return "initiated"
  return "processing"
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <p className="text-muted-foreground">{label}</p>
      <p className="text-right font-medium text-foreground">{value}</p>
    </div>
  )
}

export function TicketDetailPanel({
  open,
  onOpenChange,
  ticket,
  onEdit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticket: SupportTicket | null
  onEdit: (ticket: SupportTicket) => void
}) {
  const topic = ticket ? getSupportTopic(ticket.topicSlug) : null
  const trail = ticket ? buildTicketTrail(ticket) : []

  return (
    <Sheet open={open && Boolean(ticket)} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        {ticket ? (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base font-medium text-foreground">{ticket.id}</SheetTitle>
                <StatusPill label={ticket.status} tone={ticketStatusTone(ticket.status)} />
              </div>
              <SheetDescription className="line-clamp-1">{ticket.issue}</SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <div className="divide-y divide-border/70">
                <DetailRow label="Topic" value={topic?.label ?? ticket.category} />
                <DetailRow label="Product" value={ticket.product} />
                <DetailRow label="Priority" value={ticket.priority} />
                <DetailRow label="Last updated" value={ticket.updatedAt} />
                {ticket.deviceId ? <DetailRow label="Device ID" value={ticket.deviceId} /> : null}
                {ticket.diagnosticRunId ? <DetailRow label="Diagnostic run ID" value={ticket.diagnosticRunId} /> : null}
                <DetailRow label="Created" value={ticket.createdAt} />
              </div>

              <div className="h-px w-full bg-border/70" />

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-foreground">Trail of changes</h3>
                  <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => onEdit(ticket)}>
                    <PencilSimpleIcon className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </div>

                <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground/80">Expected resolution</p>
                  <p className="mt-0.5 text-foreground">{expectedResolution(ticket)}</p>
                </div>

                <div className="relative space-y-5">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border/70" />
                  {trail.map((step) => (
                    <div key={step.title} className="relative pl-8">
                      <div className="absolute left-0 top-0.5">
                        {step.complete ? (
                          <CheckCircleIcon weight="fill" className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <CircleIcon className="h-4 w-4 text-chart-4" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{step.timestamp}</p>
                      <p className="text-sm font-medium text-foreground">{step.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
