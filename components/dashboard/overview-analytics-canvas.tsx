"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarDays, GripVertical, LayoutGrid, Settings2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { HighchartsPanelChart, type ChartSpec } from "@/components/ui/highcharts"
import { AnimatedNumberText } from "@/components/ui/animated-number-text"
import { cn } from "@/lib/utils"

type WidgetWidth = "compact" | "wide" | "full"

export interface AnalyticsWidget {
  id: string
  title: string
  value: string
  delta?: string
  hint?: string
  chart: number[]
  chartLabels?: string[]
  chartType?: "line" | "area" | "column" | "bar" | "pie"
  compareChart?: number[]
  views?: string[]
  defaultWidth?: WidgetWidth
  actions?: Array<{
    label: string
    href?: string
    tone?: "default" | "warning" | "success"
  }>
}

interface OverviewAnalyticsCanvasProps {
  scopeId: string
  widgets: AnalyticsWidget[]
  configuredProducts?: string[]
  viewOptions?: Array<{ label: string; value: string }>
  activeView?: string
  onActiveViewChange?: (value: string) => void
  dateOptions?: string[]
  compareOptions?: string[]
  showViewOptions?: boolean
  viewSelectorVariant?: "buttons" | "dropdown"
  showConfiguredProductsBadge?: boolean
  showAutoRefreshControl?: boolean
  showCustomizeControl?: boolean
  toolbarSurface?: "card" | "plain"
  customizeOpen?: boolean
  onCustomizeOpenChange?: (open: boolean) => void
  className?: string
}

type LayoutState = {
  order: string[]
  hiddenIds: string[]
  widthById: Record<string, WidgetWidth>
}

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function widthClass(width: WidgetWidth) {
  if (width === "full") return "md:col-span-3"
  if (width === "wide") return "md:col-span-2"
  return "md:col-span-1"
}

