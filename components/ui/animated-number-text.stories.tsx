import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { AnimatedNumberText } from "./animated-number-text"

const meta = {
  title: "UI/AnimatedNumberText",
  component: AnimatedNumberText,
  tags: ["autodocs"],
} satisfies Meta<typeof AnimatedNumberText>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 482300,
    className: "text-2xl font-semibold text-foreground",
  },
}
