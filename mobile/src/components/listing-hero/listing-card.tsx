import { type ReactNode, useState } from 'react';
import { ScrollView, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { Icon, IconButton, Menu, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { SearchField } from '@/components/search-field';
import { FiltersButton, type ListingFilter } from '@/components/shared/filters-sheet';
import type { ListingAction } from '@/components/shared/listing';
import { useAppColors } from '@/constants/app-colors';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { formatInr } from '@/data/common';

import { DateButton, type RangeScope } from './time-scope';

const CONTROL_HEIGHT = 36;
const PADDING = 12;

type Chip = { key: string; label: string; onRemove: () => void };

/** One removable chip per filter that's set (date filters aren't expected here: the hero owns the period). */
function appliedChips(filters: ListingFilter[]): Chip[] {
  return filters.flatMap((filter, index): Chip[] => {
    if (filter.type === 'select') {
      const fallback = filter.defaultValue ?? filter.options[0]?.value ?? '';
      if (filter.value === fallback) return [];
      const option = filter.options.find((item) => item.value === filter.value);
      return [{ key: `${index}`, label: `${filter.label}: ${option?.label ?? filter.value}`, onRemove: () => filter.onApply(fallback) }];
    }
    if (filter.type === 'more') {
      return filter.categories.flatMap((category) =>
        (filter.applied[category.id] ?? []).map((id) => ({
          key: `${index}-${category.id}-${id}`,
          label: category.options.find((option) => option.id === id)?.label ?? id,
          onRemove: () => filter.onApply({ ...filter.applied, [category.id]: (filter.applied[category.id] ?? []).filter((item) => item !== id) }),
        }))
      );
    }
    return [];
  });
}

function clearAll(filters: ListingFilter[]) {
  filters.forEach((filter) => {
    if (filter.type === 'select') filter.onApply(filter.defaultValue ?? filter.options[0]?.value ?? '');
    else if (filter.type === 'more') filter.onApply({});
  });
}

type ListingCardProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  /** Focuses the search whenever it changes (see SearchField). */
  focusSearch?: string;
  /** Which records: status, mode… (the period is the hero's). */
  filters: ListingFilter[];
  /** Page actions on the list (analytics, email, download…), in the ⋯ menu. */
  actions?: ListingAction[];
  /** Records and amount in the hero's period, and what the search and filters leave of them. */
  totals: { all: number; shown: number; amount: number };
  noun: { one: string; other: string };
  /**
   * The list's own date range, when it doesn't follow the hero (e.g.
   * Settlements: the Settled number stops at 7 days, the list goes further).
   * Shown as the date button first in the control row, so the list's dates are never a guess.
   */
  time?: RangeScope;
  /**
   * One-tap filters for what needs attention (e.g. "20 failed"), shown with
   * the applied filters while they'd still narrow the list. The page's
   * exceptions live here, by the records they're about, not in the hero.
   */
  suggestions?: { key: string; label: string; icon: string; color: string; onPress: () => void }[];
  /** Ends the narrowed summary's count when the list follows the hero's period, e.g. "today". */
  periodPhrase?: string;
  /** A note about the list, under the search (e.g. "Pick the payment to refund"). */
  notice?: ReactNode;
  /** e.g. pulling the card up over the hero's foot. */
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/**
 * The records under a page's hero (experiment, see constants/experiments.ts),
 * all in one card: search with Filters, the filters that are set as chips to
 * remove one by one, a line saying what's listed ("Showing 8 of 110 ·
 * ₹1,12,000" while filtered) with the list's actions behind ⋯, then the
 * day-grouped rows.
 */
export function ListingCard({
  search,
  onSearchChange,
  searchPlaceholder,
  focusSearch,
  filters,
  actions = [],
  totals,
  noun,
  suggestions = [],
  periodPhrase,
  time,
  notice,
  style,
  children,
}: ListingCardProps) {
  const theme = useTheme();
  const appColors = useAppColors();
  const [menuOpen, setMenuOpen] = useState(false);
  const chips = appliedChips(filters);
  const narrowed = chips.length > 0 || search.trim().length > 0;
  // Shown only once the list is narrowed: unfiltered, the hero (or the dates and day headers) already say it.
  const summary = `Showing ${totals.shown} of ${totals.all} ${totals.all === 1 ? noun.one : noun.other}${periodPhrase ? ` ${periodPhrase}` : ''} · ${formatInr(totals.amount).replace(/\.00$/, '')}`;

  return (
    // The shadow sits on a wrapper: iOS drops shadows on a view that clips its content.
    <View style={[styles.lift, style]}>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.toolbar}>
          <View style={styles.searchRow}>
            <View style={styles.flex}>
              <SearchField
                value={search}
                onChangeText={onSearchChange}
                placeholder={searchPlaceholder}
                radius={Shape.small}
                height={CONTROL_HEIGHT}
                focusRequest={focusSearch}
              />
            </View>
            {filters.length ? <FiltersButton filters={filters} height={CONTROL_HEIGHT} /> : null}
            {actions.length ? (
              <Menu
                visible={menuOpen}
                onDismiss={() => setMenuOpen(false)}
                anchorPosition="bottom"
                contentStyle={{ borderRadius: Shape.small, backgroundColor: theme.colors.surface }}
                anchor={
                  <IconButton
                    icon="dots-three-vertical"
                    size={16}
                    onPress={() => setMenuOpen(true)}
                    accessibilityLabel={`More: ${actions.map((action) => action.label).join(', ')}`}
                    style={[styles.more, { borderColor: theme.colors.outlineVariant }]}
                  />
                }>
                {actions.map((action) => (
                  <Menu.Item
                    key={action.label}
                    title={action.label}
                    leadingIcon={action.icon}
                    onPress={() => {
                      setMenuOpen(false);
                      action.onPress?.();
                    }}
                  />
                ))}
              </Menu>
            ) : null}
          </View>

          {notice}

          {/* One row of everything that shapes the list: its dates, what needs attention, the filters that are set. */}
          {time || chips.length || suggestions.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {time ? <DateButton scope={time} compact /> : null}
              {suggestions.map((suggestion) => (
                <TouchableRipple
                  key={suggestion.key}
                  onPress={suggestion.onPress}
                  borderless
                  accessibilityRole="button"
                  accessibilityLabel={`Show ${suggestion.label}`}
                  style={[styles.chip, styles.suggestion, { borderColor: theme.colors.outlineVariant }]}>
                  <View style={styles.chipContent}>
                    <Icon source={suggestion.icon} size={14} color={suggestion.color} />
                    <Text style={[styles.chipLabel, { color: theme.colors.onSurface }]}>{suggestion.label}</Text>
                  </View>
                </TouchableRipple>
              ))}
              {chips.map((chip) => (
                <TouchableRipple
                  key={chip.key}
                  onPress={chip.onRemove}
                  borderless
                  accessibilityRole="button"
                  accessibilityLabel={`Remove filter ${chip.label}`}
                  style={[styles.chip, { backgroundColor: appColors.highlight }]}>
                  <View style={styles.chipContent}>
                    <Text style={[styles.chipLabel, { color: theme.colors.onSurface }]}>{chip.label}</Text>
                    <Icon source="x" size={12} color={theme.colors.onSurface} />
                  </View>
                </TouchableRipple>
              ))}
              {chips.length ? (
                <TouchableRipple onPress={() => clearAll(filters)} borderless accessibilityRole="button" style={styles.chip}>
                  <View style={styles.chipContent}>
                    <Text style={[styles.chipLabel, { color: theme.colors.primary }]}>Clear all</Text>
                  </View>
                </TouchableRipple>
              ) : null}
            </ScrollView>
          ) : null}

          {/* Only once the list is narrowed: unfiltered, the hero (or the dates and day headers) already say it. */}
          {narrowed ? (
            <Text accessibilityLiveRegion="polite" style={[styles.summary, { color: theme.colors.onSurfaceVariant }]}>
              {summary}
            </Text>
          ) : null}
        </View>
        <View style={[styles.divider, { backgroundColor: theme.colors.surfaceVariant }]} />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // A soft lift, so its top edge shows where it rides over the hero's white.
  lift: {
    borderRadius: Shape.max,
    shadowColor: '#1d1d16',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -2 },
    elevation: 3,
  },
  card: { borderRadius: Shape.max, overflow: 'hidden' },
  toolbar: { padding: PADDING, gap: 10 },
  flex: { flex: 1 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chips: { gap: 6 },
  chip: { borderRadius: Shape.small },
  chipContent: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 32, paddingHorizontal: 10 },
  chipLabel: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16 },
  suggestion: { borderWidth: 1 },
  summary: { paddingBottom: 6, fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16, fontVariant: ['tabular-nums'] },
  // Same height and edge as Filters beside it.
  more: { margin: 0, width: CONTROL_HEIGHT, height: CONTROL_HEIGHT, borderRadius: Shape.small, borderWidth: 1 },
  divider: { height: 1 },
});
