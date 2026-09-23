import { StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';

type SearchBarProps = {
  placeholder?: string;
  onPress?: () => void;
};

const HEIGHT = 56;
const ICON_SLOT = 40;

/**
 * Search entry point, surfaced in the Overview header per the IA decision in
 * .scratch/mobile-app/issues/02-confirm-ia-mapping.md (no dedicated Search tab).
 * Display-only: it opens a real search screen once that's built. Drawn from
 * Paper primitives in M3 search bar colors and sizing, rather than Paper's
 * Searchbar, whose icon buttons are hard-coded circles, so every shape follows
 * the Shape.max cap and the concentric rule.
 */
export function SearchBar({ placeholder = 'Search', onPress }: SearchBarProps) {
  const theme = useTheme();

  return (
    <TouchableRipple
      onPress={onPress}
      borderless
      accessibilityRole="search"
      accessibilityLabel={placeholder}
      style={[styles.bar, { backgroundColor: theme.colors.elevation.level3 }]}>
      <View style={styles.content}>
        <View style={styles.iconSlot}>
          <Icon source="magnifying-glass" size={24} color={theme.colors.onSurfaceVariant} />
        </View>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
          {placeholder}
        </Text>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: HEIGHT,
    marginHorizontal: 16,
    borderRadius: Shape.max,
    justifyContent: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  // The icon slot sits 8dp inside the bar, so it's concentric with it.
  iconSlot: {
    width: ICON_SLOT,
    height: ICON_SLOT,
    borderRadius: concentric(Shape.max, (HEIGHT - ICON_SLOT) / 2, ICON_SLOT),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
