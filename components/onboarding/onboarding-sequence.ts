// Macro/sub-step metadata for the whole numbered onboarding journey — 5 macro-sections shown as
// "Step X of 5", each containing the routes that make up its sub-steps. "Your business" (the
// business-name step, under /signup/) is step 1; the rest live under /onboarding/. Progress
// originally started only after business-name (tickets 02–10, ticket 12
// .scratch/onboarding-experience/issues/12-revise-progress-shell-and-transitions.md) — business-name
// was folded in as the first step so the whole name+intent-through-review-and-sign journey counts
// against one shared denominator instead of two separate 4-step and 4-step sequences.
"use client"

import { useRef } from "react"
import { usePathname } from "next/navigation"
import { getSignupSession } from "./signup-session"

export type Macro = {
  name: string
  routes: string[] // slugs under /signup/<slug> (business-name only) or /onboarding/<slug>
}

export const SEQUENCE: Macro[] = [
  { name: "Your business", routes: ["business-name"] },
  { name: "Business verification", routes: ["business-verification", "business-basics", "store-verification", "website-app-details"] },
  { name: "Business details", routes: ["banking-details", "business-owners"] },
  { name: "KYC", routes: ["authorised-signatory", "face-authentication"] },
  { name: "Review and sign", routes: ["review-and-sign"] },
]

// Ticket 07 (.scratch/onboarding-experience-v3/issues/07-conditional-store-address-requirement.md):
// "store-verification" only belongs in the active sequence when the merchant selected "In-store
// devices" during ticket 06's intent capture (business-name step) — otherwise there's no device to
// ship, so no store address to collect. This is the single source of truth both `getPosition` (for
// progress/index math) and `onboarding-preview.tsx`'s DOC_SECTIONS filter read, so the two stay in
// lockstep — an active route always has a matching active preview section, and vice versa.
export function isInStoreDevicesSelected() {
  return getSignupSession().selectedCategories.includes("in-store-devices")
}

function getActiveRoutes(macro: Macro): string[] {
  if (!macro.routes.includes("store-verification")) return macro.routes
  return isInStoreDevicesSelected() ? macro.routes : macro.routes.filter((route) => route !== "store-verification")
}

// Face-authentication used to be full-width (the camera feed was "nothing to preview"), but
// ticket 03 (.scratch/onboarding-experience-v2/issues/03-kyc-stage-signatory-preview.md) moved it
// into the standard split so the signatory's card can stay visible and pick up the
// verifying→verified badge as capture completes. Review-and-sign was the last full-width
// exception until it moved into the standard split too — see ReviewBody in onboarding-preview.tsx.
// No routes use this exception today; kept as the mechanism for whichever step needs it next.
export const FULL_WIDTH_ROUTES = new Set<string>([])

export type PreviewMode = "intent" | "document" | "details" | "signatory" | "review" | "none"

const PREVIEW_MODE_BY_ROUTE: Record<string, PreviewMode> = {
  "business-name": "intent",
  "business-verification": "document",
  "business-basics": "document",
  "store-verification": "document",
  "website-app-details": "document",
  // Same "details" mode for both (ticket 10/11 originally split these into separate modes) — unified
  // so banking collapses to a summary row instead of vanishing outright once the user reaches
  // business-owners, matching how document mode keeps its own earlier sub-steps visible.
  "banking-details": "details",
  "business-owners": "details",
  "authorised-signatory": "signatory",
  // Same "signatory" mode as authorised-signatory (ticket 03) — the whole KYC macro-section
  // shares one preview mode, same as "document" spans all of business-verification.
  "face-authentication": "signatory",
  "review-and-sign": "review",
}

export function getPreviewMode(slug: string): PreviewMode {
  return PREVIEW_MODE_BY_ROUTE[slug] ?? "document"
}

export type Position = {
  macroIndex: number
  macro: Macro
  subIndex: number // 0-based, within macro
  globalIndex: number // 1-based, across the whole sequence
  progress: number // 0..1
  slug: string
}

function slugFromPathname(pathname: string) {
  return pathname.split("/").filter(Boolean).at(-1) ?? ""
}

export function getPosition(pathname: string): Position {
  const slug = slugFromPathname(pathname)
  // Computed fresh per call against the *active* routes (ticket 07) — cheap enough at this size,
  // and keeps progress/index math correct whether or not store-verification is in play.
  const activeRoutesByMacro = SEQUENCE.map(getActiveRoutes)
  const total = activeRoutesByMacro.reduce((sum, routes) => sum + routes.length, 0)
  let cumulative = 0
  for (let macroIndex = 0; macroIndex < SEQUENCE.length; macroIndex++) {
    const macro = SEQUENCE[macroIndex]
    const activeRoutes = activeRoutesByMacro[macroIndex]
    const subIndex = activeRoutes.indexOf(slug)
    if (subIndex !== -1) {
      const globalIndex = cumulative + subIndex + 1
      return { macroIndex, macro, subIndex, globalIndex, progress: globalIndex / total, slug }
    }
    cumulative += activeRoutes.length
  }
  // Not part of the rail sequence (e.g. request-access-existing-merchant, or a skipped
  // store-verification reached by direct URL) — default to start.
  return { macroIndex: 0, macro: SEQUENCE[0], subIndex: 0, globalIndex: 1, progress: 1 / total, slug }
}

// True when this render's route is a sub-step move within the same macro as the previous route
// (fade up/in-from-bottom), false when it crosses a macro boundary (whole-page cross-fade).
// First mount is treated as a macro move so the initial page doesn't play the sub-step fade.
//
// Computed synchronously during render (React's "storing info from previous renders" pattern)
// rather than via a useEffect — an effect-based version updates the "previous macro" ref one
// commit late, which raced with AnimatePresence's own key-change handling on fast client-side
// navigations (e.g. the Singpass auto-redirect) and could leave the incoming step's motion.div
// stuck holding the macro-fade's exit styles (opacity 0, translated up) instead of resolving to
// visible — the page looked like its fields never loaded even though they were in the DOM.
export function useIsSubStepMove(macroIndex: number) {
  const prevMacroRef = useRef<number | null>(null)
  const lastMacroIndex = prevMacroRef.current
  const isSubStepMove = lastMacroIndex !== null && lastMacroIndex === macroIndex

  if (lastMacroIndex !== macroIndex) {
    prevMacroRef.current = macroIndex
  }

  return isSubStepMove
}

export type PositionWithPath = Position & { pathname: string }

export function useOnboardingPosition() {
  const pathname = usePathname()
  const position = getPosition(pathname)
  const isSubStepMove = useIsSubStepMove(position.macroIndex)
  return { ...position, pathname, isSubStepMove } satisfies PositionWithPath & { isSubStepMove: boolean }
}
