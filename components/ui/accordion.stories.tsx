import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion"

const meta = {
  title: "UI/Accordion",
  component: Accordion,
  tags: ["autodocs"],
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    type: "single",
    defaultValue: "item-1",
    collapsible: true,
    className: "w-96",
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>What is settlement T+1?</AccordionTrigger>
        <AccordionContent>Funds settle to your bank account one business day after the transaction.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How are refunds processed?</AccordionTrigger>
        <AccordionContent>Refunds are deducted from your next settlement cycle automatically.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}
