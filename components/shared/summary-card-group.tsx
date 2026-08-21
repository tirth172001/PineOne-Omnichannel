"use client"

import type { ComponentType, ReactNode } from "react"
import { useIsMobile } from "@/components/ui/use-mobile"
import { cn } from "@/lib/utils"

export interface SummaryCardItem {
  icon: ComponentType<{ className?: string }>
  label: string
  value: ReactNode
  subtext?: ReactNode
  /** Optional secondary row (e.g. deductions, failed/on-hold counts with a "View" link). Only renders when provided. */
  additionalText?: ReactNode
  /** Optional control rendered on the right of the header band (e.g. a Today/Yesterday/7 days toggle). Only renders when provided. */
  headerRight?: ReactNode
}

function SummaryCard({
  card,
  isLast,
  isMobile,
}: {
  card: SummaryCardItem
  isLast: boolean
  isMobile: boolean
}) {
  const Icon = card.icon

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col",
        !isLast && (isMobile ? "border-b border-border" : "border-r border-border")
      )}
    >
      <div className="flex h-14 items-center justify-between gap-2 border-b border-border px-4">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 shrink-0 text-foreground" />
          <p className="text-base font-medium text-card-foreground">{card.label}</p>
        </div>
        {card.headerRight}
      </div>
      <div className="flex flex-col gap-4 px-5 py-4">
        <div>
          <p className="text-xl font-semibold leading-7 text-foreground">{card.value}</p>
          {card.subtext ? <p className="mt-1 text-sm font-medium text-muted-foreground">{card.subtext}</p> : null}
        </div>
        {card.additionalText ? <div className="text-sm font-medium">{card.additionalText}</div> : null}
      </div>
    </div>
  )
}

/**
 * Shared summary section: N equal-width bordered cards, each with an icon+label
 * header band and a number+subtext body. Card count is fully driven by `cards`.
 */
export function SummaryCardGroup({ cards, className }: { cards: SummaryCardItem[]; className?: string }) {
  const isMobile = useIsMobile()

  if (!cards.length) return null

  return (
    <section className={cn("overflow-hidden rounded-lg border border-border bg-card", className)}>
      <div
        className="grid grid-cols-1"
        style={!isMobile && cards.length > 1 ? { gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))` } : undefined}
      >
        {cards.map((card, index) => (
          <SummaryCard key={card.label} card={card} isLast={index === cards.length - 1} isMobile={isMobile} />
        ))}
      </div>
    </section>
  )
}
