import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import {
  DateRangeFilterPanel,
  getDefaultDateRangePresets,
  type DateRangeFilterValue,
} from "./date-range-filter"

const meta = {
  title: "Shared/DateRangeFilter",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function initialValue(): DateRangeFilterValue {
  const today = new Date()
  return { presetId: "today", range: { from: today, to: today }, startTime: "10:30 AM", endTime: "10:30 AM" }
}

function PanelDemo(props: Partial<Parameters<typeof DateRangeFilterPanel>[0]>) {
  const [value, setValue] = useState<DateRangeFilterValue>(initialValue())

  return (
    <div className="max-w-[820px]">
      <DateRangeFilterPanel
        value={value}
        onChange={setValue}
        onClear={() => setValue(initialValue())}
        onApply={() => console.log("Applied", value)}
        {...props}
      />
    </div>
  )
}

export const Default: Story = {
  render: () => <PanelDemo />,
}

export const WithoutTime: Story = {
  name: "Without time pickers",
  render: () => <PanelDemo showTime={false} />,
}

export const CustomPresets: Story = {
  name: "Custom preset set",
  render: () => {
    const presets = [
      {
        id: "last-hour",
        label: "Last hour",
        getRange: () => {
          const now = new Date()
          return { from: now, to: now }
        },
      },
      {
        id: "quarter",
        label: "This quarter",
        getRange: () => {
          const now = new Date()
          const from = new Date(now)
          from.setMonth(now.getMonth() - 3)
          return { from, to: now }
        },
      },
      { id: "custom", label: "Custom" },
    ]
    return <PanelDemo presets={presets} />
  },
}

export const SingleMonth: Story = {
  name: "Single month calendar",
  render: () => <PanelDemo numberOfMonths={1} />,
}

export const DefaultPresetsReference: Story = {
  name: "Default presets (reference)",
  render: () => {
    const presets = getDefaultDateRangePresets()
    return (
      <div className="max-w-[820px] space-y-2 text-sm text-muted-foreground">
        <p>getDefaultDateRangePresets() returns:</p>
        <ul className="list-inside list-disc">
          {presets.map((preset) => (
            <li key={preset.id}>{preset.label}</li>
          ))}
        </ul>
        <PanelDemo presets={presets} />
      </div>
    )
  },
}
