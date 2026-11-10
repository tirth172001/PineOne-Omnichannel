"use client"

import { useEffect, useState, type CSSProperties, type ComponentType, type ReactNode } from "react"
import { JourneyLink as Link } from "@/components/getting-started/navigation"
import { useJourneyPathname as usePathname, useJourneyRouter as useRouter } from "@/components/getting-started/navigation"
import {
  ArrowCounterClockwiseIcon,
  CaretUpDownIcon,
  ChatIcon,
  CheckIcon,
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
  UsersIcon,
  WalletIcon,
} from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LogoMark } from "@/components/brand/logo-mark"
import { NavVisibilityProvider } from "@/components/dashboard/nav-visibility-context"
import { ManageUsersSection } from "@/components/account/settings-slide-panel"
import { ManageStoresSection } from "@/components/account/manage-stores-section"
import {
  BUSINESS_PROFILES,
  useActiveBusinessProfile,
  writeActiveBusinessProfile,
} from "@/lib/business-profiles"
import { clearDummyAuthSession, readDummyAuthSession } from "@/lib/dummy-auth"
import {
  type GettingStartedState,
  liveProducts,
  markSectionSeen,
  NEW_MERCHANT_PROFILE_ID,
  PRODUCT_IDS,
  resetGettingStarted,
  useGettingStarted,
  visibleSectionIds,
  useGettingStartedHydrated,
} from "@/lib/getting-started"
import { PRODUCTS, UNLOCKED_SECTIONS, productJourneyHref } from "@/components/getting-started/catalog"
import { ActivationIntroduction } from "@/components/getting-started/activation-intro"
import { NewMerchantActivityGate } from "@/components/getting-started/activity-page"
import { setThemeWithTransition } from "@/lib/theme-transition"
import { cn } from "@/lib/utils"
import { useIsOnboardingDemo } from "@/components/getting-started/navigation"

type PlatformPanel = "manage-stores" | "manage-users"

interface TransactionsPlatformShellProps {
  children: ReactNode
}

type ShellNavItem = {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
  trailing?: ReactNode
}

function NavTag({ tone, children }: { tone: "new" | "live" | "progress"; children?: ReactNode }) {
  if (tone === "new") {
    return <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-px text-[10px] font-semibold text-primary">New</span>
  }
  return (
    <span className="ml-auto flex items-center gap-1 text-[11px] text-sidebar-foreground/60">
      <span className={cn("h-1.5 w-1.5 rounded-full", tone === "live" ? "bg-success" : "bg-warning")} />
      {children}
    </span>
  )
}

/**
 * A merchant who has just signed up gets a short menu: Overview and the three
 * products. Payments, Settlement and the rest join once something is live,
 * tagged New until opened, so the menu grows with what they actually use.
 */
