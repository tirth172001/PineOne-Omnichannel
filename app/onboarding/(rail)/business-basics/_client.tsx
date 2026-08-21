"use client"

import { VariantA } from "./_variant-a"

// Ticket 03 ("Prototype: Business basics") resolved on Variant A — see
// .scratch/onboarding-experience/issues/03-prototype-business-basics.md.
// Shell now lives in app/onboarding/(rail)/layout.tsx so it persists across step navigation.
export function BusinessBasicsClient() {
  return <VariantA />
}
