import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Menu, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { Shape } from '@/constants/shape';

export type SplitButtonOption = {
  label: string;
  icon?: string;
  onPress: () => void;
};

type SplitButtonProps = {
  label: string;
  icon?: string;
  onPress: () => void;
  /** Related alternatives shown in the trailing menu. */
  options: SplitButtonOption[];
  variant?: 'filled' | 'tonal';
};

const HEIGHT = 40;
const OUTER_RADIUS = Shape.max;
const INNER_RADIUS = 4;

/**
 * M3 Expressive split button — not in react-native-paper. A leading button for
 * the default action plus a trailing chevron that opens a menu of related
 * alternatives, separated by a 2dp gap. The trailing half gets the outer
 * radius on every corner while its menu is open (the spec's selected state).
 */
export function SplitButton({ label, icon, onPress, options, variant = 'filled' }: SplitButtonProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const bg = variant === 'filled' ? theme.colors.primary : theme.colors.secondaryContainer;
  const fg = variant === 'filled' ? theme.colors.onPrimary : theme.colors.onSecondaryContainer;

  return (
    <View style={styles.row}>
      <TouchableRipple
        onPress={onPress}
        borderless
        accessibilityRole="button"
        style={[styles.leading, { backgroundColor: bg }]}>
        <View style={styles.content}>
          {icon ? <Icon source={icon} size={18} color={fg} /> : null}
          <Text variant="labelLarge" style={{ color: fg }}>
            {label}
          </Text>
        </View>
      </TouchableRipple>
      <Menu
        visible={open}
        onDismiss={() => setOpen(false)}
        anchorPosition="bottom"
        anchor={
          <TouchableRipple
            onPress={() => setOpen(true)}
            borderless
            accessibilityRole="button"
            accessibilityLabel="More options"
            accessibilityState={{ expanded: open }}
            style={[
              styles.trailing,
              {
                backgroundColor: bg,
                borderTopLeftRadius: open ? OUTER_RADIUS : INNER_RADIUS,
                borderBottomLeftRadius: open ? OUTER_RADIUS : INNER_RADIUS,
              },
            ]}>
            <Icon source={open ? 'caret-up' : 'caret-down'} size={20} color={fg} />
          </TouchableRipple>
        }>
        {options.map((option) => (
          <Menu.Item
            key={option.label}
            title={option.label}
            leadingIcon={option.icon}
            onPress={() => {
              setOpen(false);
              option.onPress();
            }}
          />
        ))}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2, alignSelf: 'flex-start' },
  leading: {
    height: HEIGHT,
    paddingLeft: 16,
    paddingRight: 12,
    justifyContent: 'center',
    borderTopLeftRadius: OUTER_RADIUS,
    borderBottomLeftRadius: OUTER_RADIUS,
    borderTopRightRadius: INNER_RADIUS,
    borderBottomRightRadius: INNER_RADIUS,
  },
  trailing: {
    height: HEIGHT,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: OUTER_RADIUS,
    borderBottomRightRadius: OUTER_RADIUS,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
