"use client"

import { VariantA } from "./_variant-a"

// Ticket 09 ("Prototype: Face authentication") resolved on Variant A — see
// .scratch/onboarding-experience/issues/09-prototype-face-authentication.md.
// Shell now lives in app/onboarding/(rail)/layout.tsx so it persists across step navigation.
export function FaceAuthenticationClient() {
  return <VariantA />
}
