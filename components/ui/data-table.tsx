"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ArrowsDownUpIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ColumnsIcon,
  DotsSixVerticalIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PushPinIcon,
  PushPinSlashIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useIsMobile } from "@/components/ui/use-mobile"
import { cn } from "@/lib/utils"

const MIN_PAGINATION_ROW_COUNT = 10

export type DataTableFilterOption = {
  label: string
  value: string
}

export type DataTableColumn<T> = {
  id: string
  header: string
  accessorKey?: keyof T & string
  cell?: (row: T) => React.ReactNode
  getValue?: (row: T) => unknown
  getSearchValue?: (row: T) => string
  getFilterValue?: (row: T) => string
  filterOptions?: DataTableFilterOption[]
  searchable?: boolean
  hideable?: boolean
  draggable?: boolean
  pinnable?: boolean
  width?: number | string
  align?: "left" | "center" | "right"
  className?: string
}

type DataTableProps<T> = {
  data: T[]
  columns: DataTableColumn<T>[]
  rowId: (row: T) => string
  selectedRowId?: string | null
  onRowClick?: (row: T) => void
  emptyText?: string
  searchPlaceholder?: string
  showSearch?: boolean
  footerActions?: React.ReactNode
  className?: string
  tableClassName?: string
  initialPinnedColumnIds?: string[]
  initialVisibleColumnIds?: string[]
  statusColumnId?: string
  statusOptions?: DataTableFilterOption[]
  statusPrimaryOptions?: DataTableFilterOption[]
  statusOverflowOptions?: DataTableFilterOption[]
  statusValue?: string
  onStatusChange?: (value: string) => void
  includeAllStatusOption?: boolean
  statusAsViewOnly?: boolean
  rowsPerPageOptions?: number[]
  defaultRowsPerPage?: number
}

function valueToText(value: unknown) {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value
  if (typeof value === "number") return value.toString()
  if (typeof value === "boolean") return value ? "true" : "false"
  return ""
}

function compareValues(a: unknown, b: unknown) {
  if (typeof a === "number" && typeof b === "number") return a - b
  return valueToText(a).localeCompare(valueToText(b), undefined, { numeric: true, sensitivity: "base" })
}

