"use client"

import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { CalendarIcon, ClockIcon } from "@phosphor-icons/react"
import type { ListingFilter } from "@/components/shared/listing-page-primitives"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export interface DateRangePreset {
  id: string
  label: string
  /** Computed fresh on click. Omit for a manual/custom preset driven by the calendar. */
  getRange?: () => DateRange
}

export interface DateRangeFilterValue {
  presetId: string
  range?: DateRange
  startTime: string
  endTime: string
}

export function getDefaultDateRangePresets(): DateRangePreset[] {
  return [
    {
      id: "today",
      label: "Today",
      getRange: () => {
        const today = new Date()
        return { from: today, to: today }
      },
    },
    {
      id: "yesterday",
      label: "Yesterday",
      getRange: () => {
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)
        return { from: yesterday, to: yesterday }
      },
    },
    {
      id: "week",
      label: "This week",
      getRange: () => {
        const today = new Date()
        const from = new Date(today)
        from.setDate(today.getDate() - 6)
        return { from, to: today }
      },
    },
    {
      id: "30d",
      label: "Last 30 days",
      getRange: () => {
        const today = new Date()
        const from = new Date(today)
        from.setDate(today.getDate() - 29)
        return { from, to: today }
      },
    },
    { id: "custom", label: "Custom" },
  ]
}

export function formatDateRangeFilterLabel(value: DateRangeFilterValue, presets: DateRangePreset[]) {
  return presets.find((preset) => preset.id === value.presetId)?.label ?? "Custom"
}

function formatDateForInput(date?: Date) {
  if (!date) return ""
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function parseTimeParts(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/)
  if (!match) return { hour: "10", minute: "30", period: "AM" as "AM" | "PM" }
  return { hour: match[1], minute: match[2], period: match[3] as "AM" | "PM" }
}

