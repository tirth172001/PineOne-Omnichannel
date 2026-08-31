"use client"

import { cn } from "@/lib/utils"
import { OnboardingPreview } from "./onboarding-preview"
import { FULL_WIDTH_ROUTES, useOnboardingPosition } from "./onboarding-sequence"

// Shared page chrome for the post-business-name sequence (tickets 02–15). No left rail, no
// separate top-level progress zone — the continuous progress bar lives inside each step's own
// left panel (see step-progress-bar.tsx) and the top bar (logo, language, account menu) lives
// inside the panel itself (see onboarding-top-bar.tsx), matching app/login/page.tsx's top bar.
// Macro-step moves (crossing into a new section) fade the whole page in. Sub-step moves (within
// the same macro-section) used to fade the whole panel up/in too, but ticket 09
// (.scratch/onboarding-experience-v2/issues/09-establish-substep-motion-pattern.md) replaced that
// with field-level choreography instead — so this wrapper goes neutral (opacity locked at 1) for
// sub-step moves, and each step's own <StaggerFields>/<StaggerField> (see stagger-fields.tsx) does
// the real work.
//
// The macro-step fade itself is a CSS keyframe (tw-animate-css's animate-in/fade-in/
// slide-in-from-bottom), not Framer Motion — see stagger-fields.tsx's comment for why: a
// JS-driven `initial={{opacity: 0}}` animation runs on requestAnimationFrame, which browsers fully
// suspend while a tab is backgrounded and never auto-resume, so a macro-boundary route that
// mounted while the tab was hidden (e.g. business-verification's auto-advancing Singpass timer, if
// the user alt-tabs during the ~1.5s wait) left the entire step panel — every input field — stuck
// at opacity 0 forever, exactly the same failure mode this wrapper used to share with
// stagger-fields.tsx before that fix. CSS keyframe animations run on the compositor independent of
// the JS main thread and always reach their end state, so they can't get stuck that way. Same
// tradeoff as stagger-fields.tsx: losing the JS-driven exit fade (macro steps now swap in place
// instead of cross-fading) against a bug that could leave the page blank indefinitely.
//
// The preview panel (see onboarding-preview.tsx) is a SIBLING of the {children} slot, not nested
// inside it — this is what makes it genuinely persistent (ticket 15) rather than a swapped
// component: it never remounts on route change, only its content crossfades between modes as the
// user progresses. Ticket 01's full-width exceptions (face auth, review/sign) get no preview panel
// at all.
export function OnboardingRailShell({ children }: { children: React.ReactNode }) {
  const position = useOnboardingPosition()
  const isFullWidth = FULL_WIDTH_ROUTES.has(position.slug)

  return (
    <div className="min-h-screen bg-sidebar p-2">
      <div className={cn("h-[calc(100vh-1rem)] w-full", !isFullWidth && "grid grid-cols-1 gap-2 lg:grid-cols-2")}>
        <div className="relative min-h-0">
          <div
            key={position.pathname}
            className={cn(
              "h-full",
              !position.isSubStepMove &&
                "animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-[250ms] ease-in-out",
            )}
          >
            {children}
          </div>
        </div>
        {!isFullWidth ? <OnboardingPreview /> : null}
      </div>
    </div>
  )
}
