import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./table"

const meta = {
  title: "UI/Table",
  component: Table,
  tags: ["autodocs"],
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

const rows = [
  { id: "TXN-9201", method: "UPI", amount: "₹2,450", status: "Success" },
  { id: "TXN-9200", method: "Card", amount: "₹8,900", status: "Success" },
  { id: "TXN-9199", method: "UPI", amount: "₹1,200", status: "Failed" },
]

export const Default: Story = {
  render: (args) => (
    <Table {...args}>
      <TableCaption>Recent transactions.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Transaction</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.method}</TableCell>
            <TableCell>{row.amount}</TableCell>
            <TableCell>{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}
