"use client"

import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ReportDateRangeField } from "@/components/reports/report-date-range-field"

export function SettlementReportPanel({
  open,
  onOpenChange,
  reportTitle,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportTitle: string
}) {
  const [reportName, setReportName] = useState(reportTitle)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  function handleGenerate() {
    onOpenChange(false)
    toast.success(`${reportName || reportTitle} is being generated — you'll find it under History shortly.`)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (next) setReportName(reportTitle)
      }}
    >
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-base font-medium text-foreground">{reportTitle}</SheetTitle>
          <SheetDescription className="sr-only">Configure and generate this report.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div className="space-y-2">
            <Label>Save report as</Label>
            <Input value={reportName} onChange={(event) => setReportName(event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Select date range for report</Label>
            <ReportDateRangeField value={dateRange} onChange={setDateRange} />
          </div>
        </div>

        <SheetFooter className="border-t border-border/70">
          <Button onClick={handleGenerate} disabled={!reportName.trim()} className="w-full sm:w-auto">
            Generate report
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
