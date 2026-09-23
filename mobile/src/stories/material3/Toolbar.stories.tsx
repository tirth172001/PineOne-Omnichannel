import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { FAB, IconButton, Text, useTheme } from 'react-native-paper';

import { Toolbar, toolbarItemRadius } from '@/components/material3/toolbar';

function DockedDemo({ colorScheme }: { colorScheme?: 'standard' | 'vibrant' }) {
  return (
    <Toolbar variant="docked" colorScheme={colorScheme}>
      <IconButton style={{ borderRadius: toolbarItemRadius('docked') }} icon="funnel-simple" onPress={() => {}} accessibilityLabel="Filter" />
      <IconButton style={{ borderRadius: toolbarItemRadius('docked') }} icon="sort-ascending" onPress={() => {}} accessibilityLabel="Sort" />
      <IconButton style={{ borderRadius: toolbarItemRadius('docked') }} icon="download-simple" onPress={() => {}} accessibilityLabel="Download" />
      <IconButton style={{ borderRadius: toolbarItemRadius('docked') }} icon="share-network" onPress={() => {}} accessibilityLabel="Share" />
    </Toolbar>
  );
}

function FloatingDemo({ colorScheme }: { colorScheme?: 'standard' | 'vibrant' }) {
  const theme = useTheme();

  return (
    <View style={{ height: 240, justifyContent: 'flex-end', backgroundColor: theme.colors.background, paddingBottom: 16 }}>
      <View style={{ position: 'absolute', top: 16, left: 16, right: 16 }}>
        <Text variant="bodyMedium">Transaction receipt TXN-88213</Text>
      </View>
      <Toolbar
        variant="floating"
        colorScheme={colorScheme}
        trailing={<FAB icon="paper-plane-right" onPress={() => {}} accessibilityLabel="Send receipt" />}>
        <IconButton style={{ borderRadius: toolbarItemRadius('floating') }} icon="copy" onPress={() => {}} accessibilityLabel="Copy" />
        <IconButton style={{ borderRadius: toolbarItemRadius('floating') }} icon="printer" onPress={() => {}} accessibilityLabel="Print" />
        <IconButton style={{ borderRadius: toolbarItemRadius('floating') }} icon="download-simple" onPress={() => {}} accessibilityLabel="Download" />
      </Toolbar>
    </View>
  );
}

const meta = {
  title: 'Material3/Toolbar',
  component: DockedDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 Expressive guidance: holds a few contextual actions for the current page, and replaces the old bottom app bar. The docked toolbar spans the bottom edge. The floating toolbar hovers over content and can sit next to a FAB. Use vibrant colors for emphasis. Don’t mix toolbar actions with navigation destinations. Built in-house (src/components/material3/toolbar.tsx).',
      },
    },
  },
} satisfies Meta<typeof DockedDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Docked: Story = { args: { colorScheme: 'standard' } };

export const DockedVibrant: Story = { args: { colorScheme: 'vibrant' } };

export const Floating: Story = {
  render: () => <FloatingDemo />,
};

export const FloatingVibrant: Story = {
  render: () => <FloatingDemo colorScheme="vibrant" />,
};
