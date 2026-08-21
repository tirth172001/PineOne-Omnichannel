import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { BulkOperationSheet } from "./bulk-operation-sheet"

const meta = {
  title: "Shared/BulkOperationSheet",
  component: BulkOperationSheet,
  tags: ["autodocs"],
} satisfies Meta<typeof BulkOperationSheet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    title: "Bulk refund",
    description: "Upload a CSV of transaction IDs to refund in bulk.",
    templateSummary: "refund-template.csv — 6 columns",
    status: "processing",
    progressPercent: 62,
    processedRows: 620,
    totalRows: 1000,
    estimatedMinutes: 2,
    uploadedFileName: "refunds-june.csv",
    onDownloadTemplate: () => {},
    onFilePicked: () => {},
    onStart: () => {},
  },
}
