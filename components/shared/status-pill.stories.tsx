import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { StatusPill } from "./status-pill"

const meta = {
  title: "Shared/StatusPill",
  component: StatusPill,
  tags: ["autodocs"],
} satisfies Meta<typeof StatusPill>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: "Success",
    tone: "success",
  },
}
