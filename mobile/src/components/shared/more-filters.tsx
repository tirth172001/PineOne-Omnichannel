import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Checkbox, Chip, RadioButton, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { SearchField } from '@/components/search-field';
import { Fonts } from '@/constants/theme';

import { OutlinedActionButton } from './controls';
import { PANEL_INNER_RADIUS, PANEL_PADDING, PanelSheet } from './panel-sheet';

export type MoreFilterOption = { id: string; label: string; description?: string };
export type MoreFilterCategory = {
  id: string;
  label: string;
  options: MoreFilterOption[];
  /** list: dense rows · card: bordered rows with description · badge: toggle chips. Default card. */
  display?: 'list' | 'card' | 'badge';
  /** Default multi. */
  selectionMode?: 'single' | 'multi';
  /** Default true. */
  searchable?: boolean;
};
export type MoreFilterSelection = Record<string, string[]>;

const toggleInList = (list: string[], id: string) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);

export function countSelection(selection: MoreFilterSelection) {
  return Object.values(selection).reduce((sum, ids) => sum + ids.length, 0);
}

/**
 * "More filters" button and sheet (web: useMoreFiltersPanel + MoreFiltersPanel).
 * The web lays categories out as a rail beside the options; on a phone the
 * categories become a scrolling chip row (with each one's selection count)
 * above the options. Same list / card / badge option styles, per-category
 * search, Select all, Clear filter and Apply.
 */
