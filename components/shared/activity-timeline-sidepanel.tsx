"use client"

import { useEffect, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  CopyIcon,
  CreditCardIcon,
  MinusIcon,
  XCircleIcon,
  XIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

export type ActivityEventTone = "success" | "failed" | "processing" | "initiated"

export type ActivityEventDetail = {
  label: string
  value: string
}

export type ActivityEvent = {
  id: string
  title: string
  timestamp: string
  tone: ActivityEventTone
  badge?: string
  details: ActivityEventDetail[]
}

type LabelValue = {
  label: string
  value: string
  copyable?: boolean
}

function SidepanelFieldRow({ left, right, tall = false }: { left: LabelValue; right: LabelValue; tall?: boolean }) {
  return (
    <div className={`flex w-full items-start gap-3 ${tall ? "min-h-16" : "min-h-11"}`}>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-sm leading-5 text-muted-foreground">{left.label}</p>
        <div className="flex items-center gap-1">
          <p className="text-sm leading-5 text-foreground">{left.value}</p>
          {left.copyable ? <CopyIcon className="h-4 w-4 text-muted-foreground" /> : null}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-sm leading-5 text-muted-foreground">{right.label}</p>
        <div className="flex items-center gap-1">
          <p className="whitespace-pre-line text-sm leading-5 text-foreground">{right.value}</p>
          {right.copyable ? <CopyIcon className="h-4 w-4 text-muted-foreground" /> : null}
        </div>
      </div>
    </div>
  )
}

export function DetailSidepanelShell({
  open,
  onOpenChange,
  title,
  desktopWidth = 458,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  desktopWidth?: number
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onOpenChange, open])

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="detail-panel-backdrop"
            className="fixed inset-0 z-40 bg-black/10 supports-backdrop-filter:backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => onOpenChange(false)}
          />

          <motion.aside
            key="detail-panel-desktop"
            className="fixed z-50 hidden overflow-hidden rounded-xl border border-muted bg-card lg:flex lg:flex-col"
            style={{
              right: 16,
              top: "calc(var(--dashboard-top-offset, 64px) + 16px)",
              height: "calc(100vh - var(--dashboard-top-offset, 64px) - 32px)",
              width: desktopWidth,
            }}
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-muted px-6 pr-4">
              <p className="text-base leading-6 text-muted-foreground">{title}</p>
              <Button
                variant="outline"
                size="icon-sm"
                className="h-7 w-7 rounded-md border-input bg-input/30"
                onClick={() => onOpenChange(false)}
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Close panel</span>
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.aside>

          <motion.aside
            key="detail-panel-mobile"
            className="fixed inset-x-2 bottom-3 z-50 h-[min(86dvh,980px)] overflow-hidden rounded-xl border border-muted bg-card lg:hidden"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex h-full flex-col">
              <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-muted px-6 pr-4">
                <p className="text-base leading-6 text-muted-foreground">{title}</p>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="h-7 w-7 rounded-md border-input bg-input/30"
                  onClick={() => onOpenChange(false)}
                >
                  <XIcon className="h-4 w-4" />
                  <span className="sr-only">Close panel</span>
                </Button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}

export function ActivityTimelineSidepanel({
  open,
  onOpenChange,
  event,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: ActivityEvent | null
}) {
  return (
    <DetailSidepanelShell open={open && Boolean(event)} onOpenChange={onOpenChange} title="Transaction details">
      {event ? (
        <>
          <section className="border-b border-muted px-6 py-6">
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary p-1.5">
                      <CreditCardIcon className="h-6 w-6 text-primary-foreground" />
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-[24px] font-semibold leading-8 text-foreground">₹20,00,000</p>
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-xs leading-none text-foreground">
                        <XCircleIcon className="h-3 w-3 text-destructive" />
                        Failure
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm leading-5 text-muted-foreground">
                      <span>HDFC credit card</span>
                      <MinusIcon className="h-4 w-4 rotate-90 text-border" />
                      <span>xx8787</span>
                      <MinusIcon className="h-4 w-4 rotate-90 text-border" />
                      <span>VISA network</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <SidepanelFieldRow
                      left={{ label: "Transaction ID", value: "txn-11734237493019", copyable: true }}
                      right={{ label: "Original transaction amount", value: "₹20,00,000" }}
                    />
                    <SidepanelFieldRow
                      left={{ label: "Card category", value: "Super premium" }}
                      right={{ label: "Customer VPA", value: "srv*****kaoksbi" }}
                    />
                    <SidepanelFieldRow
                      left={{ label: "Payer name", value: "Ms P********AVA" }}
                      right={{ label: "Response message", value: "NA" }}
                    />
                    <SidepanelFieldRow
                      left={{ label: "Payment link", value: "/my-pay-101023", copyable: true }}
                      right={{ label: "Payment link description", value: "testing" }}
                    />
                    <SidepanelFieldRow
                      left={{ label: "Invoice number", value: "NA" }}
                      right={{ label: "EMI type", value: "No cost" }}
                    />
                    <SidepanelFieldRow
                      left={{ label: "EMI Program", value: "Bank EMI" }}
                      right={{ label: "EMI type", value: "No cost" }}
                    />
                  </div>
                </div>
              </section>

              <section className="border-b border-muted px-6 py-6">
                <p className="text-base font-semibold leading-6 text-foreground">Error details</p>
                <div className="mt-4 flex flex-col gap-4">
                  <SidepanelFieldRow
                    left={{ label: "Error reason", value: "CONVENIENCE_FEE_\nNOT_CONFIGURED" }}
                    right={{ label: "Error code", value: "OPERATION_NOT_ALLOWED" }}
                    tall
                  />
                  <SidepanelFieldRow
                    left={{ label: "Error message", value: "Convenience fee not configured\nfor merchant" }}
                    right={{ label: "Error step", value: "Payment initiation" }}
                    tall
                  />
                  <SidepanelFieldRow
                    left={{ label: "Error source", value: "Configurations" }}
                    right={{ label: "HTTP status code", value: "422" }}
                  />
                </div>
              </section>

              <section className="px-6 py-6">
                <p className="text-base font-semibold leading-6 text-foreground">Custom fields</p>
                <div className="mt-4 flex flex-col gap-4">
                  <SidepanelFieldRow
                    left={{ label: "Field 1", value: "Testing" }}
                    right={{ label: "Field 2", value: "Testing" }}
                  />
                  <SidepanelFieldRow
                    left={{ label: "Field 3", value: "Testing" }}
                    right={{ label: "Field 4", value: "Testing" }}
                  />
                </div>
              </section>
        </>
      ) : null}
    </DetailSidepanelShell>
  )
}
