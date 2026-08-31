"use client"

import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { CaretDownIcon, MagnifyingGlassIcon } from "@phosphor-icons/react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ReportDateRangeField } from "@/components/reports/report-date-range-field"
import { cn } from "@/lib/utils"

type FilterField = { id: string; label: string; options: string[] }

const FILTER_FIELDS: FilterField[] = [
  { id: "zones", label: "Select zones", options: ["North", "South", "East", "West"] },
  { id: "paymentMode", label: "Select payment mode", options: ["UPI", "Card", "Net banking"] },
  { id: "issuers", label: "Select issuers", options: ["HDFC", "ICICI", "Axis", "SBI"] },
  { id: "transactionType", label: "Select transaction type", options: ["Sale", "Refund", "Void"] },
  { id: "batchStatus", label: "Select batch status", options: ["Open", "Closed"] },
  { id: "transactionStatus", label: "Select transaction status", options: ["Success", "Failed", "Pending"] },
  { id: "dcc", label: "DCC transactions", options: ["Yes", "No"] },
  { id: "nfc", label: "NFC report", options: ["Yes", "No"] },
  { id: "states", label: "Select states", options: ["Delhi", "Maharashtra", "Karnataka", "Uttar Pradesh"] },
]

const REPORT_COLUMNS = [
  "Zone",
  "Store name",
  "City",
  "POS",
  "Hardware model",
  "Hardware ID",
  "Acquirer",
  "TID",
  "MID",
  "Batch no",
  "Payment mode",
  "Customer payment mode ID",
  "Name",
  "Card issuer",
  "Card type",
  "Card network",
  "Card colour",
  "Transaction ID",
  "Invoice",
  "Approval code",
  "Type",
  "Amount",
  "TIP amount",
  "Currency",
  "Date",
  "Batch status",
  "Txn status",
  "Settlement date",
  "Bill invoice",
  "RRN",
  "EMI txn",
  "EMI month",
  "Contact less",
  "Acquirer response code",
]

const DEFAULT_UNCHECKED_COLUMNS = new Set(["Acquirer response code"])

export function TransactionReportPanel({
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
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [columnSearch, setColumnSearch] = useState("")
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    () => new Set(REPORT_COLUMNS.filter((column) => !DEFAULT_UNCHECKED_COLUMNS.has(column)))
  )

  const filteredColumns = REPORT_COLUMNS.filter((column) =>
    column.toLowerCase().includes(columnSearch.trim().toLowerCase())
  )
  const allSelected = selectedColumns.size === REPORT_COLUMNS.length

  function toggleColumn(column: string, checked: boolean) {
    setSelectedColumns((current) => {
      const next = new Set(current)
      if (checked) next.add(column)
      else next.delete(column)
      return next
    })
  }

  function toggleSelectAll() {
    setSelectedColumns(allSelected ? new Set() : new Set(REPORT_COLUMNS))
  }

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
          <SheetDescription className="sr-only">Configure and generate this transaction report.</SheetDescription>
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

          <div className="h-px w-full bg-border/70" />

          <Collapsible defaultOpen>
            <CollapsibleTrigger className="group flex w-full items-center justify-between text-sm font-semibold text-foreground">
              Select filters
              <CaretDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              {FILTER_FIELDS.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label className="text-sm font-normal text-muted-foreground">{field.label}</Label>
                  <Select
                    value={filterValues[field.id] ?? "all"}
                    onValueChange={(value) => setFilterValues((current) => ({ ...current, [field.id]: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All {field.label.replace(/^Select /, "").toLowerCase()}</SelectItem>
                      {field.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <div className="h-px w-full bg-border/70" />

          <Collapsible defaultOpen>
            <CollapsibleTrigger className="group flex w-full items-center justify-between text-sm font-semibold text-foreground">
              <span className="flex items-center gap-2">
                Select report columns
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  {selectedColumns.size} columns
                </Badge>
              </span>
              <CaretDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={columnSearch}
                    onChange={(event) => setColumnSearch(event.target.value)}
                    placeholder="Search column"
                    className="h-9 pl-8 text-sm"
                  />
                </div>
                <Button type="button" variant="ghost" size="sm" className="shrink-0 text-primary" onClick={toggleSelectAll}>
                  {allSelected ? "Clear all" : "Select all"}
                </Button>
              </div>

              <div className="max-h-80 overflow-y-auto rounded-lg border border-border/70">
                {filteredColumns.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-muted-foreground">No columns match your search.</p>
                ) : (
                  filteredColumns.map((column, index) => (
                    <label
                      key={column}
                      className={cn(
                        "flex h-9 cursor-pointer items-center justify-between px-3 text-sm text-foreground",
                        index !== 0 && "border-t border-border/70"
                      )}
                    >
                      <span className="truncate">{column}</span>
                      <Checkbox
                        checked={selectedColumns.has(column)}
                        onCheckedChange={(checked) => toggleColumn(column, checked === true)}
                      />
                    </label>
                  ))
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
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
