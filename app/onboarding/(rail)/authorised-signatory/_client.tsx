"use client"

import { VariantB } from "./_variant-b"

// Ticket 08 ("Prototype: Authorised signatory") resolved on Variant B — see
// .scratch/onboarding-experience/issues/08-prototype-authorised-signatory.md.
// Shell now lives in app/onboarding/(rail)/layout.tsx so it persists across step navigation.
export function AuthorisedSignatoryClient() {
  return <VariantB />
}