export function DataTable<T>({
  data,
  columns,
  rowId,
  selectedRowId,
  onRowClick,
  emptyText = "No records found",
  searchPlaceholder = "Search...",
  showSearch = true,
  footerActions,
  className,
  tableClassName,
  initialPinnedColumnIds,
  initialVisibleColumnIds,
  statusColumnId,
  statusOptions,
  statusPrimaryOptions,
  statusOverflowOptions,
  statusValue,
  onStatusChange,
  includeAllStatusOption = true,
  statusAsViewOnly = false,
  rowsPerPageOptions = [MIN_PAGINATION_ROW_COUNT, 25, 50],
  defaultRowsPerPage = MIN_PAGINATION_ROW_COUNT,
}: DataTableProps<T>) {
  const isMobile = useIsMobile()
  const allIds = useMemo(() => columns.map((column) => column.id), [columns])
  const columnById = useMemo(
    () => Object.fromEntries(columns.map((column) => [column.id, column])) as Record<string, DataTableColumn<T>>,
    [columns]
  )

  const [query, setQuery] = useState("")
  const [columnOrder, setColumnOrder] = useState<string[]>(allIds)
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null)
  const [pinnedColumnIds, setPinnedColumnIds] = useState<string[]>(
    (initialPinnedColumnIds ?? []).filter((id) => allIds.includes(id))
  )
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(
    (initialVisibleColumnIds ?? allIds).filter((id) => allIds.includes(id))
  )
  const [filters, setFilters] = useState<Record<string, string>>(
    Object.fromEntries(
      columns
        .filter((column) => column.filterOptions && column.filterOptions.length > 0)
        .map((column) => [column.id, "all"])
    )
  )
  const [internalStatusValue, setInternalStatusValue] = useState("all")
  const [sortColumnId, setSortColumnId] = useState<string>("none")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage)
  const [page, setPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [mobileSortOpen, setMobileSortOpen] = useState(false)
  const [mobileColumnsOpen, setMobileColumnsOpen] = useState(false)

  const orderedIds = useMemo(() => {
    const unique = Array.from(new Set(columnOrder.filter((id) => allIds.includes(id))))
    const missing = allIds.filter((id) => !unique.includes(id))
    return [...unique, ...missing]
  }, [allIds, columnOrder])

  const visibleOrderedColumns = useMemo(() => {
    const pinned = orderedIds.filter((id) => pinnedColumnIds.includes(id) && visibleColumnIds.includes(id))
    const unpinned = orderedIds.filter((id) => !pinnedColumnIds.includes(id) && visibleColumnIds.includes(id))
    return [...pinned, ...unpinned].map((id) => columnById[id]).filter(Boolean)
  }, [orderedIds, pinnedColumnIds, visibleColumnIds, columnById])

  const searchableColumns = useMemo(
    () => visibleOrderedColumns.filter((column) => column.searchable !== false),
    [visibleOrderedColumns]
  )

  const filterableColumns = useMemo(
    () => columns.filter((column) => (column.filterOptions?.length ?? 0) > 0),
    [columns]
  )

  const resolvedStatusColumnId = useMemo(() => {
    if (statusAsViewOnly) return undefined
    if (statusColumnId && columnById[statusColumnId]) return statusColumnId
    const derived = filterableColumns.find((column) =>
      /status|state/i.test(`${column.id} ${column.header}`)
    )
    return derived?.id
  }, [statusAsViewOnly, statusColumnId, columnById, filterableColumns])

  const resolvedStatusOptions = useMemo(() => {
    if (statusOptions?.length) {
      const hasAll = statusOptions.some((opt) => opt.value === "all")
      if (!includeAllStatusOption) {
        return statusOptions.filter((opt) => opt.value !== "all")
      }
      return hasAll ? statusOptions : [{ label: "All", value: "all" }, ...statusOptions]
    }
    if (!resolvedStatusColumnId) return []
    const column = columnById[resolvedStatusColumnId]
    const options = column?.filterOptions ?? []
    return includeAllStatusOption ? [{ label: "All", value: "all" }, ...options] : options
  }, [statusOptions, resolvedStatusColumnId, columnById, includeAllStatusOption])

  const visibleStatusPrimaryOptions = useMemo(() => {
    if (statusPrimaryOptions?.length) return statusPrimaryOptions
    return resolvedStatusOptions
  }, [resolvedStatusOptions, statusPrimaryOptions])

  const visibleStatusOverflowOptions = useMemo(() => {
    return statusOverflowOptions ?? []
  }, [statusOverflowOptions])

  const allVisibleStatusOptions = useMemo(() => {
    const merged = [...visibleStatusPrimaryOptions, ...visibleStatusOverflowOptions]
    const map = new Map<string, DataTableFilterOption>()
    merged.forEach((option) => {
      if (!map.has(option.value)) map.set(option.value, option)
    })
    return Array.from(map.values())
  }, [visibleStatusOverflowOptions, visibleStatusPrimaryOptions])

  const activeStatusValue = statusValue ?? internalStatusValue
  const secondaryFilterColumns = useMemo(
    () => filterableColumns.filter((column) => column.id !== resolvedStatusColumnId),
    [filterableColumns, resolvedStatusColumnId]
  )
  const activeSecondaryFilterCount = useMemo(
    () =>
      secondaryFilterColumns.filter((column) => {
        const value = filters[column.id]
        return Boolean(value && value !== "all")
      }).length,
    [filters, secondaryFilterColumns]
  )
  const defaultSortColumnId = useMemo(
    () => visibleOrderedColumns.find((column) => column.id)?.id ?? columns[0]?.id ?? "none",
    [columns, visibleOrderedColumns]
  )
  const activeSortLabel = sortColumnId === "none" ? null : columnById[sortColumnId]?.header ?? null

  useEffect(() => {
    if (allVisibleStatusOptions.length === 0) return
    if (!allVisibleStatusOptions.some((option) => option.value === activeStatusValue)) {
      if (statusValue === undefined) setInternalStatusValue("all")
      onStatusChange?.("all")
    }
  }, [activeStatusValue, allVisibleStatusOptions, onStatusChange, statusValue])

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return data.filter((row) => {
      if (resolvedStatusColumnId && activeStatusValue !== "all") {
        const statusColumn = columnById[resolvedStatusColumnId]
        if (statusColumn) {
          const statusText =
            statusColumn.getFilterValue?.(row) ??
            valueToText(
              statusColumn.getValue?.(row) ??
                (statusColumn.accessorKey ? (row as Record<string, unknown>)[statusColumn.accessorKey] : "")
            )
          if (statusText.toLowerCase() !== activeStatusValue.toLowerCase()) return false
        }
      }

      const matchesQuery =
        normalizedQuery.length === 0 ||
        searchableColumns.some((column) => {
          const value =
            column.getSearchValue?.(row) ??
            valueToText(
              column.getValue?.(row) ??
                (column.accessorKey ? (row as Record<string, unknown>)[column.accessorKey] : "")
            )
          return value.toLowerCase().includes(normalizedQuery)
        })
      if (!matchesQuery) return false

      return Object.entries(filters)
        .filter(([columnId]) => columnId !== resolvedStatusColumnId)
        .every(([columnId, expectedValue]) => {
          if (!expectedValue || expectedValue === "all") return true
          const column = columnById[columnId]
          if (!column) return true
          const actual =
            column.getFilterValue?.(row) ??
            valueToText(
              column.getValue?.(row) ??
                (column.accessorKey ? (row as Record<string, unknown>)[column.accessorKey] : "")
            )
          return actual.toLowerCase() === expectedValue.toLowerCase()
        })
    })
  }, [activeStatusValue, columnById, data, filters, query, resolvedStatusColumnId, searchableColumns])

  const sortedRows = useMemo(() => {
    if (!sortColumnId || sortColumnId === "none") return filteredRows
    const sortColumn = columnById[sortColumnId]
    if (!sortColumn) return filteredRows
    const multiplier = sortDirection === "asc" ? 1 : -1

    return [...filteredRows].sort((rowA, rowB) => {
      const a = sortColumn.getValue?.(rowA) ?? (sortColumn.accessorKey ? (rowA as Record<string, unknown>)[sortColumn.accessorKey] : "")
      const b = sortColumn.getValue?.(rowB) ?? (sortColumn.accessorKey ? (rowB as Record<string, unknown>)[sortColumn.accessorKey] : "")
      return compareValues(a, b) * multiplier
    })
  }, [columnById, filteredRows, sortColumnId, sortDirection])

  const totalRows = sortedRows.length
  const shouldShowPaginationFooter = totalRows > MIN_PAGINATION_ROW_COUNT
  const effectiveRowsPerPage = shouldShowPaginationFooter ? rowsPerPage : Math.max(totalRows, 1)
  const totalPages = Math.max(1, Math.ceil(totalRows / effectiveRowsPerPage))

  useEffect(() => {
    setPage(1)
  }, [activeStatusValue, query, rowsPerPage, sortColumnId, sortDirection, filters])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageStart = (page - 1) * effectiveRowsPerPage
  const pagedRows = sortedRows.slice(pageStart, pageStart + effectiveRowsPerPage)

  const pinnedLeftOffsets = useMemo(() => {
    const offsets: Record<string, number> = {}
    let runningLeft = 0

    for (const column of visibleOrderedColumns) {
      if (!pinnedColumnIds.includes(column.id)) continue
      offsets[column.id] = runningLeft

      const width = column.width
      if (typeof width === "number") {
        runningLeft += width
        continue
      }

      if (typeof width === "string" && width.trim().endsWith("px")) {
        const parsed = Number.parseFloat(width)
        runningLeft += Number.isNaN(parsed) ? 160 : parsed
        continue
      }

      runningLeft += 160
    }

    return offsets
  }, [pinnedColumnIds, visibleOrderedColumns])

  function reorderColumns(sourceId: string, targetId: string) {
    if (sourceId === targetId) return
    setColumnOrder((current) => {
      const next = [...current]
      const sourceIndex = next.indexOf(sourceId)
      const targetIndex = next.indexOf(targetId)
      if (sourceIndex === -1 || targetIndex === -1) return current
      next.splice(sourceIndex, 1)
      next.splice(targetIndex, 0, sourceId)
      return next
    })
  }

  function togglePin(columnId: string) {
    setPinnedColumnIds((current) => {
      if (current.includes(columnId)) {
        return current.filter((id) => id !== columnId)
      }
      return [columnId, ...current]
    })
  }

  function toggleVisibility(columnId: string, checked: boolean) {
    setVisibleColumnIds((current) => {
      if (checked) {
        const merged = new Set([...current, columnId])
        return allIds.filter((id) => merged.has(id))
      }
      if (current.length <= 1) return current
      return current.filter((id) => id !== columnId)
    })
  }

  function setStatus(nextValue: string) {
    if (statusValue === undefined) setInternalStatusValue(nextValue)
    onStatusChange?.(nextValue)
  }

  function renderColumnCell(row: T, column: DataTableColumn<T>) {
    const value =
      column.getValue?.(row) ??
      (column.accessorKey ? (row as Record<string, unknown>)[column.accessorKey] : "")
    return column.cell ? column.cell(row) : valueToText(value)
  }

  const mobilePrimaryColumn = visibleOrderedColumns[0]
  const mobileSubheadingColumn = visibleOrderedColumns[1]
  const mobileBadgeColumns = useMemo(
    () =>
      visibleOrderedColumns
        .filter((column) => /status|state|recovery/i.test(`${column.id} ${column.header}`))
        .slice(0, 2),
    [visibleOrderedColumns]
  )
  const mobileDetailColumns = useMemo(() => {
    const excluded = new Set([
      mobilePrimaryColumn?.id,
      mobileSubheadingColumn?.id,
      ...mobileBadgeColumns.map((column) => column.id),
    ])
    return visibleOrderedColumns.filter((column) => !excluded.has(column.id)).slice(0, 4)
  }, [mobileBadgeColumns, mobilePrimaryColumn?.id, mobileSubheadingColumn?.id, visibleOrderedColumns])

  function renderMobileRowCard(row: T) {
    const id = rowId(row)
    const selected = selectedRowId === id
    const primary = mobilePrimaryColumn ? renderColumnCell(row, mobilePrimaryColumn) : null
    const subheading = mobileSubheadingColumn ? renderColumnCell(row, mobileSubheadingColumn) : null

    return (
      <article
        key={id}
        role={onRowClick ? "button" : undefined}
        tabIndex={onRowClick ? 0 : undefined}
        onClick={() => onRowClick?.(row)}
        onKeyDown={(event) => {
          if (!onRowClick) return
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            onRowClick(row)
          }
        }}
        className={cn(
          "rounded-lg border border-border/70 bg-card p-3",
          onRowClick &&
            "cursor-pointer transition-colors hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          selected && "border-primary/40 bg-muted/40"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 text-left">
            {primary ? <div className="truncate text-sm font-semibold text-foreground">{primary}</div> : null}
            {subheading ? (
              <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{subheading}</div>
            ) : null}
          </div>
          {onRowClick ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 rounded-md px-2 text-[11px]"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onRowClick(row)
              }}
            >
              View
            </Button>
          ) : null}
        </div>

        {mobileBadgeColumns.length > 0 ? (
          <div className="mt-2 flex flex-wrap items-center justify-start gap-1.5">
            {mobileBadgeColumns.map((column) => (
              <div key={`${id}-${column.id}`}>{renderColumnCell(row, column)}</div>
            ))}
          </div>
        ) : null}

        {mobileDetailColumns.length > 0 ? (
          <div className="mt-3 space-y-2">
            {mobileDetailColumns.map((column) => (
              <div
                key={`${id}-${column.id}`}
                className="grid grid-cols-[110px_minmax(0,1fr)] items-start gap-2"
              >
                <p className="pt-0.5 text-[11px] font-medium text-muted-foreground">{column.header}</p>
                <div className="min-w-0 text-right text-xs text-foreground">{renderColumnCell(row, column)}</div>
              </div>
            ))}
          </div>
        ) : null}

        {onRowClick ? (
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-md px-3 text-xs"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onRowClick(row)
              }}
            >
              View details
            </Button>
          </div>
        ) : null}
      </article>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn("overflow-hidden rounded-lg border border-border/80", !isMobile && "bg-card")}>
        {!isMobile ? (
          <div className="border-b border-border/70 px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1">
                {visibleStatusPrimaryOptions.map((option) => {
                  const active = activeStatusValue === option.value
                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setStatus(option.value)}
                      className={cn(
                        "h-8 rounded-md px-3 text-xs",
                        active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {option.label}
                    </Button>
                  )
                })}
                {visibleStatusOverflowOptions.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 rounded-md px-3 text-xs",
                          !visibleStatusPrimaryOptions.some((option) => option.value === activeStatusValue) &&
                            activeStatusValue !== "all"
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        More
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {visibleStatusOverflowOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onSelect={() => setStatus(option.value)}
                          className="text-xs"
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>

              <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
                {showSearch && (
                  <div className="relative w-44">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={searchPlaceholder}
                      className="h-8 rounded-md border-0 bg-muted/55 pl-8 text-[11px] placeholder:text-[11px]"
                    />
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 rounded-md px-2.5 text-xs">
                      <FunnelIcon className="size-3.5" />
                      Filters
                      {activeSecondaryFilterCount > 0 ? (
                        <span className="ml-0.5 rounded-sm bg-muted px-1 py-0.5 text-[10px] leading-none text-foreground">
                          {activeSecondaryFilterCount}
                        </span>
                      ) : null}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>Filters</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {secondaryFilterColumns.length === 0 ? (
                      <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                        No filters available
                      </DropdownMenuItem>
                    ) : (
                      secondaryFilterColumns.map((column, index) => (
                        <div key={column.id}>
                          <DropdownMenuLabel className="py-1 text-[11px]">{column.header}</DropdownMenuLabel>
                          <DropdownMenuRadioGroup
                            value={filters[column.id] ?? "all"}
                            onValueChange={(value) =>
                              setFilters((current) => ({ ...current, [column.id]: value }))
                            }
                          >
                            <DropdownMenuRadioItem value="all" className="text-xs">
                              All {column.header}
                            </DropdownMenuRadioItem>
                            {column.filterOptions?.map((option) => (
                              <DropdownMenuRadioItem key={option.value} value={option.value} className="text-xs">
                                {option.label}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                          {index < secondaryFilterColumns.length - 1 ? <DropdownMenuSeparator /> : null}
                        </div>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="h-8 w-8 rounded-md"
                      title={
                        sortColumnId === "none"
                          ? `Sort by ${columnById[defaultSortColumnId]?.header ?? "column"}`
                          : `${sortDirection === "asc" ? "Ascending" : "Descending"} on ${activeSortLabel ?? "column"}`
                      }
                    >
                      <ArrowsDownUpIcon className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={sortColumnId}
                      onValueChange={(value) => {
                        if (value === "none") {
                          setSortColumnId("none")
                          setSortDirection("asc")
                          return
                        }
                        setSortColumnId(value)
                      }}
                    >
                      {visibleOrderedColumns.map((column) => (
                        <DropdownMenuRadioItem key={column.id} value={column.id} className="text-xs">
                          {column.header}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Order</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={sortDirection}
                      onValueChange={(value) => setSortDirection(value as "asc" | "desc")}
                    >
                      <DropdownMenuRadioItem value="asc" className="text-xs" disabled={sortColumnId === "none"}>
                        Ascending
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="desc" className="text-xs" disabled={sortColumnId === "none"}>
                        Descending
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-xs"
                      disabled={sortColumnId === "none"}
                      onClick={() => {
                        setSortColumnId("none")
                        setSortDirection("asc")
                      }}
                    >
                      Clear sorting
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-md" title="Columns">
                      <ColumnsIcon className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {columns.map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={visibleColumnIds.includes(column.id)}
                        disabled={column.hideable === false}
                        onCheckedChange={(checked) => toggleVisibility(column.id, checked === true)}
                        onSelect={(event) => event.preventDefault()}
                      >
                        {column.header}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ) : (
          <>
            {visibleStatusPrimaryOptions.length > 0 ? (
              <div className="border-b border-border/70 bg-muted/35 px-3 py-2">
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                  {visibleStatusPrimaryOptions.map((option) => {
                    const active = activeStatusValue === option.value
                    return (
                      <Button
                        key={option.value}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setStatus(option.value)}
                        className={cn(
                          "h-8 shrink-0 rounded-md px-3 text-xs",
                          active ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {option.label}
                      </Button>
                    )
                  })}
                  {visibleStatusOverflowOptions.length > 0 ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-8 shrink-0 rounded-md px-3 text-xs",
                            !visibleStatusPrimaryOptions.some((option) => option.value === activeStatusValue) &&
                              activeStatusValue !== "all"
                              ? "bg-background text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          More
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        {visibleStatusOverflowOptions.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onSelect={() => setStatus(option.value)}
                            className="text-xs"
                          >
                            {option.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="border-b border-border/70 bg-background/90 px-3 py-2">
              <div className="space-y-2">
                {showSearch ? (
                  <div className="relative w-full">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={searchPlaceholder}
                      className="h-8 rounded-md border-border/60 bg-background pl-8 text-[11px] placeholder:text-[11px]"
                    />
                  </div>
                ) : null}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="relative h-8 shrink-0 rounded-md px-2.5 text-xs"
                    title="Filters"
                    onClick={() => setMobileFiltersOpen(true)}
                  >
                    <FunnelIcon className="size-3.5" />
                    Filters
                    {activeSecondaryFilterCount > 0 ? (
                      <span className="ml-0.5 rounded-sm bg-muted px-1 py-0.5 text-[10px] leading-none text-foreground">
                        {activeSecondaryFilterCount}
                      </span>
                    ) : null}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 shrink-0 rounded-md px-2.5 text-xs"
                    title="Sort"
                    onClick={() => setMobileSortOpen(true)}
                  >
                    <ArrowsDownUpIcon className="size-3.5" />
                    Sort
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 shrink-0 rounded-md px-2.5 text-xs"
                    title="Customize visible fields"
                    onClick={() => setMobileColumnsOpen(true)}
                  >
                    <ColumnsIcon className="size-3.5" />
                    Customize
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

      {!isMobile ? (
        <div className="overflow-x-auto">
          <Table className={cn("min-w-full", tableClassName)}>
            <TableHeader>
              <TableRow>
                {visibleOrderedColumns.map((column) => {
                  const pinned = pinnedColumnIds.includes(column.id)
                  const draggable = column.draggable !== false
                  const showColumnControls = draggable || column.pinnable !== false
                  const controlsLeading = column.align === "right"
                  const headStyle = {
                    ...(column.width
                      ? { width: typeof column.width === "number" ? `${column.width}px` : column.width }
                      : {}),
                    ...(pinned
                      ? {
                          position: "sticky" as const,
                          left: `${pinnedLeftOffsets[column.id] ?? 0}px`,
                          zIndex: 30,
                        }
                      : {}),
                  }
                  return (
                    <TableHead
                      key={column.id}
                      style={headStyle}
                      className={cn(
                        "group h-10 bg-muted/35 text-xs font-semibold text-muted-foreground",
                        draggable && "cursor-grab",
                        draggingColumnId === column.id && "cursor-grabbing",
                        !draggable && "cursor-default",
                        column.align === "right" && "text-right",
                        column.align === "center" && "text-center",
                        column.className
                      )}
                      draggable={draggable}
                      onDragStart={() => draggable && setDraggingColumnId(column.id)}
                      onDragOver={(event) => {
                        if (!draggingColumnId) return
                        event.preventDefault()
                      }}
                      onDrop={(event) => {
                        event.preventDefault()
                        if (!draggingColumnId) return
                        reorderColumns(draggingColumnId, column.id)
                        setDraggingColumnId(null)
                      }}
                      onDragEnd={() => setDraggingColumnId(null)}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-1.5",
                          column.align === "right" && "justify-end",
                          column.align === "center" && "justify-center"
                        )}
                      >
                        {showColumnControls && controlsLeading && (
                          <div className="inline-flex items-center gap-0.5">
                            {draggable && (
                              <button
                                type="button"
                                className={cn(
                                  "inline-flex size-4 items-center justify-center rounded text-muted-foreground/70 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 group-focus-within:opacity-100",
                                  draggingColumnId === column.id && "opacity-100",
                                  draggingColumnId === column.id ? "cursor-grabbing" : "cursor-grab"
                                )}
                                aria-label={`Reorder ${column.header} column`}
                              >
                                <DotsSixVerticalIcon className="size-3" />
                              </button>
                            )}
                            {column.pinnable !== false && !pinned && (
                              <button
                                type="button"
                                className={cn(
                                  "inline-flex size-5 cursor-pointer items-center justify-center rounded text-muted-foreground opacity-0 transition-[opacity,color] hover:text-foreground group-hover:opacity-100 group-focus-within:opacity-100",
                                  pinned && "text-foreground"
                                )}
                                onClick={() => togglePin(column.id)}
                                aria-label={pinned ? `Unpin ${column.header} column` : `Pin ${column.header} column`}
                              >
                                {pinned ? <PushPinSlashIcon className="size-3.5" /> : <PushPinIcon className="size-3.5" />}
                              </button>
                            )}
                          </div>
                        )}

                        <span>{column.header}</span>
                        {pinned && column.pinnable !== false && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault()
                              event.stopPropagation()
                              togglePin(column.id)
                            }}
                            className="inline-flex size-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                            aria-label={`Unpin ${column.header} column`}
                            title="Unpin column"
                          >
                            <PushPinIcon className="size-3.5" />
                          </button>
                        )}

                        {showColumnControls && !controlsLeading && (
                          <div className="inline-flex items-center gap-0.5">
                            {draggable && (
                              <button
                                type="button"
                                className={cn(
                                  "inline-flex size-4 items-center justify-center rounded text-muted-foreground/70 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 group-focus-within:opacity-100",
                                  draggingColumnId === column.id && "opacity-100",
                                  draggingColumnId === column.id ? "cursor-grabbing" : "cursor-grab"
                                )}
                                aria-label={`Reorder ${column.header} column`}
                              >
                                <DotsSixVerticalIcon className="size-3" />
                              </button>
                            )}
                            {column.pinnable !== false && !pinned && (
                              <button
                                type="button"
                                className={cn(
                                  "inline-flex size-5 cursor-pointer items-center justify-center rounded text-muted-foreground opacity-0 transition-[opacity,color] hover:text-foreground group-hover:opacity-100 group-focus-within:opacity-100",
                                  pinned && "text-foreground"
                                )}
                                onClick={() => togglePin(column.id)}
                                aria-label={pinned ? `Unpin ${column.header} column` : `Pin ${column.header} column`}
                              >
                                {pinned ? <PushPinSlashIcon className="size-3.5" /> : <PushPinIcon className="size-3.5" />}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {pagedRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={Math.max(1, visibleOrderedColumns.length)}
                    className="py-8 text-center text-xs text-muted-foreground"
                  >
                    {emptyText}
                  </TableCell>
                </TableRow>
              ) : (
                pagedRows.map((row) => {
                  const id = rowId(row)
                  const selected = selectedRowId === id
                  return (
                    <TableRow
                      key={id}
                      data-state={selected ? "selected" : undefined}
                      role={onRowClick ? "button" : undefined}
                      tabIndex={onRowClick ? 0 : undefined}
                      className={cn(
                        "group",
                        onRowClick &&
                          "cursor-pointer transition-colors hover:bg-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                        selected && "bg-accent/45"
                      )}
                      onClick={() => onRowClick?.(row)}
                      onKeyDown={(event) => {
                        if (!onRowClick) return
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault()
                          onRowClick(row)
                        }
                      }}
                    >
                      {visibleOrderedColumns.map((column, columnIndex) => {
                        const pinned = pinnedColumnIds.includes(column.id)
                        const isLastColumn = columnIndex === visibleOrderedColumns.length - 1
                        const cellStyle = pinned
                          ? {
                              position: "sticky" as const,
                              left: `${pinnedLeftOffsets[column.id] ?? 0}px`,
                              zIndex: 20,
                            }
                          : undefined
                        return (
                          <TableCell
                            key={column.id}
                            style={cellStyle}
                            className={cn(
                              "py-2.5 text-xs text-foreground",
                              column.align === "right" && "text-right",
                              column.align === "center" && "text-center",
                              pinned && (selected ? "bg-accent/45" : "bg-card"),
                              isLastColumn && onRowClick && "relative",
                              column.className
                            )}
                          >
                            {renderColumnCell(row, column)}
                            {isLastColumn && onRowClick ? (
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center bg-gradient-to-l from-card via-card/95 to-transparent py-1 pr-2 pl-10 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="pointer-events-auto h-7 gap-1 rounded-md px-2 text-xs text-primary hover:bg-transparent hover:text-primary"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    onRowClick(row)
                                  }}
                                >
                                  View details
                                  <CaretRightIcon className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ) : null}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="space-y-2 p-2">
          {pagedRows.length === 0 ? (
            <div className="rounded-md border border-border/70 bg-card px-3 py-8 text-center text-xs text-muted-foreground">
              {emptyText}
            </div>
          ) : (
            pagedRows.map((row) => renderMobileRowCard(row))
          )}
        </div>
      )}

      {shouldShowPaginationFooter ? (
        <div className="flex items-center justify-between gap-2 border-t border-border/70 px-3 py-2">
          <div className="flex w-1/3 items-center justify-start gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-md px-2.5 text-xs"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
            >
              <CaretLeftIcon className="size-3.5" />
              Previous
            </Button>
          </div>

          <div className="flex w-1/3 items-center justify-center gap-3 text-xs text-muted-foreground">
            <span>
              Page <span className="font-medium text-foreground">{page}</span> of{" "}
              <span className="font-medium text-foreground">{totalPages}</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span>Rows</span>
              <Select
                value={String(rowsPerPage)}
                onValueChange={(value) => setRowsPerPage(Number(value))}
              >
                <SelectTrigger size="sm" className="h-8 w-[112px] rounded-md bg-muted/55 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rowsPerPageOptions.map((option) => (
                    <SelectItem key={option} value={String(option)} className="text-xs">
                      {option} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {footerActions}
          </div>

          <div className="flex w-1/3 items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-md px-2.5 text-xs"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages}
            >
              Next
              <CaretRightIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : null}

      {!isMobile ? (
        <div className="flex items-center justify-center text-[11px] text-muted-foreground">
          <div className="inline-flex items-center gap-1.5">
            <SlidersHorizontalIcon className="size-3" />
            <span>Drag headers to reorder. Pinning a column moves it to the left.</span>
          </div>
        </div>
      ) : null}

      {isMobile ? (
        <>
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetContent
              side="bottom"
              a11yTitle="Filter records"
              a11yDescription="Refine records using filter options."
              className="max-h-[84dvh] overflow-hidden p-0"
            >
              <div className="flex h-full flex-col">
                <div className="border-b border-border/70 px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">Filters</p>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
                  {secondaryFilterColumns.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No filters available</p>
                  ) : (
                    secondaryFilterColumns.map((column) => (
                      <section key={`mobile-filter-${column.id}`} className="space-y-2">
                        <p className="text-xs font-semibold text-foreground">{column.header}</p>
                        <div className="flex flex-wrap gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant={filters[column.id] === "all" ? "secondary" : "outline"}
                            className="h-8 rounded-md px-2.5 text-xs"
                            onClick={() => setFilters((current) => ({ ...current, [column.id]: "all" }))}
                          >
                            All
                          </Button>
                          {column.filterOptions?.map((option) => {
                            const active = filters[column.id] === option.value
                            return (
                              <Button
                                key={`mobile-filter-option-${column.id}-${option.value}`}
                                type="button"
                                size="sm"
                                variant={active ? "secondary" : "outline"}
                                className="h-8 rounded-md px-2.5 text-xs"
                                onClick={() => setFilters((current) => ({ ...current, [column.id]: option.value }))}
                              >
                                {option.label}
                              </Button>
                            )
                          })}
                        </div>
                      </section>
                    ))
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={mobileSortOpen} onOpenChange={setMobileSortOpen}>
            <SheetContent
              side="bottom"
              a11yTitle="Sort records"
              a11yDescription="Change sorting field and direction."
              className="max-h-[84dvh] overflow-hidden p-0"
            >
              <div className="flex h-full flex-col">
                <div className="border-b border-border/70 px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">Sort</p>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
                  <section className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">Field</p>
                    <div className="flex flex-wrap gap-1.5">
                      {visibleOrderedColumns.map((column) => {
                        const active = sortColumnId === column.id
                        return (
                          <Button
                            key={`mobile-sort-field-${column.id}`}
                            type="button"
                            size="sm"
                            variant={active ? "secondary" : "outline"}
                            className="h-8 rounded-md px-2.5 text-xs"
                            onClick={() => setSortColumnId(column.id)}
                          >
                            {column.header}
                          </Button>
                        )
                      })}
                    </div>
                  </section>

                  <section className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">Direction</p>
                    <div className="flex gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant={sortDirection === "asc" ? "secondary" : "outline"}
                        className="h-8 rounded-md px-2.5 text-xs"
                        onClick={() => setSortDirection("asc")}
                        disabled={sortColumnId === "none"}
                      >
                        Ascending
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={sortDirection === "desc" ? "secondary" : "outline"}
                        className="h-8 rounded-md px-2.5 text-xs"
                        onClick={() => setSortDirection("desc")}
                        disabled={sortColumnId === "none"}
                      >
                        Descending
                      </Button>
                    </div>
                  </section>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-md px-2.5 text-xs"
                    disabled={sortColumnId === "none"}
                    onClick={() => {
                      setSortColumnId("none")
                      setSortDirection("asc")
                    }}
                  >
                    Clear sorting
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={mobileColumnsOpen} onOpenChange={setMobileColumnsOpen}>
            <SheetContent
              side="bottom"
              a11yTitle="Customize fields"
              a11yDescription="Show or hide table fields in cards."
              className="max-h-[84dvh] overflow-hidden p-0"
            >
              <div className="flex h-full flex-col">
                <div className="border-b border-border/70 px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">Customize fields</p>
                </div>
                <div className="flex-1 space-y-1 overflow-y-auto px-4 py-3">
                  {columns.map((column) => (
                    <label
                      key={`mobile-col-${column.id}`}
                      className="flex cursor-pointer items-center justify-between rounded-md border border-border/60 bg-card px-3 py-2"
                    >
                      <span className="text-xs text-foreground">{column.header}</span>
                      <input
                        type="checkbox"
                        checked={visibleColumnIds.includes(column.id)}
                        disabled={column.hideable === false}
                        onChange={(event) => toggleVisibility(column.id, event.target.checked)}
                        className="h-4 w-4 rounded border-border"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </>
      ) : null}
      </div>
    </div>
  )
}
