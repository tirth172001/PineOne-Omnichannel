import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import type { ComponentType } from "react"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./resizable"

// react-resizable-panels' `GroupProps` type doesn't resolve cleanly against this
// repo's installed version (a pre-existing, unrelated TS error — see baseline),
// which breaks Storybook's Meta/StoryObj inference too. Widen for story typing
// only; the real component still renders with its real props.
const ResizablePanelGroupForStory = ResizablePanelGroup as ComponentType<{
  direction: "horizontal" | "vertical"
  className?: string
  children?: React.ReactNode
}>

const meta = {
  title: "UI/Resizable",
  component: ResizablePanelGroupForStory,
  tags: ["autodocs"],
} satisfies Meta<typeof ResizablePanelGroupForStory>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    direction: "horizontal",
    className: "h-48 w-96 rounded-lg border",
  },
  render: (args) => (
    <ResizablePanelGroup {...args}>
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Filters</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Results</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}
