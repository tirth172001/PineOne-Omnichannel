"use client"

import { useMemo, useState } from "react"
import { Columns3, GripVertical, Pin, PinOff, Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
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
import { cn } from "@/lib/utils"

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
  toolbarActions?: React.ReactNode
  className?: string
  tableClassName?: string
  initialPinnedColumnIds?: string[]
  initialVisibleColumnIds?: string[]
}

function valueToText(value: unknown) {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value
  if (typeof value === "number") return value.toString()
  if (typeof value === "boolean") return value ? "true" : "false"
  return ""
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
  toolbarActions,
  className,
  tableClassName,
  initialPinnedColumnIds,
  initialVisibleColumnIds,
}: DataTableProps<T>) {
  const allIds = useMemo(() => columns.map((column) => column.id), [columns])
  const columnById = useMemo(
    () => Object.fromEntries(columns.map((column) => [column.id, column])) as Record<string, DataTableColumn<T>>,
    [columns],
  )

  const [query, setQuery] = useState("")
  const [columnOrder, setColumnOrder] = useState<string[]>(allIds)
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null)
  const [pinnedColumnIds, setPinnedColumnIds] = useState<string[]>(
    (initialPinnedColumnIds ?? []).filter((id) => allIds.includes(id)),
  )
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(
    (initialVisibleColumnIds ?? allIds).filter((id) => allIds.includes(id)),
  )
  const [filters, setFilters] = useState<Record<string, string>>(
    Object.fromEntries(
      columns
        .filter((column) => column.filterOptions && column.filterOptions.length > 0)
        .map((column) => [column.id, "all"]),
    ),
  )

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

  const searchableColumns = useMemo(() => visibleOrderedColumns.filter((column) => column.searchable !== false), [visibleOrderedColumns])

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return data.filter((row) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        searchableColumns.some((column) => {
          const value =
            column.getSearchValue?.(row) ??
            valueToText(column.getValue?.(row) ?? (column.accessorKey ? (row as Record<string, unknown>)[column.accessorKey] : ""))
          return value.toLowerCase().includes(normalizedQuery)
        })

      if (!matchesQuery) {
        return false
      }

      return Object.entries(filters).every(([columnId, expectedValue]) => {
        if (!expectedValue || expectedValue === "all") return true
        const column = columnById[columnId]
        if (!column) return true
        const actual =
          column.getFilterValue?.(row) ??
          valueToText(column.getValue?.(row) ?? (column.accessorKey ? (row as Record<string, unknown>)[column.accessorKey] : ""))
        return actual.toLowerCase() === expectedValue.toLowerCase()
      })
    })
  }, [columnById, data, filters, query, searchableColumns])

  const filterableColumns = useMemo(
    () => columns.filter((column) => (column.filterOptions?.length ?? 0) > 0),
    [columns],
  )

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

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2 px-1">
        {showSearch && (
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 border-0 bg-muted/70 pl-8 text-xs"
            />
          </div>
        )}

        {filterableColumns.map((column) => (
          <Select
            key={column.id}
            value={filters[column.id] ?? "all"}
            onValueChange={(value) => setFilters((current) => ({ ...current, [column.id]: value }))}
          >
            <SelectTrigger size="sm" className="h-8 rounded-md bg-muted/70 text-xs">
              <SelectValue placeholder={column.header} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {column.header}</SelectItem>
              {column.filterOptions?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground">
              <Columns3 className="size-3.5" />
              Columns
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

        {toolbarActions}
      </div>

      <div className="overflow-x-auto rounded-lg bg-card/80">
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
                      "group h-10 bg-card/30 text-xs font-semibold text-muted-foreground",
                      draggable && "cursor-grab",
                      draggingColumnId === column.id && "cursor-grabbing",
                      !draggable && "cursor-default",
                      column.align === "right" && "text-right",
                      column.align === "center" && "text-center",
                      pinned && "text-foreground",
                      pinned && "bg-card",
                      column.className,
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
                        column.align === "center" && "justify-center",
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
                                draggingColumnId === column.id ? "cursor-grabbing" : "cursor-grab",
                              )}
                              aria-label={`Reorder ${column.header} column`}
                            >
                              <GripVertical className="size-3" />
                            </button>
                          )}
                          {column.pinnable !== false && (
                            <button
                              type="button"
                              className={cn(
                                "inline-flex size-5 cursor-pointer items-center justify-center rounded text-muted-foreground opacity-0 transition-[opacity,color] hover:text-foreground group-hover:opacity-100 group-focus-within:opacity-100",
                                pinned && "text-foreground",
                              )}
                              onClick={() => togglePin(column.id)}
                              aria-label={pinned ? `Unpin ${column.header} column` : `Pin ${column.header} column`}
                            >
                              {pinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
                            </button>
                          )}
                        </div>
                      )}

                      <span>{column.header}</span>

                      {showColumnControls && !controlsLeading && (
                        <div className="inline-flex items-center gap-0.5">
                          {draggable && (
                            <button
                              type="button"
                              className={cn(
                                "inline-flex size-4 items-center justify-center rounded text-muted-foreground/70 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 group-focus-within:opacity-100",
                                draggingColumnId === column.id && "opacity-100",
                                draggingColumnId === column.id ? "cursor-grabbing" : "cursor-grab",
                              )}
                              aria-label={`Reorder ${column.header} column`}
                            >
                              <GripVertical className="size-3" />
                            </button>
                          )}
                          {column.pinnable !== false && (
                            <button
                              type="button"
                              className={cn(
                                "inline-flex size-5 cursor-pointer items-center justify-center rounded text-muted-foreground opacity-0 transition-[opacity,color] hover:text-foreground group-hover:opacity-100 group-focus-within:opacity-100",
                                pinned && "text-foreground",
                              )}
                              onClick={() => togglePin(column.id)}
                              aria-label={pinned ? `Unpin ${column.header} column` : `Pin ${column.header} column`}
                            >
                              {pinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
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
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={Math.max(1, visibleOrderedColumns.length)} className="py-8 text-center text-xs text-muted-foreground">
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => {
                const id = rowId(row)
                const selected = selectedRowId === id
                return (
                  <TableRow
                    key={id}
                    data-state={selected ? "selected" : undefined}
                    className={cn(onRowClick && "cursor-pointer", selected && "bg-muted/70")}
                    onClick={() => onRowClick?.(row)}
                  >
                    {visibleOrderedColumns.map((column) => {
                      const pinned = pinnedColumnIds.includes(column.id)
                      const value = column.getValue?.(row) ?? (column.accessorKey ? (row as Record<string, unknown>)[column.accessorKey] : "")
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
                            pinned && "bg-card/95",
                            column.className,
                          )}
                        >
                          {column.cell ? column.cell(row) : valueToText(value)}
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

      <div className="flex items-center gap-1 px-1 text-[11px] text-muted-foreground">
        <SlidersHorizontal className="size-3" />
        Drag headers to reorder. Pinning a column moves it to the left.
      </div>
    </div>
  )
}
