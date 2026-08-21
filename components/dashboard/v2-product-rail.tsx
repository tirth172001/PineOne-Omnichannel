"use client"

import { type ComponentType } from "react"
import { BracketsCurlyIcon, CreditCardIcon, CurrencyInrIcon, GlobeIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { SidebarProduct } from "@/lib/navigation/navigation-model"

type V2ProductRailProps = {
  activeProduct: SidebarProduct
  onProductChange: (product: SidebarProduct) => void
}

const RAIL_ITEMS: Array<{
  key: SidebarProduct
  label: string
  icon: ComponentType<{ className?: string }>
}> = [
  { key: "payments", label: "Payments", icon: CurrencyInrIcon },
  { key: "cross-border", label: "Cross Border", icon: GlobeIcon },
  { key: "cards", label: "Cards", icon: CreditCardIcon },
  { key: "fintech-apis", label: "Fintech APIs", icon: BracketsCurlyIcon },
]

export function V2ProductRail({ activeProduct, onProductChange }: V2ProductRailProps) {

  return (
    <TooltipProvider delayDuration={80}>
      <aside className="sticky top-14 z-20 hidden h-[calc(100vh-3.5rem)] w-14 shrink-0 self-start border-r border-border/60 bg-sidebar md:flex">
        <nav className="flex w-full flex-col items-center gap-1.5 overflow-y-auto px-1 py-3">
          {RAIL_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeProduct === item.key

            return (
              <Tooltip key={item.key}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onProductChange(item.key)}
                    className={cn(
                      "group relative h-10 w-10 rounded-lg p-0 transition-all duration-150",
                      "text-muted-foreground hover:!bg-transparent hover:!text-muted-foreground aria-expanded:!bg-transparent aria-expanded:!text-muted-foreground"
                    )}
                    aria-pressed={isActive}
                    aria-label={item.label}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                        isActive
                          ? "bg-primary/12 text-primary"
                          : "bg-transparent text-current group-hover:bg-primary/12 group-hover:text-primary"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="sr-only">{item.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8} className="z-[220]">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </nav>
      </aside>
    </TooltipProvider>
  )
}
