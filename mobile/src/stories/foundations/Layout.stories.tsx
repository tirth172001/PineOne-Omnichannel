import type { Meta, StoryObj } from '@storybook/react-native';
import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

// M3 window size classes (breakpoints by window width, in dp).
const SIZE_CLASSES = [
  { name: 'Compact', min: 0, max: 599, example: 'Phone portrait', margin: 16, panes: 1 },
  { name: 'Medium', min: 600, max: 839, example: 'Tablet portrait, foldable', margin: 24, panes: 1 },
  { name: 'Expanded', min: 840, max: 1199, example: 'Tablet landscape', margin: 24, panes: 2 },
  { name: 'Large', min: 1200, max: 1599, example: 'Desktop', margin: 24, panes: 2 },
  { name: 'Extra-large', min: 1600, max: Infinity, example: 'Ultra-wide', margin: 24, panes: 2 },
] as const;

// Our own spacing scale (MD3 leaves spacing to the app, but asks for a 4dp grid).
const SPACING_SCALE = [4, 8, 12, 16, 20, 24, 32, 40, 48] as const;

function SizeClassesDemo() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const current = SIZE_CLASSES.find((c) => width >= c.min && width <= c.max);

  return (
    <View style={{ gap: 12 }}>
      <Text variant="bodyMedium">
        This window is {Math.round(width)}dp wide: <Text variant="labelLarge">{current?.name}</Text>
      </Text>
      {SIZE_CLASSES.map((c) => {
        const active = c.name === current?.name;
        return (
          <View
            key={c.name}
            style={[
              styles.classRow,
              {
                backgroundColor: active ? theme.colors.secondaryContainer : theme.colors.surface,
                borderColor: theme.colors.outlineVariant,
              },
            ]}>
            <Text variant="titleSmall" style={{ width: 96 }}>
              {c.name}
            </Text>
            <View style={{ flex: 1 }}>
              <Text variant="bodySmall">
                {c.max === Infinity ? `${c.min}dp+` : `${c.min}–${c.max}dp`} · {c.example}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {c.margin}dp margins · {c.panes} pane{c.panes > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function SpacingDemo() {
  const theme = useTheme();

  return (
    <View style={{ gap: 8 }}>
      {SPACING_SCALE.map((value) => (
        <View key={value} style={styles.spacingRow}>
          <Text variant="labelMedium" style={{ width: 40 }}>
            {value}
          </Text>
          <View style={{ width: value * 4, height: 16, borderRadius: 2, backgroundColor: theme.colors.primary }} />
        </View>
      ))}
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        Screen margins 16dp on compact. 16dp padding inside cards, 8–12dp between related items, and 24dp between
        sections.
      </Text>
    </View>
  );
}

function Pane({ label, flex = 1, children }: { label: string; flex?: number; children?: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.pane, { flex, backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

function CanonicalLayoutsDemo() {
  const theme = useTheme();
  const frame = [styles.frame, { backgroundColor: theme.colors.background, borderColor: theme.colors.outline }];

  return (
    <View style={{ gap: 20 }}>
      <View style={{ gap: 6 }}>
        <Text variant="titleSmall">List-detail</Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Transactions list + selected transaction. On compact, the detail opens as its own screen.
        </Text>
        <View style={frame}>
          <Pane label="List" flex={2} />
          <Pane label="Detail" flex={3} />
        </View>
      </View>
      <View style={{ gap: 6 }}>
        <Text variant="titleSmall">Supporting pane</Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Report + filters/summary. On compact, the supporting pane becomes a bottom sheet.
        </Text>
        <View style={frame}>
          <Pane label="Primary" flex={2} />
          <Pane label="Supporting" flex={1} />
        </View>
      </View>
      <View style={{ gap: 6 }}>
        <Text variant="titleSmall">Feed</Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          A grid of equal cards (e.g. Overview stat cards). 1 column on compact, 2–4 on wider windows.
        </Text>
        <View style={[frame, { flexWrap: 'wrap' }]}>
          {[1, 2, 3, 4].map((n) => (
            <View key={n} style={{ width: '48%', height: 44 }}>
              <Pane label={`Card ${n}`} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const meta = {
  title: 'Foundations/Layout',
  component: SizeClassesDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: design for window size classes rather than specific devices. PineOne targets Compact (phones) today. Use a 4dp grid for spacing, and when wider windows are supported, change layout with one of the canonical patterns (list-detail, supporting pane, feed) instead of stretching the phone layout.',
      },
    },
  },
} satisfies Meta<typeof SizeClassesDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WindowSizeClasses: Story = {};

export const Spacing: Story = {
  render: () => <SpacingDemo />,
};

export const CanonicalLayouts: Story = {
  render: () => <CanonicalLayoutsDemo />,
};

const styles = StyleSheet.create({
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  spacingRow: { flexDirection: 'row', alignItems: 'center' },
  frame: { flexDirection: 'row', gap: 8, padding: 8, borderRadius: 12, borderWidth: 1, height: 140 },
  pane: { borderRadius: 8, padding: 8, borderWidth: StyleSheet.hairlineWidth, flex: 1 },
});