export function TimeFieldPopover({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { hour, minute, period } = parseTimeParts(value)

  const updateTime = (next: Partial<{ hour: string; minute: string; period: "AM" | "PM" }>) => {
    onChange(`${next.hour ?? hour}:${next.minute ?? minute} ${next.period ?? period}`)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start">
          <ClockIcon className="h-4 w-4" />
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="w-auto p-3">
        <div className="flex items-center gap-2">
          <Select value={hour} onValueChange={(nextHour) => updateTime({ hour: nextHour })}>
            <SelectTrigger className="w-[72px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, idx) => String(idx + 1)).map((hr) => (
                <SelectItem key={hr} value={hr}>
                  {hr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-sm text-muted-foreground">:</span>

          <Select value={minute} onValueChange={(nextMinute) => updateTime({ minute: nextMinute })}>
            <SelectTrigger className="w-[72px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["00", "15", "30", "45"].map((mm) => (
                <SelectItem key={mm} value={mm}>
                  {mm}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={period} onValueChange={(nextPeriod) => updateTime({ period: nextPeriod as "AM" | "PM" })}>
            <SelectTrigger className="w-[76px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export interface DateRangeFilterPanelProps {
  title?: string
  /** @default getDefaultDateRangePresets() */
  presets?: DateRangePreset[]
  value: DateRangeFilterValue
  onChange: (value: DateRangeFilterValue) => void
  /** Shows the start/end time pickers alongside the dates. @default true */
  showTime?: boolean
  onClear?: () => void
  onApply?: () => void
  /** @default 2 */
  numberOfMonths?: number
  className?: string
}

export function DateRangeFilterPanel({
  title = "Date range",
  presets = getDefaultDateRangePresets(),
  value,
  onChange,
  showTime = true,
  onClear,
  onApply,
  numberOfMonths = 2,
  className,
}: DateRangeFilterPanelProps) {
  const [activeField, setActiveField] = useState<"start" | "end">("start")
  const customPresetId = presets.find((preset) => !preset.getRange)?.id ?? "custom"

  function handlePresetClick(preset: DateRangePreset) {
    if (preset.getRange) {
      onChange({ ...value, presetId: preset.id, range: preset.getRange() })
      setActiveField("start")
    } else {
      onChange({ ...value, presetId: preset.id })
    }
  }

  function handleCalendarSelect(selectedDate: Date | undefined) {
    if (!selectedDate) return
    if (activeField === "start") {
      onChange({
        ...value,
        presetId: customPresetId,
        range: {
          from: selectedDate,
          to: value.range?.to && value.range.to >= selectedDate ? value.range.to : selectedDate,
        },
      })
      setActiveField("end")
    } else {
      onChange({
        ...value,
        presetId: customPresetId,
        range: {
          from: value.range?.from && value.range.from <= selectedDate ? value.range.from : selectedDate,
          to: selectedDate,
        },
      })
    }
  }

  return (
    <div className={cn("overflow-hidden rounded-[12px] border border-border bg-popover", className)}>
      <div className="flex items-center justify-between p-3">
        <h3 className="text-[20px] font-semibold leading-7 text-foreground">{title}</h3>
        <div className="flex items-center gap-3">
          {onClear ? (
            <Button variant="link" className="h-auto p-0 text-primary" onClick={onClear}>
              Clear filter
            </Button>
          ) : null}
          {onApply ? <Button onClick={onApply}>Apply</Button> : null}
        </div>
      </div>

      <Separator />

      <div className="grid min-h-0 flex-1 grid-cols-[180px_1fr] gap-3 p-3">
        <div className="space-y-1">
          {presets.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant="ghost"
              className={cn(
                "w-full justify-start",
                value.presetId === preset.id ? "bg-accent text-foreground font-semibold hover:bg-accent" : ""
              )}
              onClick={() => handlePresetClick(preset)}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="flex min-h-0 flex-col gap-3">
          <div className={cn("grid gap-3", showTime ? "md:grid-cols-2" : "grid-cols-2")}>
            <div className="space-y-2">
              <p className="text-base font-semibold text-foreground">
                Start date{showTime ? " & time" : ""}
              </p>
              <div className={cn("grid gap-2", showTime ? "grid-cols-2" : "grid-cols-1")}>
                <Button
                  variant="outline"
                  className={cn("justify-start", activeField === "start" ? "border-ring" : "")}
                  onClick={() => setActiveField("start")}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {formatDateForInput(value.range?.from) || "Select date"}
                </Button>
                {showTime ? (
                  <TimeFieldPopover
                    value={value.startTime}
                    onChange={(startTime) => onChange({ ...value, startTime })}
                  />
                ) : null}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-base font-semibold text-foreground">
                End date{showTime ? " & time" : ""}
              </p>
              <div className={cn("grid gap-2", showTime ? "grid-cols-2" : "grid-cols-1")}>
                <Button
                  variant="outline"
                  className={cn("justify-start", activeField === "end" ? "border-ring" : "")}
                  onClick={() => setActiveField("end")}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {formatDateForInput(value.range?.to) || "Select date"}
                </Button>
                {showTime ? (
                  <TimeFieldPopover value={value.endTime} onChange={(endTime) => onChange({ ...value, endTime })} />
                ) : null}
              </div>
            </div>
          </div>

          <div className="overflow-auto rounded-lg border border-border bg-background p-2">
            <div className="mb-2 inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-foreground">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
              Selecting {activeField === "start" ? "start date" : "end date"}
            </div>
            <Calendar
              mode="single"
              numberOfMonths={numberOfMonths}
              selected={activeField === "start" ? value.range?.from : value.range?.to}
              onSelect={handleCalendarSelect}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export interface UseDateRangeFilterOptions {
  presets?: DateRangePreset[]
  initialPresetId?: string
  showTime?: boolean
  numberOfMonths?: number
}

/**
 * Owns the draft/applied state for a date-range filter and returns a ready-to-use
 * `ListingFilter` entry (icon + label + popover wired to `DateRangeFilterPanel`).
 * Drop the returned `filter` straight into a `ListingToolbar`/`TransactionStyleListingPage`
 * `filters` array instead of hand-rolling date filter state per page.
 */
export function useDateRangeFilter(options?: UseDateRangeFilterOptions) {
  const presets = options?.presets ?? getDefaultDateRangePresets()
  const initialPresetId = options?.initialPresetId ?? presets[0]?.id ?? "today"

  const makeValue = (presetId: string): DateRangeFilterValue => ({
    presetId,
    range: presets.find((preset) => preset.id === presetId)?.getRange?.(),
    startTime: "10:30 AM",
    endTime: "10:30 AM",
  })

  const [open, setOpen] = useState(false)
  const [applied, setApplied] = useState<DateRangeFilterValue>(() => makeValue(initialPresetId))
  const [draft, setDraft] = useState<DateRangeFilterValue>(applied)

  function onOpenChange(nextOpen: boolean) {
    if (nextOpen) setDraft(applied)
    setOpen(nextOpen)
  }

  function apply() {
    setApplied(draft)
    setOpen(false)
  }

  function clear() {
    setDraft(makeValue(initialPresetId))
  }

  const filter: ListingFilter = {
    id: "date",
    type: "button",
    label: "",
    value: formatDateRangeFilterLabel(applied, presets),
    icon: <CalendarIcon className="h-4 w-4" />,
    active: open,
    showCaret: true,
    popoverOpen: open,
    popoverContentClassName: "w-[760px]",
    onPopoverOpenChange: onOpenChange,
    popoverContent: (
      <DateRangeFilterPanel
        presets={presets}
        value={draft}
        onChange={setDraft}
        showTime={options?.showTime}
        numberOfMonths={options?.numberOfMonths}
        onClear={clear}
        onApply={apply}
      />
    ),
  }

  return { applied, draft, open, filter }
}
