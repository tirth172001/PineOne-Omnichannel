import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command"

const meta = {
  title: "UI/Command",
  component: Command,
  tags: ["autodocs"],
} satisfies Meta<typeof Command>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: "w-80 rounded-lg border",
  },
  render: (args) => (
    <Command {...args}>
      <CommandInput placeholder="Search transactions, settlements..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            Go to Settlements
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
          <CommandItem>Go to Refunds</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem>Create payment link</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}
