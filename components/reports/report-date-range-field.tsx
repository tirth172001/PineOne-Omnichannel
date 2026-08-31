"use client"

import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { CalendarIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

/** Bordered field + popover calendar for picking a report's date range — mirrors the
 *  Figma "Select date range for report" field (calendar icon, "D MMM YYYY to D MMM YYYY"). */
export function ReportDateRangeField({
  value,
  onChange,
}: {
  value?: DateRange
  onChange: (range: DateRange | undefined) => void
}) {
  const [open, setOpen] = useState(false)

  const label = value?.from
    ? value.to && value.to.getTime() !== value.from.getTime()
      ? `${formatDate(value.from)} to ${formatDate(value.to)}`
      : formatDate(value.from)
    : "Select the duration"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full justify-start gap-2 font-normal text-foreground"
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className={value?.from ? "text-foreground" : "text-muted-foreground"}>{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="range" numberOfMonths={2} selected={value} onSelect={onChange} />
        <div className="flex justify-end border-t border-border p-2">
          <Button size="sm" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
