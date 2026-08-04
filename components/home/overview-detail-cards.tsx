"use client"

import Link from "next/link"
import { ChevronRight, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SummaryStat = {
  label: string
  value: string
}

type OverviewDetailCard = {
  id: "transactions" | "settlements" | "refunds" | "disputes"
  heading: string
  total: string
  stats: SummaryStat[]
  hasData: boolean
  href: string
}

const cards: OverviewDetailCard[] = [
  {
    id: "transactions",
    heading: "Today's payment",
    total: "₹1,35,000",
    stats: [
      { label: "Successful", value: "30" },
      { label: "Pending", value: "3" },
      { label: "Failed", value: "2" },
    ],
    hasData: true,
    href: "/transactions",
  },
  {
    id: "settlements",
    heading: "Total payout",
    total: "₹65,000",
    stats: [
      { label: "Total txn.", value: "₹85,000" },
      { label: "Deduction", value: "₹9,000" },
      { label: "On hold", value: "₹500" },
    ],
    hasData: true,
    href: "/settlements",
  },
  {
    id: "refunds",
    heading: "Refunds",
    total: "₹12.00",
    stats: [
      { label: "No. of refunds", value: "2" },
      { label: "Date range", value: "8th Apr 26 - 14th Apr 26" },
    ],
    hasData: true,
    href: "/refunds",
  },
  {
    id: "disputes",
    heading: "Disputes",
    total: "₹18,400",
    stats: [
      { label: "Open disputes", value: "5" },
      { label: "In review", value: "2" },
      { label: "Closed", value: "7" },
    ],
    hasData: true,
    href: "/on-hold-disputes",
  },
]

export function OverviewDetailCards() {
  const visibleCards = cards.filter((card) => card.hasData)

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {visibleCards.map((card) => (
          <article key={card.id} className="rounded-[8px] border border-border/60 bg-background">
            <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-10">
              <div>
                <p className="flex items-center gap-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  {card.heading}
                  <Info className="h-3.5 w-3.5" />
                </p>
                <p className="mt-2 text-[20px] font-semibold leading-none text-foreground">{card.total}</p>
              </div>

              <Button asChild type="button" variant="outline" size="sm" className="h-8 rounded-[8px]">
                <Link href={card.href}>View all</Link>
              </Button>
            </div>

            <div className="border-t border-border/60">
              {card.stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3",
                    index > 0 ? "border-t border-border/50" : "border-t-0"
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                    <p className="truncate text-sm text-muted-foreground">{stat.label}</p>
                    <p className="shrink-0 text-base font-semibold text-foreground">{stat.value}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
