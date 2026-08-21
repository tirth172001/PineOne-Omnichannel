import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { PackageIcon } from "@phosphor-icons/react"
import { Button } from "./button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "./empty"

const meta = {
  title: "UI/Empty",
  component: Empty,
  tags: ["autodocs"],
} satisfies Meta<typeof Empty>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Empty {...args}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <PackageIcon className="h-4 w-4" />
        </EmptyMedia>
        <EmptyTitle>No products found</EmptyTitle>
        <EmptyDescription>Try a different search term to view products across categories.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
}

export const WithAction: Story = {
  render: (args) => (
    <Empty {...args}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <PackageIcon className="h-4 w-4" />
        </EmptyMedia>
        <EmptyTitle>No stores yet</EmptyTitle>
        <EmptyDescription>Add your first store to start accepting in-person payments.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm">Add new store</Button>
      </EmptyContent>
    </Empty>
  ),
}
