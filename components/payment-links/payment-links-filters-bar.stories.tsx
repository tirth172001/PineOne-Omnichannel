import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import {
  PaymentLinksFiltersBar,
  type ColumnKey,
  type SortDirection,
  type StatusFilter,
} from "./payment-links-filters-bar"
import { useDateRangeFilter } from "../shared/date-range-filter"
import { useMoreFiltersPanel, type MoreFilterCategory } from "../shared/more-filters-panel"

const meta = {
  title: "Payment Links/FiltersBar",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const moreFilterCategories: MoreFilterCategory[] = [
  {
    id: "status",
    label: "Status",
    display: "badge",
    selectionMode: "multi",
    searchable: false,
    options: [
      { id: "expired", label: "Expired" },
      { id: "success", label: "Success" },
      { id: "initiated", label: "Initiated" },
      { id: "failed", label: "Failed" },
    ],
  },
]

function FiltersBarDemo() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    creationDate: true,
    paymentLink: true,
    transactionId: true,
    amount: true,
    expiryDate: true,
    status: true,
  })
  const dateRangeFilter = useDateRangeFilter()
  const moreFilters = useMoreFiltersPanel(moreFilterCategories)

  return (
    <PaymentLinksFiltersBar
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      dateRangeFilter={dateRangeFilter}
      moreFilters={moreFilters}
      sortDirection={sortDirection}
      onToggleSort={() => setSortDirection((current) => (current === "asc" ? "desc" : "asc"))}
      visibleColumns={visibleColumns}
      onVisibleColumnsChange={setVisibleColumns}
      onExportAll={() => console.log("Export all rows")}
    />
  )
}

export const Default: Story = {
  render: () => <FiltersBarDemo />,
}
