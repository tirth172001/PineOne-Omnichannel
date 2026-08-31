import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { ContainerWidthBar } from "./foundation-primitives"

const meta = {
  title: "Foundations/Container Widths",
  tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Scale: Story = {
  render: () => (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Full-page shells
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">
          No shared value beyond one real cluster at 1440px. Every other page shell picks its own arbitrary width.
        </p>
        <div>
          <ContainerWidthBar
            label="1440px ×4"
            px={1440}
            maxPx={1700}
            usages={[
              "components/disputes/dispute-detail-content.tsx",
              "components/onboarding/account-onboarding-flow.tsx:388",
              "components/transactions/transaction-detail-content.tsx",
            ]}
          />
          <ContainerWidthBar
            label="1700px"
            px={1700}
            maxPx={1700}
            usages={["app/component-docs/layout.tsx:10"]}
          />
          <ContainerWidthBar
            label="1512px"
            px={1512}
            maxPx={1700}
            usages={["components/settlements/settlements-content.tsx"]}
          />
          <ContainerWidthBar
            label="1360px ×3"
            px={1360}
            maxPx={1700}
            usages={["components/account/settings-slide-panel.tsx (3 call sites)"]}
          />
          <ContainerWidthBar label="1280px" px={1280} maxPx={1700} usages={["components/dashboard/app-alert-strip.tsx"]} />
          <ContainerWidthBar label="1120px" px={1120} maxPx={1700} usages={["components/home/home-content.tsx:2751"]} />
          <ContainerWidthBar label="1100px" px={1100} maxPx={1700} usages={["components/auth/auth-shell.tsx"]} />
          <ContainerWidthBar label="1080px" px={1080} maxPx={1700} usages={["app/component-docs/layout.tsx:13"]} />
          <ContainerWidthBar
            label="5xl (1024px)"
            px={1024}
            maxPx={1700}
            usages={["components/onboarding/account-onboarding-flow.tsx:410"]}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Article / form-width content
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Tailwind's named scale (<code>4xl</code>/<code>3xl</code>/<code>2xl</code>/<code>xl</code>/<code>lg</code>)
          gets real reuse here, but two arbitrary values — 560px and 520px — sit in the gaps between <code>lg</code>{" "}
          (512px) and <code>xl</code> (576px) instead of using either.
        </p>
        <div>
          <ContainerWidthBar
            label="4xl (896px) ×6"
            px={896}
            maxPx={1024}
            usages={[
              "components/dashboard/v2-dashboard-layout.tsx:39",
              "components/onboarding/lending-application-flow.tsx (3 call sites)",
              "components/onboarding/pos-onboarding-flow.tsx",
              "components/settlements/v3-settlements-content.tsx:1086",
            ]}
          />
          <ContainerWidthBar
            label="3xl (768px) ×4"
            px={768}
            maxPx={1024}
            usages={[
              "app/component-docs/_components/component-preview.tsx",
              "app/component-docs/page.tsx (2 call sites)",
              "components/account/account-page-content.tsx:239",
            ]}
          />
          <ContainerWidthBar
            label="2xl (672px) ×3"
            px={672}
            maxPx={1024}
            usages={[
              "components/online-payments/online-payments-content.tsx",
              "components/products/payout-setup-content.tsx",
              "components/settings/merchant-settings-content.tsx:275",
            ]}
          />
          <ContainerWidthBar
            label="xl (576px) ×6"
            px={576}
            maxPx={1024}
            usages={[
              "components/account/account-page-content.tsx (2 call sites)",
              "components/account/manage-user-roles-content.tsx",
              "components/account/settings-slide-panel.tsx:1758",
              "components/dashboard/v2-dashboard-layout.tsx:40",
              "components/search/global-search-content.tsx",
            ]}
          />
          <ContainerWidthBar
            label="560px ×3 (gap)"
            px={560}
            maxPx={1024}
            usages={[
              "components/auth/auth-flow-card.tsx",
              "components/home/home-content.tsx (2 call sites)",
            ]}
          />
          <ContainerWidthBar
            label="lg (512px) ×3"
            px={512}
            maxPx={1024}
            usages={["components/onboarding/lending-application-flow.tsx (3 call sites)"]}
          />
          <ContainerWidthBar
            label="520px ×2 (gap)"
            px={520}
            maxPx={1024}
            usages={[
              "components/onboarding/account-onboarding-flow.tsx:773",
              "components/settings/merchant-settings-content.tsx:373",
            ]}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Dialog / sheet / panel content
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">
          The messiest bucket. Radix/shadcn's own defaults — <code>sm</code> (384px, the real standard: 10 call
          sites) and <code>md</code> (448px) — coexist with a parallel set of arbitrary pixel values that mostly
          cluster near them but never actually reuse the token. <code>max-w-[320px]</code> duplicates{" "}
          <code>max-w-xs</code>'s own value (320px) with different syntax, and <code>464px</code> is 4px off the
          460px cluster for no apparent reason.
        </p>
        <div>
          <ContainerWidthBar
            label="sm (384px) ×10"
            px={384}
            maxPx={512}
            usages={[
              "components/ui/alert-dialog.tsx, dialog.tsx, drawer.tsx, sheet.tsx, empty.tsx (shadcn primitive defaults)",
              "components/auth/auth-shell.tsx, dashboard/sub-page-placeholder.tsx, dashboard/top-navigation.tsx, products/products-content.tsx",
            ]}
          />
          <ContainerWidthBar
            label="md (448px) ×4"
            px={448}
            maxPx={512}
            usages={[
              "components/account/settings-slide-panel.tsx (2 call sites)",
              "components/dashboard/bottom-nav.tsx",
              "components/dashboard/demo-settings-dialog.tsx",
            ]}
          />
          <ContainerWidthBar
            label="460px ×5 (near-md)"
            px={460}
            maxPx={512}
            usages={[
              "components/home/home-content.tsx (3 call sites)",
              "components/shared/bulk-operation-sheet.tsx",
              "components/support/support-route-content.tsx",
            ]}
          />
          <ContainerWidthBar label="464px (off by 4)" px={464} maxPx={512} usages={["components/settlements/v3-settlements-content.tsx:747"]} />
          <ContainerWidthBar label="430px" px={430} maxPx={512} usages={["components/dashboard/v2-support-drawer.tsx"]} />
          <ContainerWidthBar
            label="420px ×3"
            px={420}
            maxPx={512}
            usages={[
              "components/dashboard/overview-analytics-canvas.tsx",
              "components/home/home-content.tsx:5062",
              "components/ui/toast.tsx",
            ]}
          />
          <ContainerWidthBar label="390px" px={390} maxPx={512} usages={["components/dashboard/v2-topbar.tsx"]} />
          <ContainerWidthBar label="380px" px={380} maxPx={512} usages={["components/home/home-content.tsx:2918"]} />
          <ContainerWidthBar
            label="xs (320px) ×2 + 320px arbitrary ×2"
            px={320}
            maxPx={512}
            usages={[
              "components/ui/alert-dialog.tsx, ui/tooltip.tsx (xs token)",
              "app/login/page.tsx:220, checkout/checkout-content.tsx:179 (arbitrary — same value, different syntax)",
            ]}
          />
          <ContainerWidthBar label="224px" px={224} maxPx={512} usages={["components/settlements/v3-settlements-content.tsx:586"]} />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Chat bubble width
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">
          A distinct, internally-consistent pattern: <code>max-w-[92%]</code> as a percentage cap rather than a fixed
          pixel value, used everywhere a chat-style message bubble appears (8 call sites total). This is the one
          bucket that's already coherent — it just isn't a pixel-based scale so it doesn't show up anywhere else in
          this catalog.
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          components/onboarding/account-onboarding-flow.tsx:737, components/support/support-request-chat-panel.tsx
          (7 call sites)
        </p>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Fluid / viewport-relative escapes
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Each of these serves a distinct, legitimate fluid-layout purpose rather than representing inconsistency:{" "}
          <code>max-w-full</code> (fill parent), <code>max-w-max</code> (hug content — <code>navigation-menu.tsx</code>
          ), and viewport-safe margins (<code>max-w-[calc(100%-2rem)]</code> in <code>dialog.tsx</code>,{" "}
          <code>max-w-[calc(100vw-2rem)]</code> in <code>floating-demo-fab.tsx</code>).
        </p>
      </section>
    </div>
  ),
}
