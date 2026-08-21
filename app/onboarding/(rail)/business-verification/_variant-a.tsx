"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CircleNotchIcon, IdentificationCardIcon, LightningIcon, PencilSimpleIcon, SealCheckIcon } from "@phosphor-icons/react"
import { OnboardingTopBar } from "@/components/onboarding/onboarding-top-bar"
import { updateProfile } from "@/components/onboarding/onboarding-profile"
import { StaggerField, StaggerFields } from "@/components/onboarding/stagger-fields"
import { StepProgressBar } from "@/components/onboarding/step-progress-bar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SingpassLoginDialog } from "./_singpass-login-dialog"

type Method = "singpass" | "manual"
type Step = "method" | "verifying" | "confirm"

const fields = [
  { id: "name", label: "Legal business name", value: "Kopi & Co Pte. Ltd." },
  { id: "uen", label: "UEN / registration number", value: "202312345K" },
  { id: "address", label: "Registered address", value: "21 Tanjong Pagar Road, #03-11, Singapore 088444" },
  { id: "type", label: "Business type", value: "Private Limited Company" },
]

const ADDITIONAL_DETAILS = [
  "UEN Registration Number",
  "Business Name",
  "Merchant type",
  "Nature of business",
  "Date of Incorporation",
  "Registered Address",
  "Business Owner Details",
]

const PERSONAL_DETAILS = ["NRIC / FIN", "Name", "Email ID", "Contact details"]

