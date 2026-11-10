"use client"

import { useJourneyRouter as useRouter } from "@/components/getting-started/navigation"
import { CheckCircleIcon, ArrowRightIcon } from "@phosphor-icons/react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { liveProducts, updateGettingStarted, useGettingStarted } from "@/lib/getting-started"
import { PRODUCTS, UNLOCKED_SECTIONS } from "./catalog"

export function ActivationIntroduction() {
  const state = useGettingStarted()
  const router = useRouter()
  const product = state.pendingIntroduction
  const multiple = liveProducts(state).length > 1
  const dismiss = () => updateGettingStarted((current) => ({ ...current, pendingIntroduction: null }))

  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => { if (!open) dismiss() }}>
      <DialogContent className="sm:max-w-[520px] p-6">
        {product ? <>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircleIcon className="h-6 w-6" weight="fill" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl leading-7">{PRODUCTS[product].shortName} is ready</DialogTitle>
            <DialogDescription>
              {multiple
                ? `Payments and Settlement now include ${PRODUCTS[product].shortName.toLowerCase()}, alongside your other live products.`
                : "Two new sections are now in your menu. Here's where the money from this product will appear."}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-6 text-muted-foreground">Your {PRODUCTS[product].paymentsCopy} stay connected to this product.</p>
          <div className="divide-y divide-border rounded-xl border border-border">
            {UNLOCKED_SECTIONS.slice(0, 2).map((section) => {
              const Icon = section.icon
              return <div key={section.id} className="flex gap-3 p-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div><p className="text-sm font-medium">{section.label}</p><p className="mt-1 text-sm leading-5 text-muted-foreground">{section.body}</p></div>
              </div>
            })}
          </div>
          <p className="text-xs text-muted-foreground">This is a demo. Setup and activation are simulated.</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={() => { dismiss(); router.push("/transactions") }}>Explore Payments <ArrowRightIcon /></Button>
            <Button variant="outline" onClick={() => { dismiss(); router.push(PRODUCTS[product].href) }}>Open {PRODUCTS[product].shortName}</Button>
          </div>
        </> : null}
      </DialogContent>
    </Dialog>
  )
}
