"use client"

import { InfoIcon, LockIcon } from "@phosphor-icons/react"
import {
  SettlementsOverviewCard,
  TransactionsOverviewCard,
  TRANSACTIONS_PERMISSIONS,
  SETTLEMENTS_PERMISSIONS,
  type ChannelFilter,
  type SettlementScenario,
} from "@/components/home/overview-detail-cards"
import {
  businessProfileAccessScope,
  businessProfileHasAnyPermission,
  businessProfileStores,
  getBusinessProfile,
} from "@/lib/business-profiles"

type ScenarioConfig = {
  id: string
  title: string
  description: string
  profileId: string
  settlementScenario?: SettlementScenario
  emptyTransactions?: boolean
}

const SCENARIOS: ScenarioConfig[] = [
  {
    id: "single-store-manager",
    title: "In-store manager · single store",
    description:
      "Runs one physical store. No channel filter (nothing to switch between) and no store filter (nothing to pick from) — the cards just show that one store's numbers.",
    profileId: "single-store",
  },
  {
    id: "multi-store-manager",
    title: "In-store manager · multiple stores",
    description:
      "Runs a small cluster of stores, no online storefront. Gets a store filter (so they can drill into one store) but still no channel filter, since there's only one channel.",
    profileId: "multi-store-manager",
  },
  {
    id: "omnichannel-admin",
    title: "Admin · multiple stores + online",
    description:
      "Full visibility across every store and the online storefront — gets both the channel filter and the store filter, plus the Pine Labs / Partner Bank settlement source toggle.",
    profileId: "omnichannel-admin",
  },
  {
    id: "online-only",
    title: "Online-only owner",
    description:
      "No physical stores at all. Both the channel and store filters disappear entirely, and Settlements only ever shows the Pine Labs nodal account — there's no partner-bank/in-store source to switch to.",
    profileId: "online-startup",
  },
  {
    id: "restricted-support",
    title: "Support agent · restricted permissions",
    description:
      "Handles refunds and gateway config only. Neither Transactions nor Settlements permission is granted, so both cards are replaced by a single explanatory lock state instead of quietly showing nothing.",
    profileId: "online-support",
  },
  {
    id: "holiday-no-settlement",
    title: "Bank holiday — settlement didn't run",
    description:
      "The settlement cycle simply didn't execute today. Rather than showing a misleading ₹0, the card states the reason plainly and points to the next settlement.",
    profileId: "omnichannel-admin",
    settlementScenario: "holiday",
  },
  {
    id: "multi-bank-settlement",
    title: "Settlement landed in multiple banks",
    description:
      "Today's payout split across three different bank accounts. The single \"Settled to\" row becomes a per-bank breakdown instead of picking just one.",
    profileId: "omnichannel-admin",
    settlementScenario: "multi-bank",
  },
  {
    id: "empty-transactions",
    title: "Empty state — no transactions yet",
    description:
      "A quiet morning (or a brand-new business) with zero transactions so far today. The amount/list are replaced with a plain empty-state message instead of a blank ₹0 card.",
    profileId: "omnichannel-admin",
    emptyTransactions: true,
  },
]

const DEFAULT_CHANNEL: ChannelFilter = "all"
const DEFAULT_STORE_IDS: string[] = []

function ScenarioCard({ scenario }: { scenario: ScenarioConfig }) {
  const profile = getBusinessProfile(scenario.profileId)
  const stores = businessProfileStores(profile)
  const isMultiStore = stores.length > 1
  const showChannelFilter = businessProfileAccessScope(profile) === "In-store and Online"
  const canViewTransactions = businessProfileHasAnyPermission(profile, TRANSACTIONS_PERMISSIONS)
  const canViewSettlements = businessProfileHasAnyPermission(profile, SETTLEMENTS_PERMISSIONS)
  const hasAnyCard = canViewTransactions || canViewSettlements

  return (
    <section className="space-y-3 rounded-[10px] border border-border/70 bg-card/40 p-5">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-foreground">{scenario.title}</h2>
          <span className="inline-flex h-5 items-center rounded-full border border-border/60 bg-muted px-2 text-[11px] font-medium text-muted-foreground">
            {profile.roleLabel}
          </span>
          <span className="inline-flex h-5 items-center rounded-full border border-border/60 bg-muted px-2 text-[11px] font-medium text-muted-foreground">
            {businessProfileAccessScope(profile)}
          </span>
          {stores.length > 0 ? (
            <span className="inline-flex h-5 items-center rounded-full border border-border/60 bg-muted px-2 text-[11px] font-medium text-muted-foreground">
              {stores.length} store{stores.length === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
        <p className="max-w-[820px] text-xs text-muted-foreground">{scenario.description}</p>
      </div>

      {hasAnyCard ? (
        <div className="flex flex-col gap-4">
          {canViewTransactions ? (
            <TransactionsOverviewCard
              stores={stores}
              isMultiStore={isMultiStore}
              channel={DEFAULT_CHANNEL}
              showChannelFilter={showChannelFilter}
              storeIds={DEFAULT_STORE_IDS}
              overrideTransactions={scenario.emptyTransactions ? [] : undefined}
            />
          ) : null}
          {canViewSettlements ? (
            <SettlementsOverviewCard
              stores={stores}
              isMultiStore={isMultiStore}
              channel={DEFAULT_CHANNEL}
              showChannelFilter={showChannelFilter}
              storeIds={DEFAULT_STORE_IDS}
              profile={profile}
              scenario={scenario.settlementScenario}
            />
          ) : null}
        </div>
      ) : (
        <article className="flex items-center gap-3 rounded-[8px] border border-dashed border-border/70 bg-background px-4 py-6 text-sm text-muted-foreground">
          <LockIcon className="h-4 w-4 shrink-0" />
          This role ({profile.roleLabel}) doesn't have permission to view payment data here.
        </article>
      )}
    </section>
  )
}

export default function OverviewScenariosPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-[1200px] space-y-8">
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Overview — role &amp; data-state scenarios</h1>
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
            Internal reference page — every business-profile shape and settlement/transaction edge case the
            homepage overview needs to handle, rendered side by side with the exact same cards used on{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">/</code>. Not linked from the main nav.
          </p>
        </div>

        <div className="space-y-6">
          {SCENARIOS.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      </div>
    </div>
  )
}
