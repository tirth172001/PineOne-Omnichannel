import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { Shape } from '@/constants/shape';

/**
 * The shell's top container: header plus any screen sub-tabs, as one surface.
 * It's attached to the top screen edge, so only its content-facing (bottom)
 * corners are rounded; everything inside derives its radius from Shape.max.
 */
export function ShellTopBar({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return <View style={[styles.bar, { backgroundColor: theme.colors.surface }]}>{children}</View>;
}

const styles = StyleSheet.create({
  bar: {
    borderBottomLeftRadius: Shape.max,
    borderBottomRightRadius: Shape.max,
    overflow: 'hidden',
  },
});
