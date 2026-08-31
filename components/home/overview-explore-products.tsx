"use client"

import type { ComponentType } from "react"
import {
  ContactlessPaymentIcon,
  CreditCardIcon,
  ReceiptIcon,
  StorefrontIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

type ExploreProduct = {
  id: string
  icon: ComponentType<{ className?: string; weight?: "regular" | "bold" | "fill" }>
  title: string
  description: string
  actionLabel: string
}

const PRODUCTS: ExploreProduct[] = [
  {
    id: "walk-ins",
    icon: StorefrontIcon,
    title: "Drive more walk-ins to your store",
    description: "Target customers already spending near you with GrowthHub.",
    actionLabel: "Know more",
  },
  {
    id: "smartbill",
    icon: ReceiptIcon,
    title: "SmartBill for smarter business",
    description: "Digital invoices that save costs and boost loyalty.",
    actionLabel: "Know more",
  },
  {
    id: "myemi",
    icon: CreditCardIcon,
    title: "myEMI",
    description: "Offer no-cost EMIs on purchases as low as ₹3,000.",
    actionLabel: "Know more",
  },
  {
    id: "contactless",
    icon: ContactlessPaymentIcon,
    title: "Contactless payments with UPI",
    description: "Let customers tap and pay in seconds.",
    actionLabel: "Watch now",
  },
]

export function OverviewExploreProducts() {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">Explore pine products</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-primary hover:text-primary"
          onClick={() => toast("More products coming soon")}
        >
          View all
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {PRODUCTS.map((product) => (
          <article key={product.id} className="flex flex-col rounded-[8px] border border-border/60 bg-background">
            <div className="flex-1 space-y-3 px-4 pt-4 pb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
                <product.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{product.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{product.description}</p>
              </div>
            </div>

            <div className="border-t border-border/60 px-4 py-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full rounded-[8px] text-xs"
                onClick={() => toast(`${product.title} isn't available in this preview`)}
              >
                {product.actionLabel}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
