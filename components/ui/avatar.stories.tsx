import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Avatar, AvatarFallback, AvatarImage } from "./avatar"

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    size: "default",
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" alt="Rahul Sharma" />
      <AvatarFallback>RS</AvatarFallback>
    </Avatar>
  ),
}
