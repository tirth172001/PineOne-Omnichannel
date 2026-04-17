"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ProductCatalogCardAction = {
  label: string
  href: string
  variant?: "default" | "outline" | "secondary" | "ghost"
  showArrow?: boolean
}

interface ProductCatalogCardProps {
  icon: ReactNode
  title: string
  description: string
  badge?: ReactNode
  metadata?: ReactNode
  primaryAction: ProductCatalogCardAction
  secondaryAction?: ProductCatalogCardAction
  className?: string
}

function CardActionButton({ action, primary = false }: { action: ProductCatalogCardAction; primary?: boolean }) {
  return (
    <Button
      size="sm"
      variant={action.variant ?? (primary ? "default" : "outline")}
      className="h-8 gap-1.5 text-xs"
      asChild
    >
      <Link href={action.href}>
        {action.label}
        {action.showArrow === false ? null : <ArrowUpRight className="h-3.5 w-3.5" />}
      </Link>
    </Button>
  )
}

export function ProductCatalogCard({
  icon,
  title,
  description,
  badge,
  metadata,
  primaryAction,
  secondaryAction,
  className,
}: ProductCatalogCardProps) {
  return (
    <article className={cn("flex h-full flex-col rounded-lg border border-border/70 bg-card/80 p-4", className)}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border/60 bg-secondary/35">
          {icon}
        </div>
        {badge ? <div className="shrink-0">{badge}</div> : null}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        {metadata ? <div className="text-xs font-medium text-foreground">{metadata}</div> : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <CardActionButton action={primaryAction} primary />
        {secondaryAction ? <CardActionButton action={secondaryAction} /> : null}
      </div>
    </article>
  )
}
