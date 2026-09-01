"use client"

import { CaretDownIcon, MagnifyingGlassIcon } from "@phosphor-icons/react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type ToggleItem = {
  label: string
  value: string
}

type FilterOption = {
  label: string
  value: string
}

/** Canonical page-title style, shared by every top-level module (Reports, Refunds, Disputes, Payments, Settlements, Checkout, Settings screens, ...). */
export const PAGE_HEADING_CLASSES = "font-heading text-2xl font-light leading-8 tracking-[-0.4px] text-foreground"

/** Wrapper for the underline-style ("line") tab row used for a page's primary content tabs (e.g. Reports/History/Schedule). */
export const LINE_TABS_LIST_CLASSES = "h-8 gap-6 bg-transparent p-0"

/** Trigger style for the underline-style ("line") tabs — pair with `variant="line"` on TabsList and LINE_TABS_LIST_CLASSES. */
export const LINE_TAB_TRIGGER_CLASSES =
  "h-8 rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent px-0 py-0 text-sm font-medium text-muted-foreground data-active:!border-x-0 data-active:!border-t-0 data-active:!border-b-2 data-active:!border-primary data-active:!bg-transparent data-active:!text-primary data-active:!shadow-none group-data-[variant=line]/tabs-list:data-active:after:opacity-0"

export type ListingFilter = {
  id: string
  type: "select" | "button"
  label: string
  value: string
  options?: FilterOption[]
  onValueChange?: (value: string) => void
  onClick?: () => void
  icon?: ReactNode
  popoverContent?: ReactNode
  popoverOpen?: boolean
  onPopoverOpenChange?: (open: boolean) => void
  popoverContentClassName?: string
  active?: boolean
  showCaret?: boolean
}

