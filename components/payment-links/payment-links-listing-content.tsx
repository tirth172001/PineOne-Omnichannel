"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import {
  CaretDownIcon,
  CopyIcon,
  DotsThreeVerticalIcon,
  DownloadIcon,
  LinkBreakIcon,
  PlusIcon,
} from "@phosphor-icons/react"
import { CreatePaymentLinkSheet, type CreatePaymentLinkValues } from "@/components/payment-links/create-payment-link-sheet"
import { useDateRangeFilter } from "@/components/shared/date-range-filter"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  FILTER_BUTTON_CARET_CLASSES,
  FILTER_BUTTON_FOCUS_CLASSES,
} from "@/components/shared/listing-page-primitives"
import { StatusPill, type StatusTone } from "@/components/shared/status-pill"
import { TransactionStyleListingPage, type ListingColumn } from "@/components/shared/transaction-style-listing-page"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type PaymentLinkStatus = "Created" | "Expired" | "Fully paid" | "Cancelled"

type PaymentLinkRow = {
  id: string
  createdDate: string
  createdTime: string
  paymentLink: string
  invoiceNumber: string
  amount: string
  description: string
  expiryDate: string
  expiryTime: string
  customerEmail: string
  customerMobile: string
  status: PaymentLinkStatus
}

const STATUS_OPTIONS: PaymentLinkStatus[] = ["Created", "Expired", "Fully paid", "Cancelled"]

function toPaymentLinkTone(status: PaymentLinkStatus): StatusTone {
  if (status === "Fully paid") return "success"
  if (status === "Created") return "initiated"
  if (status === "Expired") return "processing"
  return "failed"
}

type SearchField = "paymentId" | "originalAmount" | "invoiceNumber" | "customerPhone" | "customerEmail"

const SEARCH_FIELDS: Array<{ id: SearchField; label: string }> = [
  { id: "paymentId", label: "Payment ID" },
  { id: "originalAmount", label: "Original amount" },
  { id: "invoiceNumber", label: "Invoice number" },
  { id: "customerPhone", label: "Customer phone" },
  { id: "customerEmail", label: "Customer email" },
]

function matchesSearchField(row: PaymentLinkRow, field: SearchField, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  switch (field) {
    case "paymentId":
      return row.paymentLink.toLowerCase().includes(q)
    case "originalAmount":
      return row.amount.toLowerCase().includes(q)
    case "invoiceNumber":
      return row.invoiceNumber.toLowerCase().includes(q)
    case "customerPhone":
      return row.customerMobile.toLowerCase().includes(q)
    case "customerEmail":
      return row.customerEmail.toLowerCase().includes(q)
  }
}

function generatePaymentLinkId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function formatCreatedNow() {
  const now = new Date()
  return {
    date: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
  }
}

