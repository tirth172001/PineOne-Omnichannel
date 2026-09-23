import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { Button } from 'react-native-paper';

function AllButtonsDemo() {
  return (
    <View style={{ gap: 12, alignItems: 'flex-start' }}>
      <Button mode="contained" onPress={() => {}}>
        Filled
      </Button>
      <Button mode="contained-tonal" onPress={() => {}}>
        Filled tonal
      </Button>
      <Button mode="elevated" onPress={() => {}}>
        Elevated
      </Button>
      <Button mode="outlined" onPress={() => {}}>
        Outlined
      </Button>
      <Button mode="text" onPress={() => {}}>
        Text
      </Button>
      <Button mode="contained" icon="download-simple" onPress={() => {}}>
        With icon
      </Button>
      <Button mode="contained" loading onPress={() => {}}>
        Loading
      </Button>
      <Button mode="contained" disabled onPress={() => {}}>
        Disabled
      </Button>
    </View>
  );
}

const meta = {
  title: 'Material3/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: pick the button by how much emphasis the action needs. Filled is for the single primary action on a screen ("Create payment link"). Tonal is a strong secondary action. Outlined is for important but not primary actions. Text is for low-emphasis actions such as dialog buttons and "View all". Elevated is only for when a button needs to stand out from a patterned or image background. Use one filled button per area.',
      },
    },
  },
  args: { children: 'Create payment link', onPress: () => {} },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Filled: Story = { args: { mode: 'contained' } };

export const Tonal: Story = { args: { mode: 'contained-tonal' } };

export const Elevated: Story = { args: { mode: 'elevated' } };

export const Outlined: Story = { args: { mode: 'outlined' } };

export const Text: Story = { args: { mode: 'text', children: 'View all' } };

export const WithIcon: Story = { args: { mode: 'contained', icon: 'plus' } };

export const AllVariants: Story = {
  render: () => <AllButtonsDemo />,
};
