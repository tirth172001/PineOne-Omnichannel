"use client"

/**
 * Intercom-style minimal top bar.
 * No profile, no notification bell.
 * Just global search + optional page-level primary action.
 *
 * Used ONLY when a page needs a standalone top bar above panels.
 * Most pages use PageHeader from components/ui/panels.tsx instead.
 */

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function TopNavigation() {
  return (
    <div className="flex items-center h-12 px-4 border-b border-border bg-card shrink-0 gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search..."
          className="pl-9 h-8 text-sm bg-muted border-transparent focus-visible:border-border focus-visible:bg-background rounded-lg"
        />
      </div>
    </div>
  )
}
