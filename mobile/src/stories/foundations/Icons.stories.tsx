import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Searchbar, Text, useTheme } from 'react-native-paper';

import { Shape } from '@/constants/shape';

// Phosphor icons (phosphoricons.com), grouped by how PineOne uses them. Every
// name must be registered in src/components/icons.tsx; append "-fill" for the
// filled weight.
const ICON_GROUPS = {
  Navigation: ['house', 'wallet', 'file-text', 'chat-circle', 'list', 'arrow-left', 'caret-right', 'caret-down', 'x', 'dots-three-vertical'],
  Actions: ['plus', 'magnifying-glass', 'funnel-simple', 'download-simple', 'share-network', 'pencil-simple', 'trash', 'copy', 'arrows-clockwise', 'paper-plane-right'],
  Payments: ['credit-card', 'bank', 'money', 'qr-code', 'receipt', 'arrow-counter-clockwise', 'link-simple', 'shopping-cart', 'storefront', 'cash-register'],
  Status: ['check', 'check-circle', 'warning-circle', 'info', 'clock', 'trend-up', 'trend-down', 'bell', 'shield-check', 'lock-simple'],
  Account: ['user-circle', 'users', 'briefcase', 'gear', 'question', 'sign-out'],
} as const;

const SIZES = [18, 20, 24, 40, 48] as const;

function IconLibraryDemo() {
  const theme = useTheme();
  const [query, setQuery] = useState('');

  return (
    <View style={{ gap: 16 }}>
      <Searchbar
        placeholder="Filter icons"
        icon="magnifying-glass"
        clearIcon="x"
        value={query}
        onChangeText={setQuery}
        style={{ borderRadius: Shape.max }}
      />
      {Object.entries(ICON_GROUPS).map(([group, names]) => {
        const visible = names.filter((name) => name.includes(query.trim().toLowerCase()));
        if (visible.length === 0) return null;
        return (
          <View key={group} style={{ gap: 8 }}>
            <Text variant="labelLarge">{group}</Text>
            <View style={styles.grid}>
              {visible.map((name) => (
                <View key={name} style={styles.cell}>
                  <Icon source={name} size={24} color={theme.colors.onSurface} />
                  <Text variant="labelSmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant, fontSize: 9 }}>
                    {name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function IconSizesDemo() {
  const theme = useTheme();

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.sizeRow}>
        {SIZES.map((size) => (
          <View key={size} style={{ alignItems: 'center', gap: 4 }}>
            <Icon source="wallet" size={size} color={theme.colors.onSurface} />
            <Text variant="labelSmall">{size}dp</Text>
          </View>
        ))}
      </View>
      <View style={styles.sizeRow}>
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Icon source="house" size={24} color={theme.colors.onSurfaceVariant} />
          <Text variant="labelSmall">Regular: inactive</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Icon source="house-fill" size={24} color={theme.colors.onSecondaryContainer} />
          <Text variant="labelSmall">Filled: active</Text>
        </View>
      </View>
    </View>
  );
}

const meta = {
  title: 'Foundations/Icons',
  component: IconLibraryDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: 24dp is the default icon size, with a 48dp minimum touch target around any tappable icon. PineOne uses Phosphor icons: the regular weight by default, switching to the fill weight (name + "-fill") to show selected or active state (e.g. the active nav destination). Use the onSurface/onSurfaceVariant color roles, and never color an icon with the brand color just for decoration.',
      },
    },
  },
} satisfies Meta<typeof IconLibraryDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Library: Story = {};

export const SizesAndStates: Story = {
  render: () => <IconSizesDemo />,
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  cell: { width: 72, height: 64, alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 2 },
  sizeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' },
});
