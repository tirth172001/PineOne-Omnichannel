import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card"

const meta = {
  title: "UI/HoverCard",
  component: HoverCard,
  tags: ["autodocs"],
} satisfies Meta<typeof HoverCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <HoverCard {...args}>
      <HoverCardTrigger className="text-sm font-medium underline underline-offset-4">
        @pineone-merchant
      </HoverCardTrigger>
      <HoverCardContent>
        <p className="font-medium">Pine One Merchant</p>
        <p className="mt-1 text-muted-foreground">Onboarded 2024 · 4 active stores · Verified business.</p>
      </HoverCardContent>
    </HoverCard>
  ),
}
