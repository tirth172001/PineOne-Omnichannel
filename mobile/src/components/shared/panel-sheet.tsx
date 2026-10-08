import { Fragment, type ReactNode } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Divider, Icon, IconButton, Portal, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { BottomSheet } from '@/components/material3/bottom-sheet';
import { SelectionMark } from '@/components/shared/selection-mark';
import { useAppColors } from '@/constants/app-colors';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';

export const PANEL_PADDING = 16;
/** Radius for controls sitting 16dp inside a panel (Shape.max). */
export const PANEL_INNER_RADIUS = concentric(Shape.max, PANEL_PADDING);

type PanelSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  /** Small muted title in the header, e.g. "Refund transaction". */
  title: string;
  children: ReactNode;
  /** Pinned under the scrolling body, e.g. an Apply or Send button. */
  footer?: ReactNode;
  /** Defaults to 86% of the screen height, like the web panel's phone layout. */
  height?: number;
  /** Set false when the body manages its own scrolling or layout (e.g. a two-level filter list). */
  scroll?: boolean;
  /**
   * The body on the page's grey, with content as white cards (PanelSection,
   * SheetSection) — every sheet's format, after the channel switcher. Set false
   * only for a body that's one full-bleed surface of its own.
   */
  grouped?: boolean;
};

/**
 * Modal sheet with a title and close button (web: DetailSidepanelShell, which
 * on small screens is already a bottom sheet at 86% of the viewport height).
 * Every web side panel (refund, charge slip, activity details, deductions,
 * email report, filters…) opens in one of these on mobile.
 */
export function PanelSheet({ visible, onDismiss, title, children, footer, height, scroll = true, grouped = true }: PanelSheetProps) {
  const theme = useTheme();
  const { height: windowHeight } = useWindowDimensions();

  return (
    <Portal>
      <BottomSheet variant="modal" height={height ?? Math.round(windowHeight * 0.86)} visible={visible} onDismiss={onDismiss}>
        <View style={styles.header}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }} accessibilityRole="header">
            {title}
          </Text>
          <IconButton
            icon="x"
            mode="outlined"
            size={16}
            onPress={onDismiss}
            accessibilityLabel="Close panel"
            style={[styles.close, { borderRadius: PANEL_INNER_RADIUS, borderColor: theme.colors.outlineVariant }]}
          />
        </View>
        <Divider />
        {scroll ? (
          <ScrollView style={[styles.body, grouped && { backgroundColor: theme.colors.background }]} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.body, grouped && { backgroundColor: theme.colors.background }]}>{children}</View>
        )}
        {footer ? (
          <>
            <Divider />
            <View style={styles.footer}>{footer}</View>
          </>
        ) : null}
      </BottomSheet>
    </Portal>
  );
}

/**
 * A block of a sheet (web: the panel's `border-b px-6 py-6` sections), drawn as
 * the channel switcher draws them: a white rounded card on the sheet's grey,
 * with an optional uppercase label above it.
 */
export function PanelSection({ children, last = false, label }: { children: ReactNode; last?: boolean; label?: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.sectionWrap, last && styles.sectionLast]}>
      {label ? <SheetLabel label={label} /> : null}
      <View style={[styles.card, styles.section, { backgroundColor: theme.colors.surface }]}>{children}</View>
    </View>
  );
}

/** The uppercase label over a sheet's card (as the channel switcher's CHANNEL / STORES). */
export function SheetLabel({ label, trailing }: { label: string; trailing?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.labelRow}>
      <Text accessibilityRole="header" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
        {label.toUpperCase()}
      </Text>
      {trailing ? <Text style={[styles.labelTrailing, { color: theme.colors.onSurfaceVariant }]}>{trailing}</Text> : null}
    </View>
  );
}

