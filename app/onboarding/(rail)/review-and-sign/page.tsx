import { ReviewAndSignClient } from "./_client"

// Review and sign step — final screen of the post-business-name onboarding sequence
// (.scratch/onboarding-experience/map.md). Not yet linked from production navigation.
// Its terminal action is the boundary with "Activation," which stays fog on the map.
export default function ReviewAndSignPage() {
  return <ReviewAndSignClient />
}
