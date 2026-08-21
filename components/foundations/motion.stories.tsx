import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { MotionSample } from "./foundation-primitives"

const meta = {
  title: "Foundations/Motion",
  tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Scale: Story = {
  render: () => (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Framer Motion — panel/overlay easing
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Every <code>framer-motion</code> panel transition in the app uses the same easing curve —{" "}
          <code>cubic-bezier(0.22, 1, 0.36, 1)</code> — at a duration between 0.2s and 0.28s. This is a real,
          consistent motion language, it's just not centralized: each file below redeclares the same array as a
          local literal instead of importing one shared constant. Hover a bar to feel the actual curve.
        </p>
        <div>
          <MotionSample
            label="0.2s (dominant)"
            duration="200ms"
            easing="cubic-bezier(0.22, 1, 0.36, 1)"
            usages={[
              "components/ui/panels.tsx:55",
              "components/shared/activity-timeline-sidepanel.tsx:89",
              "components/dashboard/workspace-shell.tsx:80",
              "components/dashboard/v2-dashboard-layout.tsx:128",
            ]}
          />
          <MotionSample
            label="0.22s"
            duration="220ms"
            easing="cubic-bezier(0.22, 1, 0.36, 1)"
            usages={[
              "components/shared/activity-timeline-sidepanel.tsx:105",
              "components/dashboard/workspace-shell.tsx:118",
            ]}
          />
          <MotionSample
            label="0.24s"
            duration="240ms"
            easing="cubic-bezier(0.22, 1, 0.36, 1)"
            usages={["components/dashboard/workspace-shell.tsx:136"]}
          />
          <MotionSample
            label="0.28s (largest panel)"
            duration="280ms"
            easing="cubic-bezier(0.22, 1, 0.36, 1)"
            usages={["components/transactions/transactions-platform-shell.tsx:43 (PANEL_TRANSITION constant)"]}
          />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          <code>animated-number-text.tsx</code> also uses <code>framer-motion</code> but with no explicit
          duration/easing — it relies on the library's default spring.
        </p>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Tailwind <code>duration-*</code> utilities — overlay open/close (dominant tier)
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">
          <code>duration-100</code> with the default Tailwind ease is the de facto standard for every Radix overlay's
          open/close transition — shared across 7 primitives.
        </p>
        <div>
          <MotionSample
            label="Overlay open/close"
            duration="100ms"
            easing="ease"
            usages={[
              "components/ui/dialog.tsx",
              "components/ui/alert-dialog.tsx",
              "components/ui/dropdown-menu.tsx",
              "components/ui/context-menu.tsx",
              "components/ui/menubar.tsx",
              "components/ui/popover.tsx",
              "components/ui/hover-card.tsx",
            ]}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Tailwind <code>duration-*</code> utilities — layout/panel expand-collapse
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">
          <code>duration-200</code> is the second real tier — sidebar and dashboard-layout expand/collapse
          transitions, several paired with <code>ease-out</code> or <code>ease-linear</code>.
        </p>
        <div>
          <MotionSample
            label="Layout expand/collapse"
            duration="200ms"
            easing="ease-out"
            usages={[
              "components/ui/sidebar.tsx",
              "components/dashboard/v2-sidebar.tsx",
              "components/dashboard/v2-dashboard-layout.tsx",
              "components/dashboard/floating-demo-fab.tsx",
            ]}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          One-off values — no shared tier
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Four values appear in exactly one place each. <code>duration-1000</code> is a deliberate slow blink; the
          other three (<code>150ms</code>, <code>250ms</code>, <code>300ms</code>) sit between the two real tiers
          above with no stated reason for not matching either. A fifth value — <code>180ms ease</code> — is a raw CSS{" "}
          <code>transition</code> declaration in <code>app/globals.css</code>, entirely outside the Tailwind{" "}
          <code>duration-*</code> scale.
        </p>
        <div>
          <MotionSample
            label="duration-150"
            duration="150ms"
            easing="ease"
            usages={["components/dashboard/v2-product-rail.tsx:44"]}
          />
          <MotionSample
            label="duration-250"
            duration="250ms"
            easing="ease"
            usages={["components/dashboard/bottom-nav.tsx:65"]}
          />
          <MotionSample
            label="duration-300 (navigation-menu)"
            duration="300ms"
            easing="ease"
            usages={["components/ui/navigation-menu.tsx:77", "components/ui/navigation-menu.tsx:90"]}
          />
          <MotionSample
            label="duration-1000 (caret blink — deliberate)"
            duration="1000ms"
            easing="ease"
            usages={["components/ui/input-otp.tsx:66"]}
          />
          <MotionSample
            label="raw CSS transition — outside the Tailwind scale"
            duration="180ms"
            easing="ease"
            usages={["app/globals.css:333"]}
          />
        </div>
      </section>
    </div>
  ),
}
