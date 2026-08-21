import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { ScrollArea } from "./scroll-area"
import { Separator } from "./separator"

const meta = {
  title: "UI/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: "h-48 w-64 rounded-lg border",
  },
  render: (args) => (
    <ScrollArea {...args}>
      <div className="p-3">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i}>
            <p className="py-2 text-sm">Store #{i + 1}</p>
            <Separator />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}