export function MoreFilters({
  categories,
  applied,
  onApply,
  title = 'More filters',
}: {
  categories: MoreFilterCategory[];
  applied: MoreFilterSelection;
  onApply: (selection: MoreFilterSelection) => void;
  title?: string;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<MoreFilterSelection>(applied);
  const [activeId, setActiveId] = useState(categories[0]?.id ?? '');
  const [searchById, setSearchById] = useState<Record<string, string>>({});
  const count = countSelection(applied);

  const category = categories.find((item) => item.id === activeId) ?? categories[0];
  const display = category?.display ?? 'card';
  const single = (category?.selectionMode ?? 'multi') === 'single';
  const search = searchById[category?.id ?? ''] ?? '';
  const selected = draft[category?.id ?? ''] ?? [];
  const query = search.trim().toLowerCase();
  const options = (category?.options ?? []).filter(
    (option) => !query || option.label.toLowerCase().includes(query) || option.description?.toLowerCase().includes(query)
  );
  const allVisibleSelected = options.length > 0 && options.every((option) => selected.includes(option.id));

  const setSelected = (next: string[]) => category && setDraft((current) => ({ ...current, [category.id]: next }));
  const toggle = (id: string) => setSelected(single ? (selected.includes(id) ? [] : [id]) : toggleInList(selected, id));

  const renderOption = (option: MoreFilterOption) => {
    const checked = selected.includes(option.id);
    const control = single ? (
      <RadioButton.Android value={option.id} status={checked ? 'checked' : 'unchecked'} />
    ) : (
      <Checkbox status={checked ? 'checked' : 'unchecked'} />
    );
    if (display === 'list') {
      return (
        <TouchableRipple
          key={option.id}
          onPress={() => toggle(option.id)}
          accessibilityRole={single ? 'radio' : 'checkbox'}
          aria-checked={checked}
          borderless
          style={styles.listRow}>
          <View style={styles.listRowContent}>
            <View pointerEvents="none">{control}</View>
            <Text variant="bodyMedium" style={styles.optionLabel}>
              {option.label}
            </Text>
          </View>
        </TouchableRipple>
      );
    }
    return (
      <TouchableRipple
        key={option.id}
        onPress={() => toggle(option.id)}
        accessibilityRole={single ? 'radio' : 'checkbox'}
        aria-checked={checked}
        borderless
        style={[styles.cardRow, { borderColor: checked ? theme.colors.primary : theme.colors.outlineVariant }]}>
        <View style={styles.cardRowContent}>
          <View style={styles.optionText}>
            <Text variant="bodyMedium" style={styles.optionLabel}>
              {option.label}
            </Text>
            {option.description ? (
              <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>
                {option.description}
              </Text>
            ) : null}
          </View>
          <View pointerEvents="none">{control}</View>
        </View>
      </TouchableRipple>
    );
  };

  return (
    <>
      <OutlinedActionButton
        label={title}
        icon="funnel-simple"
        count={count}
        active={count > 0}
        onPress={() => {
          setDraft(applied);
          setOpen(true);
        }}
      />
      <PanelSheet
        visible={open}
        onDismiss={() => setOpen(false)}
        title={title}
        scroll={false}
        footer={
          <View style={styles.footer}>
            <Button
              mode="text"
              onPress={() => {
                setDraft({});
                onApply({});
                setOpen(false);
              }}
              style={styles.footerButton}>
              Clear filter
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                onApply(draft);
                setOpen(false);
              }}
              style={styles.footerButton}>
              Apply
            </Button>
          </View>
        }>
        <View style={styles.body}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroller} contentContainerStyle={styles.categories}>
            {categories.map((item) => {
              const itemCount = draft[item.id]?.length ?? 0;
              return (
                <Chip
                  key={item.id}
                  selected={item.id === category?.id}
                  showSelectedOverlay
                  showSelectedCheck={false}
                  onPress={() => setActiveId(item.id)}
                  mode="outlined"
                  style={styles.categoryChip}>
                  {itemCount > 0 ? `${item.label} (${itemCount})` : item.label}
                </Chip>
              );
            })}
          </ScrollView>

          <View style={styles.categoryHeader}>
            <Text variant="titleMedium" style={styles.categoryTitle}>
              {category?.label}
            </Text>
            {!single && options.length > 0 ? (
              <Button
                mode="text"
                compact
                onPress={() =>
                  setSelected(
                    allVisibleSelected
                      ? selected.filter((id) => !options.some((option) => option.id === id))
                      : Array.from(new Set([...selected, ...options.map((option) => option.id)]))
                  )
                }
                style={styles.footerButton}>
                {allVisibleSelected ? 'Deselect all' : 'Select all'}
              </Button>
            ) : null}
          </View>

          {category?.searchable ?? true ? (
            <SearchField
              value={search}
              onChangeText={(value) => setSearchById((current) => ({ ...current, [category?.id ?? '']: value }))}
              placeholder={`Search ${category?.label.toLowerCase() ?? ''}`}
              radius={PANEL_INNER_RADIUS}
            />
          ) : null}

          <ScrollView style={styles.options} contentContainerStyle={styles.optionsContent}>
            {display === 'badge' ? (
              <View style={styles.badges}>
                {options.map((option) => (
                  <Chip
                    key={option.id}
                    selected={selected.includes(option.id)}
                    onPress={() => toggle(option.id)}
                    mode="outlined"
                    style={styles.categoryChip}>
                    {option.label}
                  </Chip>
                ))}
              </View>
            ) : (
              options.map(renderOption)
            )}
            {options.length === 0 ? (
              <View style={[styles.empty, { borderColor: theme.colors.outlineVariant }]}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  No results found.
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </PanelSheet>
    </>
  );
}

// Chips and option rows sit 16dp inside the sheet, so they share its inner radius.
const CHIP_RADIUS = PANEL_INNER_RADIUS;

const styles = StyleSheet.create({
  body: { flex: 1, padding: PANEL_PADDING, gap: 12 },
  // Keeps the chip row at its own height: in the sheet's flex column a horizontal ScrollView
  // otherwise grows (on web) and stretches the chips to fill half the sheet.
  categoryScroller: { flexGrow: 0, flexShrink: 0, marginHorizontal: -PANEL_PADDING },
  categories: { gap: 8, alignItems: 'center', paddingHorizontal: PANEL_PADDING },
  categoryChip: { borderRadius: CHIP_RADIUS },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoryTitle: { fontFamily: Fonts.semiBold },
  options: { flex: 1 },
  optionsContent: { gap: 8, paddingBottom: 8 },
  listRow: { borderRadius: PANEL_INNER_RADIUS },
  listRowContent: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardRow: { borderWidth: 1, borderRadius: PANEL_INNER_RADIUS },
  cardRowContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingLeft: 12, paddingVertical: 4 },
  optionText: { flex: 1, paddingVertical: 6 },
  optionLabel: { fontFamily: Fonts.medium },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderRadius: PANEL_INNER_RADIUS, padding: 16 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerButton: { borderRadius: PANEL_INNER_RADIUS },
});
