"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CircleNotchIcon,
  LinkIcon,
  NavigationArrowIcon,
  NotePencilIcon,
  UploadSimpleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react"
import { OnboardingTopBar } from "@/components/onboarding/onboarding-top-bar"
import { updateProfile, type StoreManualAddress } from "@/components/onboarding/onboarding-profile"
import { StaggerField, StaggerFields } from "@/components/onboarding/stagger-fields"
import { StepProgressBar } from "@/components/onboarding/step-progress-bar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type AddressMethod = "link" | "location" | "manual"

const EMPTY_MANUAL_ADDRESS: StoreManualAddress = {
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  district: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
}

const MANUAL_ADDRESS_FIELDS: Array<{ key: keyof StoreManualAddress; label: string; required: boolean; span2: boolean }> = [
  { key: "addressLine1", label: "Address line 1", required: true, span2: true },
  { key: "addressLine2", label: "Address line 2", required: false, span2: true },
  { key: "landmark", label: "Landmark", required: false, span2: true },
  { key: "district", label: "District", required: false, span2: false },
  { key: "city", label: "City", required: true, span2: false },
  { key: "state", label: "State", required: true, span2: false },
  { key: "country", label: "Country", required: true, span2: false },
  { key: "pincode", label: "Pincode", required: true, span2: false },
]

function isManualAddressValid(address: StoreManualAddress) {
  return MANUAL_ADDRESS_FIELDS.every((field) => !field.required || address[field.key].trim().length > 0)
}

function formatCoordinates(latitude: number, longitude: number) {
  const lat = `${Math.abs(latitude).toFixed(4)}° ${latitude >= 0 ? "N" : "S"}`
  const lng = `${Math.abs(longitude).toFixed(4)}° ${longitude >= 0 ? "E" : "W"}`
  return `${lat}, ${lng}`
}

