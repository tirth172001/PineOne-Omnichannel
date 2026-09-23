import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { ORGANISATIONS } from '@/data/businesses';

import { BusinessSwitcher } from './business-switcher';

function BusinessSwitcherDemo() {
  const [visible, setVisible] = useState(true);
  const [organisationId, setOrganisationId] = useState(ORGANISATIONS[0].id);
  const organisation = ORGANISATIONS.find((org) => org.id === organisationId) ?? ORGANISATIONS[0];
  const [shopId, setShopId] = useState(organisation.shops[0].id);
  const shop = organisation.shops.find((s) => s.id === shopId) ?? organisation.shops[0];

  return (
    <View style={{ gap: 12, alignItems: 'flex-start' }}>
      <Text variant="bodyMedium">
        {organisation.name} · {shop.name}
      </Text>
      <Button mode="outlined" onPress={() => setVisible(true)}>
        Open switcher
      </Button>
      <BusinessSwitcher
        visible={visible}
        onDismiss={() => setVisible(false)}
        organisations={ORGANISATIONS}
        organisation={organisation}
        shopIds={[shop.id]}
        onSelectOrganisation={(id) => {
          const next = ORGANISATIONS.find((org) => org.id === id) ?? ORGANISATIONS[0];
          setOrganisationId(next.id);
          setShopId(next.shops[0].id);
        }}
        onSelectShop={setShopId}
        onSelectAllShops={() => setShopId(organisation.shops[0].id)}
      />
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
          'Org/shop switcher, opened from the app header. Choosing an organisation keeps the sheet open to pick a shop, and choosing a shop applies it and closes the sheet.',
      },
    },
  },
} satisfies Meta<typeof BusinessSwitcherDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
