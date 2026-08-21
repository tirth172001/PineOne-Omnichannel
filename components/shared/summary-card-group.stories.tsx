import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { CreditCardIcon, WalletIcon } from "@phosphor-icons/react"
import { SummaryCardGroup, type SummaryCardItem } from "./summary-card-group"

const cards: SummaryCardItem[] = [
  { icon: WalletIcon, label: "Settled today", value: "₹4,82,300", subtext: "248 transactions" },
  { icon: CreditCardIcon, label: "On hold", value: "₹12,400", subtext: "3 transactions", additionalText: "View →" },
]

const meta = {
  title: "Shared/SummaryCardGroup",
  component: SummaryCardGroup,
  tags: ["autodocs"],
} satisfies Meta<typeof SummaryCardGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { cards },
}
