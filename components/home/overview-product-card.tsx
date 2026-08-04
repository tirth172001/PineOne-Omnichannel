"use client"

import type { ComponentType } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type OverviewProductCardProps = {
  title: string
  description: string
  href: string
  icon: ComponentType<{ className?: string }>
  configuredCount: number
}

export function OverviewProductCard({
  title,
  description,
  href,
  icon: Icon,
  configuredCount,
}: OverviewProductCardProps) {
  const isConfigured = configuredCount > 0
  const configuredLabel =
    configuredCount <= 0 ? "Not configured" : configuredCount > 1 ? `${configuredCount} configured` : "Configured"

  return (
    <article className="rounded-lg border border-border/70 bg-card/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/12 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-foreground">{title}</p>
        </div>
        <span
          className={cn(
            "inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-medium",
            isConfigured
              ? "border-success/35 bg-success/12 text-success"
              : "border-border/60 bg-muted/25 text-muted-foreground"
          )}
        >
          {configuredLabel}
        </span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      <Button asChild variant="outline" size="sm" className="mt-3 h-8 w-full text-xs">
        <Link href={href}>
          Explore
          <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
        </Link>
      </Button>
    </article>
  )
}
