import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { ORGANISATIONS } from '@/data/businesses';
import { CHANNEL_OPTIONS } from '@/data/overview';

import { type BusinessScope, BusinessSwitcher } from './business-switcher';

function BusinessSwitcherDemo() {
  const [visible, setVisible] = useState(true);
  const [scope, setScope] = useState<BusinessScope>({ shopIds: [], channel: 'all' });
  const organisation = ORGANISATIONS[0];
  const stores = scope.shopIds.length === 0 ? 'All stores' : `${scope.shopIds.length} store(s)`;

  return (
    <View style={{ gap: 12, alignItems: 'flex-start' }}>
      <Text variant="bodyMedium">
        {organisation.name} · {stores} · {CHANNEL_OPTIONS.find((option) => option.value === scope.channel)?.label}
      </Text>
      <Button mode="outlined" onPress={() => setVisible(true)}>
        Open switcher
      </Button>
      <BusinessSwitcher visible={visible} onDismiss={() => setVisible(false)} shops={organisation.shops} scope={scope} onApply={setScope} />
    </View>
  );
}

const meta = {
  title: 'PineOne/BusinessSwitcher',
  component: BusinessSwitcherDemo,
  parameters: {
    docs: {
      description: {
        component:
          'The app-wide scope switcher, opened from the header: channel (all, in-store, online) and any combination of stores (or all), applied together. The organisation is switched from Account settings. Pages have no store or channel filters of their own.',
      },
    },
  },
} satisfies Meta<typeof BusinessSwitcherDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
