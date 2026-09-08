"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowUUpLeftIcon,
  BankIcon,
  CalendarCheckIcon,
  CaretRightIcon,
  ChartBarIcon,
  ChartPieIcon,
  CreditCardIcon,
  DesktopIcon,
  DeviceMobileIcon,
  DevicesIcon,
  DotsThreeCircleIcon,
  GavelIcon,
  QrCodeIcon,
  SlidersIcon,
  WalletIcon,
  WarningIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FilterControl, type FilterOption, type ListingFilter } from "@/components/shared/listing-page-primitives"
import { transactionRows, type PaymentMode } from "@/components/transactions/transactions-data"
import type { StoreRecord } from "@/lib/stores-data"
import { cn } from "@/lib/utils"
import {
  CardHeader,
  CHANNEL_MULTIPLIER,
  DAY_RANGE_OPTIONS,
  DimmedDecimalAmount,
  filterTransactionsByStore,
  formatInrAmount,
  OVERVIEW_TABS_LIST_CLASSES,
  OVERVIEW_TABS_TRIGGER_CLASSES,
  StoreScopeNote,
  type ChannelFilter,
} from "@/components/home/overview-detail-cards"

/** Every chart in the Figma "Analytics" mock uses this single green as its fill
 *  — bars are not color-coded per metric, so we match that exactly rather than
 *  keep a per-widget palette. */
const CHART_ACCENT_COLOR = "#a9d977"

/** Figma's mock fills every bar/column with a repeating 45° diagonal stripe on
 *  top of the flat green — matched here with a CSS stripe instead of the dozens
 *  of individual rotated line layers the design file uses for the same effect.
 *  Shared by both the horizontal distribution bars and the vertical trend bars
 *  so the two read as the same visual language. */
const BAR_HATCH_BACKGROUND_IMAGE =
  "repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 1.5px, transparent 1.5px, transparent 10px)"
const BAR_BORDER_COLOR = "rgba(255,255,255,0.2)"
/** Same thickness used for both orientations — the horizontal distribution bars'
 *  height and the vertical trend bars' width — so neither reads as "thicker." */
const BAR_THICKNESS_PX = 16

const PAY_MODE_META: Record<PaymentMode, { label: string; icon: typeof QrCodeIcon }> = {
  upi: { label: "UPI", icon: QrCodeIcon },
  card: { label: "Card", icon: CreditCardIcon },
  netbanking: { label: "Net banking", icon: DotsThreeCircleIcon },
}

/** The shared transactions dataset round-robins payment modes near-evenly, which
 *  makes the "Pay modes" bars all render at almost the same width. Real merchants
 *  skew heavily toward UPI in India, so weight the aggregate (display-only, not
 *  the underlying dataset) to reflect that realistic split instead of a flat 1:1:1. */
const PAY_MODE_WEIGHT: Record<PaymentMode, number> = { upi: 1.85, card: 1, netbanking: 0.55 }

/** The shared transactions dataset only models 3 payment modes (upi/card/netbanking).
 *  A real merchant's pay-mode breakdown has more entries than that (wallets, pay-later,
 *  direct bank transfer, ...) — these are additive, display-only rows sized as a
 *  fraction of the real aggregate rather than a change to the underlying dataset. */
const EXTRA_PAY_MODES: Array<{ key: string; label: string; icon: typeof QrCodeIcon; fraction: number }> = [
  { key: "wallet", label: "Wallet", icon: WalletIcon, fraction: 0.24 },
  { key: "bank-transfer", label: "Bank transfer", icon: BankIcon, fraction: 0.17 },
  { key: "pay-later", label: "Pay later", icon: CalendarCheckIcon, fraction: 0.09 },
]

type DayRange = "today" | "yesterday" | "last-7-days"

/** No online/in-store split exists on the shared transactions dataset yet, so
 *  channel filtering scales the aggregates instead of re-filtering rows — the
 *  same approximation approach used for the "Yesterday" range below. */
const RANGE_MULTIPLIER: Record<DayRange, number> = { today: 1, yesterday: 0.91, "last-7-days": 1 }
/** Today/Yesterday are single-day views, so their trend reads as an hourly
 *  breakdown; Last 7 days reads as one bar per day instead. */
const HOURLY_RANGES: DayRange[] = ["today", "yesterday"]

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
/** Yesterday is a single finished day, so its trend reads better as an hourly
 *  breakdown (2-hour buckets) than as a Mon–Sun week. */
const HOUR_LABELS = ["12 AM", "2 AM", "4 AM", "6 AM", "8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM", "10 PM"]

