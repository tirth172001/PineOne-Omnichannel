import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

import { Tabs, type TabItem } from '@/components/material3/tabs';

const PAYMENT_TABS: TabItem[] = [
  { key: 'transactions', label: 'Transactions' },
  { key: 'settlements', label: 'Settlements' },
  { key: 'refunds', label: 'Refunds', badge: 3 },
];

const ICON_TABS: TabItem[] = [
  { key: 'online', label: 'Online', icon: 'globe' },
  { key: 'instore', label: 'In-store', icon: 'storefront' },
  { key: 'links', label: 'Links', icon: 'link-simple' },
];

const SCROLL_TABS: TabItem[] = [
  'All',
  'UPI',
  'Cards',
  'Netbanking',
  'Wallets',
  'EMI',
  'Pay later',
].map((label) => ({ key: label, label }));

function TabsDemo({ tabs, variant, scrollable }: { tabs: TabItem[]; variant?: 'primary' | 'secondary'; scrollable?: boolean }) {
  const [active, setActive] = useState(tabs[0].key);

  return (
    <View>
      <Tabs tabs={tabs} activeKey={active} onChange={setActive} variant={variant} scrollable={scrollable} />
      <View style={{ padding: 16 }}>
        <Text variant="bodyMedium">{tabs.find((t) => t.key === active)?.label} content</Text>
      </View>
    </View>
  );
}

const meta = {
  title: 'Material3/Tabs',
  component: TabsDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: switch between related views at the same level, such as the Payments sub-tabs (Transactions / Settlements / Refunds). Primary tabs sit under the top app bar. Secondary tabs go inside a content area, one level lower. Use scrollable tabs when labels don’t fit at equal widths. Built in-house (src/components/material3/tabs.tsx).',
      },
    },
  },
  args: { tabs: PAYMENT_TABS },
} satisfies Meta<typeof TabsDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary' } };

export const PrimaryWithIcons: Story = { args: { variant: 'primary', tabs: ICON_TABS } };

export const Secondary: Story = { args: { variant: 'secondary' } };

export const Scrollable: Story = { args: { variant: 'primary', tabs: SCROLL_TABS, scrollable: true } };
