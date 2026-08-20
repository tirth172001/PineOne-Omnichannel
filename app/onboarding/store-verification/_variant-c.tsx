"use client"

import { useEffect, useRef, useState } from "react"
import { LinkSimpleIcon, MapPinIcon, UploadSimpleIcon, WarningCircleIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Variant C — a two-column input layout (map link | photo, side by side) instead of stacked
// fields, and a deferred skip prompt (shown only on attempting Continue) instead of an
// always-visible checkbox. Preview is one split composite: map on top, photo below.
export function VariantC() {
  const [mapsLink, setMapsLink] = useState("")
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [skipPhoto, setSkipPhoto] = useState(false)
  const [showSkipPrompt, setShowSkipPrompt] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl)
    }
  }, [photoUrl])

  function onFileSelected(file: File | undefined) {
    if (!file) return
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    setPhotoUrl(URL.createObjectURL(file))
    setSkipPhoto(false)
    setShowSkipPrompt(false)
  }

  const hasValidLink = mapsLink.trim().length > 5

  function handleContinueClick() {
    if (!hasValidLink) return
    if (!photoUrl && !skipPhoto) {
      setShowSkipPrompt(true)
      return
    }
  }

  return (
    <div className="grid h-full w-full grid-cols-1 lg:grid-cols-2">
      <section className="flex h-full flex-col overflow-y-auto p-6 sm:p-10">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Step 3 of 4 · Business verification
        </p>

        <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center gap-6 py-8">
          <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">Verify your store</h1>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="maps-link-c" className="flex items-center gap-1.5">
                <LinkSimpleIcon size={13} />
                Maps link
              </Label>
              <Input
                id="maps-link-c"
                placeholder="https://maps.app.goo.gl/…"
                value={mapsLink}
                onChange={(event) => setMapsLink(event.target.value)}
              />
              <p className="text-xs leading-4 text-muted-foreground">Where customers &amp; couriers find you.</p>
            </div>

            <div className="space-y-1.5">
              <Label>Storefront photo</Label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border hover:bg-muted/40"
              >
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="" className="h-full w-full rounded-lg object-cover" />
                ) : (
                  <>
                    <UploadSimpleIcon size={18} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Upload</span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="sr-only"
                  onChange={(event) => onFileSelected(event.target.files?.[0])}
                />
              </button>
            </div>
          </div>

          {showSkipPrompt ? (
            <div className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 px-3.5 py-3 text-sm">
              <WarningCircleIcon size={17} weight="fill" className="mt-0.5 shrink-0 text-warning" />
              <div className="flex-1">
                <p className="font-medium text-foreground">No storefront photo yet?</p>
                <p className="mt-0.5 text-xs text-muted-foreground">You can add it later from your dashboard.</p>
              </div>
              <button
                type="button"
                onClick={() => setSkipPhoto(true)}
                className="shrink-0 text-xs font-medium text-primary underline underline-offset-2"
              >
                Continue without it
              </button>
            </div>
          ) : null}

          <Button type="button" size="lg" className="w-full" disabled={!hasValidLink} onClick={handleContinueClick}>
            Continue
          </Button>
        </div>
      </section>

      <div className="hidden flex-col items-stretch justify-center gap-3 border-l border-border bg-muted/30 p-10 lg:flex">
        <div
          className={cn(
            "relative flex h-36 w-full max-w-sm items-center justify-center overflow-hidden rounded-t-2xl border border-b-0 border-border bg-[linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] bg-card [background-size:22px_22px]"
          )}
        >
          {hasValidLink ? (
            <div className="flex flex-col items-center gap-1">
              <MapPinIcon size={30} weight="fill" className="text-primary" />
              <span className="max-w-[220px] truncate rounded-md bg-background/90 px-2 py-0.5 text-[11px] font-medium text-foreground">
                {mapsLink}
              </span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Paste a Maps link to drop a pin</p>
          )}
        </div>

        <div className="flex h-36 w-full max-w-sm items-center justify-center overflow-hidden rounded-b-2xl border border-t-0 border-border bg-card">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : skipPhoto ? (
            <p className="text-xs text-muted-foreground">Photo pending — add it later</p>
          ) : (
            <div className="h-full w-full animate-pulse bg-muted" />
          )}
        </div>
      </div>
    </div>
  )
}
