// Recreated for the archived variants (the original helper was never committed).
import type { Person } from "@/components/onboarding/onboarding-person"

export { initials } from "@/components/onboarding/onboarding-person"

export type Signatory = Person

// The owners entered in the previous step, offered as signatory candidates.
export const ownerCandidates: Signatory[] = [
  { id: "owner-1", name: "Rahul Sharma", designation: "Director", ownershipPercent: 60, isSignatory: false, verificationStatus: "unverified" },
  { id: "owner-2", name: "Priya Menon", designation: "Director", ownershipPercent: 40, isSignatory: false, verificationStatus: "unverified" },
]
