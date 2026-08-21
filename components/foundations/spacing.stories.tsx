import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { SpacingBar } from "./foundation-primitives"

const meta = {
  title: "Foundations/Spacing",
  tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const SCALE = [
  { token: "1", px: 4 },
  { token: "2", px: 8 },
  { token: "3", px: 12 },
  { token: "4", px: 16 },
  { token: "5", px: 20 },
  { token: "6", px: 24 },
  { token: "8", px: 32 },
  { token: "10", px: 40 },
  { token: "12", px: 48 },
  { token: "16", px: 64 },
  { token: "20", px: 80 },
  { token: "24", px: 96 },
]

export const Scale: Story = {
  render: () => (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        No custom spacing scale either — this is Tailwind v4's default 4px-based scale (<code>--spacing: 0.25rem</code>{" "}
        internally), used directly via utilities like <code>p-4</code>, <code>gap-2</code>, <code>px-2.5</code>{" "}
        throughout this codebase.
      </p>
      <div className="space-y-2.5">
        {SCALE.map((item) => (
          <SpacingBar key={item.token} label={`p-${item.token}`} px={item.px} />
        ))}
      </div>
    </div>
  ),
}
