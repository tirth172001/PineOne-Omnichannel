"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, CircleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HighchartsPanelChart } from "@/components/ui/highcharts"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"
import { cn } from "@/lib/utils"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { ProductWorkspaceNav, type ProductWorkspaceSection } from "@/components/dashboard/product-workspace-nav"

type WindowSegment = "7D" | "30D" | "90D"

interface MetricItem {
  label: string
  value: string
  detail: string
}

interface PerformanceCardConfig {
  id: string
  label: string
  title: string
  ctaLabel: string
  href: string
  metrics: MetricItem[]
  series: {
    processed: number[]
    net: number[]
    success: number[]
  }
}

const quarterLabels = ["Q2 2023", "Q3 2023", "Q4 2023", "Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"]
const windowOptions: WindowSegment[] = ["7D", "30D", "90D"]
const windowScale: Record<WindowSegment, number> = {
  "7D": 0.96,
  "30D": 1,
  "90D": 1.05,
}

const alertItems: Array<{ title: string; action: string; href: string }> = [
  { title: "6 disputes need review", action: "Review disputes", href: "/online-payments" },
  { title: "Documentation update pending", action: "Open docs", href: "https://developer.pinelabs.com/" },
  { title: "2 settlement exceptions", action: "View settlements", href: "/offline-payments" },
]

const performanceCards: PerformanceCardConfig[] = [
  {
    id: "overall",
    label: "Overall",
    title: "Overall business performance",
    ctaLabel: "View platform analytics",
    href: "/online-payments",
    metrics: [
      { label: "Gross volume", value: "₹8.6M", detail: "+12.4%" },
      { label: "Payment success", value: "96.8%", detail: "+0.9 pts" },
      { label: "Settlement reliability", value: "99.2%", detail: "2 delayed" },
    ],
    series: {
      processed: [24.2, 22.8, 23.6, 20.4, 24.5, 24.1, 25.7],
      net: [2.1, 0.7, 7.0, 0.2, 0.4, 0.9, 2.3],
      success: [96.3, 96.1, 96.5, 95.9, 96.6, 96.7, 96.8],
    },
  },
  {
    id: "online",
    label: "Online payments",
    title: "Online payments overview",
    ctaLabel: "View online details",
    href: "/online-payments",
    metrics: [
      { label: "Processed value", value: "₹5.1M", detail: "UPI share 44%" },
      { label: "Success rate", value: "96.9%", detail: "+1.1 pts" },
      { label: "Refunds", value: "1.2%", detail: "Within target" },
    ],
    series: {
      processed: [16.4, 15.9, 17.8, 14.6, 18.2, 18.0, 18.9],
      net: [1.9, 1.7, 2.4, 1.2, 2.1, 2.2, 2.5],
      success: [96.1, 95.9, 96.5, 95.6, 96.7, 96.8, 96.9],
    },
  },
  {
    id: "offline",
    label: "Offline payments",
    title: "Offline payments overview",
    ctaLabel: "View offline details",
    href: "/offline-payments",
    metrics: [
      { label: "Counter value", value: "₹2.4M", detail: "Tap share growing" },
      { label: "Device uptime", value: "98.7%", detail: "3 unstable" },
      { label: "Settlement lag", value: "0.8%", detail: "Below threshold" },
    ],
    series: {
      processed: [5.8, 5.2, 4.9, 4.7, 5.4, 5.1, 5.8],
      net: [0.6, 0.5, 0.4, 0.3, 0.5, 0.5, 0.6],
      success: [98.3, 98.1, 98.0, 97.8, 98.5, 98.4, 98.7],
    },
  },
  {
    id: "links",
    label: "Pay by link",
    title: "Pay by link overview",
    ctaLabel: "View link details",
    href: "/payment-links",
    metrics: [
      { label: "Processed value", value: "₹1.1M", detail: "3,214 links" },
      { label: "Conversion", value: "39.8%", detail: "+3.1 pts" },
      { label: "Expired links", value: "11.4%", detail: "-1.5 pts" },
    ],
    series: {
      processed: [2.0, 1.7, 2.2, 1.9, 2.4, 2.3, 2.6],
      net: [0.4, 0.2, 0.6, 0.4, 0.6, 0.6, 0.8],
      success: [37.2, 36.8, 38.4, 37.9, 39.1, 39.4, 39.8],
    },
  },
]

const allProductSettlementRows = [
  { id: "APL-STL-01", product: "Online payments", amount: "₹1,42,330", state: "Processing" },
  { id: "APL-STL-02", product: "Offline payments", amount: "₹1,12,300", state: "Completed" },
  { id: "APL-STL-03", product: "Pay by link", amount: "₹48,300", state: "Completed" },
]

const allProductDisputeRows = [
  { id: "APL-DSP-01", product: "Online payments", state: "Evidence required", amount: "₹12,500" },
  { id: "APL-DSP-02", product: "Offline payments", state: "Chargeback requested", amount: "₹2,300" },
  { id: "APL-DSP-03", product: "Pay by link", state: "Bank timeout", amount: "₹1,800" },
]

