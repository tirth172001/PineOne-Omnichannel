"use client"

import { ArrowRightIcon, CheckIcon, ClockIcon, TagIcon } from "@phosphor-icons/react"
import { useJourneyRouter as useRouter } from "@/components/getting-started/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/panels"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { startProductSetup, useGettingStarted, type ProductId } from "@/lib/getting-started"
import { PRODUCTS, productJourneyHref, productSetupProgress } from "./catalog"
import { CartSummary, DevicePicker } from "./product-setup"

const MORE: Record<ProductId, Array<{ title: string; body: string }>> = {
  "in-store": [
    { title: "Choose a device and plan", body: "Compare terminals by how your store takes payments. Choose rent or buy and set the quantity before reviewing the full order total, including tax." },
    { title: "Follow your order", body: "Your order stays in In-store. Overview shows its latest status, from payment confirmation through delivery. When it arrives, the setup guide takes you through activation." },
    { title: "Know where your money is", body: "After setup, Payments shows customer payments taken on your terminals. Settlement shows when that money reaches your bank. Your hardware purchase is separate from these customer payments." },
  ],
  "payment-links": [
    { title: "Collect without a website", body: "Use a payment link for an order, invoice or booking. Choose an amount and description, then share the link with your customer." },
    { title: "Choose how links work", body: "Set expiry, accepted payment methods and reminders once. Business and bank details entered for another product are available here too." },
    { title: "Find links and payments", body: "Payment links is the home for links you create. Payments shows completed customer payments; Settlement tracks the money reaching your bank. Creating a link alone does not mean you have been paid." },
  ],
  checkout: [
    { title: "Verify your business", body: "Complete PAN, GST, document, bank and KYC verification. Website and app details can be explicitly skipped if you do not have them yet." },
    { title: "Use your own branding", body: "Preview your brand colour on the customer payment page. In a live account, you then connect your platform using its integration settings." },
    { title: "Manage it in Checkout", body: "Checkout is where your website integration and payment page settings belong. Payments and Settlement bring together activity from Checkout and any other products you activate." },
  ],
}

/** Shared first-time product page; device selection happens here before setup. */
export function ProductIntro({ product }: { product: ProductId }) {
  const meta = PRODUCTS[product]
  const state = useGettingStarted()
  const router = useRouter()
  const isInStore = product === "in-store"
  const canStart = !isInStore || state.cart.length > 0
  const nextStep = isInStore ? 1 : 0
  const setup = productSetupProgress(product, nextStep)

  function startSetup() {
    if (!canStart) return
    startProductSetup(product, nextStep)
    router.push(productJourneyHref(product, "setup", nextStep))
  }

  return (
    <>
      <PageHeader title={meta.shortName} badges={<Badge variant="outline">Not set up</Badge>} />
      <div className="mx-auto w-full max-w-[1440px] space-y-8 px-4 pb-10">
        <header className="border-b border-border/70 pb-6">
          <h2 className="text-xl font-semibold leading-7 text-foreground">{meta.tagline}</h2>
          <p className="mt-2 max-w-[780px] text-sm leading-6 text-muted-foreground">{meta.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><TagIcon className="h-3.5 w-3.5" aria-hidden="true" />{meta.pricing}</span>
            <span className="flex items-center gap-1.5"><ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />{meta.time}</span>
            <Dialog>
              <DialogTrigger asChild><Button variant="link" size="sm" className="h-auto p-0 text-xs">Learn more</Button></DialogTrigger>
              <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[560px] p-6">
                <DialogHeader><DialogTitle>About {meta.shortName.toLowerCase()}</DialogTitle><DialogDescription>{meta.tagline}</DialogDescription></DialogHeader>
                <dl className="divide-y divide-border">{MORE[product].map((item) => <div key={item.title} className="py-4"><dt className="text-sm font-medium">{item.title}</dt><dd className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</dd></div>)}</dl>
                <p className="text-xs text-muted-foreground">Explore this prototype with sample details. No real payments or orders are submitted.</p>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
          <section className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">{isInStore ? "Choose your devices" : "How it works"}</h2>
            <p className="mb-5 mt-1 text-sm leading-6 text-muted-foreground">
              {isInStore ? "Select a device, plan and quantity first. We'll ask for delivery and business details next." : "Here's what you'll set up before you start accepting payments."}
            </p>
            {isInStore ? <DevicePicker cart={state.cart} /> : <ol className="divide-y divide-border/70 rounded-xl border border-border/70 px-5">
              {meta.howItWorks.map((step, index) => <li key={step.title} className="flex gap-4 py-5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{index + 1}</span>
                <div><h3 className="text-sm font-medium text-foreground">{step.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{step.body}</p></div>
              </li>)}
            </ol>}
          </section>

          <aside aria-label="Setup summary" className="space-y-5 xl:sticky xl:top-6">
            {isInStore ? <CartSummary cart={state.cart} /> : <div className="rounded-xl bg-muted/50 p-5">
              <p className="text-sm font-semibold text-foreground">Set up {meta.shortName.toLowerCase()}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{meta.bestFor}</p>
              <p className="mt-3 text-xs text-muted-foreground">{setup.steps.length} steps · {meta.time}</p>
            </div>}
            <div className="space-y-4 px-1">
              <div>
                <p className="text-xs font-medium text-muted-foreground">You'll need for setup</p>
                <ul className="mt-2 space-y-2">{meta.youWillNeed.map((item) => <li key={item} className="flex items-start gap-2 text-sm leading-5 text-foreground"><CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />{item}</li>)}</ul>
              </div>
              <Button size="lg" className="w-full" onClick={startSetup} disabled={!canStart} aria-describedby={isInStore ? "device-selection-hint" : undefined}>
                {isInStore ? "Continue to setup" : "Get started"}<ArrowRightIcon aria-hidden="true" />
              </Button>
              <p id={isInStore ? "device-selection-hint" : undefined} className="text-xs leading-5 text-muted-foreground">
                {isInStore ? canStart ? "Your selection is saved. Next: delivery address." : "Add at least one device to continue." : "Your progress is saved as you go. You can finish later."}
              </p>
            </div>
          </aside>
        </div>

        <section className="border-t border-border/70 pt-6">
          <h2 className="text-base font-semibold text-foreground">Where to find everything</h2>
          <dl className="mt-4 grid gap-5 md:grid-cols-3">{meta.whereToFind.map((row) => <div key={row.label}><dt className="text-sm font-medium text-foreground">{row.label}</dt><dd className="mt-1 text-sm leading-6 text-muted-foreground">{row.body}</dd></div>)}</dl>
        </section>
      </div>
    </>
  )
}
