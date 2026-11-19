"use client"

import { useMemo, useState } from "react"
import { CheckIcon, MagnifyingGlassIcon, PackageIcon, XIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { categoryGroups, findCategory } from "@/app/onboarding/(rail)/business-basics/_categories"

// Variant B — category picked via a browsable side-panel (not inline search), and the preview
// is two separate real-world artifacts (a storefront tag, a courier shipping label) instead
// of one document.
export function VariantB() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [addressLine, setAddressLine] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")

  const selected = findCategory(categoryId)
  const addressText = [addressLine, city, postalCode].filter(Boolean).join(", ")

  const filteredGroups = useMemo(() => {
    if (!query.trim()) return categoryGroups
    const lower = query.toLowerCase()
    return categoryGroups
      .map((group) => ({ ...group, options: group.options.filter((option) => option.label.toLowerCase().includes(lower)) }))
      .filter((group) => group.options.length > 0)
  }, [query])

  return (
    <div className="grid h-full w-full grid-cols-1 lg:grid-cols-2">
      <section className="flex h-full flex-col overflow-y-auto p-6 sm:p-10">
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center gap-7 py-8">
          <div className="space-y-1.5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">2 of 4</p>
            <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">Business basics</h1>
          </div>

          <div className="space-y-1.5">
            <Label>Business category</Label>
            {selected ? (
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="flex items-center gap-2 rounded-full border border-primary bg-primary/5 py-1.5 pl-1.5 pr-3 text-sm font-medium text-foreground"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <selected.group.icon size={13} />
                </span>
                {selected.option.label}
                <span
                  role="button"
                  aria-label="Clear business category"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation()
                    setCategoryId(null)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.stopPropagation()
                      setCategoryId(null)
                    }
                  }}
                  className="ml-1 inline-flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <XIcon size={11} weight="bold" />
                </span>
              </button>
            ) : (
              <Button type="button" variant="outline" className="w-full justify-start" onClick={() => setSheetOpen(true)}>
                Select category
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <Label>Where should we ship your devices?</Label>
            <div className="grid grid-cols-1 gap-3">
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
          </div>

          <Button type="button" size="lg" className="w-full" disabled={!selected || !addressText}>
            Continue
          </Button>
        </div>
      </section>

      <div className="hidden flex-col items-center justify-center gap-4 border-l border-border bg-muted/30 p-10 lg:flex">
        <div className="w-full max-w-xs overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="mb-2 text-[11px] text-muted-foreground">How you&apos;ll appear to customers</p>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-foreground">
              KC
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">Kopi &amp; Co Pte. Ltd.</p>
              {selected ? (
                <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  <selected.group.icon size={11} />
                  {selected.option.label}
                </span>
              ) : (
                <span className="mt-1 block h-4 w-24 animate-pulse rounded-full bg-muted" />
              )}
            </div>
          </div>
        </div>

        <div className="w-full max-w-xs overflow-hidden rounded-xl border-2 border-dashed border-border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b-2 border-dashed border-border px-4 py-2.5">
            <PackageIcon size={16} className="text-muted-foreground" />
            <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Ship to</span>
          </div>
          <div className="p-4">
            {addressText ? (
              <p className="text-sm font-medium text-foreground">{addressText}</p>
            ) : (
              <div className="space-y-1.5">
                <span className="block h-3 w-4/5 animate-pulse rounded bg-muted" />
                <span className="block h-3 w-3/5 animate-pulse rounded bg-muted" />
              </div>
            )}
          </div>
          <div
            aria-hidden
            className={cn(
              "h-2 bg-[repeating-linear-gradient(90deg,var(--color-border)_0px,var(--color-border)_2px,transparent_2px,transparent_5px)]"
            )}
          />
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full max-w-sm p-0">
          <SheetHeader className="border-b border-border">
            <SheetTitle>Select business category</SheetTitle>
          </SheetHeader>
          <div className="p-4">
            <div className="relative mb-4">
              <MagnifyingGlassIcon size={15} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Search categories…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-8"
              />
            </div>

            <div className="flex flex-col gap-4">
              {filteredGroups.map((group) => (
                <div key={group.id}>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <group.icon size={13} />
                    {group.label}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {group.options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setCategoryId(option.id)
                          setSheetOpen(false)
                        }}
                        className="flex items-center justify-between rounded-md px-2.5 py-2 text-left text-sm hover:bg-muted"
                      >
                        {option.label}
                        {categoryId === option.id ? <CheckIcon size={14} weight="bold" className="text-primary" /> : null}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