function newMerchantNavGroups(state: GettingStartedState): Array<{ label?: string; items: ShellNavItem[] }> {
  const live = liveProducts(state).length > 0
  const unlocked: ShellNavItem[] = live
    ? UNLOCKED_SECTIONS.filter((section) => visibleSectionIds(state).includes(section.id)).map((section) => ({
        label: section.label,
        href: section.href,
        icon: section.icon,
        trailing: state.seenSections.includes(section.id) ? undefined : <NavTag tone="new" />,
      }))
    : []
  const products: ShellNavItem[] = PRODUCT_IDS.map((id) => {
    const { stage, step } = state.journeys[id]
    return {
      label: PRODUCTS[id].shortName,
      href: productJourneyHref(id, stage, step),
      icon: PRODUCTS[id].icon,
      trailing:
        stage === "live" ? <NavTag tone="live">Live</NavTag> : stage === "intro" ? undefined : <NavTag tone="progress">Setting up</NavTag>,
    }
  })
  return [
    { items: [{ label: "Overview", href: "/", icon: HouseIcon }, ...unlocked] },
    { label: "Products", items: products },
  ]
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

function getInitials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function BusinessProfileSwitcherDialog({
  open,
  onOpenChange,
  activeProfileId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeProfileId: string
}) {
  const inDemo = useIsOnboardingDemo()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Switch business</DialogTitle>
          <DialogDescription>
            Preview how the platform looks for different business stages and roles.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {BUSINESS_PROFILES.filter((profile) => inDemo || profile.id !== NEW_MERCHANT_PROFILE_ID).map((profile) => {
            const active = profile.id === activeProfileId
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => {
                  writeActiveBusinessProfile(profile.id)
                  onOpenChange(false)
                }}
                className={cn(
                  "flex w-full items-start justify-between gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors",
                  active ? "border-primary/60 bg-primary/5" : "border-border/70 hover:bg-muted/60"
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{profile.businessName}</p>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {profile.roleLabel}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">{profile.stage}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{profile.description}</p>
                </div>
                {active ? <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : null}
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AccountMenu({ onLogout }: { onLogout: () => void }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [profileName, setProfileName] = useState("Rahul Sharma")
  const [menuOpen, setMenuOpen] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const activeProfile = useActiveBusinessProfile()
  const inDemo = useIsOnboardingDemo()

  useEffect(() => {
    setMounted(true)
    const session = readDummyAuthSession()
    if (!session) return
    setProfileName(session.name)
  }, [])

  const isDark = mounted ? theme !== "light" : true
  const initials = getInitials(profileName)

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
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
              <p className="truncate text-xs leading-tight text-sidebar-foreground/70">{activeProfile.roleLabel}</p>
            </div>
            <CaretUpDownIcon className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-72 p-2">
          <p className="px-2 pb-1.5 pt-1 text-xs font-medium text-muted-foreground">Business</p>
          <div className="flex items-center gap-2.5 rounded-md border border-border/70 bg-muted/40 px-2.5 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
              {getInitials(activeProfile.businessName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{activeProfile.businessName}</p>
              <p className="truncate text-xs text-muted-foreground">{activeProfile.stage}</p>
            </div>
          </div>
          {!inDemo ? <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={() => {
              setMenuOpen(false)
              setSwitcherOpen(true)
            }}
          >
            Switch business
          </Button> : null}

          <DropdownMenuSeparator className="my-2" />

          <div className="flex items-center justify-between rounded-md px-2 py-1.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{profileName}</p>
              <p className="truncate text-xs text-muted-foreground">{activeProfile.roleLabel}</p>
            </div>
          </div>

          <DropdownMenuItem onSelect={() => setThemeWithTransition(setTheme, isDark ? "light" : "dark")}>
            {isDark ? <SunIcon className="mr-2 h-3.5 w-3.5" /> : <MoonIcon className="mr-2 h-3.5 w-3.5" />}
            Dark mode
          </DropdownMenuItem>

          {activeProfile.id === NEW_MERCHANT_PROFILE_ID ? (
            <DropdownMenuItem onSelect={() => resetGettingStarted()}>
              <ArrowCounterClockwiseIcon className="mr-2 h-3.5 w-3.5" />
              Restart onboarding (demo)
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuSeparator className="my-2" />

          <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={onLogout}>
            <SignOutIcon className="mr-2 h-3.5 w-3.5" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BusinessProfileSwitcherDialog
        open={switcherOpen}
        onOpenChange={setSwitcherOpen}
        activeProfileId={activeProfile.id}
      />
    </>
  )
}

function SidebarNav({
  activePanel,
  onOpenPanel,
  onLogout,
}: {
  activePanel: PlatformPanel | null
  onOpenPanel: (panel: PlatformPanel | null) => void
  onLogout: () => void
}) {
  const pathname = usePathname()
  const profile = useActiveBusinessProfile()
  const gettingStarted = useGettingStarted()
  const isNewMerchant = profile.id === NEW_MERCHANT_PROFILE_ID
  const groups = isNewMerchant ? newMerchantNavGroups(gettingStarted) : navGroups

  // Opening an unlocked section clears its New tag.
  useEffect(() => {
    if (!isNewMerchant) return
    const section = UNLOCKED_SECTIONS.find((item) => visibleSectionIds(gettingStarted).includes(item.id) && (pathname === item.href || pathname.startsWith(`${item.href}/`)))
    if (section && liveProducts(gettingStarted).length > 0 && !gettingStarted.seenSections.includes(section.id)) {
      markSectionSeen(section.id)
    }
  }, [isNewMerchant, pathname, gettingStarted])

  const isHrefActive = (href: string) => {
    if (activePanel) return false
    const baseHref = href.split("?")[0] ?? href
    if (baseHref === "/") return pathname === "/"
    return pathname === baseHref || pathname.startsWith(`${baseHref}/`)
  }

  const togglePanel = (panel: PlatformPanel) => onOpenPanel(activePanel === panel ? null : panel)
  const closePanel = () => onOpenPanel(null)

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-sidebar">
      <div className="flex h-16 shrink-0 items-center bg-sidebar px-2">
        <LogoMark className="h-12 w-auto pr-4 text-foreground" />
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto bg-sidebar px-2 py-2">
        {groups.map((group, groupIndex) => (
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
                    onClick={closePanel}
                    className={cn(
                      "flex h-8 items-center gap-2 rounded-md px-2 text-sm leading-none transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.trailing}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {!isNewMerchant ? <div className="mt-6">
          <p className="mb-1 px-2 text-xs font-medium text-muted-foreground/90">Other</p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => togglePanel("manage-stores")}
              className={cn(
                "flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm leading-none transition-colors",
                activePanel === "manage-stores"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <StorefrontIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Manage store</span>
            </button>

            <button
              type="button"
              onClick={() => togglePanel("manage-users")}
              className={cn(
                "flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm leading-none transition-colors",
                activePanel === "manage-users"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <UsersIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Manage users and roles</span>
            </button>

            <Link
              href="/support"
              onClick={closePanel}
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

            <Link
              href="/account-settings"
              onClick={closePanel}
              className={cn(
                "flex h-8 items-center gap-2 rounded-md px-2 text-sm leading-none transition-colors",
                isHrefActive("/account-settings")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <GearIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Account settings</span>
            </Link>
          </div>
        </div> : null}
      </nav>

      <div className="shrink-0 space-y-1 bg-sidebar px-2 py-2">
        <AccountMenu onLogout={onLogout} />
      </div>
    </aside>
  )
}

function PlatformPanelContent({ panel }: { panel: PlatformPanel }) {
  switch (panel) {
    case "manage-stores":
      return <ManageStoresSection />
    case "manage-users":
      return <ManageUsersSection />
    default:
      return null
  }
}

export function TransactionsPlatformShell({ children }: TransactionsPlatformShellProps) {
  const router = useRouter()
  const [activePanel, setActivePanel] = useState<PlatformPanel | null>(null)
  const hydrated = useGettingStartedHydrated()
  const profile = useActiveBusinessProfile()
  const inDemo = useIsOnboardingDemo()
  const [demoAuthenticated, setDemoAuthenticated] = useState(false)

  useEffect(() => {
    if (!inDemo) return
    const authenticated = Boolean(readDummyAuthSession())
    setDemoAuthenticated(authenticated)
    if (!authenticated) router.replace("/signup/phone")
  }, [inDemo, router])

  function logout() {
    clearDummyAuthSession()
    router.replace("/login")
  }

  if (!hydrated || (inDemo && !demoAuthenticated)) return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground" role="status">Loading your workspace…</div>

  return (
    <NavVisibilityProvider>
      <div
        className="min-h-screen bg-[var(--app-shell-surface)] text-foreground"
        style={{ "--dashboard-top-offset": "0px" } as CSSProperties}
      >
        <div className="flex min-h-screen w-full">
          <SidebarNav activePanel={activePanel} onOpenPanel={setActivePanel} onLogout={logout} />

          <div className="min-w-0 flex-1 bg-[var(--app-shell-surface)] p-2 pl-0">
            <div className="flex h-[calc(100vh-16px)] flex-col overflow-hidden rounded-md bg-background">
              <div className="relative min-w-0 flex-1 overflow-hidden bg-background">
                <ScrollArea className="h-full">
                  {activePanel && profile.id !== NEW_MERCHANT_PROFILE_ID ? (
                    <PlatformPanelContent panel={activePanel} />
                  ) : (
                    <main className="min-h-full"><NewMerchantActivityGate>{children}</NewMerchantActivityGate></main>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
        {profile.id === NEW_MERCHANT_PROFILE_ID ? <ActivationIntroduction /> : null}
      </div>
    </NavVisibilityProvider>
  )
}
