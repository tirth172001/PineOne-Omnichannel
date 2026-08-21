"use client"

import { usePathname } from "next/navigation"
import { getPosition } from "./onboarding-sequence"

// "business-name" (name + intent capture) is step 1 of the unified 5-step SEQUENCE in
// onboarding-sequence.ts — the only /signup/* route with a progress indicator. The email/password/
// otp account-creation steps that precede it aren't part of the numbered journey (mirrors how the
// rail sequence's own success sub-states don't advance the counter either), so they render no
// progress bar at all. business-name's own Continue button routes straight into the rail sequence
// now — the separate "how would you like to get started" fork step was removed in favor of a
// secondary "I'm already registered with Pine Labs" CTA on business-name itself.
function slugFromPathname(pathname: string) {
  return pathname.split("/").filter(Boolean).at(-1) ?? ""
}

export function useSignupPosition() {
  const pathname = usePathname()
  if (slugFromPathname(pathname) !== "business-name") return null
  return getPosition(pathname)
}
