import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { MagnifyingGlassIcon } from "@phosphor-icons/react"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "./input-group"

const meta = {
  title: "UI/InputGroup",
  component: InputGroup,
  tags: ["autodocs"],
} satisfies Meta<typeof InputGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: "w-72",
  },
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupAddon>
        <MagnifyingGlassIcon className="h-4 w-4" />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search transactions..." />
      <InputGroupAddon align="inline-end">
        <InputGroupText>⌘K</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
}
