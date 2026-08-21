"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { Person } from "@/components/onboarding/onboarding-person"

// Shared "add someone who isn't an owner" side panel — the mechanism is already decided by
// ticket 08's question, so all variants reuse this and vary the card-select + preview instead.
// Now emits a full Person (ticket 14) — added this way, so ownershipPercent is 0.
export function AddSignatorySheet({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (person: Person) => void
}) {
  const [name, setName] = useState("")
  const [designation, setDesignation] = useState("")
  const [mobile, setMobile] = useState("")
  const [email, setEmail] = useState("")
  const [hasNric, setHasNric] = useState(false)
  const [hasLetter, setHasLetter] = useState(false)

  function reset() {
    setName("")
    setDesignation("")
    setMobile("")
    setEmail("")
    setHasNric(false)
    setHasLetter(false)
  }

  function submit() {
    if (!name.trim() || !designation.trim()) return
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      designation: designation.trim(),
      ownershipPercent: 0,
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
      <SheetContent side="right" className="w-full max-w-sm overflow-y-auto">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Add authorised signatory</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sig-name">Full name</Label>
              <Input id="sig-name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sig-designation">Designation</Label>
              <Input id="sig-designation" placeholder="e.g. CFO" value={designation} onChange={(event) => setDesignation(event.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sig-mobile">Mobile number</Label>
              <Input id="sig-mobile" inputMode="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sig-email">Email address</Label>
              <Input id="sig-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Upload NRIC / passport</Label>
            <button
              type="button"
              onClick={() => setHasNric(true)}
              className="flex w-full items-center justify-center rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:bg-muted/40"
            >
              {hasNric ? "nric-front-back.pdf ✓" : "Click to upload front & back"}
            </button>
          </div>

          <div className="space-y-1.5">
            <Label>Upload authorisation letter</Label>
            <button
              type="button"
              onClick={() => setHasLetter(true)}
              className="flex w-full items-center justify-center rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:bg-muted/40"
            >
              {hasLetter ? "authorisation-letter.pdf ✓" : "Click to upload"}
            </button>
          </div>
        </div>

        <div className="mt-auto flex gap-2 border-t border-border p-4">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="flex-1" disabled={!name.trim() || !designation.trim()} onClick={submit}>
            Add signatory
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
