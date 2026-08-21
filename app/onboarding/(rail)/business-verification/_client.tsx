"use client"

import { VariantA } from "./_variant-a"

// Ticket 02 ("Prototype: Business verification") resolved on Variant A — see
// .scratch/onboarding-experience/issues/02-prototype-business-verification.md.
// Shell now lives in app/onboarding/(rail)/layout.tsx so it persists across step navigation.
export function BusinessVerificationClient() {
  return <VariantA />
}
