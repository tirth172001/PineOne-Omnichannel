"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { OverviewAnalyticsCanvas, type AnalyticsWidget } from "@/components/dashboard/overview-analytics-canvas"
import { PageHeader } from "@/components/ui/panels"

const totalPaymentsProcessed = 12720
const totalAmountPaid = 193890
const averageCompletionMins = 3
const successfulPayments = 12213
const failedPayments = totalPaymentsProcessed - successfulPayments
const successRate = (successfulPayments / totalPaymentsProcessed) * 100

const businessErrorSplitPercent = 92
const technicalErrorSplitPercent = 8

export function TransactionsAnalyticsContent() {
  const [customizeOpen, setCustomizeOpen] = useState(false)

  const analyticsWidgets = useMemo<AnalyticsWidget[]>(
    () => [
      {
        id: "total-payments-processed",
        title: "Total payments processed",
        value: totalPaymentsProcessed.toLocaleString("en-IN"),
        delta: "+4.6% vs previous period",
        chart: [11140, 11390, 11680, 11820, 12110, 12340, 12720],
        compareChart: [10810, 10970, 11090, 11360, 11640, 11810, 12130],
        chartType: "column",
        defaultWidth: "wide",
      },
      {
        id: "total-amount-paid",
        title: "Total amount paid",
        value: `₹${totalAmountPaid.toLocaleString("en-IN")}`,
        delta: "+6.2% vs previous period",
        chart: [164000, 169500, 172300, 178600, 182200, 188400, 193890],
        compareChart: [152200, 157800, 161500, 166900, 170600, 176300, 182900],
        chartType: "area",
        defaultWidth: "wide",
      },
      {
        id: "avg-completion-time",
        title: "Average time to complete payment",
        value: `${averageCompletionMins} mins`,
        delta: "-0.4 mins improvement",
        chart: [3.8, 3.6, 3.5, 3.4, 3.3, 3.1, 3],
        compareChart: [4.1, 3.9, 3.8, 3.6, 3.5, 3.4, 3.2],
        chartType: "line",
      },
      {
        id: "success-rate",
        title: "Successful payments from total attempted",
        value: `${successRate.toFixed(0)}%`,
        delta: `${successfulPayments.toLocaleString("en-IN")} successful`,
        chart: [94, 94.4, 95, 95.4, 95.9, 96.2, Number(successRate.toFixed(0))],
        compareChart: [92.8, 93.4, 93.9, 94.1, 94.8, 95.1, 95.4],
        chartType: "area",
        defaultWidth: "wide",
      },
      {
        id: "error-split",
        title: "Error split",
        value: `${failedPayments.toLocaleString("en-IN")} failed`,
        delta: "Business vs technical declines",
        chartType: "pie",
        chartLabels: ["Business decline", "Technical decline"],
        chart: [businessErrorSplitPercent, technicalErrorSplitPercent],
      },
      {
        id: "payment-app-split",
        title: "Split of payment apps used by customer",
        value: "Top payment app mix",
        delta: "GooglePay leads",
        chartType: "pie",
        chartLabels: ["GooglePay", "PhonePe", "BHIM", "PayTM"],
        chart: [30, 26, 26, 18],
        defaultWidth: "wide",
      },
      {
        id: "bank-split",
        title: "Split of customer bank accounts",
        value: "Top issuing banks",
        delta: "ABC, ICICI and Axis dominate",
        chartType: "pie",
        chartLabels: ["ABC", "ICICI", "Axis", "HDFC", "IDFC", "Others"],
        chart: [25.5, 19.5, 18, 15, 12, 10],
        defaultWidth: "wide",
      },
      {
        id: "business-decline-reasons",
        title: "Business decline reason trend",
        value: "Insufficient funds 3.64%",
        delta: "Top business decline driver",
        chartType: "bar",
        chartLabels: [
          "Insufficient funds",
          "Suspected fraud",
          "Invalid mPIN",
          "Limit exceeded",
          "PIN tries exceeded",
        ],
        chart: [3.64, 0.68, 0.68, 0.07, 0.06],
        defaultWidth: "wide",
      },
      {
        id: "technical-decline-reasons",
        title: "Technical decline reason trend",
        value: "Remitter CBS offline 0.07%",
        delta: "Top technical decline driver",
        chartType: "bar",
        chartLabels: [
          "Remitter CBS offline",
          "Timeout",
          "Cut off in progress",
          "Internal exception",
          "Unable to notify customer",
        ],
        chart: [0.07, 0.06, 0.02, 0.01, 0.005],
        defaultWidth: "wide",
      },
      {
        id: "failed-count",
        title: "Count of failed payments",
        value: failedPayments.toLocaleString("en-IN"),
        delta: "Decline stack monitored",
        chart: [240, 230, 215, 205, 198, 193, failedPayments],
        compareChart: [265, 258, 250, 241, 231, 220, 210],
        chartType: "line",
      },
    ],
    []
  )

  return (
    <>
      <PageHeader
        title="Transaction Analytics"
        subtitle="Deep performance analysis for transaction flows"
        backHref="/transactions"
        actions={
          <Button size="sm" className="h-8 text-xs" onClick={() => setCustomizeOpen(true)}>
            Customize
          </Button>
        }
      />

      <div className="px-4 pb-6">
        <div className="mx-auto w-full" style={{ maxWidth: "var(--dashboard-center-max-width, 1440px)" }}>
          <OverviewAnalyticsCanvas
            scopeId="transactions-analytics"
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
