"use client"

import {
  ArrowsDownUpIcon,
  CaretDownIcon,
  ColumnsIcon,
  DownloadIcon,
} from "@phosphor-icons/react"
import type { useDateRangeFilter } from "@/components/shared/date-range-filter"
import {
  FILTER_BUTTON_CARET_CLASSES,
  FILTER_BUTTON_FOCUS_CLASSES,
} from "@/components/shared/listing-page-primitives"
import type { useMoreFiltersPanel } from "@/components/shared/more-filters-panel"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type StatusFilter = "all" | "expired" | "success" | "initiated" | "failed"
export type SortDirection = "asc" | "desc"
export type ColumnKey = "creationDate" | "paymentLink" | "transactionId" | "amount" | "expiryDate" | "status"

export const PAYMENT_LINK_COLUMNS: Array<[ColumnKey, string]> = [
  ["creationDate", "Creation date"],
  ["paymentLink", "Payment link"],
  ["transactionId", "Transaction ID"],
  ["amount", "Amount"],
  ["expiryDate", "Expiry date"],
  ["status", "Status"],
]

export interface PaymentLinksFiltersBarProps {
  statusFilter: StatusFilter
  onStatusFilterChange: (value: StatusFilter) => void
  dateRangeFilter: ReturnType<typeof useDateRangeFilter>
  moreFilters: ReturnType<typeof useMoreFiltersPanel>
  sortDirection: SortDirection
  onToggleSort: () => void
  visibleColumns: Record<ColumnKey, boolean>
  onVisibleColumnsChange: (columns: Record<ColumnKey, boolean>) => void
  onExportAll: () => void
}

export function PaymentLinksFiltersBar({
  statusFilter,
  onStatusFilterChange,
  dateRangeFilter,
  moreFilters,
  sortDirection,
  onToggleSort,
  visibleColumns,
  onVisibleColumnsChange,
  onExportAll,
}: PaymentLinksFiltersBarProps) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn("h-8 gap-1.5 rounded-md px-2.5 text-sm font-medium", FILTER_BUTTON_FOCUS_CLASSES)}
            >
              {statusFilter === "all" ? "All status" : statusFilter[0].toUpperCase() + statusFilter.slice(1)}
              <CaretDownIcon className={FILTER_BUTTON_CARET_CLASSES} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as StatusFilter)}>
              <DropdownMenuRadioItem value="all">All status</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="expired">Expired</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="success">Success</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="initiated">Initiated</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="failed">Failed</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover open={dateRangeFilter.filter.popoverOpen} onOpenChange={dateRangeFilter.filter.onPopoverOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("h-8 gap-1.5 rounded-md px-2.5 text-sm font-medium", FILTER_BUTTON_FOCUS_CLASSES)}
            >
              {dateRangeFilter.filter.icon}
              {dateRangeFilter.filter.value}
              <CaretDownIcon className={FILTER_BUTTON_CARET_CLASSES} />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={10} className="w-[760px] gap-0 border-0 p-0 shadow-none ring-0">
            {dateRangeFilter.filter.popoverContent}
          </PopoverContent>
        </Popover>

        <Popover open={moreFilters.toolbarProps.moreFiltersOpen} onOpenChange={moreFilters.toolbarProps.onMoreFiltersOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("h-8 gap-1.5 rounded-md px-2.5 text-sm font-medium", FILTER_BUTTON_FOCUS_CLASSES)}
            >
              More filters
              {moreFilters.toolbarProps.moreFiltersCount > 0 ? (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-muted px-1 text-xs text-muted-foreground">
                  {moreFilters.toolbarProps.moreFiltersCount}
                </span>
              ) : null}
              <CaretDownIcon className={FILTER_BUTTON_CARET_CLASSES} />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={10} className="w-[820px] gap-0 border-0 p-0 shadow-none ring-0">
            {moreFilters.toolbarProps.moreFiltersContent}
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-[51px] rounded-md"
          onClick={onToggleSort}
          aria-label="Sort rows"
        >
          <ArrowsDownUpIcon className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="h-8 w-[51px] rounded-md" aria-label="Select columns">
              <ColumnsIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PAYMENT_LINK_COLUMNS.map(([key, label]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={visibleColumns[key]}
                onCheckedChange={(checked) => {
                  const next = { ...visibleColumns, [key]: checked === true }
                  const visibleCount = Object.values(next).filter(Boolean).length
                  if (visibleCount > 0) onVisibleColumnsChange(next)
                }}
                onSelect={(event) => event.preventDefault()}
              >
                {label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border/70" />
        <Button variant="ghost" className="h-8 gap-1.5 rounded-md px-2.5 text-sm font-medium" onClick={onExportAll}>
          <DownloadIcon className="h-4 w-4" />
          Export all
        </Button>
      </div>
    </div>
  )
}
