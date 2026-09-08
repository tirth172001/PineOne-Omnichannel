import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { TypeSample } from "./foundation-primitives"

const meta = {
  title: "Foundations/Typography",
  tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const SCALE = [
  { label: "text-xs", className: "text-xs", px: "12px" },
  { label: "text-sm", className: "text-sm", px: "14px" },
  { label: "text-base", className: "text-base", px: "16px" },
  { label: "text-lg", className: "text-lg", px: "18px" },
  { label: "text-xl", className: "text-xl", px: "20px" },
  { label: "text-2xl", className: "text-2xl", px: "24px" },
  { label: "text-3xl", className: "text-3xl", px: "30px" },
  { label: "text-4xl", className: "text-4xl", px: "36px" },
]

export const Scale: Story = {
  render: () => (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        This repo has no custom type scale — these are Tailwind v4's default <code>text-*</code> sizes, used
        directly across components (no <code>tailwind.config.js</code> override found in this project).
      </p>
      {SCALE.map((item) => (
        <TypeSample key={item.label} label={item.label} sizeClassName={item.className} sizeLabel={item.px} />
      ))}
    </div>
  ),
}

export const Families: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="mb-1 font-mono text-xs text-muted-foreground">--font-sans / --font-mono / --font-heading</p>
        <p className="font-sans text-2xl text-foreground">Inter Display — The quick brown fox jumps over the lazy dog</p>
      </div>
      <p className="text-sm text-muted-foreground">
        Inter Display is the only typeface in the project — <code>--font-sans</code>, <code>--font-mono</code>, and{" "}
        <code>--font-heading</code> all alias to it in <code>app/globals.css</code>. Headings (
        <code>font-heading</code>) render at <code>font-semibold</code> by convention.
      </p>
    </div>
  ),
}
