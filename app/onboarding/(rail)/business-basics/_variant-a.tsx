"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react"
import { OnboardingTopBar } from "@/components/onboarding/onboarding-top-bar"
import { updateProfile } from "@/components/onboarding/onboarding-profile"
import { isInStoreDevicesSelected } from "@/components/onboarding/onboarding-sequence"
import { StaggerField, StaggerFields } from "@/components/onboarding/stagger-fields"
import { StepProgressBar } from "@/components/onboarding/step-progress-bar"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { categoryGroups, findCategory } from "./_categories"

// Variant A — the same "Business Profile" document from ticket 02 continues building live. The
// preview itself now lives in the persistent OnboardingPreview (ticket 15) — this file just
// syncs its local state into the shared profile store as it changes.
export function VariantA() {
  const router = useRouter()
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categoryId, setCategoryId] = useState<string | null>(null)

  const selected = findCategory(categoryId)

  useEffect(() => {
    updateProfile({ basics: { categoryId } })
  }, [categoryId])

  return (
    <section className="relative flex h-full flex-col overflow-y-auto rounded-md bg-background p-6 sm:p-10">
      <OnboardingTopBar className="left-6 right-6 top-6 sm:left-10 sm:right-10 sm:top-10" />
      <StaggerFields className="mx-auto flex w-full max-w-[420px] flex-1 flex-col gap-8 pt-24 pb-8 sm:pt-28">
        <StepProgressBar />

        <StaggerField className="space-y-2">
          <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">
            Tell us about your business
          </h1>
          <p className="text-sm leading-5 text-muted-foreground">
            This helps us set up the right pricing and payment options for you.
          </p>
        </StaggerField>

        <StaggerField className="space-y-1.5">
          <Label htmlFor="category-trigger">Business category</Label>
          <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
            <PopoverTrigger asChild>
              <button
                id="category-trigger"
                type="button"
                className="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className={selected ? "text-foreground" : "text-muted-foreground"}>
                  {selected ? selected.option.label : "Search for your business type…"}
                </span>
                <CaretDownIcon size={14} className="shrink-0 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
              <Command>
                <CommandInput placeholder="Search categories…" />
                <CommandList>
                  <CommandEmpty>No category found.</CommandEmpty>
                  {categoryGroups.map((group) => (
                    <CommandGroup key={group.id} heading={group.label}>
                      {group.options.map((option) => (
                        <CommandItem
                          key={option.id}
                          value={option.label}
                          onSelect={() => {
                            setCategoryId(option.id)
                            setCategoryOpen(false)
                          }}
                        >
                          <group.icon size={15} className="text-muted-foreground" />
                          {option.label}
                          {categoryId === option.id ? (
                            <CheckIcon size={14} weight="bold" className="ml-auto text-primary" />
                          ) : null}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </StaggerField>

        <StaggerField>
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={!selected}
            onClick={() =>
              router.push(isInStoreDevicesSelected() ? "/onboarding/store-verification" : "/onboarding/website-app-details")
            }
          >
            Continue
          </Button>
        </StaggerField>
      </StaggerFields>
    </section>
  )
}
