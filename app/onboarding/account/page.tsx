import { AccountOnboardingFlow } from "@/components/onboarding/account-onboarding-flow"

export default async function AccountOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; mobile?: string; company?: string; products?: string; name?: string }>
}) {
  const params = await searchParams
  const initialProducts = params.products
    ? params.products
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : undefined

  return (
    <AccountOnboardingFlow
      initialEmail={params.email}
      initialMobile={params.mobile}
      initialCompany={params.company}
      initialProducts={initialProducts}
      initialName={params.name}
    />
  )
}
