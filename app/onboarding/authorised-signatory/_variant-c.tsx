"use client"

import { useState } from "react"
import { PlusIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AddSignatorySheet } from "@/app/onboarding/(rail)/authorised-signatory/_add-signatory-sheet"
import { initials, ownerCandidates, type Signatory } from "./_signatory"

// Variant C — a fast, compact chip row for selection; preview is an ID/lanyard-badge mockup
// that carries an "AUTHORISED SIGNATORY" ribbon once someone's picked.
export function VariantC() {
  const [candidates, setCandidates] = useState<Signatory[]>(ownerCandidates)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const selected = candidates.find((candidate) => candidate.id === selectedId) ?? null

  return (
    <div className="grid h-full w-full grid-cols-1 lg:grid-cols-2">
      <section className="flex h-full flex-col overflow-y-auto p-6 sm:p-10">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Step 1 of 2 · KYC</p>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center gap-6 py-8">
          <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">Authorised signatory</h1>

          <div role="radiogroup" aria-label="Authorised signatory" className="flex flex-wrap gap-2">
            {candidates.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                role="radio"
                aria-checked={selectedId === candidate.id}
                onClick={() => setSelectedId(candidate.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-1.5 text-sm font-medium transition-colors",
                  selectedId === candidate.id
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:bg-muted/60"
                )}
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground">
                  {initials(candidate.name)}
                </span>
                {candidate.name}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-dashed border-border py-1.5 pr-3.5 pl-2 text-sm text-muted-foreground hover:bg-muted/40"
            >
              <PlusIcon size={13} />
              Add new
            </button>
          </div>

          <Button type="button" size="lg" className="w-full" disabled={!selected}>
            Continue
          </Button>
        </div>
      </section>

      <div className="hidden items-center justify-center border-l border-border bg-muted/30 p-10 lg:flex">
        <div className="flex flex-col items-center gap-1">
          <div className="h-6 w-16 rounded-b-full border-x-4 border-b-4 border-foreground/20" />
          <div className="w-64 overflow-hidden rounded-2xl border border-border bg-card shadow-md">
            <div className="flex flex-col items-center gap-2 p-6">
              <span className="flex size-16 items-center justify-center rounded-full bg-muted text-lg font-semibold text-foreground">
                {selected ? initials(selected.name) : "?"}
              </span>
              <p className="text-base font-semibold text-foreground">{selected ? selected.name : "Not selected"}</p>
              <p className="text-xs text-muted-foreground">{selected ? selected.designation : "Choose a signatory"}</p>
            </div>
            <div
              className={cn(
                "flex items-center justify-center py-2 text-center text-[11px] font-bold tracking-widest uppercase motion-safe:transition-colors",
                selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              Authorised signatory
            </div>
          </div>
        </div>
      </div>

      <AddSignatorySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onAdd={(signatory) => {
          setCandidates((current) => [...current, signatory])
          setSelectedId(signatory.id)
        }}
      />
    </div>
  )
}
