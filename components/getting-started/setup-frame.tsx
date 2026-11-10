"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { JourneyLink as Link } from "@/components/getting-started/navigation"
import { CheckIcon, HeadsetIcon, XIcon } from "@phosphor-icons/react"
import { LogoMark } from "@/components/brand/logo-mark"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { ProductId } from "@/lib/getting-started"
import { PRODUCTS, productSetupProgress } from "./catalog"

/**
 * Full-page product setup: one progress rail, an independently scrolling form,
 * an optional summary, and a pinned action footer. The platform sidebar belongs
 * on product education and live-product pages, outside this dedicated flow.
 */
export function SetupFrame({
  product,
  stepIndex,
  steps,
  title,
  subtitle,
  aside,
  children,
  onBack,
  onContinue,
  continueLabel = "Continue",
  canContinue = true,
  wide = false,
  rail,
  railFooter,
  eyebrow,
  continueHint,
}: {
  product: ProductId
  stepIndex: number
  steps?: string[]
  title: string
  subtitle?: string
  aside?: ReactNode
  children: ReactNode
  onBack?: () => void
  onContinue?: () => void
  continueLabel?: string
  canContinue?: boolean
  wide?: boolean
  rail?: ReactNode
  railFooter?: ReactNode
  eyebrow?: string
  continueHint?: string
}) {
  const meta = PRODUCTS[product]
  const progress = productSetupProgress(product, stepIndex)
  const railSteps = steps ?? progress.steps
  const currentIndex = steps ? stepIndex : progress.index
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [title])

  return (
    <div className="flex h-dvh gap-2 overflow-hidden bg-sidebar p-2">
        <aside aria-label="Onboarding progress" className="hidden w-64 shrink-0 flex-col px-4 py-3 lg:flex">
          <Link href="/" aria-label="Back to Overview" className="mb-8 w-fit rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <LogoMark className="h-12 w-auto text-foreground" />
          </Link>
          <p className="text-xs font-medium text-muted-foreground">Setting up</p>
          <p className="mt-1 text-base font-semibold text-foreground">{meta.name}</p>
          <p className="mt-2 text-xs text-muted-foreground">Step {currentIndex + 1} of {railSteps.length}</p>
          {rail ?? <ol className="mt-6 min-h-0 flex-1 space-y-2 overflow-y-auto">
            {railSteps.map((step, index) => {
              const done = index < currentIndex
              const current = index === currentIndex
              return (
                <li
                  key={step}
                  aria-current={current ? "step" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                    current ? "bg-sidebar-accent font-medium text-foreground" : done ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      done ? "bg-success text-white" : current ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {done ? <CheckIcon className="h-3 w-3" weight="bold" /> : index + 1}
                  </span>
                  {step}
                </li>
              )
            })}
          </ol>}
          {railFooter}
          <p className="mt-6 border-t border-border/60 pt-4 text-xs leading-5 text-muted-foreground">
            Your progress is saved. You can leave and pick up from the Overview any time.
          </p>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-md bg-background">
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border/60 px-6 py-4 lg:px-10">
            <div>
              <p className="text-sm font-medium text-foreground">{meta.shortName} setup</p>
              <p className="mt-1 text-xs text-muted-foreground lg:hidden">Step {currentIndex + 1} of {railSteps.length} · {railSteps[currentIndex]}</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="shrink-0 text-muted-foreground">
              <Link href="/">Save and exit<XIcon aria-hidden="true" /></Link>
            </Button>
          </header>
          <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8 lg:px-10 lg:py-12">
          <div className={cn("mx-auto grid gap-8", aside ? "max-w-[1000px] lg:grid-cols-[1fr_300px]" : wide ? "max-w-[1000px]" : "max-w-[560px]")}>
            <div className="min-w-0">
              {eyebrow ? <p className="mb-2 text-sm text-muted-foreground">{eyebrow}</p> : null}
              {title ? <h1 ref={heading} tabIndex={-1} className="font-heading text-2xl font-semibold leading-tight text-foreground outline-none">{title}</h1> : null}
              {subtitle ? <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{subtitle}</p> : null}
              <div className="mt-6">{children}</div>
              {!canContinue && continueHint ? <p id="setup-continue-hint" className="mt-4 text-xs text-muted-foreground">{continueHint}</p> : null}
            </div>
            {aside ? <div className="h-fit lg:sticky lg:top-0">{aside}</div> : null}
          </div>
          </main>

      <footer className="z-10 flex shrink-0 flex-wrap items-center gap-2 border-t border-border/60 bg-background px-6 py-4 lg:px-10">
        {onBack ? (
          <Button variant="outline" size="lg" className="px-4" onClick={onBack}>
            Back
          </Button>
        ) : null}
        {onContinue ? (
          <Button size="lg" className="px-4" onClick={onContinue} disabled={!canContinue} aria-describedby={!canContinue && continueHint ? "setup-continue-hint" : undefined}>
            {continueLabel}
          </Button>
        ) : null}
        <Button asChild variant="ghost" size="lg" className="ml-auto px-3">
          <Link href="/support">
            <HeadsetIcon />
            Ask for support
          </Link>
        </Button>
      </footer>
        </div>
    </div>
  )
}

export function Field({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
  inputMode,
  className,
}: {
  id: string
  label: string
  hint?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  inputMode?: "text" | "numeric" | "url" | "tel"
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <Input id={id} value={value} placeholder={placeholder} inputMode={inputMode} aria-describedby={hint ? `${id}-hint` : undefined} onChange={(event) => onChange(event.target.value)} className="h-9" />
      {hint ? <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

/** Shown in place of a form whose details another product already collected. */
export function AlreadyAdded({ title, rows, onEdit }: { title: string; rows: Array<[string, string]>; onEdit: () => void }) {
  return (
    <div className="rounded-xl border border-border/70">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <CheckIcon className="h-4 w-4 text-success" weight="bold" />
          {title}
        </p>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Edit
        </Button>
      </div>
      <dl className="space-y-2 px-4 py-3 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex gap-4">
            <dt className="w-32 shrink-0 text-muted-foreground">{label}</dt>
            <dd className="text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
