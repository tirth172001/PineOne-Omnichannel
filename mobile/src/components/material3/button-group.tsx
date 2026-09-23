import { StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { Shape } from '@/constants/shape';

export type ButtonGroupItem = {
  value: string;
  label: string;
  icon?: string;
};

type ButtonGroupProps = {
  items: ButtonGroupItem[];
  value: string;
  onValueChange: (value: string) => void;
  /** `standard`: separate rounded buttons with an 8dp gap. `connected`: 2dp gap, smaller inner corners. */
  variant?: 'standard' | 'connected';
};

const HEIGHT = 40;
// Capped at Shape.max rather than a full pill; connected inner corners are smaller.
const OUTER_RADIUS = Shape.max;
const INNER_RADIUS = Shape.extraSmall;

/**
 * M3 Expressive button group — not in react-native-paper, built from Paper
 * primitives. Selected item uses the primary role; unselected uses
 * secondaryContainer (tonal). In `connected` mode the selected item gets the
 * full outer radius on every corner, standing in for M3's shape-morph selected state.
 */
export function ButtonGroup({ items, value, onValueChange, variant = 'standard' }: ButtonGroupProps) {
  const theme = useTheme();
  const connected = variant === 'connected';

  return (
    <View style={[styles.row, { gap: connected ? 2 : 8 }]} accessibilityRole="radiogroup">
      {items.map((item, index) => {
        const selected = item.value === value;
        const first = index === 0;
        const last = index === items.length - 1;
        const fg = selected ? theme.colors.onPrimary : theme.colors.onSecondaryContainer;
        const radius = (isOuter: boolean) => (!connected || selected || isOuter ? OUTER_RADIUS : INNER_RADIUS);

        return (
          <TouchableRipple
            key={item.value}
            onPress={() => onValueChange(item.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            borderless
            style={[
              styles.button,
              connected && styles.connectedButton,
              {
                backgroundColor: selected ? theme.colors.primary : theme.colors.secondaryContainer,
                borderTopLeftRadius: radius(first),
                borderBottomLeftRadius: radius(first),
                borderTopRightRadius: radius(last),
                borderBottomRightRadius: radius(last),
              },
            ]}>
            <View style={styles.content}>
              {item.icon ? <Icon source={item.icon} size={18} color={fg} /> : null}
              <Text variant="labelLarge" style={{ color: fg }}>
                {item.label}
              </Text>
            </View>
          </TouchableRipple>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  button: { height: HEIGHT, paddingHorizontal: 16, justifyContent: 'center' },
  connectedButton: { flex: 1 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});
