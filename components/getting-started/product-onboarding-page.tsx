"use client"

import { useEffect } from "react"
import { useJourneyRouter as useRouter } from "@/components/getting-started/navigation"
import { type ProductId, updateJourney, useGettingStarted, useGettingStartedHydrated } from "@/lib/getting-started"
import { PRODUCTS, productJourneyHref } from "./catalog"
import { ProductSetup } from "./product-setup"
import { useIsNewMerchant } from "./product-page"
import { OrderTracking, SetupGuide, TerminalPayment } from "./terminal-journey"

/** Intentionally outside TransactionsPlatformShell: only the onboarding rail belongs here. */
export function ProductOnboardingPage({ product }: { product: ProductId }) {
  const state = useGettingStarted()
  const hydrated = useGettingStartedHydrated()
  const isNew = useIsNewMerchant()
  const router = useRouter()
  const { stage, step } = state.journeys[product]
  const inProgress = productJourneyHref(product, stage, step) !== PRODUCTS[product].href
  const needsDeviceSelection = product === "in-store" && (stage === "setup" || stage === "payment") && state.cart.length === 0

  useEffect(() => {
    if (!hydrated) return
    if (isNew && needsDeviceSelection && inProgress) updateJourney(product, { stage: "setup", step: 0 })
    if (!isNew || !inProgress || needsDeviceSelection) router.replace(isNew && stage === "live" && product !== "in-store" ? "/" : PRODUCTS[product].href)
  }, [hydrated, isNew, inProgress, needsDeviceSelection, product, stage, router])

  if (!hydrated || !isNew || !inProgress || needsDeviceSelection) return <div className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted-foreground" role="status">Opening your workspace…</div>
  if (stage === "setup") return <ProductSetup key={product} product={product} />
  if (stage === "payment") return <TerminalPayment />
  if (stage === "shipping") return <OrderTracking />
  return <SetupGuide />
}
