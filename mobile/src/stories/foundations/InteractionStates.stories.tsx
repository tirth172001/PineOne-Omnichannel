import type { Meta, StoryObj } from '@storybook/react-native';
import color from 'color';
import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

// M3 state-layer opacities: a translucent overlay of the *content* color laid on
// top of the container to show interaction state.
const STATES = [
  { name: 'Enabled', opacity: 0 },
  { name: 'Hovered', opacity: 0.08 },
  { name: 'Focused', opacity: 0.1 },
  { name: 'Pressed', opacity: 0.1 },
  { name: 'Dragged', opacity: 0.16 },
] as const;

function StateLayersDemo() {
  const theme = useTheme();
  const containers = [
    { label: 'On primary', bg: theme.colors.primary, fg: theme.colors.onPrimary },
    { label: 'On surface', bg: theme.colors.surface, fg: theme.colors.onSurface },
    { label: 'On secondary container', bg: theme.colors.secondaryContainer, fg: theme.colors.onSecondaryContainer },
  ];

  return (
    <View style={{ gap: 16 }}>
      {containers.map(({ label, bg, fg }) => (
        <View key={label} style={{ gap: 8 }}>
          <Text variant="labelLarge">{label}</Text>
          <View style={styles.row}>
            {STATES.map(({ name, opacity }) => (
              <View key={name} style={[styles.chip, { backgroundColor: bg, borderColor: theme.colors.outlineVariant }]}>
                <View style={[StyleSheet.absoluteFill, { backgroundColor: color(fg).alpha(opacity).rgb().string() }]} />
                <Text variant="labelMedium" style={{ color: fg }}>
                  {name}
                </Text>
                <Text variant="labelSmall" style={{ color: fg }}>
                  {Math.round(opacity * 100)}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
      <View style={{ gap: 8 }}>
        <Text variant="labelLarge">Disabled</Text>
        <View style={styles.row}>
          <View style={[styles.chip, { backgroundColor: theme.colors.surfaceDisabled }]}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceDisabled }}>
              Container 12%
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceDisabled }}>
              Content 38%
            </Text>
          </View>
        </View>
      </View>
      <View style={{ gap: 8 }}>
        <Text variant="labelLarge">Try it: press (ripple = pressed state layer)</Text>
        <TouchableRipple
          onPress={() => {}}
          style={[styles.pressable, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
          <Text variant="bodyMedium">Press me</Text>
        </TouchableRipple>
      </View>
    </View>
  );
}

const meta = {
  title: 'Foundations/InteractionStates',
  component: StateLayersDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: interaction states are shown by a state layer, a translucent overlay in the element’s content color at a fixed opacity, not by a different fill color. Paper components apply these for you. Custom pressables should use TouchableRipple so they match.',
      },
    },
  },
} satisfies Meta<typeof StateLayersDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const StateLayers: Story = {};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    width: 104,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressable: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
