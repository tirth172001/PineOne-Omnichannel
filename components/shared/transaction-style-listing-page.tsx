"use client"

import type { ReactNode } from "react"
import { CaretDoubleLeftIcon, CaretDoubleRightIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LINE_TAB_TRIGGER_CLASSES,
  LINE_TABS_LIST_CLASSES,
  ListingSummaryCards,
  ListingToolbar,
  PAGE_HEADING_CLASSES,
  type ListingFilter,
} from "@/components/shared/listing-page-primitives"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowViewDetailsCell,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type ListingColumn<Row> = {
  key: string
  header: string
  className?: string
  align?: "left" | "right"
  cell: (row: Row) => ReactNode
}

type ToggleConfig = {
  value: string
  onValueChange: (value: string) => void
  items: Array<{ value: string; label: string }>
}

type SubtabConfig = {
  value: string
  onValueChange: (value: string) => void
  items: Array<{ value: string; label: string }>
}

export function TransactionStyleListingPage<Row extends { id?: string }>({
  title,
  subtitle,
  titleToggles,
  subTabs,
  primaryAction,
  search,
  onSearchChange,
  searchPlaceholder,
  filters,
  moreFiltersContent,
  moreFiltersOpen,
  onMoreFiltersOpenChange,
  moreFiltersCount,
  moreFiltersActive,
  rightActions,
  customToolbar,
  summaryCards,
  columns,
  rows,
  onRowClick,
  emptyText = "No rows found.",
  totalRows = 100,
  page = 1,
  totalPages = 10,
  rowsPerPage = "10",
}: {
  title: string
  subtitle?: string
  titleToggles?: ToggleConfig
  subTabs?: SubtabConfig
  primaryAction?: ReactNode
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  filters: ListingFilter[]
  moreFiltersContent?: ReactNode
  moreFiltersOpen?: boolean
  onMoreFiltersOpenChange?: (open: boolean) => void
  moreFiltersCount?: number
  moreFiltersActive?: boolean
  rightActions?: ReactNode
  /** Replaces the built-in search/filters toolbar entirely, for pages whose filter row doesn't fit the generic search+filters shape (e.g. a combined field-selector search). */
  customToolbar?: ReactNode
  summaryCards?: Array<{ label: string; value: string }>
  columns: Array<ListingColumn<Row>>
  rows: Row[]
  /** Makes each row clickable (e.g. opening a detail side panel) — adds cursor-pointer + hover affordance. */
  onRowClick?: (row: Row) => void
  emptyText?: ReactNode
  totalRows?: number
  page?: number
  totalPages?: number
  rowsPerPage?: string
}) {
  return (
    <div className="w-full">
      <section>
        <div className={subTabs ? "px-8 pt-8 pb-0" : "px-8 pt-8 pb-8"}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <h1 className={PAGE_HEADING_CLASSES}>{title}</h1>
                {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
              </div>

              {titleToggles ? (
                <Tabs value={titleToggles.value} onValueChange={titleToggles.onValueChange}>
                  <TabsList className="h-8 rounded-[8px] bg-muted p-1">
                    {titleToggles.items.map((item) => (
                      <TabsTrigger
                        key={item.value}
                        value={item.value}
                        className="h-6 rounded-[6px] border-transparent px-4 py-1 text-sm font-medium text-muted-foreground data-active:!border-transparent data-active:!bg-background data-active:!text-foreground"
                      >
                        {item.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              ) : null}
            </div>

            {primaryAction ? <div className="shrink-0">{primaryAction}</div> : null}
          </div>
        </div>

        {subTabs ? (
          <div className="px-8 pt-8 pb-0">
            <Tabs value={subTabs.value} onValueChange={subTabs.onValueChange}>
              <TabsList variant="line" className={LINE_TABS_LIST_CLASSES}>
                {subTabs.items.map((item) => (
                  <TabsTrigger key={item.value} value={item.value} className={LINE_TAB_TRIGGER_CLASSES}>
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        ) : null}

        <Separator />
      </section>

      <div className="space-y-6 px-8 pt-8 pb-8">
        {customToolbar ?? (
          <ListingToolbar
            className="px-0 py-0"
            search={search}
            onSearchChange={onSearchChange}
            searchPlaceholder={searchPlaceholder}
            filters={filters}
            moreFiltersContent={moreFiltersContent}
            moreFiltersOpen={moreFiltersOpen}
            onMoreFiltersOpenChange={onMoreFiltersOpenChange}
            moreFiltersCount={moreFiltersCount}
            moreFiltersActive={moreFiltersActive}
            rightActions={rightActions}
          />
        )}

        {summaryCards && summaryCards.length > 0 ? (
          <ListingSummaryCards className="px-0 py-0" cards={summaryCards} />
        ) : null}

        <section className="space-y-6">
          <div className="overflow-hidden rounded-[8px] border border-border bg-background">
            <div className="overflow-x-auto">
              <Table className="min-w-[68.75rem]">
                <TableHeader>
                  <TableRow className="h-10 [&>th:first-child]:rounded-tl-[8px] [&>th:last-child]:rounded-tr-[8px]">
                    {columns.map((column) => (
                      <TableHead
                        key={column.key}
                        className={`px-3 text-sm font-medium text-muted-foreground ${column.align === "right" ? "text-right" : ""} ${column.className ?? ""}`}
                      >
                        {column.header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow className={cn(typeof emptyText === "string" ? "h-[4.5rem]" : "h-auto", "hover:bg-transparent")}>
                      <TableCell colSpan={columns.length} className={cn(typeof emptyText === "string" ? "px-4 text-sm text-muted-foreground" : "p-0")}>
                        {emptyText}
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row, index) => (
                      <TableRow
                        key={row.id ?? index}
                        className={cn("h-[4.5rem]", onRowClick ? "group cursor-pointer" : "")}
                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                      >
                        {columns.map((column, columnIndex) => {
                          const isLastColumn = columnIndex === columns.length - 1
                          const cellClassName = `px-3 text-sm text-foreground ${column.align === "right" ? "text-right" : ""}`

                          if (isLastColumn && onRowClick) {
                            return (
                              <TableRowViewDetailsCell
                                key={`${row.id ?? index}-${column.key}`}
                                className={cellClassName}
                                onViewDetails={() => onRowClick(row)}
                              >
                                {column.cell(row)}
                              </TableRowViewDetailsCell>
                            )
                          }

                          return (
                            <TableCell key={`${row.id ?? index}-${column.key}`} className={cellClassName}>
                              {column.cell(row)}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <p className="text-sm text-muted-foreground">Total {totalRows} row(s)</p>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Rows per page</span>
                <Select value={rowsPerPage}>
                  <SelectTrigger className="h-8 w-[70px] rounded-[10px] border-input bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="text-sm font-medium text-foreground">
                Page {page} of {totalPages}
              </p>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-[8px] border-input bg-background opacity-50" disabled>
                  <CaretDoubleLeftIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-[8px] border-input bg-background opacity-50" disabled>
                  <CaretLeftIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-[8px] border-input bg-background">
                  <CaretRightIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-[8px] border-input bg-background">
                  <CaretDoubleRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
