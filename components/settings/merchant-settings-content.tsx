"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Copy, KeyRound, Palette, RadioTower, Settings2, ShieldCheck, Webhook } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type MerchantSettingModule = "credentials" | "webhooks" | "checkout-styling" | "paymodes"

const moduleItems: Array<{
  key: MerchantSettingModule
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}> = [
  {
    key: "credentials",
    label: "Credentials",
    icon: KeyRound,
    description: "API keys and client credentials used by merchant integrations.",
  },
  {
    key: "webhooks",
    label: "Webhooks",
    icon: Webhook,
    description: "Configure event callbacks and delivery verification.",
  },
  {
    key: "checkout-styling",
    label: "Checkout styling",
    icon: Palette,
    description: "Set brand controls for hosted payment journeys.",
  },
  {
    key: "paymodes",
    label: "Paymodes",
    icon: RadioTower,
    description: "Enable, disable, and prioritize supported payment methods.",
  },
]

function isModuleKey(value: string | null): value is MerchantSettingModule {
  return Boolean(value && moduleItems.some((item) => item.key === value))
}

function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border/70 bg-card/80 p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  )
}

function MetricBlock({ label, value, subtitle }: { label: string; value: string; subtitle: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold leading-none text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
    </div>
  )
}

export function MerchantSettingsContent() {
  const searchParams = useSearchParams()
  const requestedModule = searchParams.get("module")
  const initialModule: MerchantSettingModule = isModuleKey(requestedModule)
    ? requestedModule
    : "credentials"

  const [activeModule, setActiveModule] = useState<MerchantSettingModule>(initialModule)
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
    if (isModuleKey(moduleFromQuery)) {
      setActiveModule(moduleFromQuery)
    }
  }, [searchParams])

  const activeModuleMeta = useMemo(
    () => moduleItems.find((item) => item.key === activeModule) ?? moduleItems[0],
    [activeModule]
  )

  const enabledPaymodes = useMemo(
    () => Object.values(paymodes).filter(Boolean).length,
    [paymodes]
  )

  const enabledWebhookEvents = useMemo(
    () => Object.values(webhookEvents).filter(Boolean).length,
    [webhookEvents]
  )

  const moduleTab = (
    <div className="flex h-8 items-center gap-1 rounded-md bg-muted p-1">
      {moduleItems.map((item) => {
        const Icon = item.icon
        const isActive = item.key === activeModule

        return (
          <Button
            key={item.key}
            variant="ghost"
            className={cn(
              "h-6 gap-1.5 rounded-sm px-2 text-sm font-medium whitespace-nowrap",
              isActive
                ? "bg-secondary text-foreground shadow-sm hover:bg-secondary"
                : "text-muted-foreground hover:bg-transparent hover:text-muted-foreground"
            )}
            onClick={() => setActiveModule(item.key)}
          >
            <Icon className="h-3.5 w-3.5" />
            {item.label}
          </Button>
        )
      })}
    </div>
  )

  return (
    <div className="pb-8">
      <div className="space-y-6 px-8 py-6 lg:py-8">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <h1 className="text-[30px] font-semibold leading-8 tracking-[-0.4px] text-foreground">Settings</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="h-8 gap-1.5 rounded-md px-2.5 text-xs">
              <Settings2 className="h-3.5 w-3.5" />
              Merchant controls
            </Badge>
            <Button asChild variant="outline" size="sm" className="h-8 text-xs">
              <Link href="/account/preferences">Account preferences</Link>
            </Button>
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              Save changes
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-border/60 pb-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="overflow-x-auto">{moduleTab}</div>
          <p className="text-sm text-muted-foreground">
            Current module: <span className="font-medium text-foreground">{activeModuleMeta.label}</span>
          </p>
        </div>
      </div>

      <div className="px-8">
        <section className="grid grid-cols-1 gap-8 border-y border-border/60 py-6 sm:grid-cols-2 xl:grid-cols-4">
          <MetricBlock label="Modules" value="4" subtitle="Core configuration areas" />
          <MetricBlock
            label="Enabled paymodes"
            value={String(enabledPaymodes)}
            subtitle="Across checkout channels"
          />
          <MetricBlock
            label="Webhook events"
            value={String(enabledWebhookEvents)}
            subtitle="Events currently subscribed"
          />
          <MetricBlock label="Last synced" value="Today" subtitle="Configuration snapshot updated" />
        </section>
      </div>

      <div className="space-y-4 px-8 py-6 lg:py-8">
        <SectionCard title={activeModuleMeta.label} description={activeModuleMeta.description}>
          {activeModule === "credentials" ? (
            <div className="space-y-4">
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground">Publishable key</p>
                  <p className="mt-1.5 font-mono text-sm text-foreground">pk_live_************************</p>
                  <Button variant="ghost" size="sm" className="mt-2 h-8 text-xs">
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground">Secret key</p>
                  <p className="mt-1.5 font-mono text-sm text-foreground">sk_live_************************</p>
                  <Button variant="ghost" size="sm" className="mt-2 h-8 text-xs">
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="h-8 text-xs">Rotate secret key</Button>
                <Button variant="outline" size="sm" className="h-8 text-xs">Create test key</Button>
              </div>
            </div>
          ) : null}

          {activeModule === "webhooks" ? (
            <div className="space-y-4">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground">Endpoint URL</p>
                  <Input
                    value={webhookUrl}
                    onChange={(event) => setWebhookUrl(event.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground">Signing secret</p>
                  <p className="font-mono text-sm text-foreground">whsec_********************************</p>
                  <Button variant="outline" size="sm" className="h-8 text-xs">Rotate secret</Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  { key: "paymentSucceeded", label: "Payment succeeded" },
                  { key: "paymentFailed", label: "Payment failed" },
                  { key: "settlementProcessed", label: "Settlement processed" },
                  { key: "refundProcessed", label: "Refund processed" },
                  { key: "disputeUpdated", label: "Dispute updated" },
                ].map((eventItem) => (
                  <div key={eventItem.key} className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 px-4 py-3">
                    <p className="text-sm text-foreground">{eventItem.label}</p>
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

          {activeModule === "checkout-styling" ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground">Brand color</p>
                  <Input
                    value={checkoutBrandColor}
                    onChange={(event) => setCheckoutBrandColor(event.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground">Logo URL</p>
                  <Input
                    value={checkoutLogoUrl}
                    onChange={(event) => setCheckoutLogoUrl(event.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Preview</p>
                <div className="mt-2 flex items-center justify-between rounded-md border border-border/70 bg-background px-3 py-2.5">
                  <p className="text-sm font-medium text-foreground">Hosted checkout</p>
                  <span className="inline-flex h-5 w-5 rounded-full" style={{ backgroundColor: checkoutBrandColor }} />
                </div>
              </div>
            </div>
          ) : null}

          {activeModule === "paymodes" ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  { key: "upi", label: "UPI" },
                  { key: "cards", label: "Cards" },
                  { key: "netbanking", label: "Netbanking" },
                  { key: "wallets", label: "Wallets" },
                  { key: "payLater", label: "Pay later" },
                  { key: "emi", label: "EMI" },
                ].map((mode) => (
                  <div key={mode.key} className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 px-4 py-3">
                    <p className="text-sm text-foreground">{mode.label}</p>
                    <Switch
                      checked={paymodes[mode.key as keyof typeof paymodes]}
                      onCheckedChange={(checked) =>
                        setPaymodes((current) => ({ ...current, [mode.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Rollout policy</p>
                <p className="mt-1 text-sm text-foreground">
                  Priority order: UPI first, then Cards, then Netbanking. Disabled methods are hidden at checkout.
                </p>
              </div>
            </div>
          ) : null}
        </SectionCard>
      </div>
    </div>
  )
}