const VOLUME_WEEK_COUNT_BASE = [162, 148, 171, 158, 183, 129, 96]
const VOLUME_HOUR_COUNT_BASE = [3, 2, 2, 6, 15, 24, 29, 25, 20, 27, 22, 10]
const FAILED_WEEK_COUNT_BASE = [18, 22, 15, 27, 19, 12, 9]
const FAILED_HOUR_COUNT_BASE = [1, 0, 1, 2, 3, 4, 5, 4, 3, 4, 3, 2]
const DISPUTE_WEEK_COUNT_BASE = [4, 6, 3, 5, 7, 2, 3]
const DISPUTE_HOUR_COUNT_BASE = [0, 0, 0, 1, 1, 1, 2, 1, 1, 2, 1, 0]
const REFUND_WEEK_COUNT_BASE = [12, 9, 14, 11, 16, 8, 6]
const REFUND_HOUR_COUNT_BASE = [1, 0, 1, 2, 3, 3, 4, 3, 2, 3, 2, 1]

const AMOUNT_PER_UNIT: Record<"volume" | "failed" | "dispute" | "refund", number> = {
  volume: 3250,
  failed: 1800,
  dispute: 4200,
  refund: 2100,
}

const DEVICE_SPLIT = { mobile: 0.62, desktop: 0.38 }

type MetricMode = "count" | "amount"
type TrendKind = "volume" | "failed" | "dispute" | "refund"

type AnalyticsWidgetId =
  | "paymode-distribution"
  | "payment-volume"
  | "failed-payments"
  | "devices-distribution"
  | "refunds"
  | "disputes"

const WIDGET_CATALOG: Array<{ id: AnalyticsWidgetId; title: string; icon: typeof ChartPieIcon }> = [
  { id: "paymode-distribution", title: "Pay modes", icon: ChartPieIcon },
  { id: "payment-volume", title: "Payment volume", icon: ChartBarIcon },
  { id: "failed-payments", title: "Failed payments", icon: WarningIcon },
  { id: "devices-distribution", title: "Devices distribution", icon: DevicesIcon },
  { id: "refunds", title: "Refunds", icon: ArrowUUpLeftIcon },
  { id: "disputes", title: "Disputes", icon: GavelIcon },
]

const TREND_BASE: Record<TrendKind, { week: number[]; hour: number[] }> = {
  volume: { week: VOLUME_WEEK_COUNT_BASE, hour: VOLUME_HOUR_COUNT_BASE },
  failed: { week: FAILED_WEEK_COUNT_BASE, hour: FAILED_HOUR_COUNT_BASE },
  dispute: { week: DISPUTE_WEEK_COUNT_BASE, hour: DISPUTE_HOUR_COUNT_BASE },
  refund: { week: REFUND_WEEK_COUNT_BASE, hour: REFUND_HOUR_COUNT_BASE },
}

const DEFAULT_VISIBLE_WIDGETS: AnalyticsWidgetId[] = WIDGET_CATALOG.map((widget) => widget.id)

function scaleSeries(base: number[], scale: number) {
  return base.map((value) => Math.round(value * scale))
}

function sumSeries(series: number[]) {
  return Math.round(series.reduce((sum, value) => sum + value, 0))
}

function formatTotal(value: number, mode: MetricMode) {
  return mode === "amount" ? `₹${formatInrAmount(value)}` : value.toLocaleString("en-IN")
}

/** Compact axis-label formatting (10.5K / 1.2L) so the y-axis reads the same
 *  way the Figma mock's abbreviated tick labels do. */
