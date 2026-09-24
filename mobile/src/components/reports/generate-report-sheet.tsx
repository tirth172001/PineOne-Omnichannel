import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Checkbox, Divider, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { SearchField } from '@/components/search-field';
import type { DateRange } from '@/components/shared/date-range-filter';
import { CollapsibleSection, DateRangeField, FormField, FormTextInput, SelectField } from '@/components/shared/form-fields';
import { PANEL_INNER_RADIUS, PanelSection, PanelSheet } from '@/components/shared/panel-sheet';
import { OutlineTag } from '@/components/shared/status';
import { DEFAULT_REPORT_COLUMNS, REPORT_COLUMNS, REPORT_FILTER_FIELDS, type ReportKind } from '@/data/reports';

type GenerateReportSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  kind: ReportKind;
  /** Card title; the sheet's title and the default report name. */
  title: string;
  /** Called with the report name once Generate report is pressed (web: the success toast). */
  onGenerated: (reportName: string) => void;
};

/**
 * Generate-report panel (web: TransactionReportPanel / SettlementReportPanel).
 * Every report asks for "Save report as" and a date range; transaction reports
 * also get the Select filters and Select report columns sections.
 */
export function GenerateReportSheet({ visible, onDismiss, kind, title, onGenerated }: GenerateReportSheetProps) {
  const theme = useTheme();
  const [reportName, setReportName] = useState(title);
  const [dateRange, setDateRange] = useState<DateRange>();
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [columnSearch, setColumnSearch] = useState('');
  const [columns, setColumns] = useState(DEFAULT_REPORT_COLUMNS);

  // Like the web, re-seed the name with the chosen report's title each time the panel opens.
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const openKey = visible ? `${kind}:${title}` : null;
  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) setReportName(title);
  }

  const query = columnSearch.trim().toLowerCase();
  const visibleColumns = REPORT_COLUMNS.filter((column) => column.toLowerCase().includes(query));
  const allSelected = columns.length === REPORT_COLUMNS.length;
  const toggleColumn = (column: string) =>
    setColumns((current) => (current.includes(column) ? current.filter((item) => item !== column) : [...current, column]));

  const generate = () => {
    onDismiss();
    onGenerated(reportName || title);
  };

  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title={title}
      footer={
        <Button mode="contained" onPress={generate} disabled={!reportName.trim()} style={styles.button}>
          Generate report
        </Button>
      }>
      <PanelSection last={kind !== 'transaction'}>
        <FormField label="Save report as">
          <FormTextInput value={reportName} onChangeText={setReportName} accessibilityLabel="Save report as" />
        </FormField>
        <FormField label="Select date range for report">
          <DateRangeField value={dateRange} onChange={setDateRange} />
        </FormField>
      </PanelSection>

      {kind === 'transaction' ? (
        <>
          <PanelSection>
            <CollapsibleSection title="Select filters">
              {REPORT_FILTER_FIELDS.map((field) => {
                const noun = field.label.replace(/^Select /, '').toLowerCase();
                return (
                  <View key={field.id} style={styles.filterField}>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      {field.label}
                    </Text>
                    <SelectField
                      value={filterValues[field.id] ?? 'all'}
                      onValueChange={(value) => setFilterValues((current) => ({ ...current, [field.id]: value }))}
                      options={[{ value: 'all', label: `All ${noun}` }, ...field.options.map((option) => ({ value: option, label: option }))]}
                      accessibilityLabel={field.label}
                    />
                  </View>
                );
              })}
            </CollapsibleSection>
          </PanelSection>

          <PanelSection last>
            <CollapsibleSection title="Select report columns" badge={<OutlineTag label={`${columns.length} columns`} radius={PANEL_INNER_RADIUS} />}>
              <View style={styles.columnSearchRow}>
                <View style={styles.flex}>
                  <SearchField value={columnSearch} onChangeText={setColumnSearch} placeholder="Search column" radius={PANEL_INNER_RADIUS} />
                </View>
                <Button mode="text" compact onPress={() => setColumns(allSelected ? [] : REPORT_COLUMNS)} style={styles.button}>
                  {allSelected ? 'Clear all' : 'Select all'}
                </Button>
              </View>
              <View style={[styles.columnList, { borderColor: theme.colors.outlineVariant }]}>
                {visibleColumns.length === 0 ? (
                  <Text variant="bodyMedium" style={[styles.columnEmpty, { color: theme.colors.onSurfaceVariant }]}>
                    No columns match your search.
                  </Text>
                ) : (
                  visibleColumns.map((column, index) => {
                    const checked = columns.includes(column);
                    return (
                      <View key={column}>
                        {index > 0 ? <Divider /> : null}
                        <TouchableRipple
                          onPress={() => toggleColumn(column)}
                          accessibilityRole="checkbox"
                          aria-checked={checked}
                          accessibilityState={{ checked }}
                          accessibilityLabel={column}>
                          <View style={styles.columnRow}>
                            <Text variant="bodyMedium" numberOfLines={1} style={styles.flex}>
                              {column}
                            </Text>
                            <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={() => toggleColumn(column)} />
                          </View>
                        </TouchableRipple>
                      </View>
                    );
                  })
                )}
              </View>
            </CollapsibleSection>
          </PanelSection>
        </>
      ) : null}
    </PanelSheet>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: PANEL_INNER_RADIUS },
  filterField: { gap: 8 },
  columnSearchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex: { flex: 1 },
  // Clips the rows to the list's corners.
  columnList: { borderWidth: 1, borderRadius: PANEL_INNER_RADIUS, overflow: 'hidden' },
  columnRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingLeft: 12, paddingRight: 4 },
  columnEmpty: { paddingHorizontal: 12, paddingVertical: 16 },
});
