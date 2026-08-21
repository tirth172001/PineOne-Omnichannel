"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircleIcon, CircleIcon, EyeIcon, EyeglassesIcon, SunIcon } from "@phosphor-icons/react"
import { OnboardingTopBar } from "@/components/onboarding/onboarding-top-bar"
import { setVerificationStatus, useSignatory } from "@/components/onboarding/onboarding-person"
import { StaggerField, StaggerFields } from "@/components/onboarding/stagger-fields"
import { StepProgressBar } from "@/components/onboarding/step-progress-bar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CameraStage } from "./_camera-stage"

type Phase = "confirm" | "capturing" | "success"
const captureSteps = ["Face detected", "Blink detected", "Verification complete"]

const tips = [
  { icon: SunIcon, label: "Be in good lighting" },
  { icon: EyeglassesIcon, label: "Remove your glasses" },
  { icon: EyeIcon, label: "Blink when prompted" },
]

// Variant A — identity confirm + illustrated prep tips on one screen (mirrors the legacy
// reference), then a separate capture screen with an auto-advancing step tracker.
export function VariantA() {
  const router = useRouter()
  const signatory = useSignatory()
  const [isMe, setIsMe] = useState<boolean | null>(null)
  const [phase, setPhase] = useState<Phase>("confirm")
  const [stepIndex, setStepIndex] = useState(0)

  function start() {
    setPhase("capturing")
    setStepIndex(0)
    if (signatory) setVerificationStatus(signatory.id, "verifying")
    captureSteps.forEach((_, index) => {
      window.setTimeout(() => {
        setStepIndex(index + 1)
        if (index === captureSteps.length - 1) {
          window.setTimeout(() => {
            setPhase("success")
            if (signatory) setVerificationStatus(signatory.id, "verified")
          }, 500)
        }
      }, (index + 1) * 900)
    })
  }

  if (phase === "confirm") {
    return (
      <section className="relative flex h-full flex-col overflow-y-auto rounded-md bg-background p-6 sm:p-10">
        <OnboardingTopBar className="left-6 right-6 top-6 sm:left-10 sm:right-10 sm:top-10" />
        <StaggerFields className="mx-auto flex w-full max-w-[420px] flex-1 flex-col gap-6 pt-24 pb-8 sm:pt-28">
          <StepProgressBar />

          <StaggerField className="space-y-2">
            <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">Authenticate your identity</h1>
            <p className="text-sm leading-5 text-muted-foreground">
              Are you{" "}
              <span className="font-medium text-foreground">{signatory?.name ?? "the authorised signatory"}</span>?
              Face authentication must be done by the authorised signatory only.
            </p>
          </StaggerField>

          <StaggerField className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsMe(true)}
              className={cn(
                "flex-1 rounded-lg border px-4 py-2 text-sm font-medium",
                isMe === true ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"
              )}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setIsMe(false)}
              className={cn(
                "flex-1 rounded-lg border px-4 py-2 text-sm font-medium",
                isMe === false ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"
              )}
            >
              No
            </button>
          </StaggerField>

          <StaggerField className="grid grid-cols-3 gap-3">
            {tips.map((tip) => (
              <div key={tip.label} className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 text-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-muted text-foreground">
                  <tip.icon size={18} />
                </span>
                <span className="text-xs leading-4 text-muted-foreground">{tip.label}</span>
              </div>
            ))}
          </StaggerField>

          <StaggerField>
            <Button type="button" size="lg" className="w-full" disabled={isMe !== true} onClick={start}>
              Start face authentication
            </Button>
          </StaggerField>
        </StaggerFields>
      </section>
    )
  }

  return (
    <section className="relative flex h-full flex-col overflow-y-auto rounded-md bg-background p-6 sm:p-10">
      <OnboardingTopBar className="left-6 right-6 top-6 sm:left-10 sm:right-10 sm:top-10" />
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col items-center justify-center gap-6 py-8">
        <CameraStage state={phase === "success" ? "success" : "scanning"} className="w-64" />

        <ol className="flex w-full flex-col gap-2">
          {captureSteps.map((step, index) => {
            const done = index < stepIndex
            return (
              <li key={step} className="flex items-center gap-2.5 text-sm">
                {done ? (
                  <CheckCircleIcon size={17} weight="fill" className="text-success" />
                ) : (
                  <CircleIcon size={17} className="text-muted-foreground/40" />
                )}
                <span className={done ? "text-foreground" : "text-muted-foreground"}>{step}</span>
              </li>
            )
          })}
        </ol>

        {phase === "success" ? (
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => router.push("/onboarding/review-and-sign")}
          >
            Continue
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">Position your face within the oval and blink to verify liveness.</p>
        )}
      </div>
    </section>
  )
}
