"use client"

import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { OnboardingPreview } from "./onboarding-preview"
import { FULL_WIDTH_ROUTES, useOnboardingPosition } from "./onboarding-sequence"

// Shared page chrome for the post-business-name sequence (tickets 02–15). No left rail, no
// separate top-level progress zone — the continuous progress bar lives inside each step's own
// left panel (see step-progress-bar.tsx) and the top bar (logo, language, account menu) lives
// inside the panel itself (see onboarding-top-bar.tsx), matching app/login/page.tsx's top bar.
// Macro-step moves (crossing
// into a new section) cross-fade the whole page. Sub-step moves (within the same macro-section)
// used to fade the whole panel up/in too, but ticket 09
// (.scratch/onboarding-experience-v2/issues/09-establish-substep-motion-pattern.md) replaced that
// with field-level choreography instead — so this wrapper goes neutral (opacity locked at 1) for
// sub-step moves, and each step's own <StaggerFields>/<StaggerField> (see stagger-fields.tsx) does
// the real work. Nested motion components with their own `exit` variants still get their exit
// animations played out by this AnimatePresence even though this wrapper itself doesn't move.
//
// The preview panel (see onboarding-preview.tsx) is a SIBLING of the animated {children} slot,
// not nested inside it — this is what makes it genuinely persistent (ticket 15) rather than a
// swapped component: it never remounts on route change, only its content crossfades between
// modes as the user progresses. Ticket 01's full-width exceptions (face auth, review/sign) get
// no preview panel at all.
const macroFade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: "easeInOut" as const },
}

const subStepFade = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 1 },
}

export function OnboardingRailShell({ children }: { children: React.ReactNode }) {
  const position = useOnboardingPosition()
  const transition = position.isSubStepMove ? subStepFade : macroFade
  const isFullWidth = FULL_WIDTH_ROUTES.has(position.slug)

  return (
    <div className="min-h-screen bg-sidebar p-2">
      <div className={cn("h-[calc(100vh-1rem)] w-full", !isFullWidth && "grid grid-cols-1 gap-2 lg:grid-cols-2")}>
        <div className="relative min-h-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={position.pathname}
              initial={transition.initial}
              animate={transition.animate}
              exit={transition.exit}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
        {!isFullWidth ? <OnboardingPreview /> : null}
      </div>
    </div>
  )
}