// Variant A — the Business Profile document (tickets 02, 03) continues. The preview itself now
// lives in the persistent OnboardingPreview (ticket 15) — this file just syncs its local state
// into the shared profile store as it changes. The uploaded photo's object URL is intentionally
// NOT revoked on unmount anymore (only when replaced by a new file) — the preview needs it to
// keep working after this step's own component unmounts on navigation.
//
// Ticket 08 (.scratch/onboarding-experience-v3/issues/08-store-address-capture-methods.md): three
// inline methods for the address itself — paste a Maps link (unchanged), use the browser's
// current location (coordinates only; no reverse-geocoding, see the map's Out of scope), or a full
// manual form. Only one method's fields are ever written to the shared profile at a time — see
// onboarding-profile.ts. Method selection was a Tabs strip; replaced per direct feedback with the
// same tappable MethodCard grammar business-verification's method choice uses — a three-way
// segmented tab read as a settings control buried among the fields, not a decision worth making
// deliberately. Each card expands its own fields in place once picked, instead of swapping an
// unrelated content region below a separate tab strip.
export function VariantA() {
  const router = useRouter()
  const [addressMethod, setAddressMethod] = useState<AddressMethod>("link")

  const [mapsLink, setMapsLink] = useState("")

  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState("")
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  const [manualAddress, setManualAddress] = useState<StoreManualAddress>(EMPTY_MANUAL_ADDRESS)

  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoName, setPhotoName] = useState<string | null>(null)
  const [skipPhoto, setSkipPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    updateProfile({
      store: {
        mapsLink: addressMethod === "link" && mapsLink.trim().length > 5 ? mapsLink : null,
        currentLocation: addressMethod === "location" ? currentLocation : null,
        manualAddress: addressMethod === "manual" && isManualAddressValid(manualAddress) ? manualAddress : null,
        photoUrl,
        skipPhoto,
      },
    })
  }, [addressMethod, mapsLink, currentLocation, manualAddress, photoUrl, skipPhoto])

  function useCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setLocationError("Location isn't available in this browser.")
      return
    }
    setLocating(true)
    setLocationError("")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude })
        setLocating(false)
      },
      () => {
        setLocationError("Couldn't get your location. Check your browser's location permission and try again.")
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  function onFileSelected(file: File | undefined) {
    if (!file) return
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    setPhotoUrl(URL.createObjectURL(file))
    setPhotoName(file.name)
    setSkipPhoto(false)
  }

  const hasValidAddress =
    addressMethod === "link"
      ? mapsLink.trim().length > 5
      : addressMethod === "location"
        ? currentLocation !== null
        : isManualAddressValid(manualAddress)
  const canContinue = hasValidAddress && (photoUrl || skipPhoto)

  return (
    <section className="relative flex h-full flex-col overflow-y-auto rounded-md bg-background p-6 sm:p-10">
      <OnboardingTopBar className="left-6 right-6 top-6 sm:left-10 sm:right-10 sm:top-10" />
      <StaggerFields className="mx-auto flex w-full max-w-[420px] flex-1 flex-col gap-7 pt-24 pb-8 sm:pt-28">
        <StepProgressBar />

        <StaggerField className="space-y-2">
          <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">Verify your store</h1>
          <p className="text-sm leading-5 text-muted-foreground">
            Help customers and couriers find your physical location.
          </p>
        </StaggerField>

        <StaggerField className="flex flex-col gap-3">
          <AddressMethodCard
            icon={<LinkIcon size={18} weight="duotone" />}
            title="Paste a Maps link"
            description="Fastest — share your Google Maps listing"
            active={addressMethod === "link"}
            onClick={() => setAddressMethod("link")}
          >
            <div className="space-y-1.5">
              <Label htmlFor="maps-link">Google Maps store link</Label>
              <Input
                id="maps-link"
                placeholder="https://maps.app.goo.gl/…"
                value={mapsLink}
                onChange={(event) => setMapsLink(event.target.value)}
              />
            </div>
          </AddressMethodCard>

          <AddressMethodCard
            icon={<NavigationArrowIcon size={18} weight="duotone" />}
            title="Use current location"
            description="We'll capture your coordinates"
            active={addressMethod === "location"}
            onClick={() => setAddressMethod("location")}
          >
            {currentLocation ? (
              <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                  <NavigationArrowIcon size={14} weight="fill" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">Current location captured</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatCoordinates(currentLocation.latitude, currentLocation.longitude)}
                  </p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={useCurrentLocation} disabled={locating}>
                  Update
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={useCurrentLocation}
                disabled={locating}
              >
                {locating ? <CircleNotchIcon size={16} className="animate-spin" /> : <NavigationArrowIcon size={16} />}
                {locating ? "Getting your location…" : "Use current location"}
              </Button>
            )}
            {locationError ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
                <WarningCircleIcon size={13} weight="fill" />
                {locationError}
              </p>
            ) : null}
          </AddressMethodCard>

          <AddressMethodCard
            icon={<NotePencilIcon size={18} weight="duotone" />}
            title="Enter manually"
            description="Fill in your address details yourself"
            active={addressMethod === "manual"}
            onClick={() => setAddressMethod("manual")}
          >
            <div className="grid grid-cols-2 gap-3">
              {MANUAL_ADDRESS_FIELDS.map((field) => (
                <div key={field.key} className={cn("space-y-1.5", field.span2 && "col-span-2")}>
                  <Label htmlFor={`manual-${field.key}`}>
                    {field.label}
                    {!field.required ? <span className="text-muted-foreground"> (optional)</span> : null}
                  </Label>
                  <Input
                    id={`manual-${field.key}`}
                    value={manualAddress[field.key]}
                    onChange={(event) =>
                      setManualAddress((previous) => ({ ...previous, [field.key]: event.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
          </AddressMethodCard>
        </StaggerField>

        <StaggerField className="space-y-2">
          <div className="space-y-1">
            <Label>Photo of your store</Label>
            <p className="text-xs leading-4 text-muted-foreground">
              Image must clearly show your business name on the storefront.
            </p>
          </div>

          {!skipPhoto ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-6 text-center hover:bg-muted/40"
            >
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className="h-20 w-full rounded-md object-cover" />
              ) : (
                <UploadSimpleIcon size={20} className="text-muted-foreground" />
              )}
              <span className="text-sm font-medium text-foreground">{photoName ?? "Drag & drop, or click to upload"}</span>
              <span className="text-xs text-muted-foreground">JPEG or PNG, max 5MB</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="sr-only"
                onChange={(event) => onFileSelected(event.target.files?.[0])}
              />
            </button>
          ) : null}

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={skipPhoto}
              onCheckedChange={(checked) => {
                setSkipPhoto(checked === true)
                if (checked) {
                  if (photoUrl) URL.revokeObjectURL(photoUrl)
                  setPhotoUrl(null)
                  setPhotoName(null)
                }
              }}
            />
            I don&apos;t have a storefront photo yet, I&apos;ll upload it later
          </label>
        </StaggerField>

        <StaggerField>
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={!canContinue}
            onClick={() => router.push("/onboarding/website-app-details")}
          >
            Continue
          </Button>
        </StaggerField>
      </StaggerFields>
    </section>
  )
}

function AddressMethodCard({
  icon,
  title,
  description,
  active,
  onClick,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "rounded-xl border transition-colors",
        active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card"
      )}
    >
      <button
        type="button"
        onClick={onClick}
        aria-expanded={active}
        className={cn(
          "flex w-full items-start gap-3 rounded-xl p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !active && "hover:bg-muted/60"
        )}
      >
        <span
          className={cn(
            "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
            active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">{description}</span>
        </span>
      </button>

      {active ? <div className="px-4 pb-4">{children}</div> : null}
    </div>
  )
}
