import { notFound, redirect } from "next/navigation"

export default async function ProductOnboardingRoute({ params }: { params: Promise<{ product: string }> }) {
  const { product } = await params
  if (product !== "in-store" && product !== "payment-links" && product !== "checkout") notFound()
  redirect(`/onboarding-demo/setup/${product}`)
}
