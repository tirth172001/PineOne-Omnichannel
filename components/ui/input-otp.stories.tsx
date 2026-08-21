import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import type { ComponentType } from "react"

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./input-otp"

// InputOTP's props type is a discriminated union from the `input-otp` library
// (controlled/uncontrolled/render-prop variants) that Storybook's Meta/StoryObj
// generics can't cleanly narrow. Widen to a simple shape for story typing only —
// the real component (with its real prop types) is still what actually renders.
const InputOTPForStory = InputOTP as ComponentType<{ maxLength: number }>

const meta = {
  title: "UI/InputOTP",
  component: InputOTPForStory,
  tags: ["autodocs"],
} satisfies Meta<typeof InputOTPForStory>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { maxLength: 6 },
  render: () => (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
}
