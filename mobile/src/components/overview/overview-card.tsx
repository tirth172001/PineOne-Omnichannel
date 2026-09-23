import color from 'color';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { Button, Card, Divider, Icon, Menu, SegmentedButtons, Text, useTheme } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import type { StatusTone } from '@/data/overview';

/**
 * Building blocks for the Overview detail cards: the same anatomy as the web
 * app's components/home/overview-detail-cards.tsx (header row, divided body
 * sections, right-aligned footer link), rendered with Paper components.
 */

const CARD_PADDING = 16;
const FOOTER_PADDING_Y = 12;

export function OverviewCard({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <Card
      mode="outlined"
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
      {children}
    </Card>
  );
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

/**
 * Dims the trailing ".XX" of a formatted amount: the whole rupees read as the
 * real number and the paise fade out (web: DimmedDecimalAmount).
 */
export function DimmedDecimalAmount({ value, size = 'large' }: { value: string; size?: 'large' | 'inline' }) {
  const theme = useTheme();
  const dot = value.lastIndexOf('.');
  const main = dot === -1 ? value : value.slice(0, dot);
  const decimals = dot === -1 ? '' : value.slice(dot);
  const large = size === 'large';

  return (
    <Text style={[large ? styles.amountLarge : styles.amountInline, { color: theme.colors.onSurface }]}>
      {main}
      {decimals ? (
        <Text style={[styles.decimals, { color: color(theme.colors.onSurfaceVariant).alpha(0.5).rgb().string() }]}>
          {decimals}
        </Text>
      ) : null}
    </Text>
  );
}

// Same tone colors as the web's StatusPill (Tailwind amber/emerald/sky/red 600).
const STATUS_TONE: Record<StatusTone, { icon: string; color: string }> = {
  processing: { icon: 'clock', color: '#d97706' },
  success: { icon: 'check-circle', color: '#059669' },
  initiated: { icon: 'record', color: '#0284c7' },
  failed: { icon: 'x-circle', color: '#dc2626' },
};

const PILL_HEIGHT = 24;

/** Outlined label without a status icon, e.g. the greeting's role badge (web: Badge variant="outline"). */
export function OutlineTag({ label, radius = Shape.small }: { label: string; radius?: number }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.pill,
        styles.tag,
        { borderRadius: Math.min(radius, PILL_HEIGHT / 2), borderColor: theme.colors.outlineVariant },
      ]}>
      <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
        {label}
      </Text>
    </View>
  );
}

/**
 * Compact M3 segmented buttons for in-card toggles (settlement source,
 * By count / By amount). Paper derives a segment's border and press-ripple
 * radius from 5 × theme.roundness and squares the corners between segments, so
 * both are overridden: a per-component theme sets the radius, and explicit
 * per-corner styles round the inner corners too.
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
  /** concentric() of the container the toggle sits in. */
  radius: number;
  /** Take the full row when wrapped under a card title on a phone. */
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
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchorPosition="bottom"
      contentStyle={{ borderRadius: Shape.small, backgroundColor: theme.colors.surface }}
      anchor={
        <Button
          mode="outlined"
          compact
          icon={icon ?? 'caret-down'}
          onPress={() => setOpen(true)}
          accessibilityLabel={`${accessibilityLabel}: ${selected?.label ?? ''}`}
          contentStyle={icon ? undefined : styles.trailingIconContent}
          labelStyle={styles.filterLabel}
          textColor={theme.colors.onSurface}
          style={[styles.filterButton, { borderColor: theme.colors.outlineVariant }]}>
          {selected?.label}
        </Button>
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

/** Outlined action button in a section header, e.g. "Customize" or "View all ›". */
export function SectionActionButton({
  label,
  icon,
  trailingIcon = false,
  onPress,
}: {
  label: string;
  icon: string;
  trailingIcon?: boolean;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <Button
      mode="outlined"
      compact
      icon={icon}
      onPress={onPress}
      contentStyle={trailingIcon ? styles.trailingIconContent : undefined}
      labelStyle={styles.filterLabel}
      textColor={theme.colors.onSurface}
      style={[styles.filterButton, { borderColor: theme.colors.outlineVariant }]}>
      {label}
    </Button>
  );
}

/** Outlined status label with a tone icon (web: StatusPill). */
export function StatusPill({ label, tone, radius }: { label: string; tone: StatusTone; radius: number }) {
  const theme = useTheme();
  const { icon, color: toneColor } = STATUS_TONE[tone];
  return (
    <View
      style={[
        styles.pill,
        { borderRadius: Math.min(radius, PILL_HEIGHT / 2), borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface },
      ]}>
      <Icon source={icon} size={12} color={toneColor} />
      <Text variant="labelMedium" style={{ fontFamily: Fonts.regular, color: theme.colors.onSurface }}>
        {label}
      </Text>
    </View>
  );
}

// Nested shapes inside the card (Shape.max): the footer button sits 12dp from
// the card's bottom edge.
const FOOTER_BUTTON_RADIUS = concentric(Shape.max, FOOTER_PADDING_Y, 28);

const styles = StyleSheet.create({
  card: { borderRadius: Shape.max },
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
  amountLarge: { fontFamily: Fonts.semiBold, fontSize: 24, lineHeight: 28, fontVariant: ['tabular-nums'] },
  amountInline: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20, fontVariant: ['tabular-nums'] },
  // Same 14px size in both variants; the weight is inherited from the parent Text.
  decimals: { fontSize: 14 },
  tag: { paddingRight: 8 },
  segmentsGrow: { flexGrow: 1, flexBasis: 240 },
  segmentLabel: { fontSize: 12 },
  // Standalone page-level controls (not nested in a container).
  filterButton: { borderRadius: Shape.small, margin: 0 },
  filterLabel: { fontSize: 12, marginVertical: 6 },
  trailingIconContent: { flexDirection: 'row-reverse' },
  pill: {
    height: PILL_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 8,
    paddingRight: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

export const OVERVIEW_CARD_PADDING = CARD_PADDING;
