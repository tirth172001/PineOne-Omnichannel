"use client"

import { useState } from "react"
import { IdentificationCardIcon, PlusIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AddOwnerSheet } from "./_add-owner-sheet"
import { colorForIndex, initials, type Owner } from "./_owner"

// Variant B — owners shown as a card grid on the left; preview is a roster of physical
// "ID card" mockups (one per owner) instead of a chart.
export function VariantB() {
  const [hasOwners, setHasOwners] = useState<boolean | null>(null)
  const [owners, setOwners] = useState<Owner[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="grid h-full w-full grid-cols-1 lg:grid-cols-2">
      <section className="flex h-full flex-col overflow-y-auto p-6 sm:p-10">
        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center gap-6 py-8">
          <div className="space-y-1.5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">2 of 2</p>
            <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">Business owners</h1>
            <p className="text-sm leading-5 text-muted-foreground">Anyone with more than 25% shareholding.</p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setHasOwners(true)}
              className={cn(
                "flex-1 rounded-lg border px-4 py-2 text-sm font-medium",
                hasOwners === true ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"
              )}
            >
              Yes, there are
            </button>
            <button
              type="button"
              onClick={() => {
                setHasOwners(false)
                setOwners([])
              }}
              className={cn(
                "flex-1 rounded-lg border px-4 py-2 text-sm font-medium",
                hasOwners === false ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"
              )}
            >
              No
            </button>
          </div>

          {hasOwners ? (
            <div className="grid grid-cols-2 gap-2.5">
              {owners.map((owner, index) => (
                <div key={owner.id} className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3">
                  <span
                    className="flex size-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: colorForIndex(index) }}
                  >
                    {initials(owner.name)}
                  </span>
                  <p className="max-w-full truncate text-xs font-medium text-foreground">{owner.name}</p>
                  <p className="text-[11px] text-muted-foreground">{owner.ownershipPercent}%</p>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border p-3 text-muted-foreground hover:bg-muted/40"
              >
                <PlusIcon size={18} />
                <span className="text-xs font-medium">Add owner</span>
              </button>
            </div>
          ) : null}

          <Button type="button" size="lg" className="w-full" disabled={hasOwners === null || (hasOwners && owners.length === 0)}>
            Continue
          </Button>
        </div>
      </section>

      <div className="hidden flex-col items-center justify-center gap-3 border-l border-border bg-muted/30 p-10 lg:flex">
        {owners.length > 0 ? (
          owners.map((owner, index) => (
            <div
              key={owner.id}
              className="flex w-full max-w-xs items-center gap-3 overflow-hidden rounded-xl border border-border bg-card p-3 shadow-sm"
            >
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: colorForIndex(index) }}
              >
                {initials(owner.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{owner.name}</p>
                <p className="text-xs text-muted-foreground">Business owner · {owner.ownershipPercent}%</p>
              </div>
              <IdentificationCardIcon size={18} className={owner.hasDocument ? "text-success" : "text-muted-foreground/50"} />
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">Owner ID cards will appear here</p>
        )}
      </div>

      <AddOwnerSheet open={sheetOpen} onOpenChange={setSheetOpen} onAdd={(owner) => setOwners((current) => [...current, owner])} />
    </div>
  )
}
