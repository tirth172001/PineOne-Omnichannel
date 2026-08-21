import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { LogoMark } from "./logo-mark"

const meta = {
  title: "Brand/LogoMark",
  component: LogoMark,
  tags: ["autodocs"],
} satisfies Meta<typeof LogoMark>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: "h-12 w-16 text-foreground",
  },
}
