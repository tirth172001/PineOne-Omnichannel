import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { DataTable, type DataTableColumn } from "./data-table"

type Row = { id: string; merchant: string; method: string; amount: string; status: string }

const rows: Row[] = [
  { id: "TXN-9201", merchant: "Rahul Sharma", method: "UPI", amount: "₹2,450", status: "Success" },
  { id: "TXN-9200", merchant: "Priya Nair", method: "Card", amount: "₹8,900", status: "Success" },
  { id: "TXN-9199", merchant: "Arjun Mehta", method: "UPI", amount: "₹1,200", status: "Failed" },
]

const columns: DataTableColumn<Row>[] = [
  { id: "id", header: "Transaction", accessorKey: "id" },
  { id: "merchant", header: "Merchant", accessorKey: "merchant" },
  { id: "method", header: "Method", accessorKey: "method" },
  { id: "amount", header: "Amount", accessorKey: "amount", align: "right" },
  { id: "status", header: "Status", accessorKey: "status" },
]

const meta = {
  title: "UI/DataTable",
  component: DataTable<Row>,
  tags: ["autodocs"],
} satisfies Meta<typeof DataTable<Row>>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: rows,
    columns,
    rowId: (row: Row) => row.id,
  },
}
