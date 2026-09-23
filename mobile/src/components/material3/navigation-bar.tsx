import color from 'color';
import { StyleSheet, View } from 'react-native';
import { Badge, Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';

export type NavigationBarDestination = {
  key: string;
  label: string;
  icon: string;
  focusedIcon: string;
  badge?: number | boolean;
};

type NavigationBarProps = {
  destinations: NavigationBarDestination[];
  activeKey: string;
  onChange: (key: string) => void;
  /** Adds the bottom safe-area inset (gesture bar) below the items. On by default. */
  respectSafeArea?: boolean;
};

/**
 * M3 Expressive navigation bar ("vertical items") — the 64dp bar in the Figma
 * app shell (node 47:2377). Paper's BottomNavigation.Bar implements the older
 * 80dp M3 bar with its padding hard-coded, so this is built in-house from
 * Paper primitives: 80dp items, a 56×32 indicator, 10dp labels. Attached
 * to the bottom screen edge, so only its top corners are rounded; items and the
 * indicator are concentric with them.
 */
export function NavigationBar({ destinations, activeKey, onChange, respectSafeArea = true }: NavigationBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  // Figma layers a 50% white over base/secondary for the indicator.
  const indicatorColor = color(theme.colors.secondaryContainer).mix(color('#ffffff'), 0.5).hex();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.bar,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.surfaceVariant,
          paddingBottom: respectSafeArea ? insets.bottom : 0,
        },
      ]}>
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
              <View style={[styles.indicator, active && { width: 56, backgroundColor: indicatorColor }]}>
                <Icon
                  source={active ? destination.focusedIcon : destination.icon}
                  size={24}
                  color={theme.colors.onSurface}
                />
                {destination.badge ? (
                  <Badge size={destination.badge === true ? 6 : 16} style={styles.badge}>
                    {destination.badge === true ? undefined : destination.badge}
                  </Badge>
                ) : null}
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  { color: theme.colors.onSecondaryContainer, fontFamily: active ? Fonts.medium : Fonts.regular },
                ]}>
                {destination.label}
              </Text>
            </View>
          </TouchableRipple>
        );
      })}
    </View>
  );
}

// Items touch the bar's top edge (gap 0), so they share its radius; the
// indicator sits 6dp inside an item.
const ITEM_RADIUS = concentric(Shape.max, 0, 64);
const INDICATOR_RADIUS = concentric(ITEM_RADIUS, 6, 32);

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopLeftRadius: Shape.max,
    borderTopRightRadius: Shape.max,
  },
  item: { flex: 1, maxWidth: 80, borderRadius: ITEM_RADIUS },
  itemContent: { alignItems: 'center', gap: 4, paddingTop: 6, paddingBottom: 10 },
  indicator: { width: 32, height: 32, borderRadius: INDICATOR_RADIUS, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 2, right: 8 },
  label: { fontSize: 10, lineHeight: 12, letterSpacing: 0.15, textAlign: 'center' },
});
