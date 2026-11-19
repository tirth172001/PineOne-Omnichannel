"use client"

import { useState } from "react"
import { CaretDownIcon, DeviceMobileIcon, GlobeIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Active = "website" | "app"

// Variant C — an accordion of the two options; only one preview is shown at a time, cross-
// fading between a browser-chrome mockup and a phone/app mockup as focus moves between fields.
export function VariantC() {
  const [active, setActive] = useState<Active>("website")
  const [website, setWebsite] = useState("")
  const [appLink, setAppLink] = useState("")

  return (
    <div className="grid h-full w-full grid-cols-1 lg:grid-cols-2">
      <section className="flex h-full flex-col overflow-y-auto p-6 sm:p-10">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Step 4 of 4 · Business verification
        </p>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center gap-6 py-8">
          <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">
            Where do you accept payments online?
          </h1>

          <div className="overflow-hidden rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setActive("website")}
              className={cn(
                "flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium transition-colors",
                active === "website" ? "bg-muted/60 text-foreground" : "text-muted-foreground hover:bg-muted/30"
              )}
            >
              <GlobeIcon size={16} />
              Website
              <CaretDownIcon
                size={13}
                className={cn("ml-auto transition-transform", active === "website" && "rotate-180")}
              />
            </button>
            {active === "website" ? (
              <div className="border-t border-border p-4">
                <Input
                  autoFocus
                  placeholder="https://example.com"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">Optional — leave blank if you don&apos;t sell online.</p>
              </div>
            ) : null}

            <div className="border-t border-border" />

            <button
              type="button"
              onClick={() => setActive("app")}
              className={cn(
                "flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium transition-colors",
                active === "app" ? "bg-muted/60 text-foreground" : "text-muted-foreground hover:bg-muted/30"
              )}
            >
              <DeviceMobileIcon size={16} />
              Mobile app
              <CaretDownIcon size={13} className={cn("ml-auto transition-transform", active === "app" && "rotate-180")} />
            </button>
            {active === "app" ? (
              <div className="border-t border-border p-4">
                <Input
                  autoFocus
                  placeholder="https://apps.apple.com/…"
                  value={appLink}
                  onChange={(event) => setAppLink(event.target.value)}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">Optional — App Store or Play Store link.</p>
              </div>
            ) : null}
          </div>

          <Button type="button" size="lg" className="w-full">
            Continue
          </Button>
        </div>
      </section>

      <div className="hidden items-center justify-center border-l border-border bg-muted/30 p-10 lg:flex">
        <div className="relative h-56 w-full max-w-sm">
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center motion-safe:transition-all motion-safe:duration-300",
              active === "website" ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-3 py-2.5">
                <span className="size-2.5 rounded-full bg-destructive/50" />
                <span className="size-2.5 rounded-full bg-warning/60" />
                <span className="size-2.5 rounded-full bg-success/60" />
                <div className="ml-2 flex h-6 flex-1 items-center rounded-md bg-background px-2.5">
                  <span className="truncate text-[11px] text-foreground">
                    {website || <span className="text-muted-foreground">your-website.com</span>}
                  </span>
                </div>
              </div>
              <div className="flex h-28 items-center justify-center bg-background text-xs text-muted-foreground">
                Browser preview
              </div>
            </div>
          </div>

          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center motion-safe:transition-all motion-safe:duration-300",
              active === "app" ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <div className="relative h-56 w-32 rounded-[1.75rem] border-4 border-foreground/80 bg-card p-1.5 shadow-sm">
              <div className="flex h-full flex-col items-center justify-center gap-2 rounded-[1.25rem] bg-muted/40 p-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <DeviceMobileIcon size={18} />
                </div>
                <span className="max-w-full truncate text-[10px] font-medium text-foreground">
                  {appLink ? "App linked" : "Your app"}
                </span>
              </div>
              <div className="absolute bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-foreground/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
