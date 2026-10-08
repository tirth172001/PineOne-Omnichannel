import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';

import { PanelSheet, SheetRow, SheetSection } from './panel-sheet';

/** Sheet handle, title row and padding around the option list. */
const SHEET_CHROME = 120;
const OPTION_HEIGHT = 53;

// The thumb sits 2dp inside the track.
const TRACK_PADDING = 2;
const SEGMENT_HEIGHT = 28;
// Extends each segment's touch target to ~44dp without growing the control.
const SEGMENT_HIT_SLOP = { top: 8, bottom: 8, left: 2, right: 2 };

/**
 * Compact segmented toggle for in-page choices (In-store / Online, settlement
 * source, By count / By amount): a soft grey track with the selected option on
 * a white thumb that slides between segments. No outlines or check marks, and
 * labels stay on one line (truncating) so it fits beside a card title on a
 * phone; the track shrinks rather than overflow.
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
  /** Take the full row, with equal segments (e.g. a standalone choice in a form). */
  grow?: boolean;
}) {
  const theme = useTheme();
  const [layouts, setLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const [thumbX] = useState(() => new Animated.Value(0));
  const [thumbWidth] = useState(() => new Animated.Value(0));
  // Set once the thumb has been put under the first selected segment, so it never slides in from the edge.
  const placed = useRef(false);
  const selected = layouts[value];
  useEffect(() => {
    if (!selected || !placed.current) return;
    const timing = { duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: false };
    Animated.parallel([
      Animated.timing(thumbX, { toValue: selected.x, ...timing }),
      Animated.timing(thumbWidth, { toValue: selected.width, ...timing }),
    ]).start();
  }, [selected, thumbX, thumbWidth]);

  return (
    <View
      accessibilityRole="radiogroup"
      style={[styles.track, grow && styles.trackGrow, { borderRadius: radius, backgroundColor: theme.colors.surfaceVariant }]}>
      {selected ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumb,
            { borderRadius: concentric(radius, TRACK_PADDING), backgroundColor: theme.colors.surface, left: thumbX, width: thumbWidth },
          ]}
        />
      ) : null}
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onValueChange(option.value)}
            onLayout={(event) => {
              const { x, width } = event.nativeEvent.layout;
              if (active && !placed.current) {
                thumbX.setValue(x);
                thumbWidth.setValue(width);
                placed.current = true;
              }
              setLayouts((current) => ({ ...current, [option.value]: { x, width } }));
            }}
            hitSlop={SEGMENT_HIT_SLOP}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            accessibilityLabel={option.label}
            style={[styles.segment, grow && styles.segmentGrow]}>
            <Text
              numberOfLines={1}
              style={[
                styles.segmentLabel,
                { color: active ? theme.colors.onSurface : theme.colors.onSurfaceVariant, fontFamily: active ? Fonts.medium : Fonts.regular },
              ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
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
          <SheetSection>
            {options.map((option, index) => (
              <SheetRow
                key={option.value}
                first={index === 0}
                title={option.label}
                role="radio"
                selected={option.value === value}
                onPress={() => {
                  setOpen(false);
                  onValueChange(option.value);
                }}
              />
            ))}
          </SheetSection>
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
  radius = Shape.small,
  height,
}: {
  label: string;
  icon?: string;
  trailingIcon?: boolean;
  onPress?: () => void;
  count?: number;
  /** Highlights the button (web: filter button with applied values). */
  active?: boolean;
  accessibilityLabel?: string;
  /** Defaults to a page-level control's radius; pass the concentric radius inside a container. */
  radius?: number;
  /** A fixed height, e.g. to line up with a search field beside it. */
  height?: number;
}) {
  const theme = useTheme();
  return (
    <Button
      mode="outlined"
      compact
      icon={icon}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      contentStyle={[trailingIcon && styles.trailingIconContent, height !== undefined && { height: height - 2 }]}
      labelStyle={styles.label}
      textColor={theme.colors.onSurface}
      style={[
        styles.button,
        {
          borderRadius: radius,
          borderColor: active ? theme.colors.onSurface : theme.colors.outlineVariant,
          backgroundColor: theme.colors.surface,
        },
      ]}>
      {count ? `${label} (${count})` : label}
    </Button>
  );
}

const styles = StyleSheet.create({
  options: { padding: 16 },
  track: { flexDirection: 'row', alignSelf: 'flex-start', flexShrink: 1, padding: TRACK_PADDING },
  // Full width of its container. (A flex-basis would become a height inside a column.)
  trackGrow: { alignSelf: 'stretch', width: '100%' },
  thumb: { position: 'absolute', top: TRACK_PADDING, bottom: TRACK_PADDING, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)' },
  segment: { height: SEGMENT_HEIGHT, flexShrink: 1, justifyContent: 'center', paddingHorizontal: 12 },
  segmentGrow: { flex: 1, alignItems: 'center' },
  segmentLabel: { fontSize: 12, lineHeight: 16, letterSpacing: 0.1 },
  // Standalone page-level controls (not nested in a container).
  button: { borderRadius: Shape.small, margin: 0 },
  label: { fontSize: 12, marginVertical: 6 },
  trailingIconContent: { flexDirection: 'row-reverse' },
});
