import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { SummaryMetricsRow } from "./summary-metrics-row"

const meta = {
  title: "Shared/SummaryMetricsRow",
  component: SummaryMetricsRow,
  tags: ["autodocs"],
} satisfies Meta<typeof SummaryMetricsRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    metrics: [
      { label: "Total volume", value: "₹48.2L", delta: "+12.4%", deltaTone: "positive" },
      { label: "Transactions", value: "2,481", delta: "+3.1%", deltaTone: "positive" },
      { label: "Failure rate", value: "1.8%", delta: "+0.4%", deltaTone: "negative" },
      { label: "Avg. ticket size", value: "₹1,942", delta: "0.0%", deltaTone: "neutral" },
    ],
  },
}
