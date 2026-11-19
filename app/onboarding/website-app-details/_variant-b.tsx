"use client"

import { useState } from "react"
import { GlobeIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Variant B — both fields always visible (no toggles), and the preview is two full, separate
// device mockups shown together: a browser window and a phone with a home-screen app icon.
export function VariantB() {
  const [website, setWebsite] = useState("")
  const [appLink, setAppLink] = useState("")

  const appName = appLink ? appNameFromLink(appLink) : null

  return (
    <div className="grid h-full w-full grid-cols-1 lg:grid-cols-2">
      <section className="flex h-full flex-col overflow-y-auto p-6 sm:p-10">
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center gap-7 py-8">
          <div className="space-y-1.5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">4 of 4</p>
            <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">
              Website &amp; app details
            </h1>
            <p className="text-sm leading-5 text-muted-foreground">Both optional — add whichever you have.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="website-b">Website link</Label>
            <Input
              id="website-b"
              placeholder="https://example.com (optional)"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="app-b">Mobile app link</Label>
            <Input
              id="app-b"
              placeholder="https://apps.apple.com/… (optional)"
              value={appLink}
              onChange={(event) => setAppLink(event.target.value)}
            />
          </div>

          <Button type="button" size="lg" className="w-full">
            Continue
          </Button>
        </div>
      </section>

      <div className="hidden flex-col items-center justify-center gap-6 border-l border-border bg-muted/30 p-10 lg:flex">
        <div className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-3 py-2.5">
            <span className="size-2.5 rounded-full bg-destructive/50" />
            <span className="size-2.5 rounded-full bg-warning/60" />
            <span className="size-2.5 rounded-full bg-success/60" />
            <div className="ml-2 flex h-6 flex-1 items-center gap-1.5 rounded-md bg-background px-2.5">
              <GlobeIcon size={11} className="shrink-0 text-muted-foreground" />
              <span className="truncate text-[11px] text-foreground">
                {website || <span className="text-muted-foreground">your-website.com</span>}
              </span>
            </div>
          </div>
          <div className="flex h-24 items-center justify-center bg-background">
            <span className="text-xs text-muted-foreground">{website ? "Live preview unavailable" : "No website yet"}</span>
          </div>
        </div>

        <div className="relative h-56 w-32 rounded-[1.75rem] border-4 border-foreground/80 bg-card p-1.5 shadow-sm">
          <div className="flex h-full flex-col items-center justify-center gap-2 rounded-[1.25rem] bg-muted/40 p-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <span className="text-sm font-semibold">{appName ? appName[0]?.toUpperCase() : "?"}</span>
            </div>
            <span className="max-w-full truncate text-[10px] font-medium text-foreground">
              {appName ?? "Your app"}
            </span>
          </div>
          <div className="absolute bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-foreground/30" />
        </div>
      </div>
    </div>
  )
}

function appNameFromLink(value: string) {
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`)
    return url.hostname.split(".")[0] || "Your app"
  } catch {
    return "Your app"
  }
}