const DUMMY_PAYMENT_LINK_ROWS: PaymentLinkRow[] = [
  { id: "plink-1", createdDate: "12 Aug 2026", createdTime: "10:10 PM", paymentLink: "PL9K3M2Q", invoiceNumber: "INV-5161", amount: "₹ 20,000", description: "Consultation fee", expiryDate: "19 Aug 2026", expiryTime: "10:10 PM", customerEmail: "rahul.sharma@pinelabs-demo.in", customerMobile: "+91 98765 43210", status: "Fully paid" },
  { id: "plink-2", createdDate: "13 Aug 2026", createdTime: "9:30 PM", paymentLink: "PL7H1L9R", invoiceNumber: "INV-5162", amount: "₹ 10,000", description: "Advance booking amount", expiryDate: "20 Aug 2026", expiryTime: "9:30 PM", customerEmail: "priya.menon@gmail.com", customerMobile: "+91 91234 56780", status: "Created" },
  { id: "plink-3", createdDate: "14 Aug 2026", createdTime: "3:00 PM", paymentLink: "PL4D8N6T", invoiceNumber: "INV-5163", amount: "₹ 25,000", description: "Annual maintenance contract", expiryDate: "16 Aug 2026", expiryTime: "3:00 PM", customerEmail: "arjun.verma@outlook.com", customerMobile: "+91 99887 65432", status: "Expired" },
  { id: "plink-4", createdDate: "15 Aug 2026", createdTime: "1:00 PM", paymentLink: "PL2X5V8W", invoiceNumber: "INV-5164", amount: "₹ 30,000", description: "Product return refund", expiryDate: "22 Aug 2026", expiryTime: "1:00 PM", customerEmail: "sneha.iyer@yahoo.com", customerMobile: "+91 90123 45678", status: "Cancelled" },
  { id: "plink-5", createdDate: "16 Aug 2026", createdTime: "2:45 PM", paymentLink: "PL6B3Y1Z", invoiceNumber: "INV-5165", amount: "₹ 35,000", description: "Event registration fee", expiryDate: "23 Aug 2026", expiryTime: "2:45 PM", customerEmail: "vikram.rao@gmail.com", customerMobile: "+91 98765 12340", status: "Fully paid" },
  { id: "plink-6", createdDate: "17 Aug 2026", createdTime: "4:30 PM", paymentLink: "PL1C9F4G", invoiceNumber: "-", amount: "₹ 5,000", description: "-", expiryDate: "24 Aug 2026", expiryTime: "4:30 PM", customerEmail: "neha.kapoor@pinelabs-demo.in", customerMobile: "+91 93456 78901", status: "Created" },
  { id: "plink-7", createdDate: "18 Aug 2026", createdTime: "11:15 AM", paymentLink: "PL8J2K5H", invoiceNumber: "INV-5167", amount: "₹ 45,000", description: "Franchise onboarding fee", expiryDate: "20 Aug 2026", expiryTime: "11:15 AM", customerEmail: "amitkumar@rediffmail.com", customerMobile: "+91 97654 32109", status: "Expired" },
  { id: "plink-8", createdDate: "19 Aug 2026", createdTime: "8:00 AM", paymentLink: "PL3P7Q9S", invoiceNumber: "INV-5168", amount: "₹ 50,000", description: "Wholesale order advance", expiryDate: "26 Aug 2026", expiryTime: "8:00 AM", customerEmail: "divya.nair@gmail.com", customerMobile: "+91 96543 21098", status: "Fully paid" },
]

