"use client"

import { useState } from "react"
import { CheckCircleIcon, CircleIcon, EyeIcon, EyeglassesIcon, SunIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { CameraStage } from "./_camera-stage"
import { signatoryName } from "./_mock"

type Screen = "confirm" | "checklist" | "capture" | "success"
const captureSteps = ["Face detected", "Blink detected", "Verification complete"]
const checklistItems = [
  { id: "lighting", icon: SunIcon, label: "I'm in good lighting" },
  { id: "glasses", icon: EyeglassesIcon, label: "I've removed my glasses" },
  { id: "blink", icon: EyeIcon, label: "I'm ready to blink when prompted" },
]

const screenOrder: Screen[] = ["confirm", "checklist", "capture"]

// Variant C — an explicit 3-screen wizard with a persistent "Step X of 3" counter and a manual
// checklist the user actively ticks off (not just illustrated tips) before capture unlocks.
export function VariantC() {
  const [screen, setScreen] = useState<Screen>("confirm")
  const [isMe, setIsMe] = useState<boolean | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [stepIndex, setStepIndex] = useState(0)

  const allChecked = checklistItems.every((item) => checked[item.id])
  const screenNumber = screenOrder.indexOf(screen) + 1

  function startCapture() {
    setScreen("capture")
    setStepIndex(0)
    captureSteps.forEach((_, index) => {
      window.setTimeout(() => {
        setStepIndex(index + 1)
        if (index === captureSteps.length - 1) {
          window.setTimeout(() => setScreen("success"), 500)
        }
      }, (index + 1) * 900)
    })
  }

  return (
    <div className="flex h-full w-full items-center justify-center overflow-y-auto p-6 sm:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        {screen !== "success" ? (
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Step {screenNumber} of 3</p>
        ) : null}

        {screen === "confirm" ? (
          <>
            <div className="space-y-2">
              <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">Confirm your identity</h1>
              <p className="text-sm leading-5 text-muted-foreground">
                Are you <span className="font-medium text-foreground">{signatoryName}</span>?
              </p>
            </div>
            <div className="flex gap-2">
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
            </div>
            <Button type="button" size="lg" className="w-full" disabled={isMe !== true} onClick={() => setScreen("checklist")}>
              Next
            </Button>
          </>
        ) : null}

        {screen === "checklist" ? (
          <>
            <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">Before you start</h1>
            <div className="flex flex-col gap-2">
              {checklistItems.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3.5 text-sm font-medium text-foreground"
                >
                  <Checkbox
                    checked={checked[item.id] ?? false}
                    onCheckedChange={(value) => setChecked((current) => ({ ...current, [item.id]: value === true }))}
                  />
                  <item.icon size={16} className="text-muted-foreground" />
                  {item.label}
                </label>
              ))}
            </div>
            <Button type="button" size="lg" className="w-full" disabled={!allChecked} onClick={startCapture}>
              Start face authentication
            </Button>
          </>
        ) : null}

        {screen === "capture" || screen === "success" ? (
          <div className="flex flex-col items-center gap-6">
            <CameraStage state={screen === "success" ? "success" : "scanning"} className="w-64" />

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

            {screen === "success" ? (
              <Button type="button" size="lg" className="w-full">
                Continue
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
