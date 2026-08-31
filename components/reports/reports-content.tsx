"use client"

import { useMemo, useState } from "react"
import { DownloadIcon } from "@phosphor-icons/react"
import { useDateRangeFilter } from "@/components/shared/date-range-filter"
import {
  LINE_TAB_TRIGGER_CLASSES,
  LINE_TABS_LIST_CLASSES,
  ListingToolbar,
  PAGE_HEADING_CLASSES,
  type ListingFilter,
} from "@/components/shared/listing-page-primitives"
import { useMoreFiltersPanel, type MoreFilterCategory } from "@/components/shared/more-filters-panel"
import { StatusPill, type StatusTone } from "@/components/shared/status-pill"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionReportPanel } from "@/components/reports/transaction-report-panel"
import { SettlementReportPanel } from "@/components/reports/settlement-report-panel"
import { ScheduleReportPanel } from "@/components/reports/schedule-report-panel"

/** Only "Transaction" has the full filters + columns generate flow (per Figma); every other
 *  section — including "Settlement report" — reuses the simple name + date range panel. */
const TRANSACTION_REPORT_HEADING = "Transaction"

const historyRows = [
  {
    reportName: "Transactions report - weekly",
    createdOn: "12 Aug 2026",
    dateRange: "05 Aug - 11 Aug",
    refundStatus: "Completed",
    action: "Download",
  },
  {
    reportName: "Refund report",
    createdOn: "11 Aug 2026",
    dateRange: "04 Aug - 10 Aug",
    refundStatus: "Processing",
    action: "View",
  },
]

const scheduleRows = [
  {
    name: "Weekly settlement summary",
    frequency: "Weekly",
    format: "CSV",
    createdBy: "Tirth",
    status: "Active",
    action: "Edit",
  },
  {
    name: "Daily transaction dump",
    frequency: "Daily",
    format: "XLSX",
    createdBy: "Ops",
    status: "Paused",
    action: "Resume",
  },
]

export const reportSections = [
  {
    heading: "Transaction",
    cards: [
      { title: "All transactions report", description: "Every transaction across products and channels" },
      { title: "EMI Trxn report", description: "EMI conversions and repayment schedule" },
      { title: "Reward Txn report", description: "Reward point accruals and redemptions" },
      { title: "UPI Txn report", description: "UPI collect and pay transactions" },
      { title: "Wallet Txn report", description: "Wallet load, spend, and balance activity" },
      { title: "NBFC Txn report", description: "NBFC-partnered lending transactions" },
      { title: "Insurance report", description: "Insurance premium and claim transactions" },
      { title: "DCC report", description: "Dynamic currency conversion transactions" },
    ],
  },
  {
    heading: "Financial report",
    cards: [{ title: "FIRC report", description: "Foreign inward remittance certificates" }],
  },
  {
    heading: "Refund report",
    cards: [{ title: "Refund report", description: "All refund requests and their status" }],
  },
  {
    heading: "Sales summary report",
    cards: [
      { title: "POS sales report", description: "Sales summary by POS device", offlineOnly: true },
      { title: "Store sales report", description: "Sales summary by store", offlineOnly: true },
      { title: "Acquirer sales report", description: "Sales summary grouped by acquirer" },
      { title: "Issuer sales report", description: "Sales summary grouped by card issuer" },
      { title: "UPI sales report", description: "Sales summary for UPI transactions" },
    ],
  },
  {
    heading: "Settlement report",
    cards: [
      { title: "MPR", description: "Merchant payout report" },
      { title: "Batch detail report", description: "Settlement batch level breakdown" },
    ],
  },
  {
    heading: "Terminal reports",
    cards: [
      { title: "TID installation report", description: "TID installation activity log", offlineOnly: true },
      { title: "TID deinstallation report", description: "TID deinstallation activity log", offlineOnly: true },
      { title: "POS installation report", description: "POS device installation activity log", offlineOnly: true },
      { title: "POS deinstallation report", description: "POS device deinstallation activity log", offlineOnly: true },
    ],
  },
]

