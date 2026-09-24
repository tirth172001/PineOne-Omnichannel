import { Fragment, type ReactNode, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Divider, Icon, IconButton, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { SearchField } from '@/components/search-field';
import { concentric, Shape } from '@/constants/shape';

import { Floating } from './floating-layer';

/** An export-style action on a listing (Email filtered, Download filtered), shown as an icon in the floating bar. */
export type ListingAction = { label: string; icon: string; onPress?: () => void };

type ListingToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  /** Filter controls (date, selects, More filters), scrolled horizontally. */
  filters?: ReactNode;
  /** Email / download actions: they float with search above the navigation bar or pinned footer. */
  floatingActions?: ListingAction[];
  /** Other page actions that stay at the top (e.g. View analytics). */
  actions?: ReactNode;
};

/**
 * Listing toolbar (web: ListingToolbar). The filters scroll sideways at the
 * top of the list (with any other page actions below them). Search and the
 * email / download actions float as a small bar just above the navigation
 * bar, or above the pinned footer on inner pages (user decision).
 */
export function ListingToolbar({ search, onSearchChange, searchPlaceholder, filters, floatingActions = [], actions }: ListingToolbarProps) {
  return (
    <>
      {filters || actions ? (
        <View style={styles.toolbar}>
          {filters ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroller} contentContainerStyle={styles.filters}>
              {filters}
            </ScrollView>
          ) : null}
          {actions ? <View style={styles.actions}>{actions}</View> : null}
        </View>
      ) : null}
      <Floating>
        <FloatingListingBar search={search} onSearchChange={onSearchChange} searchPlaceholder={searchPlaceholder} actions={floatingActions} />
      </Floating>
    </>
  );
}

const BAR_PADDING = 4;
const BAR_INNER_RADIUS = concentric(Shape.max, BAR_PADDING, 40);

/**
 * The floating listing bar: a search button and the export actions as icons.
 * Search expands the bar into a full-width search field with a close button
 * (closing clears the search). While a search is applied, its button stays
 * highlighted.
 */
export function FloatingListingBar({
  search,
  onSearchChange,
  searchPlaceholder,
  actions,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  actions: ListingAction[];
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const barStyle = [styles.bar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }];

  if (open) {
    return (
      <View style={[barStyle, styles.barOpen]}>
        <View style={styles.flex}>
          <SearchField value={search} onChangeText={onSearchChange} placeholder={searchPlaceholder} radius={BAR_INNER_RADIUS} autoFocus />
        </View>
        <IconButton
          icon="x"
          size={18}
          onPress={() => {
            setOpen(false);
            onSearchChange('');
          }}
          accessibilityLabel="Close search"
          style={styles.barButton}
        />
      </View>
    );
  }

  const searching = search.trim().length > 0;
  return (
    <View style={styles.barAnchor} pointerEvents="box-none">
      <View style={barStyle}>
        <IconButton
          icon="magnifying-glass"
          size={20}
          mode={searching ? 'contained' : undefined}
          containerColor={searching ? theme.colors.secondaryContainer : undefined}
          iconColor={theme.colors.onSurface}
          onPress={() => setOpen(true)}
          accessibilityLabel={searching ? `${searchPlaceholder}, searching "${search.trim()}"` : searchPlaceholder}
          style={styles.barButton}
        />
        {actions.map((action) => (
          <IconButton
            key={action.label}
            icon={action.icon}
            size={20}
            iconColor={theme.colors.onSurface}
            onPress={action.onPress}
            accessibilityLabel={action.label}
            style={styles.barButton}
          />
        ))}
      </View>
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
  filterScroller: { marginHorizontal: -16 },
  filters: { gap: 8, paddingHorizontal: 16 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  flex: { flex: 1 },
  // Floating bar: right-aligned, hugging its icons; full width while searching.
  barAnchor: { alignItems: 'flex-end' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: BAR_PADDING,
    borderWidth: 1,
    borderRadius: Shape.max,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
  },
  barOpen: { alignSelf: 'stretch' },
  barButton: { margin: 0, borderRadius: BAR_INNER_RADIUS },
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
