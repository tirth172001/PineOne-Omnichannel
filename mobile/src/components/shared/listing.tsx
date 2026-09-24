import { Fragment, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Divider, Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { SearchField } from '@/components/search-field';
import { concentric, Shape } from '@/constants/shape';

type ListingToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  /** Filter controls (date, selects, More filters), scrolled horizontally. */
  filters?: ReactNode;
  /** Actions such as Email filtered / Download filtered. */
  actions?: ReactNode;
};

/**
 * Listing toolbar (web: ListingToolbar): search, the filter controls, and
 * actions. The web fits these on one row; on a phone search takes the full
 * width, filters scroll sideways under it, and actions wrap below.
 */
export function ListingToolbar({ search, onSearchChange, searchPlaceholder, filters, actions }: ListingToolbarProps) {
  return (
    <View style={styles.toolbar}>
      <SearchField value={search} onChangeText={onSearchChange} placeholder={searchPlaceholder} radius={Shape.small} />
      {filters ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroller} contentContainerStyle={styles.filters}>
          {filters}
        </ScrollView>
      ) : null}
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

/** Card holding a listing's rows (web: the bordered table wrapper). Rows are separated by dividers. */
export function ListCard({ children, empty }: { children: ReactNode[]; empty?: string }) {
  const theme = useTheme();
  const rows = children.filter(Boolean);
  return (
    <Card mode="outlined" style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
      {rows.length === 0 ? (
        <Text variant="bodyMedium" style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>
          {empty ?? 'No results found.'}
        </Text>
      ) : (
        rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 ? <Divider /> : null}
            {row}
          </Fragment>
        ))
      )}
    </Card>
  );
}

// Rows span the card's full width (gap 0), so they share its radius.
export const LIST_ROW_RADIUS = concentric(Shape.max, 0);
export const LIST_ROW_PADDING = 16;
/** Radius for pills/badges sitting inside a list row (12dp from its edge). */
export const LIST_ROW_INNER_RADIUS = concentric(LIST_ROW_RADIUS, 12, 24);

/**
 * One listing record (web: a table row). The web spreads a record over 6–8
 * columns; on a phone the same values stack into a title line, secondary
 * lines and a trailing column, with a chevron when the row opens a detail.
 */
export function ListRow({
  onPress,
  accessibilityLabel,
  children,
}: {
  onPress?: () => void;
  accessibilityLabel?: string;
  children: ReactNode;
}) {
  const theme = useTheme();
  return (
    <TouchableRipple
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      borderless
      style={styles.row}>
      <View style={styles.rowContent}>
        <View style={styles.rowBody}>{children}</View>
        {onPress ? <Icon source="caret-right" size={16} color={theme.colors.onSurfaceVariant} /> : null}
      </View>
    </TouchableRipple>
  );
}

/** Two-column line inside a ListRow: left content grows, right content hugs the end. */
export function ListRowLine({ left, right, centered = false }: { left: ReactNode; right?: ReactNode; /** Vertically centre both sides (single-line rows). */ centered?: boolean }) {
  return (
    <View style={[styles.line, centered && styles.lineCentered]}>
      <View style={styles.lineLeft}>{left}</View>
      {right ? <View style={styles.lineRight}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { gap: 12 },
  filterScroller: { marginHorizontal: -16 },
  filters: { gap: 8, paddingHorizontal: 16 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { borderRadius: Shape.max, overflow: 'hidden' },
  empty: { padding: 16 },
  row: { borderRadius: LIST_ROW_RADIUS },
  rowContent: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: LIST_ROW_PADDING, paddingVertical: 12 },
  rowBody: { flex: 1, gap: 4 },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  lineCentered: { alignItems: 'center' },
  lineLeft: { flex: 1, gap: 2 },
  lineRight: { alignItems: 'flex-end', gap: 2 },
});
