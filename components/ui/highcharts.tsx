"use client"

import * as React from "react"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import { cn } from "@/lib/utils"

export interface ChartPointContext {
  seriesName?: string
  pointName?: string
  x?: number | string
  y?: number | null
}

export type ChartFormatterKey = "inr" | "percent" | "compact" | "number"

export interface ChartSpec {
  chart?: Highcharts.Options["chart"] | Record<string, unknown>
  xAxis?: Highcharts.Options["xAxis"] | Record<string, unknown> | readonly Record<string, unknown>[]
  yAxis?: Highcharts.Options["yAxis"] | Record<string, unknown> | readonly Record<string, unknown>[]
  legend?: Highcharts.Options["legend"] | Record<string, unknown>
  tooltip?: Highcharts.Options["tooltip"] | Record<string, unknown>
  plotOptions?: Highcharts.Options["plotOptions"] | Record<string, unknown>
  series?: readonly Record<string, unknown>[] | Record<string, unknown>[]
  loading?: Highcharts.Options["loading"] | Record<string, unknown>
  noData?: Record<string, unknown>
  formatterKey?: ChartFormatterKey
  onPointClick?: (context: ChartPointContext) => void
  [key: string]: unknown
}

const baseTokenTheme: Highcharts.Options = {
  credits: { enabled: false },
  chart: {
    backgroundColor: "transparent",
    style: {
      fontFamily: "var(--font-sans)",
    },
    spacing: [8, 8, 8, 8],
  },
  title: { text: undefined },
  subtitle: { text: undefined },
  legend: {
    itemStyle: { color: "var(--color-muted-foreground)" },
    itemHoverStyle: { color: "var(--color-foreground)" },
  },
  xAxis: {
    lineColor: "var(--color-border)",
    tickColor: "var(--color-border)",
    labels: {
      style: { color: "var(--color-muted-foreground)", fontSize: "10px" },
    },
    gridLineColor: "transparent",
  },
  yAxis: {
    title: { text: undefined },
    gridLineColor: "var(--color-border)",
    labels: {
      style: { color: "var(--color-muted-foreground)", fontSize: "10px" },
    },
  },
  tooltip: {
    backgroundColor: "var(--color-popover)",
    borderColor: "var(--color-border)",
    borderRadius: 10,
    style: { color: "var(--color-foreground)", fontSize: "11px" },
    shadow: false,
  },
  plotOptions: {
    series: {
      animation: { duration: 250 },
      states: {
        inactive: { opacity: 1 },
      },
    },
    line: {
      marker: { enabled: false },
    },
    area: {
      marker: { enabled: false },
    },
    column: {
      borderWidth: 0,
      borderRadius: 3,
    },
    pie: {
      borderWidth: 0,
      dataLabels: { enabled: false },
      showInLegend: true,
    },
  },
}

export function withChartTheme(options: ChartSpec): Highcharts.Options {
  return Highcharts.merge(
    {},
    baseTokenTheme,
    {
      chart: {
        reflow: true,
      },
    },
    options as Highcharts.Options,
  )
}

export function formatINR(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export function HighchartsPanelChart({
  options,
  className,
}: {
  options: ChartSpec
  className?: string
}) {
  const themed = React.useMemo(() => withChartTheme(options), [options])
  return (
    <div className={cn("h-full w-full min-w-0 overflow-hidden", className)}>
      <HighchartsReact
        highcharts={Highcharts}
        options={themed}
        containerProps={{ style: { height: "100%", width: "100%", overflow: "hidden" } }}
      />
    </div>
  )
}
