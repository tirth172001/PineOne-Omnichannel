import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Menu, SegmentedButtons, useTheme } from 'react-native-paper';

import { Shape } from '@/constants/shape';

/**
 * Compact M3 segmented buttons for in-page toggles (In-store / Online,
 * settlement source, By count / By amount). Paper derives a segment's border
 * and press-ripple radius from 5 × theme.roundness and squares the corners
 * between segments, so both are overridden: a per-component theme sets the
 * radius, and explicit per-corner styles round the inner corners too.
 */
export function CompactSegmentedButtons<T extends string>({
  value,
  onValueChange,
  options,
  radius,
  grow = false,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  /** concentric() of the container the toggle sits in, or Shape.small when standalone. */
  radius: number;
  /** Take the full row (e.g. when wrapped under a card title on a phone). */
  grow?: boolean;
}) {
  const segmentStyle = {
    borderTopLeftRadius: radius,
    borderTopRightRadius: radius,
    borderBottomLeftRadius: radius,
    borderBottomRightRadius: radius,
  };
  return (
    <SegmentedButtons
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      density="small"
      theme={{ roundness: radius / 5 }}
      style={grow ? styles.segmentsGrow : undefined}
      buttons={options.map((option) => ({
        value: option.value,
        label: option.label,
        style: segmentStyle,
        labelStyle: styles.segmentLabel,
      }))}
    />
  );
}

/**
 * Outlined filter button that opens a menu of options, showing the current
 * choice with a caret (web: FilterControl, a select-style dropdown).
 */
export function FilterMenuButton<T extends string>({
  value,
  onValueChange,
  options,
  icon,
  accessibilityLabel,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  icon?: string;
  accessibilityLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const selected = options.find((option) => option.value === value);

  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchorPosition="bottom"
      contentStyle={{ borderRadius: Shape.small, backgroundColor: theme.colors.surface }}
      anchor={
        <OutlinedActionButton
          label={selected?.label ?? ''}
          icon={icon ?? 'caret-down'}
          trailingIcon={!icon}
          onPress={() => setOpen(true)}
          accessibilityLabel={`${accessibilityLabel}: ${selected?.label ?? ''}`}
        />
      }>
      {options.map((option) => (
        <Menu.Item
          key={option.value}
          title={option.label}
          trailingIcon={option.value === value ? 'check' : undefined}
          onPress={() => {
            setOpen(false);
            onValueChange(option.value);
          }}
        />
      ))}
    </Menu>
  );
}

/**
 * Outlined, compact action button used in toolbars and section headers
 * (web: Button variant="outline" size="sm"), e.g. "Customize", "View all ›",
 * "Download filtered". An optional count is appended, e.g. "More filters (2)".
 */
export function OutlinedActionButton({
  label,
  icon,
  trailingIcon = false,
  onPress,
  count,
  active = false,
  accessibilityLabel,
}: {
  label: string;
  icon?: string;
  trailingIcon?: boolean;
  onPress?: () => void;
  count?: number;
  /** Highlights the button (web: filter button with applied values). */
  active?: boolean;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  return (
    <Button
      mode="outlined"
      compact
      icon={icon}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      contentStyle={trailingIcon ? styles.trailingIconContent : undefined}
      labelStyle={styles.label}
      textColor={theme.colors.onSurface}
      style={[
        styles.button,
        {
          borderColor: active ? theme.colors.onSurface : theme.colors.outlineVariant,
          backgroundColor: theme.colors.surface,
        },
      ]}>
      {count ? `${label} (${count})` : label}
    </Button>
  );
}

const styles = StyleSheet.create({
  segmentsGrow: { flexGrow: 1, flexBasis: 240 },
  segmentLabel: { fontSize: 12 },
  // Standalone page-level controls (not nested in a container).
  button: { borderRadius: Shape.small, margin: 0 },
  label: { fontSize: 12, marginVertical: 6 },
  trailingIconContent: { flexDirection: 'row-reverse' },
});
