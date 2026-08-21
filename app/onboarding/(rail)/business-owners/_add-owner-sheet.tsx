"use client"

import { useState } from "react"
import { WarningCircleIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { Person } from "@/components/onboarding/onboarding-person"

// Shared "Add business owner" side panel — the add mechanism is already decided (a contextual
// side panel, per ticket 07's question), so all three variants reuse this and instead vary how
// the resulting owner list is displayed and previewed. Now emits a full Person (ticket 14).
// Validates against the existing owner list (ticket 17): blocks duplicate names and ownership
// totals over 100%, both inline in the sheet where the user is actively typing.
export function AddOwnerSheet({
  open,
  onOpenChange,
  existingPeople,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingPeople: Person[]
  onAdd: (person: Person) => void
}) {
  const [name, setName] = useState("")
  const [designation, setDesignation] = useState("")
  const [percent, setPercent] = useState("")
  const [hasDocument, setHasDocument] = useState(false)

  const existingTotal = existingPeople.reduce((sum, person) => sum + person.ownershipPercent, 0)
  const value = Number(percent)
  const isDuplicate = name.trim().length > 0 && existingPeople.some((person) => person.name.trim().toLowerCase() === name.trim().toLowerCase())
  const wouldExceed = value > 0 && existingTotal + value > 100
  const remaining = Math.max(0, 100 - existingTotal)

  function reset() {
    setName("")
    setDesignation("")
    setPercent("")
    setHasDocument(false)
  }

  function submit() {
    if (!name.trim() || !value || isDuplicate || wouldExceed) return
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      designation: designation.trim(),
      ownershipPercent: value,
      isSignatory: false,
      verificationStatus: "unverified",
    })
    reset()
    onOpenChange(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) reset()
      }}
    >
      <SheetContent side="right" className="w-full max-w-sm">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Add business owner</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="owner-name">Full name</Label>
            <Input
              id="owner-name"
              placeholder="Enter full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={isDuplicate}
            />
            {isDuplicate ? (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <WarningCircleIcon size={13} weight="fill" />
                An owner with this name is already on the list.
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="owner-designation">Designation</Label>
            <Input
              id="owner-designation"
              placeholder="e.g. Director"
              value={designation}
              onChange={(event) => setDesignation(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="owner-percent">Percentage of ownership</Label>
            <div className="relative">
              <Input
                id="owner-percent"
                inputMode="numeric"
                placeholder="0"
                value={percent}
                onChange={(event) => setPercent(event.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
                className="pr-7"
                aria-invalid={wouldExceed}
              />
              <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-sm text-muted-foreground">%</span>
            </div>
            {wouldExceed ? (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <WarningCircleIcon size={13} weight="fill" />
                That would bring total ownership to {existingTotal + value}% — only {remaining}% is left to allocate.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Must be more than 25% to be a business owner. {remaining}% remaining to allocate.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Upload NRIC / passport</Label>
            <button
              type="button"
              onClick={() => setHasDocument(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-4 text-sm text-muted-foreground hover:bg-muted/40"
            >
              {hasDocument ? "nric-front-back.pdf ✓" : "Click to upload front & back"}
            </button>
          </div>
        </div>

        <div className="mt-auto flex gap-2 border-t border-border p-4">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="flex-1" disabled={!name.trim() || !percent || isDuplicate || wouldExceed} onClick={submit}>
            Add owner
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
