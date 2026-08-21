"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BellIcon,
  BuildingsIcon,
  ChatTextIcon,
  GlobeIcon,
  ListIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  ShieldIcon,
  SignOutIcon,
  SlidersHorizontalIcon,
  SunIcon,
  UserCircleIcon,
  UsersIcon,
} from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Kbd } from "@/components/ui/kbd"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { clearDummyAuthSession, readDummyAuthSession } from "@/lib/dummy-auth"
import { getConfiguredProductNames, getGlobalSearchItems } from "@/lib/global-search"
import { ROUTES } from "@/lib/navigation/routes"
import { setThemeWithTransition } from "@/lib/theme-transition"
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  getLanguageByCode,
  readLanguagePreference,
  writeLanguagePreference,
} from "@/lib/language-settings"

interface V2TopbarProps {
  pathname: string
  onMenuClick?: () => void
  isMobile?: boolean
}

const NOTIFICATION_ITEMS = [
  {
    id: "n1",
    title: "Settlement batch delayed",
    detail: "One batch is delayed by 45 mins",
    href: ROUTES.settlements.root,
  },
  {
    id: "n2",
    title: "High failure spike detected",
    detail: "Online failure rate crossed 2.3%",
    href: ROUTES.onlinePayments.transactions,
  },
  {
    id: "n3",
    title: "New product recommendation",
    detail: "Pay Later can improve conversion on your profile",
    href: ROUTES.products.root,
  },
]

