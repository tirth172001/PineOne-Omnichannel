import { BusinessVerificationClient } from "./_client"

// Business verification step — first screen of the post-business-name onboarding sequence
// (.scratch/onboarding-experience/map.md). Not yet linked from production navigation; the
// remaining steps (tickets 03-10) still need building before this sequence can be wired in.
export default function BusinessVerificationPage() {
  return <BusinessVerificationClient />
}
