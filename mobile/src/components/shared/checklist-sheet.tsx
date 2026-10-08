import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

import { SearchField } from '@/components/search-field';
import { Fonts } from '@/constants/theme';

import { PANEL_INNER_RADIUS, PANEL_PADDING, PanelSheet, SHEET_BUTTON, SheetRow, SheetSection } from './panel-sheet';

export type ChecklistItem = { id: string; title: string; subtitle?: string; icon?: string };

type ChecklistSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  /** Small muted title in the sheet header, e.g. "Change stores". */
  title: string;
  /** Bold prompt above the list, e.g. "Choose stores to view details". */
  heading: string;
  items: ChecklistItem[];
  /** Ids checked when the sheet opens. */
  initialSelected: string[];
  onApply: (selected: string[]) => void;
  /** Footer summary for the current selection count, e.g. "3 stores selected". */
  countLabel: (count: number) => string;
  /** Shows a search field filtering by title and subtitle. */
  searchPlaceholder?: string;
  height?: number;
};

const SHEET_PADDING = PANEL_PADDING;
const INNER_RADIUS = PANEL_INNER_RADIUS;

/**
 * Multi-select sheet: header with close, a heading with Select all / Clear
 * all, optional search, bordered checkbox rows, and a footer with the count
 * and Apply. Mobile version of the web Overview's "Change stores" and
 * "Customise" dialogs, which share this layout. Changes apply only on Apply.
 */
export function ChecklistSheet({
  visible,
  onDismiss,
  title,
  heading,
  items,
  initialSelected,
  onApply,
  countLabel,
  searchPlaceholder,
  height,
}: ChecklistSheetProps) {
  const theme = useTheme();
  const [draft, setDraft] = useState<string[]>(initialSelected);
  const [search, setSearch] = useState('');
  // Re-seed the draft each time the sheet opens (adjusting state during render).
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setDraft(initialSelected);
      setSearch('');
    }
  }

  const query = search.trim().toLowerCase();
  const filtered = query
    ? items.filter((item) => `${item.title} ${item.subtitle ?? ''}`.toLowerCase().includes(query))
    : items;
  const allSelected = draft.length === items.length && items.length > 0;
  const toggle = (id: string) =>
    setDraft((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));

  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title={title}
      height={height}
      scroll={false}
      footer={
        <View style={styles.footerRow}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {countLabel(draft.length)}
          </Text>
          <Button
            mode="contained"
            onPress={() => {
              onApply(draft);
              onDismiss();
            }}
            {...SHEET_BUTTON}>
            Apply
          </Button>
        </View>
      }>
      <View style={styles.body}>
        <View style={styles.headingRow}>
          <Text accessibilityRole="header" style={[styles.heading, { color: theme.colors.onSurfaceVariant }]}>
            {heading.toUpperCase()}
          </Text>
          <Button
            mode="text"
            compact
            onPress={() => setDraft(allSelected ? [] : items.map((item) => item.id))}
            labelStyle={styles.textButtonLabel}
            style={styles.textButton}>
            {allSelected ? 'Clear all' : 'Select all'}
          </Button>
        </View>
        {searchPlaceholder ? (
          <SearchField value={search} onChangeText={setSearch} placeholder={searchPlaceholder} radius={INNER_RADIUS} />
        ) : null}
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {filtered.length === 0 ? (
            <Text variant="bodyMedium" style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>
              No matches for “{search}”.
            </Text>
          ) : (
            <SheetSection>
              {filtered.map((item, index) => (
                <SheetRow
                  key={item.id}
                  first={index === 0}
                  icon={item.icon}
                  title={item.title}
                  description={item.subtitle}
                  role="checkbox"
                  selected={draft.includes(item.id)}
                  onPress={() => toggle(item.id)}
                />
              ))}
            </SheetSection>
          )}
        </ScrollView>
      </View>
    </PanelSheet>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: SHEET_PADDING, gap: 16 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  // The uppercase label over a sheet's card, as in the channel switcher.
  heading: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.6, paddingHorizontal: 4, flexShrink: 1 },
  textButton: { margin: 0, borderRadius: INNER_RADIUS },
  textButtonLabel: { fontSize: 12, marginVertical: 4, marginHorizontal: 6 },
  list: { flex: 1 },
  listContent: { paddingBottom: 8 },
  empty: { textAlign: 'center', paddingVertical: 32 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
});
