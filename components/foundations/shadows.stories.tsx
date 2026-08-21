import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { ShadowSwatch } from "./foundation-primitives"

const meta = {
  title: "Foundations/Shadows",
  tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Scale: Story = {
  render: () => (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Shadows are computed from a shared base (<code>--shadow-x/y/blur/spread/opacity/color</code>) rather than
        hand-set per level — each step below scales the same base values (see <code>app/globals.css</code>'s{" "}
        <code>@theme inline</code> block).
      </p>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {[
          { name: "2xs", varName: "--shadow-2xs" },
          { name: "xs", varName: "--shadow-xs" },
          { name: "sm", varName: "--shadow-sm" },
          { name: "md", varName: "--shadow-md" },
          { name: "lg", varName: "--shadow-lg" },
          { name: "xl", varName: "--shadow-xl" },
          { name: "2xl", varName: "--shadow-2xl" },
        ].map((item) => (
          <ShadowSwatch key={item.varName} {...item} />
        ))}
      </div>
    </div>
  ),
}
