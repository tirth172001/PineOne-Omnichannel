"use client"

import { useState } from "react"
import { CheckIcon, MinusIcon, PlusIcon, ShoppingCartIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  type BankDetails,
  type BusinessDetails,
  type CartLine,
  type GettingStartedState,
  type ProductId,
  updateGettingStarted,
  updateJourney,
  useGettingStarted,
  useSetupDraft,
} from "@/lib/getting-started"
import { DEVICES, getDevice, INR, PRODUCTS, type Device } from "./catalog"
import { DeviceArt } from "./device-art"
import { AlreadyAdded, Field, SetupFrame } from "./setup-frame"
import { OnlineOnboarding } from "./online/online-onboarding"

type StepProps = { product: ProductId; state: GettingStartedState; step: number }

function goTo(product: ProductId, step: number) {
  updateJourney(product, { stage: "setup", step })
}

function back(product: ProductId, step: number) {
  if (step === 0) updateJourney(product, { stage: "intro", step: 0 })
  else goTo(product, step - 1)
}

export function ProductSetup({ product }: { product: ProductId }) {
  const state = useGettingStarted()
  const step = state.journeys[product].step
  const props = { product, state, step }

  if (product === "in-store") {
    if (step === 0) return null // Device selection lives on the product page, before this flow.
    if (step === 1) return <DeliveryStep {...props} />
    if (step === 2) return <BusinessStep {...props} />
    if (step === 3) return <BankStep {...props} />
    return <ReviewOrderStep {...props} />
  }
  return <OnlineOnboarding product={product} />
}

/* ---------- Shared: business and bank ---------- */

function sourceOf(state: GettingStartedState, product: ProductId) {
  const other = (["in-store", "payment-links", "checkout"] as ProductId[]).find(
    (id) => id !== product && state.journeys[id].stage !== "intro"
  )
  return other ? PRODUCTS[other].shortName : null
}

function BusinessStep({ product, state, step }: StepProps) {
  const [editing, setEditing] = useState(!state.business)
  const [form, setForm] = useSetupDraft(product, "business",
    state.business ?? { legalName: "", pan: "", businessType: "Sole proprietorship", gstin: "" }
  )
  const valid = form.legalName.trim().length > 1 && /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan.trim().toUpperCase())
  const source = sourceOf(state, product)

  function save() {
    if (editing) {
      updateGettingStarted((current) => ({ ...current, business: { ...form, pan: form.pan.trim().toUpperCase() } }))
    }
    goTo(product, step + 1)
  }

  return (
    <SetupFrame
      product={product}
      stepIndex={step}
      title="Tell us about your business"
      subtitle="We verify these with the government records to keep your payments safe. You only do this once for every product."
      onBack={() => back(product, step)}
      onContinue={save}
      canContinue={!editing || valid}
    >
      {!editing && state.business ? (
        <AlreadyAdded
          title={source ? `Added while setting up ${source}` : "Business details added"}
          rows={[
            ["Legal name", state.business.legalName],
            ["PAN", state.business.pan],
            ["Business type", state.business.businessType],
          ]}
          onEdit={() => setEditing(true)}
        />
      ) : (
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Business type</p>
            <div className="grid grid-cols-2 gap-2">
              {["Sole proprietorship", "Partnership", "Private limited", "Individual"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, businessType: type })}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                    form.businessType === type ? "border-primary bg-primary/5 font-medium text-foreground" : "border-border hover:bg-muted/60"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <Field id="legal-name" label="Legal business name" value={form.legalName} onChange={(legalName) => setForm({ ...form, legalName })} placeholder="As on your PAN" />
          <Field id="pan" label="Business PAN" value={form.pan} onChange={(pan) => setForm({ ...form, pan: pan.toUpperCase() })} placeholder="ABCDE1234F" hint="10 characters, like ABCDE1234F" />
          <Field id="gstin" label="GSTIN (optional)" value={form.gstin} onChange={(gstin) => setForm({ ...form, gstin })} placeholder="Add it to get GST invoices" />
        </div>
      )}
    </SetupFrame>
  )
}

