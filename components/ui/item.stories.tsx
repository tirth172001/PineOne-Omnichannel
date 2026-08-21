import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { CreditCardIcon } from "@phosphor-icons/react"
import { Badge } from "./badge"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "./item"

const meta = {
  title: "UI/Item",
  component: Item,
  tags: ["autodocs"],
} satisfies Meta<typeof Item>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: "outline",
    className: "w-96",
  },
  render: (args) => (
    <ItemGroup>
      <Item {...args}>
        <ItemMedia variant="icon">
          <CreditCardIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Card payment</ItemTitle>
          <ItemDescription>Visa •• 4242 — 8m ago</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Badge variant="secondary">Success</Badge>
        </ItemActions>
      </Item>
    </ItemGroup>
  ),
}
