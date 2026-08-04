export type BulkOperationStatus = "idle" | "processing" | "partial-failed" | "completed"

export type BulkTemplateColumn = {
  key: string
  label: string
  required: boolean
  example?: string
}

export type BulkTemplateSchema = {
  id: string
  title: string
  columns: BulkTemplateColumn[]
}

export type BulkValidationResult = {
  totalRows: number
  validRows: number
  invalidRows: number
  errors: Array<{
    rowIndex: number
    field: string
    message: string
  }>
}

export type BulkProcessingState = {
  status: BulkOperationStatus
  totalRows: number
  processedRows: number
  estimatedMinutes: number
}

export type BulkOperationConfig = {
  id: "payment-links" | "refunds" | "imei" | "cross-border-docs"
  label: string
  template: BulkTemplateSchema
}

export const bulkOperationConfigs: Record<BulkOperationConfig["id"], BulkOperationConfig> = {
  "payment-links": {
    id: "payment-links",
    label: "Payment Links bulk operations",
    template: {
      id: "payment-links-template",
      title: "Payment links template",
      columns: [
        { key: "order_id", label: "Order ID", required: true, example: "ORD-1001" },
        { key: "amount", label: "Amount", required: true, example: "1299" },
        { key: "customer_phone", label: "Customer phone", required: false, example: "98XXXXXX12" },
      ],
    },
  },
  refunds: {
    id: "refunds",
    label: "Refund bulk operations",
    template: {
      id: "refunds-template",
      title: "Refunds template",
      columns: [
        { key: "transaction_id", label: "Transaction ID", required: true, example: "TXN-8891" },
        { key: "refund_amount", label: "Refund amount", required: true, example: "499" },
        { key: "reason", label: "Reason", required: false, example: "Customer cancelled order" },
      ],
    },
  },
  imei: {
    id: "imei",
    label: "IMEI verification operations",
    template: {
      id: "imei-template",
      title: "IMEI verification template",
      columns: [
        { key: "transaction_id", label: "Transaction ID", required: true, example: "TXN-7783" },
        { key: "imei", label: "IMEI number", required: true, example: "356938035643809" },
      ],
    },
  },
  "cross-border-docs": {
    id: "cross-border-docs",
    label: "Cross Border invoice/AWB uploads",
    template: {
      id: "cross-border-template",
      title: "Cross Border documents template",
      columns: [
        { key: "transaction_id", label: "Transaction ID", required: true, example: "CBTXN-1042" },
        { key: "invoice_number", label: "Invoice number", required: true, example: "INV-CBTXN-1042" },
        { key: "awb_number", label: "AWB number", required: false, example: "AWB-CBTXN-1042" },
      ],
    },
  },
}