const allProductRefundRows = [
  { id: "APL-RFD-01", product: "Online payments", state: "Manual review", amount: "₹4,400" },
  { id: "APL-RFD-02", product: "Offline payments", state: "Approved", amount: "₹780" },
  { id: "APL-RFD-03", product: "Pay by link", state: "Completed", amount: "₹999" },
]

const allProductReportRows = [
  { id: "APL-RPT-01", report: "Cross-product conversion report", cadence: "Weekly", owner: "Growth Ops" },
  { id: "APL-RPT-02", report: "Settlement reliability report", cadence: "Daily", owner: "Finance Ops" },
  { id: "APL-RPT-03", report: "Refund velocity report", cadence: "Weekly", owner: "Support Ops" },
]

const allProductVasRows = [
  { id: "APL-VAS-01", product: "Online payments", service: "Smart routing", status: "enabled", owner: "Payments Ops" },
  { id: "APL-VAS-02", product: "Offline payments", service: "AMEX acceptance", status: "pending", owner: "Terminal Ops" },
  { id: "APL-VAS-03", product: "Pay by link", service: "Smart reminders", status: "enabled", owner: "Collections Team" },
]

function buildChartOptions(card: PerformanceCardConfig, windowSegment: WindowSegment) {
  const scale = windowScale[windowSegment]
  const processed = card.series.processed.map((value) => Number((value * scale).toFixed(2)))
  const net = card.series.net.map((value) => Number((value * scale).toFixed(2)))
  const success = card.series.success.map((value) => Number((value + (scale - 1) * 1.2).toFixed(2)))

  return {
    chart: { type: "line" },
    xAxis: { categories: quarterLabels },
    yAxis: [
      {
        title: { text: undefined },
        labels: { format: "{value}M" },
      },
      {
        title: { text: undefined },
        opposite: true,
        labels: { format: "{value}%" },
      },
    ],
    legend: { enabled: true, align: "right", verticalAlign: "bottom" },
    tooltip: { shared: true },
    series: [
      {
        type: "line",
        name: "Processed value",
        data: processed,
        color: "var(--color-chart-3)",
        lineWidth: 1.8,
      },
      {
        type: "line",
        name: "Net revenue",
        data: net,
        color: "var(--color-muted-foreground)",
        lineWidth: 1.8,
        dashStyle: "ShortDot",
      },
      {
        type: "line",
        name: "Payment success",
        yAxis: 1,
        data: success,
        color: "var(--color-primary)",
        lineWidth: 1.8,
      },
    ],
  }
}

