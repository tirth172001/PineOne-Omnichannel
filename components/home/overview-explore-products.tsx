"use client"

import type { ComponentType } from "react"
import {
  CaretRightIcon,
  ContactlessPaymentIcon,
  CreditCardIcon,
  ReceiptIcon,
  StorefrontIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ExploreProduct = {
  id: string
  icon: ComponentType<{ className?: string; weight?: "regular" | "bold" | "fill" }>
  title: string
  description: string
}

const PRODUCTS: ExploreProduct[] = [
  {
    id: "walk-ins",
    icon: StorefrontIcon,
    title: "Drive more walk-ins to your store",
    description: "Target customers already spending near you with GrowthHub.",
  },
  {
    id: "smartbill",
    icon: ReceiptIcon,
    title: "SmartBill for smarter business",
    description: "Digital invoices that save costs and boost loyalty.",
  },
  {
    id: "myemi",
    icon: CreditCardIcon,
    title: "myEMI",
    description: "Offer no-cost EMIs on purchases as low as ₹3,000.",
  },
  {
    id: "contactless",
    icon: ContactlessPaymentIcon,
    title: "Contactless payments with UPI",
    description: "Let customers tap and pay in seconds.",
  },
]

const VISIBLE_PRODUCT_COUNT = 3

export function OverviewExploreProducts() {
  const visibleProducts = PRODUCTS.slice(0, VISIBLE_PRODUCT_COUNT)

  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold text-foreground">Explore pine products</h3>

      <div className="overflow-hidden rounded-[8px] border border-border/60 bg-background">
        {visibleProducts.map((product, index) => (
          <button
            key={product.id}
            type="button"
            onClick={() => toast(`${product.title} isn't available in this preview`)}
            className={cn(
              "relative flex w-full flex-col items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/40",
              index > 0 && "border-t border-border/60"
            )}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-muted text-foreground">
              <product.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 pr-6">
              <p className="text-sm font-semibold text-foreground">{product.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{product.description}</p>
            </div>
            <CaretRightIcon className="absolute top-4 right-4 h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        ))}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-10 w-full rounded-none text-xs text-primary hover:text-primary"
          onClick={() => toast("More products coming soon")}
        >
          View all
        </Button>
      </div>
    </section>
  )
}