export function ListingPageHeader({
  title,
  toggles,
  activeToggle,
  onToggleChange,
  primaryAction,
  tabs,
}: {
  title: string
  toggles: ToggleItem[]
  activeToggle: string
  onToggleChange: (value: string) => void
  primaryAction?: ReactNode
  tabs?: ReactNode
}) {
  return (
    <section>
      <div className={cn("px-8 pt-8", tabs ? "pb-0" : "pb-8")}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className={PAGE_HEADING_CLASSES}>{title}</h1>
              <Tabs value={activeToggle} onValueChange={onToggleChange}>
                <TabsList className="h-8 rounded-[8px] bg-muted p-1">
                  {toggles.map((toggle) => (
                    <TabsTrigger
                      key={toggle.value}
                      value={toggle.value}
                      className="h-6 rounded-[6px] border-transparent px-4 py-1 text-sm font-medium text-muted-foreground data-active:!border-transparent data-active:!bg-background data-active:!text-foreground"
                    >
                      {toggle.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          {primaryAction ? <div className="shrink-0">{primaryAction}</div> : null}
        </div>
      </div>

      {tabs ? <div className="px-8 pt-8 pb-0">{tabs}</div> : null}
      <Separator />
    </section>
  )
}

export const FILTER_BUTTON_FOCUS_CLASSES =
  "aria-expanded:border-ring aria-expanded:bg-accent aria-expanded:text-accent-foreground"
export const FILTER_BUTTON_CARET_CLASSES =
  "size-4 text-muted-foreground transition-transform duration-200 group-aria-expanded/button:rotate-180"

function FilterControl({ filter }: { filter: ListingFilter }) {
  if (filter.type === "select") {
    const options = filter.options ?? []
    const selectedLabel = options.find((option) => option.value === filter.value)?.label ?? filter.label

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-8 gap-1.5 rounded-[8px] border-input bg-background text-sm font-medium",
              FILTER_BUTTON_FOCUS_CLASSES
            )}
          >
            {filter.icon}
            {selectedLabel}
            <CaretDownIcon className={FILTER_BUTTON_CARET_CLASSES} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={filter.value} onValueChange={filter.onValueChange}>
            {options.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const buttonControl = (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "h-8 rounded-[8px] border-input bg-background text-sm",
        FILTER_BUTTON_FOCUS_CLASSES,
        filter.active ? "bg-accent text-accent-foreground" : ""
      )}
      onClick={filter.onClick}
    >
      {filter.icon}
      {filter.label}
      <span className="text-foreground">{filter.value}</span>
      {filter.showCaret ? <CaretDownIcon className={FILTER_BUTTON_CARET_CLASSES} /> : null}
    </Button>
  )

  if (filter.popoverContent) {
    return (
      <Popover open={filter.popoverOpen} onOpenChange={filter.onPopoverOpenChange}>
        <PopoverTrigger asChild>{buttonControl}</PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={10}
          className={cn(
            "w-[820px] gap-0 border-0 p-0 shadow-none ring-0",
            filter.popoverContentClassName
          )}
        >
          {filter.popoverContent}
        </PopoverContent>
      </Popover>
    )
  }

  return buttonControl
}

export function ListingToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filters,
  onMoreFilters,
  moreFiltersCount,
  moreFiltersOpen,
  onMoreFiltersOpenChange,
  moreFiltersContent,
  moreFiltersActive,
  rightActions,
  className,
}: {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  filters: ListingFilter[]
  onMoreFilters?: () => void
  moreFiltersCount?: number
  moreFiltersOpen?: boolean
  onMoreFiltersOpenChange?: (open: boolean) => void
  moreFiltersContent?: ReactNode
  moreFiltersActive?: boolean
  rightActions?: ReactNode
  className?: string
}) {
  const showInlineFilters = filters.length <= 3
  const inlineFilters = showInlineFilters ? filters : filters.slice(0, 2)
  const extraFilterCount = showInlineFilters ? 0 : filters.length - inlineFilters.length
  const displayMoreFiltersCount = moreFiltersCount ?? extraFilterCount
  const showMoreFiltersButton = !showInlineFilters || Boolean(moreFiltersContent) || Boolean(onMoreFilters)

  const moreFiltersButton = (
    <Button
      type="button"
      variant="outline"
      className={cn("h-8 shrink-0 rounded-[8px] border-input bg-background text-sm", FILTER_BUTTON_FOCUS_CLASSES)}
      onClick={moreFiltersContent ? undefined : onMoreFilters}
    >
      More filters
      {displayMoreFiltersCount > 0 ? (
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-muted px-1.5 text-sm text-muted-foreground">
          {displayMoreFiltersCount}
        </span>
      ) : null}
      <CaretDownIcon className={FILTER_BUTTON_CARET_CLASSES} />
    </Button>
  )

  return (
    <section className={cn("px-8 py-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex max-w-full flex-nowrap items-center gap-3">
          <div className="relative w-[14.3125rem] shrink-0">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 rounded-[8px] border-input bg-background pl-10 text-sm"
            />
          </div>

          <Separator orientation="vertical" className="h-8" />

          {inlineFilters.map((filter) => (
            <FilterControl key={filter.id} filter={filter} />
          ))}

          {showMoreFiltersButton ? (
            moreFiltersContent ? (
              <Popover open={moreFiltersOpen} onOpenChange={onMoreFiltersOpenChange}>
                <PopoverTrigger asChild>{moreFiltersButton}</PopoverTrigger>
                <PopoverContent
                  align="start"
                  sideOffset={10}
                  className="w-[820px] gap-0 border-0 p-0 shadow-none ring-0"
                >
                  {moreFiltersContent}
                </PopoverContent>
              </Popover>
            ) : (
              moreFiltersButton
            )
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">{rightActions}</div>
      </div>
    </section>
  )
}

export function ListingSummaryCards({
  cards,
  className,
}: {
  cards: Array<{ label: string; value: string }>
  className?: string
}) {
  return (
    <section className={cn("px-8 py-4", className)}>
      <div className="rounded-[8px] border border-border bg-card">
      <div className={cn("grid", cards.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
        {cards.map((card, index) => (
          <div
            key={card.label}
            className={cn(
              "h-[4.75rem] px-4 pt-3 pb-3",
              index > 0 ? "border-l border-border" : "border-l-0"
            )}
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-xl font-semibold leading-7 text-foreground">{card.value}</p>
          </div>
        ))}
      </div>
      </div>
    </section>
  )
}
