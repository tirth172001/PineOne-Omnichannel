"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HighchartsPanelChart, type ChartSpec } from "@/components/ui/highcharts"
import { cn } from "@/lib/utils"

type OverviewSnapshotChartCardProps = {
  title: string
  metrics: ReactNode
  chartOptions: ChartSpec
  headerActions?: ReactNode
  actionHref?: string
  actionLabel?: string
  className?: string
  bodyClassName?: string
  chartContainerClassName?: string
}

export function OverviewSnapshotChartCard({
  title,
  metrics,
  chartOptions,
  headerActions,
  actionHref,
  actionLabel,
  className,
  bodyClassName,
  chartContainerClassName,
}: OverviewSnapshotChartCardProps) {
  return (
    <article className={cn("rounded-2xl border border-border/70 bg-card/80", className)}>
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <p className="text-[16px] font-semibold text-foreground">{title}</p>
        <div className="flex items-center gap-3">
          {headerActions}
          {actionHref && actionLabel ? (
            <Button asChild variant="outline" size="sm" className="h-8 text-xs">
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className={cn("space-y-3", bodyClassName)}>
        {metrics}
        <div className={cn("overflow-visible text-left", chartContainerClassName)}>
          <HighchartsPanelChart options={chartOptions} fillParent={false} />
        </div>
      </div>
    </article>
  )
}
