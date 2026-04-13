"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DemoSettingsDialog } from "./demo-settings-dialog"
import {
  BookOpenText,
  CircleUserRound,
  CreditCard,
  LayoutGrid,
  LifeBuoy,
  Link2,
  LogOut,
  Monitor,
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

const itemClass =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/55 hover:text-foreground"

export function AppTopbar({ pathname }: AppTopbarProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [profileName, setProfileName] = useState("Rahul Sharma")
  const [profileRole, setProfileRole] = useState("Admin")
  const [demoOpen, setDemoOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const session = readDummyAuthSession()
    if (session) {
      setProfileName(session.name)
      setProfileRole(session.role)
    }
  }, [])

  const isDark = mounted ? theme !== "light" : true

  return (
    <aside className="relative z-40 h-full w-56 shrink-0 flex flex-col border-r border-border/70 bg-card/95 px-2 py-2 shadow-sm">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
        aria-label="Pine Labs Home"
      >
        <img
          src="/brand/pine-labs-icon.ico"
          alt="Pine Labs icon"
          className="h-5 w-5 shrink-0 object-contain dark:brightness-0 dark:invert"
        />
        <span className="text-sm font-semibold text-foreground">Pine Labs</span>
      </Link>

      {/* Main nav */}
      <div className="mt-3 flex flex-1 flex-col gap-1">
        {productItems.map((item) => {
          const Icon = item.icon
          const active = item.matcher(pathname)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(itemClass, active && "bg-primary/10 text-foreground font-medium")}
              aria-label={item.label}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}

        <div className="my-1 h-px w-full bg-border/75" />

        {utilityItems.map((item) => {
          const Icon = item.icon
          const active = item.matcher(pathname)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(itemClass, active && "bg-secondary/70 text-foreground font-medium")}
              aria-label={item.label}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}

        <button
          className={itemClass}
          onClick={() => window.open("https://developer.pinelabs.com/", "_blank", "noopener,noreferrer")}
        >
          <BookOpenText className="h-4 w-4 shrink-0" />
          <span>BI docs</span>
        </button>

        <button className={itemClass}>
          <Search className="h-4 w-4 shrink-0" />
          <span>Search</span>
        </button>
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-1 pb-1">
        <button
          className={itemClass}
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {isDark
            ? <Sun className="h-4 w-4 shrink-0" />
            : <Moon className="h-4 w-4 shrink-0" />}
          <span>{isDark ? "Light mode" : "Dark mode"}</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(itemClass, pathname.startsWith("/settings") && "bg-secondary/70 text-foreground")}
            >
              <CircleUserRound className="h-4 w-4 shrink-0" />
              <span>Profile</span>
            </button>
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
            <DropdownMenuItem onSelect={() => setDemoOpen(true)}>
              <Monitor className="mr-2 h-3.5 w-3.5" />
              Demo settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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

        <button
          className={cn(itemClass, pathname.startsWith("/configure-products") && "bg-secondary/70 text-foreground")}
          onClick={() => router.push("/configure-products")}
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>Configure</span>
        </button>

      </div>

      <DemoSettingsDialog open={demoOpen} onOpenChange={setDemoOpen} />
    </aside>
  )
}
