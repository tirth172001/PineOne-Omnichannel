import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { TextBIcon } from "@phosphor-icons/react"
import { Toggle } from "./toggle"

const meta = {
  title: "UI/Toggle",
  component: Toggle,
  tags: ["autodocs"],
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: "default",
    size: "default",
    "aria-label": "Toggle bold",
    children: <TextBIcon className="h-4 w-4" />,
  },
}
