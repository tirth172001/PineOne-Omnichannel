import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import {
  ListingPageHeader,
  ListingSummaryCards,
  ListingToolbar,
  type ListingFilter,
} from "./listing-page-primitives"

// This file documents three related-but-distinct components
// (ListingPageHeader, ListingToolbar, ListingSummaryCards) that share one
// source file — no single `component` fits Meta cleanly, so it's omitted;
// each story is fully self-contained via `render`.
const meta = {
  title: "Shared/ListingPagePrimitives",
  tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Header: Story = {
  render: () => {
    function HeaderDemo() {
      const [active, setActive] = useState("online")
      return (
        <ListingPageHeader
          title="Transactions"
          toggles={[
            { label: "Online", value: "online" },
            { label: "In-store", value: "in-store" },
          ]}
          activeToggle={active}
          onToggleChange={setActive}
        />
      )
    }
    return <HeaderDemo />
  },
}

export const Toolbar: Story = {
  render: () => {
    function ToolbarDemo() {
      const [search, setSearch] = useState("")
      const filters: ListingFilter[] = [
        { id: "status", type: "select", label: "Status", value: "all", options: [{ label: "All", value: "all" }, { label: "Success", value: "success" }] },
      ]
      return (
        <ListingToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search transactions..."
          filters={filters}
        />
      )
    }
    return <ToolbarDemo />
  },
}

export const SummaryCards: Story = {
  render: () => (
    <ListingSummaryCards
      cards={[
        { label: "Total volume", value: "₹48.2L" },
        { label: "Transactions", value: "2,481" },
      ]}
    />
  ),
}
