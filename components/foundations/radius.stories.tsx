import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { RadiusSwatch } from "./foundation-primitives"

const meta = {
  title: "Foundations/Radius",
  tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Scale: Story = {
  render: () => (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Tailwind scale (used directly as <code>rounded-*</code>)
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { name: "xs", varName: "--radius-xs" },
            { name: "sm", varName: "--radius-sm" },
            { name: "md", varName: "--radius-md" },
            { name: "lg", varName: "--radius-lg" },
            { name: "xl", varName: "--radius-xl" },
            { name: "2xl", varName: "--radius-2xl" },
            { name: "3xl", varName: "--radius-3xl" },
            { name: "4xl", varName: "--radius-4xl" },
          ].map((item) => (
            <RadiusSwatch key={item.varName} {...item} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Semantic radius tokens
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">
          A second, separate radius system also exists (<code>--radius-raw-*</code> → <code>--radius-token-*</code> →{" "}
          <code>--semantic-*-radius</code>), used by some newer components alongside the Tailwind scale above — not
          yet consolidated with it.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { name: "control", varName: "--semantic-control-radius" },
            { name: "surface", varName: "--semantic-surface-radius" },
            { name: "panel", varName: "--semantic-panel-radius" },
            { name: "pill", varName: "--semantic-pill-radius" },
          ].map((item) => (
            <RadiusSwatch key={item.varName} {...item} />
          ))}
        </div>
      </section>
    </div>
  ),
}
