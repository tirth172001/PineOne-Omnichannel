"use client"

import * as React from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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

type TransactionStyleColumn<T> = {
  key: string
  header: string
  headerClassName?: string
  cellClassName?: string
  render: (row: T) => React.ReactNode
}

type TransactionStyleTableProps<T> = {
  columns: TransactionStyleColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  emptyText?: string
  minWidthClassName?: string
  rowsPerPageOptions?: number[]
  selectedCount?: number
  totalRowsLabel?: string | number
}

export function TransactionStyleTable<T>({
  columns,
  rows,
  rowKey,
  emptyText = "No records found.",
  minWidthClassName = "min-w-[1080px]",
  rowsPerPageOptions = [10, 25, 50],
  selectedCount = 0,
  totalRowsLabel,
}: TransactionStyleTableProps<T>) {
  const [rowsPerPage, setRowsPerPage] = React.useState(rowsPerPageOptions[0] ?? 10)
  const [page, setPage] = React.useState(1)

  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage))

  React.useEffect(() => {
    setPage(1)
  }, [rows, rowsPerPage])

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pagedRows = React.useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage
    return rows.slice(startIndex, startIndex + rowsPerPage)
  }, [page, rows, rowsPerPage])

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-md border border-border/70">
        <div className="overflow-x-auto">
          <Table className={minWidthClassName}>
            <TableHeader>
              <TableRow className="border-border/70">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={column.headerClassName ?? "h-10 px-3 text-sm font-medium text-muted-foreground"}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRows.length === 0 ? (
                <TableRow className="h-[62px] border-border/70">
                  <TableCell className="px-3 text-sm text-muted-foreground" colSpan={columns.length}>
                    {emptyText}
                  </TableCell>
                </TableRow>
              ) : (
                pagedRows.map((row) => (
                  <TableRow key={rowKey(row)} className="h-[62px] border-border/70">
                    {columns.map((column) => (
                      <TableCell key={`${rowKey(row)}-${column.key}`} className={column.cellClassName ?? "px-3 text-sm text-foreground"}>
                        {column.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">
          {selectedCount} of {totalRowsLabel ?? rows.length} row(s) selected.
        </p>
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Rows per page</span>
            <Select value={String(rowsPerPage)} onValueChange={(value) => setRowsPerPage(Number(value))}>
              <SelectTrigger size="sm" className="h-8 w-[70px] rounded-lg text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rowsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-sm font-medium text-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md border-border/60 bg-background/80" disabled={page <= 1} onClick={() => setPage(1)}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md border-border/60 bg-background/80" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md border-border/60 bg-background/80" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon-sm" className="h-8 w-8 rounded-md border-border/60 bg-background/80" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
