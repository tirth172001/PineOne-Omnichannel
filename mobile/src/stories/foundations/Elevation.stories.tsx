import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';

const LEVELS = [
  { level: 0, dp: 0, usage: 'Flat cards, lists' },
  { level: 1, dp: 1, usage: 'Elevated card, modal sheet, banner' },
  { level: 2, dp: 3, usage: 'Nav bar, menu, scrolled top app bar' },
  { level: 3, dp: 6, usage: 'FAB, dialog, search, date picker' },
  { level: 4, dp: 8, usage: 'Hover/focus on level 3' },
  { level: 5, dp: 12, usage: 'Dragged / pressed on level 3' },
] as const;

function ElevationDemo() {
  const theme = useTheme();

  return (
    <View style={styles.grid}>
      {LEVELS.map(({ level, dp, usage }) => (
        <Surface key={level} elevation={level} style={styles.surface}>
          <Text variant="titleSmall">Level {level}</Text>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {dp}dp
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {usage}
          </Text>
        </Surface>
      ))}
    </View>
  );
}

const meta = {
  title: 'Foundations/Elevation',
  component: ElevationDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: elevation is shown with a tonal surface tint (our primary green, see paper-theme.ts) plus a shadow, and should only be used to separate overlapping layers: menus, sheets, dialogs, FABs. PineOne’s cards are deliberately flat (level 0) on the grey background per the Figma reference, so don’t add elevation to show hierarchy on the page.',
      },
    },
  },
} satisfies Meta<typeof ElevationDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Levels: Story = {};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, padding: 8 },
  surface: { width: 150, height: 110, borderRadius: 12, padding: 12, gap: 2 },
});
