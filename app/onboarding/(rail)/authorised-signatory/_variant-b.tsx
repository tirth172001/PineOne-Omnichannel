"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusIcon } from "@phosphor-icons/react"
import { OnboardingTopBar } from "@/components/onboarding/onboarding-top-bar"
import { setPeople, setSignatory, useSignatory, usePeople } from "@/components/onboarding/onboarding-person"
import { PersonCard } from "@/components/onboarding/onboarding-person-card"
import { StaggerField, StaggerFields } from "@/components/onboarding/stagger-fields"
import { StepProgressBar } from "@/components/onboarding/step-progress-bar"
import { Button } from "@/components/ui/button"
import { AddSignatorySheet } from "./_add-signatory-sheet"

// Variant B — larger, role-forward cards stacked in a list. Candidates come from the shared
// Person store (the owners entered in the previous step) instead of disconnected mock data, and
// selection sets `isSignatory` directly on the shared record (ticket 14). The preview (letter of
// authorisation) now lives in the persistent OnboardingPreview (ticket 15) — this file only
// renders the input side.
export function VariantB() {
  const router = useRouter()
  const people = usePeople()
  const selected = useSignatory()
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <section className="relative flex h-full flex-col overflow-y-auto rounded-md bg-background p-6 sm:p-10">
      <OnboardingTopBar className="left-6 right-6 top-6 sm:left-10 sm:right-10 sm:top-10" />
      <StaggerFields className="mx-auto flex w-full max-w-[420px] flex-1 flex-col gap-6 pt-24 pb-8 sm:pt-28">
        <StepProgressBar />
        <StaggerField className="space-y-1.5">
          <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">
            Who signs on the company&apos;s behalf?
          </h1>
        </StaggerField>

        <StaggerField className="flex flex-col gap-2">
          {people.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No business owners on file yet — add the person who&apos;ll sign for the company below.
            </p>
          ) : null}

          {people.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              selected={person.isSignatory}
              onClick={() => setSignatory(person.id)}
            />
          ))}

          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-3 rounded-xl border border-dashed border-border p-3.5 text-muted-foreground hover:bg-muted/40"
          >
            <span className="flex size-11 items-center justify-center rounded-full border border-dashed border-border">
              <PlusIcon size={16} />
            </span>
            <span className="text-sm font-medium">Add someone who isn&apos;t an owner</span>
          </button>
        </StaggerField>

        <StaggerField>
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={!selected}
            onClick={() => router.push("/onboarding/face-authentication")}
          >
            Continue
          </Button>
        </StaggerField>
      </StaggerFields>

      <AddSignatorySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onAdd={(person) => {
          setPeople([...people, person])
          setSignatory(person.id)
        }}
      />
    </section>
  )
}
