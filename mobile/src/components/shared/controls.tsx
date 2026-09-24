import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, SegmentedButtons, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { Shape } from '@/constants/shape';

import { PANEL_INNER_RADIUS, PanelSheet } from './panel-sheet';
import { SelectionMark } from './selection-mark';

/** Sheet handle, title row and padding around the option list. */
const SHEET_CHROME = 120;
const OPTION_HEIGHT = 52;

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
 * Outlined filter button showing the current choice with a caret (web:
 * FilterControl, a select-style dropdown). On a phone it opens a bottom sheet
 * of options (user decision) rather than a dropdown menu; picking one applies
 * it and closes the sheet.
 */
export function FilterMenuButton<T extends string>({
  value,
  onValueChange,
  options,
  icon,
  accessibilityLabel,
  title,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  icon?: string;
  accessibilityLabel: string;
  /** Sheet title; defaults to the accessibility label (e.g. "Status"). */
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const selected = options.find((option) => option.value === value);
  // Fit the options, up to the panel's usual 86% of the screen (then the list scrolls).
  const sheetHeight = Math.min(SHEET_CHROME + options.length * OPTION_HEIGHT, Math.round(windowHeight * 0.86));

  return (
    <>
      <OutlinedActionButton
        label={selected?.label ?? ''}
        icon={icon ?? 'caret-down'}
        trailingIcon={!icon}
        onPress={() => setOpen(true)}
        accessibilityLabel={`${accessibilityLabel}: ${selected?.label ?? ''}`}
      />
      <PanelSheet visible={open} onDismiss={() => setOpen(false)} title={title ?? accessibilityLabel} height={sheetHeight}>
        <View style={styles.options}>
          {options.map((option) => {
            const checked = option.value === value;
            return (
              <TouchableRipple
                key={option.value}
                onPress={() => {
                  setOpen(false);
                  onValueChange(option.value);
                }}
                borderless
                accessibilityRole="radio"
                aria-checked={checked}
                accessibilityState={{ checked }}
                accessibilityLabel={option.label}
                style={[styles.option, checked && { backgroundColor: theme.colors.secondaryContainer }]}>
                <View style={styles.optionContent}>
                  <Text variant="bodyLarge" style={styles.optionLabel}>
                    {option.label}
                  </Text>
                  <SelectionMark type="radio" checked={checked} />
                </View>
              </TouchableRipple>
            );
          })}
        </View>
      </PanelSheet>
    </>
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
  options: { padding: 16, paddingTop: 8, gap: 4 },
  option: { borderRadius: PANEL_INNER_RADIUS },
  optionContent: { flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingLeft: 12 },
  optionLabel: { flex: 1 },
  // Full width of its container. (A flex-basis would become a height inside a column.)
  segmentsGrow: { width: '100%' },
  segmentLabel: { fontSize: 12 },
  // Standalone page-level controls (not nested in a container).
  button: { borderRadius: Shape.small, margin: 0 },
  label: { fontSize: 12, marginVertical: 6 },
  trailingIconContent: { flexDirection: 'row-reverse' },
});
