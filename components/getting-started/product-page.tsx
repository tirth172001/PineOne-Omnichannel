"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useJourneyRouter as useRouter } from "@/components/getting-started/navigation"
import { JourneyLink as Link } from "@/components/getting-started/navigation"
import { ArrowRightIcon, CheckCircleIcon } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PageHeader } from "@/components/ui/panels"
import { useActiveBusinessProfile } from "@/lib/business-profiles"
import { enableMoreTools, updateGettingStarted, visibleSectionIds, type GettingStartedState, NEW_MERCHANT_PROFILE_ID, type ProductId, useGettingStarted } from "@/lib/getting-started"
import { getDevice, INR, PRODUCTS, UNLOCKED_SECTIONS, productJourneyHref } from "./catalog"
import { DeviceArt } from "./device-art"
import { ProductIntro } from "./product-intro"
import { TerminalDetails } from "./terminal-details"
import { useIsOnboardingDemo } from "./navigation"

export function useIsNewMerchant() {
  const profile = useActiveBusinessProfile()
  const inDemo = useIsOnboardingDemo()
  return inDemo && profile.id === NEW_MERCHANT_PROFILE_ID
}

/**
 * Product pages show the full product only for established merchants. A new
 * merchant sees where they are in that product's journey instead: what it is,
 * its setup, the order, the setup guide — and once live, a light view of what
 * they've set up.
 */
export function NewMerchantProductGate({ product, children }: { product: ProductId; children: ReactNode }) {
  const isNew = useIsNewMerchant()
  if (!isNew) return <>{children}</>
  return <ProductJourneyPage product={product} />
}

function ProductJourneyPage({ product }: { product: ProductId }) {
  const state = useGettingStarted()
  const { stage, step } = state.journeys[product]
  const router = useRouter()
  const isChoosing = product === "in-store" && stage === "setup" && step === 0
  const isSetup = stage !== "intro" && stage !== "live" && !isChoosing

  useEffect(() => {
    if (isSetup) router.replace(productJourneyHref(product, stage, step))
  }, [isSetup, product, stage, step, router])

  if (stage === "intro" || isChoosing) return <ProductIntro product={product} />
  if (isSetup) return <p role="status" className="p-8 text-sm text-muted-foreground">Opening your setup…</p>
  return <ProductLive product={product} state={state} />
}

function ProductLive({ product, state }: { product: ProductId; state: GettingStartedState }) {
  const meta = PRODUCTS[product]

  return (
    <>
      <PageHeader
        title={product === "in-store" ? "In-store" : meta.name}
        badges={<Badge variant="outline" className="border-success/40 text-success">Live</Badge>}
      />
      <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 pb-10">
        <LiveBanner product={product} />
        {product === "in-store" ? <TerminalDetails state={state} /> : null}
        {product === "in-store" ? <TerminalsLive state={state} /> : null}
        {product === "payment-links" ? <LinksLive state={state} /> : null}
        {product === "checkout" ? <CheckoutLive state={state} /> : null}
      </div>
    </>
  )
}

