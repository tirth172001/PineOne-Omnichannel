"use client"

import { useState } from "react"
import {
  CheckCircleIcon,
  CircleNotchIcon,
  IdentificationCardIcon,
  QrCodeIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Method = "singpass" | "manual"
type Step = "method" | "checking" | "confirm"

const fields = [
  { id: "name", label: "Legal business name", value: "Kopi & Co Pte. Ltd." },
  { id: "uen", label: "UEN / registration number", value: "202312345K" },
  { id: "address", label: "Registered address", value: "21 Tanjong Pagar Rd" },
  { id: "type", label: "Business type", value: "Private Limited Co." },
]

// Variant B — compact side-by-side method cards, per-field incremental confirmation (not one shimmer moment).
export function VariantB() {
  const [method, setMethod] = useState<Method>("singpass")
  const [step, setStep] = useState<Step>("method")
  const [confirmedCount, setConfirmedCount] = useState(0)

  function startVerification() {
    setStep("checking")
    setConfirmedCount(0)
    fields.forEach((_, index) => {
      window.setTimeout(() => {
        setConfirmedCount(index + 1)
        if (index === fields.length - 1) {
          window.setTimeout(() => setStep("confirm"), 400)
        }
      }, (index + 1) * 420)
    })
  }

  return (
    <div className="grid h-full w-full grid-cols-1 lg:grid-cols-2">
      <section className="flex h-full flex-col overflow-y-auto p-6 sm:p-10">
        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center gap-7 py-8">
          <div className="space-y-1.5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">1 of 4</p>
            <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">
              How should we verify you?
            </h1>
          </div>

          {step === "method" ? (
            <>
              <div role="radiogroup" aria-label="Verification method" className="grid grid-cols-2 gap-3">
                <CompactCard
                  icon={<ShieldCheckIcon size={22} weight="duotone" />}
                  title="Singpass"
                  badge="Recommended"
                  selected={method === "singpass"}
                  onSelect={() => setMethod("singpass")}
                />
                <CompactCard
                  icon={<IdentificationCardIcon size={22} weight="duotone" />}
                  title="Upload ACRA"
                  selected={method === "manual"}
                  onSelect={() => setMethod("manual")}
                />
              </div>

              <Button type="button" size="lg" className="w-full" onClick={startVerification}>
                Continue
              </Button>
            </>
          ) : (
            <ul className="flex flex-col gap-2">
              {fields.map((field, index) => {
                const done = index < confirmedCount
                const active = index === confirmedCount && step === "checking"
                return (
                  <li
                    key={field.id}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm transition-colors",
                      done ? "border-success/30 bg-success/5" : "border-border bg-card"
                    )}
                  >
                    {done ? (
                      <CheckCircleIcon size={18} weight="fill" className="shrink-0 text-success" />
                    ) : active ? (
                      <CircleNotchIcon size={18} className="motion-safe:animate-spin shrink-0 text-primary" />
                    ) : (
                      <span className="size-[18px] shrink-0 rounded-full border border-border" />
                    )}
                    <span className={cn("font-medium", done ? "text-foreground" : "text-muted-foreground")}>
                      {field.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}

          {step === "confirm" ? (
            <Button type="button" size="lg" className="w-full">
              Continue
            </Button>
          ) : null}
        </div>
      </section>

      <BoardingPassPreview step={step} confirmedCount={confirmedCount} />
    </div>
  )
}

function CompactCard({
  icon,
  title,
  badge,
  selected,
  onSelect,
}: {
  icon: React.ReactNode
  title: string
  badge?: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:bg-muted/60"
      )}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-lg",
          selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        {icon}
      </span>
      <span className="text-sm font-medium text-foreground">{title}</span>
      {badge ? <span className="text-[11px] font-medium text-success">{badge}</span> : null}
    </button>
  )
}

function BoardingPassPreview({ step, confirmedCount }: { step: Step; confirmedCount: number }) {
  return (
    <div className="hidden items-center justify-center border-l border-border bg-muted/30 p-10 lg:flex">
      <div className="w-full max-w-xs overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between bg-foreground px-4 py-3 text-background">
          <span className="text-sm font-medium">Kopi &amp; Co Pte. Ltd.</span>
          <QrCodeIcon size={20} />
        </div>

        <div className="relative flex flex-col gap-2 p-4">
          <div
            aria-hidden
            className="absolute inset-x-4 top-0 border-t border-dashed border-border"
            style={{ marginTop: "-1px" }}
          />
          {fields.map((field, index) => {
            const done = index < confirmedCount || step === "confirm"
            return (
              <div
                key={field.id}
                className={cn(
                  "flex items-center justify-between rounded-md px-2.5 py-2 text-xs motion-safe:transition-colors motion-safe:duration-300",
                  done ? "bg-success/10 text-success" : "bg-muted/60 text-muted-foreground"
                )}
              >
                <span>{field.label}</span>
                {done ? <CheckCircleIcon size={14} weight="fill" /> : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
