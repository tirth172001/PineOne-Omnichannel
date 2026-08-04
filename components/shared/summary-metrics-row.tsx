"use client"

import { cn } from "@/lib/utils"

export interface SummaryMetricItem {
  label: string
  value: string
  delta: string
  deltaTone?: "positive" | "negative" | "neutral"
}

interface SummaryMetricsRowProps {
  metrics: SummaryMetricItem[]
  className?: string
}

const deltaToneClass: Record<NonNullable<SummaryMetricItem["deltaTone"]>, string> = {
  positive: "text-success",
  negative: "text-destructive",
  neutral: "text-muted-foreground",
}

export function SummaryMetricsRow({ metrics, className }: SummaryMetricsRowProps) {
  if (!metrics.length) return null

  return (
    <section className={cn("border-y border-border/60", className)}>
      <div className="grid grid-cols-1 divide-y divide-border/60 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-1 px-5 py-4">
            <p className="text-xs text-muted-foreground">{metric.label}</p>
            <p className="text-[29px] font-semibold leading-tight tracking-tight text-foreground">{metric.value}</p>
            <p className={cn("text-xs", deltaToneClass[metric.deltaTone ?? "neutral"])}>{metric.delta}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

