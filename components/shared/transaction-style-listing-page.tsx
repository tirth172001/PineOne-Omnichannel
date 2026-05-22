"use client"

import type { ReactNode } from "react"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ListingSummaryCards,
  ListingToolbar,
  type ListingFilter,
} from "@/components/shared/listing-page-primitives"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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
  titleToggles,
  subTabs,
  primaryAction,
  search,
  onSearchChange,
  searchPlaceholder,
  filters,
  rightActions,
  summaryCards,
  columns,
  rows,
  emptyText = "No rows found.",
}: {
  title: string
  titleToggles?: ToggleConfig
  subTabs?: SubtabConfig
  primaryAction?: ReactNode
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  filters: ListingFilter[]
  rightActions?: ReactNode
  summaryCards: Array<{ label: string; value: string }>
  columns: Array<ListingColumn<Row>>
  rows: Row[]
  emptyText?: string
}) {
  return (
    <div className="mx-auto w-full max-w-[1512px]">
      <section>
        <div className={subTabs ? "px-8 pt-8 pb-0" : "px-8 pt-8 pb-8"}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-[30px] font-semibold leading-none text-foreground">{title}</h1>

              {titleToggles ? (
                <Tabs value={titleToggles.value} onValueChange={titleToggles.onValueChange}>
                  <TabsList className="rounded-[8px] border border-border/70 bg-[var(--olive-surface-main)] p-1">
                    {titleToggles.items.map((item) => (
                      <TabsTrigger
                        key={item.value}
                        value={item.value}
                        className="rounded-[8px] px-3 py-1.5 text-sm font-medium text-muted-foreground data-active:!rounded-[var(--radius-token-xs)] data-active:!bg-accent-foreground data-active:!text-background"
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
              <TabsList variant="line" className="h-8 gap-6 bg-transparent p-0">
                {subTabs.items.map((item) => (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className="h-8 rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent px-0 py-0 text-sm font-medium text-muted-foreground data-active:!border-x-0 data-active:!border-t-0 data-active:!border-b-2 data-active:!border-primary data-active:!bg-transparent data-active:!text-primary data-active:!shadow-none group-data-[variant=line]/tabs-list:data-active:after:opacity-0"
                  >
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
        <ListingToolbar
          className="px-0 py-0"
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          filters={filters}
          rightActions={rightActions}
        />

        <ListingSummaryCards className="px-0 py-0" cards={summaryCards} />

        <section className="space-y-6">
          <div className="overflow-hidden rounded-[8px] border border-border/60 bg-background">
            <div className="overflow-x-auto">
              <Table className="min-w-[1100px]">
                <TableHeader>
                  <TableRow className="h-10 border-border/60 bg-[var(--surface-header)] hover:bg-[var(--surface-header)] [&>th:first-child]:rounded-tl-[8px] [&>th:last-child]:rounded-tr-[8px]">
                    {columns.map((column) => (
                      <TableHead
                        key={column.key}
                        className={`px-4 text-sm font-medium text-muted-foreground ${column.align === "right" ? "text-right" : ""} ${column.className ?? ""}`}
                      >
                        {column.header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow className="h-[72px] border-border/60 hover:bg-transparent">
                      <TableCell colSpan={columns.length} className="px-4 text-sm text-muted-foreground">
                        {emptyText}
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row, index) => (
                      <TableRow key={row.id ?? index} className="h-[72px] border-border/60 hover:bg-muted/20">
                        {columns.map((column) => (
                          <TableCell
                            key={`${row.id ?? index}-${column.key}`}
                            className={`px-4 text-sm text-foreground ${column.align === "right" ? "text-right" : ""}`}
                          >
                            {column.cell(row)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
