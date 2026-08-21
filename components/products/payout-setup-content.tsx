"use client"

import Link from "next/link"
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  WalletIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/panels"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"

const setupSteps = [
  { title: "Business profile", detail: "Set payout display name, support contact, and statement descriptor." },
  { title: "Beneficiary setup", detail: "Add settlement bank details and approval policy for transfers." },
  { title: "Risk controls", detail: "Configure velocity checks, holdback thresholds, and exception rules." },
  { title: "Go live", detail: "Run a test payout and activate for your operations team." },
]

const benefits = [
  { title: "Fast rollout", detail: "Most teams complete setup in under 15 minutes.", icon: ClockIcon },
  { title: "Enterprise-safe", detail: "Approval and limit controls reduce payout risk.", icon: ShieldCheckIcon },
  { title: "Operational clarity", detail: "Track batches and beneficiary states in one place.", icon: WalletIcon },
]

export function PayoutSetupContent() {
  const centerMain = (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <section className="relative overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br from-emerald-950/50 via-card to-card p-6">
        <div className="max-w-2xl space-y-3">
          <Badge variant="outline" className="border-emerald-500/35 bg-emerald-500/10 text-emerald-100">
            Not configured
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Set up payouts before accepting live disbursals</h2>
          <p className="text-sm text-muted-foreground">
            Configure beneficiary routing, risk controls, and settlement visibility for your finance and operations teams.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild className="h-9 gap-1.5">
              <Link href="/online-payments/configuration?feature=payout">
                Start configuration
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-9">
              <Link href="/products/online-payments">Back to products</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <article className="rounded-lg border border-border/70 bg-card/80 p-4">
          <h3 className="text-sm font-semibold text-foreground">Configuration steps</h3>
          <ol className="mt-3 space-y-3">
            {setupSteps.map((step, index) => (
              <li key={step.title} className="flex items-start gap-3 rounded-md border border-border/60 bg-background/60 p-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-xs font-semibold text-foreground">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </article>

        <article className="rounded-lg border border-border/70 bg-card/80 p-4">
          <h3 className="text-sm font-semibold text-foreground">Why configure now</h3>
          <div className="mt-3 space-y-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div key={benefit.title} className="rounded-md border border-border/60 bg-background/60 p-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-emerald-400" />
                    <p className="text-sm font-medium text-foreground">{benefit.title}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{benefit.detail}</p>
                </div>
              )
            })}
          </div>
          <div className="mt-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-100">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircleIcon className="h-3.5 w-3.5" />
              Recommended next step
            </div>
            <p className="mt-1 text-emerald-100/85">
              Start configuration and complete the first two steps to unlock internal payout testing.
            </p>
          </div>
        </article>
      </section>
    </div>
  )

  return (
    <>
      <PageHeader title="Payout setup" subtitle="Online payment" />
      <WorkspaceShell centerMain={centerMain} />
    </>
  )
}
