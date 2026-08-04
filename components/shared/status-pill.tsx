"use client"

import type { ComponentType } from "react"
import { CheckCircle2, CircleDot, Clock3, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export type StatusTone = "processing" | "success" | "initiated" | "failed"

const toneIconClass: Record<StatusTone, string> = {
  processing: "text-amber-600 dark:text-amber-400",
  success: "text-emerald-600 dark:text-emerald-400",
  initiated: "text-sky-600 dark:text-sky-400",
  failed: "text-red-600 dark:text-red-400",
}

const toneIcon: Record<StatusTone, ComponentType<{ className?: string }>> = {
  processing: Clock3,
  success: CheckCircle2,
  initiated: CircleDot,
  failed: XCircle,
}

interface StatusPillProps {
  label: string
  tone: StatusTone
  className?: string
}

export function StatusPill({ label, tone, className }: StatusPillProps) {
  const Icon = toneIcon[tone]

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full border border-border bg-background px-2 pr-3 text-xs font-normal leading-none text-foreground",
        className
      )}
    >
      <Icon className={cn("h-3 w-3", toneIconClass[tone])} />
      {label}
    </span>
  )
}
