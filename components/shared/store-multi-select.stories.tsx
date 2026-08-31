import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import { STORE_IDENTITIES } from "@/lib/store-identity"
import { StoreMultiSelect } from "./store-multi-select"

const meta = {
  title: "Shared/StoreMultiSelect",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function SelectDemo() {
  const [selected, setSelected] = useState<string[]>([STORE_IDENTITIES[0].storeId])

  return (
    <div className="max-w-[320px]">
      <StoreMultiSelect stores={STORE_IDENTITIES} selectedStoreIds={selected} onChange={setSelected} />
    </div>
  )
}

export const Default: Story = {
  render: () => <SelectDemo />,
}

export const Empty: Story = {
  render: () => {
    function EmptyDemo() {
      const [selected, setSelected] = useState<string[]>([])
      return (
        <div className="max-w-[320px]">
          <StoreMultiSelect stores={STORE_IDENTITIES} selectedStoreIds={selected} onChange={setSelected} />
        </div>
      )
    }
    return <EmptyDemo />
  },
}
