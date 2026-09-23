import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { Drawer } from 'react-native-paper';

function DrawerDemo() {
  const [active, setActive] = useState('overview');

  return (
    <Drawer.Section title="PineOne">
      <Drawer.Item
        label="Overview"
        icon="house"
        active={active === 'overview'}
        onPress={() => setActive('overview')}
      />
      <Drawer.Item
        label="Payments"
        icon="wallet"
        active={active === 'payments'}
        onPress={() => setActive('payments')}
      />
      <Drawer.Item
        label="Reports"
        icon="file-text"
        active={active === 'reports'}
        onPress={() => setActive('reports')}
      />
    </Drawer.Section>
  );
}

const meta = {
  title: 'Material3/Drawer',
  component: DrawerDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: top-level navigation when there are too many destinations for a bottom nav bar (5 max) — typically 6+ sections, or nested/secondary navigation reached from "More". Not a fit here today (we use a 5-tab bottom nav), but relevant once More’s catch-all list (ticket 07) grows enough to need its own drill-down navigation.',
      },
    },
  },
} satisfies Meta<typeof DrawerDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
