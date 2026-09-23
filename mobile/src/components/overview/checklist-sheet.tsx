import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Checkbox, Divider, Icon, IconButton, Portal, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { BottomSheet } from '@/components/material3/bottom-sheet';
import { SearchField } from '@/components/search-field';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';

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

const SHEET_PADDING = 16;
// Controls sit 16dp inside the sheet (Shape.max).
const INNER_RADIUS = concentric(Shape.max, SHEET_PADDING);

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
  height = 600,
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
    <Portal>
      <BottomSheet variant="modal" height={height} visible={visible} onDismiss={onDismiss}>
        <View style={styles.header}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {title}
          </Text>
          <IconButton
            icon="x"
            mode="outlined"
            size={16}
            onPress={onDismiss}
            accessibilityLabel="Close"
            style={[styles.close, { borderRadius: INNER_RADIUS, borderColor: theme.colors.outlineVariant }]}
          />
        </View>
        <Divider />

        <View style={styles.body}>
          <View style={styles.headingRow}>
            <Text variant="titleMedium" style={styles.heading}>
              {heading}
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
              filtered.map((item) => {
                const checked = draft.includes(item.id);
                return (
                  <TouchableRipple
                    key={item.id}
                    onPress={() => toggle(item.id)}
                    accessibilityRole="checkbox"
                    aria-checked={checked}
                    accessibilityLabel={item.subtitle ? `${item.title}, ${item.subtitle}` : item.title}
                    borderless
                    style={[styles.row, { borderColor: checked ? theme.colors.primary : theme.colors.outlineVariant }]}>
                    <View style={[styles.rowContent, item.subtitle ? styles.rowTop : null]}>
                      {item.icon ? <Icon source={item.icon} size={20} color={theme.colors.onSurfaceVariant} /> : null}
                      <View style={styles.rowText}>
                        <Text variant="bodyMedium">{item.title}</Text>
                        {item.subtitle ? (
                          <Text
                            variant="bodyMedium"
                            numberOfLines={1}
                            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                            {item.subtitle}
                          </Text>
                        ) : null}
                      </View>
                      <View pointerEvents="none">
                        <Checkbox status={checked ? 'checked' : 'unchecked'} />
                      </View>
                    </View>
                  </TouchableRipple>
                );
              })
            )}
          </ScrollView>
        </View>
        <Divider />

        <View style={styles.footer}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {countLabel(draft.length)}
          </Text>
          <Button
            mode="contained"
            onPress={() => {
              onApply(draft);
              onDismiss();
            }}
            style={{ borderRadius: INNER_RADIUS }}>
            Apply
          </Button>
        </View>
      </BottomSheet>
    </Portal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SHEET_PADDING,
    paddingBottom: 12,
  },
  close: { margin: 0 },
  body: { flex: 1, padding: SHEET_PADDING, gap: 16 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  heading: { fontFamily: Fonts.semiBold, flexShrink: 1 },
  textButton: { margin: 0, borderRadius: INNER_RADIUS },
  textButtonLabel: { fontSize: 12, marginVertical: 4, marginHorizontal: 6 },
  list: { flex: 1 },
  listContent: { gap: 8 },
  empty: { textAlign: 'center', paddingVertical: 32 },
  row: { borderWidth: 1, borderRadius: INNER_RADIUS },
  rowContent: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10 },
  rowTop: { alignItems: 'flex-start' },
  rowText: { flex: 1 },
  subtitle: { fontFamily: Fonts.regular },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: SHEET_PADDING,
  },
});
