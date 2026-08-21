import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./chart"

const data = [
  { month: "Jan", settled: 186000 },
  { month: "Feb", settled: 205000 },
  { month: "Mar", settled: 237000 },
  { month: "Apr", settled: 219000 },
  { month: "May", settled: 248000 },
]

const chartConfig = {
  settled: { label: "Settled", color: "var(--primary)" },
} satisfies ChartConfig

const meta = {
  title: "UI/Chart",
  component: ChartContainer,
  tags: ["autodocs"],
} satisfies Meta<typeof ChartContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    config: chartConfig,
    className: "w-96",
    children: (
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="settled" fill="var(--color-settled)" radius={4} />
      </BarChart>
    ),
  },
}
