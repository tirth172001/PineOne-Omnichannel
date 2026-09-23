import Slider from '@react-native-community/slider';
import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

// Paper has no Slider, so this uses @react-native-community/slider (bundled in
// Expo Go) tinted with M3 roles: primary for the active track and thumb,
// secondaryContainer for the inactive track.
function ContinuousSliderDemo() {
  const theme = useTheme();
  const [value, setValue] = useState(5000);

  return (
    <View style={{ gap: 4 }}>
      <Text variant="labelLarge">Auto-approve refunds up to ₹{value.toLocaleString('en-IN')}</Text>
      <Slider
        minimumValue={0}
        maximumValue={20000}
        value={value}
        onValueChange={(v) => setValue(Math.round(v))}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.secondaryContainer}
        thumbTintColor={theme.colors.primary}
      />
    </View>
  );
}

function DiscreteSliderDemo() {
  const theme = useTheme();
  const [value, setValue] = useState(2);

  return (
    <View style={{ gap: 4 }}>
      <Text variant="labelLarge">Settlement retry attempts: {value}</Text>
      <Slider
        minimumValue={0}
        maximumValue={5}
        step={1}
        value={value}
        onValueChange={setValue}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.secondaryContainer}
        thumbTintColor={theme.colors.primary}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12 }}>
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <Text key={n} variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {n}
          </Text>
        ))}
      </View>
    </View>
  );
}

const meta = {
  title: 'Material3/Slider',
  component: ContinuousSliderDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: for choosing a value from a range where the approximate position matters more than the exact number (limits, thresholds). Always show the current value. Use discrete steps for a small set of values. When the user needs an exact amount (e.g. a refund value), use a text field.',
      },
    },
  },
} satisfies Meta<typeof ContinuousSliderDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Continuous: Story = {};

export const Discrete: Story = {
  render: () => <DiscreteSliderDemo />,
};
