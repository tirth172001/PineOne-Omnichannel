"use client"

import { VariantA } from "./_variant-a"

// Ticket 07 ("Prototype: Business owners") resolved on Variant A — see
// .scratch/onboarding-experience/issues/07-prototype-business-owners.md.
// Shell now lives in app/onboarding/(rail)/layout.tsx so it persists across step navigation.
export function BusinessOwnersClient() {
  return <VariantA />
}
