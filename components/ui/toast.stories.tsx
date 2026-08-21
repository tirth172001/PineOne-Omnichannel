import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "./toast"

const meta = {
  title: "UI/Toast",
  component: Toast,
  tags: ["autodocs"],
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
  },
  render: (args) => (
    <ToastProvider>
      <Toast {...args}>
        <div className="grid gap-1">
          <ToastTitle>Payout initiated</ToastTitle>
          <ToastDescription>₹4,82,300 will settle to HDFC bank, xx8787.</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      <ToastViewport className="static flex w-auto max-w-none translate-x-0 translate-y-0 p-0" />
    </ToastProvider>
  ),
}
