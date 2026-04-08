"use client"

import * as React from "react"
import Link from "next/link"
import { CreditCard, Home, Link2, ReceiptText, Settings, UserRoundCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  pathname: string
  hidden?: boolean
}

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  matcher: (pathname: string) => boolean
}

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Overview",
    icon: Home,
    matcher: (pathname) => pathname === "/",
  },
  {
    href: "/online-payments",
    label: "Online",
    icon: CreditCard,
    matcher: (pathname) => pathname.startsWith("/online-payments"),
  },
  {
    href: "/offline-payments",
    label: "Offline",
    icon: ReceiptText,
    matcher: (pathname) =>
      pathname.startsWith("/offline-payments") ||
      pathname.startsWith("/card-payments") ||
      pathname.startsWith("/pos-device") ||
      pathname.startsWith("/international-payments"),
  },
  {
    href: "/payment-links",
    label: "Pay by Link",
    icon: Link2,
    matcher: (pathname) => pathname.startsWith("/payment-links"),
  },
  {
    href: "/support",
    label: "Support",
    icon: UserRoundCog,
    matcher: (pathname) => pathname.startsWith("/support"),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    matcher: (pathname) => pathname.startsWith("/settings"),
  },
]

export function BottomNav({ pathname, hidden = false }: BottomNavProps) {
  const [hiddenByScroll, setHiddenByScroll] = React.useState(false)

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
        "pointer-events-none fixed bottom-3 left-1/2 z-50 w-[min(760px,calc(100%-1rem))] -translate-x-1/2 transition-all duration-250",
        isHidden ? "translate-y-20 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      )}
      aria-label="Primary"
    >
      <div className="pointer-events-auto mx-auto flex items-center justify-between gap-0.5 rounded-full border border-primary/25 bg-popover/95 p-1 shadow-lg backdrop-blur">
        {navItems.map((item) => {
          const active = item.matcher(pathname)
          const Icon = item.icon

          return (
            <Button
              key={item.href}
              variant={active ? "secondary" : "ghost"}
              asChild
              size="sm"
              className={cn(
                "h-8 rounded-full px-2 text-[11px]",
                active
                  ? "bg-primary/20 text-foreground shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.14)]"
                  : "text-muted-foreground"
              )}
            >
              <Link href={item.href}>
                <Icon className="mr-0.5 h-3.5 w-3.5" />
                {item.label}
              </Link>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