function formatAxisValue(value: number, mode: MetricMode) {
  if (mode === "amount") {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`
    return `₹${value}`
  }
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return `${value}`
}

/** Builds a "nice" set of y-axis ticks (0..max) for the trend bar chart. Small
 *  data ranges (e.g. a handful of disputes) can round two adjacent raw ticks to
 *  the same integer, so duplicates are collapsed out afterward. */
function buildAxisTicks(maxValue: number, tickCount = 4) {
  if (maxValue <= 0) return [0]
  const rawStep = maxValue / tickCount
  const magnitude = 10 ** Math.floor(Math.log10(rawStep || 1))
  const normalized = rawStep / magnitude
  const niceStep = Math.max(1, (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude)
  const ticks: number[] = []
  for (let tick = 0; tick <= maxValue + niceStep; tick += niceStep) {
    ticks.push(Math.round(tick))
  }
  return Array.from(new Set(ticks))
}

function getTrendSeries(kind: TrendKind, range: DayRange, metricMode: MetricMode, scale: number) {
  const isHourly = HOURLY_RANGES.includes(range)
  const base = isHourly ? TREND_BASE[kind].hour : TREND_BASE[kind].week
  const categories = isHourly ? HOUR_LABELS : WEEK_LABELS
  const countSeries = scaleSeries(base, scale)
  const data = metricMode === "amount" ? countSeries.map((value) => value * AMOUNT_PER_UNIT[kind]) : countSeries
  return { categories, data }
}

/** Vertical bar-trend chart shared by Payment volume / Failed payments / Refunds /
 *  Disputes — a plain CSS bar chart (no charting library) so the bar width, hatch
 *  texture, and border stay pixel-identical to the horizontal distribution bars,
 *  and so it can flex between a 7-bar weekly view and a 12-bar hourly view. */
function TrendBarChart({
  categories,
  data,
  metricMode,
}: {
  categories: string[]
  data: number[]
  metricMode: MetricMode
}) {
  const maxValue = Math.max(...data, 1)
  const ticks = buildAxisTicks(maxValue)
  const axisMax = ticks[ticks.length - 1] || 1
  const plotHeight = 220
  /** Headroom reserved above the tallest possible bar so its hover tooltip has
   *  somewhere to sit without getting clipped against the card edge. */
  const topPadding = 32

  return (
    <div className="flex gap-2">
      <div
        className="flex w-10 shrink-0 flex-col-reverse justify-between text-right text-[10px] leading-none text-muted-foreground"
        style={{ height: plotHeight, paddingTop: topPadding }}
      >
        {ticks.map((tick) => (
          <span key={tick} className="tabular-nums">
            {formatAxisValue(tick, metricMode)}
          </span>
        ))}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="relative flex items-end justify-between gap-1" style={{ height: plotHeight }}>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col-reverse justify-between" style={{ top: topPadding }}>
            {ticks.map((tick) => (
              <div key={tick} className="border-t border-overview-border" />
            ))}
          </div>
          {data.map((value, index) => (
            <div key={`${categories[index]}-${index}`} className="relative flex h-full flex-1 items-end justify-center">
              <div
                className="group relative"
                style={{ width: `${BAR_THICKNESS_PX}px`, height: `${Math.max(2, Math.round((value / axisMax) * 100))}%` }}
              >
                <div className="pointer-events-none absolute -top-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-foreground px-1.5 py-0.5 text-[10px] font-medium text-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                  {formatAxisValue(value, metricMode)}
                </div>
                <div
                  className="absolute inset-0 rounded-t-[3px] transition-[filter] duration-150 group-hover:brightness-[0.92]"
                  style={{
                    backgroundColor: CHART_ACCENT_COLOR,
                    backgroundImage: BAR_HATCH_BACKGROUND_IMAGE,
                    border: `1px solid ${BAR_BORDER_COLOR}`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex justify-between gap-1">
          {categories.map((category, index) => (
            <span key={`${category}-${index}`} className="flex-1 text-center text-[10px] leading-none text-muted-foreground">
              {category}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function MetricModeTabs({ value, onChange }: { value: MetricMode; onChange: (mode: MetricMode) => void }) {
  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as MetricMode)}>
      <TabsList className={OVERVIEW_TABS_LIST_CLASSES}>
        <TabsTrigger value="count" className={OVERVIEW_TABS_TRIGGER_CLASSES}>
          By count
        </TabsTrigger>
        <TabsTrigger value="amount" className={OVERVIEW_TABS_TRIGGER_CLASSES}>
          By amount
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

function AnalyticsCard({
  title,
  icon,
  total,
  metricMode,
  onMetricModeChange,
  contentLayout = "bottom",
  children,
}: {
  title: string
  icon: typeof ChartPieIcon
  total: string
  metricMode: MetricMode
  onMetricModeChange: (mode: MetricMode) => void
  /** "scroll-edge": row list can scroll, edge-to-edge (no horizontal inset)
   *  so its separators reach the card border, header/total stay fixed above it.
   *  "bottom": trend charts sit flush against the bottom of the card.
   *  "center": donut/legend content centers in the available space. */
  contentLayout?: "scroll-edge" | "bottom" | "center"
  children: React.ReactNode
}) {
  return (
    <article className="flex h-[380px] flex-col rounded-[8px] border border-overview-border bg-background">
      <CardHeader title={title} icon={icon} right={<MetricModeTabs value={metricMode} onChange={onMetricModeChange} />} />
      <div className="px-4 py-4 text-left">
        <DimmedDecimalAmount value={total} className="text-[24px] font-semibold leading-none text-foreground" />
      </div>
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col border-t border-overview-border",
          contentLayout === "scroll-edge" && "overflow-y-auto py-2",
          contentLayout === "bottom" && "justify-end overflow-hidden p-4",
          contentLayout === "center" && "items-center justify-center overflow-hidden p-4"
        )}
      >
        {children}
      </div>
    </article>
  )
}

type DistributionRow = { key: string; label: string; icon: typeof QrCodeIcon; count: number; amount: number }

function DistributionWidget({ rows, metricMode }: { rows: DistributionRow[]; metricMode: MetricMode }) {
  const values = rows.map((row) => (metricMode === "count" ? row.count : row.amount))
  const maxValue = Math.max(...values, 1)

  return (
    <div className="divide-y divide-overview-border">
      {rows.map((row, index) => {
        const value = values[index]
        const widthPct = Math.max(6, Math.round((value / maxValue) * 100))
        return (
          <Link
            key={row.key}
            href="/transactions"
            className="block space-y-2 px-4 py-3 transition-opacity hover:opacity-80"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <row.icon className="h-5 w-5 text-muted-foreground" />
                {row.label}
              </span>
              <span className="flex items-center gap-2 text-sm">
                {metricMode === "count" ? (
                  <span className="font-medium tabular-nums text-foreground">{row.count} Transactions</span>
                ) : (
                  <DimmedDecimalAmount value={`₹${formatInrAmount(row.amount)}`} className="font-medium text-foreground" />
                )}
                <CaretRightIcon className="h-4 w-4 text-muted-foreground" />
              </span>
            </div>
            <div className="w-full overflow-hidden rounded-[4px] bg-muted" style={{ height: `${BAR_THICKNESS_PX}px` }}>
              <div
                className="h-full rounded-[4px] transition-[width]"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: CHART_ACCENT_COLOR,
                  backgroundImage: BAR_HATCH_BACKGROUND_IMAGE,
                  border: `1px solid ${BAR_BORDER_COLOR}`,
                }}
              />
            </div>
          </Link>
        )
      })}
    </div>
  )
}

/** Devices distribution as a donut instead of the horizontal bars every other
 *  distribution card uses — the ring is stroked at the same thickness as the
 *  bars elsewhere (BAR_THICKNESS_PX) and hatched with the same diagonal pattern
 *  so it still reads as part of the same visual language. */
function DeviceDonutChart({ rows, metricMode }: { rows: DistributionRow[]; metricMode: MetricMode }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const values = rows.map((row) => (metricMode === "count" ? row.count : row.amount))
  const total = values.reduce((sum, value) => sum + value, 0) || 1
  const percentages = values.map((value) => Math.round((value / total) * 100))
  const size = 152
  const strokeWidth = BAR_THICKNESS_PX
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const gapPx = 3
  /** Two segments read as one shape at a glance when they're the same color —
   *  alternate the accent green with the app's primary so Mobile vs. Desktop
   *  is distinguishable in both the ring and the legend below it. Fixed hex
   *  (the light-theme --primary value) rather than var(--primary): that var
   *  flips to a near-white/near-accent green in dark mode and the two segments
   *  wash into each other — same reasoning as CHART_ACCENT_COLOR above. */
  const segmentColors = [CHART_ACCENT_COLOR, "#365314"]
  const patternIds = ["device-donut-hatch-0", "device-donut-hatch-1"]

  let progress = 0
  const segments = rows.map((row, index) => {
    const fraction = values[index] / total
    const dash = Math.max(0, fraction * circumference - gapPx)
    const dashOffset = -progress
    progress += fraction * circumference
    return { key: row.key, dash, dashOffset, patternId: patternIds[index % patternIds.length] }
  })

  const activeRow = activeIndex !== null ? rows[activeIndex] : null

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <defs>
            {patternIds.map((id, index) => (
              <pattern key={id} id={id} patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
                <rect width="10" height="10" fill={segmentColors[index]} />
                <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
              </pattern>
            ))}
          </defs>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--muted)" strokeWidth={strokeWidth} />
          {segments.map((segment, index) => (
            <circle
              key={segment.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={`url(#${segment.patternId})`}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
              strokeDashoffset={segment.dashOffset}
              className="cursor-pointer transition-opacity duration-150"
              style={{ opacity: activeIndex === null || activeIndex === index ? 1 : 0.45 }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            />
          ))}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {activeRow ? (
            <>
              <span className="text-[11px] font-medium text-muted-foreground">{activeRow.label}</span>
              <span className="text-[20px] font-semibold leading-tight text-foreground">{percentages[activeIndex!]}%</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {rows.map((row, index) => (
          <Link
            key={row.key}
            href="/transactions"
            className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-80"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: segmentColors[index % segmentColors.length] }} />
            <row.icon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{row.label}</span>
            <span className="tabular-nums text-muted-foreground">{percentages[index]}%</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function OverviewAnalyticsSection({
  stores,
  isMultiStore,
  showChannelFilter,
  channel,
  storeIds,
  onStoreIdsChange,
}: {
  stores: StoreRecord[]
  isMultiStore: boolean
  showChannelFilter: boolean
  channel: ChannelFilter
  /** Empty array = all stores. */
  storeIds: string[]
  onStoreIdsChange: (storeIds: string[]) => void
}) {
  const [range, setRange] = useState<DayRange>("yesterday")
  const [visibleWidgets, setVisibleWidgets] = useState<AnalyticsWidgetId[]>(DEFAULT_VISIBLE_WIDGETS)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [metricModes, setMetricModes] = useState<Record<AnalyticsWidgetId, MetricMode>>({
    "paymode-distribution": "count",
    "payment-volume": "count",
    "failed-payments": "count",
    "devices-distribution": "count",
    refunds: "count",
    disputes: "count",
  })

  const storeFilteredRows = useMemo(
    () => filterTransactionsByStore(transactionRows, stores, storeIds),
    [stores, storeIds]
  )
  const storeScale =
    isMultiStore && storeIds.length > 0
      ? Math.max(storeFilteredRows.length / transactionRows.length, 0.04)
      : 1
  const channelScale = CHANNEL_MULTIPLIER[showChannelFilter ? channel : "all"]
  const combinedScale = storeScale * channelScale * RANGE_MULTIPLIER[range]

  const paymodeRows: DistributionRow[] = useMemo(() => {
    const totals: Record<PaymentMode, { count: number; amount: number }> = {
      upi: { count: 0, amount: 0 },
      card: { count: 0, amount: 0 },
      netbanking: { count: 0, amount: 0 },
    }
    for (const row of storeFilteredRows) {
      totals[row.paymentMode].count += 1
      totals[row.paymentMode].amount += row.amount
    }
    const realRows = (["upi", "card", "netbanking"] as PaymentMode[]).map((mode) => ({
      key: mode,
      label: PAY_MODE_META[mode].label,
      icon: PAY_MODE_META[mode].icon,
      count: Math.max(
        1,
        Math.round(totals[mode].count * PAY_MODE_WEIGHT[mode] * channelScale * RANGE_MULTIPLIER[range])
      ),
      amount: Math.round(totals[mode].amount * PAY_MODE_WEIGHT[mode] * channelScale * RANGE_MULTIPLIER[range]),
    }))
    const realTotalCount = realRows.reduce((sum, row) => sum + row.count, 0)
    const realTotalAmount = realRows.reduce((sum, row) => sum + row.amount, 0)
    const extraRows = EXTRA_PAY_MODES.map((extra) => ({
      key: extra.key,
      label: extra.label,
      icon: extra.icon,
      count: Math.max(1, Math.round(realTotalCount * extra.fraction)),
      amount: Math.round(realTotalAmount * extra.fraction),
    }))
    return [...realRows, ...extraRows].sort((a, b) => b.count - a.count)
  }, [storeFilteredRows, channelScale, range])

  const deviceRows: DistributionRow[] = useMemo(() => {
    const totalCount = Math.max(1, Math.round(storeFilteredRows.length * channelScale * RANGE_MULTIPLIER[range]))
    const totalAmount = Math.round(
      storeFilteredRows.reduce((sum, row) => sum + row.amount, 0) * channelScale * RANGE_MULTIPLIER[range]
    )
    return [
      {
        key: "mobile",
        label: "Mobile",
        icon: DeviceMobileIcon,
        count: Math.round(totalCount * DEVICE_SPLIT.mobile),
        amount: Math.round(totalAmount * DEVICE_SPLIT.mobile),
      },
      {
        key: "desktop",
        label: "Desktop",
        icon: DesktopIcon,
        count: Math.round(totalCount * DEVICE_SPLIT.desktop),
        amount: Math.round(totalAmount * DEVICE_SPLIT.desktop),
      },
    ]
  }, [storeFilteredRows, channelScale, range])

  function setMetricMode(id: AnalyticsWidgetId, mode: MetricMode) {
    setMetricModes((current) => ({ ...current, [id]: mode }))
  }

  function toggleWidget(id: AnalyticsWidgetId, checked: boolean) {
    setVisibleWidgets((current) => {
      if (checked) return current.includes(id) ? current : [...current, id]
      return current.filter((widgetId) => widgetId !== id)
    })
  }

  function renderWidget(id: AnalyticsWidgetId) {
    const mode = metricModes[id]
    switch (id) {
      case "paymode-distribution":
        return <DistributionWidget rows={paymodeRows} metricMode={mode} />
      case "devices-distribution":
        return <DeviceDonutChart rows={deviceRows} metricMode={mode} />
      case "payment-volume": {
        const { categories, data } = getTrendSeries("volume", range, mode, combinedScale)
        return <TrendBarChart categories={categories} data={data} metricMode={mode} />
      }
      case "failed-payments": {
        const { categories, data } = getTrendSeries("failed", range, mode, combinedScale)
        return <TrendBarChart categories={categories} data={data} metricMode={mode} />
      }
      case "refunds": {
        const { categories, data } = getTrendSeries("refund", range, mode, combinedScale)
        return <TrendBarChart categories={categories} data={data} metricMode={mode} />
      }
      case "disputes": {
        const { categories, data } = getTrendSeries("dispute", range, mode, combinedScale)
        return <TrendBarChart categories={categories} data={data} metricMode={mode} />
      }
    }
  }

  function widgetTotal(id: AnalyticsWidgetId) {
    const mode = metricModes[id]
    switch (id) {
      case "paymode-distribution":
        return formatTotal(paymodeRows.reduce((sum, row) => sum + (mode === "count" ? row.count : row.amount), 0), mode)
      case "devices-distribution":
        return formatTotal(deviceRows.reduce((sum, row) => sum + (mode === "count" ? row.count : row.amount), 0), mode)
      case "payment-volume":
        return formatTotal(sumSeries(getTrendSeries("volume", range, mode, combinedScale).data), mode)
      case "failed-payments":
        return formatTotal(sumSeries(getTrendSeries("failed", range, mode, combinedScale).data), mode)
      case "refunds":
        return formatTotal(sumSeries(getTrendSeries("refund", range, mode, combinedScale).data), mode)
      case "disputes":
        return formatTotal(sumSeries(getTrendSeries("dispute", range, mode, combinedScale).data), mode)
    }
  }

  const orderedVisibleWidgets = WIDGET_CATALOG.filter((widget) => visibleWidgets.includes(widget.id))

  const dateFilter: ListingFilter = {
    id: "date-range",
    type: "select",
    label: "Date",
    value: range,
    onValueChange: (value) => setRange(value as DayRange),
    options: DAY_RANGE_OPTIONS.map((option): FilterOption => ({ label: option.label, value: option.value })),
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-heading text-lg font-semibold text-foreground">Analytics</h3>
          <StoreScopeNote
            isMultiStore={isMultiStore}
            stores={stores}
            storeIds={storeIds}
            onStoreIdsChange={onStoreIdsChange}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterControl filter={dateFilter} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-md text-xs"
            onClick={() => setCustomizeOpen(true)}
          >
            <SlidersIcon className="size-3.5" />
            Customize
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {orderedVisibleWidgets.map((widget) => (
          <AnalyticsCard
            key={widget.id}
            title={widget.title}
            icon={widget.icon}
            total={widgetTotal(widget.id) ?? ""}
            metricMode={metricModes[widget.id]}
            onMetricModeChange={(mode) => setMetricMode(widget.id, mode)}
            contentLayout={
              widget.id === "paymode-distribution" ? "scroll-edge" : widget.id === "devices-distribution" ? "center" : "bottom"
            }
          >
            {renderWidget(widget.id)}
          </AnalyticsCard>
        ))}
      </div>

      <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Customize analytics cards</DialogTitle>
            <DialogDescription>Choose which cards show up in the Analytics section.</DialogDescription>
          </DialogHeader>

          <div className="space-y-1">
            {WIDGET_CATALOG.map((widget) => {
              const checked = visibleWidgets.includes(widget.id)
              return (
                <label
                  key={widget.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) => toggleWidget(widget.id, value === true)}
                  />
                  <widget.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{widget.title}</span>
                </label>
              )
            })}
          </div>

          <DialogFooter>
            <Button type="button" size="sm" onClick={() => setCustomizeOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
