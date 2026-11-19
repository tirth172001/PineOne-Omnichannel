import type { ComponentType } from "react"
import { VariantB as BusinessVerificationVariantB } from "@/app/onboarding/business-verification/_variant-b"
import { VariantC as BusinessVerificationVariantC } from "@/app/onboarding/business-verification/_variant-c"
import { VariantB as BusinessBasicsVariantB } from "@/app/onboarding/business-basics/_variant-b"
import { VariantC as BusinessBasicsVariantC } from "@/app/onboarding/business-basics/_variant-c"
import { VariantB as StoreVerificationVariantB } from "@/app/onboarding/store-verification/_variant-b"
import { VariantC as StoreVerificationVariantC } from "@/app/onboarding/store-verification/_variant-c"
import { VariantB as WebsiteAppDetailsVariantB } from "@/app/onboarding/website-app-details/_variant-b"
import { VariantC as WebsiteAppDetailsVariantC } from "@/app/onboarding/website-app-details/_variant-c"
import { VariantB as BankingDetailsVariantB } from "@/app/onboarding/banking-details/_variant-b"
import { VariantC as BankingDetailsVariantC } from "@/app/onboarding/banking-details/_variant-c"
import { VariantB as BusinessOwnersVariantB } from "@/app/onboarding/business-owners/_variant-b"
import { VariantC as BusinessOwnersVariantC } from "@/app/onboarding/business-owners/_variant-c"
import { VariantA as AuthorisedSignatoryVariantA } from "@/app/onboarding/authorised-signatory/_variant-a"
import { VariantC as AuthorisedSignatoryVariantC } from "@/app/onboarding/authorised-signatory/_variant-c"
import { VariantB as FaceAuthenticationVariantB } from "@/app/onboarding/face-authentication/_variant-b"
import { VariantC as FaceAuthenticationVariantC } from "@/app/onboarding/face-authentication/_variant-c"
import { VariantA as ReviewAndSignVariantA } from "@/app/onboarding/review-and-sign/_variant-a"
import { VariantC as ReviewAndSignVariantC } from "@/app/onboarding/review-and-sign/_variant-c"
import { VariantA as RequestAccessExistingMerchantVariantA } from "@/app/onboarding/request-access-existing-merchant/_variant-a"
import { VariantB as RequestAccessExistingMerchantVariantB } from "@/app/onboarding/request-access-existing-merchant/_variant-b"
import { VariantC as RequestAccessExistingMerchantVariantC } from "@/app/onboarding/request-access-existing-merchant/_variant-c"

// Archived design variants per onboarding step (branches prototype/ticket-02 … ticket-11, Aug 2026).
// The winning design is the live step at `live`; these are the alternatives that lost, kept for comparison.
export type StepVariants = { title: string; live: string; variants: { key: string; label: string; Component: ComponentType }[] }

export const STEP_VARIANTS: Record<string, StepVariants> = {
  "business-verification": { title: "Business verification", live: "/onboarding/business-verification", variants: [{ key: "b", label: "Variant B", Component: BusinessVerificationVariantB }, { key: "c", label: "Variant C", Component: BusinessVerificationVariantC }] },
  "business-basics": { title: "Business basics", live: "/onboarding/business-basics", variants: [{ key: "b", label: "Variant B", Component: BusinessBasicsVariantB }, { key: "c", label: "Variant C", Component: BusinessBasicsVariantC }] },
  "store-verification": { title: "Store verification", live: "/onboarding/store-verification", variants: [{ key: "b", label: "Variant B", Component: StoreVerificationVariantB }, { key: "c", label: "Variant C", Component: StoreVerificationVariantC }] },
  "website-app-details": { title: "Website & app details", live: "/onboarding/website-app-details", variants: [{ key: "b", label: "Variant B", Component: WebsiteAppDetailsVariantB }, { key: "c", label: "Variant C", Component: WebsiteAppDetailsVariantC }] },
  "banking-details": { title: "Banking details", live: "/onboarding/banking-details", variants: [{ key: "b", label: "Variant B", Component: BankingDetailsVariantB }, { key: "c", label: "Variant C", Component: BankingDetailsVariantC }] },
  "business-owners": { title: "Business owners", live: "/onboarding/business-owners", variants: [{ key: "b", label: "Variant B", Component: BusinessOwnersVariantB }, { key: "c", label: "Variant C", Component: BusinessOwnersVariantC }] },
  "authorised-signatory": { title: "Authorised signatory", live: "/onboarding/authorised-signatory", variants: [{ key: "a", label: "Variant A", Component: AuthorisedSignatoryVariantA }, { key: "c", label: "Variant C", Component: AuthorisedSignatoryVariantC }] },
  "face-authentication": { title: "Face authentication", live: "/onboarding/face-authentication", variants: [{ key: "b", label: "Variant B", Component: FaceAuthenticationVariantB }, { key: "c", label: "Variant C", Component: FaceAuthenticationVariantC }] },
  "review-and-sign": { title: "Review & sign", live: "/onboarding/review-and-sign", variants: [{ key: "a", label: "Variant A", Component: ReviewAndSignVariantA }, { key: "c", label: "Variant C", Component: ReviewAndSignVariantC }] },
  "request-access-existing-merchant": { title: "Request access (existing merchant)", live: "/onboarding/request-access-existing-merchant", variants: [{ key: "a", label: "Variant A", Component: RequestAccessExistingMerchantVariantA }, { key: "b", label: "Variant B", Component: RequestAccessExistingMerchantVariantB }, { key: "c", label: "Variant C", Component: RequestAccessExistingMerchantVariantC }] },
}
