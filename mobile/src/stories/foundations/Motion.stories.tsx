import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

// M3 easing tokens (cubic-bezier control points).
const EASINGS = [
  { name: 'Emphasized', curve: [0.2, 0, 0, 1], usage: 'Most transitions (begin and end on screen)' },
  { name: 'Emphasized decelerate', curve: [0.05, 0.7, 0.1, 1], usage: 'Elements entering the screen' },
  { name: 'Emphasized accelerate', curve: [0.3, 0, 0.8, 0.15], usage: 'Elements leaving the screen' },
  { name: 'Standard', curve: [0.2, 0, 0, 1], usage: 'Small utility changes (color, opacity)' },
  { name: 'Standard decelerate', curve: [0, 0, 0, 1], usage: 'Small elements entering' },
  { name: 'Standard accelerate', curve: [0.3, 0, 1, 1], usage: 'Small elements exiting' },
] as const;

// M3 duration tokens, in ms.
const DURATIONS = [
  { group: 'Short', values: [50, 100, 150, 200], usage: 'Selection controls, ripples, small icons' },
  { group: 'Medium', values: [250, 300, 350, 400], usage: 'Expanding cards, sheets, FAB → screen' },
  { group: 'Long', values: [450, 500, 550, 600], usage: 'Large, full-screen transitions' },
  { group: 'Extra long', values: [700, 800, 900, 1000], usage: 'Ambient / decorative motion only' },
] as const;

const TRACK_WIDTH = 240;
const DOT_SIZE = 20;

function EasingDemo() {
  const theme = useTheme();
  const [progress] = useState(() => EASINGS.map(() => new Animated.Value(0)));
  const [atEnd, setAtEnd] = useState(false);

  const play = () => {
    const toValue = atEnd ? 0 : 1;
    Animated.parallel(
      EASINGS.map(({ curve }, i) =>
        Animated.timing(progress[i], {
          toValue,
          duration: 500,
          easing: Easing.bezier(curve[0], curve[1], curve[2], curve[3]),
          useNativeDriver: true,
        })
      )
    ).start();
    setAtEnd(!atEnd);
  };

  return (
    <View style={{ gap: 16 }}>
      <Button mode="contained-tonal" icon="play" onPress={play} style={{ alignSelf: 'flex-start' }}>
        Play (500ms)
      </Button>
      {EASINGS.map(({ name, curve, usage }, i) => (
        <View key={name} style={{ gap: 4 }}>
          <Text variant="labelLarge">{name}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            cubic-bezier({curve.join(', ')}): {usage}
          </Text>
          <View style={[styles.track, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Animated.View
              style={[
                styles.dot,
                {
                  backgroundColor: theme.colors.primary,
                  transform: [
                    { translateX: progress[i].interpolate({ inputRange: [0, 1], outputRange: [0, TRACK_WIDTH - DOT_SIZE] }) },
                  ],
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

function DurationDemo() {
  const theme = useTheme();

  return (
    <View style={{ gap: 16 }}>
      {DURATIONS.map(({ group, values, usage }) => (
        <View key={group} style={{ gap: 4 }}>
          <Text variant="labelLarge">{group}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {usage}
          </Text>
          {values.map((ms, i) => (
            <View key={ms} style={styles.durationRow}>
              <Text variant="labelSmall" style={styles.durationLabel}>
                {group.toLowerCase().replace(' ', '')}
                {i + 1} · {ms}ms
              </Text>
              <View style={[styles.durationBar, { width: ms / 5, backgroundColor: theme.colors.primary }]} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const meta = {
  title: 'Foundations/Motion',
  component: EasingDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: use Emphasized easing for most transitions and Standard for small utility changes. Keep durations short (200–300ms on mobile) and scale them with how far and how large the change is. Motion should explain where something came from or went to; never use it only for decoration.',
      },
    },
  },
} satisfies Meta<typeof EasingDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Easing_: Story = { name: 'Easing' };

export const Duration: Story = {
  render: () => <DurationDemo />,
};

const styles = StyleSheet.create({
  track: { width: TRACK_WIDTH, height: DOT_SIZE, borderRadius: DOT_SIZE / 2 },
  dot: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2 },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  durationLabel: { width: 120 },
  durationBar: { height: 8, borderRadius: 4 },
});
