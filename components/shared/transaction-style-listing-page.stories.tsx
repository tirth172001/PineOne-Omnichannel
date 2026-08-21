import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { TransactionStyleListingPage, type ListingColumn } from "./transaction-style-listing-page"
import type { ListingFilter } from "./listing-page-primitives"

type Row = { id: string; merchant: string; amount: string; status: string }

const rows: Row[] = [
  { id: "TXN-9201", merchant: "Rahul Sharma", amount: "₹2,450", status: "Success" },
  { id: "TXN-9200", merchant: "Priya Nair", amount: "₹8,900", status: "Success" },
  { id: "TXN-9199", merchant: "Arjun Mehta", amount: "₹1,200", status: "Failed" },
]

const columns: ListingColumn<Row>[] = [
  { key: "id", header: "Transaction", cell: (row) => row.id },
  { key: "merchant", header: "Merchant", cell: (row) => row.merchant },
  { key: "amount", header: "Amount", cell: (row) => row.amount, align: "right" },
  { key: "status", header: "Status", cell: (row) => row.status },
]

const meta = {
  title: "Shared/TransactionStyleListingPage",
  component: TransactionStyleListingPage<Row>,
  tags: ["autodocs"],
} satisfies Meta<typeof TransactionStyleListingPage<Row>>

export default meta
type Story = StoryObj<typeof meta>

const filters: ListingFilter[] = [
  { id: "status", type: "select", label: "Status", value: "all", options: [{ label: "All", value: "all" }] },
]

export const Default: Story = {
  args: {
    title: "Transactions",
    search: "",
    onSearchChange: () => {},
    searchPlaceholder: "Search transactions...",
    filters,
    summaryCards: [
      { label: "Total volume", value: "₹48.2L" },
      { label: "Transactions", value: "2,481" },
    ],
    columns,
    rows,
  },
}
