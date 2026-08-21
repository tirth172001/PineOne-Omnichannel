import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { HighchartsPanelChart } from "./highcharts"

const meta = {
  title: "UI/HighchartsPanelChart",
  component: HighchartsPanelChart,
  tags: ["autodocs"],
} satisfies Meta<typeof HighchartsPanelChart>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: "h-64 w-96",
    options: {
      chart: { type: "spline" },
      title: { text: undefined },
      xAxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May"] },
      yAxis: { title: { text: undefined } },
      series: [{ type: "spline", name: "Settled", data: [186, 205, 237, 219, 248] }],
    },
  },
}
