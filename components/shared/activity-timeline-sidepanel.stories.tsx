import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { ActivityTimelineSidepanel, DetailSidepanelShell, type ActivityEvent } from "./activity-timeline-sidepanel"

// This file documents two related components (the generic DetailSidepanelShell
// primitive, and ActivityTimelineSidepanel which composes it with hardcoded
// transaction-detail content) — no single `component` fits Meta cleanly.
const meta = {
  title: "Shared/ActivityTimelineSidepanel",
  tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Shell: Story = {
  render: () => (
    <DetailSidepanelShell open onOpenChange={() => {}} title="Panel title">
      <div className="p-6 text-sm text-muted-foreground">Panel content goes here.</div>
    </DetailSidepanelShell>
  ),
}

const sampleEvent: ActivityEvent = {
  id: "evt-1",
  title: "Payment failed",
  timestamp: "2026-06-12T10:00:00Z",
  tone: "failed",
  details: [],
}

export const TransactionDetail: Story = {
  render: () => <ActivityTimelineSidepanel open onOpenChange={() => {}} event={sampleEvent} />,
}
