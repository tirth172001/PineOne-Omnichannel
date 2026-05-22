"use client"

import { useEffect, useState, type CSSProperties, type ComponentType, type ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowLeftRight,
  Bell,
  BookOpen,
  Building2,
  CircleDot,
  CreditCard,
  Ellipsis,
  FileText,
  Gavel,
  Globe,
  Home,
  Link2,
  LogOut,
  MessageSquare,
  MessageSquareText,
  Moon,
  QrCode,
  RotateCcw,
  Search,
  Shield,
  SlidersHorizontal,
  Store,
  Sun,
  UserCircle2,
  Users,
  WalletCards,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { NavVisibilityProvider } from "@/components/dashboard/nav-visibility-context"
import { clearDummyAuthSession, readDummyAuthSession } from "@/lib/dummy-auth"
import { cn } from "@/lib/utils"

interface TransactionsPlatformShellProps {
  children: ReactNode
}

type ShellNavItem = {
  label: string
  href?: string
  icon: ComponentType<{ className?: string }>
  subItems?: Array<{ label: string; href: string; icon: ComponentType<{ className?: string }> }>
}

const navGroups: Array<{ label?: string; items: ShellNavItem[] }> = [
  {
    items: [
      { label: "Overview", href: "/", icon: Home },
      { label: "Transaction", href: "/transactions", icon: ArrowLeftRight },
      { label: "Settlement", href: "/settlements", icon: WalletCards },
      { label: "Dispute cases", href: "/disputes", icon: Gavel },
      { label: "Refunds", href: "/refunds", icon: RotateCcw },
      { label: "Reports", href: "/reports", icon: FileText },
    ],
  },
  {
    label: "In-store payment",
    items: [
      { label: "POS terminals", href: "/offline-payments/manage-devices", icon: Store },
      { label: "Store QR stickers", href: "/products/in-store-payments/upi-qr-sticker", icon: QrCode },
    ],
  },
  {
    label: "Online payment",
    items: [
      { label: "Payment gateway", href: "/online-payments", icon: Globe },
      { label: "Payment links", href: "/payment-links", icon: Link2 },
      { label: "Subscriptions", href: "/products/other-products", icon: RotateCcw },
      {
        label: "More",
        icon: Ellipsis,
        subItems: [
          { label: "Smart routing", href: "/online-products/smart-routing", icon: CreditCard },
          { label: "QR codes", href: "/online-products/qr-codes", icon: QrCode },
          { label: "3rd party product", href: "/online-products/third-party-product", icon: CircleDot },
        ],
      },
    ],
  },
  {
    label: "Help & support",
    items: [
      { label: "Knowledge hub", href: "/support/knowledge-hub", icon: BookOpen },
      { label: "Support queries", href: "/support/support-queries", icon: MessageSquare },
    ],
  },
]

function SidebarNav() {
  const pathname = usePathname()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  const isHrefActive = (href: string) => {
    const baseHref = href.split("?")[0] ?? href
    if (baseHref === "/") return pathname === "/"
    return pathname === baseHref || pathname.startsWith(`${baseHref}/`)
  }

  useEffect(() => {
    setExpandedGroups((prev) => {
      let changed = false
      const next = { ...prev }

      navGroups.forEach((group) => {
        group.items.forEach((item) => {
          if (!item.subItems?.length) return
          const hasActiveChild = item.subItems.some((sub) => isHrefActive(sub.href))
          if (hasActiveChild && !next[item.label]) {
            next[item.label] = true
            changed = true
          }
        })
      })

      return changed ? next : prev
    })
  }, [pathname])

  return (
    <aside className="sticky top-0 h-screen w-[220px] shrink-0 border-r border-border/60 bg-background lg:w-64">
      <div className="flex h-16 items-center border-b border-border/60 px-3">
        <span className="text-[28px] font-semibold tracking-tight text-foreground">ONE</span>
      </div>

      <nav className="h-[calc(100vh-4rem)] overflow-y-auto bg-background px-2 py-3">
        {navGroups.map((group, groupIndex) => (
          <div key={`${group.label ?? "core"}-${groupIndex}`} className={cn(groupIndex > 0 && "mt-5")}>
            {group.label ? (
              <p className="mb-1 px-2 text-[11px] font-medium text-muted-foreground">{group.label}</p>
            ) : null}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const hasSubItems = Boolean(item.subItems?.length)
                const activeSubItem = item.subItems?.find((sub) => isHrefActive(sub.href))
                const active = hasSubItems ? Boolean(activeSubItem) : Boolean(item.href && isHrefActive(item.href))
                const expanded = Boolean(expandedGroups[item.label])

                if (hasSubItems) {
                  const toggleLabel = expanded ? "Less" : item.label
                  return (
                    <div key={`group-${item.label}`}>
                      {expanded ? (
                        <div className="mb-1 space-y-1">
                          {item.subItems?.map((subItem) => {
                            const subActive = isHrefActive(subItem.href)
                            const SubIcon = subItem.icon
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className={cn(
                                  "flex h-8 items-center gap-2 rounded-md px-2 text-[13px] transition-colors",
                                  subActive
                                    ? "bg-accent text-foreground"
                                    : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                                )}
                              >
                                <SubIcon className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{subItem.label}</span>
                              </Link>
                            )
                          })}
                        </div>
                      ) : null}

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedGroups((prev) => ({
                            ...prev,
                            [item.label]: !prev[item.label],
                          }))
                        }
                        className={cn(
                          "flex h-8 w-full items-center gap-2 rounded-md px-2 text-[13px] transition-colors",
                          "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                        )}
                        aria-expanded={expanded}
                      >
                        <span className="flex-1 truncate text-left">{toggleLabel}</span>
                      </button>
                    </div>
                  )
                }

                if (!item.href) return null

                return (
                  <Link
                    key={item.href ?? item.label}
                    href={item.href}
                    className={cn(
                      "flex h-8 items-center gap-2 rounded-md px-2 text-[13px] transition-colors",
                      active
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}

function Topbar() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [profileName, setProfileName] = useState("Rahul Sharma")
  const [profileRole, setProfileRole] = useState("Admin")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const session = readDummyAuthSession()
    if (!session) return
    setProfileName(session.name)
    setProfileRole(session.role)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const isAdmin = profileRole.toLowerCase() === "admin"
  const isDark = mounted ? theme !== "light" : true

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border/60 bg-background px-6">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="relative w-full max-w-[373px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search pages, actions, products, and settings..."
            className="h-8 rounded-lg border-border/60 bg-card pl-9 pr-12 text-sm"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ⌘K
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-2 py-1">
            <span className="text-xs text-foreground">Test mode</span>
            <Switch checked={false} aria-label="Toggle test mode" />
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon-sm" className="h-8 w-8">
            <Bell className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-full border border-border/60 bg-card">
                <UserCircle2 className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">{profileName}</p>
                <p className="text-[11px] text-muted-foreground">{profileRole}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push("/account/profile")}>
                <UserCircle2 className="mr-2 h-3.5 w-3.5" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push("/account/business-details")}>
                <Building2 className="mr-2 h-3.5 w-3.5" />
                Business details
              </DropdownMenuItem>
              {isAdmin ? (
                <DropdownMenuItem onSelect={() => router.push("/account/users")}>
                  <Users className="mr-2 h-3.5 w-3.5" />
                  Users management
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onSelect={() => router.push("/account/preferences")}>
                <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push("/account/security")}>
                <Shield className="mr-2 h-3.5 w-3.5" />
                Security
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push("/account/feedback")}>
                <MessageSquareText className="mr-2 h-3.5 w-3.5" />
                Feedback
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  clearDummyAuthSession()
                  router.replace("/")
                }}
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export function TransactionsPlatformShell({ children }: TransactionsPlatformShellProps) {
  return (
    <NavVisibilityProvider>
      <div
        className="min-h-screen bg-background text-foreground"
        style={{ "--dashboard-top-offset": "64px" } as CSSProperties}
      >
        <div className="flex min-h-screen w-full">
          <SidebarNav />
          <div className="min-w-0 flex-1">
            <Topbar />
            <main className="min-w-0 overflow-x-hidden">{children}</main>
          </div>
        </div>
      </div>
    </NavVisibilityProvider>
  )
}
