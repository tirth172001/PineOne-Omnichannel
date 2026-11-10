"use client"

import { useState } from "react"
import { JourneyLink as Link } from "@/components/getting-started/navigation"
import {
  BankIcon,
  CheckCircleIcon,
  CheckIcon,
  CircleNotchIcon,
  CreditCardIcon,
  FastForwardIcon,
  QrCodeIcon,
  TruckIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  advanceOrder,
  activateProduct,
  getInstallationGuide,
  type GettingStartedState,
  ORDER_STATUSES,
  type OrderStatus,
  updateGettingStarted,
  updateJourney,
  useGettingStarted,
} from "@/lib/getting-started"
import { getDevice, INR } from "./catalog"
import { DeviceArt } from "./device-art"
import { cartTotals } from "./product-setup"
import { SetupFrame } from "./setup-frame"

const PAY_METHODS = [
  { id: "upi", label: "UPI", body: "Any UPI app", icon: QrCodeIcon },
  { id: "card", label: "Card", body: "Credit or debit", icon: CreditCardIcon },
  { id: "netbanking", label: "Netbanking", body: "All major banks", icon: BankIcon },
]

const PAYMENT_STEPS = ["Order", "Pay", "Delivery", "Set up"]

/** Pay for the terminals. Paying creates the order and starts tracking. */
export function TerminalPayment() {
  const state = useGettingStarted()
  const [method, setMethod] = useState("upi")
  const [paying, setPaying] = useState(false)
  const totals = cartTotals(state.cart)

  function pay() {
    if (paying) return
    setPaying(true)
    window.setTimeout(() => {
      const now = new Date().toISOString()
      updateGettingStarted((current) => ({
        ...current,
        order: {
          id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          placedAt: now,
          status: "placed",
          history: { placed: now },
          lines: current.cart,
          amountPaid: totals.payNow,
          paidWith: PAY_METHODS.find((option) => option.id === method)?.label ?? "UPI",
          courier: "Blue Dart",
          awb: `BD${Math.floor(1e9 + Math.random() * 9e9)}`,
        },
      }))
      updateJourney("in-store", { stage: "shipping" })
    }, 1200)
  }

  return (
    <SetupFrame
      product="in-store"
      stepIndex={1}
      steps={PAYMENT_STEPS}
      title="Pay for your order"
      subtitle="Simulate payment to place your order and try delivery tracking. No money is charged."
      onBack={paying ? undefined : () => updateJourney("in-store", { stage: "setup", step: 4 })}
      onContinue={pay}
      continueLabel={paying ? "Processing…" : `Pay ${INR.format(totals.payNow)} (demo)`}
      canContinue={!paying && state.cart.length > 0}
      aside={
        <div className="rounded-xl bg-muted/50 p-5 text-sm">
          <p className="font-semibold text-foreground">Order summary</p>
          <ul className="mt-3 space-y-2">
            {state.cart.map((line) => (
              <li key={`${line.deviceId}-${line.plan}`} className="flex justify-between gap-3">
                <span className="text-foreground">
                  {getDevice(line.deviceId).name} × {line.qty}
                </span>
                <span className="text-muted-foreground">{line.plan === "lifetime" ? "Buy" : "Rent"}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1.5 border-t border-border/70 pt-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">One-time</span>
              <span>{INR.format(totals.oneTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST (18%)</span>
              <span>{INR.format(totals.gst)}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-semibold">
              <span>Pay now</span>
              <span>{INR.format(totals.payNow)}</span>
            </div>
            {totals.monthly ? (
              <p className="pt-2 text-xs text-muted-foreground">
                Then {INR.format(totals.monthly)}/month rental, deducted from your settlements from next month.
              </p>
            ) : null}
          </div>
        </div>
      }
    >
      <div className="space-y-2">
        {PAY_METHODS.map((option) => {
          const Icon = option.icon
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setMethod(option.id)}
              aria-pressed={method === option.id}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left",
                method === option.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/60"
              )}
            >
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1">
                <span className="block text-sm font-medium text-foreground">{option.label}</span>
                <span className="block text-xs text-muted-foreground">{option.body}</span>
              </span>
              {method === option.id ? <CheckIcon className="h-4 w-4 text-primary" weight="bold" /> : null}
            </button>
          )
        })}
      </div>
      {paying ? (
        <p role="status" className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <CircleNotchIcon className="h-4 w-4 animate-spin" /> Waiting for your bank to confirm…
        </p>
      ) : null}
    </SetupFrame>
  )
}

export const ORDER_STATUS_COPY: Record<OrderStatus, { label: string; body: string }> = {
  placed: { label: "Order placed", body: "Payment received. We're getting your terminals ready." },
  packed: { label: "Packed", body: "Your terminals are set up with your store details and packed." },
  shipped: { label: "Shipped", body: "Handed to the courier." },
  "out-for-delivery": { label: "Out for delivery", body: "Arriving today. Keep someone at the store to receive it." },
  delivered: { label: "Delivered", body: "Your terminals have arrived. Time to set them up." },
}

function formatWhen(iso?: string) {
  if (!iso) return ""
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
}

function expectedBy(order: NonNullable<GettingStartedState["order"]>) {
  const date = new Date(order.placedAt)
  date.setDate(date.getDate() + 4)
  return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
}

/** Status stepper — used full-size on In-store and compact on Overview. */
export function OrderTimeline({ order, compact = false }: { order: NonNullable<GettingStartedState["order"]>; compact?: boolean }) {
  const currentIndex = ORDER_STATUSES.indexOf(order.status)

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {ORDER_STATUSES.map((status, index) => (
          <div key={status} className="flex flex-1 flex-col gap-1.5">
            <span className={cn("h-1 rounded-full", index <= currentIndex ? "bg-primary" : "bg-muted")} />
            <span className={cn("truncate text-[11px]", index === currentIndex ? "font-medium text-foreground" : "text-muted-foreground")}>
              {ORDER_STATUS_COPY[status].label}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <ol>
      {ORDER_STATUSES.map((status, index) => {
        const done = index <= currentIndex
        const last = index === ORDER_STATUSES.length - 1
        return (
          <li key={status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full",
                  done ? "bg-primary text-primary-foreground" : "border border-border bg-background"
                )}
              >
                {done ? <CheckIcon className="h-3 w-3" weight="bold" /> : null}
              </span>
              {last ? null : <span className={cn("w-px flex-1", index < currentIndex ? "bg-primary" : "bg-border")} />}
            </div>
            <div className={cn("pb-6", last && "pb-0")}>
              <p className={cn("text-sm", done ? "font-medium text-foreground" : "text-muted-foreground")}>{ORDER_STATUS_COPY[status].label}</p>
              {index === currentIndex ? <p className="mt-0.5 text-sm text-muted-foreground">{ORDER_STATUS_COPY[status].body}</p> : null}
              {order.history[status] ? <p className="mt-0.5 text-xs text-muted-foreground">{formatWhen(order.history[status])}</p> : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function OrderTracking() {
  const state = useGettingStarted()
  const order = state.order
  if (!order) return null
  const delivered = order.status === "delivered"

  return (
    <SetupFrame
      product="in-store"
      stepIndex={delivered ? 3 : 2}
      steps={PAYMENT_STEPS}
      title={delivered ? "Your terminals have arrived" : `Arriving by ${expectedBy(order)}`}
      subtitle={`Order ${order.id} · paid ${INR.format(order.amountPaid)} by ${order.paidWith}`}
      onContinue={delivered ? () => updateJourney("in-store", { stage: "install" }) : undefined}
      continueLabel="Start setup"
      aside={
        <div className="space-y-4">
          <div className="rounded-xl bg-muted/50 p-5 text-sm">
            <p className="font-semibold text-foreground">In this box</p>
            <ul className="mt-3 space-y-3">
              {order.lines.map((line) => (
                <li key={`${line.deviceId}-${line.plan}`} className="flex items-center gap-3">
                  <DeviceArt id={getDevice(line.deviceId).id} className="h-10 w-10" />
                  <span className="text-foreground">
                    {getDevice(line.deviceId).name} × {line.qty}
                  </span>
                </li>
              ))}
            </ul>
            {state.delivery ? (
              <p className="mt-4 border-t border-border/70 pt-3 text-muted-foreground">
                To {state.delivery.storeName}, {state.delivery.address}, {state.delivery.city} {state.delivery.pincode}
              </p>
            ) : null}
          </div>
          <div className="rounded-xl border border-dashed border-border p-4">
            <p className="text-xs font-medium text-muted-foreground">Demo only</p>
            <p className="mt-1 text-xs text-muted-foreground">Stands in for courier updates.</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={advanceOrder} disabled={delivered}>
              <FastForwardIcon /> Next status
            </Button>
          </div>
        </div>
      }
    >
      <div className="rounded-xl border border-border/70 p-5">
        <div className="mb-5 flex items-center gap-3 border-b border-border/60 pb-4">
          <TruckIcon className="h-5 w-5 text-muted-foreground" />
          <div className="text-sm">
            <p className="font-medium text-foreground">{order.courier}</p>
            <p className="text-muted-foreground">Tracking number {order.awb}</p>
          </div>
        </div>
        <OrderTimeline order={order} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        We'll message you on every update. You can also follow it from your Overview.
      </p>
    </SetupFrame>
  )
}

export function SetupGuide() {
  const state = useGettingStarted()
  const guide = getInstallationGuide(state.order?.lines ?? [])
  const done = state.journeys["in-store"].guideDone
  const allDone = guide.every((item) => done.includes(item.id))

  function toggle(id: string) {
    updateJourney("in-store", { guideDone: done.includes(id) ? done.filter((value) => value !== id) : [...done, id] })
  }

  return (
    <SetupFrame
      product="in-store"
      stepIndex={3}
      steps={PAYMENT_STEPS}
      title="Set up your terminals"
      subtitle="Four steps, about 15 minutes. Tick each one off as you go."
      onContinue={() => activateProduct("in-store")}
      continueLabel="Finish setup"
      canContinue={allDone}
      aside={
        <div className="rounded-xl bg-muted/50 p-5 text-sm">
          <p className="font-semibold text-foreground">Stuck?</p>
          <p className="mt-1 text-muted-foreground">Find setup answers and ways to contact the support team.</p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link href="/support">Open support</Link>
          </Button>
        </div>
      }
    >
      <ol className="space-y-2">
        {guide.map((item, index) => {
          const checked = done.includes(item.id)
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-pressed={checked}
                className={cn(
                  "flex w-full gap-3 rounded-xl border p-4 text-left transition-colors",
                  checked ? "border-success/40 bg-success/5" : "border-border hover:bg-muted/50"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                    checked ? "bg-success text-white" : "bg-muted text-muted-foreground"
                  )}
                >
                  {checked ? <CheckIcon className="h-3 w-3" weight="bold" /> : index + 1}
                </span>
                <span>
                  <span className="block text-sm font-medium text-foreground">{item.title}</span>
                  <span className="mt-0.5 block text-sm leading-5 text-muted-foreground">{item.body}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      {allDone ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-success">
          <CheckCircleIcon className="h-4 w-4" /> Setup checklist complete. Finish to try your live workspace.
        </p>
      ) : null}
    </SetupFrame>
  )
}
