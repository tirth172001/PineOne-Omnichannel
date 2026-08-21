"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusIcon } from "@phosphor-icons/react"
import { OnboardingTopBar } from "@/components/onboarding/onboarding-top-bar"
import { setPeople, usePeople } from "@/components/onboarding/onboarding-person"
import { PersonCard } from "@/components/onboarding/onboarding-person-card"
import { StaggerField, StaggerFields } from "@/components/onboarding/stagger-fields"
import { StepProgressBar } from "@/components/onboarding/step-progress-bar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AddOwnerSheet } from "./_add-owner-sheet"

// Variant A — owners as a simple row list, reading/writing the shared Person store (ticket 14).
// The preview (donut → person-card list) now lives in the persistent OnboardingPreview
// (ticket 15) — this file only renders the input side.
export function VariantA() {
  const router = useRouter()
  const [hasOwners, setHasOwners] = useState<boolean | null>(null)
  const people = usePeople()
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <section className="relative flex h-full flex-col overflow-y-auto rounded-md bg-background p-6 sm:p-10">
      <OnboardingTopBar className="left-6 right-6 top-6 sm:left-10 sm:right-10 sm:top-10" />
      <StaggerFields className="mx-auto flex w-full max-w-[420px] flex-1 flex-col gap-6 pt-24 pb-8 sm:pt-28">
        <StepProgressBar />

        <StaggerField className="space-y-2">
          <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">
            Add details of all business owners
          </h1>
          <p className="text-sm leading-5 text-muted-foreground">
            Anyone with more than 25% shareholding in your business.
          </p>
        </StaggerField>

        <StaggerField className="space-y-2">
          <p className="text-sm font-medium text-foreground">Any beneficial owners over 25%?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setHasOwners(true)}
              className={cn(
                "flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                hasOwners === true ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"
              )}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => {
                setHasOwners(false)
                setPeople([])
              }}
              className={cn(
                "flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                hasOwners === false ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"
              )}
            >
              No
            </button>
          </div>
        </StaggerField>

        {hasOwners ? (
          <StaggerField className="space-y-2">
            {people.length > 0 ? (
              <div className="flex flex-col gap-2">
                {people.map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    onRemove={() => setPeople(people.filter((item) => item.id !== person.id))}
                  />
                ))}
              </div>
            ) : null}

            <Button type="button" variant="outline" className="w-full" onClick={() => setSheetOpen(true)}>
              <PlusIcon size={15} />
              Add business owner
            </Button>
          </StaggerField>
        ) : null}

        <StaggerField>
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={hasOwners === null || (hasOwners && people.length === 0)}
            onClick={() => router.push("/onboarding/authorised-signatory")}
          >
            Continue
          </Button>
        </StaggerField>
      </StaggerFields>

      <AddOwnerSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        existingPeople={people}
        onAdd={(person) => setPeople([...people, person])}
      />
    </section>
  )
}
