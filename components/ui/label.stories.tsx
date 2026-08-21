import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Checkbox } from "./checkbox"
import { Label } from "./label"

const meta = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: "Accept terms and conditions",
    htmlFor: "terms",
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <Label {...args} />
    </div>
  ),
}
