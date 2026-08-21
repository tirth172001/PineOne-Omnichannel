import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Slider } from "./slider"

const meta = {
  title: "UI/Slider",
  component: Slider,
  tags: ["autodocs"],
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultValue: [40],
    min: 0,
    max: 100,
    step: 1,
    className: "w-64",
  },
}