const moreFilterCategories: MoreFilterCategory[] = [
  {
    id: "category",
    label: "Report category",
    display: "card",
    selectionMode: "multi",
    options: reportSections.map((section) => ({ id: section.heading, label: section.heading })),
  },
  {
    id: "channel",
    label: "Channel",
    display: "list",
    selectionMode: "single",
    searchable: false,
    options: [
      { id: "online", label: "Online" },
      { id: "offline", label: "Offline" },
    ],
  },
  {
    id: "format",
    label: "Format",
    display: "badge",
    selectionMode: "multi",
    searchable: false,
    options: [
      { id: "csv", label: "CSV" },
      { id: "xlsx", label: "XLSX" },
      { id: "pdf", label: "PDF" },
    ],
  },
]

function toReportTone(status: string): StatusTone {
  const normalized = status.toLowerCase()
  if (normalized.includes("completed") || normalized.includes("active")) return "success"
  if (normalized.includes("processing")) return "processing"
  if (normalized.includes("paused")) return "initiated"
  return "failed"
}

export function ReportsContent() {
  const [topTab, setTopTab] = useState<"reports" | "history" | "schedule">("reports")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const dateRangeFilter = useDateRangeFilter({ initialPresetId: "week" })
  const moreFilters = useMoreFiltersPanel(moreFilterCategories)
  const [generatePanel, setGeneratePanel] = useState<{ kind: "transaction" | "settlement"; title: string } | null>(null)
  const [scheduleOpen, setScheduleOpen] = useState(false)

  function openGeneratePanel(sectionHeading: string, title: string) {
    setGeneratePanel({ kind: sectionHeading === TRANSACTION_REPORT_HEADING ? "transaction" : "settlement", title })
  }

  const historyFiltered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return historyRows.filter((row) => {
      if (!q) return true
      return `${row.reportName} ${row.dateRange} ${row.refundStatus}`.toLowerCase().includes(q)
    })
  }, [search])

  const scheduleFiltered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return scheduleRows.filter((row) => {
      if (!q) return true
      return `${row.name} ${row.frequency} ${row.status}`.toLowerCase().includes(q)
    })
  }, [search])

  const filters: ListingFilter[] = [
    dateRangeFilter.filter,
    {
      id: "status",
      type: "select",
      label: "Status",
      value: statusFilter,
      onValueChange: setStatusFilter,
      options: [
        { label: "Status", value: "all" },
        { label: "Completed", value: "completed" },
        { label: "Processing", value: "processing" },
        { label: "Failed", value: "failed" },
      ],
    },
  ]

  return (
    <div className="w-full">
      <section>
        <div className="px-8 pt-8 pb-0">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className={PAGE_HEADING_CLASSES}>Reports</h1>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="rounded-[8px] border-border/70 bg-background"
                onClick={() => setScheduleOpen(true)}
              >
                Schedule report
              </Button>
              <Button onClick={() => openGeneratePanel(TRANSACTION_REPORT_HEADING, "All transactions report")}>
                Generate report
              </Button>
            </div>
          </div>
        </div>

        <div className="px-8 pt-8 pb-0">
          <Tabs value={topTab} onValueChange={(value) => setTopTab(value as "reports" | "history" | "schedule")}>
            <TabsList variant="line" className={LINE_TABS_LIST_CLASSES}>
              <TabsTrigger value="reports" className={LINE_TAB_TRIGGER_CLASSES}>
                Reports
              </TabsTrigger>
              <TabsTrigger value="history" className={LINE_TAB_TRIGGER_CLASSES}>
                History
              </TabsTrigger>
              <TabsTrigger value="schedule" className={LINE_TAB_TRIGGER_CLASSES}>
                Schedule
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Separator />
      </section>

      <div className="space-y-6 px-8 pt-8 pb-8">
        {topTab === "reports" ? (
          <div className="space-y-10">
            {reportSections.map((section) => (
              <section key={section.heading} className="space-y-4">
                <h2 className="text-[24px] font-semibold leading-tight text-foreground">{section.heading}</h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {section.cards.map((card) => (
                    <Card key={card.title} className="rounded-[8px] bg-background p-4 ring-border/60">
                      <CardHeader className="p-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-base font-semibold text-foreground">{card.title}</CardTitle>
                          {card.offlineOnly ? (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              Offline only
                            </Badge>
                          ) : null}
                        </div>
                        <CardDescription className="text-sm font-normal text-muted-foreground">
                          {card.description}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="mt-auto border-t-0 bg-transparent px-0 pt-4 pb-3">
                        <Button
                          variant="outline"
                          className="w-full rounded-[6px]"
                          onClick={() => openGeneratePanel(section.heading, card.title)}
                        >
                          Generate
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <>
            <ListingToolbar
              className="px-0 py-0"
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search reports"
              filters={filters}
              {...moreFilters.toolbarProps}
              rightActions={
                <>
                  <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">
                    <DownloadIcon className="h-4 w-4" />
                    Download filtered
                  </Button>
                </>
              }
            />

            <section className="space-y-6">
              <div className="overflow-hidden rounded-[8px] border border-border bg-background">
                <div className="overflow-x-auto">
                  <Table className="min-w-[1100px]">
                    <TableHeader>
                      {topTab === "history" ? (
                        <TableRow className="h-10 [&>th:first-child]:rounded-tl-[8px] [&>th:last-child]:rounded-tr-[8px]">
                          <TableHead className="px-4 text-sm font-medium text-muted-foreground">Report name</TableHead>
                          <TableHead className="px-4 text-sm font-medium text-muted-foreground">Created on</TableHead>
                          <TableHead className="px-4 text-sm font-medium text-muted-foreground">Date range</TableHead>
                          <TableHead className="px-4 text-sm font-medium text-muted-foreground">Refund status</TableHead>
                          <TableHead className="px-4 text-sm font-medium text-muted-foreground">Action</TableHead>
                        </TableRow>
                      ) : (
                        <TableRow className="h-10 [&>th:first-child]:rounded-tl-[8px] [&>th:last-child]:rounded-tr-[8px]">
                          <TableHead className="px-4 text-sm font-medium text-muted-foreground">Schedule & report name</TableHead>
                          <TableHead className="px-4 text-sm font-medium text-muted-foreground">Frequency</TableHead>
                          <TableHead className="px-4 text-sm font-medium text-muted-foreground">Format</TableHead>
                          <TableHead className="px-4 text-sm font-medium text-muted-foreground">Created by</TableHead>
                          <TableHead className="px-4 text-sm font-medium text-muted-foreground">Status</TableHead>
                          <TableHead className="px-4 text-sm font-medium text-muted-foreground">Action</TableHead>
                        </TableRow>
                      )}
                    </TableHeader>
                    <TableBody>
                      {topTab === "history"
                        ? historyFiltered.map((row) => (
                            <TableRow key={row.reportName} className="h-[72px]">
                              <TableCell className="px-4 text-sm text-foreground">{row.reportName}</TableCell>
                              <TableCell className="px-4 text-sm text-foreground">{row.createdOn}</TableCell>
                              <TableCell className="px-4 text-sm text-foreground">{row.dateRange}</TableCell>
                              <TableCell className="px-4 text-sm text-foreground">
                                <StatusPill label={row.refundStatus} tone={toReportTone(row.refundStatus)} />
                              </TableCell>
                              <TableCell className="px-4 text-sm text-foreground">{row.action}</TableCell>
                            </TableRow>
                          ))
                        : scheduleFiltered.map((row) => (
                            <TableRow key={row.name} className="h-[72px]">
                              <TableCell className="px-4 text-sm text-foreground">{row.name}</TableCell>
                              <TableCell className="px-4 text-sm text-foreground">{row.frequency}</TableCell>
                              <TableCell className="px-4 text-sm text-foreground">{row.format}</TableCell>
                              <TableCell className="px-4 text-sm text-foreground">{row.createdBy}</TableCell>
                              <TableCell className="px-4 text-sm text-foreground">
                                <StatusPill label={row.status} tone={toReportTone(row.status)} />
                              </TableCell>
                              <TableCell className="px-4 text-sm text-foreground">{row.action}</TableCell>
                            </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      <TransactionReportPanel
        open={generatePanel?.kind === "transaction"}
        onOpenChange={(next) => setGeneratePanel(next ? generatePanel : null)}
        reportTitle={generatePanel?.kind === "transaction" ? generatePanel.title : ""}
      />

      <SettlementReportPanel
        open={generatePanel?.kind === "settlement"}
        onOpenChange={(next) => setGeneratePanel(next ? generatePanel : null)}
        reportTitle={generatePanel?.kind === "settlement" ? generatePanel.title : ""}
      />

      <ScheduleReportPanel open={scheduleOpen} onOpenChange={setScheduleOpen} />
    </div>
  )
}
