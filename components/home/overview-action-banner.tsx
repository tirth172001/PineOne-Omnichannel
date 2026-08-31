"use client"

import type { ComponentType } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ActionBannerTone = "notice" | "action"

const TONE_CLASSES: Record<ActionBannerTone, string> = {
  notice: "border-amber-500/25 bg-amber-500/10",
  action: "border-primary/25 bg-primary/8",
}

const ICON_TONE_CLASSES: Record<ActionBannerTone, string> = {
  notice: "bg-amber-500/15 text-amber-600",
  action: "bg-primary/15 text-primary",
}

export function OverviewActionBanner({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  tone = "notice",
}: {
  icon: ComponentType<{ className?: string; weight?: "regular" | "bold" | "fill" }>
  title: string
  description?: string
  actionLabel: string
  onAction: () => void
  tone?: ActionBannerTone
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 rounded-[8px] border px-4 py-3.5", TONE_CLASSES[tone])}>
      <div className="flex min-w-0 items-center gap-3">
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", ICON_TONE_CLASSES[tone])}>
          <Icon className="h-5 w-5" weight="fill" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 rounded-[8px] bg-background" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  )
}
