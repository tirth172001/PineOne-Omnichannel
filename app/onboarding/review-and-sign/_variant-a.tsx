"use client"

import { useState } from "react"
import { CheckCircleIcon, PencilSimpleIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { agreementParagraphs, reviewGroups } from "@/app/onboarding/(rail)/review-and-sign/_review-data"

type Screen = "review" | "sign" | "success"

// Variant A — the classic two-screen flow: grouped review cards (edit pencils per field), then
// a full agreement with a consent checkbox, ending in a dedicated success screen.
export function VariantA() {
  const [screen, setScreen] = useState<Screen>("review")
  const [agreed, setAgreed] = useState(false)

  if (screen === "success") {
    return (
      <div className="flex h-full w-full items-center justify-center p-10">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircleIcon size={32} weight="fill" />
          </span>
          <h1 className="text-balance text-2xl font-semibold text-foreground">You&apos;re all set</h1>
          <p className="text-sm leading-5 text-muted-foreground">
            Kopi &amp; Co Pte. Ltd. is signed and submitted. We&apos;ll activate your account shortly.
          </p>
        </div>
      </div>
    )
  }

  if (screen === "sign") {
    return (
      <div className="flex h-full w-full items-center justify-center overflow-y-auto p-6 sm:p-10">
        <div className="flex w-full max-w-2xl flex-col gap-5">
          <div className="space-y-1.5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Step 2 of 2 · Review and sign</p>
            <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">Finish up by signing the agreement</h1>
          </div>

          <div className="max-h-64 overflow-y-auto rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-center text-sm font-semibold text-foreground">Merchant Signing Agreement</h2>
            <div className="flex flex-col gap-3 text-sm leading-6 text-muted-foreground">
              {agreementParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2.5 rounded-lg border border-border p-3.5 text-sm font-medium text-foreground">
            <Checkbox checked={agreed} onCheckedChange={(checked) => setAgreed(checked === true)} />
            I agree to the terms and conditions of the above document
          </label>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setScreen("review")}>
              Back
            </Button>
            <Button type="button" className="flex-1" disabled={!agreed} onClick={() => setScreen("success")}>
              Sign agreement
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full items-center justify-center overflow-y-auto p-6 sm:p-10">
      <div className="flex w-full max-w-2xl flex-col gap-5">
        <div className="space-y-1.5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Step 1 of 2 · Review and sign</p>
          <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">Review all the details you&apos;ve filled</h1>
        </div>

        <div className="flex flex-col gap-4">
          {reviewGroups.map((group) => (
            <div key={group.id} className="overflow-hidden rounded-xl border border-border">
              <div className="border-b border-border bg-muted/40 px-4 py-2.5">
                <p className="text-sm font-semibold text-foreground">{group.title}</p>
              </div>
              <ul className="flex flex-col divide-y divide-border">
                {group.fields.map((field) => (
                  <li key={field.id} className="flex items-center justify-between gap-3 bg-card px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{field.label}</p>
                      <p className="truncate text-sm font-medium text-foreground" title={field.value}>
                        {field.value}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Edit ${field.label.toLowerCase()}`}
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <PencilSimpleIcon size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Button type="button" size="lg" className="w-full" onClick={() => setScreen("sign")}>
          Confirm and proceed
        </Button>
      </div>
    </div>
  )
}
