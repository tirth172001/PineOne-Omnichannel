import type { ReactNode } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { Button, Divider, Icon, Text, useTheme } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';

/**
 * Building blocks for the Overview detail cards: the same anatomy as the web
 * app's components/home/overview-detail-cards.tsx (header row, divided body
 * sections, right-aligned footer link), rendered with Paper components.
 */

const CARD_PADDING = 16;
const FOOTER_PADDING_Y = 12;

/**
 * The card surface: borderless white on the grey page, like the app's other
 * cards (user decision). A plain View rather than Paper's Card: on iOS a
 * Card's content doesn't stretch with it (so a section can't grow to fill a
 * card that matches its neighbour's height), and Card passes an `index` prop
 * to its children, which Fragments reject.
 */
export function OverviewCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return <View style={[styles.card, { backgroundColor: theme.colors.surface }, style]}>{children}</View>;
}

/** Icon + uppercase muted title on the left; a range label or toggle on the right. Wraps on narrow screens. */
export function OverviewCardHeader({ title, icon, right }: { title: string; icon?: string; right?: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.header}>
      <View style={styles.headerTitle}>
        {icon ? <Icon source={icon} size={16} color={theme.colors.onSurfaceVariant} /> : null}
        <Text variant="labelLarge" style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>
          {title.toUpperCase()}
        </Text>
      </View>
      {right}
    </View>
  );
}

/** Muted range label for a header's right side, e.g. "Today". */
export function OverviewCardRangeLabel({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
      {label}
    </Text>
  );
}

export function OverviewCardDivider() {
  return <Divider />;
}

/** Right-aligned text link with a trailing caret, e.g. "View payment history ›". */
export function OverviewCardFooter({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <View style={styles.footer}>
      <Button
        mode="text"
        compact
        icon="caret-right"
        onPress={onPress}
        contentStyle={styles.footerButtonContent}
        labelStyle={styles.footerButtonLabel}
        style={styles.footerButton}>
        {label}
      </Button>
    </View>
  );
}

// Nested shapes inside the card (Shape.max): the footer button sits 12dp from
// the card's bottom edge.
const FOOTER_BUTTON_RADIUS = concentric(Shape.max, FOOTER_PADDING_Y, 28);

const styles = StyleSheet.create({
  card: { borderRadius: Shape.max, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: CARD_PADDING,
  },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { letterSpacing: 0.6 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: CARD_PADDING,
    paddingVertical: FOOTER_PADDING_Y,
  },
  footerButton: { borderRadius: FOOTER_BUTTON_RADIUS, margin: 0 },
  // Caret after the label, as on web.
  footerButtonContent: { flexDirection: 'row-reverse', height: 28 },
  footerButtonLabel: { fontSize: 12, lineHeight: 16, marginVertical: 0, marginHorizontal: 8 },
});

export const OVERVIEW_CARD_PADDING = CARD_PADDING;
