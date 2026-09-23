import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Menu } from 'react-native-paper';

function MenuDemo() {
  const [visible, setVisible] = useState(true);

  return (
    <View style={{ paddingTop: 40, alignItems: 'flex-start' }}>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={<Button onPress={() => setVisible(true)}>Filter by channel</Button>}>
        <Menu.Item onPress={() => setVisible(false)} title="Online payments" />
        <Menu.Item onPress={() => setVisible(false)} title="Offline payments" />
        <Menu.Item onPress={() => setVisible(false)} title="Payment links" />
      </Menu>
    </View>
  );
}

const meta = {
  title: 'Material3/Menu',
  component: MenuDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: menus are for a short list of related actions or filters anchored to the control that opened them. For more than ~8 options, or options that need search, prefer a full list screen or bottom sheet instead.',
      },
    },
  },
} satisfies Meta<typeof MenuDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