function reorder<T>(list: T[], from: number, to: number) {
  const next = [...list]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

export function OverviewAnalyticsCanvas({
  scopeId,
  widgets,
  configuredProducts = [],
  viewOptions = [{ label: "All", value: "all" }],
  activeView: controlledActiveView,
  onActiveViewChange,
  dateOptions = ["Today", "Last 7 days", "Last 30 days"],
  compareOptions = ["Yesterday", "Previous period", "Last week"],
  showViewOptions = true,
  viewSelectorVariant = "buttons",
  showConfiguredProductsBadge = true,
  showAutoRefreshControl = true,
  showCustomizeControl = true,
  toolbarSurface = "card",
  customizeOpen: controlledCustomizeOpen,
  onCustomizeOpenChange,
  className,
}: OverviewAnalyticsCanvasProps) {
  const storageKey = `overview-layout:${scopeId}`

  const [internalActiveView, setInternalActiveView] = useState(viewOptions[0]?.value ?? "all")
  const [dateRange, setDateRange] = useState(dateOptions[1] ?? dateOptions[0] ?? "Today")
  const [compareRange, setCompareRange] = useState(compareOptions[0] ?? "Yesterday")
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [internalCustomizeOpen, setInternalCustomizeOpen] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [layout, setLayout] = useState<LayoutState>(() => ({
    order: widgets.map((widget) => widget.id),
    hiddenIds: [],
    widthById: Object.fromEntries(
      widgets.map((widget) => [widget.id, widget.defaultWidth ?? "compact"])
    ),
  }))

  const activeView = controlledActiveView ?? internalActiveView
  const customizeOpen = controlledCustomizeOpen ?? internalCustomizeOpen

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<LayoutState>
      setLayout((current) => ({
        order:
          parsed.order?.filter((id) => widgets.some((widget) => widget.id === id)) ??
          current.order,
        hiddenIds:
          parsed.hiddenIds?.filter((id) => widgets.some((widget) => widget.id === id)) ??
          current.hiddenIds,
        widthById: { ...current.widthById, ...(parsed.widthById ?? {}) },
      }))
    } catch {
      // ignore malformed persisted state
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  useEffect(() => {
    setLayout((current) => {
      const missing = widgets.map((widget) => widget.id).filter((id) => !current.order.includes(id))
      if (missing.length === 0) return current
      return {
        ...current,
        order: [...current.order, ...missing],
      }
    })
  }, [widgets])

  useEffect(() => {
    if (controlledActiveView !== undefined) return
    if (viewOptions.some((option) => option.value === internalActiveView)) return
    setInternalActiveView(viewOptions[0]?.value ?? "all")
  }, [controlledActiveView, internalActiveView, viewOptions])

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(layout))
  }, [layout, storageKey])

  const enabledProductsLabel = useMemo(
    () => (configuredProducts.length ? `${configuredProducts.length} configured products` : "No configured products"),
    [configuredProducts.length]
  )

  const scale = useMemo(() => {
    if (dateRange === "Today") return 0.88
    if (dateRange === "Last 30 days") return 1.18
    if (dateRange === "This quarter") return 1.26
    return 1
  }, [dateRange])

  const compareScale = useMemo(() => {
    if (compareRange === "Yesterday") return 0.92
    if (compareRange === "Previous period") return 0.9
    if (compareRange === "Last week") return 0.86
    return 0.9
  }, [compareRange])

  const orderedWidgets = useMemo(() => {
    const byId = new Map(widgets.map((widget) => [widget.id, widget]))
    return layout.order
      .map((id) => byId.get(id))
      .filter((widget): widget is AnalyticsWidget => Boolean(widget))
  }, [layout.order, widgets])

  const visibleWidgets = useMemo(() => {
    return orderedWidgets.filter((widget) => {
      if (layout.hiddenIds.includes(widget.id)) return false
      if (!widget.views?.length) return true
      return widget.views.includes(activeView)
    })
  }, [activeView, layout.hiddenIds, orderedWidgets])

  function setWidgetVisibility(widgetId: string, visible: boolean) {
    setLayout((current) => {
      const hiddenSet = new Set(current.hiddenIds)
      if (visible) {
        hiddenSet.delete(widgetId)
      } else {
        hiddenSet.add(widgetId)
      }
      return { ...current, hiddenIds: Array.from(hiddenSet) }
    })
  }

  function setWidgetWidth(widgetId: string, width: WidgetWidth) {
    setLayout((current) => ({
      ...current,
      widthById: {
        ...current.widthById,
        [widgetId]: width,
      },
    }))
  }

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) return
    setLayout((current) => {
      const from = current.order.indexOf(draggingId)
      const to = current.order.indexOf(targetId)
      if (from === -1 || to === -1) return current
      return { ...current, order: reorder(current.order, from, to) }
    })
  }

  function handleActiveViewChange(value: string) {
    if (controlledActiveView === undefined) {
      setInternalActiveView(value)
    }
    onActiveViewChange?.(value)
  }

  function setCustomizeOpen(nextOpen: boolean) {
    if (controlledCustomizeOpen === undefined) {
      setInternalCustomizeOpen(nextOpen)
    }
    onCustomizeOpenChange?.(nextOpen)
  }

  function getChartOptions(widget: AnalyticsWidget, chartData: number[], compareData?: number[]): ChartSpec {
    const chartType = widget.chartType ?? "line"
    const categories = widget.chartLabels?.length ? widget.chartLabels : WEEK_LABELS

    if (chartType === "pie") {
      const labels =
        widget.chartLabels?.length === widget.chart.length
          ? widget.chartLabels
          : widget.chart.map((_, index) => `Segment ${index + 1}`)
      return {
        chart: { type: "pie" },
        tooltip: { shared: false },
        legend: { enabled: true, align: "left", verticalAlign: "bottom", layout: "horizontal" },
        series: [
          {
            type: "pie",
            name: widget.title,
            data: chartData.map((value, index) => ({
              name: labels[index],
              y: Number(value.toFixed(2)),
            })),
            colors: ["var(--color-primary)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)"],
          },
        ],
      }
    }

    return {
      chart: { type: chartType },
      xAxis: { categories },
      yAxis: { labels: { format: "{value}" } },
      legend: { enabled: false },
      tooltip: { shared: true },
      series: [
        {
          type: chartType === "area" ? "area" : chartType === "bar" ? "bar" : chartType === "column" ? "column" : "line",
          name: widget.title,
          data: chartData,
          color: "var(--color-primary)",
          lineWidth: 1.8,
          fillOpacity: chartType === "area" ? 0.18 : undefined,
        },
        ...(compareData
          ? [
              {
                type: "line",
                name: compareRange,
                data: compareData,
                color: "var(--color-muted-foreground)",
                lineWidth: 1.6,
                dashStyle: "ShortDot",
              },
            ]
          : []),
      ],
    }
  }

  return (
    <section className={cn("space-y-3", className)}>
      <div
        className={cn(
          "px-1 py-0.5",
          toolbarSurface === "card" ? "rounded-lg border border-border/70 bg-card/70 px-3 py-2" : "bg-transparent px-0 py-0"
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger size="sm" className="h-8 w-[150px] rounded-md text-xs">
              <CalendarDays className="mr-1.5 size-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={compareRange} onValueChange={setCompareRange}>
            <SelectTrigger size="sm" className="h-8 w-[190px] rounded-md text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {compareOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  Compare: {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showViewOptions && viewSelectorVariant === "dropdown" ? (
            <Select value={activeView} onValueChange={handleActiveViewChange}>
              <SelectTrigger size="sm" className="h-8 w-[180px] rounded-md text-xs">
                <LayoutGrid className="mr-1.5 size-3.5 text-muted-foreground" />
                <SelectValue placeholder="Product" />
              </SelectTrigger>
              <SelectContent>
                {viewOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          {showAutoRefreshControl || showCustomizeControl ? (
            <div className="ml-auto flex items-center gap-1.5">
              {showAutoRefreshControl ? (
                <div className="flex items-center gap-2 rounded-md bg-muted/60 px-2.5 py-1.5">
                  <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                  <span className="text-[11px] text-muted-foreground">Auto-refresh</span>
                </div>
              ) : null}
              {showCustomizeControl ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-md gap-1.5 text-xs"
                  onClick={() => setCustomizeOpen(true)}
                >
                  <Settings2 className="size-3.5" />
                  Customize
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        {(showConfiguredProductsBadge || (showViewOptions && viewSelectorVariant === "buttons")) ? (
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {showViewOptions && viewSelectorVariant === "buttons"
              ? viewOptions.map((option) => {
                  const active = activeView === option.value
                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleActiveViewChange(option.value)}
                      className={cn(
                        "h-7 rounded-md px-2.5 text-[11px]",
                        active ? "bg-background text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {option.label}
                    </Button>
                  )
                })
              : null}
            {showConfiguredProductsBadge ? (
              <Badge variant="outline" className="ml-auto h-7 rounded-md px-2.5 text-[11px]">
                <LayoutGrid className="mr-1.5 size-3.5" />
                {enabledProductsLabel}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {visibleWidgets.map((widget) => {
          const width = layout.widthById[widget.id] ?? widget.defaultWidth ?? "compact"
          const chartData = widget.chart.map((point) => Number((point * scale).toFixed(2)))
          const compareData = widget.compareChart?.map((point) => Number((point * compareScale).toFixed(2)))
          const chartOptions = getChartOptions(widget, chartData, compareData)

          return (
            <article
              key={widget.id}
              className={cn(
                "flex h-full flex-col rounded-lg border border-border/70 bg-card/80 p-3",
                "transition-shadow hover:shadow-sm",
                draggingId === widget.id ? "cursor-grabbing" : "cursor-grab",
                !widget.actions?.length ? "min-h-[332px]" : "",
                widthClass(width)
              )}
              draggable
              onDragStart={() => setDraggingId(widget.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(widget.id)}
              onDragEnd={() => setDraggingId(null)}
            >
              <div className="mb-2 flex min-w-0 items-center gap-2">
                <p className="text-[12px] font-medium text-foreground">{widget.title}</p>
                <span className="ml-auto inline-flex items-center text-muted-foreground/70">
                  <GripVertical className="h-3.5 w-3.5" />
                </span>
              </div>

              <div className="mb-2 flex items-end">
                <AnimatedNumberText
                  value={widget.value}
                  className="text-[20px] font-semibold leading-none text-foreground"
                />
              </div>

              {widget.actions?.length ? (
                <div className="space-y-1.5 rounded-md bg-muted/35 p-2">
                  {widget.actions.map((action) => (
                    <a
                      key={`${widget.id}-${action.label}`}
                      href={action.href ?? "#"}
                      className={cn(
                        "flex items-center justify-between rounded-md px-2 py-1.5 text-xs",
                        action.tone === "warning"
                          ? "bg-warning/15 text-foreground"
                          : action.tone === "success"
                            ? "bg-success/15 text-foreground"
                            : "bg-background/70 text-foreground"
                      )}
                    >
                      <span>{action.label}</span>
                      <span className="text-[10px] text-muted-foreground">Open</span>
                    </a>
                  ))}
                </div>
              ) : (
                <div
                  className={cn(
                    "mt-2 w-full flex-1 overflow-hidden",
                    widget.chartType === "pie" ? "min-h-[236px]" : "min-h-[212px]"
                  )}
                >
                  <HighchartsPanelChart options={chartOptions} />
                </div>
              )}
            </article>
          )
        })}
      </div>

      <Sheet open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          a11yTitle="Customize Overview Widgets"
          a11yDescription="Configure visibility, size, and order of overview widgets."
          className="w-full border-l border-border/60 bg-background p-0 sm:max-w-[420px]"
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-border/60 bg-muted/25 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">Customize Widgets</p>
                  <p className="text-xs text-muted-foreground">
                    Show, hide, and resize widgets. Drag and reorder directly on the overview canvas.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close customize widgets panel"
                  onClick={() => setCustomizeOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {orderedWidgets.map((widget) => {
              const hidden = layout.hiddenIds.includes(widget.id)
              const width = layout.widthById[widget.id] ?? widget.defaultWidth ?? "compact"
              return (
                <div key={widget.id} className="rounded-lg border border-border/60 bg-card px-3 py-3 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{widget.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {hidden ? "Hidden from overview" : "Visible on overview"}
                      </p>
                    </div>
                    <Switch checked={!hidden} onCheckedChange={(checked) => setWidgetVisibility(widget.id, checked)} />
                  </div>
                  {!hidden ? (
                    <div className="mt-3 space-y-1.5">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Widget width</p>
                      <Select
                        value={width}
                        onValueChange={(value) => setWidgetWidth(widget.id, value as WidgetWidth)}
                      >
                        <SelectTrigger size="sm" className="h-8 w-full rounded-md text-xs sm:w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="wide">Wide</SelectItem>
                          <SelectItem value="full">Full</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                </div>
              )
            })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  )
}
