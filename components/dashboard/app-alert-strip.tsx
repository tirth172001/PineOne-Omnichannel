"use client"

import { ArrowRightIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

export function AppAlertStrip() {
  return (
    <div className="shrink-0 border-b border-border/70 bg-accent/55">
      <div className="mx-auto flex h-10 w-full max-w-[1280px] items-center justify-between gap-3 px-4 md:px-6">
        <p className="truncate text-xs text-foreground/90">
          3 action items need attention in operations today.
        </p>
        <Button size="sm" variant="ghost" className="h-7 shrink-0 px-2.5 text-xs">
          Review now
          <ArrowRightIcon className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

