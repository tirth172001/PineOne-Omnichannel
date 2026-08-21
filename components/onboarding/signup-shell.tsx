"use client"

import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { AuthVisualPanel } from "./auth-visual-panel"
import { BackButton } from "./back-button"
import { OnboardingPreview } from "./onboarding-preview"
import { SEQUENCE } from "./onboarding-sequence"
import { OnboardingTopBar } from "./onboarding-top-bar"
import { useSignupPosition } from "./signup-sequence"

// Every signup transition is a "sub-step" move in onboarding-rail-shell's sense — there's no
// macro-boundary crossing here — so, per ticket 09
// (.scratch/onboarding-experience-v2/issues/09-establish-substep-motion-pattern.md), this wrapper
// goes neutral and each step's own <StaggerFields>/<StaggerField> (see stagger-fields.tsx) does
// the real field-level choreography instead of one whole-panel fade.
const fade = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 1 },
}

// Shared chrome for /signup/* (ticket 07, .scratch/onboarding-experience-v2/issues/07-consolidate-login-signup-flow.md).
// Right panel is the plain decorative AuthVisualPanel (matching app/login/page.tsx) for
// email/password/otp — there's no business yet to preview at that point. business-name is
// different: it's step 1 of the unified onboarding journey (see onboarding-sequence.ts), so from
// there on the same persistent OnboardingPreview card the rail sequence uses takes over, live with
// whatever's been filled in so far. `position` (non-null only for business-name) gates both the
// progress bar above and this panel choice, so they always agree. Mounted once by
// app/signup/layout.tsx — not remounted per route — so it persists across signup step navigation
// instead of being torn down and rebuilt, and module-store state (signup-session.ts) survives the
// route-to-route transition.
export function SignupShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const position = useSignupPosition()

  return (
    <div className="min-h-screen bg-sidebar p-2">
      <div className="grid h-[calc(100vh-1rem)] w-full grid-cols-1 items-stretch gap-2 lg:grid-cols-2">
        <section className="relative flex h-full flex-col overflow-y-auto rounded-md bg-background p-6 sm:p-10">
          <OnboardingTopBar className="left-6 right-6 top-6 sm:left-10 sm:right-10 sm:top-10" />
          <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col pt-24 sm:pt-28">
            <BackButton className="mb-4 inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" />
            {position ? (
              <div className="mb-8">
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    animate={{ width: `${position.progress * 100}%` }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                </div>
                <p className="mt-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Step {position.globalIndex} of {SEQUENCE.length} · {position.macro.name}
                </p>
              </div>
            ) : null}

            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={pathname} initial={fade.initial} animate={fade.animate} exit={fade.exit}>
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {position ? <OnboardingPreview /> : <AuthVisualPanel />}
      </div>
    </div>
  )
}
