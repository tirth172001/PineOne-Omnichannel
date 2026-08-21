import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultValue: "online",
    className: "w-80",
  },
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="online">Online payments</TabsTrigger>
        <TabsTrigger value="in-store">In-store payments</TabsTrigger>
      </TabsList>
      <TabsContent value="online">Online payment settlement and reconciliation.</TabsContent>
      <TabsContent value="in-store">POS device transactions and settlement.</TabsContent>
    </Tabs>
  ),
}
