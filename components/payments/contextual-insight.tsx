"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon, LightbulbIcon, TrendUpIcon } from "@phosphor-icons/react"
import Link from "next/link"

export function ContextualInsight() {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <LightbulbIcon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-foreground">
              Merchants using Pine Labs UPI see ~5% higher success during peak hours
            </p>
            <TrendUpIcon className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Your current UPI success rate is 91.8%. Similar merchants on Pine Labs UPI average 96.9% during peak traffic periods.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/products/online-payments">
            Explore Checkout
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
