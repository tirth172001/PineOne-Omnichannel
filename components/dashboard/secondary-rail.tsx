"use client"

import Link from "next/link"
import { useMemo } from "react"
import {
  LayoutGrid,
  CreditCard,
  Smartphone,
  Link2,
  Globe,
  Package,
  Lightbulb,
  HelpCircle,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PageLayoutRecipe } from "@/lib/workspace-recipes"

interface SecondaryRailProps {
  pathname: string
  recipe: PageLayoutRecipe
}

type RailItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  matcher: (pathname: string) => boolean
}

const railBySection: Record<PageLayoutRecipe["section"], RailItem[]> = {
  overview: [
    {
      href: "/",
      label: "Overview",
      icon: LayoutGrid,
      matcher: (pathname) => pathname === "/",
    },
    {
      href: "/products",
      label: "Products",
      icon: Package,
      matcher: (pathname) => pathname.startsWith("/products"),
    },
  ],
  payments: [
    {
      href: "/online-payments",
      label: "Online",
      icon: CreditCard,
      matcher: (pathname) => pathname.startsWith("/online-payments"),
    },
    {
      href: "/offline-payments",
      label: "Offline",
      icon: Smartphone,
      matcher: (pathname) => pathname.startsWith("/offline-payments"),
    },
    {
      href: "/card-payments",
      label: "Cards",
      icon: CreditCard,
      matcher: (pathname) => pathname.startsWith("/card-payments"),
    },
    {
      href: "/pos-device",
      label: "POS",
      icon: Smartphone,
      matcher: (pathname) => pathname.startsWith("/pos-device"),
    },
    {
      href: "/payment-links",
      label: "Links",
      icon: Link2,
      matcher: (pathname) => pathname.startsWith("/payment-links"),
    },
    {
      href: "/international-payments",
      label: "Intl",
      icon: Globe,
      matcher: (pathname) => pathname.startsWith("/international-payments"),
    },
  ],
  products: [
    {
      href: "/products",
      label: "Products",
      icon: Package,
      matcher: (pathname) => pathname.startsWith("/products"),
    },
    {
      href: "/use-cases",
      label: "Use Cases",
      icon: Lightbulb,
      matcher: (pathname) => pathname.startsWith("/use-cases"),
    },
  ],
  operations: [
    {
      href: "/support",
      label: "Support",
      icon: HelpCircle,
      matcher: (pathname) => pathname.startsWith("/support"),
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      matcher: (pathname) => pathname.startsWith("/settings"),
    },
  ],
  onboarding: [],
  other: [],
}

export function SecondaryRail({ pathname, recipe }: SecondaryRailProps) {
  const items = useMemo(() => railBySection[recipe.section] ?? [], [recipe.section])

  if (!items.length) return null

  return (
    <aside className="w-14 border-r border-border/80 bg-sidebar shrink-0 py-3 px-1.5 flex flex-col gap-1">
      {items.map((item) => {
        const active = item.matcher(pathname)
        const Icon = item.icon
        return (
          <Button
            key={item.href}
            variant="ghost"
            asChild
            size="icon-sm"
            className={cn(
              "h-10 w-10 rounded-lg",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
            )}
            title={item.label}
          >
            <Link href={item.href} aria-label={item.label}>
              <Icon className="h-4 w-4" />
            </Link>
          </Button>
        )
      })}
    </aside>
  )
}
