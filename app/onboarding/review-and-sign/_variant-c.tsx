"use client"

import { useState } from "react"
import { PencilSimpleIcon } from "@phosphor-icons/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { agreementParagraphs, reviewGroups } from "@/app/onboarding/(rail)/review-and-sign/_review-data"

// Variant C — review sections as tabs (not one long scroll); signing happens in a modal
// overlay rather than a separate full-width screen, ending in a toast instead of a success
// screen.
export function VariantC() {
  const [activeGroupId, setActiveGroupId] = useState(reviewGroups[0]?.id ?? "")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [signed, setSigned] = useState(false)

  const activeGroup = reviewGroups.find((group) => group.id === activeGroupId) ?? reviewGroups[0]

  function sign() {
    setSigned(true)
    setDialogOpen(false)
    toast.success("Agreement signed", {
      description: "Kopi & Co Pte. Ltd. is submitted — we'll activate your account shortly.",
    })
  }

  return (
    <div className="flex h-full w-full items-center justify-center overflow-y-auto p-6 sm:p-10">
      <div className="flex w-full max-w-2xl flex-col gap-5">
        <div className="space-y-1.5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Review and sign</p>
          <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">Review your details</h1>
        </div>

        <div role="tablist" aria-label="Review section" className="flex gap-1 rounded-lg bg-muted p-1">
          {reviewGroups.map((group) => (
            <button
              key={group.id}
              type="button"
              role="tab"
              aria-selected={activeGroupId === group.id}
              onClick={() => setActiveGroupId(group.id)}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                activeGroupId === group.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {group.title}
            </button>
          ))}
        </div>

        <ul role="tabpanel" className="flex flex-col divide-y divide-border overflow-hidden rounded-xl ring-1 ring-border">
          {activeGroup?.fields.map((field) => (
            <li key={field.id} className="flex items-center justify-between gap-3 bg-card px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{field.label}</p>
                <p className="truncate text-sm font-medium text-foreground" title={field.value}>
                  {field.value}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Edit ${field.label.toLowerCase()}`}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <PencilSimpleIcon size={15} />
              </button>
            </li>
          ))}
        </ul>

        <Button type="button" size="lg" className="w-full" disabled={signed} onClick={() => setDialogOpen(true)}>
          {signed ? "Signed ✓" : "Sign agreement"}
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Merchant Signing Agreement</DialogTitle>
          </DialogHeader>

          <div className="flex max-h-72 flex-col gap-3 overflow-y-auto text-sm leading-6 text-muted-foreground">
            {agreementParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          <label className="flex items-center gap-2.5 rounded-lg border border-border p-3 text-sm font-medium text-foreground">
            <Checkbox checked={agreed} onCheckedChange={(checked) => setAgreed(checked === true)} />
            I agree to the terms and conditions above
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={!agreed} onClick={sign}>
              Sign agreement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
