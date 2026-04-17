"use client"

import { useState } from "react"
import { CreditCard, ArrowRight, X } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AttentionStrip() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    /* Shopify Polaris Banner — left accent border, shadcn Alert base */
    <Alert className="border-l-[3px] border-l-primary bg-card pr-3 py-3.5">
      <CreditCard className="h-4 w-4 text-primary" />

      <div className="flex items-start justify-between gap-4 col-start-2">
        <div className="min-w-0">
          <AlertTitle className="text-sm font-semibold text-foreground mb-0.5">
            Stay competitive — 65% of merchants in your area accept Amex
          </AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            Enable American Express cards to avoid losing premium customers.
          </AlertDescription>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Shopify primary button */}
          <Button size="sm" className="h-8 gap-1.5 text-xs" asChild>
            <Link href="/products/online-payments">
              Explore Checkout
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          {/* Shopify plain dismiss */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDismissed(true)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Alert>
  )
}
