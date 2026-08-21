"use client"

import { RequestAccessShell } from "./_shell"
import { VariantC } from "./_variant-c"

// Ticket 11 ("Design: Request access to existing merchant") resolved on Variant C — see
// .scratch/onboarding-experience/issues/11-design-request-access-existing-merchant.md.
export function RequestAccessClient() {
  return (
    <RequestAccessShell>
      <VariantC />
    </RequestAccessShell>
  )
}
