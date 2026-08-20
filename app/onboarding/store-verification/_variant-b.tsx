"use client"

import { useEffect, useRef, useState } from "react"
import { MapPinIcon, StarIcon, StorefrontIcon, UploadSimpleIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Variant B — photo-first entry, and the preview is one integrated "place listing" card
// (photo + name + map chip together) rather than separate artifacts.
export function VariantB() {
  const [mapsLink, setMapsLink] = useState("")
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [skipPhoto, setSkipPhoto] = useState(false)
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
  }

  const hasValidLink = mapsLink.trim().length > 5
  const canContinue = hasValidLink && (photoUrl || skipPhoto)

  return (
    <div className="grid h-full w-full grid-cols-1 lg:grid-cols-2">
      <section className="flex h-full flex-col overflow-y-auto p-6 sm:p-10">
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center gap-7 py-8">
          <div className="space-y-1.5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">3 of 4</p>
            <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">Verify your store</h1>
          </div>

          <div className="space-y-2">
            <Label>Photo of your store</Label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border hover:bg-muted/40"
            >
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className="h-full w-full rounded-xl object-cover" />
              ) : (
                <>
                  <UploadSimpleIcon size={22} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Upload a storefront photo</span>
                  <span className="text-xs text-muted-foreground">Must show your business name</span>
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
            {!photoUrl ? (
              <button
                type="button"
                onClick={() => setSkipPhoto(true)}
                className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Skip — I&apos;ll add this later
              </button>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="maps-link-b">Google Maps store link</Label>
            <Input
              id="maps-link-b"
              placeholder="https://maps.app.goo.gl/…"
              value={mapsLink}
              onChange={(event) => setMapsLink(event.target.value)}
            />
          </div>

          <Button type="button" size="lg" className="w-full" disabled={!canContinue}>
            Continue
          </Button>
        </div>
      </section>

      <div className="hidden items-center justify-center border-l border-border bg-muted/30 p-10 lg:flex">
        <div className="w-full max-w-xs overflow-hidden rounded-2xl border border-border bg-card shadow-md">
          <div className="flex aspect-video w-full items-center justify-center bg-muted">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="h-full w-full object-cover" />
            ) : skipPhoto ? (
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <StorefrontIcon size={22} />
                <span className="text-xs">Photo pending</span>
              </div>
            ) : (
              <div className="h-full w-full animate-pulse bg-muted" />
            )}
          </div>

          <div className="p-4">
            <p className="text-sm font-semibold text-foreground">Kopi &amp; Co Pte. Ltd.</p>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <StarIcon size={12} weight="fill" className="text-warning" />
              <StarIcon size={12} weight="fill" className="text-warning" />
              <StarIcon size={12} weight="fill" className="text-warning" />
              <StarIcon size={12} weight="fill" className="text-warning" />
              <StarIcon size={12} className="text-border" />
              <span className="ml-1">New listing</span>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/60 px-2.5 py-2">
              <MapPinIcon size={14} className="shrink-0 text-primary" />
              {hasValidLink ? (
                <span className="truncate text-xs font-medium text-foreground">{mapsLink}</span>
              ) : (
                <span className="text-xs text-muted-foreground">Paste your Maps link to preview</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
