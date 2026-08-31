"use client"

import { CalendarIcon, CaretDownIcon } from "@phosphor-icons/react"
import { TimeFieldPopover } from "@/components/shared/date-range-filter"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export interface DateTimeValue {
  date: Date | undefined
  time: string
}

export function formatDateTimeLabel(value: DateTimeValue) {
  if (!value.date) return ""
  const day = value.date.getDate()
  const month = value.date.toLocaleDateString("en-US", { month: "short" })
  const year = value.date.getFullYear()
  return `${day} ${month}, ${year} • ${value.time}`
}

export interface DateTimePickerProps {
  value: DateTimeValue
  onChange: (value: DateTimeValue) => void
  placeholder?: string
  disabled?: (date: Date) => boolean
  className?: string
}

/** Single date + time selector (calendar + hour/minute/AM-PM), for fields like "Link expiry date". For a start/end date range, use `DateRangeFilterPanel` instead. */
export function DateTimePicker({ value, onChange, placeholder = "Select date", disabled, className }: DateTimePickerProps) {
  const label = formatDateTimeLabel(value) || placeholder

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("w-full justify-between gap-1.5 font-normal", className)}
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{label}</span>
          </span>
          <CaretDownIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="w-auto space-y-3 p-3">
        <Calendar
          mode="single"
          selected={value.date}
          onSelect={(date) => date && onChange({ ...value, date })}
          disabled={disabled}
        />
        <Separator />
        <div className="flex items-center justify-between gap-3 px-1 pb-1">
          <span className="text-sm font-medium text-foreground">Time</span>
          <TimeFieldPopover value={value.time} onChange={(time) => onChange({ ...value, time })} />
        </div>
      </PopoverContent>
    </Popover>
  )
}
