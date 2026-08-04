"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { OverviewAnalyticsCanvas, type AnalyticsWidget } from "@/components/dashboard/overview-analytics-canvas"
import { PageHeader } from "@/components/ui/panels"

const totalRefundCount = 1860
const totalRefundVolume = 2389000
const successRate = 92.8
const avgRefundTAT = 18

export function RefundsAnalyticsContent() {
  const [customizeOpen, setCustomizeOpen] = useState(false)

  const analyticsWidgets = useMemo<AnalyticsWidget[]>(
    () => [
      {
        id: "total-refund-count",
        title: "Total refund count",
        value: totalRefundCount.toLocaleString("en-MY"),
        delta: "+7.4% vs previous period",
        chart: [1520, 1590, 1632, 1701, 1766, 1815, totalRefundCount],
        compareChart: [1410, 1456, 1498, 1540, 1603, 1662, 1718],
        chartType: "column",
        defaultWidth: "wide",
      },
      {
        id: "total-refund-volume",
        title: "Total refund volume",
        value: `₹${totalRefundVolume.toLocaleString("en-MY")}`,
        delta: "₹2.39M processed",
        chart: [1720000, 1815000, 1898000, 2012000, 2143000, 2266000, totalRefundVolume],
        compareChart: [1602000, 1675000, 1741000, 1820000, 1916000, 2032000, 2141000],
        chartType: "area",
        defaultWidth: "wide",
      },
      {
        id: "refund-success-rate",
        title: "Refund success rate",
        value: `${successRate}%`,
        delta: "Bank rejections down",
        chart: [89.8, 90.2, 90.9, 91.5, 91.8, 92.1, successRate],
        compareChart: [88.1, 88.9, 89.3, 89.8, 90.3, 90.7, 91.1],
        chartType: "line",
      },
      {
        id: "avg-refund-tat",
        title: "Average refund TAT",
        value: `${avgRefundTAT} mins`,
        delta: "End-to-end completion",
        chart: [26, 24, 23, 22, 21, 19, avgRefundTAT],
        compareChart: [31, 29, 28, 26, 25, 24, 23],
        chartType: "line",
      },
      {
        id: "refund-status-split",
        title: "Refund status split",
        value: "Success 92.8%",
        delta: "Pending and failed mix",
        chartType: "pie",
        chartLabels: ["Success", "Pending", "Failed", "Initiated"],
        chart: [92.8, 4.6, 1.9, 0.7],
      },
      {
        id: "refund-source-product",
        title: "Refund source by product",
        value: "Checkout leads",
        delta: "Cross-product contribution",
        chartType: "pie",
        chartLabels: ["Checkout", "POS Terminal", "Payment Links"],
        chart: [48, 31, 21],
      },
      {
        id: "refund-reason-trend",
        title: "Top refund reasons",
        value: "Order cancellation 46%",
        delta: "Quality and fulfillment related",
        chartType: "bar",
        chartLabels: [
          "Order cancellation",
          "Customer dispute",
          "Duplicate payment",
          "Item unavailable",
          "Delivery failure",
        ],
        chart: [46, 21, 15, 11, 7],
        defaultWidth: "wide",
      },
      {
        id: "refund-bank-timeline",
        title: "Bank acknowledgement timeline",
        value: "Median 6 mins",
        delta: "Across all refund routes",
        chart: [9.8, 9.1, 8.7, 8.1, 7.4, 6.8, 6],
        compareChart: [11.5, 10.8, 10.2, 9.5, 8.9, 8.3, 7.7],
        chartType: "line",
        defaultWidth: "wide",
      },
    ],
    []
  )

  return (
    <>
      <PageHeader
        title="Refunds Analytics"
        subtitle="Performance and operational insights for refunds"
        backHref="/refunds"
        actions={
          <Button size="sm" className="h-8 text-xs" onClick={() => setCustomizeOpen(true)}>
            Customize
          </Button>
        }
      />

      <div className="px-4 pb-6">
        <div className="mx-auto w-full" style={{ maxWidth: "var(--dashboard-center-max-width, 1440px)" }}>
          <OverviewAnalyticsCanvas
            scopeId="refunds-analytics"
            widgets={analyticsWidgets}
            viewOptions={[
              { label: "All", value: "all" },
              { label: "Checkout", value: "checkout" },
              { label: "POS Terminal", value: "pos-terminal" },
              { label: "Payment Links", value: "payment-links" },
            ]}
            dateOptions={["Today", "Last 7 days", "Last 30 days", "This quarter"]}
            compareOptions={["Yesterday", "Previous period", "Last week"]}
            showViewOptions
            viewSelectorVariant="dropdown"
            showConfiguredProductsBadge={false}
            showAutoRefreshControl={false}
            showCustomizeControl={false}
            toolbarSurface="plain"
            customizeOpen={customizeOpen}
            onCustomizeOpenChange={setCustomizeOpen}
          />
        </div>
      </div>
    </>
  )
}
