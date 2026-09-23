import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { FAB, IconButton, Text, useTheme } from 'react-native-paper';

import { NavigationRail, type NavigationRailDestination } from '@/components/material3/navigation-rail';

const DESTINATIONS: NavigationRailDestination[] = [
  { key: 'overview', label: 'Overview', icon: 'house', focusedIcon: 'house-fill' },
  { key: 'payments', label: 'Payments', icon: 'wallet', focusedIcon: 'wallet-fill' },
  { key: 'reports', label: 'Reports', icon: 'file-text', focusedIcon: 'file-text-fill' },
  { key: 'support', label: 'Support', icon: 'chat-circle', focusedIcon: 'chat-circle-fill', badge: 2 },
  { key: 'more', label: 'More', icon: 'list', focusedIcon: 'list', badge: true },
];

function NavigationRailDemo() {
  const theme = useTheme();
  const [active, setActive] = useState('overview');

  return (
    <View style={{ flexDirection: 'row', height: 420, backgroundColor: theme.colors.background }}>
      <NavigationRail
        destinations={DESTINATIONS}
        activeKey={active}
        onChange={setActive}
        header={
          <>
            <IconButton icon="sidebar-simple" onPress={() => {}} accessibilityLabel="Open navigation drawer" />
            <FAB icon="plus" size="small" mode="flat" onPress={() => {}} accessibilityLabel="New payment link" />
          </>
        }
      />
      <View style={{ flex: 1, padding: 24 }}>
        <Text variant="headlineSmall">{DESTINATIONS.find((d) => d.key === active)?.label}</Text>
      </View>
    </View>
  );
}

const meta = {
  title: 'Material3/NavigationRail',
  component: NavigationRailDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: side navigation for medium and expanded windows (tablets, foldables, landscape) that holds the same 3–7 destinations as the bottom navigation bar, with an optional menu button and FAB at the top. PineOne is phone-only today, so this is for future tablet support. Built in-house (src/components/material3/navigation-rail.tsx).',
      },
    },
  },
} satisfies Meta<typeof NavigationRailDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
