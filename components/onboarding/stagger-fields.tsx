"use client"

import { createContext, useContext, useRef } from "react"
import { cn } from "@/lib/utils"

// Ticket 09 (.scratch/onboarding-experience-v2/issues/09-establish-substep-motion-pattern.md):
// field-level choreography for sub-step transitions, replacing the old whole-panel cross-fade.
// Wrap a step's content in <StaggerFields>, then wrap each field/heading/CTA that should cascade
// in <StaggerField> — each field auto-numbers itself via context and gets a staggered entrance.
//
// Built on tw-animate-css's CSS-keyframe `animate-in`/`fade-in`/`slide-in-from-bottom` utilities
// rather than Framer Motion's JS-driven variants+staggerChildren. Framer's stagger orchestration
// runs on requestAnimationFrame, which browsers fully suspend while a tab is backgrounded and —
// critically — never auto-resume once the tab regains focus. A route that mounts while the tab
// happens to be hidden (e.g. during business-verification's auto-advancing Singpass timer, if the
// user alt-tabs during the ~1.5s wait) left fields permanently stuck at opacity 0 forever, even
// after the user came back. CSS keyframe animations run on the compositor independent of the JS
// main thread and always reach their end state on their own timeline, so they can't get stuck the
// same way — worth the tradeoff of losing the old JS-driven exit fade (fields now just disappear
// on sub-step change instead of fading out) since that's a minor polish loss against a bug that
// could leave the page blank indefinitely.
const StaggerIndexContext = createContext<{ next: () => number } | null>(null)

export function StaggerFields({ children, className }: { children: React.ReactNode; className?: string }) {
  const indexRef = useRef(0)
  indexRef.current = 0
  return (
    <StaggerIndexContext.Provider value={{ next: () => indexRef.current++ }}>
      <div className={className}>{children}</div>
    </StaggerIndexContext.Provider>
  )
}

export function StaggerField({ children, className }: { children: React.ReactNode; className?: string }) {
  const ctx = useContext(StaggerIndexContext)
  const index = ctx ? ctx.next() : 0
  return (
    <div
      className={cn("animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards duration-300 ease-out", className)}
      style={{ animationDelay: `${50 + index * 60}ms` }}
    >
      {children}
    </div>
  )
}
