"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ManageProductListContent, type ManagedProduct } from "@/components/products/manage-product-list-content"
import { getOnboardingProgress, type ProductOnboardingProgress } from "@/lib/product-onboarding"

const baseOnlinePaymentProducts: ManagedProduct[] = [
  {
    id: "payment-gateway",
    name: "Payment Gateway",
    description: "Checkout orchestration, routing, retries, and end-to-end online collections.",
    configured: true,
    imageIconName: "checkout",
    actions: [
      { label: "Configure", href: "/online-payments/configuration?feature=payment-gateway", variant: "default", showArrow: false },
      { label: "View transactions", href: "/online-payments/transactions?product=payment-gateway", variant: "outline", showArrow: false },
    ],
  },
  {
    id: "subscription",
    name: "Subscription",
    description: "Recurring payment mandates, retries, dunning strategy, and lifecycle controls.",
    configured: true,
    imageIconName: "routing",
    actions: [
      { label: "Configure", href: "/online-payments/configuration?feature=subscription", variant: "default", showArrow: false },
      { label: "View transactions", href: "/online-payments/transactions?product=subscription", variant: "outline", showArrow: false },
    ],
  },
  {
    id: "payout",
    name: "Payout",
    description: "Vendor and beneficiary disbursals with approvals, limits, and settlement tracking.",
    configured: false,
    imageIconName: "duo",
    actions: [
      { label: "Get started", href: "/products/online-payments/payout-setup", variant: "default", showArrow: false },
      { label: "View settlements", href: "/settlements", variant: "outline", showArrow: false },
    ],
  },
  {
    id: "payment-links",
    name: "Payment links",
    description: "Create, manage, and configure payment-link journeys across channels.",
    configured: true,
    imageIconName: "links",
    actions: [
      { label: "Configure", href: "/online-payments/configuration?feature=payment-links", variant: "default", showArrow: false },
      { label: "Manage links", href: "/payment-links/all", variant: "outline", showArrow: false },
    ],
  },
]

function buildPayoutBanner(progress: ProductOnboardingProgress) {
  if (progress.status === "configured") {
    return (
      <section className="rounded-lg border border-success/30 bg-success/10 p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Payout setup complete</p>
            <p className="text-xs text-muted-foreground">You can now manage payouts from configuration and monitoring screens.</p>
          </div>
          <Button asChild size="sm" className="h-8">
            <Link href="/online-payments/configuration?feature=payout">Manage configuration</Link>
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-warning/30 bg-warning/10 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-warning/35 bg-warning/20 text-[10px] text-foreground">
              In progress
            </Badge>
            <p className="text-sm font-semibold text-foreground">Payout setup started</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {progress.stepsCompleted}/{progress.totalSteps} steps complete. Continue configuration to go live.
          </p>
        </div>
        <Button asChild size="sm" className="h-8 gap-1.5">
          <Link href="/online-payments/configuration?feature=payout">
            Continue setup
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </section>
  )
}

export function OnlinePaymentsProductsContent() {
  const [payoutProgress, setPayoutProgress] = useState<ProductOnboardingProgress | null>(null)

  useEffect(() => {
    setPayoutProgress(getOnboardingProgress("payout"))
  }, [])

  const products = useMemo(() => {
    return baseOnlinePaymentProducts.map((product) => {
      if (product.id !== "payout") return product
      if (!payoutProgress) return product

      const isConfigured = payoutProgress.status === "configured"
      const isInProgress = payoutProgress.status === "in_progress"

      return {
        ...product,
        configured: isConfigured,
        metricText: isConfigured
          ? "Configuration complete"
          : isInProgress
            ? `${payoutProgress.stepsCompleted}/${payoutProgress.totalSteps} setup steps complete`
            : "Not configured",
        actions: [
          {
            label: isConfigured ? "Open configuration" : isInProgress ? "Continue setup" : "Get started",
            href: isConfigured || isInProgress
              ? "/online-payments/configuration?feature=payout"
              : "/products/online-payments/payout-setup",
            variant: "default",
            showArrow: false,
          },
          { label: "View settlements", href: "/settlements", variant: "outline", showArrow: false },
        ],
      } satisfies ManagedProduct
    })
  }, [payoutProgress])

  const topBanner = payoutProgress ? buildPayoutBanner(payoutProgress) : null

  return (
    <ManageProductListContent
      title="Online payment products"
      subtitle="Manage gateway, subscription, payout, and payment-link capabilities from one place."
      products={products}
      topBanner={topBanner}
      headerActions={[
        { label: "Checkout configuration", href: "/online-payments/configuration", variant: "outline", showArrow: false },
        { label: "Track setup progress", href: "/products/online-payments/payout-setup", variant: "default", showArrow: false },
      ]}
    />
  )
}
