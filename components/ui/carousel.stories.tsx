import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./carousel"

const meta = {
  title: "UI/Carousel",
  component: Carousel,
  tags: ["autodocs"],
} satisfies Meta<typeof Carousel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: "w-80",
  },
  render: (args) => (
    <Carousel {...args}>
      <CarouselContent>
        {["Payment Gateway", "Subscriptions", "Payouts"].map((label) => (
          <CarouselItem key={label}>
            <div className="flex h-32 items-center justify-center rounded-lg bg-muted text-sm font-medium text-foreground">
              {label}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}