// Variant A — full-page document skeleton that builds and shimmers to signal verification. The
// preview itself now lives in the persistent OnboardingPreview (ticket 15) — this file just
// syncs its local state into the shared profile store as it changes.
//
// The Singpass consent checklist (previously buried behind a click-to-open dialog — see the
// removed _singpass-dialog.tsx) is inlined directly on the page as the primary content, per direct
// feedback. The actual Singpass login — QR scan or Corppass ID/password — still happens in a modal
// (_singpass-login-dialog.tsx), but only opens once "Proceed with Singpass" is clicked on the
// inline card; a successful login there is what triggers startVerification("singpass"). Manual
// upload is demoted to a secondary option below an "OR" divider, matching the login page's own
// primary-CTA/divider/secondary-option grammar.
export function VariantA() {
  const router = useRouter()
  const [method, setMethod] = useState<Method | null>(null)
  const [step, setStep] = useState<Step>("method")
  const [fileName, setFileName] = useState<string | null>(null)
  const [singpassLoginOpen, setSingpassLoginOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    updateProfile({
      verification: { method, verified: step === "confirm", fileName },
      verifying: step === "verifying",
    })
  }, [method, step, fileName])

  function startVerification(selected: Method) {
    setMethod(selected)
    setStep("verifying")
    window.setTimeout(() => {
      // The Singpass path skips the fields-list-and-Continue confirm screen entirely — consent
      // was already given inline above, so a successful fetch hands off straight into the next step.
      if (selected === "singpass") {
        updateProfile({ verification: { method: "singpass", verified: true, fileName: null }, verifying: false })
        router.push("/onboarding/business-basics")
        return
      }
      setStep("confirm")
    }, 1500)
  }

  function onFileSelected(file: File | undefined) {
    if (!file) return
    setFileName(file.name)
    startVerification("manual")
  }

  const verifyingSingpass = step === "verifying" && method === "singpass"
  const verifyingManual = step === "verifying" && method === "manual"

  return (
    <section className="relative flex h-full flex-col overflow-y-auto rounded-md bg-background p-6 sm:p-10">
      <OnboardingTopBar className="left-6 right-6 top-6 sm:left-10 sm:right-10 sm:top-10" />
      <StaggerFields className="mx-auto flex w-full max-w-[420px] flex-1 flex-col gap-8 pt-24 pb-8 sm:pt-28">
        <StepProgressBar />

        {step === "method" || step === "verifying" ? (
          <>
            <StaggerField className="space-y-2">
              <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">
                Verify your business
              </h1>
              <p className="text-sm leading-5 text-muted-foreground">
                Choose how you&apos;d like us to confirm your business details.
              </p>
            </StaggerField>

            <StaggerField className="flex flex-col gap-4">
              <div
                className={cn(
                  "rounded-xl border p-4",
                  verifyingSingpass ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="w-fit rounded bg-white px-2 py-1">
                    <img src="/brand/singpass-logo.svg" alt="Singpass" className="h-5 w-auto" />
                  </span>
                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                    Recommended
                  </span>
                </div>

                <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary">
                  <LightningIcon size={13} weight="fill" />
                  Auto-filled in seconds — nothing to type
                </p>
                <p className="mt-1 text-sm leading-5 text-foreground">
                  We&apos;ll securely pull these details straight from Singpass and fill them in for you.
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg border border-border p-3 divide-x divide-border">
                  <ConsentColumn title="Business details" items={ADDITIONAL_DETAILS} />
                  <ConsentColumn title="Your details" items={PERSONAL_DETAILS} className="pl-3" />
                </div>

                <p className="mt-3 text-xs leading-4 text-muted-foreground">
                  By clicking &ldquo;Proceed&rdquo; you allow Pine Labs to fetch these details based on the{" "}
                  <a href="#" className="text-primary underline underline-offset-2">
                    Terms of usage
                  </a>
                  .
                </p>

                <Button
                  type="button"
                  size="lg"
                  className="mt-4 w-full"
                  disabled={step === "verifying"}
                  onClick={() => setSingpassLoginOpen(true)}
                >
                  {verifyingSingpass ? (
                    <>
                      <CircleNotchIcon size={16} className="animate-spin" />
                      Connecting to Singpass…
                    </>
                  ) : (
                    "Auto-fill with Singpass"
                  )}
                </Button>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
                <span className="relative bg-background px-2 text-xs font-medium text-muted-foreground">OR</span>
              </div>

              <MethodCard
                icon={<IdentificationCardIcon size={20} weight="duotone" />}
                title="Upload your ACRA document"
                description="We'll read your business registration document."
                loadingLabel="Reading your document…"
                loading={verifyingManual}
                disabled={step === "verifying"}
                onClick={() => fileInputRef.current?.click()}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                className="sr-only"
                onChange={(event) => onFileSelected(event.target.files?.[0])}
              />

              <SingpassLoginDialog
                open={singpassLoginOpen}
                onCancel={() => setSingpassLoginOpen(false)}
                onLogin={() => {
                  setSingpassLoginOpen(false)
                  startVerification("singpass")
                }}
              />
            </StaggerField>
          </>
        ) : (
          <>
            <StaggerField className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-success/10 text-success">
                <SealCheckIcon size={20} weight="fill" />
              </span>
              <div>
                <h1 className="text-balance text-xl font-semibold text-foreground">You&apos;re verified</h1>
                <p className="text-sm text-muted-foreground">
                  {method === "singpass" ? "Pulled from Singpass." : `Read from ${fileName ?? "your ACRA document"}.`}
                </p>
              </div>
            </StaggerField>

            <StaggerField>
              <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-lg ring-1 ring-border">
                {fields.map((field) => (
                  <li key={field.id} className="flex items-start justify-between gap-3 bg-card px-3.5 py-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{field.label}</p>
                      <p className="truncate text-sm font-medium text-foreground" title={field.value}>
                        {field.value}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Edit ${field.label.toLowerCase()}`}
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <PencilSimpleIcon size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            </StaggerField>

            <StaggerField>
              <Button type="button" size="lg" className="w-full" onClick={() => router.push("/onboarding/business-basics")}>
                Continue
              </Button>
            </StaggerField>
          </>
        )}
      </StaggerFields>
    </section>
  )
}

function ConsentColumn({ title, items, className }: { title: string; items: string[]; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-1.5 text-xs text-foreground">
            <LightningIcon size={12} weight="fill" className="mt-0.5 shrink-0 text-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MethodCard({
  icon,
  title,
  description,
  loadingLabel,
  loading,
  disabled,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  loadingLabel: string
  loading: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed",
        loading ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card enabled:hover:bg-muted/60",
        disabled && !loading && "opacity-50"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
          loading ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        {loading ? <CircleNotchIcon size={18} className="animate-spin" /> : icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
          {loading ? loadingLabel : description}
        </span>
      </span>
    </button>
  )
}
