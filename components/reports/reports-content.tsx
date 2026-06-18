"use client"

import { useMemo, useState } from "react"
import { Download } from "lucide-react"

import { ListingToolbar, type ListingFilter } from "@/components/shared/listing-page-primitives"
import { StatusPill, type StatusTone } from "@/components/shared/status-pill"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

const reportSections = [
  {
    heading: "Transaction reports",
    cards: [
      { title: "TFR report", description: "Transaction fee reports" },
      { title: "CFR report", description: "Customer feedback reports" },
    ],
  },
  {
    heading: "Settlement reports",
    cards: [
      { title: "MPR report", description: "Merchant payout reports" },
      { title: "SRR report", description: "Settlement reconciliation reports" },
      { title: "FCR report", description: "Fraud check reports" },
      { title: "DPR report", description: "Dispute payment reports" },
    ],
  },
  {
    heading: "Refund reports",
    cards: [
      { title: "RFR report", description: "Refund request reports" },
      { title: "RPR report", description: "Refund processing reports" },
      { title: "RCR report", description: "Refund completion reports" },
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
  const [dateFilter, setDateFilter] = useState("7d")
  const [statusFilter, setStatusFilter] = useState("all")

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
    {
      id: "date",
      type: "select",
      label: "Date",
      value: dateFilter,
      onValueChange: setDateFilter,
      options: [
        { label: "Today", value: "today" },
        { label: "Last 7D", value: "7d" },
        { label: "Last 30D", value: "30d" },
      ],
    },
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
    {
      id: "more",
      type: "button",
      label: "More filters",
      value: "",
      showCaret: true,
    },
  ]

  return (
    <div className="mx-auto w-full max-w-[1512px]">
      <section>
        <div className="px-8 pt-8 pb-0">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-[30px] font-semibold leading-none text-foreground">Reports</h1>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">
                Schedule report
              </Button>
              <Button className="rounded-[8px] border border-primary/60 bg-primary text-primary-foreground hover:bg-primary/90">
                Generate report
              </Button>
            </div>
          </div>
        </div>

        <div className="px-8 pt-8 pb-0">
          <Tabs value={topTab} onValueChange={(value) => setTopTab(value as "reports" | "history" | "schedule")}>
            <TabsList variant="line" className="h-8 gap-6 bg-transparent p-0">
              <TabsTrigger
                value="reports"
                className="h-8 rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent px-0 py-0 text-sm font-medium text-muted-foreground data-active:!border-x-0 data-active:!border-t-0 data-active:!border-b-2 data-active:!border-primary data-active:!bg-transparent data-active:!text-primary data-active:!shadow-none group-data-[variant=line]/tabs-list:data-active:after:opacity-0"
              >
                Reports
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="h-8 rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent px-0 py-0 text-sm font-medium text-muted-foreground data-active:!border-x-0 data-active:!border-t-0 data-active:!border-b-2 data-active:!border-primary data-active:!bg-transparent data-active:!text-primary data-active:!shadow-none group-data-[variant=line]/tabs-list:data-active:after:opacity-0"
              >
                History
              </TabsTrigger>
              <TabsTrigger
                value="schedule"
                className="h-8 rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent px-0 py-0 text-sm font-medium text-muted-foreground data-active:!border-x-0 data-active:!border-t-0 data-active:!border-b-2 data-active:!border-primary data-active:!bg-transparent data-active:!text-primary data-active:!shadow-none group-data-[variant=line]/tabs-list:data-active:after:opacity-0"
              >
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
                      <CardHeader className="space-y-1 p-0">
                        <CardTitle className="text-base font-semibold text-foreground">{card.title}</CardTitle>
                        <CardDescription className="text-sm font-normal text-muted-foreground">
                          {card.description}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="border-t-0 bg-transparent px-0 pt-4 pb-3">
                        <Button variant="outline" className="w-full">
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
              rightActions={
                <>
                  <Button variant="outline" className="rounded-[8px] border-border/70 bg-background">
                    <Download className="h-4 w-4" />
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
    </div>
  )
}