export function V2Topbar({ pathname, onMenuClick, isMobile = false }: V2TopbarProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [profileName, setProfileName] = useState("Rahul Sharma")
  const [profileRole, setProfileRole] = useState("Admin")
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationCount] = useState(3)
  const [query, setQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [shortcutHint, setShortcutHint] = useState("Ctrl K")
  const [languageCode, setLanguageCode] = useState(DEFAULT_LANGUAGE.code)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchWrapRef = useRef<HTMLDivElement>(null)

  const configuredProducts = useMemo(() => getConfiguredProductNames(), [])
  const searchItems = useMemo(
    () =>
      getGlobalSearchItems({
        pathname,
        query,
        profileRole,
        configuredProducts,
        limit: 8,
      }),
    [configuredProducts, pathname, profileRole, query]
  )

  const openGlobalSearch = () => {
    router.push(`${ROUTES.search}?from=${encodeURIComponent(pathname)}`)
  }

  useEffect(() => {
    setMounted(true)
    setShortcutHint(
      typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac")
        ? "\u2318K"
        : "Ctrl K"
    )
    const session = readDummyAuthSession()
    if (session) {
      setProfileName(session.name)
      setProfileRole(session.role)
    }
    setLanguageCode(readLanguagePreference().code)
  }, [])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        if (isMobile) {
          router.push(`${ROUTES.search}?from=${encodeURIComponent(pathname)}`)
          return
        }
        searchInputRef.current?.focus()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isMobile, pathname, router])

  useEffect(() => {
    if (isMobile) return
    function onClickOutside(event: MouseEvent) {
      if (!searchWrapRef.current?.contains(event.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [isMobile])

  const isDark = mounted ? theme !== "light" : true
  const selectedLanguage = getLanguageByCode(languageCode)
  const isAdmin = profileRole.toLowerCase() === "admin"

  return (
    <div className="sticky top-0 z-40 h-14 border-b border-border/60 bg-sidebar px-3">
      <div
        className={cn(
          "grid h-full items-center gap-3",
          isMobile ? "grid-cols-[auto_1fr_auto]" : "grid-cols-[1fr_minmax(0,480px)_1fr]"
        )}
      >
        <div className="flex items-center gap-1.5">
          {isMobile ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-9 w-9 text-foreground hover:bg-primary/10"
              onClick={onMenuClick}
              aria-label="Open navigation menu"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          ) : null}
          <Link
            href={ROUTES.home}
            className="flex items-center rounded-md px-2 py-1.5 transition-colors hover:bg-primary/10"
            aria-label="PineLabs Home"
          >
            <img
              src="/brand/pine-labs-icon.ico"
              alt="Pine Labs"
              className="h-6 w-6 rounded-sm object-contain grayscale brightness-0 contrast-200 dark:invert"
            />
          </Link>
        </div>

        {isMobile ? (
          <div className="flex items-center justify-center">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-9 w-9 text-muted-foreground hover:bg-primary/10 hover:text-foreground"
              aria-label="Open global search"
              title="Search (Ctrl/Cmd + K)"
              onClick={openGlobalSearch}
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div ref={searchWrapRef} className="relative w-full">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search pages, actions, products, and settings..."
              className="h-10 border-transparent bg-background/80 pl-9 pr-14 text-sm text-foreground placeholder:text-muted-foreground shadow-none focus-visible:border-transparent focus-visible:ring-0"
            />
            <Kbd className="absolute right-3 top-1/2 h-auto min-w-0 -translate-y-1/2 rounded-none bg-transparent px-0 py-0 text-[10px] font-medium uppercase text-muted-foreground">
              {shortcutHint}
            </Kbd>

            {searchOpen && (
              <div className="absolute inset-x-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-lg border border-border/70 bg-popover shadow-2xl">
                <div className="flex items-center justify-between border-b border-border/70 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {query.trim() ? "Best Matches" : "Most Probable"}
                  </p>
                  <Badge variant="outline" className="text-[10px]">
                    {searchItems.length} suggestions
                  </Badge>
                </div>
                <div className="max-h-96 overflow-y-auto p-2">
                  {searchItems.length ? (
                    searchItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSearchOpen(false)
                          setQuery("")
                          router.push(item.href)
                        }}
                        className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted/80"
                      >
                        <span
                          className={cn(
                            "mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md text-[10px] font-semibold",
                            item.kind === "action"
                              ? "bg-primary/15 text-primary"
                              : item.kind === "config"
                                ? "bg-warning/15 text-warning"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          {item.kind === "action" ? "A" : item.kind === "config" ? "C" : "P"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{item.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                      No matches found. Try terms like <span className="font-medium">reports</span> or{" "}
                      <span className="font-medium">settings</span>.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-self-end gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size={isMobile ? "icon-sm" : "sm"}
                className={cn(
                  "text-foreground hover:bg-primary/10",
                  isMobile ? "h-9 w-9" : "h-9 gap-2 px-2.5 text-xs"
                )}
                aria-label="Change language"
              >
                <GlobeIcon className="h-4 w-4" />
                {!isMobile ? <span>{selectedLanguage.label}</span> : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Platform language</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={languageCode}
                onValueChange={(value) => {
                  setLanguageCode(value)
                  writeLanguagePreference(value)
                }}
              >
                {SUPPORTED_LANGUAGES.map((language) => (
                  <DropdownMenuRadioItem key={language.code} value={language.code} className="items-start">
                    <div className="flex flex-col">
                      <span>{language.label}</span>
                      <span className="text-xs text-muted-foreground">{language.nativeLabel}</span>
                    </div>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon-sm"
            className="h-9 w-9 text-foreground hover:bg-primary/10"
            onClick={() => setThemeWithTransition(setTheme, isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            className="relative h-9 w-9 text-foreground hover:bg-primary/10"
            aria-label="Notifications"
            onClick={() => setNotificationsOpen(true)}
          >
            <BellIcon className="h-4 w-4" />
            {notificationCount > 0 ? (
              <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {notificationCount}
              </span>
            ) : null}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-9 w-9 text-foreground hover:bg-primary/10"
              >
                <UserCircleIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">{profileName}</p>
                <p className="text-[11px] text-muted-foreground">{profileRole}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push(`${ROUTES.settings.root}?module=profile&panel=profile`)}>
                <UserCircleIcon className="mr-2 h-3.5 w-3.5" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push(`${ROUTES.settings.root}?module=business-details&panel=business-details`)}>
                <BuildingsIcon className="mr-2 h-3.5 w-3.5" />
                Business details
              </DropdownMenuItem>
              {isAdmin ? (
                <DropdownMenuItem onSelect={() => router.push(`${ROUTES.settings.root}?module=users&panel=users`)}>
                  <UsersIcon className="mr-2 h-3.5 w-3.5" />
                  Users management
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onSelect={() => router.push(`${ROUTES.settings.root}?module=preferences&panel=preferences`)}>
                <SlidersHorizontalIcon className="mr-2 h-3.5 w-3.5" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push(`${ROUTES.settings.root}?module=security&panel=security`)}>
                <ShieldIcon className="mr-2 h-3.5 w-3.5" />
                Security
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push(`${ROUTES.settings.root}?module=feedback&panel=feedback`)}>
                <ChatTextIcon className="mr-2 h-3.5 w-3.5" />
                Feedback
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  clearDummyAuthSession()
                  router.replace("/login")
                }}
              >
                <SignOutIcon className="mr-2 h-3.5 w-3.5" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <SheetContent
          side="right"
          a11yTitle="Notifications"
          a11yDescription="Recent updates and system alerts."
          className="w-full p-0 sm:max-w-[390px]"
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-border/60 bg-muted/25 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground">Recent updates and system alerts</p>
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto p-3">
              {NOTIFICATION_ITEMS.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => {
                    setNotificationsOpen(false)
                    router.push(notification.href)
                  }}
                  className="w-full rounded-md border border-border/60 bg-card px-3 py-2 text-left transition-colors hover:bg-muted/70"
                >
                  <p className="text-sm font-medium text-foreground">{notification.title}</p>
                  <p className="text-xs text-muted-foreground">{notification.detail}</p>
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
