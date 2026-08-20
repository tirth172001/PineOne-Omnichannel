"use client"

import { useRef, useState } from "react"
import { BankIcon, CheckIcon, UploadSimpleIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const banks = ["DBS Bank", "OCBC Bank", "UOB", "Standard Chartered", "Citibank"]

// Variant B — pick your bank first (card-select, like ticket 02's method choice), then upload
// the statement for it. Preview is a single bank-branded passbook card.
export function VariantB() {
  const [bank, setBank] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="grid h-full w-full grid-cols-1 lg:grid-cols-2">
      <section className="flex h-full flex-col overflow-y-auto p-6 sm:p-10">
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center gap-7 py-8">
          <div className="space-y-1.5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">1 of 2</p>
            <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">Add your bank account</h1>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Which bank is this account with?</p>
            <div role="radiogroup" aria-label="Bank" className="grid grid-cols-2 gap-2">
              {banks.map((name) => (
                <button
                  key={name}
                  type="button"
                  role="radio"
                  aria-checked={bank === name}
                  onClick={() => setBank(name)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                    bank === name
                      ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                      : "border-border text-muted-foreground hover:bg-muted/60"
                  )}
                >
                  <BankIcon size={15} className={bank === name ? "text-primary" : "text-muted-foreground"} />
                  {name}
                </button>
              ))}
            </div>
          </div>

          {bank ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Upload your {bank} statement</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-6 text-center hover:bg-muted/40"
              >
                <UploadSimpleIcon size={20} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{fileName ?? "Drag & drop, or click to upload"}</span>
                <span className="text-xs text-muted-foreground">Last 3 months, PDF</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
                />
              </button>
            </div>
          ) : null}

          <Button type="button" size="lg" className="w-full" disabled={!bank || !fileName}>
            Continue
          </Button>
        </div>
      </section>

      <div className="hidden items-center justify-center border-l border-border bg-muted/30 p-10 lg:flex">
        <div
          className={cn(
            "flex w-full max-w-sm flex-col gap-6 rounded-2xl border p-5 shadow-sm transition-colors",
            bank ? "border-primary/30 bg-primary/5" : "border-border bg-card"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="flex size-9 items-center justify-center rounded-full bg-background text-primary ring-1 ring-border">
              <BankIcon size={18} />
            </span>
            {fileName ? (
              <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                <CheckIcon size={11} weight="bold" />
                Statement added
              </span>
            ) : null}
          </div>

          <div>
            <p className="text-[11px] text-muted-foreground">Bank</p>
            <p className="text-lg font-semibold text-foreground">{bank ?? "Not selected yet"}</p>
          </div>

          <div className="flex items-center justify-between border-t border-dashed border-border pt-4 text-xs text-muted-foreground">
            <span>Kopi &amp; Co Pte. Ltd.</span>
            <span>{fileName ? "•••• 4471" : "•••• ····"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
