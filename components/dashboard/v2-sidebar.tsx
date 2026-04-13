"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronDown,
  CreditCard,
  Globe,
  LayoutGrid,
  LifeBuoy,
  Link2,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Store,
  Sun,
  Layers,
  Lightbulb,
  CircleUserRound,
} from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { clearDummyAuthSession, readDummyAuthSession } from "@/lib/dummy-auth"
import { DemoSettingsDialog } from "./demo-settings-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SubItem = {
  label: string
  href: string
}

type NavItem = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  subItems?: SubItem[]
  matcher?: (pathname: string) => boolean
  href?: string // only for leaf items
}

type NavSection = {
  label?: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    items: [
      {
        label: "Overview",
        href: "/",
        icon: LayoutGrid,
        matcher: (p) => p === "/",
      },
    ],
  },
  {
    label: "Products",
    items: [
      {
        label: "Online Payments",
        icon: CreditCard,
        matcher: (p) => p.startsWith("/online-payments"),
        subItems: [
          { label: "Overview", href: "/online-payments" },
          { label: "Transactions", href: "/online-payments/transactions" },
          { label: "Settlements", href: "/online-payments/settlements" },
          { label: "Disputes", href: "/online-payments/disputes" },
          { label: "Refunds", href: "/online-payments/refunds" },
          { label: "Reports", href: "/online-payments/reports" },
        ],
      },
      {
        label: "Offline Payments",
        icon: Store,
        matcher: (p) => p.startsWith("/offline-payments"),
        subItems: [
          { label: "Overview", href: "/offline-payments" },
          { label: "Transactions", href: "/offline-payments/transactions" },
          { label: "Settlements", href: "/offline-payments/settlements" },
          { label: "Disputes", href: "/offline-payments/disputes" },
          { label: "Refunds", href: "/offline-payments/refunds" },
          { label: "Reports", href: "/offline-payments/reports" },
        ],
      },
      {
        label: "Payment Links",
        icon: Link2,
        matcher: (p) => p.startsWith("/payment-links"),
        subItems: [
          { label: "Overview", href: "/payment-links" },
          { label: "All Links", href: "/payment-links/all" },
          { label: "Transactions", href: "/payment-links/transactions" },
          { label: "Reports", href: "/payment-links/reports" },
        ],
      },
      {
        label: "Card Payments",
        icon: CreditCard,
        matcher: (p) => p.startsWith("/card-payments"),
        subItems: [
          { label: "Overview", href: "/card-payments" },
          { label: "Transactions", href: "/card-payments/transactions" },
          { label: "Settlements", href: "/card-payments/settlements" },
          { label: "Disputes", href: "/card-payments/disputes" },
          { label: "Reports", href: "/card-payments/reports" },
        ],
      },
      {
        label: "International",
        icon: Globe,
        matcher: (p) => p.startsWith("/international-payments"),
        subItems: [
          { label: "Overview", href: "/international-payments" },
          { label: "Transactions", href: "/international-payments/transactions" },
          { label: "Settlements", href: "/international-payments/settlements" },
          { label: "Reports", href: "/international-payments/reports" },
        ],
      },
    ],
  },
  {
    label: "Explore",
    items: [
      {
        label: "Products",
        href: "/products",
        icon: Layers,
        matcher: (p) => p.startsWith("/products"),
      },
      {
        label: "Use Cases",
        href: "/use-cases",
        icon: Lightbulb,
        matcher: (p) => p.startsWith("/use-cases"),
      },
      {
        label: "Help & Support",
        href: "/support",
        icon: LifeBuoy,
        matcher: (p) => p.startsWith("/support"),
      },
    ],
  },
]

function NavGroup({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = item.matcher ? item.matcher(pathname) : pathname === item.href
  const hasSubItems = item.subItems && item.subItems.length > 0
  const [open, setOpen] = useState(isActive)

  useEffect(() => {
    if (isActive) setOpen(true)
  }, [isActive])

  const Icon = item.icon

  // Leaf item (no children) — renders as a link
  if (!hasSubItems && item.href) {
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {item.label}
        {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
      </Link>
    )
  }

  // Parent item — button only, no navigation
  const activeSubHref = item.subItems?.find(
    (s) => pathname === s.href
  )?.href ?? null

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open ? "rotate-180" : ""
          )}
        />
      </button>

      {open && (
        <div className="ml-[22px] mt-0.5 border-l border-border/50 pl-3 flex flex-col gap-0.5 pb-1">
          {item.subItems!.map((sub) => {
            const subActive = activeSubHref === sub.href
            return (
              <Link
                key={sub.href}
                href={sub.href}
                className={cn(
                  "block rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                  subActive
                    ? "bg-primary/15 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {sub.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function V2Sidebar() {
  const pathname = usePathname()
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
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border/70 bg-sidebar">
      {/* Logo */}
      <div className="px-4 pt-4 pb-3 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg px-1 py-1">
          <img
            src="/brand/pine-labs-icon.ico"
            alt="Pine Labs"
            className="h-5 w-5 object-contain dark:brightness-0 dark:invert"
          />
          <span className="text-sm font-semibold text-foreground">Pine Labs ONE</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-4">
        {navSections.map((section, si) => (
          <div key={si} className="flex flex-col gap-0.5">
            {section.label && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {section.label}
              </p>
            )}
            {section.items.map((item) => (
              <NavGroup key={item.href ?? item.label} item={item} pathname={pathname} />
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom: theme + profile */}
      <div className="border-t border-border/50 px-3 py-3 flex flex-col gap-1">
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
          {isDark ? "Light mode" : "Dark mode"}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <CircleUserRound className="h-4 w-4 shrink-0" />
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[13px] font-medium text-foreground leading-tight truncate w-full">{profileName}</span>
                <span className="text-[11px] text-muted-foreground leading-tight">{profileRole}</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52">
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
      </div>

      <DemoSettingsDialog open={demoOpen} onOpenChange={setDemoOpen} />
    </aside>
  )
}
