import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { concentric, MIN_RADIUS, Shape } from '@/constants/shape';

const SCALE = [
  { name: 'Extra small', radius: Shape.extraSmall, usage: 'Minimum for any container; most nested controls' },
  { name: 'Small', radius: Shape.small, usage: 'Sub-tab press areas, connected button inner corners' },
  { name: 'Medium / max', radius: Shape.max, usage: 'Every top-level container: top bar, nav bar, cards, sheets, dialogs' },
] as const;

function ShapeScaleDemo() {
  const theme = useTheme();

  return (
    <View style={styles.grid}>
      {SCALE.map(({ name, radius, usage }) => (
        <View key={name} style={styles.item}>
          <View style={[styles.shape, { borderRadius: radius, backgroundColor: theme.colors.primaryContainer }]} />
          <Text variant="labelLarge">{name}</Text>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {radius}dp
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            {usage}
          </Text>
        </View>
      ))}
    </View>
  );
}

// Three levels of nesting, each derived from its parent with concentric().
const OUTER = Shape.max;
const GAP = 4;
const MIDDLE = concentric(OUTER, GAP);
const INNER = concentric(MIDDLE, GAP);

function ConcentricDemo() {
  const theme = useTheme();
  const box = (radius: number, backgroundColor: string) => ({ borderRadius: radius, backgroundColor, padding: GAP });

  return (
    <View style={{ gap: 16 }}>
      <Text variant="bodyMedium">
        inner radius = outer radius − gap. Never above {Shape.max}dp or below {MIN_RADIUS}dp, and never more than half the element’s height.
      </Text>
      <View style={[box(OUTER, theme.colors.secondaryContainer), { alignSelf: 'flex-start' }]}>
        <View style={box(MIDDLE, theme.colors.surface)}>
          <View style={[box(INNER, theme.colors.primaryContainer), styles.innermost]}>
            <Text variant="labelMedium">
              {OUTER} → {MIDDLE} → {INNER}dp
            </Text>
          </View>
        </View>
      </View>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        App shell: top bar {Shape.max}dp → header slots {concentric(Shape.max, 12, 40)}dp → image tiles{' '}
        {concentric(concentric(Shape.max, 12, 40), 4, 32)}dp. Nav bar {Shape.max}dp → items{' '}
        {concentric(Shape.max, 0, 64)}dp → indicator {concentric(concentric(Shape.max, 0, 64), 6, 32)}dp.
      </Text>
    </View>
  );
}

const meta = {
  title: 'Foundations/Shape',
  component: ShapeScaleDemo,
  parameters: {
    docs: {
      description: {
        component:
          'PineOne rule: every container is rounded, no radius is larger than 12dp, and nested containers are concentric, so an inner radius is the outer radius minus the gap between them. The rule always wins over a one-off design value. Use Shape.max for top-level containers, and derive every nested radius with concentric() from src/constants/shape.ts. Containers attached to a screen edge round only their content-facing corners.',
      },
    },
  },
} satisfies Meta<typeof ShapeScaleDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Scale: Story = {};

export const Concentric: Story = {
  render: () => <ConcentricDemo />,
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  item: { width: 120, alignItems: 'center', gap: 4 },
  shape: { width: 88, height: 88, marginBottom: 4 },
  innermost: { width: 160, height: 80, alignItems: 'center', justifyContent: 'center' },
});
