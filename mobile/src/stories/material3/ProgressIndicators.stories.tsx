import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { ActivityIndicator, ProgressBar, Text } from 'react-native-paper';

function ProgressIndicatorsDemo() {
  return (
    <View style={{ gap: 16 }}>
      <View style={{ gap: 4 }}>
        <Text variant="labelSmall">Determinate (linear)</Text>
        <ProgressBar progress={0.6} />
      </View>
      <View style={{ gap: 4 }}>
        <Text variant="labelSmall">Indeterminate (linear)</Text>
        <ProgressBar indeterminate />
      </View>
      <View style={{ gap: 4 }}>
        <Text variant="labelSmall">Circular</Text>
        <ActivityIndicator animating size="large" />
      </View>
    </View>
  );
}

const meta = {
  title: 'Material3/ProgressIndicators',
  component: ProgressIndicatorsDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: determinate indicators when progress is known and quantifiable (uploads, multi-step forms); indeterminate when duration is unknown (initial data fetch). Prefer linear for in-context/inline loading, circular for a whole-screen or whole-section block.',
      },
    },
  },
} satisfies Meta<typeof ProgressIndicatorsDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
