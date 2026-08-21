import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Button } from "./button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card"

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: "w-80",
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Settlement batch STL-1029</CardTitle>
        <CardDescription>Settled to HDFC bank, xx8787</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm">
            View
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-foreground">₹4,82,300</p>
        <p className="text-sm text-muted-foreground">248 transactions</p>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">Settled 12 Jun, 2026</p>
      </CardFooter>
    </Card>
  ),
}
