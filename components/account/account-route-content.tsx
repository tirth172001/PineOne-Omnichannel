"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { AccountPageContent } from "@/components/account/account-page-content"
import {
  AccountHeaderActionsProvider,
  useAccountHeaderActions,
} from "@/components/account/account-header-actions-context"
import { clearDummyAuthSession, readDummyAuthSession } from "@/lib/dummy-auth"
import { LogOut } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type AccountTab = "profile" | "business-details" | "users" | "preferences" | "security" | "feedback"

const ACCOUNT_TABS: Array<{ value: AccountTab; label: string; href: string }> = [
  { value: "profile", label: "Profile", href: "/account/profile" },
  { value: "business-details", label: "Business details", href: "/account/business-details" },
  { value: "users", label: "Users", href: "/account/users" },
  { value: "preferences", label: "Preferences", href: "/account/preferences" },
  { value: "security", label: "Security", href: "/account/security" },
  { value: "feedback", label: "Feedback", href: "/account/feedback" },
]

type AccountRouteContentProps = {
  tab: AccountTab
}

function AccountRouteContentInner({ tab }: AccountRouteContentProps) {
  const router = useRouter()
  const [sessionName, setSessionName] = useState("Rahul Sharma")
  const [sessionEmail, setSessionEmail] = useState("rahul.sharma@pinelabs-demo.in")
  const activeTab = ACCOUNT_TABS.find((item) => item.value === tab)
  const headerActions = useAccountHeaderActions()
  const sessionInitials = useMemo(() => {
    return sessionName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
  }, [sessionName])

  useEffect(() => {
    const session = readDummyAuthSession()
    if (!session) return
    setSessionName(session.name)
    setSessionEmail(session.email)
  }, [])

  if (tab === "profile") {
    return (
      <div className="pb-8">
        <section>
          <div className="px-8 pt-8 pb-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h1 className="text-[30px] font-semibold leading-none text-foreground">Profile</h1>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-card/80 px-2.5 py-1.5">
                  <Avatar className="size-7">
                    <AvatarImage src="/placeholder-user.jpg" alt={`${sessionName} profile photo`} />
                    <AvatarFallback className="text-xs font-semibold">{sessionInitials || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-foreground">{sessionName}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{sessionEmail}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2 text-xs"
                  onClick={() => {
                    clearDummyAuthSession()
                    router.replace("/login")
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </Button>
                {headerActions?.actions}
              </div>
            </div>
          </div>
          <Separator />
        </section>

        <div className="px-8 pt-8">
          <AccountPageContent page={tab} embedded />
        </div>
      </div>
    )
  }

  return (
    <div className="pb-8">
      <div className="space-y-6 px-8 py-6 lg:py-8">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-[30px] font-semibold leading-8 tracking-[-0.4px] text-foreground">
              Account
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage profile, business, users, preferences, security, and feedback.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-card/80 px-2.5 py-1.5">
              <Avatar className="size-7">
                <AvatarImage src="/placeholder-user.jpg" alt={`${sessionName} profile photo`} />
                <AvatarFallback className="text-xs font-semibold">{sessionInitials || "U"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">{sessionName}</p>
                <p className="truncate text-[11px] text-muted-foreground">{sessionEmail}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 text-xs"
              onClick={() => {
                clearDummyAuthSession()
                router.replace("/login")
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </Button>
            {headerActions?.actions}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-border/60 pb-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="overflow-x-auto">
            <div className="flex h-8 items-center gap-1 rounded-md bg-muted p-1 w-fit">
              {ACCOUNT_TABS.map((item) => {
                const isActive = item.value === tab
                return (
                  <Button
                    key={item.value}
                    variant="ghost"
                    className={cn(
                      "h-6 rounded-sm px-2 text-sm font-medium whitespace-nowrap",
                      isActive
                        ? "bg-secondary text-foreground shadow-sm hover:bg-secondary"
                        : "text-muted-foreground hover:bg-transparent hover:text-muted-foreground"
                    )}
                    onClick={() => router.push(item.href)}
                  >
                    {item.label}
                  </Button>
                )
              })}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Current section: <span className="font-medium text-foreground">{activeTab?.label ?? "Profile"}</span>
          </p>
        </div>
      </div>

      <div className="px-8">
        <AccountPageContent page={tab} embedded />
      </div>
    </div>
  )
}

export function AccountRouteContent({ tab }: AccountRouteContentProps) {
  return (
    <AccountHeaderActionsProvider>
      <AccountRouteContentInner tab={tab} />
    </AccountHeaderActionsProvider>
  )
}
