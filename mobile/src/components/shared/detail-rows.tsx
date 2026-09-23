import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';

import { Fonts } from '@/constants/theme';

import { CopyableValue } from './copyable-value';

export type DetailRowData = { label: string; value: string; copyable?: boolean };

/**
 * A label/value pair (web: DetailField). The web stacks label over value in a
 * 1–3 column grid; on a phone each pair is one row, label left and value right,
 * which keeps long detail lists compact.
 */
export function DetailRow({ label, value, children }: { label: string; value?: string; children?: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
        {label}
      </Text>
      <View style={styles.value}>
        {children ?? (
          <Text variant="bodyMedium" style={styles.valueText}>
            {value}
          </Text>
        )}
      </View>
    </View>
  );
}

/** A titled group of label/value rows (web: DetailSection). */
export function DetailSection({ title, rows }: { title: string; rows: DetailRowData[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.rows}>
        {rows.map((row, index) => (
          <DetailRow key={`${row.label}-${index}`} label={row.label}>
            {row.copyable ? (
              <CopyableValue value={row.value} />
            ) : (
              <Text variant="bodyMedium" style={styles.valueText}>
                {row.value}
              </Text>
            )}
          </DetailRow>
        ))}
      </View>
    </View>
  );
}

/** Sections separated by dividers, as the web separates them with h-px rules. */
export function DetailSections({ sections }: { sections: { title: string; rows: DetailRowData[] }[] }) {
  return (
    <View style={styles.sections}>
      {sections.map((section, index) => (
        <View key={section.title} style={styles.sections}>
          {index > 0 ? <Divider /> : null}
          <DetailSection title={section.title} rows={section.rows} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sections: { gap: 20 },
  section: { gap: 12 },
  // Web: text-xl font-medium.
  title: { fontFamily: Fonts.medium, fontSize: 20, lineHeight: 24 },
  rows: { gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 },
  label: { fontFamily: Fonts.regular, flexShrink: 1 },
  value: { flexShrink: 1, alignItems: 'flex-end' },
  valueText: { fontFamily: Fonts.regular, textAlign: 'right' },
});
