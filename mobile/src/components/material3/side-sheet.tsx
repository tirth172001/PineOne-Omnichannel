import { type ReactNode, useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';

type SideSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  children: ReactNode;
  /** Optional footer, typically a primary + secondary Button. */
  actions?: ReactNode;
  width?: number;
};

const EMPHASIZED_DECELERATE = Easing.bezier(0.05, 0.7, 0.1, 1);
const EMPHASIZED_ACCELERATE = Easing.bezier(0.3, 0, 0.8, 0.15);

/**
 * M3 modal side sheet — not in react-native-paper. Slides in from the trailing
 * edge over a scrim; rounded (Shape.max) on its leading corners only. Renders
 * absolutely within its nearest positioned parent — wrap in Paper's <Portal>
 * to cover a whole screen.
 */
export function SideSheet({ visible, onDismiss, title, children, actions, width = 320 }: SideSheetProps) {
  const theme = useTheme();
  const [progress] = useState(() => new Animated.Value(0));
  const [mounted, setMounted] = useState(visible);
  // Mount immediately on open; unmount only once the exit animation finishes.
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? 400 : 200,
      easing: visible ? EMPHASIZED_DECELERATE : EMPHASIZED_ACCELERATE,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
  }, [visible, progress]);

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: theme.colors.scrim, opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.32] }) },
        ]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} accessibilityLabel="Close sheet" />
      </Animated.View>
      <Animated.View
        accessibilityViewIsModal
        style={[
          styles.sheet,
          {
            width,
            backgroundColor: theme.colors.elevation.level1,
            transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [width, 0] }) }],
          },
        ]}>
        <View style={styles.header}>
          <Text variant="titleLarge" style={{ flex: 1 }}>
            {title}
          </Text>
          <IconButton icon="x" onPress={onDismiss} accessibilityLabel="Close" />
        </View>
        <View style={styles.body}>{children}</View>
        {actions ? <View style={[styles.actions, { borderTopColor: theme.colors.outlineVariant }]}>{actions}</View> : null}
      </Animated.View>
    </View>
  );
}

// Extra-large leading corners; action buttons sit 16dp above the bottom edge.
const SHEET_RADIUS = Shape.max;
const ACTIONS_GAP = 16;
/** Radius for buttons passed as `actions`, concentric with the sheet's bottom-leading corner. */
export const SIDE_SHEET_ACTION_RADIUS = concentric(SHEET_RADIUS, ACTIONS_GAP, 40);

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    borderTopLeftRadius: SHEET_RADIUS,
    borderBottomLeftRadius: SHEET_RADIUS,
    overflow: 'hidden',
  },
  header: { flexDirection: 'row', alignItems: 'center', paddingLeft: 24, paddingRight: 8, paddingTop: 12 },
  body: { flex: 1, paddingHorizontal: 24 },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: ACTIONS_GAP,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
