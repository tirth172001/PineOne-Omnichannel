"use client"

import { useState } from "react"
import { CheckCircleIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CameraStage } from "@/app/onboarding/(rail)/face-authentication/_camera-stage"
import { signatoryName } from "./_mock"

type Stage = "idle" | "lighting" | "glasses" | "blink" | "success"

const overlayText: Record<Stage, string> = {
  idle: `Verifying it's really ${signatoryName}`,
  lighting: "Make sure you're in good lighting…",
  glasses: "Remove your glasses if you're wearing any…",
  blink: "Blink when prompted…",
  success: "Verified — you're all set",
}

// Variant B — one persistent camera stage; instructions and state cycle as overlaid text rather
// than separate screens. No identity Yes/No gate — starts immediately, framed as verification.
export function VariantB() {
  const [stage, setStage] = useState<Stage>("idle")

  function start() {
    const sequence: Stage[] = ["lighting", "glasses", "blink", "success"]
    sequence.forEach((next, index) => {
      window.setTimeout(() => setStage(next), (index + 1) * 1000)
    })
  }

  const scanning = stage !== "idle" && stage !== "success"

  return (
    <div className="flex h-full w-full items-center justify-center overflow-y-auto p-6 sm:p-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-5">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Step 2 of 2 · KYC</p>

        <div className="relative w-full">
          <CameraStage state={stage === "success" ? "success" : scanning ? "scanning" : "idle"} className="w-full" />

          <div
            className={cn(
              "absolute inset-x-3 bottom-3 rounded-lg bg-background/90 px-3 py-2 text-center text-xs font-medium text-foreground backdrop-blur motion-safe:transition-opacity"
            )}
          >
            {stage === "success" ? (
              <span className="flex items-center justify-center gap-1.5 text-success">
                <CheckCircleIcon size={14} weight="fill" />
                {overlayText[stage]}
              </span>
            ) : (
              overlayText[stage]
            )}
          </div>
        </div>

        {stage === "idle" ? (
          <Button type="button" size="lg" className="w-full" onClick={start}>
            Begin verification
          </Button>
        ) : stage === "success" ? (
          <Button type="button" size="lg" className="w-full">
            Continue
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">This must be done by {signatoryName} only.</p>
        )}
      </div>
    </div>
  )
}
