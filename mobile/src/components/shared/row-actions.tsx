import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { IconButton, Menu, useTheme } from 'react-native-paper';

import { Shape } from '@/constants/shape';

import { LIST_ROW_INNER_RADIUS } from './listing';

export type RowAction = { label: string; icon?: string; onPress: () => void };

/**
 * A row's overflow menu (web: the table's "⋮" DropdownMenu action column),
 * e.g. Change mode / Deactivate device, Copy link / Duplicate link.
 */
export function RowActionsMenu({ actions, accessibilityLabel = 'Row actions' }: { actions: RowAction[]; accessibilityLabel?: string }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchorPosition="bottom"
      contentStyle={{ borderRadius: Shape.small, backgroundColor: theme.colors.surface }}
      anchor={
        <IconButton
          icon="dots-three-vertical"
          mode="outlined"
          size={16}
          onPress={() => setOpen(true)}
          accessibilityLabel={accessibilityLabel}
          style={[styles.button, { borderColor: theme.colors.outlineVariant }]}
        />
      }>
      {actions.map((action) => (
        <Menu.Item
          key={action.label}
          title={action.label}
          leadingIcon={action.icon}
          onPress={() => {
            setOpen(false);
            action.onPress();
          }}
        />
      ))}
    </Menu>
  );
}

const styles = StyleSheet.create({
  // Sits inside a list row, 16dp from its edge.
  button: { margin: 0, width: 32, height: 32, borderRadius: LIST_ROW_INNER_RADIUS },
});
