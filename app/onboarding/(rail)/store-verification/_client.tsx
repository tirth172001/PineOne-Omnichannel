"use client"

import { VariantA } from "./_variant-a"

// Ticket 04 ("Prototype: Store verification") resolved on Variant A — see
// .scratch/onboarding-experience/issues/04-prototype-store-verification.md.
// Shell now lives in app/onboarding/(rail)/layout.tsx so it persists across step navigation.
export function StoreVerificationClient() {
  return <VariantA />
}
