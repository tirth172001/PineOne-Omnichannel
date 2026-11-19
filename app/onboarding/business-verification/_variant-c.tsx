"use client"

import { useRef, useState } from "react"
import { CheckCircleIcon, FileArrowUpIcon, TerminalIcon, UploadSimpleIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Method = "singpass" | "manual"

const fields = [
  { id: "name", label: "Legal business name", value: "Kopi & Co Pte. Ltd." },
  { id: "uen", label: "UEN / registration number", value: "202312345K" },
  { id: "address", label: "Registered address", value: "21 Tanjong Pagar Road, #03-11, Singapore 088444" },
  { id: "type", label: "Business type", value: "Private Limited Company" },
]

const logScripts: Record<Method, string[]> = {
  singpass: [
    "Connecting to Singpass…",
    "Fetching business registration…",
    "Matching registered address…",
    "4 fields verified",
  ],
  manual: [
    "Reading acra-document.pdf…",
    "Extracting business fields…",
    "Cross-checking registration number…",
    "4 fields verified",
  ],
}

// Variant C — single persistent screen, segmented method control, terminal-style verification log as the preview.
export function VariantC() {
  const [method, setMethod] = useState<Method>("singpass")
  const [fileName, setFileName] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [logLines, setLogLines] = useState<string[]>([])
  const [ready, setReady] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function startVerification() {
    if (running) return
    setRunning(true)
    setReady(false)
    setLogLines([])
    logScripts[method].forEach((line, index) => {
      window.setTimeout(() => {
        setLogLines((previous) => [...previous, line])
        if (index === logScripts[method].length - 1) {
          window.setTimeout(() => {
            setRunning(false)
            setReady(true)
          }, 350)
        }
      }, (index + 1) * 500)
    })
  }

  return (
    <div className="grid h-full w-full grid-cols-1 lg:grid-cols-2">
      <section className="flex h-full flex-col overflow-y-auto p-6 sm:p-10">
        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center gap-6 py-8">
          <div className="space-y-1.5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Step 1 of 4 · Business verification
            </p>
            <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">Verify your business</h1>
          </div>

          <div role="tablist" aria-label="Verification method" className="inline-flex w-fit rounded-lg bg-muted p-1">
            <button
              type="button"
              role="tab"
              aria-selected={method === "singpass"}
              disabled={running}
              onClick={() => setMethod("singpass")}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed",
                method === "singpass" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              Singpass
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={method === "manual"}
              disabled={running}
              onClick={() => setMethod("manual")}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed",
                method === "manual" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              Upload ACRA
            </button>
          </div>

          <div role="tabpanel" className="rounded-xl border border-border bg-card p-4">
            {method === "singpass" ? (
              <p className="text-sm leading-5 text-muted-foreground">
                We&apos;ll securely fetch your business details from Singpass — instant, no documents needed.
              </p>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-6 text-center hover:bg-muted/40">
                <UploadSimpleIcon size={22} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {fileName ?? "Drag & drop your ACRA document"}
                </span>
                <span className="text-xs text-muted-foreground">PDF, max 5MB</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "acra-document.pdf")}
                />
              </label>
            )}
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={running || ready || (method === "manual" && !fileName)}
            onClick={startVerification}
          >
            {ready ? "Verified — continue" : method === "singpass" ? "Connect Singpass" : "Verify document"}
          </Button>

          {ready ? (
            <p role="status" className="text-sm font-medium text-success">
              Verified via {method === "singpass" ? "Singpass" : "your ACRA document"} · ready to continue.
            </p>
          ) : null}
        </div>
      </section>

      <ConsolePreview method={method} logLines={logLines} ready={ready} />
    </div>
  )
}

function ConsolePreview({ method, logLines, ready }: { method: Method; logLines: string[]; ready: boolean }) {
  return (
    <div className="hidden items-center justify-center border-l border-border bg-muted/30 p-10 lg:flex">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-[#0b0f0c] shadow-sm">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
            <TerminalIcon size={14} className="text-[#D9F99D]" />
            <span className="text-xs font-medium text-[#D9F99D]/80">verification-log</span>
          </div>
          <div className="flex min-h-[140px] flex-col gap-1.5 p-4 font-mono text-xs text-[#D9F99D]">
            {logLines.length === 0 ? (
              <span className="text-[#D9F99D]/40">Waiting to start…</span>
            ) : (
              logLines.map((line, index) => (
                <div
                  key={line}
                  className="motion-safe:animate-[pv2LogIn_300ms_ease-out] flex gap-2 tabular-nums"
                >
                  <span className="text-[#D9F99D]/50">{`0:0${index + 1}`}</span>
                  <span>&gt; {line}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {ready ? (
          <div className="motion-safe:animate-[pv2LogIn_300ms_ease-out] overflow-hidden rounded-2xl border border-success/30 bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <FileArrowUpIcon size={16} weight="fill" className="text-success" />
              <span className="text-sm font-medium text-foreground">Business Profile</span>
              <CheckCircleIcon size={16} weight="fill" className="ml-auto text-success" />
            </div>
            <div className="flex flex-col gap-2.5 p-4">
              {fields.map((field) => (
                <div key={field.id} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-muted-foreground">{field.label}</span>
                  <span className="truncate font-medium text-foreground" title={field.value}>
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <style>{`
        @keyframes pv2LogIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
