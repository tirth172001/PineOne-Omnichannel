import { redirect } from "next/navigation"

export default async function SignupVerifyPhonePage({ searchParams }: { searchParams: Promise<{ phone?: string }> }) {
  const { phone } = await searchParams
  redirect(`/onboarding-demo/verify-phone${phone ? `?phone=${encodeURIComponent(phone)}` : ""}`)
}
