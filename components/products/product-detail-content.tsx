"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/panels"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Clock,
  Lightbulb,
  Sparkles,
  Zap,
} from "lucide-react"
import type { Product } from "@/lib/products-data"

interface ProductDetailContentProps {
  product: Product
}

type ContextPanelMode = "readiness" | "benchmark" | "next" | null

const productDetails: Record<
  string,
  {
    benefits: string[]
    requirements: string[]
    timeToEnable: string
    howItWorks: string[]
    benchmark?: {
      label: string
      value: string
    }
  }
> = {
  "pine-labs-upi": {
    benefits: [
      "5% higher success rate during peak hours",
      "Smart routing to select best PSP automatically",
      "Automatic retry on failed transactions",
      "Real-time analytics and insights",
      "Works with your existing POS setup",
    ],
    requirements: [
      "Active Pine Labs merchant account",
      "KYC verification complete",
      "Bank account linked for settlements",
    ],
    timeToEnable: "2-3 business days",
    howItWorks: [
      "Customer scans your QR code or enters VPA",
      "Pine Labs routes to optimal payment path",
      "Transaction processed with smart retries",
      "Instant confirmation on your POS",
      "Settlement to your account as per schedule",
    ],
    benchmark: {
      label: "Merchants like you average",
      value: "96.9% UPI success rate",
    },
  },
  emi: {
    benefits: [
      "Increase average order value by up to 40%",
      "Support for all major banks",
      "No-cost EMI options available",
      "Instant approval for customers",
      "Seamless checkout experience",
    ],
    requirements: [
      "Active Pine Labs merchant account",
      "Minimum monthly volume of ₹50,000",
      "Category eligible for EMI",
    ],
    timeToEnable: "1-2 business days",
    howItWorks: [
      "Customer chooses EMI at checkout",
      "Bank verifies eligibility in real-time",
      "Customer selects tenure and confirms",
      "You receive full amount upfront",
      "Customer pays bank in installments",
    ],
    benchmark: {
      label: "Average ticket size increase",
      value: "₹4,200 to ₹5,880",
    },
  },
  "merchant-lending": {
    benefits: [
      "Pre-approved based on transaction history",
      "Quick disbursal within 24 hours",
      "Flexible repayment terms",
      "No collateral required",
      "Transparent interest rates",
    ],
    requirements: [
      "6+ months of transaction history",
      "Minimum monthly volume of ₹1,00,000",
      "Valid business documentation",
    ],
    timeToEnable: "24-48 hours after approval",
    howItWorks: [
      "Check your pre-approved limit",
      "Select loan amount and tenure",
      "Complete digital documentation",
      "Receive funds in your account",
      "Repay through daily deductions or EMI",
    ],
    benchmark: {
      label: "Based on your history, eligible for",
      value: "Up to ₹5,00,000",
    },
  },
}

