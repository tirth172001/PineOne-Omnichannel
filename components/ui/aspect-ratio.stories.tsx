import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { AspectRatio } from "./aspect-ratio"

const meta = {
  title: "UI/AspectRatio",
  component: AspectRatio,
  tags: ["autodocs"],
} satisfies Meta<typeof AspectRatio>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    ratio: 16 / 9,
    className: "w-80",
  },
  render: (args) => (
    <AspectRatio {...args}>
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
        16:9 media placeholder
      </div>
    </AspectRatio>
  ),
}
