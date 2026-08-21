"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircleIcon, ClockIcon, SignatureIcon } from "@phosphor-icons/react"
import { OnboardingTopBar } from "@/components/onboarding/onboarding-top-bar"
import { StaggerField, StaggerFields } from "@/components/onboarding/stagger-fields"
import { StepProgressBar } from "@/components/onboarding/step-progress-bar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { agreementParagraphs } from "./_review-data"

// Variant B — ticket 06 (.scratch/onboarding-experience-v2/issues/06-restructure-review-and-sign.md)
// gave the agreement its own "Sign agreement" CTA, gated by the checkbox directly above it.
//
// Moved onto the standard OnboardingRailShell split (matching every other onboarding step) per
// user request — this file now renders only the left/input half; the right half is the shared
// persistent preview panel (onboarding-preview.tsx), whose "review" mode renders the same
// reviewGroups summary this file used to draw inline itself. No FULL_WIDTH_ROUTES exception left
// (see onboarding-sequence.ts) — reviewGroups is static mock data (see _review-data.ts), so moving
// its render into the shared panel isn't duplicating logic against a store, just relocating it.
export function VariantB() {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)
  const [signed, setSigned] = useState(false)

  if (signed) {
    return (
      <div className="relative flex h-full w-full items-center justify-center rounded-md bg-background p-6 sm:p-10">
        <OnboardingTopBar className="left-6 right-6 top-6 sm:left-10 sm:right-10 sm:top-10" />
        <div className="flex w-full max-w-sm flex-col items-center gap-5 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircleIcon size={32} weight="fill" />
          </span>
          <div className="space-y-1.5">
            <h1 className="text-balance text-2xl font-semibold text-foreground">You&apos;re all set</h1>
            <p className="text-sm leading-5 text-muted-foreground">
              Kopi &amp; Co Pte. Ltd. is signed and submitted. We&apos;ll activate your account shortly.
            </p>
          </div>

          <div className="flex w-full items-center gap-2.5 rounded-lg border border-warning/30 bg-warning/5 px-3.5 py-3 text-left">
            <ClockIcon size={18} weight="fill" className="shrink-0 text-warning" />
            <p className="text-xs leading-4 text-muted-foreground">
              Activation usually takes a few minutes. You can explore your dashboard while you wait.
            </p>
          </div>

          <Button type="button" size="lg" className="w-full" onClick={() => router.push("/")}>
            Go to dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <section className="relative flex h-full flex-col overflow-y-auto rounded-md bg-background p-6 sm:p-10">
      <OnboardingTopBar className="left-6 right-6 top-6 sm:left-10 sm:right-10 sm:top-10" />
      <StaggerFields className="mx-auto flex w-full max-w-[420px] flex-1 flex-col gap-6 pt-24 pb-8 sm:pt-28">
        <StepProgressBar />

        <StaggerField className="space-y-2">
          <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">Review and sign your agreement</h1>
          <p className="text-sm leading-5 text-muted-foreground">
            Read the merchant signing agreement below, then confirm to activate your account.
          </p>
        </StaggerField>

        <StaggerField className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <SignatureIcon size={18} weight="fill" className="text-foreground" />
            <span className="text-base font-semibold text-foreground">Merchant Signing Agreement</span>
          </div>

          <div className="flex max-h-64 flex-col gap-3 overflow-y-auto px-5 py-4 text-xs leading-5 text-muted-foreground">
            {agreementParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </StaggerField>

        <StaggerField className="space-y-4">
          <label className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-3 text-sm font-medium text-foreground">
            <Checkbox checked={agreed} onCheckedChange={(checked) => setAgreed(checked === true)} />
            I agree to the terms and conditions above
          </label>

          <Button
            type="button"
            size="lg"
            className={cn("w-full", !agreed && "opacity-60")}
            disabled={!agreed}
            onClick={() => setSigned(true)}
          >
            Sign agreement
          </Button>
        </StaggerField>
      </StaggerFields>
    </section>
  )
}
