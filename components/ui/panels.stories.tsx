import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Badge } from "./badge"
import { Panel, PanelActions, PanelBody, PanelGroup, PanelHeader, PanelTitle } from "./panels"
import { PageHeader } from "./panels"

const meta = {
  title: "UI/Panels",
  component: PanelGroup,
  tags: ["autodocs"],
} satisfies Meta<typeof PanelGroup>

export default meta
type Story = StoryObj<typeof meta>

export const PanelLayout: Story = {
  args: {
    className: "h-64 rounded-lg border",
  },
  render: (args) => (
    <PanelGroup {...args}>
      <Panel width={200}>
        <PanelHeader>
          <PanelTitle>Stores</PanelTitle>
        </PanelHeader>
        <PanelBody className="px-4 text-sm text-muted-foreground">Store list goes here.</PanelBody>
      </Panel>
      <Panel>
        <PanelHeader>
          <PanelTitle>Store detail</PanelTitle>
          <PanelActions>
            <Badge variant="secondary">Active</Badge>
          </PanelActions>
        </PanelHeader>
        <PanelBody className="px-4 text-sm text-muted-foreground">Selected store detail goes here.</PanelBody>
      </Panel>
    </PanelGroup>
  ),
}

export const PageHeaderExample: Story = {
  render: () => (
    <PageHeader
      title="Terminal devices"
      description="Manage POS devices across your stores"
      badges={<Badge variant="secondary">24 devices</Badge>}
    />
  ),
}
