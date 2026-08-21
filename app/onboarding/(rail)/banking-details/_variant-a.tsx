"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircleIcon, CircleNotchIcon, UploadSimpleIcon } from "@phosphor-icons/react"
import { OnboardingTopBar } from "@/components/onboarding/onboarding-top-bar"
import { updateProfile } from "@/components/onboarding/onboarding-profile"
import { StaggerField, StaggerFields } from "@/components/onboarding/stagger-fields"
import { StepProgressBar } from "@/components/onboarding/step-progress-bar"
import { Button } from "@/components/ui/button"

type Step = "upload" | "reading" | "confirm"

const extracted = [
  { label: "Bank", value: "DBS Bank" },
  { label: "Account holder", value: "Kopi & Co Pte. Ltd." },
  { label: "Account number", value: "••• •••• 4471" },
]

// Variant A — the Business Profile document continues. The preview itself now lives in the
// persistent OnboardingPreview (ticket 15) — this file just syncs its local state into the
// shared profile store as it changes.
export function VariantA() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("upload")
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    updateProfile({ banking: { step, fileName }, verifying: step === "reading" })
  }, [step, fileName])

  function onFileSelected(file: File | undefined) {
    if (!file) return
    setFileName(file.name)
    setStep("reading")
    window.setTimeout(() => setStep("confirm"), 1400)
  }

  return (
    <section className="relative flex h-full flex-col overflow-y-auto rounded-md bg-background p-6 sm:p-10">
      <OnboardingTopBar className="left-6 right-6 top-6 sm:left-10 sm:right-10 sm:top-10" />
      <StaggerFields className="mx-auto flex w-full max-w-[420px] flex-1 flex-col gap-7 pt-24 pb-8 sm:pt-28">
        <StepProgressBar />

        <StaggerField className="space-y-2">
          <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">Add your bank account</h1>
          <p className="text-sm leading-5 text-muted-foreground">
            Upload a statement from the last 3 months — this is where we&apos;ll send your settlements.
          </p>
        </StaggerField>

        <StaggerField>
          {step === "upload" || step === "reading" ? (
            <button
              type="button"
              disabled={step === "reading"}
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-8 text-center hover:bg-muted/40 disabled:cursor-not-allowed"
            >
              {step === "reading" ? (
                <CircleNotchIcon size={22} className="animate-spin text-primary" />
              ) : (
                <UploadSimpleIcon size={22} className="text-muted-foreground" />
              )}
              <span className="text-sm font-medium text-foreground">
                {step === "reading" ? "Reading your statement…" : (fileName ?? "Drag & drop, or click to upload")}
              </span>
              <span className="text-xs text-muted-foreground">PDF, max 5MB · Last 3 months</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(event) => onFileSelected(event.target.files?.[0])}
              />
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 rounded-lg border border-success/30 bg-success/5 px-3.5 py-3">
                <CheckCircleIcon size={18} weight="fill" className="shrink-0 text-success" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Statement read successfully</p>
                  <p className="truncate text-xs text-muted-foreground">{fileName}</p>
                </div>
              </div>
              <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-lg ring-1 ring-border">
                {extracted.map((field) => (
                  <li key={field.label} className="flex items-center justify-between gap-3 bg-card px-3.5 py-2.5 text-sm">
                    <span className="text-muted-foreground">{field.label}</span>
                    <span className="font-medium text-foreground">{field.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </StaggerField>

        <StaggerField>
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={step !== "confirm"}
            onClick={() => router.push("/onboarding/business-owners")}
          >
            Continue
          </Button>
        </StaggerField>
      </StaggerFields>
    </section>
  )
}
