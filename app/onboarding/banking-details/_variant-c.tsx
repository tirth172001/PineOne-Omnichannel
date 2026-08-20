"use client"

import { useRef, useState } from "react"
import { CheckCircleIcon, UploadSimpleIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const extracted = [
  { label: "Bank", value: "DBS Bank" },
  { label: "Account holder", value: "Kopi & Co Pte. Ltd." },
  { label: "Statement period", value: "May – Jul 2026" },
]

// Variant C — a single large drag-and-drop hero as the whole screen; extraction happens inline
// beneath it (no separate screen). Preview is a torn-edge "receipt" strip, lines appearing one
// by one.
export function VariantC() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [revealedCount, setRevealedCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File | undefined) {
    if (!file) return
    setFileName(file.name)
    setRevealedCount(0)
    extracted.forEach((_, index) => {
      window.setTimeout(() => setRevealedCount(index + 1), (index + 1) * 350)
    })
  }

  return (
    <div className="grid h-full w-full grid-cols-1 lg:grid-cols-2">
      <section className="flex h-full flex-col overflow-y-auto p-6 sm:p-10">
        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center gap-6 py-8">
          <div className="space-y-1.5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Step 1 of 2 · Business details
            </p>
            <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">Add your bank account</h1>
            <p className="text-sm leading-5 text-muted-foreground">Upload a statement from the last 3 months.</p>
          </div>

          <div
            onDragOver={(event) => {
              event.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault()
              setDragOver(false)
              handleFile(event.dataTransfer.files?.[0])
            }}
            className={cn(
              "flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
              dragOver ? "border-primary bg-primary/5" : "border-border",
              fileName && "border-success/40 bg-success/5"
            )}
          >
            {fileName ? (
              <CheckCircleIcon size={28} weight="fill" className="text-success" />
            ) : (
              <UploadSimpleIcon size={28} className="text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">{fileName ?? "Drop your statement here"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {fileName ? "Extracting your details…" : "or click to browse — PDF, max 5MB"}
              </p>
            </div>
            {!fileName ? (
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Browse files
              </Button>
            ) : null}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
          </div>

          {revealedCount > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {extracted.slice(0, revealedCount).map((field) => (
                <li
                  key={field.label}
                  className="motion-safe:animate-[pv6FadeIn_250ms_ease-out] flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">{field.label}</span>
                  <span className="font-medium text-foreground">{field.value}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <Button type="button" size="lg" className="w-full" disabled={revealedCount < extracted.length}>
            Continue
          </Button>
        </div>
      </section>

      <div className="hidden items-center justify-center border-l border-border bg-muted/30 p-10 lg:flex">
        <style>{`
          @keyframes pv6FadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
        <div
          className="w-full max-w-xs bg-card shadow-sm"
          style={{
            clipPath:
              "polygon(0% 4%, 4% 0%, 8% 4%, 12% 0%, 16% 4%, 20% 0%, 24% 4%, 28% 0%, 32% 4%, 36% 0%, 40% 4%, 44% 0%, 48% 4%, 52% 0%, 56% 4%, 60% 0%, 64% 4%, 68% 0%, 72% 4%, 76% 0%, 80% 4%, 84% 0%, 88% 4%, 92% 0%, 96% 4%, 100% 0%, 100% 100%, 0% 100%)",
          }}
        >
          <div className="flex flex-col gap-3 p-5 pt-6 font-mono">
            <p className="text-center text-xs tracking-widest text-muted-foreground uppercase">Statement Summary</p>
            <div className="border-t border-dashed border-border" />
            {extracted.map((field, index) => (
              <div
                key={field.label}
                className={cn(
                  "flex items-center justify-between text-xs motion-safe:transition-opacity motion-safe:duration-300",
                  index < revealedCount ? "opacity-100" : "opacity-20"
                )}
              >
                <span className="text-muted-foreground">{field.label}</span>
                <span className="font-medium text-foreground">
                  {index < revealedCount ? field.value : "••••••"}
                </span>
              </div>
            ))}
            <div className="border-t border-dashed border-border" />
            <p className="text-center text-[10px] text-muted-foreground">
              {revealedCount === extracted.length ? "✓ Verified" : "Reading…"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
