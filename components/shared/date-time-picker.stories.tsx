import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import { DateTimePicker, type DateTimeValue } from "./date-time-picker"

const meta = {
  title: "Shared/DateTimePicker",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function PickerDemo() {
  const [value, setValue] = useState<DateTimeValue>({ date: new Date(2027, 0, 12), time: "01:33 PM" })

  return (
    <div className="max-w-[360px]">
      <DateTimePicker value={value} onChange={setValue} />
    </div>
  )
}

export const Default: Story = {
  render: () => <PickerDemo />,
}

export const Empty: Story = {
  render: () => {
    function EmptyDemo() {
      const [value, setValue] = useState<DateTimeValue>({ date: undefined, time: "10:30 AM" })
      return (
        <div className="max-w-[360px]">
          <DateTimePicker value={value} onChange={setValue} placeholder="Select expiry date" />
        </div>
      )
    }
    return <EmptyDemo />
  },
}