function PerformanceCard({
  card,
  windowSegment,
  onSelectWindow,
}: {
  card: PerformanceCardConfig
  windowSegment: WindowSegment
  onSelectWindow: (segment: WindowSegment) => void
}) {
  const chartOptions = useMemo(() => buildChartOptions(card, windowSegment), [card, windowSegment])

  return (
    <section className="rounded-lg bg-card/75 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{card.label}</p>
          <h2 className="text-[15px] font-semibold text-foreground">{card.title}</h2>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center rounded-md bg-muted/70 p-0.5">
            {windowOptions.map((item) => (
              <Button variant="ghost"
                key={`${card.id}-${item}`}
                onClick={() => onSelectWindow(item)}
                className={cn(
                  "rounded-sm px-2.5 py-1 text-[11px] transition-colors",
                  windowSegment === item ? "bg-card text-foreground" : "text-muted-foreground",
                )}
              >
                {item}
              </Button>
            ))}
          </div>
          <Button asChild size="sm" className="h-8 rounded-md px-3 text-[11px]">
            <Link href={card.href}>
              {card.ctaLabel}
              <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-3 grid border-y border-border/55 sm:grid-cols-3 sm:divide-x sm:divide-border/55">
        {card.metrics.map((metric, index) => (
          <div
            key={`${card.id}-${metric.label}`}
            className={cn("px-3 py-2", index < 2 ? "border-b border-border/55 sm:border-b-0" : "")}
          >
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{metric.label}</p>
            <p className="mt-1 text-[16px] font-semibold text-foreground">{metric.value}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{metric.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 h-[260px] overflow-hidden rounded-md p-1">
        <HighchartsPanelChart options={chartOptions} />
      </div>
    </section>
  )
}

export function HomeContent() {
  const [navSection, setNavSection] = useState<ProductWorkspaceSection>("transactions")
  const [windowSegment, setWindowSegment] = useState<WindowSegment>("30D")

  const settlementColumns: DataTableColumn<(typeof allProductSettlementRows)[number]>[] = [
    { id: "id", header: "Settlement ID", accessorKey: "id", width: 130, pinnable: true },
    {
      id: "product",
      header: "Product",
      accessorKey: "product",
      width: 160,
      filterOptions: [
        { label: "Online payments", value: "Online payments" },
        { label: "Offline payments", value: "Offline payments" },
        { label: "Pay by link", value: "Pay by link" },
      ],
    },
    { id: "state", header: "State", accessorKey: "state", width: 130 },
    { id: "amount", header: "Amount", accessorKey: "amount", width: 120, align: "right" },
  ]

  const disputeColumns: DataTableColumn<(typeof allProductDisputeRows)[number]>[] = [
    { id: "id", header: "Dispute ID", accessorKey: "id", width: 130, pinnable: true },
    { id: "product", header: "Product", accessorKey: "product", width: 160 },
    { id: "state", header: "Status", accessorKey: "state", width: 200 },
    { id: "amount", header: "Amount", accessorKey: "amount", width: 120, align: "right" },
  ]

  const refundColumns: DataTableColumn<(typeof allProductRefundRows)[number]>[] = [
    { id: "id", header: "Refund ID", accessorKey: "id", width: 130, pinnable: true },
    { id: "product", header: "Product", accessorKey: "product", width: 160 },
    { id: "state", header: "State", accessorKey: "state", width: 200 },
    { id: "amount", header: "Amount", accessorKey: "amount", width: 120, align: "right" },
  ]

  const reportColumns: DataTableColumn<(typeof allProductReportRows)[number]>[] = [
    { id: "id", header: "Report ID", accessorKey: "id", width: 120, pinnable: true },
    { id: "report", header: "Report", accessorKey: "report", width: 280 },
    { id: "cadence", header: "Cadence", accessorKey: "cadence", width: 120 },
    { id: "owner", header: "Owner", accessorKey: "owner", width: 140 },
  ]

  const vasColumns: DataTableColumn<(typeof allProductVasRows)[number]>[] = [
    { id: "id", header: "Service ID", accessorKey: "id", width: 120, pinnable: true },
    { id: "product", header: "Product", accessorKey: "product", width: 160 },
    { id: "service", header: "Service", accessorKey: "service", width: 220 },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      width: 120,
      filterOptions: [
        { label: "Enabled", value: "enabled" },
        { label: "Pending", value: "pending" },
      ],
      cell: (row) => (
        <Badge variant="outline" className={row.status === "enabled" ? "bg-success/20 border-success/35 text-foreground" : "bg-warning/20 border-warning/35 text-foreground"}>
          {row.status}
        </Badge>
      ),
    },
    { id: "owner", header: "Owner", accessorKey: "owner", width: 150 },
  ]

  const leftContext = (
    <ProductWorkspaceNav
      title="All Products"
      value={navSection}
      onChange={(nextSection) => setNavSection(nextSection)}
    />
  )

  const centerMain = (
    <div className="h-full overflow-y-auto p-4">
      {navSection === "transactions" ? (
        <div className="space-y-4">
          <section className="rounded-lg bg-accent/45 px-4 py-3">
            <div className="flex items-center gap-2 text-[12px] text-foreground">
              <CircleAlert className="h-3.5 w-3.5 text-primary" />
              Immediate attention
            </div>
            <div className="mt-2 grid gap-2 md:grid-cols-3">
              {alertItems.map((item) => (
                <div key={item.title} className="flex items-center justify-between gap-2 rounded-md bg-card/55 px-3 py-2">
                  <p className="truncate text-[12px] text-foreground">{item.title}</p>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]" asChild>
                    <Link href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                      {item.action}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <PerformanceCard card={performanceCards[0]} windowSegment={windowSegment} onSelectWindow={setWindowSegment} />

          <div className="grid gap-3">
            <PerformanceCard card={performanceCards[1]} windowSegment={windowSegment} onSelectWindow={setWindowSegment} />
            <PerformanceCard card={performanceCards[2]} windowSegment={windowSegment} onSelectWindow={setWindowSegment} />
            <PerformanceCard card={performanceCards[3]} windowSegment={windowSegment} onSelectWindow={setWindowSegment} />
          </div>
        </div>
      ) : navSection === "settlements" ? (
        <DataTable
          data={allProductSettlementRows}
          columns={settlementColumns}
          rowId={(row) => row.id}
          searchPlaceholder="Search settlements..."
          initialPinnedColumnIds={["id"]}
        />
      ) : navSection === "disputes" ? (
        <DataTable
          data={allProductDisputeRows}
          columns={disputeColumns}
          rowId={(row) => row.id}
          searchPlaceholder="Search disputes..."
          initialPinnedColumnIds={["id"]}
        />
      ) : navSection === "refunds" ? (
        <DataTable
          data={allProductRefundRows}
          columns={refundColumns}
          rowId={(row) => row.id}
          searchPlaceholder="Search refunds..."
          initialPinnedColumnIds={["id"]}
        />
      ) : navSection === "reports" ? (
        <DataTable
          data={allProductReportRows}
          columns={reportColumns}
          rowId={(row) => row.id}
          searchPlaceholder="Search reports..."
          initialPinnedColumnIds={["id"]}
        />
      ) : (
        <DataTable
          data={allProductVasRows}
          columns={vasColumns}
          rowId={(row) => row.id}
          searchPlaceholder="Search services..."
          initialPinnedColumnIds={["id"]}
        />
      )}
    </div>
  )

  return (
    <WorkspaceShell leftContext={leftContext} showLeftContext={false} centerMain={centerMain} showRightContext={false} />
  )
}
