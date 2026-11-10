"use client"

import { JourneyLink as Link } from "@/components/getting-started/navigation"
import { ArrowRightIcon, CheckCircleIcon, PackageIcon, WrenchIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  activeJourney,
  type GettingStartedState,
  PRODUCT_IDS,
  type ProductId,
  useGettingStarted,
} from "@/lib/getting-started"
import { PRODUCTS, productJourneyHref, productSetupProgress } from "./catalog"
import { UnlockedSectionsCard } from "./product-page"
import { ORDER_STATUS_COPY, OrderTimeline } from "./terminal-journey"

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

/**
 * Overview for a merchant who has just signed up. It starts as a short menu of
 * the three products, keeps a Continue banner for whatever they left half-way,
 * follows a terminal order until it's set up, and explains each section the
 * menu gains once something is live.
 */
export function GettingStartedHome() {
  const state = useGettingStarted()
  const anyLive = PRODUCT_IDS.some((id) => state.journeys[id].stage === "live")
  const anyStarted = PRODUCT_IDS.some((id) => state.journeys[id].stage !== "intro")

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-10 px-6 pb-16 pt-12">
      <header>
        <h1 className="font-heading text-[28px] font-semibold leading-tight text-foreground">
          {anyLive ? greeting() : "Welcome to Pine One"}
        </h1>
        <p className="mt-2 max-w-[620px] text-sm leading-6 text-muted-foreground">
          {anyLive
            ? "Here's where your setup stands. Add another way to get paid whenever you're ready."
            : "Start with one way to get paid — you can add the others any time. Each one has its own place in the menu, so you'll always know where to find it."}
        </p>
      </header>

      <ContinueCard state={state} />

      <UnlockedSectionsCard state={state} />

      <section>
        <h2 className="text-base font-semibold text-foreground">{anyStarted ? "Your products" : "How do you want to get paid?"}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {PRODUCT_IDS.map((id) => (
            <ProductCard key={id} product={id} state={state} />
          ))}
        </div>
      </section>
    </div>
  )
}

function ContinueCard({ state }: { state: GettingStartedState }) {
  const product = activeJourney(state)
  if (!product) return null
  const meta = PRODUCTS[product]
  const journey = state.journeys[product]
  const setup = productSetupProgress(product, journey.step)
  const choosingDevices = product === "in-store" && journey.step === 0 && journey.stage === "setup"

  if (journey.stage === "shipping" && state.order) {
    const order = state.order
    return (
      <section className="rounded-xl border border-border/70 p-5">
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <PackageIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground">Order {order.id}</p>
            <p className="text-base font-semibold text-foreground">Your terminal order · {ORDER_STATUS_COPY[order.status].label}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{ORDER_STATUS_COPY[order.status].body}</p>
          </div>
          <Button asChild variant="outline">
            <Link href={productJourneyHref(product, journey.stage, journey.step)}>Track order</Link>
          </Button>
        </div>
        <div className="mt-5">
          <OrderTimeline order={order} compact />
        </div>
      </section>
    )
  }

  const copy =
    journey.stage === "payment"
      ? { icon: PackageIcon, eyebrow: meta.name, title: "Your order is waiting for payment", body: "Pay to ship your terminals.", cta: "Pay now" }
      : journey.stage === "install"
        ? { icon: WrenchIcon, eyebrow: meta.name, title: "Your terminals have arrived — let's set them up", body: "Four quick steps, about 15 minutes.", cta: "Open setup guide" }
        : {
            icon: meta.icon,
            eyebrow: choosingDevices ? "Choose your devices" : `Step ${setup.index + 1} of ${setup.steps.length} · ${setup.steps[setup.index]}`,
            title: `Continue setting up ${meta.name.toLowerCase()}`,
            body: "Pick up where you left off — everything you entered is saved.",
            cta: "Continue",
          }
  const Icon = copy.icon
  const progress = journey.stage === "setup" ? (choosingDevices ? 0 : setup.index / setup.steps.length) : 0.75

  return (
    <section className="flex flex-wrap items-center gap-4 rounded-xl bg-foreground px-5 py-4 text-background">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/10">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-background/70">{copy.eyebrow}</p>
        <p className="text-base font-semibold">{copy.title}</p>
        <p className="text-sm text-background/70">{copy.body}</p>
        <div className="mt-2 h-1 w-full max-w-[280px] overflow-hidden rounded-full bg-background/15">
          <div className="h-full rounded-full bg-background" style={{ width: `${Math.max(8, progress * 100)}%` }} />
        </div>
      </div>
      <Button asChild variant="secondary" size="lg" className="px-4">
        <Link href={productJourneyHref(product, journey.stage, journey.step)}>
          {copy.cta}
          <ArrowRightIcon />
        </Link>
      </Button>
    </section>
  )
}

function statusOf(state: GettingStartedState, product: ProductId) {
  const journey = state.journeys[product]
  const setup = productSetupProgress(product, journey.step)
  switch (journey.stage) {
    case "intro":
      return { label: "Not set up", tone: "muted" as const, cta: "Get started" }
    case "setup":
      return { label: product === "in-store" && journey.step === 0 ? "Choosing devices" : `In progress · ${setup.index + 1} of ${setup.steps.length}`, tone: "warning" as const, cta: "Continue" }
    case "payment":
      return { label: "Payment pending", tone: "warning" as const, cta: "Pay now" }
    case "shipping":
      return { label: state.order ? ORDER_STATUS_COPY[state.order.status].label : "On the way", tone: "warning" as const, cta: "Track order" }
    case "install":
      return { label: "Ready to set up", tone: "warning" as const, cta: "Set up" }
    default:
      return { label: "Live", tone: "success" as const, cta: "Open" }
  }
}

function ProductCard({ product, state }: { product: ProductId; state: GettingStartedState }) {
  const meta = PRODUCTS[product]
  const status = statusOf(state, product)
  const Icon = meta.icon
  const live = status.tone === "success"

  return (
    <article className="flex flex-col rounded-xl border border-border/70 p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
            status.tone === "success" && "bg-success/10 text-success",
            status.tone === "warning" && "bg-warning/10 text-warning",
            status.tone === "muted" && "bg-muted text-muted-foreground"
          )}
        >
          {live ? <CheckCircleIcon className="h-3 w-3" weight="fill" /> : null}
          {status.label}
        </span>
      </div>
      <p className="mt-4 text-base font-semibold text-foreground">{meta.name}</p>
      <p className="mt-1 flex-1 text-sm leading-5 text-muted-foreground">{meta.tagline}</p>
      <p className="mt-3 text-xs text-muted-foreground">
        Best for {meta.bestFor.charAt(0).toLowerCase() + meta.bestFor.slice(1)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Lives in <span className="font-medium text-foreground">Products › {meta.shortName}</span>
      </p>
      <Button asChild variant={status.tone === "muted" ? "outline" : live ? "ghost" : "default"} className="mt-4 w-full">
        <Link href={productJourneyHref(product, state.journeys[product].stage, state.journeys[product].step)}>{status.cta}</Link>
      </Button>
    </article>
  )
}