function LiveBanner({ product }: { product: ProductId }) {
  const meta = PRODUCTS[product]
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-success/10 px-5 py-4">
      <CheckCircleIcon className="h-6 w-6 shrink-0 text-success" weight="fill" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{meta.name} is live</p>
        <p className="text-sm text-muted-foreground">
          Your {meta.paymentsCopy} now show in{" "}
          <Link href="/transactions" className="font-medium text-foreground underline underline-offset-2">
            Payments
          </Link>
          , and the money reaching your bank in{" "}
          <Link href="/settlements" className="font-medium text-foreground underline underline-offset-2">
            Settlement
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

function TerminalsLive({ state }: { state: GettingStartedState }) {
  const lines = state.order?.lines ?? []
  const devices = lines.flatMap((line) => Array.from({ length: line.qty }, (_, index) => ({ line, index })))

  return (
    <section className="overflow-hidden rounded-xl border border-border/70">
      <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-4 border-b border-border/60 bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground">
        <span>Device</span>
        <span>Terminal ID</span>
        <span>Store</span>
        <span>Status</span>
      </div>
      {devices.map(({ line, index }, rowIndex) => {
        const device = getDevice(line.deviceId)
        return (
          <div key={`${line.deviceId}-${index}`} className="grid grid-cols-[1.4fr_1fr_1fr_1fr] items-center gap-4 border-b border-border/60 px-4 py-3 text-sm last:border-b-0">
            <span className="flex items-center gap-3">
              <DeviceArt id={device.id} className="h-9 w-9" />
              <span>
                <span className="block font-medium text-foreground">{device.name}</span>
                <span className="block text-xs text-muted-foreground">{line.plan === "lifetime" ? "Owned" : `Rented · ${INR.format(device.rentalMonthly)}/month`}</span>
              </span>
            </span>
            <span className="tabular-nums text-foreground">TID {String(73872300 + rowIndex * 7 + 11)}</span>
            <span className="text-foreground">{state.delivery?.storeName ?? "Your store"}</span>
            <span className="flex items-center gap-1.5 text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Active
            </span>
          </div>
        )
      })}
    </section>
  )
}

function LinksLive({ state }: { state: GettingStartedState }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [purpose, setPurpose] = useState("")
  const [linkMessage, setLinkMessage] = useState("")
  const valid = Number(amount) > 0 && Number(amount) <= 10000000 && purpose.trim().length > 1
  return (
    <section className="overflow-hidden rounded-xl border border-border/70">
      <div className="flex items-center justify-between gap-4 border-b border-border p-4"><div><h2 className="text-base font-semibold">Your payment links</h2><p className="mt-1 text-sm text-muted-foreground">Create a link when you’re ready to collect a payment.</p></div><Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button>Create payment link</Button></DialogTrigger><DialogContent><DialogTitle>Create a payment link</DialogTitle><DialogDescription>Create a sample link. No real money can be collected.</DialogDescription><label className="space-y-2 text-sm">Payment for<Input value={purpose} onChange={(event) => setPurpose(event.target.value)} placeholder="E.g. Order advance" /></label><label className="space-y-2 text-sm">Amount (₹)<Input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" /></label><Button disabled={!valid} onClick={() => {
        if (!valid) return
        const link = { id: `plink_${crypto.randomUUID().slice(0, 8)}`, amount: Number(amount), purpose: purpose.trim(), createdAt: new Date().toISOString() }
        updateGettingStarted((current) => ({ ...current, paymentLinks: [...current.paymentLinks, link], firstLinkId: current.firstLinkId ?? link.id }))
        setOpen(false); setAmount(""); setPurpose("")
      }}>Create demo link</Button></DialogContent></Dialog></div>
      <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 border-b border-border/60 bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground">
        <span>For</span>
        <span>Amount</span>
        <span>Created</span>
        <span>Status</span>
      </div>
      {state.paymentLinks.length === 0 ? <p className="px-4 py-10 text-center text-sm text-muted-foreground">No payment links yet. Create your first link above.</p> : null}
      {state.paymentLinks.map((link) => (
        <div key={link.id} className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 border-b border-border/60 px-4 py-3 text-sm last:border-b-0">
          <div className="min-w-0"><p className="font-medium text-foreground">{link.purpose}</p><Input readOnly aria-label={`Demo URL for ${link.purpose}`} value={`https://pay.pine-demo.test/${link.id}`} className="mt-2 h-7 text-xs" /><Button variant="link" size="sm" className="mt-1 h-auto p-0 text-xs" onClick={async () => { try { await navigator.clipboard.writeText(`https://pay.pine-demo.test/${link.id}`); setLinkMessage("Demo link copied. This sample URL cannot accept payments.") } catch { setLinkMessage("Select and copy the sample URL from the field above.") } }}>Copy demo link</Button></div>
          <span className="tabular-nums text-foreground">{INR.format(link.amount)}</span>
          <span className="text-muted-foreground">{new Date(link.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" /> Waiting for payment
          </span>
        </div>
      ))}
      {linkMessage ? <p role="status" className="border-t border-border px-4 py-3 text-xs text-muted-foreground">{linkMessage}</p> : null}
    </section>
  )
}

function CheckoutLive({ state }: { state: GettingStartedState }) {
  const checkout = state.checkout
  return (
    <section className="space-y-4"><div className="grid gap-4 md:grid-cols-3">
      {[
        ["Website", checkout?.website || "Not provided"],
        ["Platform", checkout?.platform === "custom" ? "Custom website or app" : checkout?.platform === "woocommerce" ? "WooCommerce" : "Shopify"],
        ["Integration", "Ready to configure"],
      ].map(([label, value]) => (
        <div key={label} className="rounded-xl border border-border/70 p-4">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
        </div>
      ))}
    </div><div className="rounded-xl border border-border p-5"><h2 className="font-semibold">Connect your website or app</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Your business onboarding is complete. Configure your integration here, then test your first payment.</p><Dialog><DialogTrigger asChild><Button variant="outline" className="mt-4">View API keys</Button></DialogTrigger><DialogContent><DialogTitle>Checkout API keys</DialogTitle><DialogDescription>Sample test credentials for exploring integration. These cannot collect payments.</DialogDescription><label className="space-y-2 text-sm">Test public key<Input readOnly value="pk_test_pine_onboarding_demo" /></label></DialogContent></Dialog></div></section>
  )
}

/** "Now in your menu" — explains the sections a live product just added. */
export function UnlockedSectionsCard({ state }: { state: GettingStartedState }) {
  const live = (Object.keys(state.journeys) as ProductId[]).filter((id) => state.journeys[id].stage === "live")
  if (live.length === 0) return null
  const sources = live.map((id) => PRODUCTS[id].shortName.toLowerCase()).join(" and ")

  return (
    <section className="rounded-xl border border-border/70 p-5">
      <h2 className="text-base font-semibold text-foreground">New in your menu</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {live.length > 1 ? "Your live products share these sections" : `Now that ${sources} is ready, these sections are available`}. They show the payments you receive from {sources}, and when that money reaches your bank.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {UNLOCKED_SECTIONS.filter((section) => visibleSectionIds(state).includes(section.id)).map((section) => {
          const Icon = section.icon
          const fresh = !state.seenSections.includes(section.id)
          return (
            <Link key={section.id} href={section.href} className="group flex gap-3 rounded-lg p-3 transition-colors hover:bg-muted/60">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {section.label}
                  {fresh ? <span className="rounded-full bg-primary/10 px-1.5 py-px text-[10px] font-semibold text-primary">New</span> : null}
                  <ArrowRightIcon className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{section.body}</span>
              </span>
            </Link>
          )
        })}
      </div>
      {!state.moreToolsEnabled ? <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
        <div><p className="text-sm font-medium">Need more tools?</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Add Refunds, Disputes and Reports when you're ready to manage more.</p></div>
        <Button variant="outline" onClick={enableMoreTools}>Add more tools</Button>
      </div> : null}
    </section>
  )
}
