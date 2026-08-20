"use client"

import { useState } from "react"
import { CheckCircleIcon, HourglassIcon, StorefrontIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { foundMerchant } from "./_mock"

type Step = "lookup" | "confirm" | "pending"
const steps: Step[] = ["lookup", "confirm", "pending"]

// Variant A — a classic linear 3-step wizard in one centered card, with a dot stepper.
export function VariantA() {
  const [step, setStep] = useState<Step>("lookup")
  const [contact, setContact] = useState("")

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6 px-6">
      <div className="flex items-center gap-1.5" aria-hidden>
        {steps.map((item) => (
          <span
            key={item}
            className={cn(
              "h-1.5 rounded-full motion-safe:transition-all",
              item === step ? "w-6 bg-primary" : "w-1.5 bg-muted"
            )}
          />
        ))}
      </div>

      {step === "lookup" ? (
        <div className="flex w-full flex-col gap-5">
          <div className="space-y-1.5 text-center">
            <h1 className="text-balance text-xl font-semibold text-foreground">Find your business</h1>
            <p className="text-sm leading-5 text-muted-foreground">
              Enter the email or mobile number your business account is registered with.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact">Registered email or phone</Label>
            <Input
              id="contact"
              placeholder="you@business.com"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
            />
          </div>
          <Button type="button" size="lg" className="w-full" disabled={!contact.trim()} onClick={() => setStep("confirm")}>
            Find business
          </Button>
        </div>
      ) : null}

      {step === "confirm" ? (
        <div className="flex w-full flex-col gap-5">
          <div className="space-y-1.5 text-center">
            <h1 className="text-balance text-xl font-semibold text-foreground">Is this your business?</h1>
            <p className="text-sm leading-5 text-muted-foreground">We found an account matching {contact}.</p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <StorefrontIcon size={20} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{foundMerchant.name}</p>
              <p className="text-xs text-muted-foreground">{foundMerchant.category}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep("lookup")}>
              Not this one
            </Button>
            <Button type="button" className="flex-1" onClick={() => setStep("pending")}>
              Request access
            </Button>
          </div>
        </div>
      ) : null}

      {step === "pending" ? (
        <div className="flex w-full flex-col items-center gap-4 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-warning/10 text-warning">
            <HourglassIcon size={26} weight="fill" />
          </span>
          <div className="space-y-1.5">
            <h1 className="text-balance text-xl font-semibold text-foreground">Request sent</h1>
            <p className="text-sm leading-5 text-muted-foreground">
              We&apos;ve asked an admin at <span className="font-medium text-foreground">{foundMerchant.name}</span> to
              approve your access. You&apos;ll get an email as soon as they respond.
            </p>
          </div>
          <div className="flex w-full items-center gap-2 rounded-lg bg-muted/60 px-3.5 py-2.5 text-left text-xs text-muted-foreground">
            <CheckCircleIcon size={15} className="shrink-0 text-muted-foreground" />
            You won&apos;t be able to access the dashboard until this is approved.
          </div>
          <Button type="button" variant="outline" className="w-full">
            Back to login
          </Button>
        </div>
      ) : null}
    </div>
  )
}
