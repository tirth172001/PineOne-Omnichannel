"use client"

import * as React from "react"
import { CaretRightIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b [&_tr]:border-border [&_tr]:bg-muted [&_tr:hover]:bg-muted", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border transition-colors hover:bg-accent has-aria-expanded:bg-accent data-[state=selected]:bg-accent",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-top whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

/** Drop into the last <TableCell> of a row that navigates to a detail page (the
 *  row itself should have the `group` class and its own onClick/router.push).
 *  Fades in a "View details" CTA over a gradient that blends into the cell's
 *  existing content instead of covering it abruptly. */
function TableRowViewDetailsCell({
  className,
  children,
  onViewDetails,
  ...props
}: React.ComponentProps<"td"> & { onViewDetails: () => void }) {
  return (
    <TableCell className={cn("relative", className)} {...props}>
      {children}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center bg-gradient-to-l from-card via-card/95 to-transparent py-1 pr-2 pl-10 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="pointer-events-auto h-7 gap-1 rounded-md px-2 text-xs text-primary hover:bg-transparent hover:text-primary"
          onClick={(event) => {
            event.stopPropagation()
            onViewDetails()
          }}
        >
          View details
          <CaretRightIcon className="h-3.5 w-3.5" />
        </Button>
      </div>
    </TableCell>
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableRowViewDetailsCell,
  TableCaption,
}
