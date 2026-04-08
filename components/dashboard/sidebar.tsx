"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/lib/sidebar-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  LayoutGrid,
  CreditCard,
  Link2,
  Settings,
  Package,
  Lightbulb,
  HelpCircle,
  Smartphone,
  Store,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react"

const navSections = [
  {
    label: null,
    items: [{ name: "Overview", href: "/", icon: LayoutGrid }],
  },
  {
    label: "Products",
    items: [
      { name: "Online Payments", href: "/online-payments", icon: CreditCard },
      { name: "Offline Payments", href: "/offline-payments", icon: Smartphone },
      { name: "Payment Links", href: "/payment-links", icon: Link2 },
    ],
  },
  {
    label: "Explore",
    items: [
      { name: "Products", href: "/products", icon: Package },
      { name: "Use Cases", href: "/use-cases", icon: Lightbulb },
    ],
  },
]

const bottomItems = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help & Support", href: "/support", icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebar()

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  function NavItem({ name, href, icon: Icon }: { name: string; href: string; icon: React.ComponentType<{ className?: string }> }) {
    const active = isActive(href)

    const btn = (
      <div className="relative">
        {active && (
          <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-primary" />
        )}
        <Button
          variant="ghost"
          asChild
          className={cn(
            "h-9 gap-2.5 font-medium rounded-lg transition-colors duration-150",
            collapsed ? "w-9 justify-center px-0" : "w-full justify-start px-3",
            active
              ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90"
              : "text-sidebar-foreground hover:bg-accent/45 hover:text-foreground"
          )}
        >
          <Link href={href}>
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                active ? "text-primary" : "text-muted-foreground"
              )}
            />
            {!collapsed && <span className="truncate">{name}</span>}
          </Link>
        </Button>
      </div>
    )

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{btn}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs">{name}</TooltipContent>
        </Tooltip>
      )
    }
    return btn
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col h-full border-r border-sidebar-border bg-sidebar shrink-0 transition-all duration-200",
          collapsed ? "w-14" : "w-[240px]"
        )}
      >
        {/* ── Logo + Store ─────────────────────────────────── */}
        <div className={cn("border-b border-sidebar-border", collapsed ? "px-2.5 py-4" : "px-4 py-4")}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" className="w-9 h-9 px-0 justify-center">
                  <Store className="h-4 w-4 text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">Acme Store · MID 8834829</TooltipContent>
            </Tooltip>
          ) : (
            <>
              <Link href="/" className="block mb-3">
                <img src="/images/pine-labs-one-logo.png" alt="Pine Labs ONE" className="h-8 w-auto" />
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start h-auto px-2.5 py-2 gap-2.5 hover:bg-muted"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/15 shrink-0">
                  <Store className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-semibold text-foreground truncate leading-tight">Acme Store</p>
                  <p className="text-[10px] text-muted-foreground truncate leading-tight">MID · 8834829</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </Button>
            </>
          )}
        </div>

        {/* ── Navigation ───────────────────────────────────── */}
        <nav className={cn("flex-1 overflow-y-auto py-3 space-y-5", collapsed ? "px-2.5" : "px-3")}>
          {navSections.map((section, i) => (
            <div key={i} className="space-y-0.5">
              {section.label && !collapsed && (
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground select-none">
                  {section.label}
                </p>
              )}
              {collapsed && section.label && (
                <Separator className="my-2 bg-sidebar-border" />
              )}
              {section.items.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>
          ))}
        </nav>

        {/* ── Bottom ───────────────────────────────────────── */}
        <div className={cn("border-t border-sidebar-border py-3 space-y-0.5", collapsed ? "px-2.5" : "px-3")}>
          {bottomItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}

          <Separator className="my-2 bg-sidebar-border" />

          {/* User row */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" className="w-9 h-9 px-0 justify-center">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">RS</AvatarFallback>
                  </Avatar>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">Rahul Sharma</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start h-auto px-2.5 py-2 gap-2.5 hover:bg-muted"
            >
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">RS</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-semibold text-foreground truncate leading-tight">Rahul Sharma</p>
                <p className="text-[10px] text-muted-foreground truncate leading-tight">rahul@acmestore.in</p>
              </div>
            </Button>
          )}

          {/* Collapse toggle */}
          <Button
            variant="ghost"
            onClick={toggle}
            className={cn(
              "h-8 gap-2 text-muted-foreground hover:text-foreground text-xs mt-1",
              collapsed ? "w-9 px-0 justify-center" : "w-full justify-start px-3"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <>
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
