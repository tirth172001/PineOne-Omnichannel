import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import { MoreFiltersPanel, type MoreFilterCategory } from "./more-filters-panel"

const meta = {
  title: "Shared/MoreFiltersPanel",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const demoCategories: MoreFilterCategory[] = [
  {
    id: "category",
    label: "Report category",
    display: "card",
    selectionMode: "multi",
    options: [
      { id: "transaction", label: "Transaction", description: "All transaction-level reports" },
      { id: "financial", label: "Financial report", description: "FIRC and other financial statements" },
      { id: "refund", label: "Refund report", description: "Refund requests and status" },
      { id: "sales", label: "Sales Summary Report", description: "POS, store, acquirer, issuer, UPI" },
      { id: "settlement", label: "Settlement Report", description: "MPR and batch detail" },
      { id: "terminal", label: "Terminal Reports", description: "TID and POS install/deinstall logs" },
    ],
  },
  {
    id: "channel",
    label: "Channel",
    display: "list",
    selectionMode: "single",
    searchable: false,
    options: [
      { id: "online", label: "Online" },
      { id: "offline", label: "Offline" },
    ],
  },
  {
    id: "format",
    label: "Format",
    display: "badge",
    selectionMode: "multi",
    searchable: false,
    options: [
      { id: "csv", label: "CSV" },
      { id: "xlsx", label: "XLSX" },
      { id: "pdf", label: "PDF" },
    ],
  },
]

function PanelDemo({ categories }: { categories: MoreFilterCategory[] }) {
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0].id)
  const [selected, setSelected] = useState<Record<string, string[]>>({})

  return (
    <MoreFiltersPanel
      categories={categories}
      selected={selected}
      onChange={(categoryId, next) => setSelected((current) => ({ ...current, [categoryId]: next }))}
      activeCategoryId={activeCategoryId}
      onActiveCategoryChange={setActiveCategoryId}
      onClear={() => setSelected({})}
      onApply={() => console.log("Applied", selected)}
    />
  )
}

export const Default: Story = {
  render: () => (
    <div className="max-w-[860px]">
      <PanelDemo categories={demoCategories} />
    </div>
  ),
}

export const CardDisplay: Story = {
  name: "Display: card (title + subtext + selector on the right)",
  render: () => (
    <div className="max-w-[860px]">
      <PanelDemo categories={[demoCategories[0]]} />
    </div>
  ),
}

export const ListDisplaySingleSelect: Story = {
  name: "Display: list, single-select",
  render: () => (
    <div className="max-w-[860px]">
      <PanelDemo categories={[demoCategories[1]]} />
    </div>
  ),
}

export const BadgeDisplay: Story = {
  name: "Display: badge (chip toggles)",
  render: () => (
    <div className="max-w-[860px]">
      <PanelDemo categories={[demoCategories[2]]} />
    </div>
  ),
}

export const ManyCategories: Story = {
  name: "Scales to many categories/options",
  render: () => {
    const categories: MoreFilterCategory[] = Array.from({ length: 8 }, (_, index) => ({
      id: `category-${index}`,
      label: `Filter group ${index + 1}`,
      display: (["card", "list", "badge"] as const)[index % 3],
      selectionMode: index % 2 === 0 ? "multi" : "single",
      options: Array.from({ length: 6 }, (_, optionIndex) => ({
        id: `option-${index}-${optionIndex}`,
        label: `Option ${optionIndex + 1}`,
        description: `Description for option ${optionIndex + 1}`,
      })),
    }))
    return (
      <div className="max-w-[860px]">
        <PanelDemo categories={categories} />
      </div>
    )
  },
}
