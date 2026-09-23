import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { FAB } from 'react-native-paper';

function FABMenuDemo() {
  const [open, setOpen] = useState(false);

  return (
    // No Portal: keeps the menu (and its scrim) inside this preview area rather
    // than covering the whole Storybook UI.
    <View style={{ height: 400 }}>
      <FAB.Group
        open={open}
        visible
        icon={open ? 'x' : 'plus'}
        onStateChange={({ open: next }) => setOpen(next)}
        actions={[
          { icon: 'link-simple', label: 'Payment link', onPress: () => {} },
          { icon: 'qr-code', label: 'QR code', onPress: () => {} },
          { icon: 'receipt', label: 'Invoice', onPress: () => {} },
        ]}
      />
    </View>
  );
}

const meta = {
  title: 'Material3/FABMenu',
  component: FABMenuDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: a FAB that opens 2–6 related "create" actions, used when the screen’s main action has a few variants ("new payment link / QR / invoice"). Every action needs a label. If there’s only one action, use a plain FAB.',
      },
    },
  },
} satisfies Meta<typeof FABMenuDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
