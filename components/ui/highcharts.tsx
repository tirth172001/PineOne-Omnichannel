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
    borderWidth: 0,
    plotBackgroundColor: "transparent",
    plotBorderWidth: 0,
    plotShadow: false,
    style: {
      fontFamily: "var(--font-sans)",
    },
    spacing: [6, 6, 6, 6],
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
  const normalized = Highcharts.merge({}, options as Highcharts.Options) as Highcharts.Options
  const chartType = normalized.chart?.type

  if (chartType === "line") {
    normalized.chart = {
      ...(normalized.chart ?? {}),
      type: "spline",
    }
  }

  if (Array.isArray(normalized.series)) {
    normalized.series = normalized.series.map(
      (series: Highcharts.SeriesOptionsType | Highcharts.UnknownSeriesOptions | undefined) => {
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
      }
    ) as Highcharts.SeriesOptionsType[]
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

export function formatRM(value: number): string {
  return `₹${value.toLocaleString("en-MY")}`
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-MY", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export function HighchartsPanelChart({
  options,
  className,
  fillParent = true,
}: {
  options: ChartSpec
  className?: string
  fillParent?: boolean
}) {
  const requestedChartType = ((options.chart as Highcharts.ChartOptions | undefined)?.type ?? "spline") as string
  const needsSankey = requestedChartType === "sankey"
  const sankeyAlreadyLoaded = Boolean(
    (Highcharts as unknown as { SeriesRegistry?: { seriesTypes?: Record<string, unknown> } }).SeriesRegistry?.seriesTypes?.sankey
  )
  const [sankeyReady, setSankeyReady] = React.useState(!needsSankey || sankeyAlreadyLoaded)

  React.useEffect(() => {
    if (!needsSankey || sankeyReady) return

    let mounted = true
    import("highcharts/modules/sankey").then((module) => {
      const initSankey = module.default
      const hasSankey = Boolean(
        (Highcharts as unknown as { SeriesRegistry?: { seriesTypes?: Record<string, unknown> } }).SeriesRegistry?.seriesTypes?.sankey
      )

      if (typeof initSankey === "function" && !hasSankey) {
        initSankey(Highcharts)
      }

      if (mounted) setSankeyReady(true)
    })

    return () => {
      mounted = false
    }
  }, [needsSankey, sankeyReady])

  const themed = React.useMemo(() => withChartTheme(options), [options])
  const panelSafeThemed = React.useMemo(() => {
    const chartType = ((themed.chart as Highcharts.ChartOptions | undefined)?.type ?? "spline") as string
    const isPie = chartType === "pie"
    const panelDefaults: Highcharts.Options = {
      chart: {
        reflow: true,
        spacing: isPie ? [8, 10, 10, 10] : [2, 4, 26, 4],
        margin: isPie ? undefined : [6, 8, 34, 38],
        backgroundColor: "transparent",
        borderWidth: 0,
        plotBackgroundColor: "transparent",
        plotBorderWidth: 0,
        plotShadow: false,
      },
      xAxis: isPie
        ? undefined
        : {
            lineWidth: 1,
            tickLength: 0,
            tickWidth: 0,
            labels: {
              enabled: true,
              style: { fontSize: "10px" },
              autoRotation: [0],
              overflow: "justify",
              reserveSpace: true,
              y: 10,
            },
            tickPixelInterval: 50,
            startOnTick: true,
            endOnTick: true,
          },
      yAxis: isPie
        ? undefined
        : {
            opposite: false,
            lineWidth: 0,
            tickLength: 0,
            tickWidth: 0,
            gridLineWidth: 1,
            startOnTick: false,
            endOnTick: false,
            minPadding: 0.04,
            maxPadding: 0.12,
            labels: {
              enabled: true,
              style: { fontSize: "10px" },
              reserveSpace: true,
              x: -10,
            },
          },
      legend: isPie
        ? {
            enabled: true,
            align: "center",
            verticalAlign: "bottom",
            layout: "horizontal",
            itemDistance: 8,
            itemStyle: { fontSize: "10px" },
            margin: 8,
          }
        : {
            enabled: false,
          },
      plotOptions: {
        series: {
          clip: false,
        },
        pie: {
          size: "74%",
          center: ["50%", "40%"],
          dataLabels: {
            enabled: false,
          },
        },
      },
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 460,
            },
            chartOptions: {
              xAxis: isPie
                ? undefined
                : {
                    labels: {
                      style: { fontSize: "9px" },
                    },
                  },
              yAxis: isPie
                ? undefined
                : {
                    labels: {
                      style: { fontSize: "9px" },
                    },
                  },
              legend: isPie
                ? {
                    enabled: false,
                  }
                : {
                    enabled: false,
                  },
              plotOptions: isPie
                ? {
                    pie: {
                      size: "84%",
                      center: ["50%", "50%"],
                    },
                  }
                : {},
            },
          },
        ],
      },
    }

    // Important: defaults first, themed options last.
    // This keeps panels safe while still allowing each chart config
    // to explicitly control legend/labels/spacing when needed.
    return Highcharts.merge({}, panelDefaults, themed)
  }, [themed])

  const handleChartMount = React.useCallback((chart: Highcharts.Chart) => {
    const chartSvg = chart.container?.querySelector("svg")
    if (!chartSvg) return
    chartSvg.setAttribute("aria-hidden", "true")
    chartSvg.removeAttribute("role")
    chartSvg.removeAttribute("aria-label")
    chartSvg.removeAttribute("aria-labelledby")

    // Remove Highcharts top-level background rect so charts don't render an outer box.
    const outerRect = chart.container?.querySelector("svg > rect")
    if (outerRect instanceof SVGRectElement) {
      outerRect.setAttribute("fill", "none")
      outerRect.setAttribute("stroke", "none")
      outerRect.style.fill = "none"
      outerRect.style.stroke = "none"
      outerRect.style.display = "none"
    }
  }, [])

  if (needsSankey && !sankeyReady) {
    return <div className={cn(fillParent ? "h-full w-full" : "w-full", className)} />
  }

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={panelSafeThemed}
      callback={handleChartMount}
      containerProps={{
        className: cn(
          fillParent ? "h-full w-full min-w-0 overflow-visible text-left" : "w-full min-w-0 overflow-visible text-left",
          className
        ),
        style: {
          height: fillParent ? "100%" : undefined,
          width: "100%",
          overflow: "visible",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "stretch",
          background: "transparent",
          border: "none",
        },
      }}
    />
  )
}
