import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { IconButton, Tooltip } from 'react-native-paper';

function TooltipDemo() {
  return (
    <View style={{ paddingTop: 24, alignItems: 'flex-start' }}>
      <Tooltip title="Deductions include gateway and platform fees">
        <IconButton icon="info" onPress={() => {}} />
      </Tooltip>
    </View>
  );
}

const meta = {
  title: 'Material3/Tooltip',
  component: TooltipDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: a short clarification for an icon-only or ambiguous control, shown on long-press on touch devices. Never put essential information only in a tooltip — touch users may never discover it; label the control directly when the info matters.',
      },
    },
  },
} satisfies Meta<typeof TooltipDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
