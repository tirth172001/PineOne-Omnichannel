import { type ReactNode, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, Text } from 'react-native-paper';

import { Fonts } from '@/constants/theme';

import { OutlinedActionButton } from './controls';
import { DateRangeFields, type DateRangePreset, type DateRangeValue, makeDateRangeValue } from './date-range-filter';
import { countSelection, type MoreFilterCategory, type MoreFilterSelection } from './more-filters';
import { PANEL_INNER_RADIUS, PanelSection, PanelSheet } from './panel-sheet';

/**
 * One of a listing's filters, all of which sit behind its single Filters
 * button (user decision). The page keeps owning each value; the sheet edits
 * drafts of them and applies them together.
 */
export type ListingFilter =
  | {
      type: 'date';
      /** Section title; defaults to "Date range". */
      label?: string;
      presets: DateRangePreset[];
      value: DateRangeValue;
      onApply(value: DateRangeValue): void;
      /** Restored by "Clear all". */
      initialPresetId: string;
    }
  | {
      type: 'select';
      label: string;
      options: readonly { value: string; label: string }[];
      value: string;
      onApply(value: string): void;
      /** Restored by "Clear all"; defaults to the first option. */
      defaultValue?: string;
    }
  | {
      /** A group of categories (web: More filters), each shown as its own section. */
      type: 'more';
      categories: MoreFilterCategory[];
      applied: MoreFilterSelection;
      onApply(selection: MoreFilterSelection): void;
    };

type Draft = DateRangeValue | string | MoreFilterSelection;

/**
 * A select filter (e.g. Status), typed by its own options: the page's setter
 * receives only values from them.
 */
export function selectFilter<T extends string>(filter: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onApply: (value: T) => void;
  defaultValue?: T;
}): ListingFilter {
  return { type: 'select', ...filter, onApply: (value) => filter.onApply(value as T) };
}

const valueOf = (filter: ListingFilter): Draft =>
  filter.type === 'date' ? filter.value : filter.type === 'select' ? filter.value : filter.applied;

const defaultOf = (filter: ListingFilter): Draft =>
  filter.type === 'date'
    ? makeDateRangeValue(filter.presets, filter.initialPresetId)
    : filter.type === 'select'
      ? (filter.defaultValue ?? filter.options[0]?.value ?? '')
      : {};

/** How many filters differ from their defaults: shown on the Filters button. */
function activeCount(filters: ListingFilter[]) {
  return filters.reduce((sum, filter) => {
    if (filter.type === 'date') return sum + (filter.value.presetId === filter.initialPresetId ? 0 : 1);
    if (filter.type === 'select') return sum + (filter.value === defaultOf(filter) ? 0 : 1);
    return sum + countSelection(filter.applied);
  }, 0);
}

const toggleInList = (list: string[], id: string) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);

/**
 * The listing's Filters button and sheet: every filter the page has (date
 * range, selects such as Status, and More filters' categories) as sections of
 * choice chips, applied together. The button counts the filters that are set.
 */
export function FiltersButton({ filters, height }: { filters: ListingFilter[]; height?: number }) {
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>(() => filters.map(valueOf));
  const count = activeCount(filters);
  const setDraft = (index: number, draft: Draft) => setDrafts((current) => current.map((item, i) => (i === index ? draft : item)));

  const apply = (next: Draft[]) => {
    filters.forEach((filter, index) => {
      const draft = next[index];
      if (filter.type === 'date') filter.onApply(draft as DateRangeValue);
      else if (filter.type === 'select') filter.onApply(draft as string);
      else filter.onApply(draft as MoreFilterSelection);
    });
    setOpen(false);
  };

  const sections = filters.flatMap((filter, index) => {
    // The page's filters can change while the sheet is closed (e.g. Payments switching channel).
    const draft = drafts[index] ?? valueOf(filter);
    if (filter.type === 'date') {
      const value = draft as DateRangeValue;
      return [
        <FilterSection key={`date-${index}`} title={filter.label ?? 'Date range'}>
          <ChipRow>
            {filter.presets.map((preset) => (
              <Choice
                key={preset.id}
                label={preset.label}
                selected={value.presetId === preset.id}
                onPress={() => setDraft(index, { ...value, presetId: preset.id, range: preset.getRange?.() ?? value.range })}
              />
            ))}
          </ChipRow>
          {value.presetId === 'custom' ? <DateRangeFields value={value} onChange={(next) => setDraft(index, next)} /> : null}
        </FilterSection>,
      ];
    }
    if (filter.type === 'select') {
      const fallback = defaultOf(filter);
      return [
        <FilterSection key={`select-${index}`} title={filter.label}>
          <ChipRow>
            {filter.options.map((option) => (
              <Choice
                key={option.value}
                // The default option is labelled for the old dropdown (e.g. "Status", "All modes"); here it's just "All".
                label={option.value === 'all' ? 'All' : option.label}
                selected={draft === option.value}
                onPress={() => setDraft(index, option.value === draft ? fallback : option.value)}
              />
            ))}
          </ChipRow>
        </FilterSection>,
      ];
    }
    const selection = draft as MoreFilterSelection;
    return filter.categories.map((category) => {
      const selected = selection[category.id] ?? [];
      const single = (category.selectionMode ?? 'multi') === 'single';
      return (
        <FilterSection key={`more-${index}-${category.id}`} title={category.label}>
          <ChipRow>
            {category.options.map((option) => (
              <Choice
                key={option.id}
                label={option.label}
                selected={selected.includes(option.id)}
                onPress={() =>
                  setDraft(index, {
                    ...selection,
                    [category.id]: single ? (selected.includes(option.id) ? [] : [option.id]) : toggleInList(selected, option.id),
                  })
                }
              />
            ))}
          </ChipRow>
        </FilterSection>
      );
    });
  });

  return (
    <>
      <OutlinedActionButton
        label="Filters"
        icon="funnel-simple"
        count={count}
        active={count > 0}
        height={height}
        onPress={() => {
          setDrafts(filters.map(valueOf));
          setOpen(true);
        }}
        accessibilityLabel={count ? `Filters, ${count} applied` : 'Filters'}
      />
      <PanelSheet
        visible={open}
        onDismiss={() => setOpen(false)}
        title="Filters"
        footer={
          <View style={styles.footer}>
            <Button mode="text" onPress={() => apply(filters.map(defaultOf))} style={styles.footerButton}>
              Clear all
            </Button>
            <Button mode="contained" onPress={() => apply(drafts)} style={styles.footerButton}>
              Apply
            </Button>
          </View>
        }>
        {sections.map((section, index) => (
          <PanelSection key={section.key} last={index === sections.length - 1}>
            {section}
          </PanelSection>
        ))}
      </PanelSheet>
    </>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function ChipRow({ children }: { children: ReactNode }) {
  return <View style={styles.chips}>{children}</View>;
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Chip
      mode="outlined"
      selected={selected}
      showSelectedOverlay
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      style={styles.chip}>
      {label}
    </Chip>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  sectionTitle: { fontFamily: Fonts.semiBold },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  // Chips sit 16dp inside the sheet, so they share its inner radius.
  chip: { borderRadius: PANEL_INNER_RADIUS },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerButton: { borderRadius: PANEL_INNER_RADIUS },
});
