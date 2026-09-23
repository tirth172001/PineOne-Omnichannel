import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, useTheme } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';

type ToolbarProps = {
  children: ReactNode;
  /** `docked`: full-width bar at the bottom edge. `floating`: rounded bar that floats above content. */
  variant?: 'docked' | 'floating';
  /** `standard` uses surface colors; `vibrant` uses primaryContainer for more emphasis. */
  colorScheme?: 'standard' | 'vibrant';
  /** Optional trailing element next to a floating toolbar — typically a FAB. */
  trailing?: ReactNode;
};

/**
 * M3 Expressive toolbar — not in react-native-paper. Holds a handful of
 * contextual actions (IconButtons, a Button) for the current page. Replaces the
 * old "bottom app bar" in the M3 spec.
 */
export function Toolbar({ children, variant = 'docked', colorScheme = 'standard', trailing }: ToolbarProps) {
  const theme = useTheme();
  const bg = colorScheme === 'vibrant' ? theme.colors.primaryContainer : theme.colors.elevation.level2;

  if (variant === 'docked') {
    return (
      <Surface elevation={0} style={[styles.docked, { backgroundColor: bg }]}>
        {children}
      </Surface>
    );
  }

  return (
    <View style={styles.floatingRow}>
      <Surface elevation={3} style={[styles.floating, { backgroundColor: bg }]}>
        {children}
      </Surface>
      {trailing}
    </View>
  );
}

// Items (40dp IconButtons) sit 12dp inside the docked bar and 8dp inside the
// floating bar; their radius is concentric with the bar's corners.
const FLOATING_RADIUS = Shape.max;

/** Radius for IconButtons placed in a toolbar: pass as `style={{ borderRadius }}`. */
export function toolbarItemRadius(variant: 'docked' | 'floating') {
  return variant === 'docked' ? concentric(Shape.max, 12, 40) : concentric(FLOATING_RADIUS, 8, 40);
}

const styles = StyleSheet.create({
  docked: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    // Attached to the bottom edge: only the content-facing corners are rounded.
    borderTopLeftRadius: Shape.max,
    borderTopRightRadius: Shape.max,
  },
  floatingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  floating: {
    height: 64,
    borderRadius: FLOATING_RADIUS,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
});
