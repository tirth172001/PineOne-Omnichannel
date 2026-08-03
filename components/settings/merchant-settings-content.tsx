"use client"

import { useEffect, useMemo, useState, type ComponentType } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  Copy,
  KeyRound,
  LockKeyhole,
  MessageSquareText,
  Palette,
  RadioTower,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  UserCircle2,
  Users,
  Webhook,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type SettingsModule =
  | "profile"
  | "business-details"
  | "users"
  | "preferences"
  | "security"
  | "feedback"
  | "credentials"
  | "webhooks"
  | "checkout-styling"
  | "paymodes"

type ModuleGroup = "Account" | "Merchant"

type SettingsModuleItem = {
  key: SettingsModule
  label: string
  group: ModuleGroup
  icon: ComponentType<{ className?: string }>
  description: string
  status: string
}

const moduleItems: SettingsModuleItem[] = [
  {
    key: "profile",
    label: "Profile",
    group: "Account",
    icon: UserCircle2,
    description: "Personal details, role, and contact information for the signed-in user.",
    status: "Complete",
  },
  {
    key: "business-details",
    label: "Business details",
    group: "Account",
    icon: Building2,
    description: "Legal entity, category, website, and merchant identity details.",
    status: "Verified",
  },
  {
    key: "users",
    label: "Users management",
    group: "Account",
    icon: Users,
    description: "Invite teammates, assign access, and review approval state.",
    status: "8 users",
  },
  {
    key: "preferences",
    label: "Preferences",
    group: "Account",
    icon: SlidersHorizontal,
    description: "Workspace language, default view, digest cadence, and display settings.",
    status: "Synced",
  },
  {
    key: "security",
    label: "Security",
    group: "Account",
    icon: LockKeyhole,
    description: "Login protection, sessions, device trust, and sensitive-action controls.",
    status: "Strong",
  },
  {
    key: "feedback",
    label: "Feedback",
    group: "Account",
    icon: MessageSquareText,
    description: "Share product feedback and track requests sent to the Pine Labs team.",
    status: "Open",
  },
  {
    key: "credentials",
    label: "Credentials",
    group: "Merchant",
    icon: KeyRound,
    description: "API keys and client credentials used by merchant integrations.",
    status: "Live",
  },
  {
    key: "webhooks",
    label: "Webhooks",
    group: "Merchant",
    icon: Webhook,
    description: "Configure event callbacks, delivery verification, and retry behavior.",
    status: "5 events",
  },
  {
    key: "checkout-styling",
    label: "Checkout styling",
    group: "Merchant",
    icon: Palette,
    description: "Set brand controls for hosted payment journeys.",
    status: "Branded",
  },
  {
    key: "paymodes",
    label: "Paymodes",
    group: "Merchant",
    icon: RadioTower,
    description: "Enable, disable, and prioritize supported payment methods.",
    status: "4 active",
  },
]

const groups: ModuleGroup[] = ["Account", "Merchant"]

const panelNotes: Record<SettingsModule, string[]> = {
  profile: ["Name and role are visible across approvals.", "Contact details are used for operational alerts."],
  "business-details": ["Legal name changes require verification.", "GST and PAN changes are reviewed before activation."],
  users: ["Admin users can approve sensitive changes.", "New invites expire after 7 days."],
  preferences: ["Preferences sync across devices.", "Digest settings affect email and in-app updates."],
  security: ["Two-step verification is recommended for admins.", "Session changes sign out untrusted devices."],
  feedback: ["Feedback is routed to product operations.", "Attach a page or flow name for faster triage."],
  credentials: ["Rotate keys from a controlled maintenance window.", "Test keys stay isolated from live settlements."],
  webhooks: ["Failed deliveries retry for 24 hours.", "Signing secrets verify event authenticity."],
  "checkout-styling": ["Brand color appears on hosted checkout.", "Logo URLs must be publicly accessible."],
  paymodes: ["Disabled methods are hidden at checkout.", "Priority order affects default customer presentation."],
}

function isModuleKey(value: string | null): value is SettingsModule {
  return Boolean(value && moduleItems.some((item) => item.key === value))
}