/** A labelled white card of rows (SheetRow), 16dp in from the sheet's edges. */
export function SheetSection({ label, trailing, children, style }: { label?: string; trailing?: string; children: ReactNode; style?: object }) {
  const theme = useTheme();
  return (
    <View style={[styles.sheetSection, style]}>
      {label ? <SheetLabel label={label} trailing={trailing} /> : null}
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>{children}</View>
    </View>
  );
}

type SheetRowProps = {
  title: string;
  description?: string;
  /** A tile on the left, lime when the row is picked. */
  icon?: string;
  /** A radio or checkbox on the right; omit for a plain row (with `trailing`). */
  role?: 'radio' | 'checkbox';
  selected?: boolean;
  trailing?: ReactNode;
  first?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

/** One row of a SheetSection card — the channel switcher's row. */
export function SheetRow({ title, description, icon, role, selected = false, trailing, first = false, disabled = false, onPress }: SheetRowProps) {
  const theme = useTheme();
  const lime = useAppColors().highlight;
  const content = (
    <View style={[styles.row, !icon && styles.rowNoIcon]}>
      {icon ? (
        <View style={[styles.tile, { backgroundColor: selected ? lime : theme.colors.surfaceVariant }]}>
          <Icon source={icon} size={18} color={selected ? theme.colors.onSurface : theme.colors.onSurfaceVariant} />
        </View>
      ) : null}
      <View style={styles.rowText}>
        <Text numberOfLines={1} style={[styles.rowTitle, { color: theme.colors.onSurface, fontFamily: selected && !icon ? Fonts.semiBold : Fonts.medium }]}>
          {title}
        </Text>
        {description ? (
          <Text numberOfLines={2} style={[styles.rowDescription, { color: theme.colors.onSurfaceVariant }]}>
            {description}
          </Text>
        ) : null}
      </View>
      {role ? <SelectionMark type={role} checked={selected} /> : trailing}
    </View>
  );
  return (
    <Fragment>
      {first ? null : <View style={[styles.hairline, icon ? styles.hairlineInset : null, { backgroundColor: theme.colors.surfaceVariant }]} />}
      {onPress ? (
        <TouchableRipple
          onPress={onPress}
          disabled={disabled}
          accessibilityRole={role ?? 'button'}
          aria-checked={role ? selected : undefined}
          accessibilityState={role ? { checked: selected, disabled } : { disabled }}
          style={!icon && selected ? { backgroundColor: lime } : undefined}>
          {content}
        </TouchableRipple>
      ) : (
        content
      )}
    </Fragment>
  );
}

/** The sheet's main button: full width, 48dp, as the channel switcher's Apply. */
export const SHEET_BUTTON = { contentStyle: { height: 48 }, labelStyle: { fontFamily: Fonts.medium, fontSize: 16 }, style: { borderRadius: PANEL_INNER_RADIUS } } as const;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PANEL_PADDING,
    paddingBottom: 12,
  },
  close: { margin: 0 },
  body: { flex: 1 },
  footer: { padding: PANEL_PADDING, gap: 12 },
  // PanelSection: a card 16dp in from the sheet's edges, 16dp below the one before.
  sectionWrap: { marginHorizontal: PANEL_PADDING, marginTop: PANEL_PADDING, gap: 8 },
  sectionLast: { marginBottom: PANEL_PADDING },
  section: { padding: PANEL_PADDING, gap: 12 },
  card: { borderRadius: Shape.max, overflow: 'hidden' },
  sheetSection: { gap: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 4 },
  label: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
  labelTrailing: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, paddingVertical: 10, paddingLeft: 12, paddingRight: 4 },
  rowNoIcon: { minHeight: 52, paddingLeft: 16 },
  tile: { width: 32, height: 32, borderRadius: Shape.small, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 14, lineHeight: 20 },
  rowDescription: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16 },
  // Inset under the text when rows have icon tiles, so the tiles read as one column.
  hairline: { height: 1, marginLeft: 16 },
  hairlineInset: { marginLeft: 12 + 32 + 12 },
});
