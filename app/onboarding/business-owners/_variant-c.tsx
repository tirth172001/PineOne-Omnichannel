"use client"

import { useState } from "react"
import { PlusIcon, TrashIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AddOwnerSheet } from "./_add-owner-sheet"
import { colorForIndex, initials, type Owner } from "./_owner"

// Variant C — owner rows carry an inline ownership progress bar; preview is an org-chart
// hierarchy (business at the root, owners as connected child nodes).
export function VariantC() {
  const [hasOwners, setHasOwners] = useState<boolean | null>(null)
  const [owners, setOwners] = useState<Owner[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="grid h-full w-full grid-cols-1 lg:grid-cols-2">
      <section className="flex h-full flex-col overflow-y-auto p-6 sm:p-10">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Step 2 of 2 · Business details
        </p>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center gap-6 py-8">
          <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">Business owners</h1>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Any beneficial owners over 25% shareholding?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setHasOwners(true)}
                className={cn(
                  "flex-1 rounded-lg border px-4 py-2 text-sm font-medium",
                  hasOwners === true ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"
                )}
              >
                Yes
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
          </div>

          {hasOwners ? (
            <div className="space-y-2">
              {owners.map((owner, index) => (
                <div key={owner.id} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">{owner.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{owner.ownershipPercent}%</span>
                      <button
                        type="button"
                        aria-label={`Remove ${owner.name}`}
                        onClick={() => setOwners((current) => current.filter((item) => item.id !== owner.id))}
                        className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
                      >
                        <TrashIcon size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full motion-safe:transition-all motion-safe:duration-500"
                      style={{ width: `${owner.ownershipPercent}%`, backgroundColor: colorForIndex(index) }}
                    />
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" className="w-full" onClick={() => setSheetOpen(true)}>
                <PlusIcon size={15} />
                Add business owner
              </Button>
            </div>
          ) : null}

          <Button type="button" size="lg" className="w-full" disabled={hasOwners === null || (hasOwners && owners.length === 0)}>
            Continue
          </Button>
        </div>
      </section>

      <div className="hidden items-center justify-center border-l border-border bg-muted/30 p-10 lg:flex">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-sm">
            Kopi &amp; Co Pte. Ltd.
          </div>

          {owners.length > 0 ? (
            <>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-start gap-6">
                {owners.map((owner, index) => (
                  <div key={owner.id} className="flex flex-col items-center gap-2">
                    <div className="h-4 w-px bg-border" />
                    <span
                      className="flex size-10 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: colorForIndex(index) }}
                    >
                      {initials(owner.name)}
                    </span>
                    <div className="max-w-[80px] text-center">
                      <p className="truncate text-[11px] font-medium text-foreground">{owner.name}</p>
                      <p className="text-[10px] text-muted-foreground">{owner.ownershipPercent}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Owners will branch from here</p>
          )}
        </div>
      </div>

      <AddOwnerSheet open={sheetOpen} onOpenChange={setSheetOpen} onAdd={(owner) => setOwners((current) => [...current, owner])} />
    </div>
  )
}
