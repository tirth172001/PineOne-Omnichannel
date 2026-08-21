import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Label } from "./label"
import { RadioGroup, RadioGroupItem } from "./radio-group"

const meta = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultValue: "comfortable",
    className: "gap-3",
  },
  render: (args) => (
    <RadioGroup {...args}>
      {[
        { value: "default", label: "Default" },
        { value: "comfortable", label: "Comfortable" },
        { value: "compact", label: "Compact" },
      ].map((option) => (
        <div key={option.value} className="flex items-center gap-2">
          <RadioGroupItem value={option.value} id={option.value} />
          <Label htmlFor={option.value}>{option.label}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
}
