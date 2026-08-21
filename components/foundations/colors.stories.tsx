import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { ColorSwatchGroup } from "./foundation-primitives"

// Documentation-only: renders the repo's actual CSS custom properties
// (app/globals.css) as swatches, not a component with props — no `component`
// to satisfy Meta's typing here.
const meta = {
  title: "Foundations/Colors",
  tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div>
      <ColorSwatchGroup
        title="Base"
        colors={[
          { name: "Background", varName: "--background" },
          { name: "Foreground", varName: "--foreground" },
          { name: "Card", varName: "--card" },
          { name: "Card foreground", varName: "--card-foreground" },
          { name: "Popover", varName: "--popover" },
          { name: "Popover foreground", varName: "--popover-foreground" },
          { name: "Border", varName: "--border" },
          { name: "Input", varName: "--input" },
          { name: "Ring", varName: "--ring" },
        ]}
      />
      <ColorSwatchGroup
        title="Brand"
        colors={[
          { name: "Primary", varName: "--primary" },
          { name: "Primary foreground", varName: "--primary-foreground" },
          { name: "Secondary", varName: "--secondary" },
          { name: "Secondary foreground", varName: "--secondary-foreground" },
          { name: "Accent", varName: "--accent" },
          { name: "Accent foreground", varName: "--accent-foreground" },
        ]}
      />
      <ColorSwatchGroup
        title="Semantic status"
        colors={[
          { name: "Destructive", varName: "--destructive" },
          { name: "Success", varName: "--success" },
          { name: "Success foreground", varName: "--success-foreground" },
          { name: "Warning", varName: "--warning" },
          { name: "Warning foreground", varName: "--warning-foreground" },
          { name: "Muted", varName: "--muted" },
          { name: "Muted foreground", varName: "--muted-foreground" },
        ]}
      />
      <ColorSwatchGroup
        title="Status aliases (used by data tables/pills)"
        colors={[
          { name: "Status success", varName: "--status-success" },
          { name: "Status warning", varName: "--status-warning" },
          { name: "Status error", varName: "--status-error" },
          { name: "Status info", varName: "--status-info" },
        ]}
      />
      <ColorSwatchGroup
        title="Chart palette"
        colors={[
          { name: "Chart 1", varName: "--chart-1" },
          { name: "Chart 2", varName: "--chart-2" },
          { name: "Chart 3", varName: "--chart-3" },
          { name: "Chart 4", varName: "--chart-4" },
          { name: "Chart 5", varName: "--chart-5" },
        ]}
      />
      <ColorSwatchGroup
        title="Olive surfaces (Transactions-style pages)"
        colors={[
          { name: "Soft", varName: "--olive-surface-soft" },
          { name: "Main", varName: "--olive-surface-main" },
          { name: "Panel", varName: "--olive-surface-panel" },
          { name: "Panel hover", varName: "--olive-surface-panel-hover" },
          { name: "Chip", varName: "--olive-surface-chip" },
          { name: "Chart", varName: "--olive-surface-chart" },
          { name: "Alt", varName: "--olive-surface-alt" },
          { name: "900", varName: "--olive-900" },
        ]}
      />
      <ColorSwatchGroup
        title="Sidebar"
        colors={[
          { name: "Sidebar", varName: "--sidebar" },
          { name: "Sidebar foreground", varName: "--sidebar-foreground" },
          { name: "Sidebar primary", varName: "--sidebar-primary" },
          { name: "Sidebar accent", varName: "--sidebar-accent" },
          { name: "Sidebar border", varName: "--sidebar-border" },
        ]}
      />
    </div>
  ),
}
