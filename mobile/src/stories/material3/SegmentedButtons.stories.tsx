import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';

function SingleSelectDemo() {
  const [value, setValue] = useState('today');

  return (
    <SegmentedButtons
      value={value}
      onValueChange={setValue}
      buttons={[
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
      ]}
    />
  );
}

function MultiSelectDemo() {
  const [value, setValue] = useState<string[]>(['upi', 'card']);

  return (
    <View style={{ gap: 8 }}>
      <Text variant="labelMedium">Payment methods</Text>
      <SegmentedButtons
        multiSelect
        value={value}
        onValueChange={setValue}
        buttons={[
          { value: 'upi', label: 'UPI', showSelectedCheck: true },
          { value: 'card', label: 'Card', showSelectedCheck: true },
          { value: 'netbanking', label: 'Netbanking', showSelectedCheck: true },
        ]}
      />
    </View>
  );
}

function WithIconsDemo() {
  const [value, setValue] = useState('list');

  return (
    <SegmentedButtons
      value={value}
      onValueChange={setValue}
      buttons={[
        { value: 'list', icon: 'list-bullets', label: 'List' },
        { value: 'chart', icon: 'chart-bar', label: 'Chart' },
      ]}
    />
  );
}

const meta = {
  title: 'Material3/SegmentedButtons',
  component: SingleSelectDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: for switching between 2–5 closely related options or views, such as a date range or list vs chart. Use single-select to change a view and multi-select to toggle filters. Don’t use them for navigation between screens (use tabs) or for actions (use buttons).',
      },
    },
  },
} satisfies Meta<typeof SingleSelectDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SingleSelect: Story = {};

export const MultiSelect: Story = {
  render: () => <MultiSelectDemo />,
};

export const WithIcons: Story = {
  render: () => <WithIconsDemo />,
};
