import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "./context-menu"

const meta = {
  title: "UI/ContextMenu",
  component: ContextMenu,
  tags: ["autodocs"],
} satisfies Meta<typeof ContextMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <ContextMenu {...args}>
      <ContextMenuTrigger className="flex h-32 w-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Row actions</ContextMenuLabel>
        <ContextMenuItem>Copy transaction ID</ContextMenuItem>
        <ContextMenuItem>Open in new tab</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Void</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
}
