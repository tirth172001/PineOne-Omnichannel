import { Fragment, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Divider, Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { SearchField } from '@/components/search-field';
import { concentric, Shape } from '@/constants/shape';

import { OutlinedActionButton } from './controls';
import { FiltersButton, type ListingFilter } from './filters-sheet';

export { type ListingFilter, selectFilter } from './filters-sheet';

/** A page-level action on a listing (e.g. View analytics, Email filtered, Download filtered). */
export type ListingAction = { label: string; icon: string; onPress?: () => void };

type ListingToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  /** Every filter the listing has, combined under one Filters button beside the search. */
  filters?: ListingFilter[];
  /** Page-level actions, in a row under the search that scrolls sideways. */
  actions?: ListingAction[];
  /** Focuses the search whenever it changes (see SearchField). */
  focusSearch?: string;
};

const SEARCH_HEIGHT = 44;

/**
 * The listing's part of the page header (see page-header.tsx), right under
 * the large title: search with every filter combined under one Filters button
 * in the same row, then the page-level actions (analytics, email and
 * download…) in a row that scrolls sideways (user decision).
 */
export function ListingToolbar({ search, onSearchChange, searchPlaceholder, filters = [], actions = [], focusSearch }: ListingToolbarProps) {
  return (
    <View style={styles.toolbar}>
      <View style={styles.searchRow}>
        <View style={styles.flex}>
          <SearchField value={search} onChangeText={onSearchChange} placeholder={searchPlaceholder} radius={Shape.small} height={SEARCH_HEIGHT} focusRequest={focusSearch} />
        </View>
        {filters.length ? <FiltersButton filters={filters} height={SEARCH_HEIGHT} /> : null}
      </View>
      {actions.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionScroller} contentContainerStyle={styles.actions}>
          {actions.map((action) => (
            <OutlinedActionButton key={action.label} label={action.label} icon={action.icon} onPress={action.onPress} />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

/** Card holding a listing's rows (web: the bordered table wrapper). Rows are separated by dividers. */
export function ListCard({ children, empty }: { children: ReactNode[]; empty?: string }) {
  const theme = useTheme();
  const rows = children.filter(Boolean);
  return (
    <Card mode="contained" style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      {rows.length === 0 ? (
        <Text variant="bodyMedium" style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>
          {empty ?? 'No results found.'}
        </Text>
      ) : (
        // Wrapped: Paper's Card passes an `index` prop to each direct child, which Fragments reject.
        <View>
          {rows.map((row, index) => (
            <Fragment key={index}>
              {index > 0 ? <Divider /> : null}
              {row}
            </Fragment>
          ))}
        </View>
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
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex: { flex: 1 },
  // Runs edge to edge, starting in line with the page's content.
  actionScroller: { marginHorizontal: -16, flexGrow: 0 },
  actions: { gap: 8, paddingHorizontal: 16 },
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
