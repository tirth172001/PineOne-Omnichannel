"use client"

import { useState } from "react"
import { CircleNotchIcon, HourglassIcon, MagnifyingGlassIcon, StorefrontIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { foundMerchant } from "./_mock"

type Status = "idle" | "searching" | "found" | "sent"

// Variant B — one screen throughout. The found business reveals inline beneath the search box
// (no separate confirm screen), then the whole card morphs into the pending state on submit.
export function VariantB() {
  const [contact, setContact] = useState("")
  const [status, setStatus] = useState<Status>("idle")

  function search() {
    if (!contact.trim()) return
    setStatus("searching")
    window.setTimeout(() => setStatus("found"), 900)
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-5 px-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-balance text-xl font-semibold text-foreground">Join an existing business</h1>
        <p className="text-sm leading-5 text-muted-foreground">
          Enter the email or mobile number your business account is registered with.
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="you@business.com"
          value={contact}
          disabled={status === "searching" || status === "found" || status === "sent"}
          onChange={(event) => setContact(event.target.value)}
        />
        {status === "idle" ? (
          <Button type="button" onClick={search} disabled={!contact.trim()}>
            <MagnifyingGlassIcon size={15} />
            Find
          </Button>
        ) : null}
      </div>

      {status === "searching" ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          <CircleNotchIcon size={16} className="animate-spin" />
          Looking that up…
        </div>
      ) : null}

      {status === "found" || status === "sent" ? (
        <div
          className={cn(
            "motion-safe:animate-[pv11FadeIn_300ms_ease-out] flex flex-col gap-4 rounded-xl border p-4",
            status === "sent" ? "border-warning/30 bg-warning/5" : "border-border bg-card"
          )}
        >
          <style>{`@keyframes pv11FadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>

          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-lg",
                status === "sent" ? "bg-warning/15 text-warning" : "bg-primary/10 text-primary"
              )}
            >
              {status === "sent" ? <HourglassIcon size={20} weight="fill" /> : <StorefrontIcon size={20} />}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{foundMerchant.name}</p>
              <p className="text-xs text-muted-foreground">{foundMerchant.category}</p>
            </div>
          </div>

          {status === "sent" ? (
            <p className="text-xs leading-5 text-muted-foreground">
              Request sent — an admin needs to approve it before you can access the dashboard. We&apos;ll email you.
            </p>
          ) : (
            <Button type="button" className="w-full" onClick={() => setStatus("sent")}>
              Request access
            </Button>
          )}
        </div>
      ) : null}

      {status === "sent" ? (
        <Button type="button" variant="outline" className="w-full">
          Back to login
        </Button>
      ) : null}
    </div>
  )
}
