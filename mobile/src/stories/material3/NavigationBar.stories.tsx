import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';

import { NavigationBar, type NavigationBarDestination } from '@/components/material3/navigation-bar';

const DESTINATIONS: NavigationBarDestination[] = [
  { key: 'overview', label: 'Overview', icon: 'house', focusedIcon: 'house-fill' },
  { key: 'payments', label: 'Payments', icon: 'wallet', focusedIcon: 'wallet-fill' },
  { key: 'reports', label: 'Reports', icon: 'file', focusedIcon: 'file-fill' },
  { key: 'support', label: 'Support', icon: 'chat-centered-text', focusedIcon: 'chat-centered-text-fill', badge: 2 },
  { key: 'more', label: 'More', icon: 'list', focusedIcon: 'list' },
];

function NavigationBarDemo() {
  const [active, setActive] = useState('payments');
  return <NavigationBar destinations={DESTINATIONS} activeKey={active} onChange={setActive} respectSafeArea={false} />;
}

const meta = {
  title: 'Material3/NavigationBar',
  component: NavigationBarDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: bottom navigation between 3–5 top-level destinations on compact windows, and the bar PineOne’s app shell uses. This is the 64dp M3 Expressive bar ("vertical items") from the Figma shell, built in-house (src/components/material3/navigation-bar.tsx) because Paper’s BottomNavigation.Bar is the older 80dp version. Always show labels, use a filled icon for the active destination, and add a badge for unread items. On medium or wider windows, switch to a navigation rail.',
      },
    },
  },
} satisfies Meta<typeof NavigationBarDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
