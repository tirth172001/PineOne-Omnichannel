"use client"

import { useEffect, useState, type CSSProperties, type ComponentType, type ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowCounterClockwiseIcon,
  CaretUpDownIcon,
  ChatIcon,
  CreditCardIcon,
  FileTextIcon,
  GavelIcon,
  GearIcon,
  HouseIcon,
  LinkIcon,
  MoonIcon,
  PaletteIcon,
  SignOutIcon,
  StorefrontIcon,
  SunIcon,
  WalletIcon,
} from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogoMark } from "@/components/brand/logo-mark"
import { NavVisibilityProvider } from "@/components/dashboard/nav-visibility-context"
import {
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
  href: string
  icon: ComponentType<{ className?: string }>
}

const navGroups: Array<{ label?: string; items: ShellNavItem[] }> = [
  {
    items: [
      { label: "Overview", href: "/", icon: HouseIcon },
      { label: "Payments", href: "/transactions", icon: CreditCardIcon },
      { label: "Settlement", href: "/settlements", icon: WalletIcon },
      { label: "Disputes", href: "/disputes", icon: GavelIcon },
      { label: "Refunds", href: "/refunds", icon: ArrowCounterClockwiseIcon },
      { label: "Reports", href: "/reports", icon: FileTextIcon },
    ],
  },
  {
    label: "Products",
    items: [
      { label: "Terminal devices", href: "/offline-payments/manage-devices", icon: StorefrontIcon },
      { label: "Payment links", href: "/payment-links", icon: LinkIcon },
      { label: "Checkout", href: "/checkout", icon: PaletteIcon },
    ],
  },
]

const DUMMY_BUSINESS = {
  initials: "VS",
  name: "Vijay sales private limited",
  detail: "Online & In-store payments enabled",
}

function AccountMenu({ onLogout }: { onLogout: () => void }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [profileName, setProfileName] = useState("Rahul Sharma")
  const [profileRole, setProfileRole] = useState("Admin")

  useEffect(() => {
    setMounted(true)
    const session = readDummyAuthSession()
    if (!session) return
    setProfileName(session.name)
    setProfileRole(session.role)
  }, [])

  const isDark = mounted ? theme !== "light" : true
  const initials = profileName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-auto w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-sidebar-accent"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-xs font-medium text-muted-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-tight text-sidebar-foreground">{profileName}</p>
            <p className="truncate text-xs leading-tight text-sidebar-foreground/70">{profileRole}</p>
          </div>
          <CaretUpDownIcon className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-72 p-2">
        <p className="px-2 pb-1.5 pt-1 text-xs font-medium text-muted-foreground">Account</p>
        <div className="flex items-center gap-2.5 rounded-md border border-border/70 bg-muted/40 px-2.5 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
            {DUMMY_BUSINESS.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{DUMMY_BUSINESS.name}</p>
            <p className="truncate text-xs text-muted-foreground">{DUMMY_BUSINESS.detail}</p>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-2 w-full">
          Switch account
        </Button>

        <DropdownMenuSeparator className="my-2" />

        <div className="flex items-center justify-between rounded-md px-2 py-1.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{profileName}</p>
            <p className="truncate text-xs text-muted-foreground">{profileRole}</p>
          </div>
        </div>

        <DropdownMenuItem onSelect={() => setThemeWithTransition(setTheme, isDark ? "light" : "dark")}>
          {isDark ? <SunIcon className="mr-2 h-3.5 w-3.5" /> : <MoonIcon className="mr-2 h-3.5 w-3.5" />}
          Dark mode
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={onLogout}>
          <SignOutIcon className="mr-2 h-3.5 w-3.5" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SidebarNav({
  onOpenSettings,
  onLogout,
}: {
  onOpenSettings: (module: SettingsModule) => void
  onLogout: () => void
}) {
  const pathname = usePathname()

  const isHrefActive = (href: string) => {
    const baseHref = href.split("?")[0] ?? href
    if (baseHref === "/") return pathname === "/"
    return pathname === baseHref || pathname.startsWith(`${baseHref}/`)
  }

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-sidebar">
      <div className="flex h-16 shrink-0 items-center bg-sidebar px-2">
        <LogoMark className="h-12 w-auto pr-4 text-foreground" />
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto bg-sidebar px-2 py-2">
        {navGroups.map((group, groupIndex) => (
          <div key={`${group.label ?? "core"}-${groupIndex}`} className={cn(groupIndex > 0 && "mt-6")}>
            {group.label ? (
              <p className="mb-1 px-2 text-xs font-medium text-muted-foreground/90">{group.label}</p>
            ) : null}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isHrefActive(item.href)

                return (
                  <Link
                    key={item.href}
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

        <div className="mt-6">
          <p className="mb-1 px-2 text-xs font-medium text-muted-foreground/90">Other</p>
          <div className="space-y-1">
            <Link
              href="/support"
              className={cn(
                "flex h-8 items-center gap-2 rounded-md px-2 text-sm leading-none transition-colors",
                isHrefActive("/support")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <ChatIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Support</span>
            </Link>

            <button
              type="button"
              onClick={() => onOpenSettings("personal-details")}
              className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm leading-none text-sidebar-foreground/90 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <GearIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Account settings</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="shrink-0 space-y-1 bg-sidebar px-2 py-2">
        <AccountMenu onLogout={onLogout} />
      </div>
    </aside>
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
        style={{ "--dashboard-top-offset": "0px" } as CSSProperties}
      >
        <div className="flex min-h-screen w-full">
          <div className="relative w-64 shrink-0">
            <SidebarNav onOpenSettings={setSettingsModule} onLogout={logoutFromSettings} />
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