function BankStep({ product, state, step }: StepProps) {
  const [editing, setEditing] = useState(!state.bank)
  const [form, setForm] = useSetupDraft(product, "bank", state.bank ?? { holder: state.business?.legalName ?? "", account: "", ifsc: "" })
  const valid = form.holder.trim().length > 1 && form.account.replace(/\D/g, "").length >= 9 && /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(form.ifsc.trim())
  const source = sourceOf(state, product)

  function save() {
    if (editing) updateGettingStarted((current) => ({ ...current, bank: { ...form, ifsc: form.ifsc.trim().toUpperCase() } }))
    goTo(product, step + 1)
  }

  return (
    <SetupFrame
      product={product}
      stepIndex={step}
      title="Where should we send your money?"
      subtitle="Payments you receive are settled to this account, usually the next working day. We'll send ₹1 to check it."
      onBack={() => back(product, step)}
      onContinue={save}
      canContinue={!editing || valid}
    >
      {!editing && state.bank ? (
        <AlreadyAdded
          title={source ? `Added while setting up ${source}` : "Bank account added"}
          rows={[
            ["Account holder", state.bank.holder],
            ["Account", `•••• ${state.bank.account.slice(-4)}`],
            ["IFSC", state.bank.ifsc],
          ]}
          onEdit={() => setEditing(true)}
        />
      ) : (
        <div className="space-y-5">
          <Field id="holder" label="Account holder name" value={form.holder} onChange={(holder) => setForm({ ...form, holder })} />
          <Field id="account" label="Account number" inputMode="numeric" value={form.account} onChange={(account) => setForm({ ...form, account })} />
          <Field id="ifsc" label="IFSC" value={form.ifsc} onChange={(ifsc) => setForm({ ...form, ifsc: ifsc.toUpperCase() })} placeholder="HDFC0001234" hint="On your cheque book or passbook" />
        </div>
      )}
    </SetupFrame>
  )
}

/* ---------- In-store ---------- */

export function cartTotals(cart: CartLine[]) {
  let oneTime = 0
  let monthly = 0
  for (const line of cart) {
    const device = getDevice(line.deviceId)
    if (line.plan === "lifetime") oneTime += device.lifetime * line.qty
    else {
      oneTime += device.rentalSetup * line.qty
      monthly += device.rentalMonthly * line.qty
    }
  }
  const gst = Math.round(oneTime * 0.18)
  return { oneTime, monthly, gst, payNow: oneTime + gst }
}

