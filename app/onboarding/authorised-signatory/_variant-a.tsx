"use client"

import { useState } from "react"
import { CaretDownIcon, PenNibIcon, PlusIcon, SealCheckIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AddSignatorySheet } from "@/app/onboarding/(rail)/authorised-signatory/_add-signatory-sheet"
import { initials, ownerCandidates, type Signatory } from "./_signatory"

const verifiedFields = [
  { label: "Legal business name", value: "Kopi & Co Pte. Ltd." },
  { label: "Business category", value: "Cafe / coffee shop" },
  { label: "Bank account", value: "DBS •••• 4471" },
  { label: "Business owners", value: "3 added" },
]

// Variant A — compact card grid to pick the signatory; the Business Profile document continues,
// gaining a "ready for e-signature" badge once someone's selected.
export function VariantA() {
  const [candidates, setCandidates] = useState<Signatory[]>(ownerCandidates)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const selected = candidates.find((candidate) => candidate.id === selectedId) ?? null

  return (
    <div className="grid h-full w-full grid-cols-1 lg:grid-cols-2">
      <section className="flex h-full flex-col overflow-y-auto p-6 sm:p-10">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Step 1 of 2 · KYC</p>

        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center gap-6 py-8">
          <div className="space-y-2">
            <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">
              Select authorised signatory
            </h1>
            <p className="text-sm leading-5 text-muted-foreground">
              This person is authorised to sign contracts and legal documents on the company&apos;s behalf.
            </p>
          </div>

          <div role="radiogroup" aria-label="Authorised signatory" className="grid grid-cols-3 gap-2.5">
            {candidates.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                role="radio"
                aria-checked={selectedId === candidate.id}
                onClick={() => setSelectedId(candidate.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors",
                  selectedId === candidate.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:bg-muted/60"
                )}
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                  {initials(candidate.name)}
                </span>
                <span className="max-w-full truncate text-xs font-medium text-foreground">{candidate.name}</span>
                <span className="text-[10px] text-muted-foreground">{candidate.designation}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border p-3 text-muted-foreground hover:bg-muted/40"
            >
              <PlusIcon size={16} />
              <span className="text-xs font-medium">Someone else</span>
            </button>
          </div>

          <Button type="button" size="lg" className="w-full" disabled={!selected}>
            Continue
          </Button>
        </div>
      </section>

      <div className="hidden items-center justify-center border-l border-border bg-muted/30 p-10 lg:flex">
        <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-medium text-foreground">Business Profile</span>
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">Verified</span>
          </div>

          <details className="group border-b border-border">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-xs text-muted-foreground">
              <SealCheckIcon size={14} weight="fill" className="text-success" />
              7 details confirmed
              <CaretDownIcon size={12} className="ml-auto transition-transform group-open:rotate-180" />
            </summary>
            <div className="flex flex-col gap-2.5 px-4 pb-3">
              {verifiedFields.map((field) => (
                <div key={field.label} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-muted-foreground">{field.label}</span>
                  <span className="truncate font-medium text-foreground">{field.value}</span>
                </div>
              ))}
            </div>
          </details>

          <div className="p-4">
            <p className="mb-2 text-[11px] text-muted-foreground">Authorised signatory</p>
            {selected ? (
              <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 px-3.5 py-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                  {initials(selected.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">{selected.designation}</p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-success/15 px-2 py-1 text-[10px] font-medium text-success">
                  <PenNibIcon size={11} weight="fill" />
                  Ready
                </span>
              </div>
            ) : (
              <div className="flex h-16 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                Awaiting selection
              </div>
            )}
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
