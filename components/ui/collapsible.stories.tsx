import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { CaretUpDownIcon } from "@phosphor-icons/react"
import { Button } from "./button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible"

const meta = {
  title: "UI/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultOpen: true,
    className: "w-72 space-y-2",
  },
  render: (args) => (
    <Collapsible {...args}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">3 more line items</p>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <CaretUpDownIcon className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-1 text-sm text-muted-foreground">
        <p>Convenience fee — ₹5.00</p>
        <p>GST — ₹0.90</p>
        <p>Platform fee — ₹2.00</p>
      </CollapsibleContent>
    </Collapsible>
  ),
}
