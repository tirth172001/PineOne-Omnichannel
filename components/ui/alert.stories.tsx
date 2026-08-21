import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { WarningIcon } from "@phosphor-icons/react"
import { Alert, AlertDescription, AlertTitle } from "./alert"

const meta = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: "destructive",
    className: "w-96",
  },
  render: (args) => (
    <Alert {...args}>
      <WarningIcon />
      <AlertTitle>Settlement delayed</AlertTitle>
      <AlertDescription>Today's settlement batch is delayed due to a bank holiday.</AlertDescription>
    </Alert>
  ),
}
