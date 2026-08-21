"use client"

import { VariantA } from "./_variant-a"

// Ticket 05 ("Prototype: Website/app details") resolved on Variant A — see
// .scratch/onboarding-experience/issues/05-prototype-website-app-details.md.
// Shell now lives in app/onboarding/(rail)/layout.tsx so it persists across step navigation.
export function WebsiteAppDetailsClient() {
  return <VariantA />
}
