import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useEffect } from "react"
import { toast } from "sonner"

import { Toaster } from "./sonner"

function ToasterWithSample() {
  useEffect(() => {
    toast.success("Payout initiated", { description: "₹4,82,300 will settle to HDFC bank, xx8787." })
  }, [])

  return <Toaster />
}

const meta = {
  title: "UI/SonnerToaster",
  component: ToasterWithSample,
  tags: ["autodocs"],
} satisfies Meta<typeof ToasterWithSample>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
