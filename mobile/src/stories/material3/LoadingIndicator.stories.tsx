import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

import { LoadingIndicator } from '@/components/material3/loading-indicator';

function LoadingIndicatorDemo() {
  return (
    <View style={{ flexDirection: 'row', gap: 32, alignItems: 'center' }}>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <LoadingIndicator />
        <Text variant="labelSmall">Default</Text>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <LoadingIndicator contained />
        <Text variant="labelSmall">Contained</Text>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <LoadingIndicator size={24} />
        <Text variant="labelSmall">24dp</Text>
      </View>
    </View>
  );
}

const meta = {
  title: 'Material3/LoadingIndicator',
  component: LoadingIndicatorDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 Expressive guidance: for short waits (under about 5s) where progress can’t be measured, such as pull-to-refresh or loading a card. Use the contained version on top of content. When progress can be measured or the wait is long, use a linear or circular progress indicator. Built in-house (src/components/material3/loading-indicator.tsx) as an approximation of the shape-morphing spec.',
      },
    },
  },
} satisfies Meta<typeof LoadingIndicatorDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
