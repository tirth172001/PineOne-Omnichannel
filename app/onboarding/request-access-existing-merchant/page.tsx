import { RequestAccessClient } from "./_client"

// "Request access to an existing merchant" branch — taken at the signup fork instead of
// creating a new business (.scratch/onboarding-experience/map.md, ticket 11). Not yet linked
// from production navigation. Merchant-side approval is out of scope (see map).
export default function RequestAccessPage() {
  return <RequestAccessClient />
}
