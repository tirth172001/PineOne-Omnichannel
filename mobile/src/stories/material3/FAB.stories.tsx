import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { FAB } from 'react-native-paper';

// FAB's props are a discriminated union (variant/label combinations) that TS
// struggles to infer through Meta<typeof FAB> + separate `args` story objects —
// plain demo wrapper components instead, same pattern as the other stories here.
function StandardFAB() {
  return (
    <View style={{ height: 120, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
      <FAB icon="plus" onPress={() => {}} />
    </View>
  );
}

function ExtendedFAB() {
  return (
    <View style={{ height: 120, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
      <FAB icon="plus" label="New payment link" onPress={() => {}} />
    </View>
  );
}

const meta = {
  title: 'Material3/FAB',
  component: StandardFAB,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: one FAB per screen, for that screen’s single most important, forward-moving action (e.g. "new payment link", "compose"). Never use it for a secondary or destructive action, and don’t pair it with a bottom nav tab that already represents the same action.',
      },
    },
  },
} satisfies Meta<typeof StandardFAB>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Extended: StoryObj<typeof ExtendedFAB> = {
  render: () => <ExtendedFAB />,
};
