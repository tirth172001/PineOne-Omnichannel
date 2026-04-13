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
  accessibility: { enabled: false },
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
    spline: {
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

function coerceLineToSpline(options: ChartSpec): Highcharts.Options {
  const normalized = Highcharts.merge({}, options as Highcharts.Options)
  const chartType = normalized.chart?.type

  if (chartType === "line") {
    normalized.chart = {
      ...(normalized.chart ?? {}),
      type: "spline",
    }
  }

  if (Array.isArray(normalized.series)) {
    normalized.series = normalized.series.map((series) => {
      if (!series) return series
      const seriesType = (series as Highcharts.SeriesOptionsType).type

      if (seriesType === "line") {
        return {
          ...series,
          type: "spline",
        } as Highcharts.SeriesOptionsType
      }

      if (chartType === "line" && !seriesType) {
        return {
          ...series,
          type: "spline",
        } as Highcharts.SeriesOptionsType
      }

      return series
    }) as Highcharts.SeriesOptionsType[]
  }

  if (normalized.plotOptions?.line) {
    normalized.plotOptions = {
      ...normalized.plotOptions,
      spline: {
        ...(normalized.plotOptions.spline ?? {}),
        ...normalized.plotOptions.line,
      },
    }
  }

  return normalized
}

export function withChartTheme(options: ChartSpec): Highcharts.Options {
  const normalizedOptions = coerceLineToSpline(options)
  return Highcharts.merge(
    {},
    baseTokenTheme,
    {
      chart: {
        reflow: true,
      },
    },
    normalizedOptions,
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
  const handleChartMount = React.useCallback((chart: Highcharts.Chart) => {
    const chartSvg = chart.container?.querySelector("svg")
    if (!chartSvg) return
    chartSvg.setAttribute("aria-hidden", "true")
    chartSvg.removeAttribute("role")
    chartSvg.removeAttribute("aria-label")
    chartSvg.removeAttribute("aria-labelledby")
  }, [])

  return (
    <div className={cn("h-full w-full min-w-0 overflow-hidden", className)}>
      <HighchartsReact
        highcharts={Highcharts}
        options={themed}
        callback={handleChartMount}
        containerProps={{ style: { height: "100%", width: "100%", overflow: "hidden" } }}
      />
    </div>
  )
}
