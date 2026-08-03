"use client"

import { useEffect, useState, type CSSProperties, type ComponentType, type ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeftRight,
  Bell,
  BookOpen,
  CircleDot,
  CreditCard,
  Ellipsis,
  FileText,
  Globe,
  Home,
  Link2,
  LogOut,
  MessageSquare,
  Moon,
  PauseCircle,
  QrCode,
  RotateCcw,
  Search,
  Store,
  Sun,
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
import {
  SETTINGS_NAV_ITEMS,
  SettingsPanelContent,
  SettingsSidebarNav,
  type SettingsModule,
} from "@/components/account/settings-slide-panel"
import { clearDummyAuthSession, readDummyAuthSession } from "@/lib/dummy-auth"
import { setThemeWithTransition } from "@/lib/theme-transition"
import { cn } from "@/lib/utils"

const PANEL_TRANSITION = { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const }

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
      { label: "On-hold & disputes", href: "/on-hold-disputes", icon: PauseCircle },
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
    <aside className="sticky top-0 h-screen w-64 shrink-0 bg-sidebar">
      <div className="flex h-16 items-center bg-sidebar px-2">
        <span className="px-4 text-[36px] font-semibold leading-none tracking-[-0.02em] text-foreground">ONE</span>
      </div>

      <nav className="h-[calc(100vh-4rem)] overflow-y-auto bg-sidebar px-2 py-2">
        {navGroups.map((group, groupIndex) => (
          <div key={`${group.label ?? "core"}-${groupIndex}`} className={cn(groupIndex > 0 && "mt-2")}>
            {group.label ? (
              <p className="mb-1 px-2 text-xs font-medium text-muted-foreground/90">{group.label}</p>
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
                                  "flex h-8 items-center gap-2 rounded-md px-2 text-sm leading-none transition-colors",
                                  subActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                    : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
                          "flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm leading-none transition-colors",
                          "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
                      "flex h-8 items-center gap-2 rounded-md px-2 text-sm leading-none transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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

function Topbar({ onOpenSettings }: { onOpenSettings: (module: SettingsModule) => void }) {
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
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-4 px-8">
        <div className="relative w-full max-w-[373px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search pages, actions, products, and settings..."
            className="h-8 rounded-[10px] border-input bg-background pl-9 pr-12 text-sm"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-sm bg-muted px-1 py-0 text-xs text-muted-foreground">
            ⌘K
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-[10px] border border-border bg-background px-2.5 py-1.5">
            <span className="text-xs text-foreground">Test mode</span>
            <Switch checked={false} aria-label="Toggle test mode" />
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8 rounded-md"
            onClick={() => setThemeWithTransition(setTheme, isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-md">
            <Bell className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-full bg-muted text-sm font-medium text-muted-foreground hover:bg-muted">
                TT
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">{profileName}</p>
                <p className="text-[11px] text-muted-foreground">{profileRole}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SETTINGS_NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => {
                const Icon = item.icon
                return (
                  <DropdownMenuItem key={item.key} onSelect={() => onOpenSettings(item.key)}>
                    <Icon className="mr-2 h-3.5 w-3.5" />
                    {item.label}
                  </DropdownMenuItem>
                )
              })}
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
  const router = useRouter()
  const [settingsModule, setSettingsModule] = useState<SettingsModule | null>(null)

  function closeSettings() {
    setSettingsModule(null)
  }

  function logoutFromSettings() {
    clearDummyAuthSession()
    router.replace("/")
  }

  return (
    <NavVisibilityProvider>
      <div
        className="min-h-screen bg-[var(--app-shell-surface)] text-foreground"
        style={{ "--dashboard-top-offset": "64px" } as CSSProperties}
      >
        <div className="flex min-h-screen w-full">
          <div className="relative w-64 shrink-0">
            <SidebarNav />
            <AnimatePresence>
              {settingsModule ? (
                <motion.div
                  key="settings-sidebar"
                  className="absolute inset-0 z-10 h-full w-64 overflow-hidden"
                  initial={{ x: -256, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -256, opacity: 0 }}
                  transition={PANEL_TRANSITION}
                >
                  <SettingsSidebarNav
                    activeModule={settingsModule}
                    onSelect={setSettingsModule}
                    onBack={closeSettings}
                    onLogout={logoutFromSettings}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="min-w-0 flex-1 bg-[var(--app-shell-surface)] p-2 pl-0">
            <div className="flex min-h-[calc(100vh-16px)] flex-col overflow-hidden rounded-md bg-background">
              <Topbar onOpenSettings={setSettingsModule} />
              <div className="relative min-w-0 flex-1 overflow-x-hidden bg-background">
                <main className="h-full">{children}</main>
                <AnimatePresence>
                  {settingsModule ? (
                    <motion.div
                      key="settings-content"
                      className="absolute inset-0 z-10 overflow-y-auto bg-background"
                      initial={{ x: 32, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 32, opacity: 0 }}
                      transition={PANEL_TRANSITION}
                    >
                      <SettingsPanelContent module={settingsModule} />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NavVisibilityProvider>
  )
}
