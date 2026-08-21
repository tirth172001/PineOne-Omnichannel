import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { ZIndexTier } from "./foundation-primitives"

const meta = {
  title: "Foundations/Z-Index",
  tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Scale: Story = {
  render: () => (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Stacking layers actually in use
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">
          There is no named z-index scale — every value below is a raw Tailwind utility (<code>z-0</code>…
          <code>z-50</code>) or an arbitrary value (<code>z-[n]</code>), grouped here by the role it plays. No
          consolidation has happened yet; this documents reality, not a target.
        </p>
        <div>
          <ZIndexTier
            value="z-0 / z-1"
            description="Decorative or purely-local stacking with no overlay intent (e.g. calendar background dots, a nav-menu indicator arrow)."
            usages={["components/ui/calendar.tsx", "components/ui/navigation-menu.tsx"]}
          />
          <ZIndexTier
            value="z-10"
            description="Local elevation within a component — sticky table headers/columns, focus rings, carets, avatar fallbacks, drag handles. By far the largest tier; nothing here is meant to escape its own container."
            usages={[
              "components/ui/button-group.tsx",
              "components/ui/input-otp.tsx",
              "components/ui/calendar.tsx",
              "components/ui/avatar.tsx",
              "components/ui/resizable.tsx",
              "components/ui/sidebar.tsx",
              "components/ui/toggle-group.tsx",
              "components/ui/select.tsx",
              "components/home/transaction-state-branch-flow.tsx",
              "components/dashboard/v2-sidebar.tsx",
              "components/transactions/transaction-detail-content.tsx",
              "components/on-hold-disputes/on-hold-detail-content.tsx",
              "components/on-hold-disputes/dispute-detail-content.tsx",
              "components/settlements/v3-settlements-content.tsx",
              "components/transactions/transactions-platform-shell.tsx",
            ]}
          />
          <ZIndexTier
            value="z-20"
            description="Nested local elevation — one step above z-10 siblings within the same component (sidebar sub-elements, carousel/rail nav arrows)."
            usages={["components/ui/sidebar.tsx", "components/dashboard/v2-product-rail.tsx"]}
          />
          <ZIndexTier
            value="z-40"
            description="Page-level chrome — sticky headers and backdrops that sit above page content but below any overlay."
            usages={[
              "components/shared/activity-timeline-sidepanel.tsx",
              "components/dashboard/v2-topbar.tsx",
              "components/dashboard/v2-dashboard-layout.tsx",
              "components/dashboard/workspace-shell.tsx",
              "components/onboarding/account-onboarding-flow.tsx",
            ]}
          />
          <ZIndexTier
            value="z-50"
            description="Global overlays — Radix UI's own default overlay layer, inherited as-is by every shadcn primitive: dialogs, sheets, drawers, popovers, tooltips, menus, dropdowns, the mobile bottom nav. This is the largest deliberate tier and the one new overlay components should match by default."
            usages={[
              "components/ui/dialog.tsx",
              "components/ui/alert-dialog.tsx",
              "components/ui/sheet.tsx",
              "components/ui/drawer.tsx",
              "components/ui/popover.tsx",
              "components/ui/hover-card.tsx",
              "components/ui/tooltip.tsx",
              "components/ui/menubar.tsx",
              "components/ui/context-menu.tsx",
              "components/ui/dropdown-menu.tsx",
              "components/ui/select.tsx",
              "components/ui/navigation-menu.tsx",
              "components/shared/activity-timeline-sidepanel.tsx",
              "components/dashboard/bottom-nav.tsx",
              "components/dashboard/v2-topbar.tsx",
              "components/dashboard/floating-demo-fab.tsx",
            ]}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Arbitrary values above the overlay tier
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Three one-off arbitrary values sit above <code>z-50</code>, each undocumented and seemingly independent of
          the others — not a scale, three separate escapes.
        </p>
        <div>
          <ZIndexTier
            value="z-[70]"
            description="One-off, above the global overlay tier for a specific in-flow element. No stated reason."
            usages={["components/onboarding/account-onboarding-flow.tsx:773"]}
          />
          <ZIndexTier
            value="z-[100]"
            description="Toast notifications — deliberately above dialogs/sheets so a toast is never hidden behind an open overlay. The one arbitrary value with an obvious rationale."
            usages={["components/ui/toast.tsx:19"]}
          />
          <ZIndexTier
            value="z-[220]"
            description="The single highest value in the codebase, over 2x the next-highest arbitrary value, with nothing else near it. No comment or naming explains why 220 specifically."
            usages={["components/dashboard/v2-product-rail.tsx:63"]}
          />
        </div>
      </section>
    </div>
  ),
}