export function CartSummary({ cart, showLines = true }: { cart: CartLine[]; showLines?: boolean }) {
  const totals = cartTotals(cart)
  return (
    <div className="rounded-xl bg-muted/50 p-5">
      <p className="text-sm font-semibold text-foreground">Your order</p>
      {cart.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">Add a device to see your total.</p>
      ) : (
        <>
          {showLines ? (
            <ul className="mt-3 space-y-2 text-sm">
              {cart.map((line) => (
                <li key={`${line.deviceId}-${line.plan}`} className="flex justify-between gap-3">
                  <span className="text-foreground">
                    {getDevice(line.deviceId).name} × {line.qty}
                    <span className="block text-xs text-muted-foreground">{line.plan === "lifetime" ? "Buy" : "Rent"}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-4 space-y-1.5 border-t border-border/70 pt-3 text-sm">
            <Row label="One-time" value={INR.format(totals.oneTime)} />
            <Row label="GST (18%)" value={INR.format(totals.gst)} />
            {totals.monthly ? <Row label="Monthly rental" value={`${INR.format(totals.monthly)}/month`} /> : null}
            <div className="flex justify-between pt-2 text-base font-semibold text-foreground">
              <span>Pay now</span>
              <span>{INR.format(totals.payNow)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}

function setCart(cart: CartLine[]) {
  updateGettingStarted((state) => ({
    ...state,
    cart: cart.filter((line) => line.qty > 0),
    journeys: { ...state.journeys, "in-store": {
      ...state.journeys["in-store"],
      ...(state.journeys["in-store"].stage === "intro" ? { stage: "setup" as const, step: 0 } : {}),
      updatedAt: new Date().toISOString(),
    } },
  }))
}

function upsertLine(cart: CartLine[], next: CartLine) {
  const rest = cart.filter((line) => !(line.deviceId === next.deviceId && line.plan === next.plan))
  return [...rest, next]
}

export function DevicePicker({ cart }: { cart: CartLine[] }) {
  const [customising, setCustomising] = useState<Device | null>(null)

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {DEVICES.map((device) => {
          const inCart = cart.filter((line) => line.deviceId === device.id).reduce((sum, line) => sum + line.qty, 0)
          return (
            <article key={device.id} className="flex flex-col rounded-xl border border-border/70 p-3">
              <div className="relative rounded-lg bg-muted/50 py-4">
                <span className="absolute left-2 top-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{device.tag}</span>
                <DeviceArt id={device.id} className="mx-auto h-28 w-28" />
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">{device.name}</p>
              <p className="text-xs text-muted-foreground">{device.kind}</p>
              <p className="mt-2 flex-1 text-xs leading-5 text-muted-foreground">{device.features}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  From <span className="font-medium text-foreground">{INR.format(device.rentalMonthly)}/mo</span>
                </p>
                <Button size="sm" variant={inCart ? "secondary" : "outline"} onClick={() => setCustomising(device)}>
                  {inCart ? (
                    <>
                      <CheckIcon /> {inCart} added
                    </>
                  ) : (
                    "Add"
                  )}
                </Button>
              </div>
            </article>
          )
        })}
      </div>

      <CustomiseSheet key={customising?.id ?? "closed"} device={customising} cart={cart} onClose={() => setCustomising(null)} />
    </>
  )
}

function CustomiseSheet({ device, cart, onClose }: { device: Device | null; cart: CartLine[]; onClose: () => void }) {
  const existing = device ? cart.find((line) => line.deviceId === device.id) : undefined
  const [qty, setQty] = useState(existing?.qty ?? 1)
  const [plan, setPlan] = useState<CartLine["plan"]>(existing?.plan ?? "rental")

  return (
    <Sheet
      open={Boolean(device)}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent className="w-full sm:max-w-md" key={device?.id}>
        {device ? (
          <>
            <SheetHeader>
              <SheetTitle>Customise your device</SheetTitle>
              <SheetDescription>{device.name} · {device.kind}</SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-6 overflow-y-auto px-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted/50 p-2">
                  <DeviceArt id={device.id} className="h-14 w-14" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">How many?</p>
                  <p className="text-xs text-muted-foreground">{device.sizingHint}</p>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-border px-1">
                  <Button variant="ghost" size="icon-sm" aria-label="One fewer" onClick={() => setQty(Math.max(1, qty - 1))}>
                    <MinusIcon />
                  </Button>
                  <span className="w-6 text-center text-sm font-medium tabular-nums">{qty}</span>
                  <Button variant="ghost" size="icon-sm" aria-label="One more" onClick={() => setQty(Math.min(20, qty + 1))}>
                    <PlusIcon />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Choose a plan</p>
                <PlanOption
                  selected={plan === "rental"}
                  onSelect={() => setPlan("rental")}
                  title="Rent"
                  rows={[
                    ["Monthly rental", `${INR.format(device.rentalMonthly)}/month`],
                    ["One-time setup", device.rentalSetup ? INR.format(device.rentalSetup) : "Free"],
                  ]}
                  note="Free replacement if it stops working"
                />
                <PlanOption
                  selected={plan === "lifetime"}
                  onSelect={() => setPlan("lifetime")}
                  title="Buy"
                  rows={[["One-time price", INR.format(device.lifetime)]]}
                  note={
                    device.rentalMonthly * 24 + device.rentalSetup > device.lifetime
                      ? `Saves about ${INR.format(device.rentalMonthly * 24 + device.rentalSetup - device.lifetime)} over 2 years`
                      : "Yours to keep, no monthly charge"
                  }
                />
              </div>
            </div>
            <SheetFooter>
              <Button
                size="lg"
                onClick={() => {
                  const without = cart.filter((line) => line.deviceId !== device.id)
                  setCart(upsertLine(without, { deviceId: device.id, plan, qty }))
                  onClose()
                }}
              >
                <ShoppingCartIcon />
                {existing ? "Update order" : "Add to order"}
              </Button>
              {existing ? (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    setCart(cart.filter((line) => line.deviceId !== device.id))
                    onClose()
                  }}
                >
                  Remove from order
                </Button>
              ) : null}
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function PlanOption({
  selected,
  onSelect,
  title,
  rows,
  note,
}: {
  selected: boolean
  onSelect: () => void
  title: string
  rows: Array<[string, string]>
  note: string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-colors",
        selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <span className={cn("flex h-4 w-4 items-center justify-center rounded-full border", selected ? "border-primary bg-primary" : "border-muted-foreground/40")}>
          {selected ? <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" /> : null}
        </span>
      </div>
      <div className="mt-2 space-y-1 text-sm">
        {rows.map(([label, value]) => (
          <Row key={label} label={label} value={value} />
        ))}
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <CheckIcon className="h-3 w-3 text-success" />
        {note}
      </p>
    </button>
  )
}

function DeliveryStep({ product, state, step }: StepProps) {
  const [form, setForm] = useSetupDraft(product, "delivery", state.delivery ?? { storeName: "", address: "", pincode: "", city: "", contact: "" })
  const valid = form.storeName.trim() && form.address.trim() && /^\d{6}$/.test(form.pincode) && form.city.trim() && form.contact.replace(/\D/g, "").length >= 10

  return (
    <SetupFrame
      product={product}
      stepIndex={step}
      title="Where should we deliver?"
      subtitle="Use the store where the terminals will be used — it's saved as your first store."
      onBack={() => back(product, step)}
      onContinue={() => {
        updateGettingStarted((current) => ({ ...current, delivery: form }))
        goTo(product, step + 1)
      }}
      canContinue={Boolean(valid)}
      aside={<CartSummary cart={state.cart} />}
    >
      <div className="space-y-5">
        <Field id="store-name" label="Store name" value={form.storeName} onChange={(storeName) => setForm({ ...form, storeName })} placeholder="What customers see on their receipt" />
        <Field id="address" label="Address" value={form.address} onChange={(address) => setForm({ ...form, address })} placeholder="Shop number, building, street" />
        <div className="grid grid-cols-2 gap-3">
          <Field id="pincode" label="Pincode" inputMode="numeric" value={form.pincode} onChange={(pincode) => setForm({ ...form, pincode: pincode.replace(/\D/g, "").slice(0, 6) })} />
          <Field id="city" label="City" value={form.city} onChange={(city) => setForm({ ...form, city })} />
        </div>
        <Field id="contact" label="Phone for the delivery partner" inputMode="tel" value={form.contact} onChange={(contact) => setForm({ ...form, contact })} />
      </div>
    </SetupFrame>
  )
}

function ReviewOrderStep({ product, state, step }: StepProps) {
  return (
    <SetupFrame
      product={product}
      stepIndex={step}
      title="Review your order"
      subtitle="Check the devices and where they're going. You'll pay on the next screen."
      onBack={() => back(product, step)}
      onContinue={() => updateJourney(product, { stage: "payment" })}
      continueLabel="Continue to payment"
      canContinue={state.cart.length > 0}
      aside={<CartSummary cart={state.cart} showLines={false} />}
    >
      <div className="space-y-3">
        {state.cart.map((line) => {
          const device = getDevice(line.deviceId)
          return (
            <div key={`${line.deviceId}-${line.plan}`} className="flex items-center gap-4 rounded-xl border border-border/70 p-3">
              <div className="rounded-lg bg-muted/50 p-1.5">
                <DeviceArt id={device.id} className="h-14 w-14" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{device.name}</p>
                <p className="text-xs text-muted-foreground">
                  {line.plan === "lifetime"
                    ? `Buy · ${INR.format(device.lifetime)} each`
                    : `Rent · ${INR.format(device.rentalMonthly)}/month${device.rentalSetup ? ` + ${INR.format(device.rentalSetup)} setup` : ""} each`}
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-border px-1">
                <Button variant="ghost" size="icon-sm" aria-label="One fewer" onClick={() => setCart(upsertLine(state.cart, { ...line, qty: line.qty - 1 }))}>
                  <MinusIcon />
                </Button>
                <span className="w-6 text-center text-sm font-medium tabular-nums">{line.qty}</span>
                <Button variant="ghost" size="icon-sm" aria-label="One more" onClick={() => setCart(upsertLine(state.cart, { ...line, qty: line.qty + 1 }))}>
                  <PlusIcon />
                </Button>
              </div>
            </div>
          )
        })}
        <Button variant="outline" onClick={() => goTo(product, 0)}>
          <PlusIcon /> Add more devices
        </Button>

        {state.delivery ? (
          <div className="mt-4 rounded-xl border border-border/70 px-4 py-3 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground">Delivering to {state.delivery.storeName}</p>
              <Button variant="ghost" size="sm" onClick={() => goTo(product, 1)}>
                Edit
              </Button>
            </div>
            <p className="mt-1 text-muted-foreground">
              {state.delivery.address}, {state.delivery.city} {state.delivery.pincode}
            </p>
            <p className="mt-1 text-muted-foreground">Arrives in 3 to 5 working days after payment.</p>
          </div>
        ) : null}
      </div>
    </SetupFrame>
  )
}
