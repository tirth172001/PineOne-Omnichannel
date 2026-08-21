import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Button } from "./button"
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "./popover"

const meta = {
  title: "UI/Popover",
  component: Popover,
  tags: ["autodocs"],
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Settlement cycle</PopoverTitle>
        <PopoverDescription>Funds settle T+1 on business days for this payment method.</PopoverDescription>
      </PopoverContent>
    </Popover>
  ),
}
