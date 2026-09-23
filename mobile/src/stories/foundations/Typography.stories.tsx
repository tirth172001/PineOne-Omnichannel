import type { Meta, StoryObj } from '@storybook/react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';

const TYPESCALE = [
  ['displayLarge', 'Display'],
  ['displayMedium', 'Display'],
  ['displaySmall', 'Display'],
  ['headlineLarge', 'Headline'],
  ['headlineMedium', 'Headline'],
  ['headlineSmall', 'Headline'],
  ['titleLarge', 'Title'],
  ['titleMedium', 'Title'],
  ['titleSmall', 'Title'],
  ['bodyLarge', 'Body'],
  ['bodyMedium', 'Body'],
  ['bodySmall', 'Body'],
  ['labelLarge', 'Label'],
  ['labelMedium', 'Label'],
  ['labelSmall', 'Label'],
] as const;

function TypescaleDemo() {
  const theme = useTheme();

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
      {TYPESCALE.map(([variant, group], index) => {
        const font = theme.fonts[variant];
        return (
          <View key={variant}>
            {index > 0 && TYPESCALE[index - 1][1] !== group ? <Divider style={styles.divider} /> : null}
            <View style={styles.row}>
              <Text variant={variant} numberOfLines={1}>
                {variant}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {font.fontFamily} · {font.fontSize}/{font.lineHeight} · tracking {font.letterSpacing}
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

function HierarchyDemo() {
  const theme = useTheme();

  return (
    <View style={{ gap: 8 }}>
      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        Total payout
      </Text>
      <Text variant="headlineMedium">₹10,00,000</Text>
      <Text variant="bodyMedium">Net after gateway and platform deductions for 23 Sep 2026.</Text>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        Settles to HDFC ••4821 by 6 PM
      </Text>
    </View>
  );
}

const meta = {
  title: 'Foundations/Typography',
  component: TypescaleDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: 15 roles in 5 groups. Display for short hero numbers, Headline for screen-level headings, Title for card/section headings, Body for running text, Label for buttons, chips, and captions. Always set type with <Text variant="…"> instead of raw font sizes, so the whole app changes together when the scale changes.',
      },
    },
  },
} satisfies Meta<typeof TypescaleDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TypeScale: Story = {};

export const Hierarchy: Story = {
  render: () => <HierarchyDemo />,
};

const styles = StyleSheet.create({
  row: { paddingVertical: 6, gap: 2 },
  divider: { marginVertical: 8 },
});