export function ProductDetailContent({ product }: ProductDetailContentProps) {
  const [panelMode, setPanelMode] = useState<ContextPanelMode>(null)

  const details =
    productDetails[product.id] || {
      benefits: [
        "Seamless integration with existing setup",
        "24/7 support and monitoring",
        "Real-time analytics and reporting",
        "Competitive pricing",
      ],
      requirements: ["Active Pine Labs merchant account", "KYC verification complete"],
      timeToEnable: "1-3 business days",
      howItWorks: [
        "Enable the feature from your dashboard",
        "Complete any required verification",
        "Start using immediately",
      ],
    }

  const isEnabled = product.status === "enabled"
  const isComingSoon = product.status === "coming-soon"

  const primaryActionHref =
    product.id === "merchant-lending"
      ? "/onboarding/lending"
      : product.id === "android-pos"
        ? "/onboarding/pos"
        : "/online-payments"

  const primaryActionLabel = isEnabled
    ? "Open Product Settings"
    : product.id === "merchant-lending"
      ? "Check Eligibility"
      : "Start Enabling"

  const rightContext = useMemo(() => {
    if (!panelMode) return null

    if (panelMode === "readiness") {
      return (
        <div className="h-full overflow-y-auto p-5 space-y-5">
          <h3 className="text-sm font-semibold text-foreground">Readiness checklist</h3>
          <div className="rounded-lg border border-border bg-secondary/35 p-3">
            <p className="text-xs text-muted-foreground">Estimated enablement window</p>
            <p className="text-sm font-medium text-foreground">{details.timeToEnable}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="mb-2 text-xs text-muted-foreground">Required prerequisites</p>
            <ul className="space-y-2">
              {details.requirements.map((requirement) => (
                <li key={requirement} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                  {requirement}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <Button asChild>
              <Link href={primaryActionHref}>{primaryActionLabel}</Link>
            </Button>
            <Button variant="outline" onClick={() => setPanelMode(null)}>
              Close
            </Button>
          </div>
        </div>
      )
    }

    if (panelMode === "benchmark") {
      return (
        <div className="h-full overflow-y-auto p-5 space-y-5">
          <h3 className="text-sm font-semibold text-foreground">Benchmark and impact</h3>
          <div className="rounded-lg border border-border bg-secondary/35 p-3">
            <p className="text-xs text-muted-foreground">What happened</p>
            <p className="text-sm text-foreground">This product can materially improve conversion and throughput in your current mix.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Why it matters</p>
            <p className="text-sm text-foreground">Higher success and faster completion improve settlement velocity and reduce support load.</p>
          </div>
          {details.benchmark && (
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">{details.benchmark.label}</p>
              <p className="text-lg font-semibold text-primary">{details.benchmark.value}</p>
            </div>
          )}
          <div className="space-y-2">
            <Button asChild>
              <Link href={primaryActionHref}>Apply This Improvement</Link>
            </Button>
            <Button variant="outline" onClick={() => setPanelMode(null)}>
              Close
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="h-full overflow-y-auto p-5 space-y-5">
        <h3 className="text-sm font-semibold text-foreground">Next-step actions</h3>
        <div className="rounded-lg border border-border bg-secondary/35 p-3">
          <p className="text-xs text-muted-foreground">Flow</p>
          <p className="text-sm text-foreground">Discover -&gt; evaluate -&gt; enable -&gt; operate -&gt; optimize</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="mb-2 text-xs text-muted-foreground">Recommended next moves</p>
          <ul className="space-y-2">
            {details.howItWorks.slice(0, 3).map((step) => (
              <li key={step} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {step}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <Button asChild>
            <Link href={primaryActionHref}>Continue Flow</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/support">Need Help</Link>
          </Button>
        </div>
      </div>
    )
  }, [details.benchmark, details.howItWorks, details.requirements, details.timeToEnable, panelMode, primaryActionHref, primaryActionLabel])

  const centerMain = (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <Card className="border-border bg-card">
        <CardContent className="space-y-6 p-6 lg:p-8">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <product.icon className="h-7 w-7 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-foreground">{product.name}</h1>
                {isEnabled && (
                  <Badge className="border-success/30 bg-success/10 text-success">
                    <Check className="mr-1 h-3 w-3" />Enabled
                  </Badge>
                )}
                {isComingSoon && (
                  <Badge variant="outline" className="text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />Coming Soon
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          </div>

          {product.whyUseful && (
            <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm text-foreground">{product.whyUseful}</p>
            </div>
          )}

          <div>
            <h3 className="mb-3 text-sm font-medium text-foreground">Key benefits</h3>
            <ul className="grid gap-2 md:grid-cols-2">
              {details.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 rounded-lg border border-border bg-secondary/30 p-3 text-sm text-foreground">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {!isComingSoon ? (
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={primaryActionHref}>
                  {primaryActionLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" onClick={() => setPanelMode("readiness")}>Readiness</Button>
              <Button variant="outline" onClick={() => setPanelMode("benchmark")}>Benchmark</Button>
              <Button variant="outline" onClick={() => setPanelMode("next")}>Next Steps</Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/35 p-4">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Coming soon</p>
                <p className="text-sm text-muted-foreground">We will notify you when this feature is available.</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto bg-transparent">Notify Me</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {!isComingSoon && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Lightbulb className="h-4 w-4 text-primary" />
              How it works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {details.howItWorks.map((step, index) => (
                <Button variant="ghost"
                  key={step}
                  className="rounded-lg border border-border bg-secondary/25 p-3 !h-auto !justify-start text-left transition-colors hover:border-primary/30 hover:bg-secondary/45"
                  onClick={() => setPanelMode("next")}
                >
                  <p className="mb-1 text-xs text-muted-foreground">Step {index + 1}</p>
                  <p className="text-sm text-foreground">{step}</p>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Works well with</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Smart Routing", desc: "Optimize payment success rates" },
              { name: "Analytics", desc: "Deep insights into performance" },
              { name: "Webhooks", desc: "Real-time event notifications" },
            ].map((item) => (
              <Button variant="ghost"
                key={item.name}
                onClick={() => setPanelMode("benchmark")}
                className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3 !h-auto !justify-start text-left transition-colors hover:border-primary/30"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <>
      <PageHeader title={product.name} description="Product deep-dive, readiness, and action flow">
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setPanelMode("readiness")}>
          Readiness
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setPanelMode("benchmark")}>
          Benchmark
        </Button>
        {panelMode && (
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setPanelMode(null)}>
            Close Context
          </Button>
        )}
      </PageHeader>

      <WorkspaceShell
        centerMain={centerMain}
        rightContext={rightContext}
        showRightContext={Boolean(panelMode)}
      />
    </>
  )
}
