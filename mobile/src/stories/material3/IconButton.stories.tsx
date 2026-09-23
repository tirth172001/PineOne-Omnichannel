import type { Meta, StoryObj } from '@storybook/react-native';
import { IconButton } from 'react-native-paper';

const meta = {
  title: 'Material3/IconButton',
  component: IconButton,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: for a single, well-recognized icon-only action in a toolbar/header (notifications, close, back) — never for a primary action a user must discover, which needs a labeled Button. Standard for low-emphasis actions; filled/outlined variants raise emphasis or show selected state.',
      },
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: { icon: 'bell', onPress: () => {} },
};

export const Filled: Story = {
  args: { icon: 'bell', mode: 'contained', onPress: () => {} },
};

export const Outlined: Story = {
  args: { icon: 'bell', mode: 'outlined', onPress: () => {} },
};
