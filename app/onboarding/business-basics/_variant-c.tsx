"use client"

import { useState } from "react"
import { CaretDownIcon, CheckIcon, MapPinIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { categoryGroups, findCategory } from "./_categories"

const popular = ["cafe", "restaurant", "grocery", "salon"]

// Variant C — category and address are tied together spatially: one map-style preview with a
// pin that drops in as the address is entered, tagged with the chosen category.
export function VariantC() {
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [addressLine, setAddressLine] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")

  const selected = findCategory(categoryId)
  const addressText = [addressLine, city, postalCode].filter(Boolean).join(", ")
  const pinDropped = addressLine.trim().length > 2

  return (
    <div className="grid h-full w-full grid-cols-1 lg:grid-cols-2">
      <section className="flex h-full flex-col overflow-y-auto p-6 sm:p-10">
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center gap-7 py-8">
          <div className="space-y-1.5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Step 2 of 4 · Business verification
            </p>
            <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">Business basics</h1>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-trigger-c">Business category</Label>

            <div className="flex flex-wrap gap-1.5">
              <span className="py-1 text-xs text-muted-foreground">Popular:</span>
              {popular.map((id) => {
                const match = findCategory(id)
                if (!match) return null
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCategoryId(id)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      categoryId === id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {match.option.label}
                  </button>
                )
              })}
            </div>

            <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
              <PopoverTrigger asChild>
                <button
                  id="category-trigger-c"
                  type="button"
                  className="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className={selected ? "text-foreground" : "text-muted-foreground"}>
                    {selected ? selected.option.label : "Or search for your business type…"}
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
          </div>

          <div className="space-y-3">
            <Label>Where should we ship your devices?</Label>
            <Input placeholder="Address line" value={addressLine} onChange={(event) => setAddressLine(event.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="City" value={city} onChange={(event) => setCity(event.target.value)} />
              <Input
                inputMode="numeric"
                placeholder="Postal code"
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              />
            </div>
          </div>

          <Button type="button" size="lg" className="w-full" disabled={!selected || !addressText}>
            Continue
          </Button>
        </div>
      </section>

      <div className="hidden items-center justify-center border-l border-border bg-muted/30 p-10 lg:flex">
        <div
          className="relative flex h-80 w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl border border-border bg-[linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] bg-card [background-size:28px_28px]"
        >
          <div
            className={cn(
              "motion-safe:transition-all motion-safe:duration-500",
              pinDropped ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
            )}
          >
            <div className="relative flex flex-col items-center">
              {selected ? (
                <span className="mb-1 flex size-6 items-center justify-center rounded-full border border-border bg-background text-primary shadow-sm">
                  <selected.group.icon size={13} />
                </span>
              ) : null}
              <MapPinIcon size={40} weight="fill" className="text-primary drop-shadow-sm" />
            </div>
          </div>

          {addressText ? (
            <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-border bg-background/95 px-3 py-2 text-xs font-medium text-foreground shadow-sm backdrop-blur">
              {addressText}
            </div>
          ) : (
            <p className="absolute bottom-4 left-4 right-4 text-center text-xs text-muted-foreground">
              Enter an address to drop a pin
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
