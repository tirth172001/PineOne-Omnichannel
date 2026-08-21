"use client"

import { VariantA } from "./_variant-a"

// Ticket 06 ("Prototype: Banking details") resolved on Variant A — see
// .scratch/onboarding-experience/issues/06-prototype-banking-details.md.
// Shell now lives in app/onboarding/(rail)/layout.tsx so it persists across step navigation.
export function BankingDetailsClient() {
  return <VariantA />
}
