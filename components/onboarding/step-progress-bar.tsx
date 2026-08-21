"use client"

import { motion } from "framer-motion"
import { BackButton } from "./back-button"
import { SEQUENCE, useOnboardingPosition } from "./onboarding-sequence"

// One continuous, unsegmented track for the whole 4-macro-step journey (no per-substep gaps),
// creeping smoothly as sub-steps complete; the "Step X of 4" caption only advances at macro
// boundaries. Renders in the exact spot the old segmented version did — top of each step's left
// panel, above the screen heading. Resolved by ticket 12
// (.scratch/onboarding-experience/issues/12-revise-progress-shell-and-transitions.md).
//
// Carries the back control (ticket 08, .scratch/onboarding-experience-v2/issues/08-add-back-navigation.md)
// rather than each step wiring its own — every screen that shows this bar is exactly a screen
// where going back makes sense; the screens that don't (verifying, capturing, success) don't render
// this component at all, so they never get a back button either.
export function StepProgressBar({ className }: { className?: string } = {}) {
  const position = useOnboardingPosition()

  return (
    <div className={className}>
      <BackButton />
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${position.progress * 100}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>
      <p className="mt-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Step {position.macroIndex + 1} of {SEQUENCE.length} · {position.macro.name}
      </p>
    </div>
  )
}
