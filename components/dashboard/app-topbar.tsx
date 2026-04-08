"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  BookOpenText,
  ChevronDown,
  CircleUserRound,
  LifeBuoy,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DASHBOARD_CONTENT_MAX_WIDTH } from "@/lib/dashboard-layout"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AppTopbarProps {
  pathname: string
}

const productItems = [
  { label: "All products", href: "/" },
  { label: "Online Payments", href: "/online-payments" },
  { label: "Offline Payments", href: "/offline-payments" },
  { label: "Pay by Link", href: "/payment-links" },
]

function getRouteTitle(pathname: string): string {
  if (pathname === "/") return "Overview"
  if (pathname.startsWith("/online-payments")) return "Online Payments"
  if (pathname.startsWith("/offline-payments")) return "Offline Payments"
  if (pathname.startsWith("/payment-links")) return "Payment Links"
  if (pathname.startsWith("/card-payments")) return "Card Payments"
  if (pathname.startsWith("/pos-device")) return "POS Devices"
  if (pathname.startsWith("/international-payments")) return "International Payments"
  if (pathname.startsWith("/products")) return "Products"
  if (pathname.startsWith("/use-cases")) return "Use Cases"
  if (pathname.startsWith("/support")) return "Support"
  if (pathname.startsWith("/settings")) return "Settings"
  if (pathname.startsWith("/onboarding")) return "Onboarding"
  return "Workspace"
}

function getActiveProduct(pathname: string) {
  if (pathname.startsWith("/online-payments")) return productItems[1]
  if (pathname.startsWith("/offline-payments")) return productItems[2]
  if (pathname.startsWith("/payment-links")) return productItems[3]
  return productItems[0]
}

export function AppTopbar({ pathname }: AppTopbarProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isOnboarding = pathname.startsWith("/onboarding")

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? theme !== "light" : true
  const activeProduct = useMemo(() => getActiveProduct(pathname), [pathname])

  const navItemClass =
    "rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/55 hover:text-foreground"
  const iconButtonClass = "h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"

  return (
    <header className="shrink-0 border-b border-border/70 bg-card/90 backdrop-blur">
      <div
        className="mx-auto flex h-14 w-full items-center justify-between px-3 md:px-4 lg:px-6 xl:px-8"
        style={{ maxWidth: DASHBOARD_CONTENT_MAX_WIDTH }}
      >
        {!isOnboarding ? (
          <div className="flex min-w-0 items-center gap-2">
            <Link href="/" className="mr-1 flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-muted/40">
              <img
                src="/brand/pine-labs-icon.ico"
                alt="Pine Labs icon"
                className="h-5 w-5 object-contain dark:brightness-0 dark:invert"
              />
              <span className="text-sm font-semibold text-foreground">Pine Labs</span>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    navItemClass,
                    "h-9 rounded-lg border border-primary/35 bg-primary/10 px-3.5 font-semibold text-foreground shadow-sm hover:bg-primary/15",
                  )}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {activeProduct.label}
                    <ChevronDown className="h-3.5 w-3.5 text-foreground/70" />
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {productItems.map((item) => (
                  <DropdownMenuItem key={item.href} onSelect={() => router.push(item.href)}>
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-2">
            {isOnboarding && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-8 w-8 rounded-full text-muted-foreground"
                onClick={() => router.back()}
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <p className="text-[14px] font-medium text-foreground">{getRouteTitle(pathname)}</p>
          </div>
        )}

        <div className="ml-2 flex items-center gap-1.5">
          {!isOnboarding && (
            <>
              <Link
                href="/support"
                className={cn(
                  "inline-flex items-center justify-center rounded-full transition-colors",
                  pathname.startsWith("/support") ? "bg-secondary/70 text-foreground" : "text-muted-foreground",
                  iconButtonClass,
                )}
                aria-label="Support"
              >
                <LifeBuoy className="h-4 w-4" />
              </Link>
              <Link
                href="https://developer.pinelabs.com/"
                target="_blank"
                rel="noreferrer"
                className={cn("inline-flex items-center justify-center rounded-full", iconButtonClass)}
                aria-label="BI Docs"
              >
                <BookOpenText className="h-4 w-4" />
              </Link>
            </>
          )}

          <Button variant="ghost" size="icon-sm" className={iconButtonClass} aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            className={iconButtonClass}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {!isOnboarding && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className={iconButtonClass}>
                    <CircleUserRound className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">Rahul Sharma</p>
                    <p className="text-[11px] text-muted-foreground">Admin</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push("/settings")}>
                    <Settings className="mr-2 h-3.5 w-3.5" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/")}>
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="sm"
                className="h-8 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground hover:bg-primary/90"
                onClick={() => router.push("/configure-products")}
              >
                Add products
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