export function PaymentLinksListingContent() {
  const [rows, setRows] = useState<PaymentLinkRow[]>(DUMMY_PAYMENT_LINK_ROWS)
  const [searchField, setSearchField] = useState<SearchField>("paymentId")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentLinkStatus>("all")
  const [createOpen, setCreateOpen] = useState(false)
  const [createSeed, setCreateSeed] = useState<Partial<CreatePaymentLinkValues> | undefined>(undefined)
  const dateRangeFilter = useDateRangeFilter()

  function openCreateSheet(seed?: Partial<CreatePaymentLinkValues>) {
    setCreateSeed(seed)
    setCreateOpen(true)
  }

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false
      return matchesSearchField(row, searchField, searchQuery)
    })
  }, [rows, searchField, searchQuery, statusFilter])

  const hasActiveFilters = searchQuery.trim().length > 0 || statusFilter !== "all"
  const activeSearchField = SEARCH_FIELDS.find((field) => field.id === searchField)!

  function handleCreate(values: CreatePaymentLinkValues) {
    const { date, time } = formatCreatedNow()
    const newRow: PaymentLinkRow = {
      id: `plink-${Date.now()}`,
      createdDate: date,
      createdTime: time,
      paymentLink: generatePaymentLinkId(),
      invoiceNumber: values.invoiceNumber || "-",
      amount: `₹ ${Number(values.amount || 0).toLocaleString("en-IN")}`,
      description: values.description || "-",
      expiryDate: values.expiry.date ? values.expiry.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-",
      expiryTime: values.expiry.date ? values.expiry.time : "",
      customerEmail: values.customerEmail,
      customerMobile: values.customerMobile,
      status: "Created",
    }
    setRows((current) => [newRow, ...current])
    toast.success(`Payment link ${newRow.paymentLink} generated`)
  }

  function duplicateLink(row: PaymentLinkRow) {
    openCreateSheet({
      amount: row.amount.replace(/[^\d.]/g, ""),
      description: row.description === "-" ? "" : row.description,
      customerEmail: row.customerEmail,
      invoiceNumber: row.invoiceNumber === "-" ? "" : row.invoiceNumber,
      customerMobile: row.customerMobile,
    })
  }

  function copyPaymentLink(row: PaymentLinkRow) {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(row.paymentLink).catch(() => {
        // no-op fallback
      })
    }
  }

  const columns: Array<ListingColumn<PaymentLinkRow>> = [
    { key: "link", header: "Payment link ID", cell: (row) => row.paymentLink },
    { key: "invoice", header: "Invoice no", cell: (row) => row.invoiceNumber },
    { key: "amount", header: "Original Amount", cell: (row) => row.amount },
    {
      key: "created",
      header: "Created on",
      cell: (row) => (
        <div>
          <p>{row.createdDate}</p>
          <p className="text-xs text-muted-foreground">{row.createdTime}</p>
        </div>
      ),
    },
    {
      key: "expiry",
      header: "Expiry date",
      cell: (row) => (
        <div>
          <p>{row.expiryDate}</p>
          <p className="text-xs text-muted-foreground">{row.expiryTime}</p>
        </div>
      ),
    },
    { key: "description", header: "Description", cell: (row) => row.description },
    { key: "status", header: "Status", cell: (row) => <StatusPill label={row.status} tone={toPaymentLinkTone(row.status)} /> },
    {
      key: "action",
      header: "Action",
      align: "right",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Row actions">
              <DotsThreeVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={() => copyPaymentLink(row)}>
              <CopyIcon className="h-4 w-4" />
              Copy link
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => duplicateLink(row)}>Duplicate link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const customToolbar = (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <InputGroup className="w-[289px]">
          <InputGroupAddon>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <InputGroupButton>
                  {activeSearchField.label}
                  <CaretDownIcon className="size-3" />
                </InputGroupButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuRadioGroup value={searchField} onValueChange={(value) => setSearchField(value as SearchField)}>
                  {SEARCH_FIELDS.map((field) => (
                    <DropdownMenuRadioItem key={field.id} value={field.id}>
                      {field.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </InputGroupAddon>
          <InputGroupInput
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={`Enter ${activeSearchField.label.toLowerCase()}`}
          />
        </InputGroup>

        <Separator orientation="vertical" className="h-8" />

        <Popover open={dateRangeFilter.filter.popoverOpen} onOpenChange={dateRangeFilter.filter.onPopoverOpenChange}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className={cn("h-8 gap-1.5 rounded-[8px] border-input bg-background text-sm font-medium", FILTER_BUTTON_FOCUS_CLASSES)}>
              {dateRangeFilter.filter.icon}
              {dateRangeFilter.filter.value}
              <CaretDownIcon className={FILTER_BUTTON_CARET_CLASSES} />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={10} className="w-[760px] gap-0 border-0 p-0 shadow-none ring-0">
            {dateRangeFilter.filter.popoverContent}
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" className={cn("h-8 gap-1.5 rounded-[8px] border-input bg-background text-sm font-medium", FILTER_BUTTON_FOCUS_CLASSES)}>
              {statusFilter === "all" ? "Status" : statusFilter}
              <CaretDownIcon className={FILTER_BUTTON_CARET_CLASSES} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
              <DropdownMenuRadioItem value="all">All status</DropdownMenuRadioItem>
              {STATUS_OPTIONS.map((status) => (
                <DropdownMenuRadioItem key={status} value={status}>
                  {status}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Button variant="outline" className="h-8 gap-1.5 rounded-[8px] border-input bg-background text-sm font-medium">
        <DownloadIcon className="h-4 w-4" />
        Download filtered
      </Button>
    </div>
  )

  const showRichEmptyState = rows.length === 0 && !hasActiveFilters

  return (
    <>
      <TransactionStyleListingPage
        title="Payment links"
        primaryAction={
          <Button onClick={() => openCreateSheet()}>
            <PlusIcon className="h-3.5 w-3.5" />
            New payment link
          </Button>
        }
        search={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search payment link"
        filters={[]}
        customToolbar={customToolbar}
        columns={columns}
        rows={showRichEmptyState ? [] : filteredRows}
        emptyText={
          showRichEmptyState ? (
            <Empty className="border-0 py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <LinkBreakIcon className="h-4 w-4" />
                </EmptyMedia>
                <EmptyTitle className="text-foreground">No payment links created yet</EmptyTitle>
                <EmptyDescription>Create a payment link to view it&apos;s status and details here</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={() => openCreateSheet()}>
                  <PlusIcon className="h-4 w-4" />
                  Create payment link now
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            "No payment links found for current filters."
          )
        }
        totalRows={showRichEmptyState ? 0 : filteredRows.length}
        totalPages={1}
      />
      <CreatePaymentLinkSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreate}
        initialValues={createSeed}
      />
    </>
  )
}
