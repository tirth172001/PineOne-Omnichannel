import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Divider, IconButton, Portal, Text, useTheme } from 'react-native-paper';

import { BottomSheet } from '@/components/material3/bottom-sheet';
import { concentric, Shape } from '@/constants/shape';

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
  /** The body on the page's grey, for content laid out as white cards (like the app's pages). */
  grouped?: boolean;
};

/**
 * Modal sheet with a title and close button (web: DetailSidepanelShell, which
 * on small screens is already a bottom sheet at 86% of the viewport height).
 * Every web side panel (refund, charge slip, activity details, deductions,
 * email report, filters…) opens in one of these on mobile.
 */
export function PanelSheet({ visible, onDismiss, title, children, footer, height, scroll = true, grouped = false }: PanelSheetProps) {
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

/** A bordered-bottom block inside a panel (web: `border-b border-muted px-6 py-6` sections). */
export function PanelSection({ children, last = false }: { children: ReactNode; last?: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.section,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.outlineVariant },
      ]}>
      {children}
    </View>
  );
}

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
  section: { padding: PANEL_PADDING, gap: 12 },
});
