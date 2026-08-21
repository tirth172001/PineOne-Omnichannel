import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Calendar } from "./calendar"

const meta = {
  title: "UI/Calendar",
  component: Calendar,
  tags: ["autodocs"],
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    mode: "single",
    defaultMonth: new Date(2026, 5, 1),
    selected: new Date(2026, 5, 12),
  },
}