function getModuleMeta(module: SettingsModule) {
  return moduleItems.find((item) => item.key === module) ?? moduleItems[0]
}

function SettingRow({
  item,
  active,
  onOpen,
}: {
  item: SettingsModuleItem
  active: boolean
  onOpen: () => void
}) {
  const Icon = item.icon

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group flex w-full items-center gap-4 border-b border-border/60 px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-muted/35",
        active && "bg-muted/45"
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{item.label}</span>
          <Badge variant="outline" className="h-5 rounded px-1.5 text-[10px] font-medium">
            {item.status}
          </Badge>
        </span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.description}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  )
}

function OverviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-border/60 px-5 py-4 last:border-r-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold leading-none text-foreground">{value}</p>
    </div>
  )
}

export function MerchantSettingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedModule = searchParams.get("module")
  const requestedPanel = searchParams.get("panel")
  const initialModule: SettingsModule = isModuleKey(requestedModule) ? requestedModule : "profile"

  const [activeModule, setActiveModule] = useState<SettingsModule>(initialModule)
  const [panelModule, setPanelModule] = useState<SettingsModule | null>(
    isModuleKey(requestedPanel) ? requestedPanel : null
  )
  const [webhookUrl, setWebhookUrl] = useState("https://merchant.example.com/pine/webhooks")
  const [checkoutBrandColor, setCheckoutBrandColor] = useState("#1f6f4a")
  const [checkoutLogoUrl, setCheckoutLogoUrl] = useState("https://merchant.example.com/assets/logo.svg")
  const [paymodes, setPaymodes] = useState({
    upi: true,
    cards: true,
    netbanking: true,
    wallets: false,
    payLater: false,
    emi: true,
  })
  const [webhookEvents, setWebhookEvents] = useState({
    paymentSucceeded: true,
    paymentFailed: true,
    settlementProcessed: true,
    refundProcessed: true,
    disputeUpdated: false,
  })

  useEffect(() => {
    const moduleFromQuery = searchParams.get("module")
    const panelFromQuery = searchParams.get("panel")

    if (isModuleKey(moduleFromQuery)) {
      setActiveModule(moduleFromQuery)
    }

    setPanelModule(isModuleKey(panelFromQuery) ? panelFromQuery : null)
  }, [searchParams])

  const activeModuleMeta = useMemo(() => getModuleMeta(activeModule), [activeModule])
  const panelMeta = panelModule ? getModuleMeta(panelModule) : null
  const PanelIcon = panelMeta?.icon

  function openModule(module: SettingsModule) {
    setActiveModule(module)
    setPanelModule(module)
    router.push(`/settings?module=${module}&panel=${module}`)
  }

  function closePanel() {
    setPanelModule(null)
    router.push(`/settings?module=${activeModule}`)
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-background">
      <div className="border-b border-border/60 px-6 py-5 lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Workspace settings</p>
            <h1 className="mt-1 text-[30px] font-semibold leading-8 tracking-[-0.4px] text-foreground">Settings</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage account access, profile controls, and merchant configuration from one workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="h-8 gap-1.5 rounded-md px-2.5 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              Changes saved
            </Badge>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              Save changes
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-border/60 bg-muted/15 p-4 lg:min-h-[calc(100vh-169px)] lg:border-b-0 lg:border-r">
          <div className="space-y-5">
            {groups.map((group) => (
              <div key={group}>
                <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {group}
                </p>
                <div className="space-y-1">
                  {moduleItems
                    .filter((item) => item.group === group)
                    .map((item) => {
                      const Icon = item.icon
                      const active = item.key === activeModule

                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => openModule(item.key)}
                          className={cn(
                            "flex h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-sm transition-colors",
                            active
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="min-w-0 px-6 py-6 lg:px-8">
          <section className="overflow-hidden rounded-lg border border-border/70 bg-card">
            <div className="grid divide-y divide-border/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <OverviewMetric label="Account sections" value="6" />
              <OverviewMetric label="Merchant controls" value="4" />
              <OverviewMetric label="Last update" value="Today" />
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-lg border border-border/70 bg-card">
            <div className="border-b border-border/60 px-5 py-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{activeModuleMeta.group} settings</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select a setting to open the slide-in detail panel.
                  </p>
                </div>
                <Badge variant="outline" className="h-7 w-fit rounded-md px-2 text-xs">
                  Current: {activeModuleMeta.label}
                </Badge>
              </div>
            </div>

            {moduleItems
              .filter((item) => item.group === activeModuleMeta.group)
              .map((item) => (
                <SettingRow
                  key={item.key}
                  item={item}
                  active={item.key === activeModule}
                  onOpen={() => openModule(item.key)}
                />
              ))}
          </section>
        </main>
      </div>

      <Sheet open={Boolean(panelMeta)} onOpenChange={(open) => (open ? null : closePanel())}>
        <SheetContent className="w-full gap-0 p-0 sm:max-w-[520px]">
          {panelMeta ? (
            <>
              <SheetHeader className="border-b border-border/70 p-5">
                {PanelIcon ? (
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <PanelIcon className="h-5 w-5 text-primary" />
                  </div>
                ) : null}
                <SheetTitle className="text-lg">{panelMeta.label}</SheetTitle>
                <SheetDescription>{panelMeta.description}</SheetDescription>
              </SheetHeader>

              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <div className="space-y-4">
                  {panelModule === "profile" ? (
                    <div className="grid gap-3">
                      <label className="space-y-1.5">
                        <span className="text-xs font-medium text-foreground">Full name</span>
                        <Input defaultValue="Rahul Sharma" className="h-9 text-sm" />
                      </label>
                      <label className="space-y-1.5">
                        <span className="text-xs font-medium text-foreground">Email</span>
                        <Input defaultValue="rahul.sharma@merchant.com" className="h-9 text-sm" />
                      </label>
                      <label className="space-y-1.5">
                        <span className="text-xs font-medium text-foreground">Role</span>
                        <Input defaultValue="Admin" className="h-9 text-sm" />
                      </label>
                    </div>
                  ) : null}

                  {panelModule === "business-details" ? (
                    <div className="grid gap-3">
                      <label className="space-y-1.5">
                        <span className="text-xs font-medium text-foreground">Business name</span>
                        <Input defaultValue="Pine Labs Limited Noida Kiosk" className="h-9 text-sm" />
                      </label>
                      <label className="space-y-1.5">
                        <span className="text-xs font-medium text-foreground">Category</span>
                        <Input defaultValue="Electronics and retail" className="h-9 text-sm" />
                      </label>
                      <label className="space-y-1.5">
                        <span className="text-xs font-medium text-foreground">Website</span>
                        <Input defaultValue="https://merchant.example.com" className="h-9 text-sm" />
                      </label>
                    </div>
                  ) : null}

                  {panelModule === "users" ? (
                    <div className="space-y-3">
                      {["Rahul Sharma · Admin", "Neha Mehta · Operations", "Arjun Rao · Finance"].map((user) => (
                        <div key={user} className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
                          <span className="text-sm text-foreground">{user}</span>
                          <Badge variant="outline" className="h-5 text-[10px]">Active</Badge>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="h-8 text-xs">Invite user</Button>
                    </div>
                  ) : null}

                  {panelModule === "preferences" ? (
                    <div className="space-y-3">
                      {["Email digest", "Compact tables", "Show product tips"].map((preference, index) => (
                        <div key={preference} className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
                          <span className="text-sm text-foreground">{preference}</span>
                          <Switch defaultChecked={index !== 2} />
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {panelModule === "security" ? (
                    <div className="space-y-3">
                      {["Two-step verification", "Trusted devices", "Approval for sensitive actions"].map((control) => (
                        <div key={control} className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
                          <span className="text-sm text-foreground">{control}</span>
                          <Switch defaultChecked />
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {panelModule === "feedback" ? (
                    <div className="space-y-3">
                      <label className="space-y-1.5">
                        <span className="text-xs font-medium text-foreground">Feedback topic</span>
                        <Input defaultValue="Settings experience" className="h-9 text-sm" />
                      </label>
                      <label className="space-y-1.5">
                        <span className="text-xs font-medium text-foreground">Message</span>
                        <Input defaultValue="Share what should be improved next" className="h-9 text-sm" />
                      </label>
                    </div>
                  ) : null}

                  {panelModule === "credentials" ? (
                    <div className="space-y-3">
                      {["pk_live_************************", "sk_live_************************"].map((keyValue) => (
                        <div key={keyValue} className="rounded-lg border border-border/70 bg-muted/20 p-3">
                          <p className="font-mono text-sm text-foreground">{keyValue}</p>
                          <Button variant="ghost" size="sm" className="mt-2 h-8 text-xs">
                            <Copy className="h-3.5 w-3.5" />
                            Copy
                          </Button>
                        </div>
                      ))}
                      <Button size="sm" className="h-8 text-xs">Rotate secret key</Button>
                    </div>
                  ) : null}

                  {panelModule === "webhooks" ? (
                    <div className="space-y-4">
                      <label className="space-y-1.5">
                        <span className="text-xs font-medium text-foreground">Endpoint URL</span>
                        <Input value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} className="h-9 text-sm" />
                      </label>
                      <div className="grid gap-2">
                        {[
                          { key: "paymentSucceeded", label: "Payment succeeded" },
                          { key: "paymentFailed", label: "Payment failed" },
                          { key: "settlementProcessed", label: "Settlement processed" },
                          { key: "refundProcessed", label: "Refund processed" },
                          { key: "disputeUpdated", label: "Dispute updated" },
                        ].map((eventItem) => (
                          <div key={eventItem.key} className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
                            <span className="text-sm text-foreground">{eventItem.label}</span>
                            <Switch
                              checked={webhookEvents[eventItem.key as keyof typeof webhookEvents]}
                              onCheckedChange={(checked) =>
                                setWebhookEvents((current) => ({ ...current, [eventItem.key]: checked }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {panelModule === "checkout-styling" ? (
                    <div className="space-y-3">
                      <label className="space-y-1.5">
                        <span className="text-xs font-medium text-foreground">Brand color</span>
                        <Input value={checkoutBrandColor} onChange={(event) => setCheckoutBrandColor(event.target.value)} className="h-9 text-sm" />
                      </label>
                      <label className="space-y-1.5">
                        <span className="text-xs font-medium text-foreground">Logo URL</span>
                        <Input value={checkoutLogoUrl} onChange={(event) => setCheckoutLogoUrl(event.target.value)} className="h-9 text-sm" />
                      </label>
                      <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
                        <span className="text-sm font-medium text-foreground">Checkout preview</span>
                        <span className="h-5 w-5 rounded-full" style={{ backgroundColor: checkoutBrandColor }} />
                      </div>
                    </div>
                  ) : null}

                  {panelModule === "paymodes" ? (
                    <div className="space-y-3">
                      {[
                        { key: "upi", label: "UPI" },
                        { key: "cards", label: "Cards" },
                        { key: "netbanking", label: "Netbanking" },
                        { key: "wallets", label: "Wallets" },
                        { key: "payLater", label: "Pay later" },
                        { key: "emi", label: "EMI" },
                      ].map((mode) => (
                        <div key={mode.key} className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
                          <span className="text-sm text-foreground">{mode.label}</span>
                          <Switch
                            checked={paymodes[mode.key as keyof typeof paymodes]}
                            onCheckedChange={(checked) =>
                              setPaymodes((current) => ({ ...current, [mode.key]: checked }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="rounded-lg border border-primary/15 bg-primary/5 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium text-foreground">Operational notes</p>
                    </div>
                    <ul className="space-y-1">
                      {panelNotes[panelModule ?? "profile"].map((note) => (
                        <li key={note} className="text-xs leading-5 text-muted-foreground">
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <SheetFooter className="border-t border-border/70 p-5">
                <div className="flex w-full gap-2">
                  <Button variant="outline" className="h-9 flex-1 text-sm" onClick={closePanel}>
                    Cancel
                  </Button>
                  <Button className="h-9 flex-1 text-sm" onClick={closePanel}>
                    Apply changes
                  </Button>
                </div>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
