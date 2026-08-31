"use client"

import { useEffect, useState } from "react"
import { DateTimePicker, type DateTimeValue } from "@/components/shared/date-time-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

const DESCRIPTION_MAX_LENGTH = 110

export interface CreatePaymentLinkValues {
  amount: string
  description: string
  customerEmail: string
  invoiceNumber: string
  customerMobile: string
  expiry: DateTimeValue
}

function defaultExpiry(): DateTimeValue {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return { date, time: "10:30 AM" }
}

function emptyValues(): CreatePaymentLinkValues {
  return {
    amount: "",
    description: "",
    customerEmail: "",
    invoiceNumber: "",
    customerMobile: "",
    expiry: defaultExpiry(),
  }
}

export interface CreatePaymentLinkSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (values: CreatePaymentLinkValues) => void
  /** Pre-fills the form, e.g. when duplicating an existing link. */
  initialValues?: Partial<CreatePaymentLinkValues>
}

export function CreatePaymentLinkSheet({ open, onOpenChange, onCreate, initialValues }: CreatePaymentLinkSheetProps) {
  const [values, setValues] = useState<CreatePaymentLinkValues>(emptyValues)

  useEffect(() => {
    if (open) setValues({ ...emptyValues(), ...initialValues })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const hasCustomerContact = values.customerEmail.trim().length > 0 || values.customerMobile.trim().length > 0
  const canCreate = values.amount.trim().length > 0 && hasCustomerContact && Boolean(values.expiry.date)

  function handleCreate() {
    if (!canCreate) return
    onCreate(values)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-md"
        a11yTitle="Create new payment link"
        a11yDescription="Collect a payment by sharing a link with your customer."
      >
        <SheetHeader>
          <SheetTitle>Create new payment link</SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="link-amount">Amount to be collected</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
              <Input
                id="link-amount"
                inputMode="decimal"
                value={values.amount}
                onChange={(event) => setValues((current) => ({ ...current, amount: event.target.value.replace(/[^\d.]/g, "") }))}
                placeholder="0"
                className="pl-6"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-description">Description</Label>
            <Textarea
              id="link-description"
              value={values.description}
              onChange={(event) => setValues((current) => ({ ...current, description: event.target.value.slice(0, DESCRIPTION_MAX_LENGTH) }))}
              placeholder="Payment for Invoice Number 20758TYUS"
              className="min-h-24"
            />
            <p className="text-xs text-muted-foreground">
              {DESCRIPTION_MAX_LENGTH - values.description.length} characters left
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-customer-email">Customer email id</Label>
            <Input
              id="link-customer-email"
              type="email"
              value={values.customerEmail}
              onChange={(event) => setValues((current) => ({ ...current, customerEmail: event.target.value }))}
              placeholder="test@pinelabs.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-invoice-number">Invoice number</Label>
            <Input
              id="link-invoice-number"
              value={values.invoiceNumber}
              onChange={(event) => setValues((current) => ({ ...current, invoiceNumber: event.target.value }))}
              placeholder="Invoice number for payment"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-customer-mobile">Customer mobile</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+91</span>
              <Input
                id="link-customer-mobile"
                inputMode="numeric"
                value={values.customerMobile}
                onChange={(event) => setValues((current) => ({ ...current, customerMobile: event.target.value.replace(/\D/g, "").slice(0, 10) }))}
                placeholder="8950948704"
                className="pl-11"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Add at least one customer mobile or email. Payment links and reminders will be sent here.
          </p>

          <div className="space-y-2">
            <Label>Link expiry date</Label>
            <DateTimePicker
              value={values.expiry}
              onChange={(expiry) => setValues((current) => ({ ...current, expiry }))}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </div>
        </div>

        <SheetFooter className="border-t border-border/70 px-6 py-4">
          <Button onClick={handleCreate} disabled={!canCreate}>
            Create payment link
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
