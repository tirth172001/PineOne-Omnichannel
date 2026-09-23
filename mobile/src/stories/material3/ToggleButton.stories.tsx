import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { ToggleButton } from 'react-native-paper';

function ToggleButtonDemo() {
  const [value, setValue] = useState('list');

  return (
    <ToggleButton.Row onValueChange={setValue} value={value}>
      <ToggleButton icon="rows" value="list" />
      <ToggleButton icon="squares-four" value="grid" />
    </ToggleButton.Row>
  );
}

const meta = {
  title: 'Material3/ToggleButton',
  component: ToggleButtonDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: for view/display mode switches (list vs. grid, chart type) where options are mutually exclusive and always visible together. For 2-3 text-labeled options describing content itself (Today/This week), prefer SegmentedButtons instead.',
      },
    },
  },
} satisfies Meta<typeof ToggleButtonDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
