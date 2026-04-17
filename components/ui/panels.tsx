/**
 * Intercom-style multi-panel layout primitives.
 *
 * Usage:
 *   <PanelGroup>
 *     <Panel width={320}>
 *       <PanelHeader><PanelTitle>Title</PanelTitle><PanelActions>…</PanelActions></PanelHeader>
 *       <PanelBody>…scrollable content…</PanelBody>
 *     </Panel>
 *     <Panel>
 *       <PanelHeader>…</PanelHeader>
 *       <PanelBody>…</PanelBody>
 *     </Panel>
 *   </PanelGroup>
 */

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

/* Container: flex row, fills remaining height */
export function PanelGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-1 min-h-0 overflow-hidden bg-background",
        className
      )}
      {...props}
    />
  )
}

/* Individual panel — fixed width OR flex-1 */
export function Panel({
  className,
  width,
  revealed = true,
  ...props
}: React.ComponentProps<"div"> & { width?: number; revealed?: boolean }) {
  if (!revealed) return null

  return (
    <motion.div
      className={cn(
        "flex flex-col overflow-hidden bg-card/70 even:bg-muted/35",
        className
      )}
      data-slot="panel"
      style={width !== undefined ? { width, flexShrink: 0 } : { flex: 1 }}
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    />
  )
}

/* Sticky panel header */
export function PanelHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex min-h-[52px] shrink-0 items-center gap-3 px-4 py-3 bg-inherit",
        className
      )}
      {...props}
    />
  )
}

/* Panel title text */
export function PanelTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-[15px] font-semibold leading-tight text-foreground", className)} {...props} />
  )
}

/* Right-side action slot in header */
export function PanelActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-1.5 ml-auto shrink-0", className)} {...props} />
  )
}

/* Scrollable panel body */
export function PanelBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex-1 overflow-y-auto", className)} {...props} />
  )
}

/* Full-width page header (spans entire content area, above panels) */
export function PageHeader({
  title,
  description,
  subtitle,
  badges,
  actions,
  backHref,
  onBack,
  backLabel = "Back",
  children,
  className,
}: {
  title: string
  description?: string
  subtitle?: string
  badges?: React.ReactNode
  actions?: React.ReactNode
  backHref?: string
  onBack?: () => void
  backLabel?: string
  children?: React.ReactNode
  className?: string
}) {
  const rightActions = actions ?? children
  const isInternal = Boolean(backHref || onBack)

  return (
    <header
      className={cn(
        "mt-2 shrink-0 bg-background",
        className
      )}
    >
      <div
        className="mx-auto flex w-full flex-wrap items-start gap-3 px-4 py-3"
        style={{ maxWidth: "var(--dashboard-center-max-width, 1440px)" }}
      >
        <div className="min-w-0 flex flex-1 items-start gap-2.5">
          {isInternal ? (
            backHref ? (
              <Button asChild variant="ghost" size="icon-sm" className="mt-0.5 h-8 w-8 rounded-lg">
                <Link href={backHref} aria-label={backLabel}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="icon-sm" className="mt-0.5 h-8 w-8 rounded-lg" onClick={onBack} aria-label={backLabel}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )
          ) : null}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="break-words text-[18px] font-semibold leading-tight text-foreground sm:truncate">{title}</h1>
              {badges ? <div className="flex flex-wrap items-center gap-1.5">{badges}</div> : null}
            </div>
            {(subtitle || description) && (
              <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                {subtitle ?? description}
              </p>
            )}
          </div>
        </div>

        {rightActions ? (
          <div className="flex w-full flex-wrap items-center justify-start gap-2 pt-1 sm:ml-auto sm:w-auto sm:shrink-0 sm:flex-nowrap sm:justify-end sm:pt-0">
            {rightActions}
          </div>
        ) : null}
      </div>
    </header>
  )
}

export function PanelHeading({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 className={cn("text-[15px] font-semibold tracking-tight text-foreground", className)} {...props} />
}

export function PanelSubheading({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-[11px] uppercase tracking-[0.14em] text-muted-foreground", className)} {...props} />
}

export function PanelCopy({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-[13px] leading-relaxed text-muted-foreground", className)} {...props} />
}

export function PanelSection({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("px-4 py-3 last:border-b-0", className)} {...props} />
}

/* Empty state for panels with no selection */
export function PanelEmpty({
  icon: Icon,
  title,
  description,
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/55 border border-border">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  )
}
