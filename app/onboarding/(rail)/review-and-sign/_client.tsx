"use client"

import { VariantB } from "./_variant-b"

// Ticket 10 ("Prototype: Review and sign") resolved on Variant B — see
// .scratch/onboarding-experience/issues/10-prototype-review-and-sign.md.
// Shell now lives in app/onboarding/(rail)/layout.tsx so it persists across step navigation.
export function ReviewAndSignClient() {
  return <VariantB />
}
