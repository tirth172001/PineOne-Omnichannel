"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getBottomNavItems } from "@/lib/navigation/navigation-model"

interface BottomNavProps {
  pathname: string
  hidden?: boolean
  onMenuClick?: () => void
}

export function BottomNav({ pathname, hidden = false, onMenuClick }: BottomNavProps) {
  const [hiddenByScroll, setHiddenByScroll] = React.useState(false)
  const navItems = getBottomNavItems()

  React.useEffect(() => {
    let lastDirection: "up" | "down" = "up"

    const getScrollableParent = (node: EventTarget | null): HTMLElement | null => {
      if (!(node instanceof HTMLElement)) return null
      let current: HTMLElement | null = node
      while (current && current !== document.body) {
        const style = window.getComputedStyle(current)
        const canScrollY = style.overflowY === "auto" || style.overflowY === "scroll"
        if (canScrollY && current.scrollHeight > current.clientHeight + 2) {
          return current
        }
        current = current.parentElement
      }
      return null
    }

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 2) return
      const scrollContainer = getScrollableParent(event.target)
      if (!scrollContainer) return

      const direction: "up" | "down" = event.deltaY > 0 ? "down" : "up"
      if (direction === lastDirection) return

      if (
        direction === "down" &&
        scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 1
      ) {
        return
      }

      lastDirection = direction
      setHiddenByScroll(direction === "down")
    }

    window.addEventListener("wheel", onWheel, { passive: true })
    return () => window.removeEventListener("wheel", onWheel)
  }, [])

  const isHidden = hidden || hiddenByScroll

  return (
    <nav
      className={cn(
        "pointer-events-none fixed inset-x-3 bottom-3 z-50 transition-all duration-250 md:hidden",
        isHidden ? "translate-y-20 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      )}
      aria-label="Primary"
    >
      <div className="pointer-events-auto mx-auto flex max-w-md items-center justify-between gap-1 rounded-xl border border-border/70 bg-popover/95 px-2 py-1.5 shadow-xl backdrop-blur">
        {navItems.map((item) => {
          const active = item.matcher(pathname)
          const Icon = item.icon

          return (
            <Button
              key={`${item.label}-${item.href ?? "menu"}`}
              variant={active ? "secondary" : "ghost"}
              asChild
              size="sm"
              className={cn(
                "h-9 rounded-md px-2 text-[11px]",
                active
                  ? "bg-primary/15 text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)]"
                  : "text-muted-foreground"
              )}
            >
              <Link href={item.href!}>
                <Icon className="mr-1 h-3.5 w-3.5" />
                {item.label}
              </Link>
            </Button>
          )
        })}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 rounded-md px-2 text-[11px] text-muted-foreground"
          onClick={onMenuClick}
        >
          <Menu className="mr-1 h-3.5 w-3.5" />
          Menu
        </Button>
      </div>
    </nav>
  )
}
