"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  BookOpenText,
  CircleUserRound,
  CreditCard,
  LayoutGrid,
  LifeBuoy,
  Link2,
  LogOut,
  Moon,
  Plus,
  Search,
  Settings,
  Store,
  Sun,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { clearDummyAuthSession, readDummyAuthSession } from "@/lib/dummy-auth"
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

type RailItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  matcher: (pathname: string) => boolean
}

const productItems: RailItem[] = [
  {
    href: "/",
    label: "All products",
    icon: LayoutGrid,
    matcher: (pathname) => pathname === "/",
  },
  {
    href: "/online-payments",
    label: "Online payments",
    icon: CreditCard,
    matcher: (pathname) =>
      pathname.startsWith("/online-payments") ||
      pathname.startsWith("/card-payments") ||
      pathname.startsWith("/international-payments"),
  },
  {
    href: "/offline-payments",
    label: "Offline payments",
    icon: Store,
    matcher: (pathname) => pathname.startsWith("/offline-payments") || pathname.startsWith("/pos-device"),
  },
  {
    href: "/payment-links",
    label: "Pay by link",
    icon: Link2,
    matcher: (pathname) => pathname.startsWith("/payment-links"),
  },
]

const utilityItems: RailItem[] = [
  {
    href: "/support",
    label: "Support",
    icon: LifeBuoy,
    matcher: (pathname) => pathname.startsWith("/support"),
  },
]

export function AppTopbar({ pathname }: AppTopbarProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [profileName, setProfileName] = useState("Rahul Sharma")
  const [profileRole, setProfileRole] = useState("Admin")

  useEffect(() => {
    setMounted(true)
    const session = readDummyAuthSession()
    if (session) {
      setProfileName(session.name)
      setProfileRole(session.role)
    }
  }, [])

  const isDark = mounted ? theme !== "light" : true

  const railItemClass =
    "relative !h-10 !w-full !justify-start !rounded-lg !p-0 text-muted-foreground transition-colors hover:bg-muted/55 hover:text-foreground"

  const railIconClass =
    "pointer-events-none absolute left-6 top-1/2 -translate-x-1/2 -translate-y-1/2"

  const railLabelClass =
    "pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity] duration-200 " +
    "group-hover/nav:max-w-[140px] group-hover/nav:opacity-100 " +
    "group-focus-within/nav:max-w-[140px] group-focus-within/nav:opacity-100"

  return (
    <aside className="group/nav relative z-40 h-full w-16 shrink-0 overflow-visible">
      <div className="absolute inset-y-0 left-0 flex w-16 flex-col overflow-x-hidden border-r border-border/70 bg-card/95 px-2 py-2 backdrop-blur shadow-sm transition-[width] duration-200 hover:w-56 focus-within:w-56 group-hover/nav:w-56 group-focus-within/nav:w-56">
      <Link
        href="/"
        className="relative h-10 w-full rounded-lg text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
        aria-label="Pine Labs Home"
        title="Pine Labs"
      >
        <img
          src="/brand/pine-labs-icon.ico"
          alt="Pine Labs icon"
          className="absolute left-6 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 object-contain dark:brightness-0 dark:invert"
        />
        <span className={cn(railLabelClass, "text-sm font-semibold text-foreground")}>Pine Labs</span>
      </Link>

      <div className="mt-3 flex flex-1 flex-col items-center gap-1.5">
        {productItems.map((item) => {
          const Icon = item.icon
          const active = item.matcher(pathname)
          return (
            <Button
              key={item.href}
              variant="ghost"
              size="icon-sm"
              asChild
              className={cn(railItemClass, active ? "bg-primary/18 text-foreground" : undefined)}
              aria-label={item.label}
              title={item.label}
            >
              <Link href={item.href}>
                <Icon className={cn(railIconClass, "h-4 w-4")} />
                <span className={cn(railLabelClass, "text-sm")}>{item.label}</span>
              </Link>
            </Button>
          )
        })}

        <div className="my-1 h-px w-8 bg-border/75 transition-all duration-200 group-hover/nav:w-full group-focus-within/nav:w-full" />

        {utilityItems.map((item) => {
          const Icon = item.icon
          const active = item.matcher(pathname)
          return (
            <Button
              key={item.href}
              variant="ghost"
              size="icon-sm"
              asChild
              className={cn(railItemClass, active ? "bg-secondary/70 text-foreground" : undefined)}
              aria-label={item.label}
              title={item.label}
            >
              <Link href={item.href}>
                <Icon className={cn(railIconClass, "h-4 w-4")} />
                <span className={cn(railLabelClass, "text-sm")}>{item.label}</span>
              </Link>
            </Button>
          )
        })}

        <Button
          variant="ghost"
          size="icon-sm"
          className={railItemClass}
          aria-label="BI docs"
          title="BI docs"
          onClick={() => window.open("https://developer.pinelabs.com/", "_blank", "noopener,noreferrer")}
        >
          <BookOpenText className={cn(railIconClass, "h-4 w-4")} />
          <span className={cn(railLabelClass, "text-sm")}>BI docs</span>
        </Button>

        <Button variant="ghost" size="icon-sm" className={railItemClass} aria-label="Search" title="Search">
          <Search className={cn(railIconClass, "h-4 w-4")} />
          <span className={cn(railLabelClass, "text-sm")}>Search</span>
        </Button>
      </div>

      <div className="flex flex-col items-center gap-1.5 pb-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className={railItemClass}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Light mode" : "Dark mode"}
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {isDark ? <Sun className={cn(railIconClass, "h-4 w-4")} /> : <Moon className={cn(railIconClass, "h-4 w-4")} />}
          <span className={cn(railLabelClass, "text-sm")}>{isDark ? "Light mode" : "Dark mode"}</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn(railItemClass, pathname.startsWith("/settings") ? "bg-secondary/70 text-foreground" : undefined)}
              aria-label="Open profile menu"
              title="Profile"
            >
              <CircleUserRound className={cn(railIconClass, "h-4 w-4")} />
              <span className={cn(railLabelClass, "text-sm")}>Profile</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-52">
            <DropdownMenuLabel className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">{profileName}</p>
              <p className="text-[11px] text-muted-foreground">{profileRole}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push("/settings")}>
              <Settings className="mr-2 h-3.5 w-3.5" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                clearDummyAuthSession()
                router.replace("/login")
              }}
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant={pathname.startsWith("/configure-products") ? "secondary" : "ghost"}
          size="icon-sm"
          className={railItemClass}
          aria-label="Configure products"
          title="Configure products"
          onClick={() => router.push("/configure-products")}
        >
          <Plus className={cn(railIconClass, "h-4 w-4")} />
          <span className={cn(railLabelClass, "text-sm")}>Configure</span>
        </Button>
      </div>
      </div>
    </aside>
  )
}
