import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { ORGANISATIONS } from '@/data/businesses';

import { HeaderControl, PageTitle } from './page-header';
import { NavigationBar, type NavigationBarDestination } from './material3/navigation-bar';
import { ScreenTabs } from './screen-tabs';

const DESTINATIONS: NavigationBarDestination[] = [
  { key: 'overview', label: 'Overview', icon: 'house', focusedIcon: 'house-fill' },
  { key: 'payments', label: 'Payments', icon: 'wallet', focusedIcon: 'wallet-fill' },
  { key: 'settlements', label: 'Settlements', icon: 'bank', focusedIcon: 'bank-fill' },
  { key: 'refunds', label: 'Refunds', icon: 'arrow-u-up-left', focusedIcon: 'arrow-u-up-left-fill' },
  { key: 'more', label: 'More', icon: 'list', focusedIcon: 'list' },
];

const PAYMENT_TABS = [
  { key: 'transactions', label: 'Transactions' },
  { key: 'settlements', label: 'Settlements' },
  { key: 'refunds', label: 'Refunds' },
];

/** The whole shell as in Figma 47:2153: header, sub-tabs (Payments), empty content, nav bar. */
function AppShellDemo() {
  const theme = useTheme();
  const [destination, setDestination] = useState('payments');
  const [tab, setTab] = useState('settlements');
  const org = ORGANISATIONS[0];

  return (
    <View style={{ height: 640, backgroundColor: theme.colors.background, margin: -16 }}>
      <View style={{ padding: 16, gap: 8 }}>
        <View style={{ flexDirection: 'row' }}>
          <HeaderControl icon="storefront" label={`In-store · ${org.shops[0].name}`} caret accessibilityLabel="Switch store or channel" />
        </View>
        <PageTitle title="Payments" />
      </View>
      {destination === 'payments' ? <ScreenTabs tabs={PAYMENT_TABS} activeKey={tab} onChange={setTab} /> : null}
      <View style={{ flex: 1 }} />
      <NavigationBar destinations={DESTINATIONS} activeKey={destination} onChange={setDestination} respectSafeArea={false} />
    </View>
  );
}

const meta = {
  title: 'PineOne/AppShell',
  component: AppShellDemo,
  parameters: {
    docs: {
      description: {
        component:
          'The app shell: the page header (store / channel switcher and large title, see PageHeader), optional screen sub-tabs, content area, and the M3 Expressive navigation bar.',
      },
    },
  },
} satisfies Meta<typeof AppShellDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Payments: Story = {};
