"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { getSupportTopic } from "@/lib/support-knowledge"
import type { SupportTicket } from "@/lib/support-tickets"

export type TicketEditDraft = {
  category: string
  product: string
  topic: string
  posId: string
  issueDescription: string
  healthCheckReport: string
  storeName: string
  storeContact: string
  storeAddress: string
}

function draftFromTicket(ticket: SupportTicket | null): TicketEditDraft {
  if (!ticket) {
    return { category: "", product: "", topic: "", posId: "", issueDescription: "", healthCheckReport: "", storeName: "", storeContact: "", storeAddress: "" }
  }
  return {
    category: ticket.category,
    product: ticket.product,
    topic: getSupportTopic(ticket.topicSlug)?.label ?? "",
    posId: ticket.deviceId ?? "",
    issueDescription: ticket.issue,
    healthCheckReport: ticket.diagnosticRunId ? `Report ${ticket.product} • A50 • ${ticket.diagnosticRunId.slice(-6)}` : "",
    storeName: ticket.storeDetails?.name ?? "",
    storeContact: ticket.storeDetails?.contact ?? "",
    storeAddress: ticket.storeDetails?.address ?? "",
  }
}

export function TicketEditPanel({
  open,
  onOpenChange,
  ticket,
  initialDraft,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Seed the form from an existing ticket record. Ignored when `initialDraft` is given. */
  ticket: SupportTicket | null
  /** Seed the form directly from a draft (e.g. an in-progress chat ticket that has no SupportTicket record yet). */
  initialDraft?: TicketEditDraft
  onSave: (draft: TicketEditDraft) => void
}) {
  const [draft, setDraft] = useState<TicketEditDraft>(() => initialDraft ?? draftFromTicket(ticket))

  useEffect(() => {
    if (open) setDraft(initialDraft ?? draftFromTicket(ticket))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ticket, initialDraft])

  function updateField<K extends keyof TicketEditDraft>(key: K, value: TicketEditDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function handleSave() {
    onSave(draft)
    onOpenChange(false)
    toast.success("Ticket details updated")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-base font-medium text-foreground">Edit ticket details</SheetTitle>
          <SheetDescription>{draft.issueDescription || ticket?.issue || "Update this ticket's details."}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Ticket details</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <Input value={draft.category} onChange={(event) => updateField("category", event.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Product</Label>
                <Input value={draft.product} onChange={(event) => updateField("product", event.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Topic</Label>
                <Input value={draft.topic} onChange={(event) => updateField("topic", event.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">POS ID</Label>
                <Input value={draft.posId} onChange={(event) => updateField("posId", event.target.value)} className="h-9 text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Issue description</Label>
              <Textarea
                value={draft.issueDescription}
                onChange={(event) => updateField("issueDescription", event.target.value)}
                className="min-h-20 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Health check report</Label>
              <Input
                value={draft.healthCheckReport}
                onChange={(event) => updateField("healthCheckReport", event.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="h-px w-full bg-border/70" />

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Store details</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Name</Label>
                <Input value={draft.storeName} onChange={(event) => updateField("storeName", event.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Contact</Label>
                <Input value={draft.storeContact} onChange={(event) => updateField("storeContact", event.target.value)} className="h-9 text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Address</Label>
              <Textarea
                value={draft.storeAddress}
                onChange={(event) => updateField("storeAddress", event.target.value)}
                className="min-h-20 text-sm"
              />
            </div>
          </div>
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t border-border/70">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
