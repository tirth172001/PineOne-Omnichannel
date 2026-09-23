import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Badge, Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';

export type NavigationRailDestination = {
  key: string;
  label: string;
  icon: string;
  focusedIcon: string;
  badge?: number | boolean;
};

type NavigationRailProps = {
  destinations: NavigationRailDestination[];
  activeKey: string;
  onChange: (key: string) => void;
  /** Optional slot above the destinations — typically a menu IconButton and/or a FAB. */
  header?: ReactNode;
};

/**
 * M3 navigation rail — not in react-native-paper. The medium/expanded-window
 * counterpart of the bottom navigation bar: 80dp wide, destinations stacked
 * vertically with a 56×32 active indicator (secondaryContainer).
 */
export function NavigationRail({ destinations, activeKey, onChange, header }: NavigationRailProps) {
  const theme = useTheme();

  return (
    <View style={[styles.rail, { backgroundColor: theme.colors.surface }]} accessibilityRole="tablist">
      {header ? <View style={styles.header}>{header}</View> : null}
      {destinations.map((destination) => {
        const active = destination.key === activeKey;
        return (
          <TouchableRipple
            key={destination.key}
            onPress={() => onChange(destination.key)}
            accessibilityRole="tab"
            aria-selected={active}
            accessibilityLabel={destination.label}
            borderless
            style={styles.item}>
            <View style={styles.itemContent}>
              <View style={[styles.indicator, active && { backgroundColor: theme.colors.secondaryContainer }]}>
                <Icon
                  source={active ? destination.focusedIcon : destination.icon}
                  size={24}
                  color={active ? theme.colors.onSecondaryContainer : theme.colors.onSurfaceVariant}
                />
                {destination.badge ? (
                  <Badge size={destination.badge === true ? 6 : 16} style={styles.badge}>
                    {destination.badge === true ? undefined : destination.badge}
                  </Badge>
                ) : null}
              </View>
              <Text
                variant="labelMedium"
                style={{ color: active ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}>
                {destination.label}
              </Text>
            </View>
          </TouchableRipple>
        );
      })}
    </View>
  );
}

// Items span the rail's full width (gap 0); the indicator sits 4dp inside an item.
const ITEM_RADIUS = concentric(Shape.max, 0);
const INDICATOR_RADIUS = concentric(ITEM_RADIUS, 4, 32);

const styles = StyleSheet.create({
  // Attached to the leading edge: only the trailing corners are rounded.
  rail: {
    width: 80,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 12,
    borderTopRightRadius: Shape.max,
    borderBottomRightRadius: Shape.max,
  },
  header: { alignItems: 'center', gap: 4, marginBottom: 28 },
  item: { width: 80, borderRadius: ITEM_RADIUS },
  itemContent: { alignItems: 'center', gap: 4, paddingVertical: 4 },
  indicator: { width: 56, height: 32, borderRadius: INDICATOR_RADIUS, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 2, right: 12 },
});
