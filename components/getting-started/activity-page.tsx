"use client"

import type { ReactNode } from "react"
import { JourneyLink as Link } from "@/components/getting-started/navigation"
import { useJourneyPathname as usePathname } from "@/components/getting-started/navigation"
import { ArrowRightIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { liveProducts, useGettingStarted, visibleSectionIds } from "@/lib/getting-started"
import { PRODUCTS, UNLOCKED_SECTIONS } from "./catalog"
import { useIsNewMerchant } from "./product-page"

const EMPTY_COPY: Record<string, { title: string; body: string }> = {
  payments: { title: "Your first payment will appear here", body: "See the amount, customer and status of every payment from your live products." },
  settlements: { title: "Your first settlement will appear here", body: "A payment is what your customer pays. A settlement is that money reaching your bank, after applicable fees." },
  refunds: { title: "No refunds yet", body: "When you return money to a customer, track it here against the original payment." },
  disputes: { title: "No disputes to respond to", body: "If a customer challenges a payment with their bank, the case and the next action will appear here." },
  reports: { title: "Your reports start with your payments", body: "Once payments arrive, this is where you'll find payment and settlement reports for your live products." },
}

/** New merchant activity must never leak the established merchant's sample transactions. */
export function NewMerchantActivityGate({ children }: { children: ReactNode }) {
  const isNew = useIsNewMerchant()
  const pathname = usePathname()
  const state = useGettingStarted()
  const section = UNLOCKED_SECTIONS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
  if (!isNew || !section) return <>{children}</>

  const live = liveProducts(state)
  const available = visibleSectionIds(state).includes(section.id)
  const Icon = section.icon
  const copy = EMPTY_COPY[section.id]

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-9 lg:px-10">
      <h1 className="font-heading text-2xl font-semibold">{section.label}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{section.body}</p>
      {available ? <div className="mt-6 flex flex-wrap items-center gap-2 border-y border-border/70 py-3">
        <span className="mr-2 text-xs font-medium text-muted-foreground">From your live products</span>
        {live.map((id) => <Link key={id} href={PRODUCTS[id].href} className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium hover:bg-accent">{PRODUCTS[id].shortName}</Link>)}
      </div> : null}
      <section className="flex min-h-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><Icon className="h-6 w-6 text-muted-foreground" /></div>
        <h2 className="mt-6 text-lg font-semibold">{available ? copy.title : live.length ? "Add this tool when you're ready" : "Start with a product"}</h2>
        <p className="mt-2 max-w-[460px] text-sm leading-6 text-muted-foreground">
          {available ? copy.body : live.length ? "Keep your menu simple. You can add Refunds, Disputes and Reports from Overview whenever you need them." : `Set up In-store, Payment links or Checkout first. ${section.label} will be introduced when a product is ready.`}
        </p>
        {available && section.id === "settlements" && state.bank ? <p className="mt-4 text-sm text-muted-foreground">Settlement account ending {state.bank.account.slice(-4)} · {state.bank.ifsc}</p> : null}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {available ? live.map((id) => <Button key={id} asChild variant="outline"><Link href={PRODUCTS[id].href}>Open {PRODUCTS[id].shortName}<ArrowRightIcon /></Link></Button>) : <Button asChild><Link href="/">Go to Overview<ArrowRightIcon /></Link></Button>}
        </div>
        {available ? <p className="mt-6 text-xs text-muted-foreground">Demo workspace · no real payments have been received.</p> : null}
      </section>
    </div>
  )
}
